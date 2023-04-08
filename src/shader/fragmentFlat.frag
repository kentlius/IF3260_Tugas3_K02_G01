#version 300 es

precision highp float;

in vec4 fragColor;

out vec4 outColor;

vec4 linearToSrgb(in vec4 color) {
    return vec4(pow(clamp(color.rgb, 0.0, 1.0), vec3(2.2)), color.a);
}

void main() {
    outColor = linearToSrgb(fragColor);
}
