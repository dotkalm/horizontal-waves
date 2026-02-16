import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    assetsInclude: ['**/*.vert', '**/*.frag', '**/*.glsl'],
    plugins: [
      {
        name: 'glsl-loader',
        transform(code: string, id: string) {
          if (/\.(vert|frag|glsl)$/.test(id)) {
            return {
              code: `export default ${JSON.stringify(code)};`,
              map: null,
            };
          }
        },
      },
    ],
  },
});
