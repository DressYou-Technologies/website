import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { landing } from '../lib/landing';
import { visibleLoop } from '../lib/loop';
import { all, one } from './dom';
import type { Section } from './index';

const WHITE = '#ffffff', NIGHT = '#0a0a0b';
const FEED_A_SECONDS = 26, FEED_B_SECONDS = 32;   // the two feed columns scroll at different speeds
const TILE_GAP = 10;
const FILL_SECONDS = 1.5;                          // the wardrobe fills before it builds an outfit
const LAND_SLOTS = [.14, .32, .5, .68, .86];       // where across its row each pick may settle
const HELD_SECONDS = 1.6;                          // the outfit result stays on screen
const SPIN_GAP_SECONDS = .35;
const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const shuffle = <T,>(items: T[]) => items.map((v) => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

export const more: Section = (root, _wide, ctx) => {
  const section = one(root, '.more');
  gsap.set(section, { backgroundColor: 'rgba(10,10,11,0)' });
  gsap.fromTo(document.body, { backgroundColor: WHITE }, { backgroundColor: NIGHT, ease: 'none', scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 30%', scrub: true } });
  gsap.fromTo(document.body, { backgroundColor: NIGHT }, { backgroundColor: WHITE, ease: 'none', immediateRender: false, scrollTrigger: { trigger: section, start: 'bottom 70%', end: 'bottom 15%', scrub: true } });
  gsap.from(all(section, '.head > *'), { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 80%' } });
  gsap.from(all(section, '.bento .card'), { y: 60, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: one(section, '.bento'), start: 'top 85%' } });
  const stopSpin = wardrobe(one(section, '.wardrobe'), ctx);
  feed(one(section, '.feedtile'));
  friends(one(section, '.friend'));
  return stopSpin;
};

// Four rows flick past at their own pace and settle on the next outfit's pieces; the pieces gather and the twin wears them.
function wardrobe(card: HTMLElement, ctx: gsap.Context): () => void {
  const build = one(card, '.wbuild');
  const outfits: number[][] = JSON.parse(build.dataset.outfits ?? '[]');
  const rows = all(build, '.wrow'), tracks = rows.map((r) => one(r, '.wtrack'));
  const flies = all<HTMLImageElement>(build, '.wfly'), out = one(build, '.wout'), shine = one(build, '.wshine');
  const renders = all(out, 'picture');
  const state = rows.map((r, k) => ({ n: Number(r.dataset.n), i: 0, f: LAND_SLOTS[(k * 2 + 1) % LAND_SLOTS.length] }));
  const xFor = (k: number, i: number, f: number) => {
    const w = one(tracks[k], '.wg').offsetWidth;
    return rows[k].clientWidth * f - (i * (w + TILE_GAP) + w / 2);
  };
  const rel = (el: Element) => { const r = el.getBoundingClientRect(), o = build.getBoundingClientRect(); return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height }; };
  state.forEach((st, k) => { st.i = st.n * 5 + k % st.n; gsap.set(tracks[k], { x: xFor(k, st.i, st.f) }); });
  gsap.set(out, { xPercent: -50, yPercent: -50 });

  let spins = 0;
  const spin = (done: () => void) => {
    const outfit = spins % outfits.length;
    spins += 1;
    const tl = gsap.timeline({ onComplete: done });
    gsap.set([out, ...flies], { opacity: 0 });
    state.forEach((st, k) => { st.i = st.n * 5 + (((st.i % st.n) + st.n) % st.n); gsap.set(tracks[k], { x: xFor(k, st.i, st.f) }); });
    const inView = (el: Element, k: number) => { const r = el.getBoundingClientRect(), o = rows[k].getBoundingClientRect(); return r.right > o.left - 10 && r.left < o.right + 10; };
    const tiles = all(build, '.wg'), vis: Element[] = [], hid: Element[] = [];
    tracks.forEach((tr, k) => Array.from(tr.children).forEach((el) => (inView(el, k) ? vis : hid).push(el)));
    gsap.set(all(build, '.wcheck'), { opacity: 0, scale: .4 });
    gsap.set(renders, { autoAlpha: (i: number) => (i === outfit ? 1 : 0) });
    // 01 · the wardrobe fills up, piece by piece.
    tl.set(rows, { opacity: 1 }, 0)
      .set(tiles, { opacity: 0, scale: .55 }, 0)
      .to(vis, { opacity: 1, scale: 1, duration: .4, ease: 'back.out(2)', stagger: { each: .045, from: 'random' } }, 0)
      .set(hid, { opacity: 1, scale: 1 }, FILL_SECONDS - .05);
    // 02 · then each row lands on the outfit's piece.
    const slots = shuffle(LAND_SLOTS).slice(0, state.length);
    let landAt = 0;
    state.forEach((st, k) => {
      const dir = k % 2 ? 1 : -1;
      const kids = Array.from(tracks[k].children), tw = one(tracks[k], '.wg').offsetWidth + TILE_GAP, rw = rows[k].clientWidth, f = slots[k];
      const min = Math.ceil((rw * f) / tw) + 1, max = kids.length - 1 - Math.ceil((rw * (1 - f)) / tw) - 1;
      const laps = st.n * Math.round(rnd(1, 3)) + Math.floor(rnd(1, st.n));
      const target = landing({ base: st.i, dir, laps, n: st.n, garment: outfits[outfit][k], min, max });
      const start = FILL_SECONDS + rnd(0, .55), dur = rnd(1.1, 2.3);
      const ease = ['expo.out', 'power4.out', 'back.out(1.15)', 'circ.out'][Math.floor(rnd(0, 4))];
      st.i = target; st.f = f;
      tl.to(tracks[k], { x: () => xFor(k, target, f), duration: dur, ease }, start);
      const end = start + dur;
      const near = kids.slice(Math.max(0, target - 9), target + 10), far = kids.filter((el) => !near.includes(el));
      tl.set(far, { opacity: .28, scale: .94 }, end - .1)
        .to(near, { opacity: (j: number) => (near[j] === kids[target] ? 1 : .28), scale: (j: number) => (near[j] === kids[target] ? 1.08 : .94), duration: .35, ease: 'power2.out' }, end - .1)
        .fromTo(one(kids[target], '.wcheck'), { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2.5)' }, end);
      landAt = Math.max(landAt, end);
    });
    // 03 · the picked pieces gather into the centre and the outfit renders in, head to feet.
    const g0 = landAt + .55;
    state.map((st, k) => tracks[k].children[st.i]).forEach((el, k) => {
      const fly = flies[k], img = one<HTMLImageElement>(el, 'img');
      tl.call(() => { fly.src = img.currentSrc || img.src; }, undefined, g0 - .05)
        .set(fly, { x: () => rel(el).x, y: () => rel(el).y, width: () => rel(el).w, height: () => rel(el).h, opacity: 1, scale: 1 }, g0)
        .to(fly, { x: () => build.clientWidth / 2 - rel(el).w / 2, y: () => build.clientHeight / 2 - rel(el).h / 2, scale: .4, opacity: 0, duration: .7, ease: 'power3.in' }, g0 + .05 + k * .07);
    });
    tl.to(rows, { opacity: .1, duration: .5, ease: 'power2.out' }, g0)
      .fromTo(out, { opacity: 0, scale: .86, clipPath: 'inset(0% 0% 100% 0% round 18px)' }, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.2, ease: 'power3.out' }, g0 + .55)
      .fromTo(shine, { yPercent: -100 }, { yPercent: 300, duration: 1.1, ease: 'power2.inOut' }, g0 + .7)
      .to({}, { duration: HELD_SECONDS })
      .to(out, { opacity: 0, scale: .94, duration: .45, ease: 'power2.in' })
      .to(rows, { opacity: 0, duration: .3 }, '<')
      .set(tiles, { opacity: 0 });
    return tl;
  };
  // Each pass starts from a callback, which GSAP would record in the section's context for good; keeping passes
  // out of it stops that list growing while the card is on screen. The loop kills the pass in flight itself.
  const loop = visibleLoop((done) => untracked(ctx, () => spin(done)), SPIN_GAP_SECONDS, (seconds, fn) => untracked(ctx, () => gsap.delayedCall(seconds, fn)));
  ScrollTrigger.create({ trigger: card, start: 'top 80%', end: 'bottom 10%', onToggle: (self) => (self.isActive ? loop.start() : loop.stop()) });
  return loop.stop;
}

// The tile scrolls like a feed; "Try on" opens the look's garments, then folds back, while the tile is on screen.
function feed(tile: HTMLElement) {
  const onScreen = { trigger: tile, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' };
  gsap.to(one(tile, '.ftk-a'), { yPercent: -50, ease: 'none', duration: FEED_A_SECONDS, repeat: -1, scrollTrigger: onScreen });
  gsap.fromTo(one(tile, '.ftk-b'), { yPercent: -50 }, { yPercent: 0, ease: 'none', duration: FEED_B_SECONDS, repeat: -1, scrollTrigger: onScreen });
  const chip = one(tile, '.scanchip'), look = one(tile, '.tlook'), cta = one(look, '.tl-cta');
  gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: .6, scrollTrigger: { trigger: tile, start: 'top 85%', end: 'bottom 10%', toggleActions: 'play pause resume pause' } })
    .to(chip, { scale: .92, duration: .12, ease: 'power2.in' }, .4)
    .to(chip, { scale: 1, opacity: 0, duration: .18 }, .52)
    .fromTo(look, { opacity: 0, scale: .55, transformOrigin: '100% 0%' }, { opacity: 1, scale: 1, duration: .45, ease: 'back.out(1.5)' }, .55)
    .fromTo(all(look, '.tl-g'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .3, stagger: .07, ease: 'power3.out' }, .8)
    .fromTo(cta, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .3, ease: 'power3.out' }, 1.2)
    .to(cta, { scale: .95, duration: .1, yoyo: true, repeat: 1 }, 2.6)
    .to(look, { opacity: 0, scale: .8, duration: .3, ease: 'power2.in' }, 3.4)
    .to(chip, { opacity: 1, duration: .25 }, 3.65);
}

// Each round: send the options, friends light up, votes land live, and a ring draws itself round the look they picked.
// Then that person's looks slide away and the next person's slide in: a woman's round, then a man's, on a loop.
function friends(card: HTMLElement) {
  const plane = one(card, '.fplane'), sent = one(card, '.fsent'), sendBtn = one(card, '.fsend');
  const people = all(card, '.ffr'), fans = all(card, '.ffan');
  const byInitial = new Map(people.map((p) => [p.textContent?.trim() ?? '', p]));
  const loop = gsap.timeline({ repeat: -1, paused: true });
  const looksOf = (fan: HTMLElement) => all(fan, '.fopt');
  const reset = (fan: HTMLElement, t: number) => loop.set(all(fan, '.fvote'), { opacity: 0, y: -12, scale: .4 }, t)
    .set(one(fan, '.fring'), { '--p': 0 }, t)
    .set(one(fan, '.fburst'), { opacity: 0, scale: .2 }, t);
  gsap.set(fans, { visibility: 'visible' });
  fans.forEach((fan, i) => { reset(fan, 0); loop.set(looksOf(fan), { autoAlpha: i === 0 ? 1 : 0 }, 0); });

  let t = 0;
  fans.forEach((fan, i) => {
    const votes = all(fan, '.fvote'), ring = one(fan, '.fring'), burst = one(fan, '.fburst');
    const picked = one(fan, '.fwin').parentElement ?? one(fan, '.fwin');
    // Votes land in a fixed, lively order: the second, the first, then the rest.
    const order = [1, 0, ...votes.keys()].filter((k, j, ks) => k < votes.length && ks.indexOf(k) === j).map((k) => votes[k]);
    loop.set(people, { opacity: .3, scale: .8 }, t)
      .set(sent, { opacity: 0 }, t)
      .to(sendBtn, { scale: .92, duration: .1, ease: 'power2.in' }, t + .7)
      .to(sendBtn, { scale: 1, duration: .25, ease: 'back.out(3)' }, t + .8)
      .fromTo(plane, { x: 0, y: 0, opacity: 1, rotation: 0 }, { x: () => people[0].offsetLeft - 10, y: -18, rotation: 18, opacity: 0, duration: .55, ease: 'power2.in', immediateRender: false }, t + .8)
      .to(people, { opacity: 1, scale: 1, duration: .3, stagger: .08, ease: 'back.out(2.5)' }, t + 1.2)
      .to(sent, { opacity: 1, duration: .2 }, t + 1.5);
    order.forEach((vote, k) => {
      const at = t + 1.9 + k * .55;
      const person = byInitial.get(vote.textContent?.trim() ?? '');
      if (person) loop.to(person, { scale: 1.25, duration: .12, yoyo: true, repeat: 1 }, at);
      loop.to(vote, { opacity: 1, y: 0, scale: 1, duration: .32, ease: 'back.out(2.6)' }, at + .1);
    });
    const end = t + 1.9 + order.length * .55 + .2;
    loop.to(ring, { '--p': 1, duration: .5, ease: 'power2.inOut' }, end)
      // Cartoon pop: squash, stretch, settle, with three burst marks off the corner.
      .to(picked, { keyframes: [{ scaleX: 1.06, scaleY: .94, duration: .1, ease: 'power2.out' }, { scaleX: .97, scaleY: 1.04, duration: .08 }, { scaleX: 1, scaleY: 1, duration: .12, ease: 'power1.out' }] }, end + .45)
      .to(burst, { opacity: 1, scale: 1, duration: .28, ease: 'back.out(3)' }, end + .48)
      .to(burst, { opacity: 0, duration: .3 }, end + 1.05);
    // Hand over: this person's looks slide away, the next person's slide in, and this set clears while it is hidden.
    const swap = end + 2.4, next = fans[(i + 1) % fans.length];
    loop.to(looksOf(fan), { autoAlpha: 0, y: -16, filter: 'blur(6px)', duration: .45, stagger: .06, ease: 'power2.in' }, swap)
      .fromTo(looksOf(next), { autoAlpha: 0, y: 18, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .6, stagger: .08, ease: 'power3.out', immediateRender: false, clearProps: 'filter' }, swap + .35);
    reset(fan, swap + .7);
    t = swap + 1.2;
  });
  ScrollTrigger.create({ trigger: card, start: 'top 85%', end: 'bottom 10%', onToggle: (self) => (self.isActive ? loop.play() : loop.pause()) });
}

function untracked(ctx: gsap.Context, make: () => { kill(): unknown }): { kill(): void } {
  let made: { kill(): unknown } | null = null;
  ctx.ignore(() => { made = make(); });
  return { kill: () => { made?.kill(); } };
}
