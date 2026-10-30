import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { all, one } from './dom';
import type { Section } from './index';

const SCENE_SECONDS = 7.6;            // one source: tap, render, size, question, answer
const TAP_SECONDS = 1.4;              // the tap that renders lands this long after a source shows
const SHARE_SECONDS = 2.6;            // a shop needs longer: flip through shops, share the page, pick DressYou
const FIT_MAX = 1.2, FIT_PAD_X = 8, FIT_PAD_Y = 16;
const RESIZE_SETTLE_MS = 120;
const DIM = '#bdbdbd', INK = '#0a0a0a';

// Layout, not motion: the whole phone scene scales as one piece to its stage, with or without animation.
// The scene's own size comes from CSS, which switches it between the wide and the stacked layout.
export function fitPhone() {
  const stage = one(document, '.hstage');
  const scene = one(document, '.hfit');
  const fit = () => {
    const k = Math.min(FIT_MAX, (stage.clientWidth - FIT_PAD_X) / scene.offsetWidth, (stage.clientHeight - FIT_PAD_Y) / scene.offsetHeight);
    scene.style.transform = `scale(${k.toFixed(3)})`;
  };
  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(stage);
  observer.observe(scene);
}

// Any shop: flip through a few shops' pages, tap share on the last one, and the share sheet rises with DressYou in it.
const PAGE_SECONDS = .45;
function share(tl: gsap.core.Timeline, src: HTMLElement, t: number) {
  const pages = all(src, '.spage'), sheet = one(src, '.sheet'), shareBtn = one(src, '.sb-share'), shareRing = one(shareBtn, '.hring');
  tl.set(pages, { xPercent: (k: number) => (k === 0 ? 0 : 100) }, t).set(sheet, { yPercent: 105 }, t);
  pages.slice(1).forEach((page, k) => {
    const flip = t + PAGE_SECONDS * (k + 1);
    tl.to(pages[k], { xPercent: -30, duration: .4, ease: 'power3.inOut' }, flip).to(page, { xPercent: 0, duration: .4, ease: 'power3.inOut' }, flip);
  });
  const shared = t + PAGE_SECONDS * pages.length;
  tl.to(shareBtn, { scale: .85, duration: .08, ease: 'power2.in' }, shared)
    .to(shareBtn, { scale: 1, duration: .25, ease: 'back.out(3)' }, shared + .08)
    .fromTo(shareRing, { scale: .4, opacity: .9 }, { scale: 2.2, opacity: 0, duration: .5, ease: 'power2.out', immediateRender: false }, shared)
    .to(sheet, { yPercent: 0, duration: .45, ease: 'power3.out' }, shared + .15);
}

