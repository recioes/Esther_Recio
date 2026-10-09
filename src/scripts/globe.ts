import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  type ColorSpace,
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
import { createRng, starPositions } from '../lib/stars';
import {
  ATMOSPHERE_FRAGMENT,
  ATMOSPHERE_VERTEX,
  CLOUDS_FRAGMENT,
  EARTH_FRAGMENT,
  SURFACE_VERTEX,
} from './globe-shaders';

export interface GlobeOptions {
  readonly reducedMotion: boolean;
  readonly saveData: boolean;
}

// Vista inicial centrada no Brasil; sol vindo da esquerda-frente.
const INITIAL_VIEW = { lat: -12, lon: -50 } as const;
const SUN_DIRECTION = new Vector3(-0.75, 0.38, 0.62).normalize();
const FOV_DEGREES = 38;
const MAX_PITCH = 1.1;
const MAX_VELOCITY = 3.5;
const AUTO_ROTATE_SPEED = 0.1; // rad/s (~1 volta por minuto)
const CLOUD_DRIFT_SPEED = 0.012; // rad/s relativo à superfície
const INERTIA_HALF_LIFE = 0.55;
const PITCH_RETURN_HALF_LIFE = 3.5;
const STAR_COUNT = 1100;
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
export async function mountGlobe(root: HTMLElement, options: GlobeOptions): Promise<void> {
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
        sunDirection: { value: SUN_DIRECTION },
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
      uniforms: { cloudMap: { value: cloudMap }, sunDirection: { value: SUN_DIRECTION } },
    }),
  );
  globe.add(earth, clouds);

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
    globe.rotation.set(rotation.x, rotation.y, 0);
    clouds.rotation.y = cloudDrift;
    stars.rotation.set(rotation.x * 0.04, rotation.y * 0.04, 0);
    renderer.render(scene, camera);
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
    rotation = {
      x: rotation.x + (home.x - rotation.x) * returnFactor,
      y: rotation.y + AUTO_ROTATE_SPEED * dt,
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
    update(dt);
    draw();
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

  const endDrag = (event: PointerEvent): void => {
    if (!dragging || event.pointerId !== activePointer) return;
    dragging = false;
    html.classList.remove('is-dragging');
    // Parou antes de soltar, ou prefere menos movimento: sem inércia.
    const pausedBeforeRelease = event.timeStamp - lastMoveTime > 80;
    if (pausedBeforeRelease || options.reducedMotion) {
      velocityX = 0;
      velocityY = 0;
    }
    requestFrame();
  };
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
}
