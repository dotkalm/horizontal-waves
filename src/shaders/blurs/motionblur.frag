#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_direction; // Motion blur direction (angle and strength)
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    // Flip texture coordinates vertically
    vec2 flippedCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y);

    // Number of samples for motion blur
    const int samples = 12;
    vec4 color = vec4(0.0);

    // Motion blur direction in pixel space
    vec2 motionStep = u_direction / u_resolution / float(samples);

    // Sample along the motion direction
    for (int i = 0; i < samples; i++) {
        float t = float(i) / float(samples - 1);
        vec2 offset = motionStep * (t - 0.5) * 2.0; // Center the blur
        vec2 sampleCoord = flippedCoord + offset;

        // Clamp to texture bounds
        sampleCoord = clamp(sampleCoord, vec2(0.0), vec2(1.0));

        color += texture(u_image, sampleCoord);
    }

    fragColor = color / float(samples);
}