#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    vec2 onePixel = 1.0 / u_resolution;

    // Sobel kernels
    float tl = texture(u_image, v_texCoord + vec2(-onePixel.x, -onePixel.y)).r;
    float tm = texture(u_image, v_texCoord + vec2(0.0, -onePixel.y)).r;
    float tr = texture(u_image, v_texCoord + vec2(onePixel.x, -onePixel.y)).r;

    float ml = texture(u_image, v_texCoord + vec2(-onePixel.x, 0.0)).r;
    float mr = texture(u_image, v_texCoord + vec2(onePixel.x, 0.0)).r;

    float bl = texture(u_image, v_texCoord + vec2(-onePixel.x, onePixel.y)).r;
    float bm = texture(u_image, v_texCoord + vec2(0.0, onePixel.y)).r;
    float br = texture(u_image, v_texCoord + vec2(onePixel.x, onePixel.y)).r;

    // Gradient
    float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;

    float magnitude = sqrt(gx*gx + gy*gy) / (4.0 * 1.414);
    float direction = atan(gy, gx);

    // Store magnitude in r, direction in g (normalized to 0-1)
    fragColor = vec4(magnitude, (direction + 3.14159) / 6.28318, 0.0, 1.0);
}