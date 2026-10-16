// One phrase in sharp focus at a time, framed by corner brackets that glide to the next word.
// Ported to plain DOM and CSS transitions from React Bits' TrueFocus (brackets style, sequential order).
// Copyright (c) 2026 David Haz — MIT + Commons Clause, see react-bits.LICENSE.txt.

const SMOOTH = 'cubic-bezier(0.65, 0, 0.35, 1)';
const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

// Cycles the focus through the element's child spans: each span is one focus step,
// so the markup decides whether a step is a single word or a whole phrase.
export function trueFocus(element, s) {
  const words = [...element.children];
  words.forEach(span => {
    span.style.transition = `filter ${s.duration}s ease, opacity ${s.duration}s ease`;
  });
  const corners = CORNERS.map(corner => {
    const span = document.createElement('span');
    const top = corner.startsWith('top');
    const left = corner.endsWith('left');
    Object.assign(span.style, {
      position: 'absolute', left: '0', top: '0', boxSizing: 'border-box', borderRadius: '3px',
      width: `${s.cornerSize}px`, height: `${s.cornerSize}px`, borderStyle: 'solid', borderColor: s.borderColor,
      borderWidth: `${top ? s.borderWidth : 0}px ${left ? 0 : s.borderWidth}px ${top ? 0 : s.borderWidth}px ${left ? s.borderWidth : 0}px`,
      opacity: '0',
      // The frame fades in where it first lands; it only glides once placed.
      transition: `opacity ${s.duration}s ${SMOOTH}`,
    });
    return span;
  });
  const frame = document.createElement('span');
  frame.className = 'focus-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.append(...corners);
  element.append(frame);

  let index = 0;
  const place = () => {
    const word = words[index];
    const x = word.offsetLeft, y = word.offsetTop, w = word.offsetWidth, h = word.offsetHeight;
    // Separate gaps let the frame hug the cap height while keeping air at the sides.
    const left = x - s.gapX, top = y - s.gapY;
    const right = x + w + s.gapX - s.cornerSize;
    const bottom = y + h + s.gapY - s.cornerSize;
    [[left, top], [right, top], [left, bottom], [right, bottom]]
      .forEach(([cx, cy], i) => {
        corners[i].style.transform = `translate(${cx}px, ${cy}px)`;
        corners[i].style.opacity = '1';
      });
    requestAnimationFrame(() => corners.forEach(corner => {
      corner.style.transition = `transform ${s.duration}s ${SMOOTH}, opacity ${s.duration}s ${SMOOTH}`;
    }));
    words.forEach((span, i) => {
      span.style.filter = `blur(${i === index ? 0 : s.blurAmount}px)`;
      span.style.opacity = i === index ? '1' : String(s.unfocusedOpacity);
    });
  };
  new ResizeObserver(place).observe(element);
  setInterval(() => {
    index = (index + 1) % words.length;
    place();
  }, (s.duration + s.pause) * 1000);
}
