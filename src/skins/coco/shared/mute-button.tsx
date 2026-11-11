/** @jsxImportSource react */

import { MuteButton as MuteButtonPrimitive } from '@videojs/react';
import { Volume2, VolumeX } from 'lucide-react';

import { cn } from '@/lib/resolve-class-name';

import { Button } from './button';
import { ButtonTooltip } from './tooltip';

/** A dedicated mute toggle for the Dynamic Island. */
export function MuteButton() {
  return (
    <ButtonTooltip>
      <MuteButtonPrimitive render={<Button />} className={cn('media-mute-button')}>
        <Volume2 className={cn('media-button-icon', 'media-mute-button-high-icon')} />
        <VolumeX className={cn('media-button-icon', 'media-mute-button-off-icon')} />
      </MuteButtonPrimitive>
    </ButtonTooltip>
  );
}
