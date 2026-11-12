/** @jsxImportSource react */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

import { Volume1, Volume2, VolumeX } from './icons';

/** How much one arrow key press moves the level. Shift moves twice as far. */
const KEY_STEP = 0.05;

/** Above this the speaker shows its second wave. */
const LOUD = 0.7;

/**
 * The volume bar: a short vertical capsule that rises out of the play key on
 * hover, with the level printed in the middle. The cream fill climbs from
 * the bottom of a grey track; the number reads in ink over both.
 *
 * It reads and writes the video element's own volume, so the wheel, the
 * keyboard and this bar can never disagree. Dragging anywhere on the capsule
 * sets the level straight away — the whole bar is the track.
 */
export function VolumeBar() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const levelRef = useRef(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    const sync = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    sync();
    video.addEventListener('volumechange', sync);

    return () => video.removeEventListener('volumechange', sync);
  }, []);

  const setLevel = useCallback((next: number) => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    const clamped = Math.min(1, Math.max(0, next));

    // Turning it up always means hearing it: dragging past zero unmutes.
    if (video) {
      if (clamped > 0 && video.muted) video.muted = false;
      video.volume = clamped;
    }

    setVolume(clamped);
    setMuted(false);
  }, []);

  const level = muted ? 0 : volume;
  const percent = Math.round(level * 100);
  levelRef.current = level;

  const fromPointer = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.height === 0) return;
    setLevel(1 - (clientY - rect.top) / rect.height);
  };

  // The player's arrow hotkeys seek. While the bar has focus the arrows belong
  // to the bar, so the listener sits on the element itself and stops the event
  // before it can reach the player's coordinator.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? KEY_STEP * 2 : KEY_STEP;
      const current = levelRef.current;

      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault();
        setLevel(current + step);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setLevel(current - step);
      } else if (event.key === 'Home') {
        event.preventDefault();
        setLevel(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setLevel(1);
      } else {
        return;
      }

      event.stopPropagation();
    };

    element.addEventListener('keydown', onKeyDown);
    return () => element.removeEventListener('keydown', onKeyDown);
  }, [setLevel]);

  return (
    <div
      ref={rootRef}
      className={'vo-volume'}
      role="slider"
      aria-label="Volume"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}%`}
      tabIndex={0}
      style={{ '--vo-volume-level': `${percent}%` } as CSSProperties}
      onPointerDown={(event) => {
        event.preventDefault();
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event.clientY);
      }}
      onPointerMove={(event) => {
        if (dragging.current) fromPointer(event.clientY);
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
      <div ref={trackRef} className={'vo-volume-track'} aria-hidden="true">
        <span className={'vo-volume-fill'} />
        <span className={'vo-volume-value'}>{percent}</span>
        <span className={'vo-volume-icon'}>
          {level === 0 ? <VolumeX /> : level > LOUD ? <Volume2 /> : <Volume1 />}
        </span>
      </div>
    </div>
  );
}
