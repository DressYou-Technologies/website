import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { all, one } from './dom';
import type { Section } from './index';

// Every beat after the tap is timed from the tap press; each source decides how long it plays before it.
const ASK_AFTER_TAP_SECONDS = 2.2;    // render and size come in, then the person starts asking
const CHOOSE_SECONDS = 1.2;           // a size card first waits for the size to taste to be tapped
const AFTER_ASK_SECONDS = 4.3;        // question, answer, then the scene fades
const WARDROBE_TAP_SECONDS = 3.0;     // three pieces picked, the select bar rises, then the tap
const FEED_POST_SECONDS = 1.3;        // the feed flicks to each next post this often, then the last one is tapped
const FEED_SETTLE_SECONDS = 1.1;      // the tried post shows this long before its try-on button is pressed
const FEED_HEAD_PT = 222, STATUS_PT = 54; // the feed's header ends here, in iOS points (How.astro .fhead), and the status bar here
const TAB_SECONDS = 1.8;              // each open shop tab stays this long before the next swipes in
const MENU_SECONDS = .9;              // Safari's page menu shows this long before Share is tapped
const SHEET_SECONDS = 1.2;            // the share sheet shows this long before DressYou is tapped
const FIT_MAX = 1.2, FIT_PAD_X = 8, FIT_PAD_Y = 16;
const RESIZE_SETTLE_MS = 120;
const DIM = '#bdbdbd', INK = '#0a0a0a';
const TILE_EDGE = 'inset 0 0 0 1px rgba(10,10,11,.08)', TILE_PICKED = 'inset 0 0 0 2px #0a0a0b';
// A size chip chosen and not, as How.astro draws .szc.fit and .szc.
const CHIP_ON = { backgroundColor: '#0a0a0b', color: '#f4f4f2', fontWeight: 700 }, CHIP_OFF = { backgroundColor: '#efeeeb', color: '#0a0a0a', fontWeight: 500 };

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

