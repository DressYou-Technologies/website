// An endless row of repeated text that drifts sideways, can be grabbed and flung, and leans into its speed.
// Ported to plain DOM from React Bits' ScrollVelocity (one row, drag only: this page never scrolls;
// copies are added to fill the band instead of a fixed count).
// Copyright (c) 2026 David Haz — MIT + Commons Clause, see react-bits.LICENSE.txt.

// Wraps v into [min, max), so the row loops seamlessly every copy width.
export function wrap(min, max, v) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

// `track` holds one copy of the text; it is repeated until the row covers the band
// with a copy to spare, then moved every frame.
export function scrollVelocity(parallax, track, s) {
  const copy = track.firstElementChild;
  let copyWidth = 0;
  const fill = () => {
    copyWidth = copy.offsetWidth;
    while (copyWidth > 0 && track.children.length * copyWidth < parallax.offsetWidth + copyWidth) {
      const clone = copy.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.append(clone);
    }
  };
  const resize = new ResizeObserver(fill);
  resize.observe(copy);
  resize.observe(parallax);

  let baseX = 0, skewX = 0, scaleY = 1, pace = 1, fling = 0, last = performance.now();
  const drag = { active: false, pointerId: -1, lastX: 0, lastTime: 0, velocity: 0 };

  const frame = now => {
    const delta = Math.min(now - last, 64);
    last = now;
    const seconds = delta / 1000;
    pace += ((drag.active ? 0 : 1) - pace) * (1 - Math.exp(-delta / 150));
    let travel = s.velocity * seconds * pace;
    if (!drag.active && fling !== 0) {
      travel += fling * seconds;
      fling *= Math.exp(-delta / 420);
      if (Math.abs(fling) < 4) fling = 0;
    }
    baseX += travel;

    const thrown = drag.active ? drag.velocity : fling;
    const surge = Math.tanh(Math.abs(thrown) / 2000);
    const heading = surge > 0 ? Math.sign(thrown) : Math.sign(s.velocity);
    const ease = 1 - Math.exp(-delta / 110);
    skewX += (-heading * s.skewWithVelocity * surge - skewX) * ease;
    scaleY += (1 + s.scaleWithVelocity * surge - scaleY) * ease;
    const x = copyWidth === 0 ? 0 : wrap(-copyWidth, 0, baseX);
    track.style.transform = `translateX(${x}px) skewX(${skewX}deg) scaleY(${scaleY})`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  parallax.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    Object.assign(drag, { active: true, pointerId: event.pointerId, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0 });
    fling = 0;
    parallax.setPointerCapture(event.pointerId);
    parallax.style.cursor = 'grabbing';
  });
  parallax.addEventListener('pointermove', event => {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.lastX;
    const dt = Math.max(event.timeStamp - drag.lastTime, 1);
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    baseX += dx;
    drag.velocity += ((dx / dt) * 1000 - drag.velocity) * (1 - Math.exp(-dt / 50));
  });
  const release = event => {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    drag.active = false;
    // A pointer held still before release drops the row instead of throwing it.
    fling = event.timeStamp - drag.lastTime > 90 ? 0 : Math.max(-5000, Math.min(5000, drag.velocity));
    drag.velocity = 0;
    parallax.style.cursor = 'grab';
  };
  parallax.addEventListener('pointerup', release);
  parallax.addEventListener('pointercancel', release);
}
