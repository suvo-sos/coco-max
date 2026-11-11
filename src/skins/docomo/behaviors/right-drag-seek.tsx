/** @jsxImportSource react */

import { useEffect } from 'react';

/**
 * Right-click drag to seek: hold the right mouse button anywhere
 * on the player and drag left to go back, right to go forward.
 * Dragging across the full width of the player covers the whole
 * video. While scrubbing, `data-hop-scrubbing` is set on the skin
 * so the idle-hide loop keeps the bottom bar (and the time) visible.
 * The browser's right-click menu is suppressed on the player,
 * since the right button is now the scrub button. The listener
 * runs in the capture phase and stops the event, so the right
 * press never reaches the tap-to-pause gesture.
 *
 * A right-click without dragging is a 10-second skip instead:
 * click the right half of the player to go forward 10 seconds,
 * the left half to go back 10 seconds. A press counts as a click
 * when the pointer barely moved; any real drag seeks instead.
 * Each skip dispatches a `hop:skip` event so the skip flash
 * (skip-flash.tsx) can show the YouTube-style side effect.
 *
 * Seeks are throttled to one per animation frame: pointermove can
 * fire hundreds of times a second, and seeking a big file on every
 * one of them stutters. The drag only records the target time;
 * the frame applies it, preferring `fastSeek` (async, jumps to the
 * nearest keyframe) where the browser has it.
 */
export function VideoRightDragSeek() {
  useEffect(() => {
    const root = document.querySelector('.blood-skin');
    const video = root?.querySelector('video');
    if (!root || !video) return;

    let scrubbing = false;
    let startX = 0;
    let startTime = 0;
    let pendingTime: number | null = null;
    let rafId = 0;

    /** How far a right press may move and still count as a click. */
    const CLICK_THRESHOLD_PX = 6;
    /** How far a right-click skip jumps, in seconds. */
    const SKIP_SECONDS = 10;

    const onContextMenu = (event: Event) => {
      event.preventDefault();
    };

    /** Apply the latest drag target, at most once per frame. */
    const applyPending = () => {
      rafId = 0;
      if (!scrubbing || pendingTime === null) return;
      const target = pendingTime;
      pendingTime = null;
      if (typeof video.fastSeek === 'function') {
        video.fastSeek(target);
      } else {
        video.currentTime = target;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (!scrubbing) return;
      // The right button was released outside the window, so no
      // pointerup reached us: the drag is over. Without this,
      // data-hop-scrubbing can stick and pin the bar open.
      if ((event.buttons & 2) === 0) {
        stop();
        return;
      }
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) return;
      const width = root.getBoundingClientRect().width;
      if (width <= 0) return;
      const next = startTime + ((event.clientX - startX) / width) * duration;
      pendingTime = Math.min(Math.max(next, 0), duration);
      if (!rafId) rafId = requestAnimationFrame(applyPending);
    };

    const stop = () => {
      if (!scrubbing) return;
      scrubbing = false;
      pendingTime = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      root.removeAttribute('data-hop-scrubbing');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('blur', stop);
    };

    /** Right half: forward 10s. Left half: back 10s. */
    const skipBySide = (back: boolean) => {
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) return;
      const next = video.currentTime + (back ? -SKIP_SECONDS : SKIP_SECONDS);
      video.currentTime = Math.min(Math.max(next, 0), duration);
      window.dispatchEvent(
        new CustomEvent<{ direction: 'forward' | 'back' }>('hop:skip', {
          detail: { direction: back ? 'back' : 'forward' },
        })
      );
    };

    /** Release: a press that barely moved was a click, so skip by
        the side it landed on; a real drag already sought. */
    const onUp = (event: PointerEvent) => {
      if (!scrubbing) return;
      const moved = Math.abs(event.clientX - startX);
      stop();
      if (moved >= CLICK_THRESHOLD_PX) return;
      const rect = root.getBoundingClientRect();
      skipBySide(startX < rect.left + rect.width / 2);
    };

    const onDown = (event: Event) => {
      const pointer = event as PointerEvent;
      // A new press ends any drag whose release we missed (released
      // outside the window): without this, data-hop-scrubbing can
      // stick and pin the bar open.
      if (scrubbing) stop();
      if (pointer.button !== 2) return;
      if (!video.duration || Number.isNaN(video.duration)) return;
      event.preventDefault();
      event.stopPropagation();
      scrubbing = true;
      startX = pointer.clientX;
      startTime = video.currentTime;
      root.setAttribute('data-hop-scrubbing', '');
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', stop);
      window.addEventListener('blur', stop);
    };

    root.addEventListener('contextmenu', onContextMenu);
    root.addEventListener('pointerdown', onDown, true);

    return () => {
      stop();
      root.removeEventListener('contextmenu', onContextMenu);
      root.removeEventListener('pointerdown', onDown, true);
    };
  }, []);

  return null;
}