// Any shop, the way iOS 27 shares a page: swipe through the open tabs, open the address bar's page menu, tap Share,
// and the share sheet rises with DressYou in it. Returns when DressYou is pressed.
function press(tl: gsap.core.Timeline, el: Element, ring: Element, at: number) {
  tl.to(el, { scale: .9, duration: .09, ease: 'power2.in' }, at)
    .to(el, { scale: 1, duration: .3, ease: 'back.out(3)' }, at + .09)
    .fromTo(ring, { scale: .4, opacity: .9 }, { scale: 1.8, opacity: 0, duration: .55, ease: 'power2.out', immediateRender: false }, at);
}
function share(tl: gsap.core.Timeline, src: HTMLElement, t: number): number {
  const pages = all(src, '.spage'), domains = all(src, '.domains span'), menu = one(src, '.pmenu'), row = one(src, '.pshare'), sheet = one(src, '.sheet');
  const pageBtn = one(src, '.pagebtn');
  tl.set(pages, { xPercent: (k: number) => (k === 0 ? 0 : 100) }, t).set(domains, { opacity: (k: number) => (k === 0 ? 1 : 0) }, t)
    .set(menu, { autoAlpha: 0, scale: .9 }, t).set(row, { backgroundColor: 'rgba(10,10,11,0)' }, t).set(sheet, { yPercent: 115 }, t);
  pages.slice(1).forEach((page, k) => {
    const swipe = t + TAB_SECONDS * (k + 1);
    tl.to(pages[k], { xPercent: -100, duration: .7, ease: 'power3.inOut' }, swipe).to(page, { xPercent: 0, duration: .7, ease: 'power3.inOut' }, swipe)
      .to(domains[k], { opacity: 0, duration: .3 }, swipe).to(domains[k + 1], { opacity: 1, duration: .3 }, swipe + .35);
  });
  const opened = t + TAB_SECONDS * pages.length;
  press(tl, pageBtn, one(pageBtn, '.hring'), opened);
  tl.to(menu, { autoAlpha: 1, scale: 1, duration: .35, ease: 'power3.out' }, opened + .1);
  const shared = opened + .1 + MENU_SECONDS;
  tl.to(row, { backgroundColor: 'rgba(10,10,11,.07)', duration: .12 }, shared)
    .to(menu, { autoAlpha: 0, scale: .96, duration: .25, ease: 'power2.in' }, shared + .2)
    .to(sheet, { yPercent: 0, duration: .6, ease: 'power3.out' }, shared + .25);
  return shared + .25 + .6 + SHEET_SECONDS;
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
    .set(all(wrap, '.hszr, .sztag'), { autoAlpha: 0, x: -10 }, 0)
    .set(bar, { scaleX: 0 }, 0)
    .set(words, { autoAlpha: 0, yPercent: 70, filter: 'blur(10px)' }, 0);
  const light = (i: number, t: number) => tl.to(steps, { color: (k: number) => (k === i ? INK : DIM), duration: .3, ease: 'power2.out' }, t);
  const pop = (el: Element, t: number) => tl.to(el, { autoAlpha: 1, scale: 1, y: 0, duration: .6, ease: 'back.out(2.4)' }, t);
  const sweep = (ren: Element, t: number) => tl.fromTo(one(ren, '.hsweep'), { top: '100%', opacity: 1 }, { top: '0%', opacity: 0, duration: .9, ease: 'power3.inOut', immediateRender: false }, t);
  // The wardrobe: pick three pieces, the tab bar gives way to the select bar, and its button is the tap.
  const pick = (src: HTMLElement, t: number): number => {
    const tiles = all(src, '.hpk'), ticks = tiles.map((tile) => one(tile, '.tick')), tabbar = one(src, '.tabbar'), select = one(src, '.htry');
    tl.set(tiles, { boxShadow: TILE_EDGE }, t).set(ticks, { autoAlpha: 0, scale: .6 }, t).set(tabbar, { autoAlpha: 1, y: 0 }, t).set(select, { autoAlpha: 0, y: 24 }, t);
    tiles.forEach((tile, k) => {
      const at = t + .6 + k * .45;
      tl.to(tile, { boxShadow: TILE_PICKED, duration: .2, ease: 'power2.out' }, at).to(ticks[k], { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(2.4)' }, at);
    });
    tl.to(tabbar, { autoAlpha: 0, y: 24, duration: .3, ease: 'power2.in' }, t + 2.1).to(select, { autoAlpha: 1, y: 0, duration: .4, ease: 'power3.out' }, t + 2.2);
    return t + WARDROBE_TAP_SECONDS;
  };

  // The feed: flick past the posts above, settle on the one tried, then press its try-on button.
  const scroll = (src: HTMLElement, t: number): number => {
    const track = one(src, '.fscroll'), head = one(src, '.fhead'), view = one(src, '.fview');
    // Every post up to the one with the try-on button; the one after it only fills the screen below.
    const posts = all(src, '.fpost').filter((post, k, list) => k <= list.findIndex((p) => p.querySelector('[data-tap]')));
    tl.set(track, { y: 0 }, t).set(head, { y: 0, autoAlpha: 1 }, t).set(view, { top: FEED_HEAD_PT }, t)
      .to(head, { y: -(FEED_HEAD_PT - STATUS_PT), autoAlpha: 0, duration: .6, ease: 'power3.out' }, t + FEED_POST_SECONDS - .6)
      .to(view, { top: STATUS_PT, duration: .6, ease: 'power3.out' }, t + FEED_POST_SECONDS - .6);
    posts.slice(1).forEach((post, k) => tl.to(track, { y: () => -post.offsetTop, duration: .8, ease: 'power3.out' }, t + FEED_POST_SECONDS * (k + 1) - .6));
    return t + FEED_POST_SECONDS * (posts.length - 1) + FEED_SETTLE_SECONDS;
  };

  const starts: number[] = [];
  let t = 0;
  srcs.forEach((src, i) => {
    const ren = rens[i], p = pops[i];
    const P = src.classList.contains('shop') ? share(tl, src, t) : src.classList.contains('wardrobe') ? pick(src, t) : scroll(src, t);
    const sized = p.querySelector('.hsz.size');
    const ask = P + ASK_AFTER_TAP_SECONDS + (sized ? CHOOSE_SECONDS : 0), end = ask + AFTER_ASK_SECONDS, D = end - t;
    starts.push(t);
    const btn = one(src, '[data-tap]'), ring = one(btn, '.hring');
    tl.addLabel(`h${i}`, t);
    // The source word rolls in, the headline makes room for it, and its underline counts down the scene.
    tl.to(words[i], { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: .7, ease: 'power3.out' }, t)
      .to(roll, { width: () => words[i].offsetWidth, duration: .6, ease: 'power3.inOut' }, t)
      .to(words[i], { autoAlpha: 0, yPercent: -70, filter: 'blur(10px)', duration: .45, ease: 'power2.in' }, end - .45)
      .to(bar, { scaleX: 0, duration: .3, ease: 'power2.in' }, end - .45);
    light(0, t);
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: D - .5, ease: 'none', immediateRender: false }, t)
      .to(src, { autoAlpha: 1, duration: .4, ease: 'power2.out' }, t);
    press(tl, btn, ring, P);
    light(1, P + .3);
    tl.set(ren, { autoAlpha: 1 }, P + .3).to(ren, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power3.inOut' }, P + .3);
    sweep(ren, P + .3);
    tl.set(src, { autoAlpha: 0 }, P + 1.25);
    light(2, P + 1.4);
    pop(one(p, '.hsz'), P + 1.4);
    tl.fromTo(all(p, '.hszr, .sztag'), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: .35, stagger: .25, ease: 'power3.out', immediateRender: false }, P + 1.6);
    // The card opens on the size that fits, then the person taps the one to their taste.
    if (sized) {
      const fit = one(sized, '.szc.fit'), style = one(sized, '.szc.style'), chosen = P + ASK_AFTER_TAP_SECONDS + .2;
      tl.set(fit, CHIP_ON, t).set(style, CHIP_OFF, t);
      press(tl, style, one(style, '.hring'), chosen);
      tl.to(fit, { ...CHIP_OFF, duration: .25, ease: 'power2.out' }, chosen + .05).to(style, { ...CHIP_ON, duration: .25, ease: 'power2.out' }, chosen + .05);
    }
    light(3, ask);
    const qEl = one(p, '.hq'), typeEl = one(ren, '.htype'), phEl = one(ren, '.hph'), sendEl = one(ren, '.hsend'), field = one(ren, '.hin');
    const qText = qEl.textContent?.trim() ?? '', typed = { n: 0 };
    const clear = () => { typeEl.textContent = ''; phEl.style.opacity = '1'; };
    tl.set(typed, { n: 0 }, t).call(clear, undefined, t).set(sendEl, { backgroundColor: 'rgba(10,10,11,0)', color: 'rgba(10,10,11,.4)' }, t)
      .to(field, { scale: 1.02, duration: .25, ease: 'back.out(2)' }, ask)
      .to(phEl, { opacity: 0, duration: .1 }, ask + .05)
      .to(sendEl, { backgroundColor: INK, color: '#ffffff', duration: .2 }, ask + .1)
      .to(typed, { n: qText.length, duration: .85, ease: 'none', onUpdate: () => { typeEl.textContent = qText.slice(0, Math.round(typed.n)); } }, ask + .1)
      .to(sendEl, { scale: .88, duration: .08, ease: 'power2.in' }, ask + 1)
      .to(sendEl, { scale: 1, duration: .3, ease: 'back.out(3)' }, ask + 1.08)
      .to(field, { scale: 1, duration: .25 }, ask + 1.08)
      .to(sendEl, { backgroundColor: 'rgba(10,10,11,0)', color: 'rgba(10,10,11,.4)', duration: .2 }, ask + 1.1)
      .call(clear, undefined, ask + 1.1)
      .fromTo(qEl, { autoAlpha: 0, scale: .5, y: 70 }, { autoAlpha: 1, scale: 1, y: 0, duration: .6, ease: 'back.out(2.2)', immediateRender: false }, ask + 1.08);
    const dots = one(p, '.hdots');
    pop(dots, ask + 1.5);
    tl.to(dots, { autoAlpha: 0, scale: .7, duration: .2 }, ask + 2);
    pop(one(p, '.ha'), ask + 2.05);
    tl.to([ren, ...Array.from(p.children)], { autoAlpha: 0, duration: .4, ease: 'power2.in' }, end - .45);
    t = end;
  });

  ScrollTrigger.create({ trigger: wrap, start: 'top 80%', end: 'bottom 15%', onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
  const next = () => tl.play(`h${(starts.findLastIndex((start) => start <= tl.time()) + 1) % srcs.length}`);
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } };
  let settle: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => { clearTimeout(settle); settle = setTimeout(() => { gsap.set(roll, { width: 'auto' }); tl.invalidate(); }, RESIZE_SETTLE_MS); };
  roll.setAttribute('role', 'button');
  roll.setAttribute('tabindex', '0');
  roll.title = roll.dataset.next ?? '';
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
