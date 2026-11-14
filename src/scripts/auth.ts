import { readVerifiedLink } from '../lib/auth';
import { all } from '../motion/dom';
import { followBrowserLang } from './lang';

export function startVerified() {
  if (followBrowserLang()) return;
  // Every word is in the page, one hidden section per result: this only chooses which shows.
  const result = readVerifiedLink(location.search);
  for (const section of all(document, 'section[data-state]')) section.hidden = section.dataset.state !== result;
}
