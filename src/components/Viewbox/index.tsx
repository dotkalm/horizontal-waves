import {
  Index,
  createSignal,
  onMount,
  onCleanup,
} from 'solid-js';
import { styled } from 'solid-styled-components';
import {
  zigZagPath,
  processWebcamFrame,
} from '~/utils';
import { initWebGL, processFrame, cleanupWebGL } from '~/webgl';
import type { Point } from '~/types';
import {
  INITIAL_PATH_ARRAY,
  RIDGES_BETWEEN_POINTS,
  RIDGE_HEIGHT,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from '~/constants';

const CAMERA_WIDTH = 640;
const CAMERA_HEIGHT = 480;
const LOW_THRESHOLD = 0.04;
const HIGH_THRESHOLD = 0.02;
const GAUSSIAN_BLUR = 1.3;

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  background: ${props => props.theme!.colors.light};
`;

export default function Viewbox() {
  const [pathArray, setPathArray] = createSignal<Point[][]>(INITIAL_PATH_ARRAY);
  const pathCount = INITIAL_PATH_ARRAY.length;
  const spacing = VIEWBOX_HEIGHT / (pathCount + 1);

  let videoEl!: HTMLVideoElement;
  let canvasEl!: HTMLCanvasElement;
  let rafId: number;
  let stream: MediaStream | null = null;

  onMount(async () => {
    // Start webcam
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: CAMERA_WIDTH, height: CAMERA_HEIGHT, facingMode: 'user' },
      });
    } catch (err) {
      console.error('Webcam access denied:', err);
      return;
    }

    videoEl.srcObject = stream;
    try {
      await videoEl.play();
    } catch (err) {
      console.warn('Video play interrupted:', err);
    }

    // Init WebGL
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    const resources = initWebGL(gl, CAMERA_WIDTH, CAMERA_HEIGHT);
    if (!resources) {
      console.error('Failed to initialize WebGL pipeline');
      return;
    }

    const { programs, framebuffers, textures, buffers } = resources;

    // Animation loop
    const tick = () => {
      if (videoEl.readyState >= videoEl.HAVE_ENOUGH_DATA) {
        processFrame(
          gl, videoEl, programs, framebuffers, textures, buffers,
          LOW_THRESHOLD, HIGH_THRESHOLD, GAUSSIAN_BLUR,
        );

        const updated = processWebcamFrame(
          gl, INITIAL_PATH_ARRAY,
          CAMERA_WIDTH, CAMERA_HEIGHT,
          VIEWBOX_WIDTH, VIEWBOX_HEIGHT,
          pathCount, spacing,
        );
        setPathArray(updated);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });

  onCleanup(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  });

  return (
    <>
      <video
        ref={videoEl}
        width={CAMERA_WIDTH}
        height={CAMERA_HEIGHT}
        style={{ display: 'none' }}
        playsinline
      />
      <canvas
        ref={canvasEl}
        width={CAMERA_WIDTH}
        height={CAMERA_HEIGHT}
        style={{ display: 'none' }}
      />
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
                //fill="none"
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
    </>
  );
}
