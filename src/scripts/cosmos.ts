import { BLACK_HOLE_FRAGMENT, COSMOS_VERTEX } from './cosmos-shaders';

/** Objetos distantes do fundo: canvas pequenos, com um único laço de animação. */
const MAX_PIXEL_RATIO = 1.5;
/** Instante desenhado na versão estática (prefers-reduced-motion ou economia de dados). */
const STATIC_TIME = 14;

const FRAGMENTS: Readonly<Record<string, string>> = {
  blackhole: BLACK_HOLE_FRAGMENT,
};

interface Scene {
  readonly canvas: HTMLCanvasElement;
  visible: boolean;
  draw(time: number): void;
  resize(): void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function link(gl: WebGLRenderingContext, fragment: string): WebGLProgram | null {
  const vertexShader = compile(gl, gl.VERTEX_SHADER, COSMOS_VERTEX);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vertexShader || !fragmentShader || !program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function createScene(canvas: HTMLCanvasElement, fragment: string): Scene | undefined {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
  });
  if (!gl) return undefined;
  const program = link(gl, fragment);
  if (!program) return undefined;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(program, 'uTime');

  return {
    canvas,
    visible: true,
    draw(time) {
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const size = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.width = size;
      canvas.height = size;
      gl.viewport(0, 0, size, size);
    },
  };
}

export function startCosmos(staticOnly: boolean): void {
  const scenes = [...document.querySelectorAll<HTMLCanvasElement>('[data-cosmos]')].flatMap(
    (canvas) => {
      const fragment = FRAGMENTS[canvas.dataset.cosmos ?? ''];
      const scene = fragment ? createScene(canvas, fragment) : undefined;
      return scene ? [scene] : [];
    },
  );
  if (scenes.length === 0) return;

  const drawStatic = (): void => {
    for (const scene of scenes) {
      scene.resize();
      scene.draw(STATIC_TIME);
    }
  };

  if (staticOnly) {
    drawStatic();
    window.addEventListener('resize', drawStatic);
    return;
  }

  let frame = 0;
  const tick = (now: number): void => {
    frame = 0;
    const active = scenes.filter((scene) => scene.visible);
    if (active.length === 0 || document.hidden) return;
    // O sombreador usa mediump: o relógio dá a volta antes de perder precisão.
    for (const scene of active) scene.draw((now / 1000) % 600);
    frame = requestAnimationFrame(tick);
  };
  const wake = (): void => {
    if (frame === 0) frame = requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const scene = scenes.find((candidate) => candidate.canvas === entry.target);
      if (scene) scene.visible = entry.isIntersecting;
    }
    wake();
  });

  const resizeAll = (): void => {
    for (const scene of scenes) scene.resize();
  };
  resizeAll();
  for (const scene of scenes) observer.observe(scene.canvas);
  window.addEventListener('resize', resizeAll);
  document.addEventListener('visibilitychange', wake);
}
