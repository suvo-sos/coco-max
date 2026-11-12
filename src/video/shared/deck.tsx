/** @jsxImportSource react */

import {
  CaptionsButton as CaptionsButtonPrimitive,
  CastButton as CastButtonPrimitive,
  FullscreenButton as FullscreenButtonPrimitive,
  PiPButton as PiPButtonPrimitive,
  usePlaybackRateOptions,
  useQualityOptions,
} from '@videojs/react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import {
  Captions,
  CaptionsOff,
  Cast,
  Film,
  Gauge,
  Maximize,
  Minimize,
  PictureInPicture2,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from './icons';
import { PlayButton } from './play-button';

/** Above this the speaker shows its second wave. */
const LOUD = 0.7;

/** The continuous rails divide into ten steps: a line every 10%, never on the ends. */
const CONTINUOUS_TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

/**
 * One line per mark, taken from the data: two renditions give two lines, six
 * give six. Never a fixed run of lines the options do not line up with.
 */
function stepTicks(count: number): number[] {
  if (count < 2) return [];
  return Array.from({ length: count }, (_, index) => (index / (count - 1)) * 100);
}

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
 * The progress mark — a rail with a dot on it — shared by the collapsed card
 * and the window it opens into, so both read as the same feature.
 */
function ProgressMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <path d="M3 12h18" />
      <circle cx="9" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * One window inside an opened card: the scale is drawn straight onto the
 * card and a white line marks the value. The pointer and the keyboard drive
 * it through `onFraction` / `onStep`.
 */
function DeckRail({
  label,
  valueText,
  now,
  min,
  max,
  percent,
  icon,
  variant,
  ticks,
  onFraction,
  onStep,
  onEdge,
}: {
  label: string;
  valueText: string;
  now: number;
  min: number;
  max: number;
  percent: number;
  icon?: ReactNode;
  /** `window` drops the track: the scale and playhead are drawn on the card. */
  variant?: 'window';
  /** Tick positions, as percentages of the width. One line per position. */
  ticks?: number[];
  onFraction: (fraction: number) => void;
  onStep: (direction: 1 | -1) => void;
  onEdge: (edge: 0 | 1) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const fromPointer = (clientX: number) => {
    const element = rootRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0) return;
    onFraction(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)));
  };

  // Arrows belong to the rail while it has focus, not to the player's seek.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        onStep(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        onStep(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        onEdge(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        onEdge(1);
      } else {
        return;
      }

      event.stopPropagation();
    };

    element.addEventListener('keydown', onKeyDown);
    return () => element.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      ref={rootRef}
      className={'vo-deck-rail'}
      data-variant={variant}
      role="slider"
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={now}
      aria-valuetext={valueText}
      tabIndex={0}
      style={{ '--deck-level': `${percent}%` } as CSSProperties}
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
      {ticks?.map((position) => (
        <span key={position} className={'vo-deck-tick'} style={{ left: `clamp(1px, ${position}%, calc(100% - 1px))` }} />
      ))}
      {icon ? <span className={'vo-deck-rail-icon'}>{icon}</span> : null}
      <span className={'vo-deck-rail-value'}>{valueText}</span>
    </div>
  );
}

/**
 * The deck: a row of slim cards at the foot of the picture, one per feature.
 * Collapsed they are narrow strips showing only their mark; the card under
 * the pointer (or focus) grows wide and its control blooms inside it, the way
 * an accordion of photos opens the one you point at.
 */
