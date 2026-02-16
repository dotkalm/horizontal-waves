import { defineConfig } from "@solidjs/start/config";
import { readFileSync } from "node:fs";

export default defineConfig({
  vite: {
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
