/** @jsxImportSource react */

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * YouTube-style centre flash: when playback starts a play icon
 * pops in the middle of the video, when it pauses a pause icon
 * does — then it fades away. It is a brief effect, not a button:
 * the ball animates out and unmounts on its own.
 *
 * It listens to the video element's own play/pause events, so
 * every way of toggling (click on the video, Space, the bottom
 * play button) flashes. It only flashes after the user has
 * interacted with the player, so an autoplaying load does not
 * flash.
 */
export function VideoPlayPauseFlash() {
  const [flash, setFlash] = useState<{ type: 'play' | 'pause'; key: number } | null>(null);
  const keyRef = useRef(0);

  useEffect(() => {
    const root = document.querySelector('.blood-skin');
    const video = root?.querySelector('video');
    if (!root || !video) return;

    let interacted = false;
    const markInteracted = () => {
      interacted = true;
    };
    const onPlay = () => {
      if (interacted) setFlash({ type: 'play', key: ++keyRef.current });
    };
    const onPause = () => {
      if (interacted) setFlash({ type: 'pause', key: ++keyRef.current });
    };

    root.addEventListener('pointerdown', markInteracted);
    document.addEventListener('keydown', markInteracted);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      root.removeEventListener('pointerdown', markInteracted);
      document.removeEventListener('keydown', markInteracted);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  if (!flash) return null;

  return (
    <div className="hop-play-flash" key={flash.key} onAnimationEnd={() => setFlash(null)}>
      <div className="hop-play-flash-ball">
        {flash.type === 'play' ? (
          <Play fill="currentColor" className={'video-controls-center-play-icon'} />
        ) : (
          <Pause fill="currentColor" className={'video-controls-center-play-icon'} />
        )}
      </div>
    </div>
  );
}
