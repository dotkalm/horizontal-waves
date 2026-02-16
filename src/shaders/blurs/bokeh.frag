#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_focusPoint; // Focus point (normalized 0-1)
uniform float u_focusRange; // How sharp the focus falloff is
uniform float u_maxBlur; // Maximum blur radius
in vec2 v_texCoord;
out vec4 fragColor;

const int SAMPLES = 19;

vec2 getHexPattern(int i) {
    // Center
    if (i == 0) return vec2(0.0, 0.0);
    // Ring 1
    if (i == 1) return vec2(1.0, 0.0);
    if (i == 2) return vec2(0.5, 0.866);
    if (i == 3) return vec2(-0.5, 0.866);
    if (i == 4) return vec2(-1.0, 0.0);
    if (i == 5) return vec2(-0.5, -0.866);
    if (i == 6) return vec2(0.5, -0.866);
    // Ring 2
    if (i == 7) return vec2(2.0, 0.0);
    if (i == 8) return vec2(1.5, 0.866);
    if (i == 9) return vec2(0.5, 1.732);
    if (i == 10) return vec2(-0.5, 1.732);
    if (i == 11) return vec2(-1.5, 0.866);
    if (i == 12) return vec2(-2.0, 0.0);
    if (i == 13) return vec2(-1.5, -0.866);
    if (i == 14) return vec2(-0.5, -1.732);
    if (i == 15) return vec2(0.5, -1.732);
    if (i == 16) return vec2(1.5, -0.866);
    // Extras for circular shape
    if (i == 17) return vec2(1.0, 1.732);
    return vec2(-1.0, 1.732);
}

void main() {
    vec2 flippedCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y);

    // Calculate distance from focus point
    float dist = distance(flippedCoord, u_focusPoint);

    // Very shallow depth of field - everything except center is blurred
    float blurAmount = smoothstep(0.0, u_focusRange, dist) * u_maxBlur;

    vec4 color = vec4(0.0);
    float totalWeight = 0.0;

    vec2 pixelSize = 1.0 / u_resolution;

    // Sample using hexagonal bokeh pattern
    for (int i = 0; i < SAMPLES; i++) {
        vec2 pattern = getHexPattern(i);
        vec2 offset = pattern * blurAmount * pixelSize;
        vec2 sampleCoord = clamp(flippedCoord + offset, vec2(0.0), vec2(1.0));

        // Weight samples to create bokeh shape
        float weight = 1.0 - length(pattern) / 2.5;
        weight = max(weight, 0.1);

        color += texture(u_image, sampleCoord) * weight;
        totalWeight += weight;
    }

    fragColor = color / totalWeight;
}