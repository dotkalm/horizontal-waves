import type { Point } from '~/types';

export function findNewIndex(points: Point[], x: number) {
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i + 1].x) {
      return i;
    }
  }
  return -1;
}

export function findPath(pathArray: Point[][], prevSvgPoint: Point, svgPoint: Point, spacing: number): {
  verticalIndex: number;
  horizontalIndex: number;
} | null {
  const minY = Math.min(prevSvgPoint.y, svgPoint.y);
  const maxY = Math.max(prevSvgPoint.y, svgPoint.y);

  for (let i = 0; i < pathArray.length; i++) {
    const pathY = spacing * (i + 1);
    if (pathY >= minY && pathY <= maxY) {
      const t = (pathY - prevSvgPoint.y) / (svgPoint.y - prevSvgPoint.y);
      const crossX = prevSvgPoint.x + t * (svgPoint.x - prevSvgPoint.x);
      const path = pathArray[i];
      const horizontalIndex = findNewIndex(path, crossX);
      return { verticalIndex: i, horizontalIndex };
    }
  }
  return null;
}
