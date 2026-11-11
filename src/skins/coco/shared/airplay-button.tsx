/** @jsxImportSource react */

import { AirPlayButton as AirPlayButtonPrimitive } from '@videojs/react';
import { Airplay } from 'lucide-react';
import type { ClassValue } from 'cn';

import { cn } from '@/lib/resolve-class-name';

import { Button } from './button';
import { ButtonTooltip } from './tooltip';

export function AirPlayButton({ popupClassName }: { popupClassName?: ClassValue } = {}) {
  return (
    <ButtonTooltip popupClassName={popupClassName}>
      <AirPlayButtonPrimitive render={<Button />} className={'media-airplay-button'}>
        <Airplay className={cn('media-button-icon', 'media-airplay-button-enter-icon')} />
        <Airplay className={cn('media-button-icon', 'media-airplay-button-exit-icon')} />
      </AirPlayButtonPrimitive>
    </ButtonTooltip>
  );
}
