// A 1-bit dithered image the pointer burns through to the original, knitting back cell by cell.
// Ported to plain WebGL2 from React Bits' DitherVeil (Floyd–Steinberg pattern only).
// Copyright (c) 2026 David Haz — MIT + Commons Clause, see react-bits.LICENSE.txt.
// Ink is transparent here, so whatever sits behind the canvas shows through.

const FLOYD = [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]];
const MASK_SCALE = 0.5;
const MAX_BURSTS = 4;
const BURST_SECONDS = 1.2;
const HOLD = 1.6;
const INTRO_MS = 1100;

// Serpentine error diffusion of the graded luminance into `levels` grey steps; RGBA out.
export function diffuse(pixels, cols, rows, levels, grade) {
  const values = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    values[i] = grade((0.2126 * pixels[i * 4] + 0.7152 * pixels[i * 4 + 1] + 0.0722 * pixels[i * 4 + 2]) / 255);
  }
  const steps = levels - 1;
  const out = new Uint8Array(cols * rows * 4);
  for (let y = 0; y < rows; y++) {
    const dir = y & 1 ? -1 : 1;
    for (let i = 0; i < cols; i++) {
      const x = dir > 0 ? i : cols - 1 - i;
      const p = y * cols + x;
      const q = Math.min(steps, Math.max(0, Math.round(values[p] * steps))) / steps;
      const err = values[p] - q;
      out[p * 4] = out[p * 4 + 1] = out[p * 4 + 2] = Math.round(q * 255);
      out[p * 4 + 3] = 255;
      for (const [dx, dy, weight] of FLOYD) {
        const nx = x + dx * dir;
        const ny = y + dy;
        if (nx >= 0 && nx < cols && ny < rows) values[ny * cols + nx] += err * weight;
      }
    }
  }
  return out;
}

export const gradeFor = ({ contrast, brightness }) => v =>
  Math.pow(Math.min(1, Math.max(0, (v - 0.5) * contrast + 0.5 + brightness)), 1.6);

const vertex = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const maskFragment = `#version 300 es
precision highp float;
uniform sampler2D tPrev;
uniform vec2 uSize, uFrom, uTo;
uniform float uRadius, uSoftness, uStrength, uFade, uHold;
in vec2 vUv;
out vec4 fragColor;
float strokeDistance(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  return length(p - a - ab * h);
}
void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  float trail = max(texture(tPrev, vUv).r - uFade, 0.0);
  float band = max(uRadius * uSoftness, 1.0) * uHold;
  trail = max(trail, clamp((uRadius - strokeDistance(p, uFrom, uTo)) / band, 0.0, 1.0) * uStrength);
  fragColor = vec4(trail, 0.0, 0.0, 1.0);
}`;

