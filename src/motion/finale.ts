import { gsap } from 'gsap';
import { all, one } from './dom';
import type { Section } from './index';

export const finale: Section = (root) => {
  const footer = one(root, '.finale');
  gsap.timeline({ scrollTrigger: { trigger: footer, start: 'top 75%' } })
    .from(all(footer, '.mega .w'), { yPercent: 40, opacity: 0, duration: .9, stagger: .1, ease: 'power4.out' })
    .from(all(footer, '.join > *'), { y: 16, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' }, '-=.5');
};
