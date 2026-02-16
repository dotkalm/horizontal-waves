import type { TWebGLBuffers, TUniformValue } from '~/types';

export const renderPass = (
  gl: WebGLRenderingContext,
  program: WebGLProgram | null | undefined,
  framebuffer: WebGLFramebuffer | null | undefined,
  inputTexture: WebGLTexture | null | undefined,
  buffers: TWebGLBuffers,
  width: number,
  height: number,
  uniforms: Record<string, TUniformValue>,
): void => {
  if (!program || !inputTexture || !buffers.position || !buffers.texCoord) return;

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer || null);
  gl.viewport(0, 0, width, height);

  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, inputTexture);
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

  for (const [name, value] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name);
    if (Array.isArray(value)) {
      gl.uniform2f(location, value[0], value[1]);
    } else {
      gl.uniform1f(location, value);
    }
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);
};
