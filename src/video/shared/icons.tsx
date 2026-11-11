/** @jsxImportSource react */

/**
 * The icon set: Hugeicons, the free set (about 15k glyphs). Every component
 * below keeps the lucide-style name the skin already used, so the markup in
 * the controls stays the same, and they all go through one wrapper so the
 * whole player reads as one icon family.
 *
 * Sizing and colour stay with CSS: the icons carry `width`/`height`
 * attributes, but the skin's `.media-button-icon`-style rules set real sizes
 * and the icons inherit `currentColor`, so the bar, menus and indicators keep
 * driving them exactly as before.
 */
import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react';
import {
  AirplayIcon,
  AudioLinesIcon,
  CaptionsIcon,
  CaptionsOffIcon,
  ChevronRightIcon,
  DashboardSpeed02Icon,
  FilmIcon,
  FullScreenIcon,
  Loading03Icon,
  MinimizeScreenIcon,
  PauseIcon,
  PictureInPictureOnIcon,
  PlayIcon,
  RotateCcwIcon,
  Settings02Icon,
  Tick02Icon,
  Volume01Icon,
  Volume02Icon,
  VolumeMute02Icon,
} from '@hugeicons/core-free-icons';

type IconProps = Omit<HugeiconsIconProps, 'icon'>;

/** The transport. */
export function Play(props: IconProps) {
  return <HugeiconsIcon icon={PlayIcon} {...props} />;
}

export function Pause(props: IconProps) {
  return <HugeiconsIcon icon={PauseIcon} {...props} />;
}

export function RotateCcw(props: IconProps) {
  return <HugeiconsIcon icon={RotateCcwIcon} {...props} />;
}

/**
 * Volume, at the three levels the player distinguishes: muted, quiet (up to
 * 70%) and loud (above 70%), which switches to the two-wave speaker.
 */
export function Volume2(props: IconProps) {
  return <HugeiconsIcon icon={Volume02Icon} {...props} />;
}

export function Volume1(props: IconProps) {
  return <HugeiconsIcon icon={Volume01Icon} {...props} />;
}

export function VolumeX(props: IconProps) {
  return <HugeiconsIcon icon={VolumeMute02Icon} {...props} />;
}

/** Text tracks. */
export function Captions(props: IconProps) {
  return <HugeiconsIcon icon={CaptionsIcon} {...props} />;
}

export function CaptionsOff(props: IconProps) {
  return <HugeiconsIcon icon={CaptionsOffIcon} {...props} />;
}

/** The screen keys. */
export function Maximize(props: IconProps) {
  return <HugeiconsIcon icon={FullScreenIcon} {...props} />;
}

export function Minimize(props: IconProps) {
  return <HugeiconsIcon icon={MinimizeScreenIcon} {...props} />;
}

export function PictureInPicture2(props: IconProps) {
  return <HugeiconsIcon icon={PictureInPictureOnIcon} {...props} />;
}

export function Airplay(props: IconProps) {
  return <HugeiconsIcon icon={AirplayIcon} {...props} />;
}

/** Menus and indicators. */
export function ChevronRight(props: IconProps) {
  return <HugeiconsIcon icon={ChevronRightIcon} {...props} />;
}

export function Check(props: IconProps) {
  return <HugeiconsIcon icon={Tick02Icon} {...props} />;
}

export function Settings(props: IconProps) {
  return <HugeiconsIcon icon={Settings02Icon} {...props} />;
}

export function Gauge(props: IconProps) {
  return <HugeiconsIcon icon={DashboardSpeed02Icon} {...props} />;
}

export function Film(props: IconProps) {
  return <HugeiconsIcon icon={FilmIcon} {...props} />;
}

export function AudioLines(props: IconProps) {
  return <HugeiconsIcon icon={AudioLinesIcon} {...props} />;
}

/** Buffering. */
export function LoaderCircle(props: IconProps) {
  return <HugeiconsIcon icon={Loading03Icon} {...props} />;
}
