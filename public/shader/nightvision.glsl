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

// Credit: https://webcamtoy.com/
void main() {
    float r = texture(uFrame, aTextureCoord).r * 0.9;
    
    float radius = max(uResolution.x, uResolution.y) * 0.3;
    vec2 center = uResolution / 2.0;
    
    float dist = distance(uResolution * aTextureCoord, center);
    float attn = 1.0 - smoothstep(radius, radius * 2.0, dist);

    if (r > 0.5) {
        r = 1.0 - r;   
    }
    
    r = ((r - 0.5) * 1.25 + 0.55) * attn;
    
    oColor = vec4(r * 0.1, r * 1.75, r * 0.75, 1.0);
}