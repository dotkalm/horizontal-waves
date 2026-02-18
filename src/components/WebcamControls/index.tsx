import { Show, createEffect } from 'solid-js';
import { styled } from 'solid-styled-components';
import { zoom, setZoom, zoomCapabilities, videoTrack } from '~/utils/webcamState';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
`;

const Label = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme!.colors.dark};
  min-width: 2.5rem;
  text-align: right;
`;

const Slider = styled.input`
  width: 200px;
  accent-color: ${props => props.theme!.colors.dark};
`;

export default function WebcamControls() {
  createEffect(() => {
    const track = videoTrack();
    const z = zoom();
    if (track) {
      track.applyConstraints({ advanced: [{ zoom: z } as any] });
    }
  });

  return (
    <Show when={zoomCapabilities()}>
      {(caps) => (
        <Container>
          <Label>{zoom().toFixed(1)}x</Label>
          <Slider
            type="range"
            min={caps().min}
            max={caps().max}
            step={caps().step}
            value={zoom()}
            onInput={(e) => setZoom(parseFloat(e.currentTarget.value))}
          />
        </Container>
      )}
    </Show>
  );
}
