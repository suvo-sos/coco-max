/** @jsxImportSource react */

import {
  PiPButton as PiPButtonPrimitive,
  FullscreenButton as FullscreenButtonPrimitive,
} from '@videojs/react';
import { Maximize, Minimize, PictureInPicture2 } from 'lucide-react';

import { cn } from '@/lib/resolve-class-name';

import { AirPlayButton } from './airplay-button';
import { Button } from './button';
import { ButtonTooltip } from './tooltip';

function PiPButton() {
  return (
    <ButtonTooltip popupClassName={'media-tooltip-screen-popup'}>
      <PiPButtonPrimitive render={<Button />} className={'media-pip-button'}>
        <PictureInPicture2 className={cn('media-button-icon', 'media-pip-button-enter-icon')} />
        <PictureInPicture2 className={cn('media-button-icon', 'media-pip-button-exit-icon')} />
      </PiPButtonPrimitive>
    </ButtonTooltip>
  );
}

function FullscreenButton() {
  return (
    <ButtonTooltip popupClassName={'media-tooltip-screen-popup'}>
      <FullscreenButtonPrimitive render={<Button />} className={'media-fullscreen-button'}>
        <Maximize className={cn('media-button-icon', 'media-fullscreen-button-enter-icon')} />
        <Minimize className={cn('media-button-icon', 'media-fullscreen-button-exit-icon')} />
      </FullscreenButtonPrimitive>
    </ButtonTooltip>
  );
}

export function ScreenControls() {
  return (
    <>
      <AirPlayButton popupClassName={'media-tooltip-screen-popup'} />
      <PiPButton />
      <FullscreenButton />
    </>
  );
}
