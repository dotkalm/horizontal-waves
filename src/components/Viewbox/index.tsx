import {
  Index,
  createSignal,
  onMount,
} from 'solid-js';
import { styled } from 'solid-styled-components';
import {
  zigZagPath,
  processFixtureData,
} from '~/utils';
import type { Point } from '~/types';
import {
  INITIAL_PATH_ARRAY,
  RIDGES_BETWEEN_POINTS,
  RIDGE_HEIGHT,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from '~/constants';
import { webcamUIntArray } from '~/__tests__/fixtures/webcamUIntArray';

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  background: ${props => props.theme!.colors.light};
`;

export default function Viewbox() {
  const [pathArray, setPathArray] = createSignal<Point[][]>(INITIAL_PATH_ARRAY);
  const pathCount = pathArray().length;
  const spacing = VIEWBOX_HEIGHT / (pathCount + 1);

  onMount(() => {
    const updated = processFixtureData(
      webcamUIntArray,
      pathArray(),
      VIEWBOX_WIDTH,
      VIEWBOX_HEIGHT,
      pathCount,
      spacing,
    );
    setPathArray(updated);
  });

  return (
    <StyledSvg
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
