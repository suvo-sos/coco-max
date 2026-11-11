/** @jsxImportSource react */

import { useEffect } from 'react';

/** One wheel notch (about 100 units of deltaY) changes the volume by this much. */
const VOLUME_PER_DELTA = 0.0006;

/**
 * Mouse wheel volume: scroll up over the player to turn it up,
 * down to turn it down. The volume button is hidden in the clean
 * UI, so this is how the volume is reached at all.
 *
 * The step scales with how far the wheel moved, so a trackpad's
 * many tiny events glide the volume smoothly instead of jumping
 * it in big steps, and a mouse wheel notch moves it a sensible
 * amount. Scrolling up also unmutes. The page never scrolls while
 * the pointer is over the player (the listener is non-passive
 * and prevents the default). The inline volume control shows the
 * level as it changes: the bar is driven by the element's own
 * volume, so the wheel moves it too.
 */
export function VideoWheelVolume() {
  useEffect(() => {
    const root = document.querySelector('.blood-skin');
    const video = root?.querySelector('video');
    if (!root || !video) return;

    const onWheel = (event: Event) => {
      const wheel = event as WheelEvent;
      // Never fight a scrub, and never steal scrolling from an open
      // settings menu or dialog.
      if (root.hasAttribute('data-hop-scrubbing')) return;
      const target = wheel.target as Element | null;
      if (target?.closest?.('.media-menu-popup, .media-dialog-popup')) return;

      event.preventDefault();
      let dy = wheel.deltaY;
      if (wheel.deltaMode === 1) dy *= 16;
      else if (wheel.deltaMode === 2) dy *= 400;
      if (!dy) return;
      if (dy < 0 && video.muted) video.muted = false;
      video.volume = Math.min(1, Math.max(0, video.volume - dy * VOLUME_PER_DELTA));
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      root.removeEventListener('wheel', onWheel);
    };
  }, []);

  return null;
}
