/** @jsxImportSource react */

import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

import { Volume1, Volume2, VolumeX } from './icons';

/**
 * The volume control: a speaker key that opens a volume bar (a
 * horizontal fader) on click. The speaker reflects the current level
 * and mutes/unmutes; the bar sets the level by click or drag, and
 * the arrow keys, Home, End and `m` work when it has keyboard focus.
 *
 * It reads and writes the video element directly, so the wheel
 * behaviour, the mute key and the fader can never disagree.
 */

/** How much the arrow keys move the fader. */
const KEY_STEP = 0.05;

export function VolumeControl() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);

  const effective = muted ? 0 : volume;
  const percent = Math.round(effective * 100);

  useEffect(() => {
    const root = document.querySelector('.ko-skin');
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

  // Close the bar on an outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown as unknown as EventListener);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown as unknown as EventListener);
    };
  }, [open]);

  // Focus the fader when the bar opens.
  useEffect(() => {
    if (open) trackRef.current?.focus();
  }, [open]);

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
    applyVolume((event.clientX - rect.left) / rect.width);
  };

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setFromPointer(event);
  };

  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromPointer(event);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
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
  };

  const icon =
    effective === 0 ? (
      <VolumeX strokeWidth={2.5} />
    ) : effective <= 0.7 ? (
      <Volume1 strokeWidth={2.5} />
    ) : (
      <Volume2 strokeWidth={2.5} />
    );

  return (
    <div
      className={'ko-volume'}
      ref={rootRef}
      data-muted={effective === 0 ? '' : undefined}
      data-open={open ? '' : undefined}
      data-dragging={dragging ? '' : undefined}
    >
      <button
        type="button"
        className={'ko-volume-button'}
        aria-label={effective === 0 ? 'Unmute' : 'Mute'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={'ko-volume-icon'} aria-hidden="true">
          {icon}
        </span>
      </button>

      {open && (
        <div className={'ko-volume-popover'} role="dialog" aria-label="Volume">
          <button
            type="button"
            className={'ko-volume-mute'}
            aria-label={effective === 0 ? 'Unmute' : 'Mute'}
            onClick={toggleMute}
          >
            <span className={'ko-volume-icon'} aria-hidden="true">
              {icon}
            </span>
          </button>

          <div
            className={'ko-volume-track'}
            ref={trackRef}
            role="slider"
            aria-label="Volume"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent}%`}
            tabIndex={0}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
          >
            <span className={'ko-volume-rail'}>
              <span className={'ko-volume-fill'} style={{ width: `${percent}%` }} />
            </span>
            <span className={'ko-volume-thumb'} style={{ left: `${percent}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
