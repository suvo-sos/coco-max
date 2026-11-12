/** @jsxImportSource react */

import {
  FullscreenButton as FullscreenButtonPrimitive,
  PiPButton as PiPButtonPrimitive,
  usePlaybackRateOptions,
  useQualityOptions,
} from '@videojs/react';
import { useEffect, useRef, type CSSProperties } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { Maximize, Minimize, PictureInPicture2 } from './icons';

interface RailOption {
  value: string;
  label: string;
}

/**
 * One slim rail, the same capsule as the progress bar: the cream fill marks
 * the step that is set out of the steps on offer, and the label prints in the
 * middle. Clicking or dragging anywhere on it picks the nearest step; arrows
 * move one step at a time.
 */
function Rail({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: readonly RailOption[];
  value: string;
  onPick: (value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const last = Math.max(0, options.length - 1);
  const index = Math.min(last, Math.max(0, options.findIndex((option) => option.value === value)));

  const pick = (next: number) => {
    const clamped = Math.min(last, Math.max(0, next));
    const option = options[clamped];
    if (!option) return;
    onPick(option.value);
  };

  const fromPointer = (clientX: number) => {
    const track = trackRef.current;
    if (!track || last === 0) return;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return;
    pick(Math.round(((clientX - rect.left) / rect.width) * last));
  };

  // Arrows belong to the rail while it has focus, not to the player's seek.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const current = Number(element.getAttribute('aria-valuenow') ?? 0);

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        pick(current + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        pick(current - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        pick(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        pick(last);
      } else {
        return;
      }

      event.stopPropagation();
    };

    element.addEventListener('keydown', onKeyDown);
    return () => element.removeEventListener('keydown', onKeyDown);
  });

  const level = last === 0 ? 0 : (index / last) * 100;

  return (
    <div
      ref={rootRef}
      className={'vo-rail'}
      role="slider"
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={index}
      aria-valuetext={options[index]?.label ?? value}
      tabIndex={0}
      style={{ '--vo-rail-level': `${level}%` } as CSSProperties}
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
      <div ref={trackRef} className={'vo-rail-track'} aria-hidden="true">
        <span className={'vo-rail-fill'} />
        <span className={'vo-rail-value'}>{options[index]?.label ?? value}</span>
      </div>
    </div>
  );
}

/**
 * Speed as a rail: the current rate is filled to its place on the list, and
 * dragging along the rail steps through `0.5×`, `1×`, `1.25×`, `1.5×` and the
 * rest — whatever the player offers.
 */
export function SpeedAdjuster() {
  const rate = usePlaybackRateOptions();
  const options = rate?.options ?? [];

  if (!rate || rate.hidden || options.length === 0) return null;

  return (
    <Rail
      label={rate.label}
      options={options}
      value={rate.value}
      onPick={(value) => rate.setValue(value)}
    />
  );
}

/** Quality as the same rail: `Auto`, `720p`, `1080p`, filled to the one set. */
export function QualityAdjuster() {
  const quality = useQualityOptions();
  const options = quality?.options ?? [];

  if (!quality || quality.hidden || options.length === 0) return null;

  return (
    <Rail
      label={quality.label}
      options={options}
      value={quality.value}
      onPick={(value) => quality.setValue(value)}
    />
  );
}

/**
 * The two screen keys that sit over the volume bar: picture-in-picture and
 * fullscreen. They are the real Video.js buttons, so their pressed states,
 * hotkeys and fullscreen bookkeeping stay the player's own.
 */
export function ScreenKeys() {
  return (
    <div className={'vo-screen-keys'}>
      <PiPButtonPrimitive
        render={<button type="button" />}
        className={cn('vo-chip', 'vo-chip-key', 'media-pip-button')}
      >
        <PictureInPicture2 className={cn('media-button-icon', 'media-pip-button-enter-icon')} />
        <PictureInPicture2 className={cn('media-button-icon', 'media-pip-button-exit-icon')} />
      </PiPButtonPrimitive>

      <FullscreenButtonPrimitive
        render={<button type="button" />}
        className={cn('vo-chip', 'vo-chip-key', 'media-fullscreen-button')}
      >
        <Maximize className={cn('media-button-icon', 'media-fullscreen-button-enter-icon')} />
        <Minimize className={cn('media-button-icon', 'media-fullscreen-button-exit-icon')} />
      </FullscreenButtonPrimitive>
    </div>
  );
}
