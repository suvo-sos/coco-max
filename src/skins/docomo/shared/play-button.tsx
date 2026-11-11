/** @jsxImportSource react */

import { PlayButton as PlayButtonPrimitive } from '@videojs/react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { Button } from './button';
import { ButtonTooltip } from './tooltip';
import { BufferingIndicator } from './video-feedback';

/** How many orbs float inside the play key's lava lamp. */
const LAVA_ORBS = 12;

/**
 * The play key is a lava lamp: a yellow glass rectangle with blurred
 * orbs of colour drifting behind the icon. Decorative only — the
 * button's own label still says what it does.
 */
function PlayLava() {
  return (
    <span className="hop-play-lava" aria-hidden="true">
      {Array.from({ length: LAVA_ORBS }, (_, i) => (
        <span key={i} className={`hop-play-lava-orb hop-play-lava-orb-${i + 1}`} />
      ))}
    </span>
  );
}

export function PlayButton({
  className,
  iconClassName,
  tooltip = true,
  ...props
}: PlayButtonPrimitive.Props & { iconClassName?: ClassValue; tooltip?: boolean } = {}) {
  return (
    <ButtonTooltip disabled={!tooltip}>
      <PlayButtonPrimitive
        render={<Button />}
        className={(state) => cn('media-play-button', resolveClassName(className, state))}
        {...props}
      >
        <PlayLava />
        <RotateCcw className={cn('media-button-icon-base', 'media-play-button-restart-icon', iconClassName)} />
        <Play
          fill="currentColor"
          className={cn('media-button-icon-base', 'media-play-button-play-icon', iconClassName)}
        />
        <Pause
          fill="currentColor"
          className={cn('media-button-icon-base', 'media-play-button-pause-icon', iconClassName)}
        />
      </PlayButtonPrimitive>
    </ButtonTooltip>
  );
}

export function AudioPlayButton() {
  return (
    <div className={'media-play-button-audio'}>
      <PlayButton />
      <BufferingIndicator className={'media-play-button-buffering'} />
    </div>
  );
}
