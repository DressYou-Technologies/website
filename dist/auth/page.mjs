import { chooseLanguage, passwordProblem, readLink, submitReset } from './link.mjs';

const main = document.querySelector('main[data-page]');
const language = chooseLanguage(location.search, navigator.languages);
const link = readLink(main.dataset.page, location.search);
// The reset token is a credential: it leaves the address bar before anything else runs.
if (link.token) history.replaceState(null, '', location.pathname);
const sections = [...main.querySelectorAll('section[data-state]')];

function show(state) {
  for (const section of sections) section.hidden = !(section.dataset.state === state && section.lang === language);
  const active = sections.find((section) => !section.hidden);
  document.documentElement.lang = language;
  document.title = active.dataset.title;
  return active;
}

function wire(form) {
  const input = form.elements.newPassword;
  const button = form.querySelector('button');
  const message = form.querySelector('.message');
  const say = (key) => { message.textContent = form.querySelector(`[data-message="${key}"]`).textContent; };
  let sending = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const problem = passwordProblem(input.value);
    input.setAttribute('aria-invalid', String(problem !== null));
    if (problem) {
      say(problem);
      input.focus();
      return;
    }
    sending = true;
    button.setAttribute('aria-disabled', 'true');
    form.setAttribute('aria-busy', 'true');
    say('saving');
    const outcome = await submitReset({ fetch: (...request) => fetch(...request), token: link.token, newPassword: input.value });
    sending = false;
    button.removeAttribute('aria-disabled');
    form.removeAttribute('aria-busy');
    if (outcome === 'success' || outcome === 'invalid') {
      input.value = '';
      message.textContent = '';
      show(outcome === 'success' ? 'success' : 'invalid').querySelector('h1').focus();
      return;
    }
    say(outcome);
    if (outcome === 'too-short' || outcome === 'too-long') {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  });
}

// A form is wired before it can be seen, so it can never submit natively.
for (const form of main.querySelectorAll('form')) wire(form);
main.querySelector('[data-fallback]').hidden = true;
show(link.state);
