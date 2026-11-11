/** @jsxImportSource react */

/**
 * The liquid-glass filter, taken from the `LiquidButton` glass:
 *
 *   feTurbulence (fractalNoise, 0.05, 1 octave, seed 1)
 *   → feGaussianBlur 2  (noise becomes a soft height field)
 *   → feDisplacementMap scale 70, R → X, B → Y
 *   → feGaussianBlur 4  (the glass softens what it bends)
 *   → feComposite over
 *
 * Two rules decide whether it reads as glass or turns to mush, both documented
 * on MDN:
 *
 * - `colorInterpolationFilters="sRGB"`. SVG filters work in `linearRGB` by
 *   default, which washes the picture out; `sRGB` keeps its colour and contrast.
 * - The CSS has to reach this through `backdrop-filter`, never through `filter`.
 *   An element with `filter` becomes its own backdrop root, so its backdrop is
 *   cut off and the displacement runs on an empty box.
 *
 * Render it once (in the skin); the CSS refers to it by id.
 */
export const GLASS_FILTER_ID = 'glass-distortion';

export function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter
          id={GLASS_FILTER_ID}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves={1} seed={1} result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation={2} result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale={70}
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation={4} result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
