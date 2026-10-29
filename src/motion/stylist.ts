import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STORY_LENGTH_PX } from '../lib/constants';
import { all, one } from './dom';
import type { Section } from './index';

const STEP = 1.3;                         // timeline time per question
const STAGE_TOP = 104, STAGE_BOTTOM = 56; // the pinned stage's padding, around the header and the input
const CHAT_MIN = 300, CHAT_MAX = 620;
const STACK_GAP = 16;
const LABELS = ['opinion', 'day', 'trip', 'find', 'shop'];
const POP = .18;                          // one squash-stretch-settle pop
const ANSWER_AT = .98, LABEL_AT = STEP - .08;  // within a step: the answer starts, then the step's snap point
const ANSWER_STAGGER = .09;
const INK = '#0a0a0a', PAPER = '#f4f4f2';

// The stage sticks while the story scrolls: each capability arrives, its question types itself and sends,
// and the answer pops in. Snapping to each label means a fast scroll always lands on one whole question.
export const stylist: Section = (root, wide) => {
  const sec = one(root, '.stylist'), stage = one(sec, '.sstage'), head = one(sec, '.shead'), chat = one(sec, '.schat');
  const view = one(sec, '.sview'), track = one(sec, '.strack'), type = one(sec, '.stype'), ph = one(sec, '.sph'), send = one(sec, '.ssend');
  const tabs = all(sec, '.stab'), groups = all(sec, '.sg');
  gsap.set(sec, { height: `calc(100svh + ${STORY_LENGTH_PX}px)` });
  gsap.set(stage, { position: 'sticky', top: 0, height: '100svh', paddingTop: STAGE_TOP, paddingBottom: STAGE_BOTTOM, flexWrap: 'nowrap', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: wide ? undefined : STACK_GAP });
  if (!wide) {
    gsap.set(one(head, 'h2'), { display: 'none' });
    gsap.set(one(head, '.stabs'), { gridTemplateAreas: '"tab"' });
    gsap.set(tabs, { gridArea: 'tab' });
  }
  gsap.set(chat, { height: () => Math.min(CHAT_MAX, Math.max(CHAT_MIN, window.innerHeight - STAGE_TOP - STAGE_BOTTOM - (wide ? 0 : head.offsetHeight + STACK_GAP))) });
  gsap.set(tabs.slice(1), { opacity: 0, x: -24 });
  gsap.set(tabs.slice(1).map((t) => one(t, '.sico')), { backgroundColor: PAPER, color: INK });
  gsap.set(all(sec, '.sg .sq'), { opacity: 0, scale: .2, transformOrigin: '100% 100%' });
  gsap.set(all(sec, '.sg .sin'), { opacity: 0, scale: .3, y: 10, transformOrigin: '0% 100%' });
  gsap.set(all(sec, '.sthink'), { scale: .4, transformOrigin: '0% 100%' });
  const scrollTo = (i: number) => Math.max(0, groups[i].offsetTop + groups[i].offsetHeight - view.offsetHeight);
  const spans = groups.map((g, i) => ({ q: g.dataset.q ?? '', a: i * STEP + .08, b: i * STEP + .48, s: i * STEP + .54 }));

  // The input types each question as you scroll, then sends it into the thread.
  let shown: string | null = null;
  const render = () => {
    const t = tl.time();
    let text = '';
    spans.forEach((p) => { if (t >= p.a && t < p.s) text = p.q.slice(0, Math.round(p.q.length * Math.min(1, (t - p.a) / (p.b - p.a)))); });
    if (text !== shown) { shown = text; type.textContent = text; ph.style.opacity = text ? '0' : '1'; }
  };
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onUpdate: render,
    scrollTrigger: {
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true,
      // Inertia would project a fast scroll past the next question; labelsDirectional with it off lands on one.
      snap: { snapTo: 'labelsDirectional', inertia: false, duration: { min: .2, max: .6 }, delay: .05, ease: 'power1.inOut' },
    },
  });
  spans.forEach((p, i) => {
    const t0 = i * STEP, g = groups[i], parts = all(g, '.sin');
    // Every part of the answer has popped by the step's snap point, however many parts it has.
    const stagger = Math.min(ANSWER_STAGGER, (LABEL_AT - ANSWER_AT - POP) / Math.max(1, parts.length - 1));
    if (i) {
      tl.to(tabs[i - 1], { opacity: wide ? .32 : 0, duration: .2 }, t0)
        .to(one(tabs[i - 1], '.sico'), { backgroundColor: PAPER, color: INK, duration: .2 }, t0)
        .to(tabs[i], { opacity: 1, x: 0, duration: .28, ease: 'back.out(1.8)' }, t0 + .04)
        .fromTo(one(tabs[i], '.sico'), { backgroundColor: PAPER, color: INK, scale: .6 }, { backgroundColor: INK, color: '#ffffff', scale: 1, duration: .28, ease: 'back.out(2.4)', immediateRender: false }, t0 + .04);
    }
    tl.to(send, { scale: .88, duration: .04 }, p.s - .04).to(send, { scale: 1, duration: .08 }, p.s)
      .to(track, { y: () => -scrollTo(i), duration: .35, ease: 'power3.inOut' }, p.s - .02)
      // Cartoon pop: squash, stretch, settle.
      .to(one(g, '.sq'), { keyframes: [{ opacity: 1, scaleX: 1.14, scaleY: .86, duration: .07, ease: 'power2.out' }, { scaleX: .95, scaleY: 1.07, duration: .05 }, { scaleX: 1, scaleY: 1, duration: .06, ease: 'power1.out' }] }, p.s)
      .to(one(g, '.sthink'), { opacity: 1, scale: 1, duration: .08, ease: 'back.out(3)' }, p.s + .14)
      .to(all(g, '.sthink i'), { y: -6, duration: .035, yoyo: true, repeat: 5, stagger: .025, ease: 'sine.inOut' }, p.s + .18)
      .to(one(g, '.sthink'), { opacity: 0, scale: .6, duration: .05 }, p.s + .4)
      .to(parts, { keyframes: [{ opacity: 1, y: 0, scaleX: 1.1, scaleY: .9, duration: .07, ease: 'power2.out' }, { scaleX: .96, scaleY: 1.05, duration: .05 }, { scaleX: 1, scaleY: 1, duration: .06 }], stagger }, t0 + ANSWER_AT)
      .addLabel(LABELS[i], t0 + LABEL_AT);
  });
  tl.to({}, { duration: .3 });
  render();
  // In-page links land on the first question, not on the empty chat above it (read by the anchor handler).
  const anchor = () => {
    const st = tl.scrollTrigger;
    if (st) sec.dataset.anchorOffset = String(Math.round((tl.labels[LABELS[0]] / tl.duration()) * (st.end - st.start)));
  };
  anchor();
  ScrollTrigger.addEventListener('refresh', anchor);
  return () => {
    ScrollTrigger.removeEventListener('refresh', anchor);
    delete sec.dataset.anchorOffset;
  };
};
