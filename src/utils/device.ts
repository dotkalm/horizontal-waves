import { createSignal, createRoot } from 'solid-js';
import type { Point } from '~/types';
import { DESKTOP_CONSTANTS, MOBILE_CONSTANTS, MOBILE_PORTRAIT_CONSTANTS } from '~/constants';

function buildConfig(viewboxWidth: number, viewboxHeight: number, pathCount: number, ridgesBetweenPoints: number, ridgeHeight: number) {
  const VIEWBOX_WIDTH = viewboxWidth;
  const VIEWBOX_HEIGHT = viewboxHeight;
  const RIDGES_BETWEEN_POINTS = ridgesBetweenPoints;
  const RIDGE_HEIGHT = ridgeHeight;
  const INITIAL_PATH_ARRAY: Point[][] = Array.from({ length: pathCount }).map((_, i) => {
    const spacing = VIEWBOX_HEIGHT / (pathCount + 1);
    const y = spacing * (i + 1);
    return [{ x: 0, y }, { x: VIEWBOX_WIDTH, y }];
  });

  return {
    INITIAL_PATH_ARRAY, 
    RIDGES_BETWEEN_POINTS, 
    RIDGE_HEIGHT, 
    VIEWBOX_HEIGHT, 
    VIEWBOX_WIDTH,
  };
}

const DESKTOP_CONFIG = buildConfig(
  DESKTOP_CONSTANTS.VIEWBOX_WIDTH,
  DESKTOP_CONSTANTS.VIEWBOX_HEIGHT,
  DESKTOP_CONSTANTS.PATH_COUNT,
  DESKTOP_CONSTANTS.RIDGES_BETWEEN_POINTS,
  DESKTOP_CONSTANTS.RIDGE_HEIGHT,
);

const MOBILE_CONFIG = buildConfig(
  MOBILE_CONSTANTS.VIEWBOX_WIDTH,
  MOBILE_CONSTANTS.VIEWBOX_HEIGHT,
  MOBILE_CONSTANTS.PATH_COUNT,
  MOBILE_CONSTANTS.RIDGES_BETWEEN_POINTS,
  MOBILE_CONSTANTS.RIDGE_HEIGHT,
);
const MOBILE_PORTRAIT_CONFIG = buildConfig(
  MOBILE_PORTRAIT_CONSTANTS.VIEWBOX_WIDTH,
  MOBILE_PORTRAIT_CONSTANTS.VIEWBOX_HEIGHT,
  MOBILE_PORTRAIT_CONSTANTS.PATH_COUNT,
  MOBILE_PORTRAIT_CONSTANTS.RIDGES_BETWEEN_POINTS,
  MOBILE_PORTRAIT_CONSTANTS.RIDGE_HEIGHT,
);

const MOBILE_BREAKPOINT = 768;

function getConfig(width: number, height: number) {
  if (width <= MOBILE_BREAKPOINT) {
    return height > width ? MOBILE_PORTRAIT_CONFIG : MOBILE_CONFIG;
  }
  return DESKTOP_CONFIG;
}

const { deviceConfig } = createRoot(() => {
  const [deviceConfig, setDeviceConfig] = createSignal(
    getConfig(window.innerWidth, window.innerHeight)
  );

  window.addEventListener('resize', () => {
    setDeviceConfig(getConfig(window.innerWidth, window.innerHeight));
  });

  return { deviceConfig };
});

export { deviceConfig };
