import {
  DoubleSide,
  type Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  type PerspectiveCamera,
  RingGeometry,
  SphereGeometry,
  Vector3,
} from 'three';
import { latLonToVector } from '../lib/globe-math';
import { GLOBE_MARKERS, isFacingCamera, type MarkerId } from '../lib/markers';

/** Logo acima da camada de nuvens (1.008) para o ponto não ser apagado por elas. */
const SURFACE_RADIUS = 1.012;
const PULSE_PERIOD_MS = 2200;
const DOT_COLOR = 0xffd6ee;
const RING_COLOR = 0xf9a8d4;
const FORWARD = new Vector3(0, 0, 1);

export interface ScreenMarker {
  readonly id: MarkerId;
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
}

export interface MarkerLayer {
  /** Pulsa os anéis (chame a cada quadro). */
  animate(timeMs: number): void;
  /** Posição de cada marcador na tela (px) para a rotação atual do globo. */
  project(
    rotation: Euler,
    camera: PerspectiveCamera,
    width: number,
    height: number,
  ): ScreenMarker[];
}

/** Cria os pontos luminosos (ponto + anel pulsante) como filhos de `globe`, para girarem com ele. */
export function createMarkerLayer(globe: Group, pulse: boolean): MarkerLayer {
  const dotGeometry = new SphereGeometry(0.014, 16, 12);
  const ringGeometry = new RingGeometry(0.022, 0.03, 40);
  const entries = GLOBE_MARKERS.map((marker) => {
    const normal = new Vector3(...latLonToVector(marker.lat, marker.lon));
    const holder = new Group();
    holder.position.copy(normal).multiplyScalar(SURFACE_RADIUS);

    const dot = new Mesh(dotGeometry, new MeshBasicMaterial({ color: DOT_COLOR }));
    const ring = new Mesh(
      ringGeometry,
      new MeshBasicMaterial({
        color: RING_COLOR,
        transparent: true,
        opacity: 0.8,
        side: DoubleSide,
        depthWrite: false,
      }),
    );
    // O anel nasce no plano XY (olhando +Z); alinha com a normal da superfície.
    ring.quaternion.setFromUnitVectors(FORWARD, normal);
    ring.position.copy(holder.position);
    holder.add(dot);
    globe.add(holder, ring);
    return { id: marker.id, normal, ring };
  });

  const scratch = new Vector3();

  return {
    animate(timeMs) {
      if (!pulse) return;
      for (const [index, entry] of entries.entries()) {
        const phase = ((timeMs + index * 700) % PULSE_PERIOD_MS) / PULSE_PERIOD_MS;
        entry.ring.scale.setScalar(1 + phase * 2.4);
        (entry.ring.material as MeshBasicMaterial).opacity = 0.85 * (1 - phase);
      }
    },
    project(rotation, camera, width, height) {
      camera.updateMatrixWorld();
      return entries.map((entry) => {
        scratch.copy(entry.normal).applyEuler(rotation);
        const visible = isFacingCamera(scratch.z, camera.position.z);
        scratch.multiplyScalar(SURFACE_RADIUS).project(camera);
        return {
          id: entry.id,
          x: ((scratch.x + 1) / 2) * width,
          y: ((1 - scratch.y) / 2) * height,
          visible,
        };
      });
    },
  };
}
