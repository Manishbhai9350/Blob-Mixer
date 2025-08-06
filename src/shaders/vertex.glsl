#include ./noises/simplex.glsl



uniform float uTime;
uniform float Speed;
uniform float PositionFactor;
uniform float OutputFactor;
uniform int Steps;

float GetBlob(vec3 position, float t) {
    float noised = 0.0;

    vec4 noiseInput = vec4(position * PositionFactor, t * Speed);
    noised += snoise(noiseInput) * OutputFactor;


    return noised;
}

void main(){
    csm_Position += normal *  GetBlob(csm_Position,uTime);
}