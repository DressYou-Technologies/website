import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION_QUERY, WIDE_QUERY } from '../lib/constants';
import { hero } from './hero';
import { how } from './how';
import { more } from './more';
import { stylist } from './stylist';
import { finale } from './finale';

// A section starts its animations inside the matchMedia context, which reverts them when motion turns off;
// it returns a cleanup only for what GSAP does not own (listeners, timers).
export type Section = (root: HTMLElement, wide: boolean, ctx: gsap.Context) => void | (() => void);

const SECTIONS: Section[] = [hero, how, more, stylist, finale];

export function startMotion() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({ motion: MOTION_QUERY, wide: WIDE_QUERY }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    // Without this class every section shows its end state, still.
    document.documentElement.classList.add('motion');
    const cleanups = SECTIONS.map((start) => start(document.body, ctx.conditions?.wide === true, ctx));
    return () => {
      document.documentElement.classList.remove('motion');
      cleanups.forEach((cleanup) => cleanup?.());
    };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
