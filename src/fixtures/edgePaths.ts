import type { EdgePath } from '~/types';

/**
 * Synthetic edge paths simulating webcam edge detection output.
 * Coordinates are in canvas pixel space (640x480).
 * These simulate a face-like oval + some diagonal features.
 */

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

// Oval shape (face outline) — centered at (320, 240), rx=120, ry=160
function generateOval(cx: number, cy: number, rx: number, ry: number, steps: number): EdgePath {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    points.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
      intensity: 200,
    });
  }
  return { points, intensity: 0.78, intensities: points.map(() => 200) };
}

// Diagonal line
function generateLine(x1: number, y1: number, x2: number, y2: number, steps: number): EdgePath {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
      intensity: 180,
    });
  }
  return { points, intensity: 0.71, intensities: points.map(() => 180) };
}

// Arc (eyebrow-like)
function generateArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, steps: number): EdgePath {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (i / steps) * (endAngle - startAngle);
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      intensity: 190,
    });
  }
  return { points, intensity: 0.75, intensities: points.map(() => 190) };
}

export const FIXTURE_CANVAS_WIDTH = CANVAS_WIDTH;
export const FIXTURE_CANVAS_HEIGHT = CANVAS_HEIGHT;

export const FIXTURE_EDGE_PATHS: EdgePath[] = [
  // Face oval
  generateOval(320, 240, 130, 170, 80),
  // Left eyebrow
  generateArc(270, 170, 40, Math.PI * 1.2, Math.PI * 1.8, 20),
  // Right eyebrow
  generateArc(370, 170, 40, Math.PI * 1.2, Math.PI * 1.8, 20),
  // Nose line
  generateLine(320, 200, 310, 280, 30),
  // Mouth arc
  generateArc(320, 310, 50, 0.2, Math.PI - 0.2, 25),
  // Left jaw line
  generateLine(200, 300, 240, 400, 25),
  // Right jaw line
  generateLine(440, 300, 400, 400, 25),
  // Some additional diagonal edges
  generateLine(100, 50, 180, 200, 30),
  generateLine(500, 80, 450, 250, 30),
  generateLine(80, 350, 160, 450, 20),
  generateLine(520, 380, 560, 450, 15),
];
