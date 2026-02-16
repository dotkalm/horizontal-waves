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
  // Read pixels from default framebuffer (after processFrame rendered to screen)
  const pixels = new Uint8Array(canvasWidth * canvasHeight * 4);
  gl.readPixels(0, 0, canvasWidth, canvasHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  // Extract edge paths from pixel data
  const edgePaths = extractEdgePaths(pixels, canvasWidth, canvasHeight, EDGE_THRESHOLD, MIN_PATH_LENGTH);

  // Simplify paths with RDP to reduce point count
  const simplified: EdgePath[] = edgePaths.map(path => ({
    ...path,
    points: simplifyPath(path.points, SIMPLIFICATION_EPSILON),
  }));

  // Scale from canvas pixel space → viewbox coordinate space (with Y-flip)
  const scaled = scaleEdgePaths(simplified, canvasWidth, canvasHeight, viewboxWidth, viewboxHeight);

  // Find intersections with horizontal reference lines
  const intersections = findEdgeIntersections(scaled, pathCount, spacing);

  // Merge intersections into the base path array
  return applyIntersections(basePathArray, intersections);
}
