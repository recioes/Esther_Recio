/**
 * Shaders do globo. As cores chegam como uniforms (THREE.Color), já em espaço linear;
 * `colorspace_fragment` converte a saída para sRGB.
 */

export const SURFACE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

/** Dia e noite com crepúsculo rosa no terminador e brilho lilás na borda. */
export const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform vec3 sunDirection;
  uniform vec3 twilightColor;
  uniform vec3 rimColor;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    float sunDot = dot(normal, normalize(sunDirection));

    float dayAmount = smoothstep(-0.10, 0.22, sunDot);
    vec3 day = texture2D(dayMap, vUv).rgb * (0.38 + 0.62 * smoothstep(-0.1, 0.85, sunDot));
    vec3 night = texture2D(nightMap, vUv).rgb * 1.6 + texture2D(dayMap, vUv).rgb * 0.02;

    float twilight = exp(-pow(sunDot * 6.0, 2.0));
    vec3 color = mix(night, day, dayAmount) + twilightColor * twilight * 0.22;

    float fresnel = pow(1.0 - max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0), 3.0);
    color += rimColor * fresnel * (0.2 + 0.8 * smoothstep(-0.3, 0.6, sunDot));

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Camada de nuvens: densidade vem do canal vermelho; escurece no lado noturno. */
export const CLOUDS_FRAGMENT = /* glsl */ `
  uniform sampler2D cloudMap;
  uniform vec3 sunDirection;

  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    float density = texture2D(cloudMap, vUv).r;
    float sunDot = dot(normalize(vWorldNormal), normalize(sunDirection));
    float lit = smoothstep(-0.15, 0.35, sunDot);
    vec3 color = mix(vec3(0.015, 0.02, 0.04), vec3(1.0), lit);

    gl_FragColor = vec4(color, density * 0.82);
    #include <colorspace_fragment>
  }
`;

export const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vViewNormal;

  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Halo: só as faces de trás aparecem; a intensidade cai suavemente para fora. */
export const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 glowColor;

  varying vec3 vViewNormal;

  void main() {
    float depth = clamp(-vViewNormal.z, 0.0, 1.0);
    float intensity = pow(smoothstep(0.0, 0.5, depth), 2.0);

    gl_FragColor = vec4(glowColor * intensity * 1.5, intensity);
    #include <colorspace_fragment>
  }
`;
