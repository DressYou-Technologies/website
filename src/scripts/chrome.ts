import { gsap } from 'gsap';
import { FULL_MENU_QUERY, HEADER_FOLD_AT, HERO_PASSED_OFFSET, MENU_GAP_PX, MOTION_QUERY } from '../lib/constants';
import { all, one } from '../motion/dom';

const motion = () => window.matchMedia(MOTION_QUERY).matches;

// The header is a pill once scrolled, at one size either way, and shows its buttons once the hero is gone.
function header(top: HTMLElement) {
  const hero = document.querySelector<HTMLElement>('.hero');
  const update = () => {
    const y = window.scrollY;
    top.classList.toggle('folded', y > HEADER_FOLD_AT);
    top.classList.toggle('app-shown', !hero || y > hero.offsetHeight - HERO_PASSED_OFFSET);
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

// The menu opens under the header's right edge, wherever the header's current width puts it.
function menuPop(top: HTMLElement, menu: HTMLElement) {
  menu.addEventListener('beforetoggle', (e) => {
    if (!(e instanceof ToggleEvent) || e.newState !== 'open') return;
    const edge = top.getBoundingClientRect();
    menu.style.setProperty('--menu-top', `${edge.bottom + MENU_GAP_PX}px`);
    menu.style.setProperty('--menu-right', `${document.documentElement.clientWidth - edge.right}px`);
  });
  menu.addEventListener('toggle', (e) => {
    if (!(e instanceof ToggleEvent) || e.newState !== 'open' || !motion()) return;
    // On phones the menu is the whole screen: it fades in rather than growing from the header.
    if (window.matchMedia(FULL_MENU_QUERY).matches) gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: .25, ease: 'power2.out' });
    else gsap.fromTo(menu, { y: -8, scale: .94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .36, ease: 'back.out(1.5)' });
    gsap.from(menu.querySelectorAll('.menu-item'), { y: 10, opacity: 0, duration: .3, stagger: .04, delay: .06, ease: 'power3.out' });
  });
}

// In-page anchors scroll in JS: CSS smooth scrolling fights ScrollTrigger's snap.
function anchors() {
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href*="#"]') : null;
    if (!a || a.pathname !== location.pathname) return;
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
// `shownAt` is when the form came into view: its dialog's opening, or the page's start for the footer's.
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

// The extension demo: tap DressYou in the toolbar, the panel slides in, the twin wears the piece, the size follows.
function demo(dialog: HTMLDialogElement) {
  const box = dialog.querySelector<HTMLElement>('.xdemo');
  if (!box || !motion()) return;
  const ctx = gsap.context(() => {
    const ext = one(box, '.xext'), ring = one(box, '.xring'), panel = one(box, '.xpanel'), twin = one(box, '.xtwin'), size = one(box, '.xsize');
    gsap.timeline({ repeat: -1, repeatDelay: .4 })
      .set(panel, { xPercent: 115 }).set(twin, { clipPath: 'inset(0% 0% 100% 0%)' }).set(size, { autoAlpha: 0, scale: .6 })
      .to(ext, { scale: .82, duration: .1, ease: 'power2.in' }, .7)
      .to(ext, { scale: 1, duration: .3, ease: 'back.out(3)' }, .8)
      .fromTo(ring, { scale: .5, opacity: .9 }, { scale: 1.8, opacity: 0, duration: .5, ease: 'power2.out' }, .7)
      .to(panel, { xPercent: 0, duration: .55, ease: 'power3.out' }, .95)
      .to(twin, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power3.inOut' }, 1.35)
      .to(size, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(2.4)' }, 2.25)
      .to(panel, { xPercent: 115, duration: .45, ease: 'power2.in' }, 4.6);
  }, box);
  dialog.addEventListener('close', () => ctx.revert(), { once: true });
}

function dialogs() {
  let openedAt = 0;
  document.querySelectorAll<HTMLFormElement>('form.notify').forEach((form) => notify(form, () => (form.closest('dialog') ? openedAt : 0)));
  document.querySelectorAll<HTMLButtonElement>('[data-get]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.getElementById(`get-${button.dataset.get}`);
    if (!(dialog instanceof HTMLDialogElement)) return;
    button.closest<HTMLElement>('[popover]')?.hidePopover();
    dialog.showModal();
    openedAt = performance.now();
    demo(dialog);
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
  const top = document.querySelector<HTMLElement>('.top'), menu = document.querySelector<HTMLElement>('#menu');
  if (top && menu) { header(top); menuPop(top, menu); }
  if (top) tone(top, all(top, '.brand, .hdr-burger'));
  anchors();
  dialogs();
}
