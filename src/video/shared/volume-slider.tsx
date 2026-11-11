/** @jsxImportSource react */

import { useEffect, useRef, useState } from 'react';

import { Slider } from '@/components/ui/slider';

/**
 * The volume fader: the custom slider on a short rail next to the mute key.
 * It reads and writes the video element's own volume, so the mute key, the
 * wheel, the keyboard and the fader can never disagree.
 */
export function VolumeSlider() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    videoRef.current = video;

    const sync = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    sync();
    video.addEventListener('volumechange', sync);

    return () => video.removeEventListener('volumechange', sync);
  }, []);

  const change = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next));

    setVolume(clamped);
    setMuted(clamped === 0 ? muted : false);

    const video = videoRef.current;
    if (!video) return;
    if (clamped > 0 && video.muted) video.muted = false;
    video.volume = clamped;
  };

  return (
    <Slider
      className={'vo-fader'}
      label="Volume"
      header={false}
      showValue={false}
      min={0}
      max={1}
      step={0.01}
      largeStep={0.1}
      value={muted ? 0 : volume}
      format={(value) => `${Math.round(value * 100)}%`}
      onValueChange={change}
    />
  );
}
