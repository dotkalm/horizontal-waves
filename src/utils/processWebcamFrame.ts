import type { Point, EdgePath } from '~/types';
import { extractEdgePaths } from './extractEdgePaths';
import { simplifyPath } from './simplifyPath';
import { scaleEdgePaths } from './scaleEdgePaths';
import { findEdgeIntersections } from './findEdgeIntersections';
import { applyIntersections } from './applyIntersections';

const EDGE_THRESHOLD = 50;
const MIN_PATH_LENGTH = 20;
const SIMPLIFICATION_EPSILON = 3.5;

/**
 * Extract scaled edge paths from the current WebGL framebuffer.
 * Returns EdgePath[] in viewbox coordinate space — independent of
 * path count, spacing, or any intersection logic.
 */
export function extractScaledEdgePaths(
  gl: WebGLRenderingContext,
  canvasWidth: number,
  canvasHeight: number,
  viewboxWidth: number,
  viewboxHeight: number,
): EdgePath[] {
  const pixels = new Uint8Array(canvasWidth * canvasHeight * 4);
  gl.readPixels(0, 0, canvasWidth, canvasHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  const edgePaths = extractEdgePaths(pixels, canvasWidth, canvasHeight, EDGE_THRESHOLD, MIN_PATH_LENGTH);

  const simplified: EdgePath[] = edgePaths.map(path => ({
    ...path,
    points: simplifyPath(path.points, SIMPLIFICATION_EPSILON),
  }));

  return scaleEdgePaths(simplified, canvasWidth, canvasHeight, viewboxWidth, viewboxHeight);
}

/**
 * Apply edge paths to a base path array by computing intersections.
 */
export function applyEdgePaths(
  edgePaths: EdgePath[],
  basePathArray: Point[][],
  pathCount: number,
  spacing: number,
): Point[][] {
  const intersections = findEdgeIntersections(edgePaths, pathCount, spacing);
  return applyIntersections(basePathArray, intersections);
}

/**
 * Per-frame pipeline: readPixels → extract edges → simplify → scale → intersect → apply.
 * Each frame is a fresh snapshot against basePathArray (not accumulative).
 */
export function processWebcamFrame(
  gl: WebGLRenderingContext,
  basePathArray: Point[][],
  canvasWidth: number,
  canvasHeight: number,
  viewboxWidth: number,
  viewboxHeight: number,
  pathCount: number,
  spacing: number,
): Point[][] {
  const scaled = extractScaledEdgePaths(gl, canvasWidth, canvasHeight, viewboxWidth, viewboxHeight);
  return applyEdgePaths(scaled, basePathArray, pathCount, spacing);
}
