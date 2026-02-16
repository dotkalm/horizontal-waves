import { 
  Index,
  createSignal,
} from 'solid-js';
import { styled } from 'solid-styled-components';
import { 
  findPath,
  zigZagPath,
} from '~/utils';
import type { Point } from '~/types';
import { 
  INITIAL_PATH_ARRAY,
  RIDGES_BETWEEN_POINTS,
  RIDGE_HEIGHT,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from '~/constants';

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  background: ${props => props.theme!.colors.light};
`;

export default function Viewbox() {
  const [isPressed, setIsPressed] = createSignal(false);
  const [pathArray, setPathArray] = createSignal<Point[][]>(INITIAL_PATH_ARRAY);
  let prevSvgPoint: Point | null = null;
  const pathCount = pathArray().length;
  const spacing = VIEWBOX_HEIGHT / (pathCount + 1);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPressed()) return;
    const svg = e.currentTarget as SVGSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()!.inverse());

    if (prevSvgPoint) {
      const prevArray = [...pathArray()];
      const intersectionData = findPath(prevArray, prevSvgPoint, svgPoint, spacing);
      if (intersectionData) {
        const { verticalIndex, horizontalIndex } = intersectionData;
        const [{ y: currentY }] = prevArray[verticalIndex];
        const updatedPath = [...prevArray[verticalIndex]];
        updatedPath.splice(horizontalIndex + 1, 0, { x: svgPoint.x, y: currentY });
        prevArray[verticalIndex] = updatedPath;
        setPathArray(prevArray);
      }
    }

    prevSvgPoint = { x: svgPoint.x, y: svgPoint.y };
  }

  console.log('current path array:', pathArray());
  return (
    <StyledSvg
      onMouseDown={() => setIsPressed(true)}
      onMouseLeave={() => { setIsPressed(false); prevSvgPoint = null; }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { setIsPressed(false); prevSvgPoint = null; }}
      preserveAspectRatio="none"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
    >
      <g id="zigzag-paths">
        <Index each={pathArray()}>
          {(points, i) => (
            <path
              d={zigZagPath(points(), RIDGE_HEIGHT, RIDGES_BETWEEN_POINTS)}
              fill="rgb(0,20,0,0.15)"
              id={`zigzag-path-${i}`}
              opacity={1}
              stroke-width="0"
              stroke={i % 2 === 0 ? 'currentColor' : 'currentColor'}
            />
          )}
        </Index>
      </g>
      <g id="reference-paths">
        <Index each={pathArray()}>
          {(line, i) => {
            const points = line();
            const [start] = points;
            const end = points[points.length - 1];
            return (
              <path
                d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                fill="none"
                id={`reference-path-${i}`}
                opacity={0}
                stroke-width="1"
                stroke={i % 2 === 0 ? 'currentColor' : 'currentColor'}
              />
            );
          }}
        </Index>
      </g>
    </StyledSvg>
  );
}
