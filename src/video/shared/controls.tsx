/** @jsxImportSource react */

import { Controls, type Slider as SliderPrimitive, Tooltip } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { Deck } from './deck';
import { AudioPlayButton } from './play-button';

export interface ThumbnailSlot {
  /** Kept for the skin's API: the custom slider draws its own bubble, so no storyboard frame is rendered. */
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}

export interface ControlsSlots extends ThumbnailSlot {
  /** The captions toggle, supplied by the video presets because the audio presets have no text track feature. */
  captions?: ReactNode;
  /** The playback-rate control, supplied by the on-demand audio preset. */
  rate?: ReactNode;
  /** A loop of real water that washes over the beach when the pointer arrives. */
  oceanSrc?: string;
  /** The skip-back control, supplied by the presets that have a timeline. */
  seekBackward?: ReactNode;
  /** The skip-forward control, supplied by the presets that have a timeline. */
  seekForward?: ReactNode;
}

/**
 * The control is the deck: a row of slim cards, one per feature, that open as
 * the pointer crosses them. Each card carries its own control — play, volume,
 * progress, quality, speed, picture-in-picture, fullscreen — so nothing else
 * is drawn over the picture. `oceanSrc` and the transport slots stay in the
 * API for the presets but nothing renders them any more.
 */
export function ControlsContent({
  audio = false,
  menu,
  top,
}: ControlsSlots & {
  audio?: boolean;
  center?: boolean;
  live?: boolean;
  menu?: ReactNode;
  top?: ReactNode;
} = {}) {
  return (
    <Controls.Content className={cn('video-controls-content', 'vo-content', audio && 'audio-controls-content')}>
      <Tooltip.Provider>
        {top && <Controls.Group className={'vo-top'}>{top}</Controls.Group>}

        <div className={cn('vo-dock', !audio && 'vo-dock-video')}>
          <div className={'vo-bar'}>
            <div className={'vo-row'}>{audio ? <AudioPlayButton /> : <Deck />}</div>
          </div>
        </div>
      </Tooltip.Provider>
    </Controls.Content>
  );
}
