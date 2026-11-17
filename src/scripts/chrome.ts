import { gsap } from 'gsap';
import { FULL_MENU_QUERY, HEADER_AWAY_STEP, HEADER_FOLD_AT, HERO_PASSED_OFFSET, MOTION_QUERY, TOUCH_QUERY } from '../lib/constants';
import { barsMoved } from '../lib/steady';
import { all, one } from '../motion/dom';

const motion = () => window.matchMedia(MOTION_QUERY).matches;

// The page sizes itself from --svh (tokens.css), which stays put while a browser's bars slide away and back: in an in-app
// browser that resizes the whole page on every change of scroll direction (founder, 2026-11-16).
function steadyViewport() {
  const touch = window.matchMedia(TOUCH_QUERY);
  let held = { width: 0, height: 0 };
  const update = () => {
    const now = { width: window.innerWidth, height: window.innerHeight };
    if (barsMoved(held, now, touch.matches)) return;
    held = now;
    document.documentElement.style.setProperty('--svh', `${now.height / 100}px`);
  };
  window.addEventListener('resize', update);
  update();
}

// The header is a pill once scrolled, at one size either way, and shows its buttons once the hero is gone.
function header(top: HTMLElement) {
  const hero = document.querySelector<HTMLElement>('.hero');
  let last = window.scrollY;
  const update = () => {
    const y = window.scrollY;
    top.classList.toggle('folded', y > HEADER_FOLD_AT);
    top.classList.toggle('app-shown', !hero || y > hero.offsetHeight - HERO_PASSED_OFFSET);
    // Scrolling down, past the fold: phones let the header leave (Header.astro). Scrolling up brings it back.
    if (Math.abs(y - last) < HEADER_AWAY_STEP) return;
    top.classList.toggle('away', y > last && y > HEADER_FOLD_AT);
    last = y;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// On phones the logo and the menu button float with no plate, so each takes the colour that reads on whatever is under
// it: sections on a dark ground say so with data-tone="dark", everything else is light.
function tone(top: HTMLElement, marks: HTMLElement[]) {
  const phone = window.matchMedia(FULL_MENU_QUERY);
  let frame = 0;
  const update = () => {
    frame = 0;
    for (const mark of marks) {
      if (!phone.matches) { mark.classList.remove('on-light'); continue; }
      const r = mark.getBoundingClientRect();
      const under = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find((el) => !top.contains(el));
      mark.classList.toggle('on-light', !under?.closest('[data-tone="dark"]'));
    }
  };
  const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  phone.addEventListener('change', queue);
  update();
}

// The menu is phones only and takes the whole screen: it fades in.
function menuPop(menu: HTMLElement) {
  menu.addEventListener('toggle', (e) => {
    if (!(e instanceof ToggleEvent) || e.newState !== 'open' || !motion()) return;
    gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: .25, ease: 'power2.out' });
    gsap.from(menu.querySelectorAll('.menu-item'), { y: 10, opacity: 0, duration: .3, stagger: .04, delay: .06, ease: 'power3.out' });
  });
}

// In-page anchors scroll in JS: CSS smooth scrolling fights ScrollTrigger's snap.
function anchors() {
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href*="#"]') : null;
    // The skip link keeps the browser's own jump, which also moves the keyboard's place in the page.
    if (!a || a.classList.contains('skip') || a.pathname !== location.pathname) return;
    a.closest<HTMLElement>('[popover]')?.hidePopover();
    const target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    scrollToSection(target, motion() ? 'smooth' : 'auto');
  });
}

// A section can publish where a visitor should land inside it (the stylist's first question).
function scrollToSection(target: HTMLElement, behavior: ScrollBehavior) {
  const offset = Number(target.dataset.anchorOffset ?? 0);
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior });
}

// Arriving from another page on /#section: land again once the sections have published their offsets.
export function landOnHash() {
  const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (target) scrollToSection(target, 'auto');
}

const NOTIFY_URL = '/api/notify';
type Answer = 'ok' | 'email' | 'closed' | 'failed';

// "Be notified": the page posts the address to its own function, which hands it to the email list.
// `shownAt` is when the form came into view: its dialog's opening.
function notify(form: HTMLFormElement, shownAt: () => number) {
  const email = one<HTMLInputElement>(form, 'input[name="email"]'), trap = one<HTMLInputElement>(form, 'input[name="website"]');
  const button = one<HTMLButtonElement>(form, 'button[type="submit"]'), status = one(form, '.status');
  // The page's language supplies the words for each answer, as data attributes on the form.
  const say = (key: Answer) => { status.textContent = form.dataset[key] ?? ''; status.classList.toggle('error', key !== 'ok'); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!email.checkValidity()) { say('email'); email.focus(); return; }
    button.disabled = true;
    try {
      const res = await fetch(NOTIFY_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: email.value, website: trap.value, elapsed: Math.round(performance.now() - shownAt()), lang: form.dataset.lang }) });
      const { error } = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) { say('ok'); form.classList.add('done'); return; }
      say(error === 'email' || error === 'closed' ? error : 'failed');
    } catch {
      say('failed');
    } finally {
      button.disabled = false;
    }
  });
}

function dialogs() {
  let openedAt = 0;
  document.querySelectorAll<HTMLFormElement>('form.notify').forEach((form) => notify(form, () => openedAt));
  document.querySelectorAll<HTMLButtonElement>('[data-get]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.getElementById(`get-${button.dataset.get}`);
    if (!(dialog instanceof HTMLDialogElement)) return;
    button.closest<HTMLElement>('[popover]')?.hidePopover();
    dialog.showModal();
    openedAt = performance.now();
    dialog.addEventListener('close', () => button.focus({ preventScroll: true }), { once: true });
    if (!motion()) return;
    gsap.from(dialog, { scale: .6, opacity: 0, transformOrigin: '50% 50%', duration: .5, ease: 'back.out(1.6)' });
    gsap.fromTo(dialog.querySelector('.title'), { y: 26, opacity: 0, filter: 'blur(6px)', '--m': '-40%' },
      { y: 0, opacity: 1, filter: 'blur(0px)', '--m': '100%', duration: .9, delay: .12, ease: 'power3.out', clearProps: 'filter' });
  }));
  // A click on the backdrop lands on the dialog element itself.
  document.querySelectorAll('dialog.get').forEach((dialog) => dialog.addEventListener('click', (e) => {
    if (e.target === dialog && dialog instanceof HTMLDialogElement) dialog.close();
  }));
}

export function startChrome() {
  document.documentElement.classList.add('js');
  steadyViewport();
  const top = document.querySelector<HTMLElement>('.top'), menu = document.querySelector<HTMLElement>('#menu');
  if (top && menu) { header(top); menuPop(menu); }
  if (top) tone(top, all(top, '.brand, .hdr-burger'));
  anchors();
  dialogs();
}
