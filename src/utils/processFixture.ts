import type { Point } from '~/types';
import { extractEdgePaths } from './extractEdgePaths';
import { scaleEdgePaths } from './scaleEdgePaths';
import { findEdgeIntersections } from './findEdgeIntersections';
import { applyIntersections } from './applyIntersections';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const EDGE_THRESHOLD = 50;
const MIN_PATH_LENGTH = 5;

/**
 * Convert a serialized Uint8Array object (numeric string keys) to a real Uint8Array.
 */
function toUint8Array(obj: Record<string, number>): Uint8Array {
  const keys = Object.keys(obj);
  const arr = new Uint8Array(keys.length);
  for (let i = 0; i < keys.length; i++) {
    arr[i] = obj[i];
  }
  return arr;
}

/**
 * Full pipeline: fixture data → edge extraction → scale → intersect → apply to pathArray.
 */
export function processFixtureData(
  fixtureData: Record<string, number>,
  pathArray: Point[][],
  viewboxWidth: number,
  viewboxHeight: number,
  pathCount: number,
  spacing: number,
): Point[][] {
  const data = toUint8Array(fixtureData);
  const edgePaths = extractEdgePaths(data, CANVAS_WIDTH, CANVAS_HEIGHT, EDGE_THRESHOLD, MIN_PATH_LENGTH);
  const scaled = scaleEdgePaths(edgePaths, CANVAS_WIDTH, CANVAS_HEIGHT, viewboxWidth, viewboxHeight);
  const intersections = findEdgeIntersections(scaled, pathCount, spacing);
  return applyIntersections(pathArray, intersections);
}
