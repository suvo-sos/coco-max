/** @jsxImportSource react */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

/** Seconds moved by one arrow key press; Shift moves twice as far. */
const KEY_STEP = 5;

/** `1:07`, or `1:02:07` for anything over an hour. */
function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const whole = Math.floor(safe);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = whole % 60;

  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

/**
 * The progress bar: the same capsule as the volume bar, laid on its side to
 * the right of the play key. The cream fill runs left to right and the
 * played time sits in the middle. It reads and writes the video element's own
 * `currentTime`, so the scrub, the keyboard and this bar stay in step.
 */
export function ProgressBar() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    const sync = () => {
      setTime(video.currentTime);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };

    sync();
    video.addEventListener('timeupdate', sync);
    video.addEventListener('durationchange', sync);
    video.addEventListener('loadedmetadata', sync);
    video.addEventListener('seeking', sync);
    video.addEventListener('seeked', sync);
    video.addEventListener('emptied', sync);

    return () => {
      video.removeEventListener('timeupdate', sync);
      video.removeEventListener('durationchange', sync);
      video.removeEventListener('loadedmetadata', sync);
      video.removeEventListener('seeking', sync);
      video.removeEventListener('seeked', sync);
      video.removeEventListener('emptied', sync);
    };
  }, []);

  const seek = useCallback((seconds: number) => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    const length = Number.isFinite(video.duration) ? video.duration : 0;
    if (length === 0) return;

    const next = Math.min(length, Math.max(0, seconds));
    video.currentTime = next;
    setTime(next);
  }, []);

  // Keep the latest values for the native key listener without re-binding it.
  const stateRef = useRef({ time, duration });
  stateRef.current = { time, duration };

  const progress = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;
  const percent = Math.round(progress * 100);

  const fromPointer = (clientX: number) => {
    const track = trackRef.current;
    const { duration: length } = stateRef.current;
    if (!track || length === 0) return;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return;
    seek(((clientX - rect.left) / rect.width) * length);
  };

  // The player's arrow hotkeys seek too. The listener sits on the bar itself
  // and stops the event there, so a keyboard scrub is not applied twice.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? KEY_STEP * 2 : KEY_STEP;
      const { time: current, duration: length } = stateRef.current;

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        seek(current + step);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        seek(current - step);
      } else if (event.key === 'Home') {
        event.preventDefault();
        seek(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        seek(length);
      } else {
        return;
      }

      event.stopPropagation();
    };

    element.addEventListener('keydown', onKeyDown);
    return () => element.removeEventListener('keydown', onKeyDown);
  }, [seek]);

  return (
    <div
      ref={rootRef}
      className={'vo-progress'}
      role="slider"
      aria-label="Progress"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
      tabIndex={0}
      style={{ '--vo-progress-level': `${percent}%` } as CSSProperties}
      onPointerDown={(event) => {
        event.preventDefault();
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event.clientX);
      }}
      onPointerMove={(event) => {
        if (dragging.current) fromPointer(event.clientX);
      }}
      onPointerUp={(event) => {
        dragging.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <div ref={trackRef} className={'vo-progress-track'} aria-hidden="true">
        <span className={'vo-progress-fill'} />
        <span className={'vo-progress-value'}>{formatTime(time)}</span>
      </div>
    </div>
  );
}
