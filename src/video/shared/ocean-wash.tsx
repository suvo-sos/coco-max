/** @jsxImportSource react */

import { useEffect, useRef, useState } from 'react';

/** How long the sea takes to drain back before the clip is parked. */
const DRAIN_MS = 780;

export interface OceanWashProps {
  /** Where the loop lives. Relative, so a subfolder deploy still finds it. */
  src: string;
}

/**
 * The sea that washes over the beach when the pointer arrives.
 *
 * It is a real clip of water, not a drawing: three flat SVG bands can be
 * charming but they can never look like the ocean, and "photoreal" is the
 * whole point here. The `<video>` is therefore a plain, muted, looping,
 * `preload="none"` layer under the controls — nothing is fetched until the
 * first wash, and nothing at all is fetched under reduced motion or Save-Data,
 * where the beach simply stays dry.
 *
 * The wash itself is CSS: the layer is clipped to a zero-height band on the
 * panel's top edge and the clip opens downward, so the sea spills in from the
 * picture side, then drains back the same way when the pointer leaves. The
 * layer carries a sand veil and a mask so the water thins out into the sand
 * rather than ending on a hard line, and the ink controls keep their contrast
 * over it.
 *
 * `data-ko-ocean` on `.ko-skin` is the switch; `glass.css` owns the reveal.
 */
export function OceanWash({ src }: OceanWashProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dry, setDry] = useState(false);

  useEffect(() => {
    if (dry) return;

    const root = document.querySelector('.ko-skin');
    const bar = document.querySelector('.ko-skin .vo-bar');
    const video = videoRef.current;
    if (!root || !bar || !video) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

    /** Respect the preferences that mean "do not spend frames or bytes". */
    if (calm.matches || saveData) return;

    let drainTimer = 0;
    let focused = false;

    const play = () => {
      if (root.hasAttribute('data-ko-panel-hidden')) return;
      // Not muted-autoplay-blocked (the element is muted), but a rejected
      // promise is still not worth an unhandled rejection in the console.
      void video.play().catch(() => {});
    };

    const washIn = () => {
      if (root.hasAttribute('data-ko-ocean')) return;
      window.clearTimeout(drainTimer);
      root.setAttribute('data-ko-ocean', '');
      play();
    };

    const washOut = () => {
      if (!root.hasAttribute('data-ko-ocean')) return;
      root.removeAttribute('data-ko-ocean');
      // Keep decoding through the drain so the receding water still moves,
      // then park the clip instead of leaving it spinning off-screen.
      window.clearTimeout(drainTimer);
      drainTimer = window.setTimeout(() => {
        if (!root.hasAttribute('data-ko-ocean')) video.pause();
      }, DRAIN_MS);
    };

    const onFocusOut = (event: Event) => {
      const next = (event as FocusEvent).relatedTarget as Node | null;
      if (next && bar.contains(next)) return;
      window.setTimeout(() => {
        focused = bar.contains(document.activeElement);
        if (!focused && !root.matches(':hover')) washOut();
      }, 0);
    };

    const onEnter = () => washIn();
    const onLeave = () => {
      focused = bar.contains(document.activeElement);
      if (!focused) washOut();
    };
    const onFocusIn = () => {
      focused = true;
      washIn();
    };

    // The panel can drop out while the pointer rests inside the player: no
    // point burning frames on water nobody can see, then pick it back up when
    // the beach returns.
    const observer = new MutationObserver(() => {
      if (root.hasAttribute('data-ko-panel-hidden')) video.pause();
      else if (root.hasAttribute('data-ko-ocean')) play();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-ko-panel-hidden'] });

    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (root.hasAttribute('data-ko-ocean')) play();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    bar.addEventListener('focusin', onFocusIn);
    bar.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(drainTimer);
      observer.disconnect();
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      bar.removeEventListener('focusin', onFocusIn);
      bar.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVisibility);
      root.removeAttribute('data-ko-ocean');
      video.pause();
    };
  }, [dry]);

  if (dry) return null;

  return (
    <div className={'vo-ocean'} aria-hidden="true">
      <video
        ref={videoRef}
        className={'vo-ocean-video'}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        disablePictureInPicture
        onError={() => {
          // No clip shipped (or the host lost it): stay a sand beach rather
          // than showing an empty black band.
          console.warn(`[coco] no ocean clip at "${src}" — the beach stays dry.`);
          setDry(true);
        }}
      />
      <span className={'vo-ocean-veil'} />
      <span className={'vo-ocean-foam'} />
    </div>
  );
}
