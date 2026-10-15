import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  type ColorSpace,
  Euler,
  Float32BufferAttribute,
  Group,
  Mesh,
  NoColorSpace,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { joinBase } from '../lib/base-path';
import { boostEnvelope } from '../lib/boost';
import {
  applyDrag,
  cameraDistance,
  clamp,
  decayVelocity,
  dragRadiansPerPixel,
  pickTextureSet,
  type Rotation,
  viewRotation,
} from '../lib/globe-math';
import { type MarkerId, pickNearest } from '../lib/markers';
import { createRng, starPositions } from '../lib/stars';
import { sunDirectionForDate } from '../lib/sun';
import {
  ATMOSPHERE_FRAGMENT,
  ATMOSPHERE_VERTEX,
  CLOUDS_FRAGMENT,
  EARTH_FRAGMENT,
  SURFACE_VERTEX,
} from './globe-shaders';
import { createMarkerLayer } from './globe-markers';

/** Interface que mostra o rótulo de um ponto luminoso (implementada fora, em globe-tooltip.ts). */
export interface MarkerUi {
  show(id: MarkerId, x: number, y: number): void;
  move(x: number, y: number): void;
  hide(): void;
}

export interface GlobeOptions {
  readonly reducedMotion: boolean;
  readonly saveData: boolean;
  /** Toque/clique rápido no globo (sem arrastar e fora dos pontos luminosos). */
  readonly onTap?: () => void;
  readonly markerUi?: MarkerUi;
}

/** Controles que os easter eggs usam para mexer no globo. Sem efeito com movimento reduzido. */
export interface GlobeHandle {
  boost(multiplier: number, durationMs: number): void;
  dizzy(durationMs: number): void;
  setPalette(glow: number, twilight: number): void;
}

// Vista inicial centrada no Brasil. O sol segue a hora real do visitante (ver lib/sun.ts).
const INITIAL_VIEW = { lat: -12, lon: -50 } as const;
const SUN_REFRESH_MS = 30_000;
const HOVER_RADIUS_PX = 20;
const TAP_RADIUS_PX = 32;
const TAP_SLOP_PX = 6;
const TAP_MAX_MS = 350;
const PIN_MS = 3200;
const FOV_DEGREES = 38;
const MAX_PITCH = 1.1;
const MAX_VELOCITY = 3.5;
const AUTO_ROTATE_SPEED = 0.1; // rad/s (~1 volta por minuto)
const CLOUD_DRIFT_SPEED = 0.012; // rad/s relativo à superfície
const INERTIA_HALF_LIFE = 0.55;
const PITCH_RETURN_HALF_LIFE = 3.5;
const STAR_COUNT = 1100;
/** Elementos com efeito próprio (monograma, nome): arrastar o globo funciona, mas o toque não conta. */
const NO_TAP_SELECTOR = '[data-no-tap]';
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, summary, [data-no-drag]';

const PURPLE = 0x8b5cf6;
const PINK = 0xec4899;
const LILAC = 0xc4b5fd;

async function loadTexture(
  loader: TextureLoader,
  url: string,
  colorSpace: ColorSpace,
  anisotropy: number,
): Promise<Texture> {
  const texture = await loader.loadAsync(url);
  texture.colorSpace = colorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = RepeatWrapping; // evita a emenda em longitude ±180°
  return texture;
}

