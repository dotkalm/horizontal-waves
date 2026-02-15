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
  const spacing = VIEWBOX_HEIGHT / (PATH_COUNT + 1);
  const [isPressed, setIsPressed] = createSignal(false);
  const [pathArray, setPathArray] = createSignal<Point[][]>(INITIAL_PATH_ARRAY);
  const handleMouseEnter = () => {
    // figure out what path we are hovering over and then understand the x position 
  }

  return (
    <StyledSvg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} preserveAspectRatio="none">
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
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              opacity={0.3 + (i / PATH_COUNT) * 0.7}
              stroke-width="1"
              stroke={i % 2 === 0 ? 'currentColor' : 'currentColor'}
              id={`reference-path-${i}`}
            />
          );
        }}
      </Index>
      </g>
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
    </StyledSvg>
  );
}
