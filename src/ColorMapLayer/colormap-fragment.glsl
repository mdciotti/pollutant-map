#define SHADER_NAME colormap-layer-fragment-shader
#ifdef GL_ES
precision highp float;
#endif

precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uData0Sampler;
uniform sampler2D uData1Sampler;
uniform sampler2D uColorScaleSampler;
uniform sampler2D uMapSampler;
uniform float k_noise;
uniform float k_alpha;
uniform float frame;
uniform vec2 texSize0;
uniform vec2 texSize1;
uniform int interpolationMode;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 circ(float theta) {
    return vec2(cos(theta), sin(theta));
}

vec2 generateGaussianNoise(float sigma, vec2 co) {
    float two_pi = 2.0*3.14159265358979323846;
    float epsilon = 0.0000000000001;
    vec2 u = vec2(rand(co), rand(co));
    vec2 z = sqrt(-2.0 * log(u)) * circ(two_pi * u.y);
    return z * sigma;
}

float bezier(float t, vec4 ww) {
    float s = 1.0 - t;
    vec4 ss = vec4(s*s*s, s*s, s, 1.0);
    vec4 tt = vec4(1.0, t, t*t, t*t*t);
    vec4 cc = vec4(1.0, 3.0, 3.0, 1.0);
    return dot(ww*ss*tt, cc);
}

float tang(float t, float k) {
    float pi = 3.141592653582;
    return tan(k*pi*(t - 0.5)) / (2.0*tan(0.5*k*pi));
}

vec4 cubic(float v)
{
    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;
    return vec4(x, y, z, w);
}

vec4 bicubic(sampler2D texture, vec2 texcoord, vec2 texSize)
{
    // vec2 texSize = textureSize(texture, 0);
    // vec2 texSize = vec2(8.0, 8.0);
    vec2 invTexSize = 1.0 / texSize;

    texcoord = texcoord * texSize - 0.5;

    vec2 fxy = fract(texcoord);
    texcoord -= fxy;

    vec4 xcubic = cubic(fxy.x);
    vec4 ycubic = cubic(fxy.y);

    vec4 c = texcoord.xxyy + vec2(-0.5, 1.5).xyxy;
    vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
    vec4 offset = c + vec4(xcubic.yw, ycubic.yw) / s;

    offset *= invTexSize.xxyy;
    vec4 sample0 = texture2D(texture, offset.xz);
    vec4 sample1 = texture2D(texture, offset.yz);
    vec4 sample2 = texture2D(texture, offset.xw);
    vec4 sample3 = texture2D(texture, offset.yw);

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix(
        mix(sample3, sample2, sx),
        mix(sample1, sample0, sx),
        sy
    );
}

float luma(vec4 a) {
    return dot(a.rgb, vec3(1.0)) / 3.0;
}

vec4 multiply(vec4 a, vec4 b) {
    return a * b;
}

vec4 screen(vec4 a, vec4 b) {
    return vec4(1.0) - (vec4(1.0) - a) * (vec4(1.0) - b);
}

vec4 overlay(vec4 a, vec4 b) {
    if (luma(a) < 0.5) return vec4(2.0) * a * b;
    else return vec4(1.0) - vec4(2.0) * (vec4(1.0) - a) * (vec4(1.0) - b);
}

void main() {
    vec4 samp0, samp1, samp;
    // if (interpolationMode == 0) {
    //     samp0 = bicubic(uData0Sampler, vTextureCoord, texSize0);
    //     samp1 = bicubic(uData1Sampler, vTextureCoord, texSize1);
    // } else {
        samp0 = texture2D(uData0Sampler, vTextureCoord);
        samp1 = texture2D(uData1Sampler, vTextureCoord);
    // }
    samp = mix(samp0, samp1, frame);
    // samp = samp0;

    float noise_uniform = rand(vTextureCoord);
    float noise = k_noise * tang(noise_uniform, sqrt(k_alpha));
    // float noise = k_noise * (noise_uniform - 0.5);

    float val = clamp(samp.r + noise, 0.0, 255.0 / 256.0);
    vec4 mapped_frag = texture2D(uColorScaleSampler, vec2(0.0, val));
    // vec4 bg_frag = texture2D(uMapSampler, vTextureCoord);
    // gl_FragColor = mix(mapped_frag, bg_frag, k_alpha);
    // gl_FragColor = (mapped_frag + bg_frag) / (vec4(1.0) + bg_frag);
    // gl_FragColor = overlay(mapped_frag, bg_frag);
    // gl_FragColor = mapped_frag;
    gl_FragColor = vec4(1.0);
}
