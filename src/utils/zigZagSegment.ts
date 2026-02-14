import type { TZigZagSegment } from '~/types';
import { BEZIER_APPROXIMATION_FACTOR } from '~/constants';

/**
 * Attempt to approximate a sine wave between two points using cubic beziers.
 * Each "ridge" is one full sine cycle (up + down), split into two half-cycles,
 * each half-cycle rendered as a cubic bezier curve.
 */

/**
 * Takes an array of points and applies the zigzag to every segment.
 * Each segment gets `ridges` full sine cycles independently.
 *
 * points.length = 2  →  ridges total
 * points.length = 3  →  ridges * 2 total
 * points.length = n  →  ridges * (n-1) total
 */

export const zigZagSegment: TZigZagSegment = (p0, p1, ridges, size) => {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  // unit tangent (along the segment)
  const tx = dx / len;
  const ty = dy / len;

  // unit normal (perpendicular to segment)
  const nx = -ty;
  const ny = tx;

  // each ridge = 1 full sine cycle = 2 half-cycles
  // each half-cycle = 1 cubic bezier curve
  const totalHalves = ridges * 2;
  const stepLen = len / totalHalves;

  // bezier approximation factor for a smooth half-sine curve
  const k = BEZIER_APPROXIMATION_FACTOR * stepLen;

  let d = '';
  let cx = p0.x;
  let cy = p0.y;

  for (let i = 0; i < totalHalves; i++) {
    const sign = i % 2 === 0 ? 1 : -1;

    // endpoint of this half-cycle
    const ex = cx + tx * stepLen;
    const ey = cy + ty * stepLen;

    // control point 1: offset from current point
    const c1x = cx + tx * k + nx * sign * size;
    const c1y = cy + ty * k + ny * sign * size;

    // control point 2: offset from end point (mirrored)
    const c2x = ex - tx * k + nx * sign * size;
    const c2y = ey - ty * k + ny * sign * size;

    d += `C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey} `;

    cx = ex;
    cy = ey;
  }

  return d;
}