// One phone, three sources: tap try on, the twin wears it, the stylist gives the size, then you ask it something.
export const how: Section = (root) => {
  const wrap = one(root, '.hwrap');
  const words = all(wrap, '.hw'), bar = one(wrap, '.hbar'), roll = one(wrap, '.hroll'), steps = all(wrap, '.hstep');
  const srcs = all(wrap, '.hsrc'), rens = all(wrap, '.hren'), pops = all(wrap, '.hpop');
  const bubbles = all(wrap, '.hpop > *');

  const tl = gsap.timeline({ repeat: -1, paused: true });
  tl.set(srcs, { autoAlpha: 0 }, 0)
    .set(rens, { autoAlpha: 0, clipPath: 'inset(100% 0% 0% 0%)' }, 0)
    .set(bubbles, { autoAlpha: 0, scale: .6, y: 18 }, 0)
    .set(all(wrap, '.hszr'), { autoAlpha: 0, x: -10 }, 0)
    .set(bar, { scaleX: 0 }, 0)
    .set(words, { autoAlpha: 0, yPercent: 70, filter: 'blur(10px)' }, 0)
    .set(all(wrap, '.hpk'), { scale: 1, boxShadow: `0 0 0 0px ${INK}` }, 0);
  const light = (i: number, t: number) => tl.to(steps, { color: (k: number) => (k === i ? INK : DIM), duration: .3, ease: 'power2.out' }, t);
  const pop = (el: Element, t: number) => tl.to(el, { autoAlpha: 1, scale: 1, y: 0, duration: .6, ease: 'back.out(2.4)' }, t);
  const sweep = (ren: Element, t: number) => tl.fromTo(one(ren, '.hsweep'), { top: '100%', opacity: 1 }, { top: '0%', opacity: 0, duration: .9, ease: 'power3.inOut', immediateRender: false }, t);

  const starts: number[] = [];
  let t = 0;
  srcs.forEach((src, i) => {
    const ren = rens[i], p = pops[i];
    const lead = src.classList.contains('shop') ? SHARE_SECONDS : TAP_SECONDS;
    const D = SCENE_SECONDS + lead - TAP_SECONDS;
    // Everything from the tap on is timed from the tap, so a longer lead only delays it.
    const at = (x: number) => t + lead - TAP_SECONDS + x;
    starts.push(t);
    if (lead === SHARE_SECONDS) share(tl, src, t);
    const btn = one(src, '[data-tap]'), ring = one(btn, '.hring');
    tl.addLabel(`h${i}`, t);
    // The source word rolls in, the headline makes room for it, and its underline counts down the scene.
    tl.to(words[i], { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: .7, ease: 'power3.out' }, t)
      .to(roll, { width: () => words[i].offsetWidth, duration: .6, ease: 'power3.inOut' }, t)
      .to(words[i], { autoAlpha: 0, yPercent: -70, filter: 'blur(10px)', duration: .45, ease: 'power2.in' }, t + D - .45)
      .to(bar, { scaleX: 0, duration: .3, ease: 'power2.in' }, t + D - .45);
    light(0, t);
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: D - .5, ease: 'none', immediateRender: false }, t)
      .to(src, { autoAlpha: 1, duration: .4, ease: 'power2.out' }, t);
    const picks = all(src, '.hpk');
    if (picks.length) tl.to(picks, { scale: .94, boxShadow: `0 0 0 3px ${INK}`, duration: .25, stagger: .22, ease: 'back.out(2)' }, t + .35);
    tl.to(btn, { scale: .93, duration: .1, ease: 'power2.in' }, at(1.1))
      .to(btn, { scale: 1, duration: .35, ease: 'back.out(3)' }, at(1.2))
      .fromTo(ring, { scale: .4, opacity: .9 }, { scale: 2.4, opacity: 0, duration: .6, ease: 'power2.out', immediateRender: false }, at(1.1));
    light(1, at(1.4));
    tl.set(ren, { autoAlpha: 1 }, at(1.4)).to(ren, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power3.inOut' }, at(1.4));
    sweep(ren, at(1.4));
    tl.set(src, { autoAlpha: 0 }, at(2.35));
    light(2, at(2.5));
    pop(one(p, '.hsz'), at(2.5));
    tl.fromTo(all(p, '.hszr'), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: .35, stagger: .25, ease: 'power3.out', immediateRender: false }, at(2.7));
    light(3, at(3.3));
    const qEl = one(p, '.hq'), typeEl = one(ren, '.htype'), phEl = one(ren, '.hph'), sendEl = one(ren, '.hsend'), field = one(ren, '.hin');
    const qText = qEl.textContent?.trim() ?? '', typed = { n: 0 };
    const clear = () => { typeEl.textContent = ''; phEl.style.opacity = '1'; };
    tl.set(typed, { n: 0 }, t).call(clear, undefined, t)
      .to(field, { scale: 1.04, duration: .25, ease: 'back.out(2)' }, at(3.3))
      .to(phEl, { opacity: 0, duration: .1 }, at(3.35))
      .to(typed, { n: qText.length, duration: .85, ease: 'none', onUpdate: () => { typeEl.textContent = qText.slice(0, Math.round(typed.n)); } }, at(3.4))
      .to(sendEl, { scale: .88, duration: .08, ease: 'power2.in' }, at(4.3))
      .to(sendEl, { scale: 1, duration: .3, ease: 'back.out(3)' }, at(4.38))
      .to(field, { scale: 1, duration: .25 }, at(4.38))
      .call(clear, undefined, at(4.4))
      .fromTo(qEl, { autoAlpha: 0, scale: .5, y: 70 }, { autoAlpha: 1, scale: 1, y: 0, duration: .6, ease: 'back.out(2.2)', immediateRender: false }, at(4.38));
    const dots = one(p, '.hdots');
    pop(dots, at(4.8));
    tl.to(dots, { autoAlpha: 0, scale: .7, duration: .2 }, at(5.3));
    pop(one(p, '.ha'), at(5.35));
    // Asking for a change re-renders the look on the twin.
    if (i === 0) {
      sweep(ren, at(5.35));
      tl.fromTo(one(ren, 'img.hrimg'), { filter: 'brightness(1)' }, { filter: 'brightness(1.12)', duration: .3, yoyo: true, repeat: 1, immediateRender: false }, at(5.45));
    }
    tl.to([ren, ...Array.from(p.children)], { autoAlpha: 0, duration: .4, ease: 'power2.in' }, t + D - .45);
    t += D;
  });

  ScrollTrigger.create({ trigger: wrap, start: 'top 80%', end: 'bottom 15%', onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
  const next = () => tl.play(`h${(starts.findLastIndex((start) => start <= tl.time()) + 1) % srcs.length}`);
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } };
  let settle: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => { clearTimeout(settle); settle = setTimeout(() => { gsap.set(roll, { width: 'auto' }); tl.invalidate(); }, RESIZE_SETTLE_MS); };
  roll.setAttribute('role', 'button');
  roll.setAttribute('tabindex', '0');
  roll.title = 'Next source';
  roll.addEventListener('click', next);
  roll.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  return () => {
    clearTimeout(settle);
    roll.removeAttribute('role');
    roll.removeAttribute('tabindex');
    roll.removeAttribute('title');
    roll.removeEventListener('click', next);
    roll.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
  };
};
