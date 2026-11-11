/** @jsxImportSource react */

import { Controls } from '@videojs/react';

import { ScreenControls } from './shared/screen-controls';
import { SettingsMenu } from './shared/settings-menu';
import type { ThumbnailSlot } from './shared/time-slider';
import { VideoControlsContent } from './shared/video-controls';

/**
 * Every button lives in the bottom bar: the top bar and the big
 * centre buttons stay hidden, so the bottom bar is the only
 * control area. No `center`. The screen controls (AirPlay, Cast,
 * PiP, fullscreen) move down from the top bar into the bottom row
 * after the settings menu.
 *
 * There are deliberately no 10s skip buttons: seeking already has
 * the filmstrip, right-drag and the keyboard.
 */
export function VideoControls({ renderThumbnail }: ThumbnailSlot = {}) {
  return (
    <Controls.Root>
      <VideoControlsContent
        menu={
          <>
            <SettingsMenu />
            <ScreenControls />
          </>
        }
        renderThumbnail={renderThumbnail}
      />
    </Controls.Root>
  );
}
