import type { EdgePath } from '~/types';

/**
 * Scale edge path coordinates from canvas pixel space to SVG viewbox space.
 * Flips Y axis (WebGL origin is bottom-left, SVG is top-left).
 */
export function scaleEdgePaths(
  paths: EdgePath[],
  canvasWidth: number,
  canvasHeight: number,
  viewboxWidth: number,
  viewboxHeight: number,
): EdgePath[] {
  const sx = viewboxWidth / canvasWidth;
  const sy = viewboxHeight / canvasHeight;

  return paths.map(path => ({
    intensity: path.intensity,
    intensities: path.intensities,
    points: path.points.map(p => ({
      x: p.x * sx,
      y: (canvasHeight - p.y) * sy,
      intensity: p.intensity,
    })),
  }));
}
