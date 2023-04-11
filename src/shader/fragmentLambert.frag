#version 300 es

precision highp float;

const vec3 lightDir = vec3(1.0, 1.0, -1.0);
const lowp vec3 Ka = vec3(0.5, 0.5, 0.5);
const lowp vec3 Kd = vec3(0.3, 0.3, 0.3);

uniform sampler2D baseTexture;
uniform vec4 baseTextureFactor;
uniform sampler2D normalTexture;
uniform float normalScale;

in vec3 fragPosition;
in vec3 fragNormal;
in vec2 fragUV;
in vec4 fragColor;
in vec3 fragTangent;
flat in lowp float fragBitangent;

out vec4 outColor;

vec4 srgbToLinear(in vec4 color) {
    return vec4(pow(clamp(color.rgb, 0.0, 1.0), vec3(1.0 / 2.2)), color.a);
}

vec4 linearToSrgb(in vec4 color) {
    return vec4(pow(clamp(color.rgb, 0.0, 1.0), vec3(2.2)), color.a);
}

void orthonormalize(inout mat3 mat) {
    mat[1] -= dot(mat[0], mat[1]) * mat[1];
    mat[2] -= dot(mat[0], mat[2]) * mat[2];
    mat[2] -= dot(mat[1], mat[2]) * mat[2];
    mat[0] = normalize(mat[0]);
    mat[1] = normalize(mat[1]);
    mat[2] = normalize(mat[2]);
}

void main() {
    vec4 color = texture(baseTexture, fragUV);
    color.rgb *= color.a;
    color = srgbToLinear(color) * fragColor * baseTextureFactor;

    mat3 tangentSpace = mat3(
        cross(fragNormal, fragTangent) * sign(fragBitangent),
        fragTangent,
        fragNormal
    );

    orthonormalize(tangentSpace);

    vec3 normal = (texture(normalTexture, fragUV).xyz - 0.5) * 2.0;
    normal = normalScale * (tangentSpace * normal);

    float lambert = dot(normal, normalize(lightDir));

    vec3 light = color.rgb;
    light = light * Ka + light * max(lambert, 0.0) * Kd;
    outColor = linearToSrgb(vec4(light, color.a));
}
