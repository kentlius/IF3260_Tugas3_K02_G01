#version 300 es

precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec4 color;
in uvec4 joint;
in vec4 weight;
in vec3 tangent;
in lowp int bitangent;

uniform mat4x3 modelMatrix;
uniform mat4 cameraMatrix;
uniform sampler2D boneTexture;

out vec3 fragPosition;
out vec3 fragNormal;
out vec2 fragUV;
out vec4 fragColor;
out vec3 fragTangent;
flat out lowp float fragBitangent;

vec4 srgbToLinear(in vec4 color) {
    return vec4(pow(clamp(color.rgb, 0.0, 1.0), vec3(1.0 / 2.2)), color.a);
}

mat4 getBoneMatrix(uint bone) {
    ivec2 v = ivec2(bone % 1024U, bone / 1024U);
    v.y *= 4;
    return mat4(
        texelFetch(boneTexture, v, 0),
        texelFetch(boneTexture, v + ivec2(1, 0), 0),
        texelFetch(boneTexture, v + ivec2(2, 0), 0),
        texelFetch(boneTexture, v + ivec2(3, 0), 0)
    );
}

void main() {
    mat4 boneMat1 = getBoneMatrix(joint.x);
    mat4 boneMat2 = getBoneMatrix(joint.y);
    mat4 boneMat3 = getBoneMatrix(joint.z);
    mat4 boneMat4 = getBoneMatrix(joint.w);
    vec4 temp = vec4(position, 1);
    vec4 weight_ = clamp(weight, 0.0, 1.0);
    weight_ /= max(weight_.x + weight_.y + weight_.z + weight_.w, 1.0);
    float cweight = clamp(1.0 - weight_.x - weight_.y - weight_.z - weight_.w, 0.0, 1.0);
    temp =
        boneMat1 * temp * weight_.x +
        boneMat2 * temp * weight_.y +
        boneMat3 * temp * weight_.z +
        boneMat4 * temp * weight_.w +
        temp * cweight;

    fragPosition = modelMatrix * vec4(temp.xyz / temp.w, 1);
    gl_Position = cameraMatrix * vec4(fragPosition, 1);

    mat3 basisMatrix = mat3(modelMatrix);
    fragNormal =
        mat3(boneMat1) * normal * weight_.x +
        mat3(boneMat2) * normal * weight_.y +
        mat3(boneMat3) * normal * weight_.z +
        mat3(boneMat4) * normal * weight_.w +
        normal * cweight;
    fragNormal = normalize(basisMatrix * fragNormal);
    fragTangent =
        mat3(boneMat1) * tangent * weight_.x +
        mat3(boneMat2) * tangent * weight_.y +
        mat3(boneMat3) * tangent * weight_.z +
        mat3(boneMat4) * tangent * weight_.w +
        tangent * cweight;
    fragTangent = normalize(basisMatrix * fragTangent);
    fragBitangent = (bitangent > 0) ? 1.0 : -1.0;

    fragUV = uv;
    fragColor = color;
    fragColor.rgb *= fragColor.a;
    fragColor = srgbToLinear(fragColor);
}
