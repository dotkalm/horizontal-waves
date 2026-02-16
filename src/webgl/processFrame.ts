import { renderPass } from './renderPass';
import type { TWebGLPrograms, TWebGLFramebuffers, TWebGLTextures, TWebGLBuffers } from '~/types';

export const processFrame = (
  gl: WebGLRenderingContext,
  video: HTMLVideoElement,
  programs: TWebGLPrograms,
  framebuffers: TWebGLFramebuffers,
  textures: TWebGLTextures,
  buffers: TWebGLBuffers,
  lowThreshold: number,
  highThreshold: number,
  gaussianBlurAmount: number = 1.0,
  facingMode: 'user' | 'environment' = 'user',
): void => {
  const width = video.videoWidth;
  const height = video.videoHeight;

  // Flip video horizontally for front-facing camera
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.save();

  if (facingMode === 'user') {
    tempCtx.translate(width, 0);
    tempCtx.scale(-1, 1);
  }
  tempCtx.drawImage(video, 0, 0, width, height);
  tempCtx.restore();

  gl.bindTexture(gl.TEXTURE_2D, textures.input);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);

  // Pass 1: Gaussian blur
  renderPass(gl, programs.blur, framebuffers.blur, textures.input, buffers, width, height, {
    u_resolution: [width, height],
    u_blurRadius: gaussianBlurAmount,
  });

  // Pass 2: Gradient (Sobel)
  renderPass(gl, programs.gradient, framebuffers.gradient, textures.blur, buffers, width, height, {
    u_resolution: [width, height],
  });

  // Pass 3: Non-Maximum Suppression
  renderPass(gl, programs.nonMax, framebuffers.nonMax, textures.gradient, buffers, width, height, {
    u_resolution: [width, height],
  });

  // Pass 4: Threshold (render to screen / default FBO)
  renderPass(gl, programs.threshold, null, textures.nonMax, buffers, width, height, {
    u_lowThreshold: lowThreshold,
    u_highThreshold: highThreshold,
  });
};
