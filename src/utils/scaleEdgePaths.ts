import type { EdgePath } from '~/types';

/**
 * Scale edge path coordinates from canvas pixel space to SVG viewbox space.
 * Uses uniform scaling (preserves aspect ratio) and centers the result.
 * Flips Y axis (WebGL origin is bottom-left, SVG is top-left).
 */
export function scaleEdgePaths(
  paths: EdgePath[],
  canvasWidth: number,
  canvasHeight: number,
  viewboxWidth: number,
  viewboxHeight: number,
): EdgePath[] {
  const sourceAspect = canvasWidth / canvasHeight;
  const targetAspect = viewboxWidth / viewboxHeight;

  let scale: number;
  let offsetX: number;
  let offsetY: number;

  if (targetAspect > sourceAspect) {
    // Viewbox is wider — fit to height, center horizontally
    scale = viewboxHeight / canvasHeight;
    offsetX = (viewboxWidth - canvasWidth * scale) / 2;
    offsetY = 0;
  } else {
    // Viewbox is taller — fit to width, center vertically
    scale = viewboxWidth / canvasWidth;
    offsetX = 0;
    offsetY = (viewboxHeight - canvasHeight * scale) / 2;
  }

  return paths.map(path => ({
    intensity: path.intensity,
    intensities: path.intensities,
    points: path.points.map(p => ({
      x: p.x * scale + offsetX,
      y: (canvasHeight - p.y) * scale + offsetY,
      intensity: p.intensity,
    })),
  }));
}