function createStars(pixelRatio: number): Points {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(starPositions(STAR_COUNT, createRng(2026), 40, 70), 3),
  );
  const material = new PointsMaterial({
    color: 0xffffff,
    size: 1.4 * pixelRatio,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  return new Points(geometry, material);
}

/** Monta o globo 3D dentro de `root`. Lança erro se WebGL ou as texturas falharem. */
export async function mountGlobe(root: HTMLElement, options: GlobeOptions): Promise<GlobeHandle> {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatio);

  const textureSet = pickTextureSet(
    Math.min(root.clientWidth, root.clientHeight),
    pixelRatio,
    options.saveData,
  );
  const textureUrl = (name: string): string =>
    joinBase(import.meta.env.BASE_URL, `textures/${name}`);
  const loader = new TextureLoader();
  const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  const [dayMap, nightMap, cloudMap] = await Promise.all([
    loadTexture(loader, textureUrl(`earth-day-${textureSet}.webp`), SRGBColorSpace, anisotropy),
    loadTexture(loader, textureUrl(`earth-night-${textureSet}.webp`), SRGBColorSpace, anisotropy),
    loadTexture(loader, textureUrl('earth-clouds-2k.webp'), NoColorSpace, anisotropy),
  ]);

  // Direção do Sol: fixa na superfície (referencial da textura) e girada junto com o globo.
  const sunLocal = new Vector3(...sunDirectionForDate(new Date()));
  const sunWorld = new Vector3();
  const sunEuler = new Euler();
  let sunUpdatedAt = 0;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV_DEGREES, 1, 0.1, 200);

  const globe = new Group();
  const earth = new Mesh(
    new SphereGeometry(1, 96, 64),
    new ShaderMaterial({
      vertexShader: SURFACE_VERTEX,
      fragmentShader: EARTH_FRAGMENT,
      uniforms: {
        dayMap: { value: dayMap },
        nightMap: { value: nightMap },
        sunDirection: { value: sunWorld },
        twilightColor: { value: new Color(PINK) },
        rimColor: { value: new Color(LILAC) },
      },
    }),
  );
  const clouds = new Mesh(
    new SphereGeometry(1.008, 96, 64),
    new ShaderMaterial({
      vertexShader: SURFACE_VERTEX,
      fragmentShader: CLOUDS_FRAGMENT,
      transparent: true,
      depthWrite: false,
      uniforms: { cloudMap: { value: cloudMap }, sunDirection: { value: sunWorld } },
    }),
  );
  globe.add(earth, clouds);
  const markers = createMarkerLayer(globe, !options.reducedMotion);

  const atmosphere = new Mesh(
    new SphereGeometry(1.14, 64, 48),
    new ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      uniforms: { glowColor: { value: new Color(PURPLE) } },
    }),
  );
  atmosphere.renderOrder = 1;

  const stars = createStars(pixelRatio);
  scene.add(stars, globe, atmosphere);

  // Estado mutável do loop de animação.
  const home: Rotation = viewRotation(INITIAL_VIEW.lat, INITIAL_VIEW.lon);
  let rotation: Rotation = home;
  let cloudDrift = 0;
  let velocityX = 0;
  let velocityY = 0;
  let radiansPerPixel = 0;
  let dragging = false;
  let activePointer = -1;
  let lastX = 0;
  let lastY = 0;
  let lastMoveTime = 0;
  let rafId = 0;
  let lastFrame = 0;
  let clock = 0;
  // Efeitos temporários dos easter eggs.
  let boostPeak = 1;
  let boostStart = 0;
  let boostDuration = 0;
  let dizzyStart = 0;
  let dizzyDuration = 0;
  // Interação com os pontos luminosos.
  let pointerX = 0;
  let pointerY = 0;
  let pointerOnGlobe = false;
  let pinnedId: MarkerId | undefined;
  let pinnedUntil = 0;
  let shownId: MarkerId | undefined;
  let downX = 0;
  let downY = 0;
  let downTime = 0;
  let downTarget: EventTarget | null = null;
  const viewEuler = new Euler();

  const resize = (): void => {
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = cameraDistance(width, height, FOV_DEGREES);
    camera.updateProjectionMatrix();
    radiansPerPixel = dragRadiansPerPixel(width, height);
    requestFrame();
  };

  const draw = (): void => {
    const wobble = boostEnvelope(clock - dizzyStart, dizzyDuration);
    const tilt = Math.sin((clock - dizzyStart) * 0.035) * 0.22 * wobble;
    globe.rotation.set(rotation.x, rotation.y, tilt);
    clouds.rotation.y = cloudDrift;
    stars.rotation.set(rotation.x * 0.04, rotation.y * 0.04, 0);

    if (clock - sunUpdatedAt > SUN_REFRESH_MS) {
      sunLocal.set(...sunDirectionForDate(new Date()));
      sunUpdatedAt = clock;
    }
    sunWorld.copy(sunLocal).applyEuler(sunEuler.set(rotation.x, rotation.y, 0));

    markers.animate(clock);
    renderer.render(scene, camera);
  };

  /** Mostra/move/esconde o rótulo do ponto luminoso sob o ponteiro (ou o que foi tocado). */
  const refreshMarkers = (): void => {
    const ui = options.markerUi;
    if (!ui) return;
    const screen = markers.project(
      viewEuler.set(rotation.x, rotation.y, globe.rotation.z),
      camera,
      root.clientWidth,
      root.clientHeight,
    );

    let target: (typeof screen)[number] | undefined;
    if (pinnedId !== undefined && clock < pinnedUntil) {
      target = screen.find((marker) => marker.id === pinnedId && marker.visible);
    } else {
      pinnedId = undefined;
      if (pointerOnGlobe && !dragging) {
        target = pickNearest(screen, pointerX, pointerY, HOVER_RADIUS_PX);
      }
    }

    if (!target) {
      if (shownId !== undefined) ui.hide();
      shownId = undefined;
    } else if (shownId !== target.id) {
      shownId = target.id;
      ui.show(target.id, target.x, target.y);
    } else {
      ui.move(target.x, target.y);
    }
  };

  const update = (dt: number): void => {
    if (dragging) return;

    if (Math.hypot(velocityX, velocityY) > 0.002) {
      rotation = {
        x: clamp(rotation.x + velocityX * dt, -MAX_PITCH, MAX_PITCH),
        y: rotation.y + velocityY * dt,
      };
      velocityX = decayVelocity(velocityX, dt, INERTIA_HALF_LIFE);
      velocityY = decayVelocity(velocityY, dt, INERTIA_HALF_LIFE);
    } else {
      velocityX = 0;
      velocityY = 0;
    }

    if (options.reducedMotion) return;

    const returnFactor = 1 - 0.5 ** (dt / PITCH_RETURN_HALF_LIFE);
    const speedUp = 1 + (boostPeak - 1) * boostEnvelope(clock - boostStart, boostDuration);
    rotation = {
      x: rotation.x + (home.x - rotation.x) * returnFactor,
      y: rotation.y + AUTO_ROTATE_SPEED * speedUp * dt,
    };
    cloudDrift += CLOUD_DRIFT_SPEED * dt;
  };

  const shouldAnimate = (): boolean => {
    if (document.hidden) return false;
    const moving = Math.hypot(velocityX, velocityY) > 0.002;
    return !options.reducedMotion || dragging || moving;
  };

  const frame = (now: number): void => {
    rafId = 0;
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    clock = now;
    update(dt);
    draw();
    refreshMarkers();
    if (shouldAnimate()) rafId = requestAnimationFrame(frame);
  };

  function requestFrame(): void {
    if (rafId !== 0) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  const isInteractive = (target: EventTarget | null): boolean =>
    target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;

  const html = document.documentElement;

  window.addEventListener('pointerdown', (event) => {
    if (dragging || event.button !== 0 || isInteractive(event.target)) return;
    dragging = true;
    activePointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    lastMoveTime = event.timeStamp;
    downX = event.clientX;
    downY = event.clientY;
    downTime = event.timeStamp;
    downTarget = event.target;
    velocityX = 0;
    velocityY = 0;
    html.classList.add('is-dragging', 'globe-dragged');
    requestFrame();
  });

  window.addEventListener(
    'pointermove',
    (event) => {
      if (!dragging || event.pointerId !== activePointer) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const dt = Math.max((event.timeStamp - lastMoveTime) / 1000, 1 / 240);
      rotation = applyDrag(rotation, dx, dy, radiansPerPixel, MAX_PITCH);
      // Média móvel da velocidade para a inércia ficar suave.
      velocityY = clamp(
        velocityY * 0.5 + ((dx * radiansPerPixel) / dt) * 0.5,
        -MAX_VELOCITY,
        MAX_VELOCITY,
      );
      velocityX = clamp(
        velocityX * 0.5 + ((dy * radiansPerPixel) / dt) * 0.5,
        -MAX_VELOCITY,
        MAX_VELOCITY,
      );
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveTime = event.timeStamp;
      requestFrame();
    },
    { passive: true },
  );

  /** Toque sobre um ponto luminoso fixa o rótulo por um tempo; fora dele, conta como toque no globo. */
  const handleTap = (x: number, y: number): void => {
    clock = performance.now();
    const screen = markers.project(
      viewEuler.set(rotation.x, rotation.y, globe.rotation.z),
      camera,
      root.clientWidth,
      root.clientHeight,
    );
    const hit = pickNearest(screen, x, y, TAP_RADIUS_PX);
    if (hit) {
      pinnedId = hit.id;
      pinnedUntil = clock + PIN_MS;
      refreshMarkers();
    } else {
      options.onTap?.();
    }
  };

  const endDrag = (event: PointerEvent): void => {
    if (!dragging || event.pointerId !== activePointer) return;
    dragging = false;
    html.classList.remove('is-dragging');
    const wasTap =
      event.type === 'pointerup' &&
      Math.hypot(event.clientX - downX, event.clientY - downY) < TAP_SLOP_PX &&
      event.timeStamp - downTime < TAP_MAX_MS &&
      !(downTarget instanceof Element && downTarget.closest(NO_TAP_SELECTOR));
    if (wasTap) handleTap(event.clientX, event.clientY);
    // Parou antes de soltar, ou prefere menos movimento: sem inércia.
    const pausedBeforeRelease = event.timeStamp - lastMoveTime > 80;
    if (pausedBeforeRelease || options.reducedMotion) {
      velocityX = 0;
      velocityY = 0;
    }
    requestFrame();
  };
  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerOnGlobe = event.pointerType === 'mouse' && !isInteractive(event.target);
      if (!dragging) {
        clock = performance.now();
        refreshMarkers();
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => {
    pointerOnGlobe = false;
    refreshMarkers();
  });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestFrame();
  });
  window.addEventListener('resize', resize);
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    if (rafId !== 0) cancelAnimationFrame(rafId);
    rafId = 0;
    html.classList.remove('globe-ready');
  });

  root.append(renderer.domElement);
  resize();
  draw();

  return {
    boost(multiplier, durationMs) {
      if (options.reducedMotion) return;
      boostPeak = Math.max(1, multiplier);
      boostStart = performance.now();
      boostDuration = durationMs;
      requestFrame();
    },
    dizzy(durationMs) {
      if (options.reducedMotion) return;
      dizzyStart = performance.now();
      dizzyDuration = durationMs;
      requestFrame();
    },
    setPalette(glow, twilight) {
      (atmosphere.material as ShaderMaterial).uniforms.glowColor?.value.set(glow);
      (earth.material as ShaderMaterial).uniforms.twilightColor?.value.set(twilight);
      requestFrame();
    },
  };
}
