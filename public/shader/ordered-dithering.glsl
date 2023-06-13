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

const mat4x4 threshold = mat4x4(
  0.,     8.,     2.,     10., 
  12.,    4.,     14.,    6.,
  3.,     11.,    1.,     9.,
  15.,    7.,     13.,    5.
);

float findClosest(int x, int y, float v) {
    mat4x4 thresholdT = transpose(threshold);
    float t = (thresholdT[x][y]) / 16.;
    if(v < t) {
      	return 0.;   
    } else {
     	return 1.;   
    }
}

// Credit: luka712 @ https://www.shadertoy.com/view/4lcyzn
void main() {
    highp vec4 texelColor = texture(uFrame, aTextureCoord);

    int x = int(aTextureCoord.x * uResolution.x) % 4;
    int y = int(aTextureCoord.y * uResolution.y) % 4;

	float lum = dot(vec3(0.2126, 0.7152, 0.0722), texelColor.rgb);
  
    lum = findClosest(x, y, lum);
 
    oColor = vec4(vec3(lum), 1.0);
}
