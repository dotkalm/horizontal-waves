import { defineConfig } from "@solidjs/start/config";
import { readFileSync } from "node:fs";
import { loadEnv } from "vite";

const env = loadEnv('', process.cwd(), 'VITE_');

export default defineConfig({
  vite: {
    server: {
      allowedHosts: [env.VITE_ALLOWED_HOST ?? ''],
    },
    plugins: [
      {
        name: 'glsl-loader',
        enforce: 'pre' as const,
        load(id: string) {
          const cleanId = id.split('?')[0];
          if (/\.(vert|frag|glsl)$/.test(cleanId)) {
            const src = readFileSync(cleanId, 'utf-8');
            return `export default ${JSON.stringify(src)};`;
          }
        },
      },
    ],
  },
});
