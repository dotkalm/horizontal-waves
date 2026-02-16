import gaussianBlurFragmentShader from '~/shaders/blurs/gaussian.frag';
import motionBlurFragmentShader from '~/shaders/blurs/motionblur.frag';
import bokehBlurFragmentShader from '~/shaders/blurs/bokeh.frag';
import gradientFragmentShader from '~/shaders/gradient.frag';
import nonMaxSuppressionFragmentShader from '~/shaders/nonMax.frag';
import thresholdFragmentShader from '~/shaders/threshold.frag';
import vertexShaderSource from '~/shaders/source.vert';

import { createFramebuffer } from './createFrameBuffer';
import { createProgram } from './createProgram';
import { createShader } from './createShader';
import { createTexture } from './createTexture';
import type { TWebGLResources } from '~/types';

export const initWebGL = (
  gl: WebGLRenderingContext,
  width: number = 640,
  height: number = 480,
): TWebGLResources | null => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) return null;

  const blurFragShader = createShader(gl, gl.FRAGMENT_SHADER, gaussianBlurFragmentShader);
  const motionBlurFragShader = createShader(gl, gl.FRAGMENT_SHADER, motionBlurFragmentShader);
  const bokehBlurFragShader = createShader(gl, gl.FRAGMENT_SHADER, bokehBlurFragmentShader);
  const gradientFragShader = createShader(gl, gl.FRAGMENT_SHADER, gradientFragmentShader);
  const nonMaxFragShader = createShader(gl, gl.FRAGMENT_SHADER, nonMaxSuppressionFragmentShader);
  const thresholdFragShader = createShader(gl, gl.FRAGMENT_SHADER, thresholdFragmentShader);

  const programs = {
    blur: blurFragShader ? createProgram(gl, vertexShader, blurFragShader) : null,
    motionBlur: motionBlurFragShader ? createProgram(gl, vertexShader, motionBlurFragShader) : null,
    bokehBlur: bokehBlurFragShader ? createProgram(gl, vertexShader, bokehBlurFragShader) : null,
    gradient: gradientFragShader ? createProgram(gl, vertexShader, gradientFragShader) : null,
    nonMax: nonMaxFragShader ? createProgram(gl, vertexShader, nonMaxFragShader) : null,
    threshold: thresholdFragShader ? createProgram(gl, vertexShader, thresholdFragShader) : null,
  };

  // Create geometry (full-screen quad)
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1,
  ]), gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 1,
  ]), gl.STATIC_DRAW);

  const buffers = {
    position: positionBuffer,
    texCoord: texCoordBuffer,
  };

  // Create textures for each pass
  const textures = {
    input: createTexture(gl),
    blur: createTexture(gl, width, height),
    gradient: createTexture(gl, width, height),
    nonMax: createTexture(gl, width, height),
  };

  // Create framebuffers
  const framebuffers = {
    blur: createFramebuffer(gl, textures.blur),
    gradient: createFramebuffer(gl, textures.gradient),
    nonMax: createFramebuffer(gl, textures.nonMax),
  };

  return { programs, framebuffers, textures, buffers };
};
