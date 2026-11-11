/** @jsxImportSource react */

import { StatusIndicator as StatusIndicatorPrimitive } from '@videojs/react';
import { Captions, Maximize, Minimize, PictureInPicture2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

const STATUS_ACTIONS = ['toggleSubtitles', 'toggleFullscreen', 'togglePictureInPicture'] as const;

/**
 * Transient feedback stacks above the title and below the controls, and never takes pointer input. The whole group is
 * hidden from assistive technology: `StatusAnnouncer` already speaks these same events, so exposing both would announce
 * every one of them twice.
 */
export function Indicators({ children }: { children?: ReactNode } = {}) {
  return (
    <div aria-hidden="true" className={'media-indicator-group'}>
      <StatusIndicator />
      {children}
    </div>
  );
}

function StatusIndicator() {
  return (
    <StatusIndicatorPrimitive.Root actions={STATUS_ACTIONS} className={cn('media-indicator', 'media-status-indicator')}>
      <Captions className={cn('media-status-indicator-icon', 'media-status-indicator-captions-on-icon')} />
      <Captions className={cn('media-status-indicator-icon', 'media-status-indicator-captions-off-icon')} />
      <Maximize
        className={cn('media-status-indicator-icon', 'media-status-indicator-fullscreen-enter-icon')}
      />
      <Minimize
        className={cn('media-status-indicator-icon', 'media-status-indicator-fullscreen-exit-icon')}
      />
      <PictureInPicture2 className={cn('media-status-indicator-icon', 'media-status-indicator-pip-enter-icon')} />
      <PictureInPicture2 className={cn('media-status-indicator-icon', 'media-status-indicator-pip-exit-icon')} />
      <StatusIndicatorPrimitive.Value />
    </StatusIndicatorPrimitive.Root>
  );
}

