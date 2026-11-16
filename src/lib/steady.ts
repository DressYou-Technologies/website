// In-app browsers (LinkedIn's, Instagram's) resize the page each time their bars slide away or back on scroll. On a touch
// screen, a new height at the same width within this share of the held one is those bars, not a new screen: the rule
// ScrollTrigger follows for its own measurements (ignoreMobileResize).
const BARS_MAX_SHARE = .25;

export interface Size { width: number; height: number }

export const barsMoved = (held: Size, now: Size, touch: boolean): boolean =>
  touch && now.width === held.width && Math.abs(now.height - held.height) <= held.height * BARS_MAX_SHARE;