export function Deck() {
  const [active, setActive] = useState('play');

  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const rate = usePlaybackRateOptions();
  const quality = useQualityOptions();

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    const sync = () => {
      setVolume(video.volume);
      setMuted(video.muted);
      setTime(video.currentTime);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };

    sync();
    video.addEventListener('volumechange', sync);
    video.addEventListener('timeupdate', sync);
    video.addEventListener('durationchange', sync);
    video.addEventListener('loadedmetadata', sync);
    video.addEventListener('seeking', sync);
    video.addEventListener('seeked', sync);
    video.addEventListener('emptied', sync);

    return () => {
      video.removeEventListener('volumechange', sync);
      video.removeEventListener('timeupdate', sync);
      video.removeEventListener('durationchange', sync);
      video.removeEventListener('loadedmetadata', sync);
      video.removeEventListener('seeking', sync);
      video.removeEventListener('seeked', sync);
      video.removeEventListener('emptied', sync);
    };
  }, []);

  const setLevel = (next: number) => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    const clamped = Math.min(1, Math.max(0, next));

    if (video) {
      if (clamped > 0 && video.muted) video.muted = false;
      video.volume = clamped;
    }

    setVolume(clamped);
    setMuted(false);
  };

  const seek = (seconds: number) => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    const length = Number.isFinite(video.duration) ? video.duration : 0;
    if (length === 0) return;

    const next = Math.min(length, Math.max(0, seconds));
    video.currentTime = next;
    setTime(next);
  };

  const level = muted ? 0 : volume;
  const percent = Math.round(level * 100);
  const progressPercent = duration > 0 ? Math.round((time / duration) * 100) : 0;

  const rateOptions = rate?.options ?? [];
  const qualityOptions = quality?.options ?? [];
  const rateIndex = Math.max(0, rateOptions.findIndex((option) => option.value === rate?.value));
  const qualityIndex = Math.max(0, qualityOptions.findIndex((option) => option.value === quality?.value));
  const rateLast = Math.max(0, rateOptions.length - 1);
  const qualityLast = Math.max(0, qualityOptions.length - 1);

  const cards: { id: string; label: string; mark: ReactNode; body: ReactNode }[] = [
    {
      id: 'progress',
      label: 'Progress',
      mark: <ProgressMark />,
      body: (
        <DeckRail
          label="Progress"
          valueText={formatTime(time)}
          now={Math.round(time)}
          min={0}
          max={Math.round(duration)}
          percent={progressPercent}
          variant="window"
          ticks={CONTINUOUS_TICKS}
          icon={<ProgressMark />}
          onFraction={(fraction) => seek(fraction * duration)}
          onStep={(direction) => seek(time + direction * 5)}
          onEdge={(edge) => seek(edge === 0 ? 0 : duration)}
        />
      ),
    },
    {
      id: 'volume',
      label: 'Volume',
      mark: <Volume2 />,
      body: (
        <DeckRail
          label="Volume"
          valueText={`${percent}`}
          now={percent}
          min={0}
          max={100}
          percent={percent}
          variant="window"
          ticks={CONTINUOUS_TICKS}
          icon={level === 0 ? <VolumeX /> : level > LOUD ? <Volume2 /> : <Volume1 />}
          onFraction={setLevel}
          onStep={(direction) => setLevel(level + direction * 0.05)}
          onEdge={(edge) => setLevel(edge)}
        />
      ),
    },
    ...(qualityOptions.length > 0
      ? [
          {
            id: 'quality',
            label: 'Quality',
            mark: <Film />,
            body: (
              <DeckRail
                label={quality?.label ?? 'Quality'}
                valueText={quality?.selectedLabel ?? ''}
                now={qualityIndex}
                min={0}
                max={qualityLast}
                percent={qualityLast === 0 ? 0 : Math.round((qualityIndex / qualityLast) * 100)}
                variant="window"
                ticks={stepTicks(qualityOptions.length)}
                icon={<Film />}
                onFraction={(fraction) => {
                  const option = qualityOptions[Math.round(fraction * qualityLast)];
                  if (option) quality?.setValue(option.value);
                }}
                onStep={(direction) => {
                  const option = qualityOptions[qualityIndex + direction];
                  if (option) quality?.setValue(option.value);
                }}
                onEdge={(edge) => {
                  const option = qualityOptions[edge === 0 ? 0 : qualityLast];
                  if (option) quality?.setValue(option.value);
                }}
              />
            ),
          },
        ]
      : []),
    ...(rateOptions.length > 0
      ? [
          {
            id: 'speed',
            label: 'Speed',
            mark: <Gauge />,
            body: (
              <DeckRail
                label={rate?.label ?? 'Speed'}
                valueText={rate?.selectedLabel ?? ''}
                now={rateIndex}
                min={0}
                max={rateLast}
                percent={rateLast === 0 ? 0 : Math.round((rateIndex / rateLast) * 100)}
                variant="window"
                ticks={stepTicks(rateOptions.length)}
                icon={<Gauge />}
                onFraction={(fraction) => {
                  const option = rateOptions[Math.round(fraction * rateLast)];
                  if (option) rate?.setValue(option.value);
                }}
                onStep={(direction) => {
                  const option = rateOptions[rateIndex + direction];
                  if (option) rate?.setValue(option.value);
                }}
                onEdge={(edge) => {
                  const option = rateOptions[edge === 0 ? 0 : rateLast];
                  if (option) rate?.setValue(option.value);
                }}
              />
            ),
          },
        ]
      : []),
    {
      id: 'screen',
      label: 'Screen options',
      mark: <Settings />,
      body: (
        <div className={'vo-deck-keys'}>
          <CastButtonPrimitive
            render={<button type="button" />}
            className={cn('vo-deck-key', 'media-cast-button')}
          >
            <Cast className={cn('media-button-icon', 'media-cast-button-icon')} />
          </CastButtonPrimitive>

          <CaptionsButtonPrimitive
            render={<button type="button" />}
            className={cn('vo-deck-key', 'media-captions-button')}
          >
            <Captions className={cn('media-button-icon', 'media-captions-button-off-icon')} />
            <CaptionsOff className={cn('media-button-icon', 'media-captions-button-on-icon')} />
          </CaptionsButtonPrimitive>

          <PiPButtonPrimitive
            render={<button type="button" />}
            className={cn('vo-deck-key', 'media-pip-button')}
          >
            <PictureInPicture2 className={cn('media-button-icon', 'media-pip-button-enter-icon')} />
            <PictureInPicture2 className={cn('media-button-icon', 'media-pip-button-exit-icon')} />
          </PiPButtonPrimitive>

          <FullscreenButtonPrimitive
            render={<button type="button" />}
            className={cn('vo-deck-key', 'media-fullscreen-button')}
          >
            <Maximize className={cn('media-button-icon', 'media-fullscreen-button-enter-icon')} />
            <Minimize className={cn('media-button-icon', 'media-fullscreen-button-exit-icon')} />
          </FullscreenButtonPrimitive>
        </div>
      ),
    },
  ];

  return (
    <div className={'vo-deck'} role="toolbar" aria-label="Player controls">
      {/* The transport is fixed: it never folds away or widens with the rest. */}
      <div className={'vo-deck-card'} data-feature={'play'} data-fixed={''}>
        <PlayButton className={'vo-deck-play'} iconClassName={'vo-deck-play-icon'} tooltip={false} />
      </div>

      {cards.map((card) => {
        const isActive = card.id === active;

        return (
          <div
            key={card.id}
            className={'vo-deck-card'}
            data-feature={card.id}
            data-active={isActive || undefined}
            role={isActive ? undefined : 'button'}
            tabIndex={isActive ? -1 : 0}
            aria-label={isActive ? undefined : card.label}
            onPointerEnter={() => setActive(card.id)}
            onFocusCapture={() => setActive(card.id)}
            onPointerDown={() => setActive(card.id)}
            onClick={() => setActive(card.id)}
            onKeyDown={(event) => {
              if (!isActive && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                setActive(card.id);
              }
            }}
          >
            <span className={'vo-deck-mark'} aria-hidden="true">
              {card.mark}
            </span>
            <div className={'vo-deck-body'} inert={!isActive}>
              {card.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
