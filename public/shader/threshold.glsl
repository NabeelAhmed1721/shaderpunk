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

float average(vec4 color) {
  return (color.r + color.g + color.b) / 3.0;
}

void main() {
    highp vec4 texelColor = texture(uFrame, aTextureCoord);
    float avg = average(texelColor);
    float offset = -0.25; // adjust to your preference
  
    if(avg > 0.5 + offset) {
      oColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
      oColor = vec4(0, 0, 0, 1.0);
    }
}
