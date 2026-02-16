#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    vec2 onePixel = 1.0 / u_resolution;
    vec4 current = texture(u_image, v_texCoord);
    float magnitude = current.r;
    float direction = current.g * 6.28318 - 3.14159; // Denormalize

    // Round direction to nearest 45 degrees
    float angle = mod(direction + 3.14159, 3.14159);
    vec2 offset;

    if (angle < 0.3927 || angle > 2.7489) {
        // 0 degrees - horizontal
        offset = vec2(onePixel.x, 0.0);
    } else if (angle < 1.1781) {
        // 45 degrees
        offset = vec2(onePixel.x, onePixel.y);
    } else if (angle < 1.9635) {
        // 90 degrees - vertical
        offset = vec2(0.0, onePixel.y);
    } else {
        // 135 degrees
        offset = vec2(-onePixel.x, onePixel.y);
    }

    float neighbor1 = texture(u_image, v_texCoord + offset).r;
    float neighbor2 = texture(u_image, v_texCoord - offset).r;

    // Keep only if local maximum
    float result = (magnitude >= neighbor1 && magnitude >= neighbor2) ? magnitude : 0.0;

    fragColor = vec4(result, result, result, 1.0);
}