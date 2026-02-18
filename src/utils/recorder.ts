import type { EdgePath } from '~/types';
import RecorderWorker from '~/workers/recorder.worker?worker';

export interface RecordingMeta {
  id: string;
  frameCount: number;
  createdAt: number;
}

export function createRecorder() {
  const worker = new RecorderWorker();
  let recording = false;

  function startRecording() {
    recording = true;
    console.log('[Recorder] Recording started');
  }

  function pushFrame(edgePaths: EdgePath[]) {
    if (!recording) return;
    worker.postMessage({ type: 'frame', data: JSON.stringify(edgePaths) });
  }

  function stopRecording(): Promise<RecordingMeta> {
    recording = false;
    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'saved') {
          worker.removeEventListener('message', handler);
          const meta: RecordingMeta = {
            id: e.data.id,
            frameCount: e.data.frameCount,
            createdAt: e.data.createdAt,
          };
          console.log(`[Recorder] Recording saved: ${meta.id} (${meta.frameCount} frames)`);
          resolve(meta);
        } else if (e.data.type === 'error') {
          worker.removeEventListener('message', handler);
          reject(new Error(e.data.message));
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'stop' });
    });
  }

  function loadRecording(recordingId: string): Promise<{ meta: RecordingMeta; frames: EdgePath[][] }> {
    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'loaded') {
          worker.removeEventListener('message', handler);
          const { data, frameCount, id, createdAt } = e.data;
          const frames: EdgePath[][] = JSON.parse(data);
          resolve({
            meta: { id, frameCount, createdAt },
            frames,
          });
        } else if (e.data.type === 'error') {
          worker.removeEventListener('message', handler);
          reject(new Error(e.data.message));
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'load', recordingId });
    });
  }

  function getRecordings(): Promise<RecordingMeta[]> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'recordings') {
          worker.removeEventListener('message', handler);
          resolve(e.data.recordings);
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'list' });
    });
  }

  return {
    get isRecording() { return recording; },
    startRecording,
    pushFrame,
    stopRecording,
    loadRecording,
    getRecordings,
  };
}
