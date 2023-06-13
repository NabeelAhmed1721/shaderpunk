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

const int sampleCount = 50;
const float blur = 0.25;
const float falloff = 2.5;

// Credit: FlexMonkey @ https://www.shadertoy.com/view/4tlyD8
void main() {
    highp vec4 texelColor = texture(uFrame, aTextureCoord);

  vec2 direction = normalize(aTextureCoord - 0.5);
  vec2 velocity = direction * blur * pow(length(aTextureCoord - 0.5), falloff);
  float inverseSampleCount = 1.0 / float(sampleCount);

  mat3x2 increments = mat3x2(velocity * 1.0 * inverseSampleCount,
    velocity * 2.0 * inverseSampleCount,
    velocity * 4.0 * inverseSampleCount);

  vec3 accumulator = vec3(0);
  mat3x2 offsets = mat3x2(0);

  for (int i = 0; i < sampleCount; i++) {
    accumulator.r += texture(uFrame, aTextureCoord + offsets[0]).r;
    accumulator.g += texture(uFrame, aTextureCoord + offsets[1]).g;
    accumulator.b += texture(uFrame, aTextureCoord + offsets[2]).b;

    offsets -= increments;
  }

    oColor = vec4(accumulator / float(sampleCount), 1.0);
}