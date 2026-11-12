/** @jsxImportSource react */
import { audioText, captionsText, qualityText, settingsText, speedText } from '@videojs/core/i18n/text/menu';
import {
  FullscreenButton as FullscreenButtonPrimitive,
  MuteButton as MuteButtonPrimitive,
  useAudioTrackOptions,
  useCaptionsOptions,
  usePlaybackRateOptions,
  useQualityOptions,
} from '@videojs/react';
import { useEffect, useState } from 'react';

import { CircularCommandMenu, type CommandItem } from '@/components/ui/circular-command-menu';
import { cn } from '@/lib/resolve-class-name';

import {
  AudioLines,
  Captions,
  Check,
  ChevronRight,
  Film,
  Gauge,
  Maximize,
  Minimize,
  Volume1,
  Volume2,
  VolumeX,
} from './icons';

type PanelId = 'audio' | 'quality' | 'captions' | 'speed';

interface PanelOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** The wheel is portalled into the player, not the page, so it is clipped by the tile and survives fullscreen. */
function resolvePlayer(trigger: HTMLElement): HTMLElement {
  return (trigger.closest('.ko-skin') as HTMLElement | null) ?? document.body;
}

/** Above this the speaker shows its second wave. */
const LOUD = 0.7;

/** Mute, as a wheel key: the real Video.js primitive, so press states and data attributes stay the player's. */
function MuteKey() {
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    const sync = () => setVolume(video.volume);
    sync();
    video.addEventListener('volumechange', sync);
    return () => video.removeEventListener('volumechange', sync);
  }, []);

  return (
    <MuteButtonPrimitive render={<button type="button" />} className={cn('media-mute-button')}>
      {volume > LOUD ? (
        <Volume2 className={cn('media-button-icon', 'media-mute-button-high-icon')} />
      ) : (
        <Volume1 className={cn('media-button-icon', 'media-mute-button-high-icon')} />
      )}
      <VolumeX className={cn('media-button-icon', 'media-mute-button-off-icon')} />
    </MuteButtonPrimitive>
  );
}

/** Fullscreen, as a wheel key. */
function FullscreenKey() {
  return (
    <FullscreenButtonPrimitive render={<button type="button" />} className={cn('media-fullscreen-button')}>
      <Maximize className={cn('media-button-icon', 'media-fullscreen-button-enter-icon')} />
      <Minimize className={cn('media-button-icon', 'media-fullscreen-button-exit-icon')} />
    </FullscreenButtonPrimitive>
  );
}

/** One list page: a sand card under the wheel's centre, with a back key and radio rows. */
function OptionPanel({
  title,
  options,
  value,
  onSelect,
  onBack,
}: {
  title: string;
  options: readonly PanelOption[];
  value: string;
  onSelect: (option: PanelOption) => void;
  onBack: () => void;
}) {
  return (
    <div className={'vo-option-panel'}>
      <div className={'vo-option-head'}>
        <button type="button" className={'vo-option-back'} onClick={onBack} aria-label={'Back'}>
          <ChevronRight />
        </button>
        <span className={'vo-option-title'}>{title}</span>
      </div>

      {options.length > 0 ? (
        <div className={'vo-option-list'} role="menu" aria-label={title}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              className={'vo-option-row'}
              disabled={option.disabled}
              onClick={() => onSelect(option)}
            >
              <span className={'vo-option-label'}>{option.label}</span>
              <Check className={'vo-option-check'} />
            </button>
          ))}
        </div>
      ) : (
        <p className={'vo-option-empty'}>Nothing to choose for this video.</p>
      )}
    </div>
  );
}

/**
 * The settings key, rewritten as a circular command menu: one tap blooms six
 * round keys out of the centre of the picture — Audio, Quality, Captions,
 * Speed, Mute, Fullscreen. The first four open a list page; the last two act
 * on the player immediately. Escape steps back one level, then closes.
 */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<PanelId | null>(null);

  // These read the player's own feature state; each returns null when the video
  // does not expose that feature, and the page then says there is nothing to pick.
  const audio = useAudioTrackOptions();
  const quality = useQualityOptions();
  const captions = useCaptionsOptions();
  const rate = usePlaybackRateOptions();

  const openPage = (id: PanelId) => setPanel(id);

  const pages: Record<PanelId, { title: string; options: readonly PanelOption[]; value: string; setValue?: (value: string) => void }> = {
    audio: {
      title: audio?.label || audioText.text,
      options: audio?.options ?? [],
      value: audio?.value ?? '',
      setValue: audio?.setValue,
    },
    quality: {
      title: quality?.label || qualityText.text,
      options: quality?.options ?? [],
      value: quality?.value ?? '',
      setValue: quality?.setValue,
    },
    captions: {
      title: captions?.label || captionsText.text,
      options: captions?.options ?? [],
      value: captions?.value ?? '',
      setValue: captions?.setValue,
    },
    speed: {
      title: rate?.label || speedText.text,
      options: rate?.options ?? [],
      value: rate?.value ?? '',
      setValue: rate?.setValue,
    },
  };

  const items: CommandItem[] = [
    {
      id: 'audio',
      icon: <AudioLines />,
      label: pages.audio.title,
      onClick: () => openPage('audio'),
      dismiss: false,
    },
    {
      id: 'quality',
      icon: <Film />,
      label: pages.quality.title,
      onClick: () => openPage('quality'),
      dismiss: false,
    },
    {
      id: 'captions',
      icon: <Captions />,
      label: pages.captions.title,
      onClick: () => openPage('captions'),
      dismiss: false,
    },
    {
      id: 'speed',
      icon: <Gauge />,
      label: pages.speed.title,
      onClick: () => openPage('speed'),
      dismiss: false,
    },
    { id: 'mute', label: 'Mute', control: <MuteKey /> },
    { id: 'fullscreen', label: 'Fullscreen', control: <FullscreenKey /> },
  ];

  const page = panel ? pages[panel] : null;

  return (
    <CircularCommandMenu
      items={items}
      trigger={<></>}
      triggerClassName={'vo-cube'}
      triggerLabel={settingsText.text}
      centerLabel={'Close settings'}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPanel(null);
      }}
      onBack={() => setPanel(null)}
      panelKey={panel ?? 'ring'}
      resolveContainer={resolvePlayer}
      panel={
        page ? (
          <OptionPanel
            title={page.title}
            options={page.options}
            value={page.value}
            onSelect={(option) => {
              page.setValue?.(option.value);
              setOpen(false);
              setPanel(null);
            }}
            onBack={() => setPanel(null)}
          />
        ) : undefined
      }
    />
  );
}
