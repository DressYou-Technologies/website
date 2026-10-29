import { gsap } from 'gsap';
import type { Section } from './index';

const DRIFT_SECONDS = 8;   // one idle drift, up or down
const DRIFT_PX = 40;
const PARALLAX_PX = 160;   // alternate columns travel opposite ways while the hero scrolls away

export const hero: Section = (root) => {
  const q = gsap.utils.selector(root);
  gsap.from(q('.top'), { y: -24, opacity: 0, duration: .8, ease: 'power3.out' });
  gsap.from(q('.stack'), { scale: 1.12, opacity: 0, duration: 1.6, ease: 'power3.out' });
  gsap.from(q('.hero-cta .line > span'), { yPercent: 60, opacity: 0, filter: 'blur(10px)', duration: 1.2, ease: 'power3.out', stagger: .12, delay: .3, clearProps: 'filter' });
  gsap.from(q('.dock'), { y: 24, scale: .94, opacity: 0, duration: .9, ease: 'back.out(1.4)', delay: .7 });
  gsap.from(q('.dock > *'), { opacity: 0, duration: .5, stagger: .08, delay: .9 });
  // Three layers so the effects never share a transform: the column's place on the cylinder (CSS),
  // scroll parallax (.lift) and idle drift (.track).
  gsap.fromTo(q('.track'), { y: (i: number) => (i % 2 ? DRIFT_PX : -DRIFT_PX) }, { y: (i: number) => (i % 2 ? -DRIFT_PX : DRIFT_PX), duration: DRIFT_SECONDS, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: { each: .35, from: 'center' } });
  gsap.to(q('.lift'), { y: (i: number) => (i % 2 ? PARALLAX_PX : -PARALLAX_PX), ease: 'none', scrollTrigger: { trigger: q('.hero')[0], start: 'top top', end: 'bottom top', scrub: true } });
};
