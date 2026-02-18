import { createSignal, createRoot } from 'solid-js';

export interface ZoomCapabilities {
  min: number;
  max: number;
  step: number;
}

const { zoom, setZoom, zoomCapabilities, setZoomCapabilities, videoTrack, setVideoTrack } = createRoot(() => {
  const [zoom, setZoom] = createSignal(1);
  const [zoomCapabilities, setZoomCapabilities] = createSignal<ZoomCapabilities | null>(null);
  const [videoTrack, setVideoTrack] = createSignal<MediaStreamTrack | null>(null);

  return { zoom, setZoom, zoomCapabilities, setZoomCapabilities, videoTrack, setVideoTrack };
});

export { zoom, setZoom, zoomCapabilities, setZoomCapabilities, videoTrack, setVideoTrack };
