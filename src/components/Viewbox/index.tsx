import { 
  Index,
  createSignal,
} from 'solid-js';
import { styled } from 'solid-styled-components';
import { zigZagPath } from '~/utils';
import type { Point } from '~/types';
import { INITIAL_PATH_ARRAY } from '~/constants';

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  background: ${props => props.theme!.colors.light};
`;

const VIEWBOX_WIDTH = 1440;
const VIEWBOX_HEIGHT = 800;
const PATH_COUNT = 30;

export default function Viewbox() {
  const [isPressed, setIsPressed] = createSignal(false);
  const [pathArray, setPathArray] = createSignal<Point[][]>(INITIAL_PATH_ARRAY);
  const spacing = VIEWBOX_HEIGHT / (PATH_COUNT + 1);
  let prevSvgPoint: Point | null = null;

  const handleMouseMove = (e: MouseEvent) => {
    if(!isPressed()) return;
    const svg = e.currentTarget as SVGSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()!.inverse());

    if (prevSvgPoint) {
      const minY = Math.min(prevSvgPoint.y, svgPoint.y);
      const maxY = Math.max(prevSvgPoint.y, svgPoint.y);

      for (let i = 0; i < PATH_COUNT; i++) {
        const pathY = spacing * (i + 1);
        if (pathY >= minY && pathY <= maxY) {
          const t = (pathY - prevSvgPoint.y) / (svgPoint.y - prevSvgPoint.y);
          const crossX = prevSvgPoint.x + t * (svgPoint.x - prevSvgPoint.x);
          console.log(`crossed path ${i} at x: ${crossX.toFixed(1)}, y: ${pathY.toFixed(1)}`);
        }
      }
    }

    prevSvgPoint = { x: svgPoint.x, y: svgPoint.y };
  }

  return (
    <StyledSvg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => { setIsPressed(false); prevSvgPoint = null; }}
      onMouseLeave={() => { setIsPressed(false); prevSvgPoint = null; }}
      onMouseMove={handleMouseMove}
    >
      <g id="zigzag-paths">
      <Index each={pathArray()}>
        {(points, i) => (
          <path
            d={zigZagPath(points(), 5, 30)}
            fill="none"
            opacity={0.3 + (i / PATH_COUNT) * 0.7}
            stroke-width="1"
            stroke={i % 2 === 0 ? 'currentColor' : 'currentColor'}
            id={`zigzag-path-${i}`}
          />
        )}
      </Index>
      </g>
      <g id="reference-paths">
      <Index each={pathArray()}>
        {(line, i) => {
          const points = line();
          const [ start ] = points;
          const end = points[points.length - 1];
          return (
            <path
              d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
              fill="none"
              opacity={0.3 + (i / PATH_COUNT) * 0.7}
              stroke-width="1"
              stroke={i % 2 === 0 ? 'currentColor' : 'currentColor'}
              id={`reference-path-${i}`}
            />
          );
        }}
      </Index>
      </g>
    </StyledSvg>
  );
}
