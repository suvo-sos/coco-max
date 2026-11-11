/** @jsxImportSource react */

import { CaptionsButton as CaptionsButtonPrimitive } from '@videojs/react';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { Button } from './button';
import { Captions, CaptionsOff } from './icons';
import { ButtonTooltip } from './tooltip';

export function CaptionsToggle() {
  return (
    <ButtonTooltip>
      <CaptionsButton />
    </ButtonTooltip>
  );
}

export type CaptionsButtonProps = Omit<CaptionsButtonPrimitive.Props, 'children'>;

export function CaptionsButton({ className, ...props }: CaptionsButtonProps = {}) {
  return (
    <CaptionsButtonPrimitive
      render={<Button />}
      className={(state) => cn('media-captions-button', resolveClassName(className, state))}
      {...props}
    >
      <CaptionsOff className={cn('media-button-icon', 'media-captions-button-off-icon')} />
      <Captions className={cn('media-button-icon', 'media-captions-button-on-icon')} />
    </CaptionsButtonPrimitive>
  );
}
