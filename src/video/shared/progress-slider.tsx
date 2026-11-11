/** @jsxImportSource react */

import { useEffect, useRef, useState } from 'react';

import { Slider } from '@/components/ui/slider';

/**
 * The timeline: the custom slider, driven by the video element's own
 * `currentTime` and `duration`. Dragging seeks as it moves, so scrubbing
 * feels like the picture is under the finger; the value follows playback
 * while it plays, and every other way of seeking (keys, the wheel, a resume)
 * lands here too because it all goes through the element.
 */
function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

export function ProgressSlider() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('.ko-skin video');
    if (!video) return;

    videoRef.current = video;

    const sync = () => {
      const length = Number.isFinite(video.duration) ? video.duration : 0;
      setTime((current) => (current === video.currentTime ? current : video.currentTime));
      setDuration((current) => (current === length ? current : length));
    };

    // `timeupdate` only fires a few times a second, so playback is followed
    // from a frame loop as well — a beat slower than the screen, so the
    // thumb's spring has room to smooth the steps.
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last < 90) return;
      last = now;
      if (!video.paused) sync();
    };

    sync();
    video.addEventListener('timeupdate', sync);
    video.addEventListener('durationchange', sync);
    video.addEventListener('loadedmetadata', sync);
    video.addEventListener('seeking', sync);
    video.addEventListener('seeked', sync);
    video.addEventListener('emptied', sync);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener('timeupdate', sync);
      video.removeEventListener('durationchange', sync);
      video.removeEventListener('loadedmetadata', sync);
      video.removeEventListener('seeking', sync);
      video.removeEventListener('seeked', sync);
      video.removeEventListener('emptied', sync);
    };
  }, []);

  const max = duration > 0 ? duration : 1;

  const seek = (next: number) => {
    const clamped = Math.min(max, Math.max(0, next));
    setTime(clamped);
    const video = videoRef.current;
    if (video) video.currentTime = clamped;
  };

  return (
    <Slider
      className={'vo-seek'}
      label="Seek"
      header={false}
      showValue={false}
      min={0}
      max={max}
      step={0.1}
      largeStep={10}
      value={Math.min(time, max)}
      format={formatTime}
      disabled={duration <= 0}
      onValueChange={seek}
    />
  );
}
