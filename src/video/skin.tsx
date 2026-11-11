/** @jsxImportSource react */

'use client';

import '../styles/video/scaffold.css';
import './skin.css';
import './glass.css';
import { Container as ContainerPrimitive, Poster as PosterPrimitive, Slider as SliderPrimitive } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { VideoGestures } from './behaviors/gestures';
import { VideoHotkeys } from './behaviors/hotkeys';
import { VideoPalette } from './behaviors/video-palette';
import { VideoWheelVolume } from './behaviors/wheel-volume';
import { VideoControls } from './controls';
import { ErrorDialog } from './shared/error-dialog';
import { Indicators } from './shared/indicators';
import { LiquidGlassFilter } from './shared/liquid-glass';
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
      className={cn('media-skin', 'media-container', 'media-video', 'ko-skin', className)}
      data-theme="scaffold"
      data-preset="video"
      {...props}
    >
      {children}
      <LiquidGlassFilter />
      <Poster renderImage={renderPoster} />
      <ErrorDialog />
      <VideoControls renderThumbnail={renderThumbnail} />

      <VideoHotkeys />
      <VideoGestures />
      <VideoWheelVolume />
      <VideoPalette />
      <StatusAnnouncer />
      <Indicators>
        <SeekIndicator />
      </Indicators>
    </ContainerPrimitive>
  );
}
