/** Rastro de poeira estelar atrás do mouse. Só com ponteiro preciso e sem "reduzir movimento". */
export interface CursorTrail {
  /** Liga/desliga; devolve o novo estado. */
  toggle(): boolean;
  /** Relê as cores do tema atual. */
  refreshColors(): void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
}

const MAX_PARTICLES = 140;

export function createCursorTrail(): CursorTrail | undefined {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return undefined;
  const canvas = context.canvas;
  canvas.className = 'trail-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);

  let particles: Particle[] = [];
  let enabled = true;
  let rafId = 0;
  let lastTime = 0;
  let lastX = Number.NaN;
  let lastY = Number.NaN;
  let colors = ['#ffffff', '#f9a8d4', '#c4b5fd'];

  const readColors = (): string[] => {
    const style = getComputedStyle(document.documentElement);
    const pick = (name: string, fallback: string): string =>
      style.getPropertyValue(name).trim() || fallback;
    return ['#ffffff', pick('--color-pink-300', '#f9a8d4'), pick('--color-purple-500', '#8b5cf6')];
  };

  const resize = (): void => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const frame = (now: number): void => {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.globalCompositeOperation = 'lighter';

    particles = particles.filter((particle) => particle.age < particle.life);
    for (const particle of particles) {
      particle.age += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 40 * dt;
      const fade = 1 - particle.age / particle.life;
      context.globalAlpha = Math.max(0, fade);
      context.fillStyle = particle.color;
      const radius = particle.size * (0.4 + 0.6 * fade);
      context.beginPath();
      context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      context.fill();
      // Brilho em cruz, como uma estrelinha.
      context.fillRect(particle.x - radius * 2.2, particle.y - 0.5, radius * 4.4, 1);
      context.fillRect(particle.x - 0.5, particle.y - radius * 2.2, 1, radius * 4.4);
    }

    rafId = particles.length > 0 && enabled ? requestAnimationFrame(frame) : 0;
    if (rafId === 0) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };

  const spawn = (x: number, y: number): void => {
    const distance = Number.isNaN(lastX) ? 0 : Math.hypot(x - lastX, y - lastY);
    lastX = x;
    lastY = y;
    const amount = Math.min(3, Math.max(1, Math.ceil(distance / 14)));
    for (let index = 0; index < amount; index += 1) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 36,
        vy: (Math.random() - 0.5) * 36 - 10,
        age: 0,
        life: 0.55 + Math.random() * 0.5,
        size: 1.2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff',
      });
    }
    if (rafId === 0) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      if (!enabled || event.pointerType !== 'mouse') return;
      spawn(event.clientX, event.clientY);
    },
    { passive: true },
  );
  window.addEventListener('resize', resize);
  document.documentElement.addEventListener('mouseleave', () => {
    lastX = Number.NaN;
    lastY = Number.NaN;
  });
  resize();
  colors = readColors();

  return {
    toggle() {
      enabled = !enabled;
      if (!enabled) {
        particles = [];
        if (rafId !== 0) cancelAnimationFrame(rafId);
        rafId = 0;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
      return enabled;
    },
    refreshColors() {
      colors = readColors();
    },
  };
}
