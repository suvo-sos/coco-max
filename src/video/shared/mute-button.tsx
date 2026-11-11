/** @jsxImportSource react */

import { MuteButton as MuteButtonPrimitive } from '@videojs/react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { Button } from './button';
import { Volume1, Volume2, VolumeX } from './icons';
import { ButtonTooltip } from './tooltip';

/** Above this the speaker shows its second wave. */
const LOUD = 0.7;

/** A dedicated mute toggle for the Dynamic Island. */
export function MuteButton() {
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    const sync = () => setVolume(video.volume);
    sync();
    video.addEventListener('volumechange', sync);
    return () => video.removeEventListener('volumechange', sync);
  }, []);

  return (
    <ButtonTooltip>
      <MuteButtonPrimitive render={<Button />} className={cn('media-mute-button')}>
        {volume > LOUD ? (
          <Volume2 className={cn('media-button-icon', 'media-mute-button-high-icon')} />
        ) : (
          <Volume1 className={cn('media-button-icon', 'media-mute-button-high-icon')} />
        )}
        <VolumeX className={cn('media-button-icon', 'media-mute-button-off-icon')} />
      </MuteButtonPrimitive>
    </ButtonTooltip>
  );
}
