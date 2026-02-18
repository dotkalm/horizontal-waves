import { createSignal } from 'solid-js';
import type { EdgePath } from '~/types';

export function createReplayer(frames: EdgePath[][], fps = 60) {
  const [frameIndex, setFrameIndex] = createSignal(0);
  const [playing, setPlaying] = createSignal(false);

  let rafId: number | undefined;
  let lastTime = 0;
  const frameDuration = 1000 / fps;

  function tick(time: number) {
    if (!playing()) return;

    if (time - lastTime >= frameDuration) {
      lastTime = time;
      setFrameIndex(i => (i + 1) % frames.length);
    }

    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (playing()) return;
    setPlaying(true);
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
    console.log(`[Replayer] Playing ${frames.length} frames at ${fps}fps`);
  }

  function pause() {
    setPlaying(false);
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
      rafId = undefined;
    }
  }

  function stop() {
    pause();
    setFrameIndex(0);
    console.log('[Replayer] Stopped');
  }

  function currentFrame(): EdgePath[] {
    return frames[frameIndex()];
  }

  return { play, pause, stop, playing, frameIndex, currentFrame };
}
