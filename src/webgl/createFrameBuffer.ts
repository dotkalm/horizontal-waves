export const createFramebuffer = (
  gl: WebGLRenderingContext,
  texture: WebGLTexture | null,
): WebGLFramebuffer | null => {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  return framebuffer;
};
