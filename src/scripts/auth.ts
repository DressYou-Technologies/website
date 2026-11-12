import { passwordProblem, readResetLink, readVerifiedLink, submitReset } from '../lib/auth';
import { all, one } from '../motion/dom';

// Every word is in the page, one hidden section per state: this only chooses which shows.
function show(state: string) {
  for (const section of all(document, 'section[data-state]')) section.hidden = section.dataset.state !== state;
}

// The language switch keeps the link, so the other language's page opens in the same state.
function carry(suffix: string) {
  for (const a of all<HTMLAnchorElement>(document, 'a[hreflang]')) a.href = a.pathname + suffix;
}

function wire(form: HTMLFormElement, token: string) {
  const input = one<HTMLInputElement>(form, 'input[name="newPassword"]'), button = one(form, 'button'), status = one(form, '.status');
  const say = (key: string, error: boolean) => { status.textContent = form.dataset[key] ?? ''; status.classList.toggle('error', error); };
  let sending = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const problem = passwordProblem(input.value);
    input.setAttribute('aria-invalid', String(problem !== null));
    if (problem) { say(problem, true); input.focus(); return; }
    // aria-disabled rather than disabled: a disabled button drops the keyboard focus.
    sending = true;
    button.setAttribute('aria-disabled', 'true');
    say('saving', false);
    const outcome = await submitReset(fetch, token, input.value);
    sending = false;
    button.removeAttribute('aria-disabled');
    if (outcome === 'done' || outcome === 'invalid') {
      input.value = '';
      show(outcome);
      // The form is gone, so focus moves to what replaced it and a screen reader reads it.
      one(document, `section[data-state="${outcome}"] [tabindex="-1"]`).focus();
      return;
    }
    say(outcome, true);
    if (outcome === 'short' || outcome === 'long') { input.setAttribute('aria-invalid', 'true'); input.focus(); }
  });
}

export function startReset() {
  const link = readResetLink(location.search, location.hash);
  if (link.state === 'form') {
    // The token is a credential: it leaves the address bar and this history entry before the page does anything else.
    history.replaceState(null, '', location.pathname);
    carry(`#token=${encodeURIComponent(link.token)}`);
    wire(one<HTMLFormElement>(document, 'form.reset'), link.token);
  } else carry(location.search);
  // A browser does not reload for a link pasted onto the open page, so the page reads it again.
  addEventListener('hashchange', () => location.reload());
  show(link.state);
}

export function startVerified() {
  carry(location.search);
  show(readVerifiedLink(location.search));
}
