/** @jsxImportSource react */

import { Controls, Time } from '@videojs/react';
import type { ReactNode } from 'react';

import { CaptionsToggle } from './captions-button';
import { ControlsContent, type ControlsSlots } from './controls';
import { PlayButton } from './play-button';
import { ScreenControls } from './screen-controls';
import { SettingsMenu } from './settings-menu';
import { TimeSlider } from './time-slider';
import { Title } from './title';
import { VideoBufferingIndicator } from './video-feedback';
import { VolumeControl } from './volume-control';

export function VideoControlsContent({
  center = false,
  live = false,
  menu,
  renderThumbnail,
  seekBackward,
  seekForward,
}: ControlsSlots & { center?: boolean; live?: boolean; menu?: ReactNode } = {}) {
  return (
    <>
      <Controls.Backdrop className={'video-controls-backdrop'} />
      <VideoBufferingIndicator />
      <ControlsContent
        captions={!live && <CaptionsToggle />}
        center={center}
        live={live}
        menu={menu}
        renderThumbnail={renderThumbnail}
        seekBackward={seekBackward}
        seekForward={seekForward}
        top={
          <>
            <PlayButton tooltip={false} />
            <TimeSlider />
            <Time.Group className={'media-time-group'}>
              <Time.Value className={'media-time-current-value'} type="current" />
              <Time.Separator className={'media-time-separator'} />
              <Time.Value className={'media-time-duration-value'} type="duration" />
            </Time.Group>
            <VolumeControl />
            <CaptionsToggle />
            <SettingsMenu />
            <ScreenControls />
          </>
        }
      />
    </>
  );
}
