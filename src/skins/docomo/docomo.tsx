/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';

/**
 * Docomo — the seek bar, reinvented.
 *
 * The timeline is a staircase of 12 steps rising left to right.
 * A squashy blue ball hops up the steps as the video plays and
 * squashes flat when paused. The steps behind the ball are filled
 * blue, the steps ahead stay faint white.
 *
 * This is decoration only (aria-hidden, pointer-events none).
 * The real slider underneath stays fully keyboard operable —
 * the ball just shows where its thumb is.
 */
const STEPS = 12;

export function Docomo() {
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const duration = usePlayer((s) => s.duration) ?? 0;
  const paused = usePlayer((s) => s.paused) ?? true;

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const currentStep = Math.min(STEPS - 1, Math.floor(progress * STEPS));
  const stepHeight = (i: number) => 6 + (i * 34) / (STEPS - 1);

  return (
    <div className="hop-steps" aria-hidden="true">
      {Array.from({ length: STEPS }, (_, i) => (
        <span
          key={i}
          className="hop-step"
          data-filled={i <= currentStep || undefined}
          style={{ height: `${stepHeight(i)}px` }}
        />
      ))}
      <span
        className="hop-ball"
        data-paused={paused || undefined}
        style={{ left: `${progress * 100}%`, bottom: `${stepHeight(currentStep)}px` }}
      >
        <span className="hop-ball-inner" />
      </span>
    </div>
  );
}
