#include ./noises/simplex.glsl

attribute vec4 tangent;

uniform float uTime;
uniform float Speed;
uniform float PositionFactor;
uniform float OutputFactor;
uniform float DisplaceFactor;

float GetBlob(vec3 position, float t) {
    vec3 noised = position;
    noised += snoise(vec4(position * PositionFactor, t * Speed)) * OutputFactor * 0.05;
    return snoise(vec4(noised, 0.3)) * DisplaceFactor * 0.1;
}

void main() {
    vec3 T = normalize(tangent.xyz);
    vec3 B = normalize(cross(normal, T) * tangent.w);

    float diff = 0.1;

    // Displace the main position
    float centerHeight = GetBlob(csm_Position, uTime);
    csm_Position += normal * centerHeight;

    // Offset in tangent and bitangent directions
    vec3 posT = csm_Position + T * diff;
    vec3 posB = csm_Position + B * diff;

    // Displace offsets too (sample terrain shape)
    posT += normal * GetBlob(posT, uTime);
    posB += normal * GetBlob(posB, uTime);

    // Derive displaced normal from surrounding samples
    vec3 tangentVec = normalize(posT - csm_Position);
    vec3 bitangentVec = normalize(posB - csm_Position);
    csm_Normal = normalize(cross(tangentVec, bitangentVec));
}
