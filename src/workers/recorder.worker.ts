const DB_NAME = 'horizontal-waves-recordings';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

interface RecordingMeta {
  id: string;
  frameCount: number;
  createdAt: number;
}

let db: IDBDatabase | null = null;
let frames: string[] = []; // JSON-stringified EdgePath[] per frame

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('createdAt', 'createdAt');
    };
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

function saveRecording(meta: RecordingMeta, data: string): Promise<void> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ ...meta, data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  }));
}

function loadRecording(id: string): Promise<{ meta: RecordingMeta; data: string } | null> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => {
      if (!req.result) return resolve(null);
      const { data, ...meta } = req.result;
      resolve({ meta, data });
    };
    req.onerror = () => reject(req.error);
  }));
}

function listRecordings(): Promise<RecordingMeta[]> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      resolve(req.result.map(({ data: _, ...meta }: any) => meta));
    };
    req.onerror = () => reject(req.error);
  }));
}

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  switch (msg.type) {
    case 'frame': {
      // msg.data is a JSON string of EdgePath[]
      frames.push(msg.data);
      break;
    }

    case 'stop': {
      if (frames.length === 0) {
        self.postMessage({ type: 'error', message: 'No frames recorded' });
        break;
      }

      const meta: RecordingMeta = {
        id: `rec-${Date.now()}`,
        frameCount: frames.length,
        createdAt: Date.now(),
      };

      // Store all frames as a single JSON array string
      const data = '[' + frames.join(',') + ']';
      await saveRecording(meta, data);
      frames = [];

      self.postMessage({ type: 'saved', ...meta });
      break;
    }

    case 'load': {
      const result = await loadRecording(msg.recordingId);
      if (!result) {
        self.postMessage({ type: 'error', message: `Recording ${msg.recordingId} not found` });
        break;
      }
      self.postMessage({ type: 'loaded', ...result.meta, data: result.data });
      break;
    }

    case 'list': {
      const recordings = await listRecordings();
      self.postMessage({ type: 'recordings', recordings });
      break;
    }
  }
};
