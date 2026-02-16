import type { Point, Intersection } from '~/types';

/**
 * Batch-apply intersections into a pathArray.
 *
 * Groups intersections by path index, sorts by x within each group,
 * then merges into the existing points array in a single pass per path.
 *
 * Complexity: O(N log N) for sorting intersections + O(P + N) for merging,
 * where N = number of intersections, P = total existing points.
 */
export function applyIntersections(
  pathArray: Point[][],
  intersections: Intersection[],
): Point[][] {
  if (intersections.length === 0) return pathArray;

  // Group intersections by path index
  const groups = new Map<number, number[]>();
  for (let i = 0; i < intersections.length; i++) {
    const { pathIndex, x } = intersections[i];
    let arr = groups.get(pathIndex);
    if (!arr) {
      arr = [];
      groups.set(pathIndex, arr);
    }
    arr.push(x);
  }

  // Build new pathArray — only clone paths that have intersections
  const result: Point[][] = new Array(pathArray.length);

  for (let i = 0; i < pathArray.length; i++) {
    const xValues = groups.get(i);
    if (!xValues) {
      result[i] = pathArray[i];
      continue;
    }

    // Sort x values for ordered insertion
    xValues.sort((a, b) => a - b);

    // Deduplicate — skip x values too close together (< 0.5 viewbox units)
    const dedupedX: number[] = [xValues[0]];
    for (let k = 1; k < xValues.length; k++) {
      if (xValues[k] - dedupedX[dedupedX.length - 1] >= 0.5) {
        dedupedX.push(xValues[k]);
      }
    }

    const existing = pathArray[i];
    const y = existing[0].y; // All points on a horizontal line share the same y
    const merged: Point[] = [];
    let xi = 0; // Index into dedupedX

    // Merge pass: walk existing points and insert new x values in sorted order
    for (let e = 0; e < existing.length; e++) {
      // Insert any new x values that come before the next existing point
      while (xi < dedupedX.length && dedupedX[xi] < existing[e].x) {
        merged.push({ x: dedupedX[xi], y });
        xi++;
      }
      merged.push(existing[e]);
    }

    // Append remaining new x values after the last existing point
    while (xi < dedupedX.length) {
      merged.push({ x: dedupedX[xi], y });
      xi++;
    }

    result[i] = merged;
  }

  return result;
}
