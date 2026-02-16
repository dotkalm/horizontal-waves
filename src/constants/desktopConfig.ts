import type { Point } from '~/types';

export const BEZIER_APPROXIMATION_FACTOR = 0.3642;

export const VIEWBOX_WIDTH = 1440;

export const VIEWBOX_HEIGHT = 800;

export const PATH_COUNT = 400;

export const INITIAL_PATH_ARRAY: Point[][] = Array.from({ length: PATH_COUNT }).map((_,i) => {
  const spacing = VIEWBOX_HEIGHT / (PATH_COUNT + 1);
  const y = spacing * (i + 1);
  return [{ x: 0, y }, { x: VIEWBOX_WIDTH, y }];
});

export const RIDGES_BETWEEN_POINTS = 5;

export const RIDGE_HEIGHT = 1;

export const DESKTOP_CONFIG = {
  INITIAL_PATH_ARRAY,
  RIDGES_BETWEEN_POINTS,
  RIDGE_HEIGHT,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
};

