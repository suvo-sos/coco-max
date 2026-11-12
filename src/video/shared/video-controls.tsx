/** @jsxImportSource react */

import type { ReactNode } from 'react';

import { ControlsContent, type ControlsSlots } from './controls';
import { VideoBufferingIndicator } from './video-feedback';

/**
 * The bar: a floating glass panel at the bottom of the picture. There is no
 * scrim over the footage — the panel carries its own backdrop, so showing the
 * controls never darkens the video.
 */
export function VideoControlsContent({
  center = false,
  live = false,
  menu,
  oceanSrc,
  renderThumbnail,
  seekBackward,
  seekForward,
}: ControlsSlots & { center?: boolean; live?: boolean; menu?: ReactNode } = {}) {
  return (
    <>
      <VideoBufferingIndicator />
      <ControlsContent
        center={center}
        live={live}
        menu={menu}
        oceanSrc={oceanSrc}
        renderThumbnail={renderThumbnail}
        seekBackward={seekBackward}
        seekForward={seekForward}
      />
    </>
  );
}
