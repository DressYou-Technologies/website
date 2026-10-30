import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { all, one } from './dom';
import type { Section } from './index';

const REEL_HOLD_SECONDS = 1.6;

export const finale: Section = (root) => {
  const footer = one(root, '.finale');
  gsap.timeline({ scrollTrigger: { trigger: footer, start: 'top 75%' } })
    .from(all(footer, '.mega .w'), { yPercent: 40, opacity: 0, duration: .9, stagger: .1, ease: 'power4.out' })
    .from(all(footer, '.join > *'), { y: 16, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' }, '-=.5');
  // The headline's window: each person slides up out of it and the next rises in, while the footer is on screen.
  const people = all(footer, '.reel picture');
  const reel = gsap.timeline({ repeat: -1, paused: true });
  people.forEach((person, i) => {
    const next = people[(i + 1) % people.length], at = i * REEL_HOLD_SECONDS + REEL_HOLD_SECONDS;
    reel.fromTo(person, { yPercent: 0, opacity: 1 }, { yPercent: -100, duration: .7, ease: 'power3.inOut', immediateRender: false }, at)
      .fromTo(next, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: .7, ease: 'power3.inOut', immediateRender: false }, at);
  });
  ScrollTrigger.create({ trigger: footer, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? reel.play() : reel.pause()) });
};
