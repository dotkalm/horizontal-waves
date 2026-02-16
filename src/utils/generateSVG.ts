import type { EdgePath } from '@/types/svg';
import { calculateDashOffset } from './calculateDashOffset';

/**
 * Apply scaling and translation transformation to a 2D point
 * Uses a 2x3 affine transformation matrix:
 * [x'] = [sx  0  tx] [x]
 * [y']   [0  sy ty] [y]
 *                   [1]
 */
function transformPoint(
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  translateX: number,
  translateY: number
): { x: number; y: number } {
  return {
    x: x * scaleX + translateX,
    y: y * scaleY + translateY
  };
}

/**
 * Generate SVG string from edge paths
 */
/**
 * Generate smooth Bezier curve commands from points
 */

function getRandomDivisor(): number {
  return 1.975 + Math.random() * 0.05; // return random number between 1.975 and 2.025
}
function generateBezierPath(points: Array<{x: number, y: number}>, useWiggle: boolean = false): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  const commands: string[] = [];
  commands.push(`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`);

  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // Control point at current point
    const cpX = current.x;
    const cpY = current.y;

    // End point at midpoint between current and next
    const divisor = useWiggle ? getRandomDivisor() : 2;
    const endX = (current.x + next.x) / divisor;
    const endY = (current.y + next.y) / divisor;

    commands.push(`Q ${cpX.toFixed(2)} ${cpY.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`);
  }

  // Final segment to last point
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  commands.push(`Q ${secondLast.x.toFixed(2)} ${secondLast.y.toFixed(2)}, ${last.x.toFixed(2)} ${last.y.toFixed(2)}`);

  return commands.join(' ');
}

