import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STORY_LENGTH_PX } from '../lib/constants';
import { storySnap } from '../lib/snap';
import { all, one } from './dom';
import type { Section } from './index';

const STEP = 1.8;                         // timeline time per question: typed, sent, checked, answered
const STAGE_TOP = 104, STAGE_BOTTOM = 56; // the pinned stage's padding, around the header and the input
const PHONE_TOP = 72, PHONE_BOTTOM = 20;  // on phones the header is a single button, so the stage starts higher
const CHAT_MIN = 300, CHAT_MAX = 760;
const STACK_GAP = 16;
const LABELS = ['opinion', 'day', 'trip', 'find', 'shop'];
const POP = .18;                          // one part of the answer arriving
const CHECKS_AT = .66, CHECK_EACH = .11;  // within a step: the checks card opens, then each check ticks in turn
const ANSWER_AT = 1.38, LABEL_AT = STEP - .08;  // the answer starts once every check is ticked, then the step's snap point
const ANSWER_STAGGER = .09;
const INK = '#0a0a0a', PAPER = '#f4f4f2';
const FADE_PX = 64;                       // the chat view's top fade (its mask in Stylist.astro)

// The stage sticks while the story scrolls: each capability arrives, its question types itself and sends,
// and the answer pops in. Snapping to each label means a fast scroll always lands on one whole question.
export const stylist: Section = (root, wide) => {
  const sec = one(root, '.stylist'), stage = one(sec, '.sstage'), head = one(sec, '.shead'), chat = one(sec, '.schat');
  const view = one(sec, '.sview'), track = one(sec, '.strack'), type = one(sec, '.stype'), ph = one(sec, '.sph'), send = one(sec, '.ssend');
  const tabs = all(sec, '.stab'), groups = all(sec, '.sg');
  gsap.set(sec, { height: `calc(100svh + ${STORY_LENGTH_PX}px)` });
  const top = wide ? STAGE_TOP : PHONE_TOP, bottom = wide ? STAGE_BOTTOM : PHONE_BOTTOM;
  gsap.set(stage, { position: 'sticky', top: 0, height: '100svh', paddingTop: top, paddingBottom: bottom, flexWrap: 'nowrap', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: wide ? undefined : STACK_GAP });
  if (!wide) {
    gsap.set(one(head, '.stabs'), { gridTemplateAreas: '"tab"' });
    gsap.set(tabs, { gridArea: 'tab' });
  }
  // The stage is 100svh, the screen with the browser's bars shown, so the input never sits under them.
  gsap.set(chat, { height: () => Math.min(CHAT_MAX, Math.max(CHAT_MIN, stage.clientHeight - top - bottom - (wide ? 0 : head.offsetHeight + STACK_GAP))) });
  gsap.set(tabs.slice(1), { opacity: 0, x: -24 });
  gsap.set(tabs.slice(1).map((t) => one(t, '.sico')), { backgroundColor: PAPER, color: INK });
  gsap.set(all(sec, '.sg .sq'), { opacity: 0, scale: .2, transformOrigin: '100% 100%' });
  gsap.set(all(sec, '.sg .sin'), { opacity: 0, scale: .3, y: 10, transformOrigin: '0% 100%' });
  gsap.set(all(sec, '.sck'), { opacity: 0, y: 8 });
  gsap.set(all(sec, '.ck'), { opacity: .35 });
  gsap.set(all(sec, '.ck-tick'), { scale: .5, opacity: 0 });
  // Show the group's end, unless that would push its question under the fade: then show the question.
  const scrollTo = (i: number) => Math.max(0, Math.min(groups[i].offsetTop - FADE_PX, groups[i].offsetTop + groups[i].offsetHeight - view.offsetHeight));
  // Once the answer arrives, show the group's end, unless that hides the checks: then start from the checks.
  const settle = (i: number) => {
    const g = groups[i], answer = one(g, '.sa'), checks = one(answer, '.sck');
    return Math.max(0, Math.min(answer.offsetTop + checks.offsetTop - FADE_PX, g.offsetTop + g.offsetHeight - view.offsetHeight));
  };
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
      // Inertia would project a fast scroll past the next question; with it off a scroll lands on one, and above the
      // first or past the last question the visitor can leave.
      snap: { snapTo: (value, self) => storySnap(LABELS.map((l) => tl.labels[l] / tl.duration()), value, self?.direction ?? 1), inertia: false, duration: { min: .2, max: .6 }, delay: .05, ease: 'power1.inOut' },
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
      .to(one(g, '.sq'), { opacity: 1, scale: 1, duration: .14, ease: 'power3.out' }, p.s)
      // Before it answers, the stylist checks what it knows about you, one thing after another.
      .to(one(g, '.sck'), { opacity: 1, y: 0, duration: .12, ease: 'power3.out' }, t0 + CHECKS_AT);
    all(g, '.ck').forEach((row, k) => {
      const at = t0 + CHECKS_AT + .08 + k * CHECK_EACH;
      tl.to(row, { opacity: 1, duration: .06 }, at).to(one(row, '.ck-tick'), { opacity: 1, scale: 1, duration: .07, ease: 'power3.out' }, at + .04);
    });
    tl.to(track, { y: () => -settle(i), duration: .3, ease: 'power3.inOut' }, t0 + ANSWER_AT - .08)
      .to(parts, { opacity: 1, y: 0, scale: 1, duration: POP, ease: 'power3.out', stagger }, t0 + ANSWER_AT)
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
