/**
 * The motion settings the slider shares: springs written the way both the
 * drag handling and the running animations understand them, plus the few
 * durations, easings and blur amounts the choreography refers to.
 */

export const motionTokens = {
  spring: {
    /** The thumb settling onto a step. */
    snappy: { visualDuration: 0.22, bounce: 0.18 },
    /** Columns of a number opening and closing. */
    morph: { visualDuration: 0.3, bounce: 0.24 },
    /** Leaving pieces, which may shrink but never overshoot. */
    smooth: { visualDuration: 0.36, bounce: 0 },
  },
  duration: {
    instant: 0.1,
    fast: 0.16,
  },
  ease: {
    enter: [0.22, 1, 0.36, 1],
    standard: [0.4, 0, 0.2, 1],
  },
  blur: {
    subtle: 2,
    soft: 4,
  },
} as const;

export type MotionTokens = typeof motionTokens;
