import type { TWebGLPrograms, TWebGLFramebuffers, TWebGLTextures } from '~/types';

export const cleanupWebGL = (
  gl: WebGLRenderingContext,
  programs: TWebGLPrograms,
  framebuffers: TWebGLFramebuffers,
  textures: TWebGLTextures,
): void => {
  Object.values(programs).forEach(program => {
    if (program) gl.deleteProgram(program);
  });

  Object.values(framebuffers).forEach(fb => {
    if (fb) gl.deleteFramebuffer(fb);
  });

  Object.values(textures).forEach(texture => {
    if (texture) gl.deleteTexture(texture);
  });
};
