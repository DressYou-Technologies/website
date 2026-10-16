import { lightRays } from './light-rays.mjs';
import { scrollVelocity } from './scroll-velocity.mjs';
import { trueFocus } from './true-focus.mjs';

const stage = document.querySelector('.stage');
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

// Reduced motion keeps the tagline and the marquee as plain, still text.
if (!still) {
  trueFocus(document.querySelector('.focus'), {
    blurAmount: 4,
    unfocusedOpacity: 1,
    borderColor: '#ffffff',
    // Sized to the tagline's type: the frame sits just outside the cap height.
    cornerSize: 8,
    borderWidth: 1.5,
    gapX: 6,
    gapY: 3,
    duration: 0.5,
    pause: 1,
  });
  scrollVelocity(document.querySelector('.marquee'), document.querySelector('.track'), {
    velocity: 40,
    skewWithVelocity: 16,
    scaleWithVelocity: 0.18,
  });
}
