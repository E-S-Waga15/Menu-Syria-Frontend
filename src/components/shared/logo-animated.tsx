"use client";

import { useEffect, useState } from "react";

import { BODY_PATHS, ACCENT_PATH } from "@/components/shared/logo-mark";
import { cn } from "@/lib/utils";

/**
 * The mark draws itself, then lands as a solid shape.
 *
 * The stroke layer traces BODY_PATHS/ACCENT_PATH exactly as authored — no
 * re-splitting or reordering — so the drawn outline is the real logo contour,
 * the same geometry the fill layer lands on.
 *
 * Always plays, regardless of the visitor's OS-level reduced-motion setting —
 * this is a one-time brand moment on the auth screen, not a repeating or
 * content-bearing animation, so it's played by deliberate choice.
 */

/**
 * The outline is one closed contour, and the artwork authors it starting at the
 * arrow tip — so tracing it head-to-tail draws the arrowhead first and finishes
 * on the circle, which is backwards.
 *
 * Read as a drawing instead of as a contour, the mark is a single ribbon: it
 * opens with a flat cap at the mouth of the bubble, sweeps counter-clockwise
 * around the circle, and closes as the arrowhead. So both edges of that ribbon
 * are traced at once, away from the cap and around to the tip: the inner edge
 * runs backwards along the contour (SEAM -> 0), the outer edge forwards
 * (SEAM -> TRACE_LENGTH). Same duration for both, so the two pens stay radially
 * across from each other the whole way and meet on the arrow tip together.
 *
 * Neither pen is a sub-path — both elements carry the whole outline and reveal
 * their share of it with stroke-dasharray, so the geometry stays untouched.
 */

const OUTLINE = BODY_PATHS[0];
const BARS = BODY_PATHS.slice(1);

/** every traced path is normalised to this length, so dash values read as ‰ */
const TRACE_LENGTH = 1000;
/**
 * Where the ribbon's open cap sits along OUTLINE, in TRACE_LENGTH units.
 * Measured off the contour, not guessed: it is the corner at (320.8, 88.7),
 * the inner lip of the bubble's mouth. Re-measure if the artwork is retraced.
 */
const SEAM = 451;

/** how long the two pens take to close the outline on the arrow tip */
const OUTLINE_DURATION = 3400;
/** the menu bars then draw one after the other, top to bottom */
const BAR_DURATION = 350;

const DRAW_END = OUTLINE_DURATION + BARS.length * BAR_DURATION;

export function LogoAnimated({
  /** localized brand name rendered under the mark; omit to show the mark only */
  brand,
  /** rendered height of the mark in px */
  size = 100,
  className,
}: {
  brand?: string;
  size?: number;
  className?: string;
}) {
  // always starts unsettled, matching the server-rendered markup exactly
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSettled(true), DRAW_END);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <style href="ms-logo-animated" precedence="default">
        {CSS}
      </style>

      <div
        className="relative"
        style={{ width: (size * 493) / 617, height: size }}
        role="img"
        aria-label={brand}
      >
        {/* the pen: strokes the contour */}
        <svg
          viewBox="0 0 493 617"
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-300 ease-smooth",
            settled ? "opacity-0" : "opacity-100",
          )}
          aria-hidden
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* inner edge of the ribbon — cap to arrow tip, against the contour */}
            <path
              d={OUTLINE}
              pathLength={TRACE_LENGTH}
              strokeWidth={9}
              className="ms-logo-trace ms-logo-trace-inner"
            />
            {/* outer edge of the ribbon — cap to arrow tip, along the contour */}
            <path
              d={OUTLINE}
              pathLength={TRACE_LENGTH}
              strokeWidth={9}
              className="ms-logo-trace ms-logo-trace-outer"
            />

            {BARS.map((d, i) => (
              <path
                key={d.slice(0, 24)}
                d={d}
                pathLength={TRACE_LENGTH}
                strokeWidth={7}
                className="ms-logo-draw"
                style={{
                  animationDelay: `${OUTLINE_DURATION + i * BAR_DURATION}ms`,
                  animationDuration: `${BAR_DURATION}ms`,
                }}
              />
            ))}
          </g>
        </svg>

        {/* the ink: the solid mark lands */}
        <svg
          viewBox="0 0 493 617"
          className={cn("absolute inset-0 size-full", settled ? "ms-logo-land" : "opacity-0")}
          aria-hidden
        >
          <g fill="currentColor">
            {BODY_PATHS.map((d) => (
              <path key={d.slice(0, 24)} d={d} />
            ))}
          </g>
          {/* drop this path for an all-white mark */}
          <path d={ACCENT_PATH} fill="#FB8F02" />
        </svg>
      </div>

      {brand && settled && (
        <p className="ms-logo-title font-heading text-2xl font-bold">{brand}</p>
      )}
    </div>
  );
}

/**
 * Both pens use a two-value dash pattern: one dash the length of what has been
 * drawn so far, then a gap long enough that the pattern never repeats within
 * the path. stroke-dashoffset places that dash — the offset is negative because
 * it shifts the pattern origin forward along the path, so `-SEAM` anchors the
 * dash at the cap. The outer pen holds that anchor and grows the dash forward;
 * the inner pen grows the dash while walking the anchor back to 0, which makes
 * it read as drawing backwards from the cap. Both land on the tip at the same
 * instant: SEAM + (TRACE_LENGTH - SEAM) covers the contour exactly once.
 */
const CSS = `
.ms-logo-trace {
  stroke-dasharray: 0 ${TRACE_LENGTH};
  stroke-dashoffset: ${-SEAM};
  animation-duration: ${OUTLINE_DURATION}ms;
  animation-timing-function: cubic-bezier(0.5, 0.05, 0.25, 1);
  animation-fill-mode: forwards;
}

.ms-logo-trace-inner { animation-name: ms-logo-trace-inner; }
@keyframes ms-logo-trace-inner {
  from { stroke-dasharray: 0 ${TRACE_LENGTH};    stroke-dashoffset: ${-SEAM}; }
  to   { stroke-dasharray: ${SEAM} ${TRACE_LENGTH}; stroke-dashoffset: 0; }
}

.ms-logo-trace-outer { animation-name: ms-logo-trace-outer; }
@keyframes ms-logo-trace-outer {
  from { stroke-dasharray: 0 ${TRACE_LENGTH}; }
  to   { stroke-dasharray: ${TRACE_LENGTH - SEAM} ${TRACE_LENGTH}; }
}

.ms-logo-draw {
  stroke-dasharray: ${TRACE_LENGTH};
  stroke-dashoffset: ${TRACE_LENGTH};
  animation-name: ms-logo-draw-in;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}
@keyframes ms-logo-draw-in {
  to { stroke-dashoffset: 0; }
}

.ms-logo-land {
  opacity: 0;
  animation: ms-logo-land-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes ms-logo-land-in {
  0%   { opacity: 0; scale: 0.8; translate: 0 5px; }
  50%  { opacity: 0.75; scale: 1.05; translate: 0 -2px; }
  100% { opacity: 1; scale: 1; translate: 0 0; }
}

.ms-logo-title {
  opacity: 0;
  animation: ms-logo-title-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards;
}
@keyframes ms-logo-title-in {
  0%   { opacity: 0; translate: 0 10px; filter: blur(4px); }
  100% { opacity: 1; translate: 0 0; filter: blur(0); }
}
`;