const viewFragment = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D tImage, tMask, tDiffused;
uniform vec2 uResolution, uSize;
uniform float uCell, uIntro, uHold, uBurstWidth;
uniform vec3 uPaper;
uniform vec4 uBursts[4];
in vec2 vUv;
out vec4 fragColor;
float bayer(vec2 cell) {
  ivec2 p = ivec2(mod(cell, 8.0));
  int v = p.x ^ p.y;
  int m = ((v & 1) << 5) | ((p.y & 1) << 4) | ((v & 2) << 2) | ((p.y & 2) << 1) | ((v & 4) >> 1) | ((p.y & 4) >> 2);
  return (float(m) + 0.5) / 64.0;
}
float shockwave(vec2 p) {
  float value = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 burst = uBursts[i];
    if (burst.w <= 0.0) continue;
    float offset = distance(p, burst.xy) - burst.z;
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * burst.w);
  }
  return value;
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 cell = floor(px / uCell);
  vec2 cellUv = vec2((cell.x + 0.5) * uCell / uResolution.x, 1.0 - (cell.y + 0.5) * uCell / uResolution.y);
  vec3 color = uPaper * texelFetch(tDiffused, ivec2(cell), 0).r;
  vec3 photo = texture(tImage, vUv).rgb;
  float mask = max(clamp(texture(tMask, cellUv).r * uHold, 0.0, 1.0),
    shockwave(vec2(cellUv.x, 1.0 - cellUv.y) * uSize));
  color = mix(color, photo, step(bayer(cell.yx), mask));
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  float spread = length((cellUv - 0.5) * aspect) / length(aspect * 0.5);
  float appear = step(spread * 0.72 + bayer(cell + vec2(3.0, 5.0)) * 0.28, uIntro * 1.001);
  // Premultiplied: black reads as fully transparent, white as opaque.
  color *= appear;
  fragColor = vec4(color, max(color.r, max(color.g, color.b)));
}`;

const hexToRgb = hex => [0, 2, 4].map(i => parseInt(hex.slice(1 + i, 3 + i), 16) / 255);

function program(gl, fragment) {
  const shader = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, shader(gl.VERTEX_SHADER, vertex));
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const uniforms = {};
  for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
    const { name } = gl.getActiveUniform(p, i);
    uniforms[name.replace('[0]', '')] = gl.getUniformLocation(p, name);
  }
  return { p, uniforms };
}

function texture(gl, filter) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

// Returns false when WebGL2 is unavailable, so the caller keeps its static fallback.
// `compose(context, width, height)` paints the source image at device-pixel size.
export function ditherVeil(container, compose, s) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
  if (!gl) return false;
  const floatMask = !!gl.getExtension('EXT_color_buffer_float');
  const mask = program(gl, maskFragment);
  const view = program(gl, viewFragment);
  const imageTexture = texture(gl, gl.LINEAR);
  const diffusedTexture = texture(gl, gl.NEAREST);
  const source = document.createElement('canvas');
  const sourceContext = source.getContext('2d', { willReadFrequently: true });
  const sampler = document.createElement('canvas');
  const samplerContext = sampler.getContext('2d', { willReadFrequently: true });
  const grade = gradeFor(s);
  let masks = [];
  let width = 1, height = 1, dpr = 1, cell = 1;
  let raf = 0, last = performance.now(), introStart = performance.now(), trailUntil = 0, presence = 0, drift = 0;
  const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false };
  const brush = { x: 0, y: 0, px: 0, py: 0 };
  const bursts = [];
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);

  const createMask = (w, h) => {
    const t = texture(gl, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, floatMask ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA,
      floatMask ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    const buffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { t, buffer, w, h };
  };

  const layout = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    canvas.width = source.width = Math.round(width * dpr);
    canvas.height = source.height = Math.round(height * dpr);
    cell = Math.max(1, Math.round(s.pixelSize * dpr));
    for (const m of masks) { gl.deleteFramebuffer(m.buffer); gl.deleteTexture(m.t); }
    const mw = Math.max(2, Math.round(width * MASK_SCALE));
    const mh = Math.max(2, Math.round(height * MASK_SCALE));
    masks = [createMask(mw, mh), createMask(mw, mh)];
    if (!pointer.placed) { pointer.x = width / 2; pointer.y = height / 2; }

    sourceContext.fillStyle = '#000';
    sourceContext.fillRect(0, 0, source.width, source.height);
    compose(sourceContext, source.width, source.height);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    const cols = Math.ceil(canvas.width / cell);
    const rows = Math.ceil(canvas.height / cell);
    sampler.width = cols;
    sampler.height = rows;
    samplerContext.imageSmoothingQuality = 'high';
    samplerContext.drawImage(source, 0, 0, cols * cell, rows * cell, 0, 0, cols, rows);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, diffusedTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      diffuse(samplerContext.getImageData(0, 0, cols, rows).data, cols, rows, s.levels, grade));
  };

  const draw = (p, target, w, h) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.viewport(0, 0, w, h);
    gl.useProgram(p);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const bind = (unit, location, t) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.uniform1i(location, unit);
  };

  const frame = now => {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    let targetX = pointer.x;
    let targetY = pointer.y;
    if (!pointer.inside && s.wander) {
      drift = Math.min(1, drift + dt / 1.2);
      const t = now / 1000;
      const k = drift * drift * (3 - 2 * drift);
      targetX += (width * (0.5 + 0.33 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)) - targetX) * k;
      targetY += (height * (0.5 + 0.28 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57)) - targetY) * k;
    } else {
      drift = 0;
    }
    presence += ((pointer.inside || s.wander ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.16));
    if (pointer.fresh) {
      brush.x = brush.px = targetX;
      brush.y = brush.py = targetY;
      pointer.fresh = false;
    } else {
      const follow = 1 - Math.exp(-dt / 0.035);
      brush.x += (targetX - brush.x) * follow;
      brush.y += (targetY - brush.y) * follow;
    }

    const burstWidth = Math.max(60, s.revealRadius * 0.9);
    const burstData = new Float32Array(MAX_BURSTS * 4);
    for (let i = bursts.length - 1; i >= 0; i--) {
      if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);
    }
    bursts.forEach((b, i) => {
      const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS);
      const reach = Math.hypot(Math.max(b.x, width - b.x), Math.max(b.y, height - b.y)) + burstWidth;
      burstData.set([b.x, b.y, reach * Math.sin((k * Math.PI) / 2), 1 - k * k * k], i * 4);
    });
    if (presence > 0.002) trailUntil = now + s.linger * 1000 + 150;

    const u = mask.uniforms;
    gl.useProgram(mask.p);
    bind(0, u.tPrev, masks[0].t);
    gl.uniform2f(u.uSize, width, height);
    gl.uniform2f(u.uFrom, brush.px, brush.py);
    gl.uniform2f(u.uTo, brush.x, brush.y);
    gl.uniform1f(u.uRadius, s.revealRadius * (0.45 + 0.55 * presence));
    gl.uniform1f(u.uSoftness, s.softness);
    gl.uniform1f(u.uStrength, presence);
    gl.uniform1f(u.uFade, Math.max(s.linger > 0 ? dt / s.linger : 1, floatMask ? 0 : 1.5 / 255));
    gl.uniform1f(u.uHold, HOLD);
    draw(mask.p, masks[1].buffer, masks[1].w, masks[1].h);
    masks.reverse();
    brush.px = brush.x;
    brush.py = brush.y;

    const intro = Math.min(1, (now - introStart) / INTRO_MS);
    const v = view.uniforms;
    gl.useProgram(view.p);
    bind(0, v.tImage, imageTexture);
    bind(1, v.tMask, masks[0].t);
    bind(2, v.tDiffused, diffusedTexture);
    gl.uniform2f(v.uResolution, canvas.width, canvas.height);
    gl.uniform2f(v.uSize, width, height);
    gl.uniform1f(v.uCell, cell);
    gl.uniform1f(v.uIntro, 1 - (1 - intro) ** 2);
    gl.uniform1f(v.uHold, HOLD);
    gl.uniform1f(v.uBurstWidth, burstWidth);
    gl.uniform3fv(v.uPaper, hexToRgb(s.paperColor));
    gl.uniform4fv(v.uBursts, burstData);
    draw(view.p, null, canvas.width, canvas.height);

    if (pointer.inside || s.wander || presence > 0.002 || bursts.length || now < trailUntil || intro < 1) {
      raf = requestAnimationFrame(frame);
    }
  };

  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const onMove = e => {
    const rect = container.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.placed = true;
    if (!pointer.inside) { pointer.inside = true; pointer.fresh = true; }
    wake();
  };
  const onLeave = () => { pointer.inside = false; wake(); };
  container.addEventListener('pointermove', onMove, { passive: true });
  container.addEventListener('pointerenter', onMove, { passive: true });
  container.addEventListener('pointerdown', e => {
    onMove(e);
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() });
    if (bursts.length > MAX_BURSTS) bursts.shift();
  }, { passive: true });
  container.addEventListener('pointerleave', onLeave, { passive: true });
  container.addEventListener('pointercancel', onLeave, { passive: true });
  // The observer's first callback performs the initial layout.
  new ResizeObserver(() => { layout(); wake(); }).observe(container);
  return true;
}
