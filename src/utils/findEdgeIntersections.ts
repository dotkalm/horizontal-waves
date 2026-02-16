import type { EdgePath, Intersection } from '~/types';

/**
 * Find all intersections between edge path segments and evenly-spaced horizontal lines.
 *
 * Uses direct index calculation to determine which horizontal lines a segment
 * can cross, avoiding linear scan of all lines. Each crossing is computed in O(1).
 *
 * Total complexity: O(P) where P = total points across all edge paths,
 * since each consecutive pair yields at most a small constant number of crossings
 * (bounded by the segment's vertical span / spacing).
 */
export function findEdgeIntersections(
  edgePaths: EdgePath[],
  pathCount: number,
  spacing: number,
): Intersection[] {
  const intersections: Intersection[] = [];

  for (let p = 0; p < edgePaths.length; p++) {
    const { points } = edgePaths[p];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dy = p2.y - p1.y;
      if (dy === 0) continue; // Segment parallel to horizontal lines

      const yMin = dy > 0 ? p1.y : p2.y;
      const yMax = dy > 0 ? p2.y : p1.y;

      // Horizontal line at index j is at y = spacing * (j + 1).
      // Solve: spacing * (j + 1) >= yMin  →  j >= yMin/spacing - 1
      // Solve: spacing * (j + 1) <= yMax  →  j <= yMax/spacing - 1
      const jMin = Math.max(0, Math.ceil(yMin / spacing - 1));
      const jMax = Math.min(pathCount - 1, Math.floor(yMax / spacing - 1));

      for (let j = jMin; j <= jMax; j++) {
        const lineY = spacing * (j + 1);

        // Strict inequality — skip if segment only touches the line at an endpoint
        if (lineY <= yMin || lineY >= yMax) continue;

        const t = (lineY - p1.y) / dy;
        const crossX = p1.x + t * (p2.x - p1.x);

        intersections.push({ pathIndex: j, x: crossX });
      }
    }
  }

  return intersections;
}
