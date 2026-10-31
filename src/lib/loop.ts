// A looping animation that runs one pass at a time while its section is on screen. Stopping kills the pass
// in flight, and a pass from before the last stop is ignored when it reports in, so scrolling away and back
// never stacks a second chain on the first.
export interface Running { kill(): void }

export function visibleLoop(pass: (done: () => void) => Running, gapSeconds: number, delay: (seconds: number, fn: () => void) => Running) {
  let current: Running | null = null, timer: Running | null = null, live = false, generation = 0;
  const run = () => {
    const mine = generation;
    current = pass(() => { if (live && mine === generation) timer = delay(gapSeconds, run); });
  };
  return {
    start() { if (live) return; live = true; run(); },
    stop() { live = false; generation += 1; timer?.kill(); current?.kill(); timer = current = null; },
  };
}
