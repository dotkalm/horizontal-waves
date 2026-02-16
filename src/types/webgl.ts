export interface TWebGLPrograms {
  blur?: WebGLProgram | null;
  motionBlur?: WebGLProgram | null;
  bokehBlur?: WebGLProgram | null;
  gradient?: WebGLProgram | null;
  nonMax?: WebGLProgram | null;
  threshold?: WebGLProgram | null;
}

export interface TWebGLFramebuffers {
  blur?: WebGLFramebuffer | null;
  gradient?: WebGLFramebuffer | null;
  nonMax?: WebGLFramebuffer | null;
}

export interface TWebGLTextures {
  input: WebGLTexture | null;
  blur?: WebGLTexture | null;
  gradient?: WebGLTexture | null;
  nonMax?: WebGLTexture | null;
}

export interface TWebGLBuffers {
  position: WebGLBuffer | null;
  texCoord: WebGLBuffer | null;
}

export type TUniformValue = number | [number, number];

export interface TWebGLResources {
  programs: TWebGLPrograms;
  framebuffers: TWebGLFramebuffers;
  textures: TWebGLTextures;
  buffers: TWebGLBuffers;
}
