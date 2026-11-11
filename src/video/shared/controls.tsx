/** @jsxImportSource react */

import { Controls, type Slider as SliderPrimitive, Time, Tooltip } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { LiveButton } from './live-button';
import { MuteButton } from './mute-button';
import { AudioPlayButton, PlayButton } from './play-button';
import { ProgressSlider } from './progress-slider';
import { VolumeSlider } from './volume-slider';

export interface ThumbnailSlot {
  /** Kept for the skin's API: the custom slider draws its own bubble, so no storyboard frame is rendered. */
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}

export interface ControlsSlots extends ThumbnailSlot {
  /** The captions toggle, supplied by the video presets because the audio presets have no text track feature. */
  captions?: ReactNode;
  /** The playback-rate control, supplied by the on-demand audio preset. */
  rate?: ReactNode;
  /** The skip-back control, supplied by the presets that have a timeline. */
  seekBackward?: ReactNode;
  /** The skip-forward control, supplied by the presets that have a timeline. */
  seekForward?: ReactNode;
}

/**
 * The bar: a floating frosted panel at the bottom of the picture, not a
 * full-width strip. One row carries the time, the timeline and the duration;
 * the row under it carries the transport, the volume fader, the speed chips
 * and the right-hand keys.
 */
export function ControlsContent({
  audio = false,
  captions,
  center = false,
  live = false,
  menu,
  rate,
  renderThumbnail,
  seekBackward,
  seekForward,
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

        {center && (
          <Controls.Group className={'vo-center'}>
            {seekBackward}
            <PlayButton
              className={'vo-center-play'}
              iconClassName={'vo-center-play-icon'}
              tooltip={false}
            />
            {seekForward}
          </Controls.Group>
        )}

        <div className={cn('vo-dock', !audio && 'vo-dock-video')}>
          <div className={'vo-bar'}>
            <span className={'vo-glass'} aria-hidden="true" />
            <div className={'vo-progress'}>
              <Time.Value className={'vo-time'} type="current" />
              {!live && <ProgressSlider />}
              {!live && <Time.Value className={'vo-time'} type="duration" />}
            </div>

            <div className={'vo-keys'}>
              <div className={'vo-keys-start'}>
                {audio ? <AudioPlayButton /> : <PlayButton />}
                {seekBackward}
                {seekForward}
                {live && <LiveButton />}
                {!audio && <MuteButton />}
                {!audio && <VolumeSlider />}
              </div>

              <div className={'vo-keys-end'}>
                {captions}
                {rate}
                {menu}
              </div>
            </div>
          </div>
        </div>
      </Tooltip.Provider>
    </Controls.Content>
  );
}
