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
import { initWebGL, processFrame } from '~/webgl';
import { deviceConfig } from '~/utils/device';
import type { Point } from '~/types';

const CAMERA_WIDTH = 640;
const CAMERA_HEIGHT = 480;
const LOW_THRESHOLD = 0.02;
const HIGH_THRESHOLD = 0.02;
const GAUSSIAN_BLUR = 1.0;

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  background: ${props => props.theme!.colors.light};
`;

export default function Viewbox() {
  const config = () => deviceConfig();
  const [pathArray, setPathArray] = createSignal<Point[][]>(config().INITIAL_PATH_ARRAY);
  const pathCount = () => config().INITIAL_PATH_ARRAY.length;
  const spacing = () => config().VIEWBOX_HEIGHT / (pathCount() + 1);

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

    const tick = () => {
      if (videoEl.readyState >= videoEl.HAVE_ENOUGH_DATA) {
        processFrame(
          gl, videoEl, programs, framebuffers, textures, buffers,
          LOW_THRESHOLD, HIGH_THRESHOLD, GAUSSIAN_BLUR,
        );

        const c = config();
        const updated = processWebcamFrame(
          gl, c.INITIAL_PATH_ARRAY,
          CAMERA_WIDTH, CAMERA_HEIGHT,
          c.VIEWBOX_WIDTH, c.VIEWBOX_HEIGHT,
          pathCount(), spacing(),
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
        height={CAMERA_HEIGHT}
        playsinline
        ref={videoEl}
        style={{ display: 'none' }}
        width={CAMERA_WIDTH}
      />
      <canvas
        height={CAMERA_HEIGHT}
        ref={canvasEl}
        style={{ display: 'none' }}
        width={CAMERA_WIDTH}
      />
      <StyledSvg
        preserveAspectRatio="none"
        viewBox={`0 0 ${config().VIEWBOX_WIDTH} ${config().VIEWBOX_HEIGHT}`}
      >
        <g id="zigzag-paths">
          <Index each={pathArray()}>
            {(points, i) => (
              <path
                d={zigZagPath(points(), config().RIDGES_BETWEEN_POINTS, config().RIDGE_HEIGHT)}
                //fill="rgb(0,20,0,.6)"
                fill="none"
                id={`zigzag-path-${i}`}
                opacity={1}
                stroke-width="1"
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
