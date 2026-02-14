import { 
  Index,
  createSignal,
} from 'solid-js';
import { styled } from 'solid-styled-components';
import { zigZagPath } from '~/utils';

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
  const handleMouseEnter = () => {
    // figure out what path we are hovering over and then understand the x position 
  }

  return (
    <StyledSvg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} preserveAspectRatio="none">
      <Index each={Array.from({ length: PATH_COUNT })}>
        {(_, i) => {
          const y = spacing * (i + 1);
          //const points = [{ x: 0, y }, { x: VIEWBOX_WIDTH, y }];
          return (
            <path
              d={`M 0 ${y} L ${VIEWBOX_WIDTH} ${y}`}
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
      <Index each={Array.from({ length: PATH_COUNT })}>
        {(_, i) => {
          const y = spacing * (i + 1);
          const points = [{ x: 0, y }, { x: VIEWBOX_WIDTH, y }];
          return (
            <path
              d={zigZagPath(points, 5, 30)}
              fill="none"
              opacity={0.3 + (i / PATH_COUNT) * 0.7}
              stroke-width="1"
              stroke={i % 2 === 0 ? 'currentColor' : 'currentColor'}
            />
          );
        }}
      </Index>
    </StyledSvg>
  );
}
