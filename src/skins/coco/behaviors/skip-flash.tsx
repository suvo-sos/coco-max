/** @jsxImportSource react */

import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/resolve-class-name';

/** How long the skip effect stays after the last click, in milliseconds. */
const SHOW_MS = 900;
/** Clicks closer together than this, in the same direction, add up (10s, 20s, 30s...). */
const ACCUMULATE_MS = 1000;

/** The event right-drag-seek.tsx dispatches on a right-click skip. */
export const SKIP_EVENT = 'hop:skip';

export type SkipDirection = 'forward' | 'back';

export interface SkipEventDetail {
  direction: SkipDirection;
}

/**
 * YouTube-style skip effect: when a right-click skip happens, a
 * dark circle with chevrons and the seconds pops up on the side
 * it skipped towards. Clicks in quick succession in the same
 * direction add up — 10s, then 20s, then 30s — just like
 * YouTube's double-tap. The seek itself happens in
 * right-drag-seek.tsx; this only shows the effect, driven by the
 * `hop:skip` event it dispatches.
 */
export function VideoSkipFlash() {
  const [flash, setFlash] = useState<{ direction: SkipDirection; total: number; key: number } | null>(null);
  const keyRef = useRef(0);
  const totalRef = useRef(0);
  const lastRef = useRef<{ direction: SkipDirection; at: number } | null>(null);
  const hideRef = useRef(0);

  useEffect(() => {
    const onSkip = (event: Event) => {
      const { direction } = (event as CustomEvent<SkipEventDetail>).detail;
      const now = Date.now();
      const last = lastRef.current;
      const total =
        last && last.direction === direction && now - last.at < ACCUMULATE_MS ? totalRef.current + 10 : 10;
      totalRef.current = total;
      lastRef.current = { direction, at: now };
      setFlash({ direction, total, key: ++keyRef.current });
      window.clearTimeout(hideRef.current);
      hideRef.current = window.setTimeout(() => setFlash(null), SHOW_MS);
    };

    window.addEventListener(SKIP_EVENT, onSkip);
    return () => {
      window.removeEventListener(SKIP_EVENT, onSkip);
      window.clearTimeout(hideRef.current);
    };
  }, []);

  if (!flash) return null;

  return (
    <div
      className={cn(
        'hop-skip-flash',
        flash.direction === 'back' ? 'hop-skip-flash-back' : 'hop-skip-flash-forward'
      )}
      aria-hidden="true"
    >
      <div className="hop-skip-flash-circle" key={flash.key}>
        <span className="hop-skip-flash-chevrons">
          <ChevronRight className={'hop-skip-flash-chevron'} />
          <ChevronRight className={'hop-skip-flash-chevron'} />
        </span>
        <span className="hop-skip-flash-seconds">{flash.total}s</span>
      </div>
    </div>
  );
}
