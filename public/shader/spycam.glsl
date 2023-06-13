#version 300 es

precision highp float;

// in from pipeline
in highp vec2 aTextureCoord; // <x, y> (normalized by default)

// uniforms
uniform sampler2D uFrame; // current video frame
uniform float uTime; // current video time
uniform vec2 uResolution; // <width, height>

// out
out highp vec4 oColor;

#define PI 3.14159265

const vec3 tint = vec3(0.85, 1.1, 1.35);

float rand(vec2 r) {
    return clamp(fract(sin(dot(r, vec2(12.9898, 78.233))) * 437.5), 0.0, 1.0);
}

// Credit: https://webcamtoy.com/
void main() {
    highp vec4 texelColor = texture(uFrame, aTextureCoord);

    float b = mix(sin(aTextureCoord.x * PI), sin(aTextureCoord.y * PI), 0.5);

    float noise = rand(vec2(texelColor.g, atan(aTextureCoord.x, aTextureCoord.y)));

    float y = (aTextureCoord.y * uResolution.y) / 2.0;

    float tv = mix(b, mix(b / 2.0, abs(sin(y)) / 1.5, 0.5), 0.5) + noise / 16.0;

    vec3 c = vec3(texelColor.r * 0.3 + texelColor.g * 0.59 + texelColor.b * 0.11) * tint;
    
    oColor = vec4(((c - 0.5) * 4.0 + 1.0) * vec3(tv), 1.0);
}
