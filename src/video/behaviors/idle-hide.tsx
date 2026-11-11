/** @jsxImportSource react */

import { useEffect } from 'react';

/** How long the cursor can sit still over the player before the
    bottom bar hides itself. */
const IDLE_MS = 1500;

/**
 * The pointer must travel at least this far (in pixels) from where
 * it last really was. Smaller shakes — a shaky hand, a sensitive
 * mouse — are ignored: they do not wake the bar and do not restart
 * the 1.5s timer.
 */
const MOVE_THRESHOLD_PX = 20;

/** How often the visibility loop re-checks (in milliseconds). */
const TICK_MS = 100;

/**
 * The control bar (seekbar + keys) is driven by one loop, not by a
 * chain of hover events — so it keeps working no matter how weird
 * the user is with the mouse, and as many times as they repeat it.
 *
 * Every 100ms the loop asks two questions:
 *   1. Is the cursor over the control bar right now?
 *   2. Has the cursor really moved in the last 1.5s?
 * The bar shows only when both are true. It sets
 * `data-ko-bar-visible` on the skin root; the CSS in skin.css
 * shows the bar while it is set. Keyboard focus inside the bar
 * also shows it, so tabbing to the seekbar still works.
 */
export function VideoIdleHide() {
  useEffect(() => {
    const root = document.querySelector('.ko-skin');
    // The visible bar is the top panel; the bottom one is hidden in
    // this skin, but fall back to it if a skin ever swaps them.
    const bar =
      document.querySelector('.ko-skin .video-controls-top') ??
      document.querySelector('.ko-skin .video-controls-bottom');
    if (!root || !bar) return;

    let lastRealMove = 0;
    let lastX: number | null = null;
    let lastY: number | null = null;
    let pointerX = -1;
    let pointerY = -1;
    let insidePlayer = false;

    const tick = () => {
      const rect = bar.getBoundingClientRect();
      const overBar =
        insidePlayer &&
        pointerX >= rect.left &&
        pointerX <= rect.right &&
        pointerY >= rect.top &&
        pointerY <= rect.bottom;
      const idle = Date.now() - lastRealMove > IDLE_MS;
      // Moving anywhere in the player wakes the bar for 1.5s; resting
      // on the bar itself keeps it awake, so hovering it never fights
      // the timer.
      const awake = insidePlayer && !idle;
      // Only a keyboard (Tab) focus keeps the bar open. Clicking the
      // seekbar focuses its thumb too, and that click focus must not
      // pin the bar open — otherwise the bar never hides until
      // something else is clicked. :focus-visible is exactly that
      // distinction: it matches for Tab focus, not for click focus.
      const active = document.activeElement;
      const focused = !!active && bar.contains(active) && active.matches(':focus-visible');
      const scrubbing = root.hasAttribute('data-ko-scrubbing');
      const volumeOpen = !!root.querySelector('.ko-volume[data-open]');
      if (scrubbing || overBar || awake || focused || volumeOpen) {
        root.setAttribute('data-ko-bar-visible', '');
      } else {
        root.removeAttribute('data-ko-bar-visible');
      }
    };

    /** Only real movement counts. Tiny shakes are ignored. */
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
      root.removeAttribute('data-ko-bar-visible');
    };
  }, []);

  return null;
}
