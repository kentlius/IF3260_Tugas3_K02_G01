#version 300 es

precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec4 color;
in uvec4 joint;
in vec4 weight;
in vec3 tangent;
in uint bitangent;

uniform mat4x3 modelMatrix;
uniform mat4 cameraMatrix;

out vec3 fragPosition;
out vec3 fragNormal;
out vec2 fragUV;
out vec4 fragColor;
out vec3 fragTangent;
flat out lowp float fragBitangent;

vec4 srgbToLinear(in vec4 color) {
    return vec4(pow(clamp(color.rgb, 0.0, 1.0), vec3(1.0 / 2.2)), color.a);
}

void main() {
    fragPosition = modelMatrix * vec4(position, 1);
    gl_Position = cameraMatrix * vec4(fragPosition, 1);

    mat3 basisMatrix = mat3(modelMatrix);
    fragNormal = normalize(basisMatrix * normal);
    fragTangent = normalize(basisMatrix * tangent);
    fragBitangent = (bitangent > 0U) ? 1.0 : -1.0;

    fragUV = uv;
    fragColor = color;
    fragColor.rgb *= fragColor.a;
    fragColor = srgbToLinear(fragColor);
}