export function generateSVG(
  paths: EdgePath[],
  width: number,
  height: number,
  strokeWidth: number,
  strokeColor: string,
  time?: number,
  globalOpacity?: number,
  fill: string = 'none',
  connectEdges: boolean = false,
  useBezier: boolean = false,
  groupId: string = 'edges',
  useWiggle: boolean = false,
  useDashArray: boolean = false,
  dashSize: number = 8
): string {
  // Calculate oscillating dash offset based on time
  const dashOffset = time !== undefined
    ? calculateDashOffset(time)
    : 0;

  const { innerWidth, innerHeight } = window;

  // Calculate aspect ratios
  const sourceAspectRatio = width / height;
  const targetAspectRatio = innerWidth / innerHeight;

  let scaleX: number;
  let scaleY: number;
  let translateX: number;
  let translateY: number;

  // Preserve aspect ratio by using uniform scaling
  if (targetAspectRatio > sourceAspectRatio) {
    // Window is wider than video - fit to height
    scaleY = innerHeight / height;
    scaleX = scaleY;

    // Center horizontally
    const scaledWidth = width * scaleX;
    translateX = (innerWidth - scaledWidth) / 2;
    translateY = 0;
  } else {
    // Window is taller than video - fit to width
    scaleX = innerWidth / width;
    scaleY = scaleX;

    // Center vertically
    const scaledHeight = height * scaleY;
    translateX = 0;
    translateY = (innerHeight - scaledHeight) / 2;
  }

  // Scale stroke width proportionally
  const scaledStrokeWidth = strokeWidth * scaleX * 2;

  let pathElements: string;

  if (connectEdges && paths.length > 0) {
    // Connect paths, but only if distance is less than 1/4 of viewport
    const maxDistance = Math.max(innerWidth, innerHeight) / 6;

    if (useBezier) {
      // Collect all transformed points with segments
      const segments: Array<Array<{x: number, y: number}>> = [];
      let currentSegment: Array<{x: number, y: number}> = [];
      let lastPoint: { x: number; y: number } | null = null;

      paths.forEach((path) => {
        if (path.points.length < 2) return;

        path.points.forEach((p, i) => {
          const flippedY = height - p.y;
          const transformed = transformPoint(p.x, flippedY, scaleX, scaleY, translateX, translateY);

          if (i === 0 && lastPoint !== null) {
            // Check distance between segments
            const dx = transformed.x - lastPoint.x;
            const dy = transformed.y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > maxDistance) {
              // Too far - start new segment
              if (currentSegment.length > 0) {
                segments.push(currentSegment);
                currentSegment = [];
              }
            }
          }

          currentSegment.push(transformed);
          lastPoint = transformed;
        });
      });

      if (currentSegment.length > 0) {
        segments.push(currentSegment);
      }

      // Generate Bezier paths for each segment
      const d = segments.map(seg => generateBezierPath(seg, useWiggle)).join(' ');
      const opacity = globalOpacity !== undefined ? globalOpacity : 1;
      const dashAttrs = useDashArray ? `stroke-dasharray="${dashSize}" stroke-dashoffset="${dashOffset.toFixed(2)}"` : '';

      pathElements = `    <path
        d="${d}"
        stroke="${strokeColor}"
        stroke-width="${scaledStrokeWidth.toFixed(2)}"
        fill="${fill}"
        opacity="${opacity.toFixed(2)}"
        stroke-linecap="round"
        stroke-linejoin="round"
        ${dashAttrs}
      />`;
    } else {
      // Straight lines version
      const allPoints: string[] = [];
      let lastPoint: { x: number; y: number } | null = null;

      paths.forEach((path) => {
        if (path.points.length < 2) return;

        path.points.forEach((p, i) => {
          const flippedY = height - p.y;
          const transformed = transformPoint(p.x, flippedY, scaleX, scaleY, translateX, translateY);

          if (i === 0) {
            if (lastPoint === null) {
              allPoints.push(`M ${transformed.x.toFixed(2)} ${transformed.y.toFixed(2)}`);
            } else {
              const dx = transformed.x - lastPoint.x;
              const dy = transformed.y - lastPoint.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance <= maxDistance) {
                allPoints.push(`L ${transformed.x.toFixed(2)} ${transformed.y.toFixed(2)}`);
              } else {
                allPoints.push(`M ${transformed.x.toFixed(2)} ${transformed.y.toFixed(2)}`);
              }
            }
          } else {
            allPoints.push(`L ${transformed.x.toFixed(2)} ${transformed.y.toFixed(2)}`);
          }

          lastPoint = transformed;
        });
      });

      const d = allPoints.join(' ');
      const opacity = globalOpacity !== undefined ? globalOpacity : 1;
      const dashAttrs = useDashArray ? `stroke-dasharray="${dashSize}" stroke-dashoffset="${dashOffset.toFixed(2)}"` : '';

      pathElements = `    <path
        d="${d}"
        stroke="${strokeColor}"
        stroke-width="${scaledStrokeWidth.toFixed(2)}"
        fill="${fill}"
        opacity="${opacity.toFixed(2)}"
        stroke-linecap="round"
        stroke-linejoin="round"
        ${dashAttrs}
      />`;
    }
  } else {
    // Keep paths separate
    pathElements = paths
      .map(path => {
        if (path.points.length < 2) return '';

        let d: string;

        if (useBezier) {
          // Transform all points first
          const transformedPoints = path.points.map(p => {
            const flippedY = height - p.y;
            return transformPoint(p.x, flippedY, scaleX, scaleY, translateX, translateY);
          });
          // Generate Bezier path
          d = generateBezierPath(transformedPoints, useWiggle);
        } else {
          // Transform each point from video space to window space
          d = path.points
            .map((p, i) => {
              // Flip Y coordinate (WebGL origin is bottom-left, SVG is top-left)
              const flippedY = height - p.y;

              // Apply scaling and translation transformation
              const transformed = transformPoint(p.x, flippedY, scaleX, scaleY, translateX, translateY);

              return `${i === 0 ? 'M' : 'L'} ${transformed.x.toFixed(2)} ${transformed.y.toFixed(2)}`;
            })
            .join(' ');
        }

        // Calculate path opacity, applying global opacity if provided
        const pathOpacity = Math.max(0.3, path.intensity); // Minimum 30% opacity
        const opacity = globalOpacity !== undefined ? globalOpacity : pathOpacity;
        const dashAttrs = useDashArray ? `stroke-dasharray="${dashSize}" stroke-dashoffset="${dashOffset.toFixed(2)}"` : '';

        return `    <path
          d="${d}"
          stroke="${strokeColor}"
          stroke-width="${scaledStrokeWidth.toFixed(2)}"
          fill="${fill}"
          opacity="${opacity.toFixed(2)}"
          stroke-linecap="round"
          stroke-linejoin="round"
          ${dashAttrs}
        />`;
      })
      .filter(p => p.length > 0)
      .join('\n');
  }

  return `<g id="${groupId}"> ${pathElements} </g>`;
}

        // stroke-dasharray="${dashArray}" 
        // stroke-dashoffset="${dashOffset.toFixed(2)}"