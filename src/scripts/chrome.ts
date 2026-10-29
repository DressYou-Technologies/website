import { gsap } from 'gsap';
import { HEADER_COMPACT_AFTER, HEADER_FOLD_AT, HERO_PASSED_OFFSET, MOTION_QUERY, SCROLL_JITTER_PX } from '../lib/constants';

const motion = () => window.matchMedia(MOTION_QUERY).matches;

// The header is a pill once scrolled, compact while scrolling down, and shows "Get the app" once the hero is gone.
function header(top: HTMLElement) {
  const hero = document.querySelector<HTMLElement>('.hero');
  let lastY = window.scrollY;
  const update = () => {
    const y = window.scrollY;
    top.classList.toggle('folded', y > HEADER_FOLD_AT);
    top.classList.toggle('app-shown', !hero || y > hero.offsetHeight - HERO_PASSED_OFFSET);
    if (Math.abs(y - lastY) > SCROLL_JITTER_PX) {
      top.classList.toggle('compact', y > lastY && y > HEADER_COMPACT_AFTER);
      lastY = y;
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// In-page anchors scroll in JS: CSS smooth scrolling fights ScrollTrigger's snap.
function anchors() {
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    if (!a) return;
    const target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    const offset = Number(target.dataset.anchorOffset ?? 0);
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: motion() ? 'smooth' : 'auto' });
  });
}

function dialogs() {
  document.querySelectorAll<HTMLButtonElement>('[data-get]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.getElementById(`get-${button.dataset.get}`);
    if (!(dialog instanceof HTMLDialogElement)) return;
    dialog.showModal();
    dialog.addEventListener('close', () => button.focus({ preventScroll: true }), { once: true });
    if (!motion()) return;
    gsap.from(dialog, { scale: .6, opacity: 0, transformOrigin: '50% 50%', duration: .5, ease: 'back.out(1.6)' });
    gsap.fromTo(dialog.querySelector('.title'), { y: 26, opacity: 0, filter: 'blur(6px)', '--m': '-40%' },
      { y: 0, opacity: 1, filter: 'blur(0px)', '--m': '100%', duration: .9, delay: .12, ease: 'power3.out', clearProps: 'filter' });
  }));
  // A click on the backdrop lands on the dialog element itself.
  document.querySelectorAll('dialog.get').forEach((dialog) => dialog.addEventListener('click', (e) => {
    if (e.target === dialog && dialog instanceof HTMLDialogElement) dialog.close();
  }));
}

export function startChrome() {
  const top = document.querySelector<HTMLElement>('.top');
  if (top) header(top);
  anchors();
  dialogs();
}
