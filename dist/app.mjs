import { ditherVeil } from './dither-veil.mjs';
import { lightRays } from './light-rays.mjs';

const stage = document.querySelector('.stage');
const lockup = document.querySelector('.lockup');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reduced motion renders the rays once, frozen, with no pointer reactions.
lightRays(stage, {
  color: [1, 1, 1],
  speed: still ? 0 : 1,
  spread: 0.5,
  length: 3,
  glow: 0.6,
  haze: 0.25,
  follow: !still,
  influence: 0.1,
  density: 1,
  tilt: 0,
  sharpness: 0.35,
  atmosphere: 1,
  intensity: 1,
  fade: 1,
  saturation: 1,
  noise: 0,
  distortion: 0,
  pulsating: false,
  cursorShadow: !still,
  clickPulse: !still,
  intro: !still,
});

// Reduced motion keeps the static lockup; so does a browser without WebGL2.
if (!still) {
  await lockup.decode();
  const started = ditherVeil(stage, (context, width) => {
    // The static lockup's CSS box is the one layout: the canvas paints the image exactly there.
    const scale = width / stage.clientWidth;
    const box = lockup.getBoundingClientRect();
    const origin = stage.getBoundingClientRect();
    context.drawImage(lockup, (box.left - origin.left) * scale, (box.top - origin.top) * scale,
      box.width * scale, box.height * scale);
  }, {
    pixelSize: 1.5,
    levels: 2,
    contrast: 1.15,
    // Darkened so the solid white letters break into dots too, not only the mark's shading.
    brightness: -0.2,
    // Read every frame, so the reveal keeps its proportion to the lockup across resizes.
    get revealRadius() { return lockup.offsetWidth * 0.2; },
    softness: 0.6,
    linger: 1,
    paperColor: '#ffffff',
    // Touch screens have no hovering pointer, so the reveal drifts on its own.
    wander: matchMedia('(hover: none)').matches,
  });
  stage.classList.toggle('is-veiled', started);
}
