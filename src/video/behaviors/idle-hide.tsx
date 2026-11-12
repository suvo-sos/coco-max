/** @jsxImportSource react */

import { useEffect } from 'react';

/** How long the pointer can rest before the panel (beach and controls) drops. */
const IDLE_MS = window.matchMedia('(pointer: coarse)').matches ? 1000 : 1500;

/** Only travel this far counts as real movement — a shaky hand does not. */
const MOVE_THRESHOLD_PX = 20;

/** How often the loop re-checks (milliseconds). */
const TICK_MS = 100;

/**
 * The player's own controls stay up whenever the video is paused, and they
 * only auto-hide after a movement while it plays. Coco wants the whole beach
 * panel to drop out of the tile as soon as the pointer stops or leaves,
 * paused or not, so this loop sets `data-ko-panel-hidden` on the skin when
 * none of the reasons to stay open apply:
 *
 *   1. the pointer is over the panel itself,
 *   2. the pointer has really moved in the last 1.5s,
 *   3. a control has keyboard focus,
 *   4. a slider is mid-drag or the player is mid right-drag seek,
 *   5. a menu or the volume popover is open (their trigger says so).
 *
 * The CSS in glass.css turns that attribute into the slide-down; the picture
 * is never touched, only the panel over it.
 */
export function VideoIdleHide() {
  useEffect(() => {
    const root = document.querySelector('.ko-skin');
    const bar = document.querySelector('.ko-skin .vo-bar');
    if (!root || !bar) return;

    let insidePlayer = true;
    let lastRealMove = Date.now();
    let lastX: number | null = null;
    let lastY: number | null = null;
    let pointerX = -1;
    let pointerY = -1;

    const tick = () => {
      const rect = bar.getBoundingClientRect();
      const overBar =
        insidePlayer &&
        pointerX >= rect.left &&
        pointerX <= rect.right &&
        pointerY >= rect.top &&
        pointerY <= rect.bottom;
      const awake = insidePlayer && Date.now() - lastRealMove <= IDLE_MS;
      const active = document.activeElement;
      const focused = !!active && bar.contains(active) && active.matches(':focus-visible');
      const scrubbing = root.hasAttribute('data-ko-scrubbing');
      const dragging = !!root.querySelector('[data-dragging]');
      const expanded = !!bar.querySelector('[aria-expanded="true"]');

      if (overBar || awake || focused || scrubbing || dragging || expanded) {
        root.removeAttribute('data-ko-panel-hidden');
      } else {
        root.setAttribute('data-ko-panel-hidden', '');
      }
    };

    const onMove = (event: Event) => {
      const pointer = event as PointerEvent;
      pointerX = pointer.clientX;
      pointerY = pointer.clientY;
      insidePlayer = true;
      if (lastX !== null && lastY !== null) {
        const dx = pointer.clientX - lastX;
        const dy = pointer.clientY - lastY;
        if (Math.hypot(dx, dy) < MOVE_THRESHOLD_PX) {
          tick();
          return;
        }
      }
      lastX = pointer.clientX;
      lastY = pointer.clientY;
      lastRealMove = Date.now();
      tick();
    };

    /** A click is always intentional, wherever it lands. */
    const onDown = (event: Event) => {
      const pointer = event as PointerEvent;
      pointerX = pointer.clientX;
      pointerY = pointer.clientY;
      insidePlayer = true;
      lastX = pointer.clientX;
      lastY = pointer.clientY;
      lastRealMove = Date.now();
      tick();
    };

    const onLeave = () => {
      insidePlayer = false;
      tick();
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('mouseleave', onLeave);
    document.addEventListener('focusin', tick);
    document.addEventListener('focusout', tick);

    const interval = window.setInterval(tick, TICK_MS);
    tick();

    return () => {
      window.clearInterval(interval);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('focusin', tick);
      document.removeEventListener('focusout', tick);
      root.removeAttribute('data-ko-panel-hidden');
    };
  }, []);

  return null;
}
