#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform float u_lowThreshold;
uniform float u_highThreshold;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    float intensity = texture(u_image, v_texCoord).r;
    float result = 0.0;
    if (intensity > u_highThreshold) {
        result = 1.0; // Strong edge
    } else if (intensity > u_lowThreshold) {
        result = 0.5; // Weak edge (would need hysteresis for proper Canny)
    }
    fragColor = vec4(result, result, result, 1.0);
}