/** @jsxImportSource react */

import { useEffect } from 'react';

/**
 * The skin reads the picture.
 *
 * A tiny offscreen canvas gets the current frame a few times a second, the
 * pixels are binned by hue (weighted by how bright and how colourful they
 * are), and the winning cluster becomes the skin's accent. Everything the
 * glass tints — the rim, the drift inside it, the timeline fill, the menu
 * pill — is driven off it, so the player quietly matches the film.
 *
 * It lives inside the skin, so it works on any site that drops the player in;
 * no app code, no props. Two rules keep it honest:
 *
 * - Cross-origin video needs `crossorigin="anonymous"` and a CORS header, or
 *   the canvas is tainted and `getImageData` throws. That case is caught and
 *   the palette is simply switched off, leaving the white glass.
 * - Colour only comes from a frame with actual colour. Greyscale footage
 *   leaves the default glass in place rather than inventing a hue.
 */

const SAMPLE_INTERVAL = 1200;
const WIDTH = 24;
const HEIGHT = 14;

interface Bin {
  weight: number;
  r: number;
  g: number;
  b: number;
}

function toHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (!delta) return [0, 0, lightness];
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue *= 60;
  if (hue < 0) hue += 360;
  return [hue, saturation, lightness];
}

function readPalette(context: CanvasRenderingContext2D): string | null {
  const { data } = context.getImageData(0, 0, WIDTH, HEIGHT);
  const bins: Bin[] = Array.from({ length: 24 }, () => ({ weight: 0, r: 0, g: 0, b: 0 }));

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const value = max;
    const delta = max - min;
    const saturation = max === 0 ? 0 : delta / max;

    // Near-black and near-white pixels carry no hue worth using.
    if (value < 0.12) continue;
    if (saturation < 0.14) continue;

    let hue = 0;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;

    const bin = bins[Math.min(23, Math.floor(hue / 15))];
    const weight = value * (0.35 + saturation);
    bin.weight += weight;
    bin.r += r * weight;
    bin.g += g * weight;
    bin.b += b * weight;
  }

  const total = bins.reduce((sum, bin) => sum + bin.weight, 0);
  if (total < 1.2) return null;

  const winner = bins.reduce((best, bin) => (bin.weight > best.weight ? bin : best), bins[0]);
  if (winner.weight / total < 0.22) return null;

  const [hue, saturation] = toHsl(
    winner.r / winner.weight,
    winner.g / winner.weight,
    winner.b / winner.weight,
  );

  if (saturation < 0.1) return null;

  // Keep the hue, but normalise the rest: the skin needs a colour that can be
  // read at 12% opacity over bright and dark footage alike.
  return `${Math.round(hue)} ${Math.round(Math.min(92, Math.max(58, saturation * 100)))}%`;
}

function apply(root: HTMLElement, hueAndSaturation: string | null) {
  if (!hueAndSaturation) {
    for (const name of ['--vo-accent', '--vo-tint', '--vo-rim', '--vo-water', '--vo-glow']) {
      root.style.removeProperty(name);
    }
    return;
  }

  const hsl = (lightness: number, alpha = 1) =>
    `hsl(${hueAndSaturation} ${lightness}% / ${alpha})`;

  root.style.setProperty('--vo-accent', hsl(66));
  root.style.setProperty('--vo-tint', hsl(13, 0.2));
  root.style.setProperty('--vo-rim', hsl(92, 0.34));
  root.style.setProperty('--vo-water', hsl(84, 0.26));
  root.style.setProperty('--vo-glow', hsl(88, 0.22));
}

export function VideoPalette() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.ko-skin');
    const video = root?.querySelector('video');
    if (!root || !video) return;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    let last = 0;
    let frame = 0;
    let dead = false;

    const sample = () => {
      if (dead || document.hidden) return;
      if (video.readyState < 2 || video.paused) return;
      try {
        context.drawImage(video, 0, 0, WIDTH, HEIGHT);
        apply(root, readPalette(context));
      } catch {
        // A tainted canvas can never be read; stop trying.
        dead = true;
        cancelAnimationFrame(frame);
      }
    };

    const loop = (now: number) => {
      if (now - last >= SAMPLE_INTERVAL) {
        last = now;
        sample();
      }
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    video.addEventListener('seeked', sample);

    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener('seeked', sample);
    };
  }, []);

  return null;
}
