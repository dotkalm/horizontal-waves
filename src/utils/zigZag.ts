import { type TZigZagPath } from '~/types';
import { zigZagSegment } from './zigZagSegment';

export const zigZagPath: TZigZagPath = (points, ridges, size) => {
  if (points.length < 2) return '';

  const { x: startX, y: startY } = points[0];
  let d = `M ${startX} ${startY} `;

  for (let i = 0; i < points.length - 1; i++) {
    d += zigZagSegment(points[i], points[i + 1], ridges, size);
  }

  return d;
}
