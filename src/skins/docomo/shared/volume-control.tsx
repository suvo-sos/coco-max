/** @jsxImportSource react */

import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

/**
 * Default-style volume control: a mute button that opens a vertical
 * slider above it. Clicking the speaker toggles mute; clicking or
 * dragging the track sets the level. Arrow keys still work.
 */

/** How much the arrow keys move the volume. */
const KEY_STEP = 0.05;

export function VolumeControl() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);

  const open = hovering || focused;
  const effective = muted ? 0 : volume;
  const percent = Math.round(effective * 100);

  useEffect(() => {
    const root = document.querySelector('.blood-skin');
    const video = root?.querySelector('video');
    if (!video) return;
    videoRef.current = video;

    const sync = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };
    sync();
    video.addEventListener('volumechange', sync);
    return () => {
      video.removeEventListener('volumechange', sync);
      videoRef.current = null;
    };
  }, []);

  const applyVolume = (value: number) => {
    const next = Math.min(1, Math.max(0, value));
    setVolume(next);
    setMuted(false);
    const video = videoRef.current;
    if (!video) return;
    if (next > 0 && video.muted) video.muted = false;
    video.volume = next;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    if (!nextMuted && video.volume === 0) video.volume = 0.5;
  };

  const setFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    applyVolume((rect.bottom - event.clientY) / rect.height);
  };

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event);
  };

  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromPointer(event);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        applyVolume(effective + KEY_STEP);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        applyVolume(effective - KEY_STEP);
        break;
      case 'Home':
        applyVolume(0);
        break;
      case 'End':
        applyVolume(1);
        break;
      case 'm':
      case 'M':
        toggleMute();
        break;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    setFocused(true);
  };

  return (
    <div
      className="hop-volume"
      data-open={open ? '' : undefined}
      data-muted={effective === 0 ? '' : undefined}
      role="slider"
      aria-label="Volume"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}%`}
      tabIndex={0}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={(event) => setFocused(event.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
      onKeyDown={onKeyDown}
    >
      <div className="hop-volume-panel" aria-hidden={open ? undefined : true}>
        <div
          className="hop-volume-track"
          ref={trackRef}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
          onPointerCancel={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        >
          <span className="hop-volume-fill" style={{ height: `${percent}%` }} />
          <span className="hop-volume-thumb" style={{ bottom: `${percent}%` }} />
        </div>
      </div>
      <button
        type="button"
        className="hop-volume-button"
        aria-label={effective === 0 ? 'Unmute' : 'Mute'}
        onClick={toggleMute}
      >
        <span className="hop-volume-icon" aria-hidden="true">
          {effective === 0 ? (
            <VolumeX strokeWidth={2.75} />
          ) : effective < 0.5 ? (
            <Volume1 strokeWidth={2.75} />
          ) : (
            <Volume2 strokeWidth={2.75} />
          )}
        </span>
      </button>
    </div>
  );
}
