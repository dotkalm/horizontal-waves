#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_blurRadius;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    // Flip texture coordinates vertically
    vec2 flippedCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y);
    vec2 onePixel = (1.0 / u_resolution) * u_blurRadius;

    // 5x5 Gaussian kernel (simplified to 3x3 for performance)
    vec4 color = vec4(0.0);
    color += texture(u_image, flippedCoord + vec2(-onePixel.x, -onePixel.y)) * 1.0;
    color += texture(u_image, flippedCoord + vec2(0.0, -onePixel.y)) * 2.0;
    color += texture(u_image, flippedCoord + vec2(onePixel.x, -onePixel.y)) * 1.0;

    color += texture(u_image, flippedCoord + vec2(-onePixel.x, 0.0)) * 2.0;
    color += texture(u_image, flippedCoord) * 4.0;
    color += texture(u_image, flippedCoord + vec2(onePixel.x, 0.0)) * 2.0;

    color += texture(u_image, flippedCoord + vec2(-onePixel.x, onePixel.y)) * 1.0;
    color += texture(u_image, flippedCoord + vec2(0.0, onePixel.y)) * 2.0;
    color += texture(u_image, flippedCoord + vec2(onePixel.x, onePixel.y)) * 1.0;

    fragColor = color / 16.0;
}