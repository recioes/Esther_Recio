export const COSMOS_VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const COMMON = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float stars(vec2 p, float scale) {
  vec2 cell = p * scale;
  vec2 id = floor(cell);
  float seed = hash(id);
  if (seed < 0.8) return 0.0;
  vec2 offset = vec2(hash(id + 3.0), hash(id + 7.0)) * 0.6 - 0.3;
  float glow = smoothstep(0.16, 0.0, length(fract(cell) - 0.5 - offset));
  return glow * (0.65 + 0.35 * sin(uTime * (1.0 + seed * 2.0) + seed * 40.0));
}

vec2 rotate(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float band(float value, float center, float width) {
  float d = (value - center) / width;
  return exp(-d * d);
}

vec4 present(vec3 color, float solid, float radius, float fadeFrom) {
  float fade = smoothstep(1.0, fadeFrom, radius);
  vec3 faded = color * fade;
  float light = max(faded.r, max(faded.g, faded.b));
  return vec4(faded, clamp(max(light * 1.4, solid * fade), 0.0, 1.0));
}
`;

/** Buraco negro: estrelas desviadas pela lente, disco girando e anel de fótons que pulsa. */
export const BLACK_HOLE_FRAGMENT = `${COMMON}
const float SHADOW = 0.3;
const float EINSTEIN_SQUARED = 0.09;
const float TILT = 0.3;

void main() {
  vec2 uv = vUv;
  float r = length(uv) + 0.001;
  float pulse = 1.0 + 0.15 * sin(uTime * 1.3);

  vec2 lensed = uv * (1.0 - EINSTEIN_SQUARED / (r * r));
  vec3 color = vec3(stars(lensed, 13.0)) * vec3(1.0, 0.92, 0.86);
  color *= smoothstep(SHADOW - 0.01, SHADOW + 0.06, r);

  vec2 disc = vec2(uv.x, uv.y / TILT);
  float radius = length(disc);
  vec2 swirl = rotate(disc, uTime * 0.9 / (radius + 0.2));
  float gas = noise(swirl * 6.0) * 0.6 + noise(swirl * 13.0) * 0.4;
  float ring = smoothstep(0.34, 0.42, radius) * smoothstep(0.95, 0.5, radius);
  float behind = uv.y > 0.0 ? smoothstep(SHADOW, SHADOW + 0.02, r) : 1.0;
  float doppler = 1.0 - 0.65 * disc.x / (radius + 0.05);
  vec3 hot = mix(vec3(1.0, 0.86, 0.62), vec3(1.0, 0.4, 0.16), smoothstep(0.38, 0.62, radius));
  vec3 gasColor = mix(hot, vec3(0.9, 0.16, 0.44), smoothstep(0.58, 0.92, radius));
  color += gasColor * gas * ring * behind * doppler * 1.5;

  vec2 haloSwirl = rotate(uv, uTime * 1.6);
  float halo = band(r, 0.35, 0.04) * (0.55 + 0.45 * noise(haloSwirl * 9.0));
  color += vec3(1.0, 0.56, 0.26) * halo * pulse;
  color += vec3(1.0, 0.92, 0.82) * band(r, 0.312, 0.011) * pulse;
  color += vec3(0.8, 0.16, 0.42) * exp(-r * 3.4) * 0.28 * pulse;

  float shadow = (1.0 - smoothstep(SHADOW - 0.02, SHADOW + 0.02, r)) * 0.96;
  gl_FragColor = present(color, shadow, r, 0.6);
}
`;
