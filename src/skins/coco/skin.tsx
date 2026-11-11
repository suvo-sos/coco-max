/** @jsxImportSource react */

'use client';

import '../../styles/video/scaffold.css';
import './skin.css';
import { Container as ContainerPrimitive, Poster as PosterPrimitive, Slider as SliderPrimitive } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { VideoGestures } from './behaviors/gestures';
import { VideoHotkeys } from './behaviors/hotkeys';
import { VideoIdleHide } from './behaviors/idle-hide';
import { VideoPlayPauseFlash } from './behaviors/play-pause-flash';
import { VideoRightDragSeek } from './behaviors/right-drag-seek';
import { VideoSkipFlash } from './behaviors/skip-flash';
import { VideoVolumeFlash } from './behaviors/volume-flash';
import { VideoWheelVolume } from './behaviors/wheel-volume';
import { VideoControls } from './controls';
import { ErrorDialog } from './shared/error-dialog';
import { Indicators } from './shared/indicators';
import { SeekIndicator } from './shared/seek-indicator';
import { StatusAnnouncer } from './shared/status-announcer';
import { Poster } from './shared/video-feedback';

export interface VideoSkinProps extends Omit<ContainerPrimitive.Props, 'children'> {
  children?: ReactNode;
  renderPoster?: PosterPrimitive.ImageProps['render'];
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}

export function VideoSkin({
  children,
  className,
  renderPoster,
  renderThumbnail,
  ...props
}: VideoSkinProps = {}) {
  return (
    <ContainerPrimitive
      className={cn('media-skin', 'media-container', 'media-video', 'blood-skin', className)}
      data-theme="scaffold"
      data-preset="video"
      {...props}
    >
      {children}
      {/* SVG refraction map for the liquid-glass control bar. */}
      <svg className="blood-glass-defs" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="blood-glass" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="1.4" result="soft" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="soft"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <Poster renderImage={renderPoster} />
      <ErrorDialog />
      <VideoControls renderThumbnail={renderThumbnail} />

      <VideoHotkeys />
      <VideoGestures />
      <VideoIdleHide />
      <VideoPlayPauseFlash />
      <VideoSkipFlash />
      <VideoVolumeFlash />
      <VideoRightDragSeek />
      <VideoWheelVolume />
      <StatusAnnouncer />
      <Indicators>
        <SeekIndicator />
      </Indicators>
    </ContainerPrimitive>
  );
}
