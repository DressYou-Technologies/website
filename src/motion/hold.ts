import { ScrollTrigger } from 'gsap/ScrollTrigger';

// The visitor's pause for every looping demo (WCAG 2.2.2; founder, 2026-11-02): one switch that each loop reads.
let held = false;
const loops = new Set<() => void>();

export const isHeld = () => held;

export function setHeld(value: boolean) {
  held = value;
  loops.forEach((sync) => sync());
}

// Plays a loop while its trigger is on screen and the demos are not paused; the section's context stops listening when
// it reverts.
export function loopWhileShown(ctx: gsap.Context, vars: ScrollTrigger.StaticVars, play: () => void, pause: () => void) {
  let shown = false;
  const sync = () => { if (shown && !held) play(); else pause(); };
  ScrollTrigger.create({ ...vars, onToggle: (self) => { shown = self.isActive; sync(); } });
  ctx.add(() => { loops.add(sync); return () => { loops.delete(sync); }; });
}
