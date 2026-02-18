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
import { setVideoTrack, setZoomCapabilities } from '~/utils/webcamState';
import type { Point } from '~/types';

const LOW_THRESHOLD = 0.02;
const HIGH_THRESHOLD = 0.02;
const GAUSSIAN_BLUR = 1.0;
const SCROLL_SPEED = .05;

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
    // Start webcam — request ideal resolution, actual may differ per device
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
    } catch (err) {
      console.error('Webcam access denied:', err);
      return;
    }

    // Publish track and zoom capabilities for WebcamControls
    const track = stream.getVideoTracks()[0];
    setVideoTrack(track);
    const caps = track.getCapabilities() as any;
    if (caps.zoom) {
      setZoomCapabilities({ min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step });
    }

    videoEl.srcObject = stream;
    try {
      await videoEl.play();
    } catch (err) {
      console.warn('Video play interrupted:', err);
    }

    // Use videoWidth/videoHeight — these reflect actual frame dimensions
    // (including any rotation the browser applies in portrait mode)
    const cameraWidth = videoEl.videoWidth || 640;
    const cameraHeight = videoEl.videoHeight || 480;

    videoEl.width = cameraWidth;
    videoEl.height = cameraHeight;
    canvasEl.width = cameraWidth;
    canvasEl.height = cameraHeight;

    // Init WebGL
    const gl = canvasEl.getContext('webgl2');
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    const resources = initWebGL(gl, cameraWidth, cameraHeight);
    if (!resources) {
      console.error('Failed to initialize WebGL pipeline');
      return;
    }

    const { programs, framebuffers, textures, buffers } = resources;

    // V-hold scroll state: track which path index is currently first
    // and a fractional y-offset that accumulates each frame
    let scrollOffset = 0;
    let orderOffset = 0;

    const tick = () => {
      if (videoEl.readyState >= videoEl.HAVE_ENOUGH_DATA) {
        processFrame(
          gl, videoEl, programs, framebuffers, textures, buffers,
          LOW_THRESHOLD, HIGH_THRESHOLD, GAUSSIAN_BLUR,
        );

        const c = config();
        const sp = spacing();

        // Build a shifted base path array: apply scroll offset to y coords
        // and rotate the order so wrapped paths appear at the bottom
        const count = pathCount();
        const shiftedBase: Point[][] = Array.from({ length: count }, (_, i) => {
          // Pick the source path in rotated order
          const srcIdx = (i + orderOffset) % count;
          const baseY = sp * (srcIdx + 1);
          const scrolledY = baseY - scrollOffset;
          // Wrap: if scrolled above top, place at bottom
          const wrappedY = scrolledY > 0
            ? scrolledY
            : scrolledY + c.VIEWBOX_HEIGHT + sp;
          return [{ x: 0, y: wrappedY }, { x: c.VIEWBOX_WIDTH, y: wrappedY }];
        });

        // Sort by y so the visual stacking order stays correct
        shiftedBase.sort((a, b) => a[0].y - b[0].y);

        const updated = processWebcamFrame(
          gl, shiftedBase,
          cameraWidth, cameraHeight,
          c.VIEWBOX_WIDTH, c.VIEWBOX_HEIGHT,
          count, sp,
        );
        setPathArray(updated);

        // Advance scroll
        scrollOffset += SCROLL_SPEED;
        if (scrollOffset >= sp) {
          scrollOffset -= sp;
          orderOffset = (orderOffset + 1) % count;
        }
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
        playsinline
        ref={videoEl}
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasEl}
        style={{ display: 'none' }}
      />
      <StyledSvg
        preserveAspectRatio="none"
        viewBox={`0 0 ${config().VIEWBOX_WIDTH} ${config().VIEWBOX_HEIGHT}`}
      >
        <defs>
          <linearGradient id="zigzag-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(0,0,255,1)" />
            <stop offset="10%" stop-color="rgba(231, 255, 135, 0.8)" />
            <stop offset="20%" stop-color="rgba(62, 255, 65, 0.5)" />
            <stop offset="40%" stop-color="rgba(255, 9, 9, 0.16)" />
            <stop offset="100%" stop-color="transparent" stop-opacity="0" />
          </linearGradient>
        </defs>
        <g id="zigzag-paths">
          <Index each={pathArray()}>
            {(points, i) => (
              <path
                d={zigZagPath(points(), config().RIDGES_BETWEEN_POINTS, config().RIDGE_HEIGHT)}
                //fill="rgb(0,20,0,1)"
                fill="none"
                id={`zigzag-path-${i}`}
                opacity={1}
                stroke-width="2"
                stroke="url(#zigzag-gradient)"
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
