/** @jsxImportSource react */

import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** How long the volume level stays after the last change, in milliseconds. */
const SHOW_MS = 1000;

/**
 * Volume level display: whenever the volume changes - wheel,
 * mute button, volume slider, arrow keys - a pill pops up in
 * the middle of the video with the speaker icon, a level bar
 * and the percent, then fades away.
 *
 * It listens to the video element's own `volumechange` event,
 * so every path that changes the volume shows it, including
 * the wheel, which sets the volume straight on the element.
 * It only shows after the user has interacted with the player,
 * so an autoplaying load does not flash it. This replaces the
 * framework's VolumeIndicator (removed from indicators.tsx),
 * which did not reliably fire for volume set straight on the
 * element.
 */
export function VideoVolumeFlash() {
  const [flash, setFlash] = useState<{ volume: number; muted: boolean; key: number } | null>(null);
  const keyRef = useRef(0);
  const hideRef = useRef(0);

  useEffect(() => {
    const root = document.querySelector('.blood-skin');
    const video = root?.querySelector('video');
    if (!root || !video) return;

    let interacted = false;
    const markInteracted = () => {
      interacted = true;
    };
    const onVolumeChange = () => {
      if (!interacted) return;
      setFlash({ volume: video.volume, muted: video.muted, key: ++keyRef.current });
      window.clearTimeout(hideRef.current);
      hideRef.current = window.setTimeout(() => setFlash(null), SHOW_MS);
    };

    root.addEventListener('pointerdown', markInteracted);
    root.addEventListener('wheel', markInteracted, { passive: true });
    document.addEventListener('keydown', markInteracted);
    video.addEventListener('volumechange', onVolumeChange);
    return () => {
      root.removeEventListener('pointerdown', markInteracted);
      root.removeEventListener('wheel', markInteracted);
      document.removeEventListener('keydown', markInteracted);
      video.removeEventListener('volumechange', onVolumeChange);
      window.clearTimeout(hideRef.current);
    };
  }, []);

  if (!flash) return null;

  const percent = Math.round(flash.volume * 100);
  const off = flash.muted || flash.volume === 0;

  return (
    <div className="hop-volume-flash" aria-hidden="true">
      <div className="hop-volume-flash-pill" key={flash.key}>
        {off ? (
          <VolumeX className={'hop-volume-flash-icon'} />
        ) : flash.volume < 0.5 ? (
          <Volume1 className={'hop-volume-flash-icon'} />
        ) : (
          <Volume2 className={'hop-volume-flash-icon'} />
        )}
        <span className="hop-volume-flash-track">
          <span className="hop-volume-flash-fill" style={{ width: `${percent}%` }} />
        </span>
        <span className="hop-volume-flash-value">{percent}%</span>
      </div>
    </div>
  );
}
