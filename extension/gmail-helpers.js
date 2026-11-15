// Isolated content-script utility functions. No networking, reading, or storage here.
(() => {
  'use strict';
  const clean = value => String(value || '')
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u00a0]/g, ' ')
    .replace(/\s+/g, ' ').trim();

  // Gmail often uses role=button and places a keyboard hint inside the tooltip.
  function isSendButton(button) {
    if (!button || !button.getAttribute) return false;
    const labels = [button.getAttribute('data-tooltip'), button.getAttribute('aria-label'), button.getAttribute('title')];
    const text = clean(button.textContent);
    for (const label of [...labels, text]) {
      const name=clean(label);
      if (!name) continue;
      if (/^Send(?:\s*\([^)]{0,55}\))?$/i.test(name)) return true;
    }
    return false; // Never mistake Send & archive, Schedule send, or a menu for Send.
  }
  function findButton(target) {
    if (!target || !target.closest) return null;
    return target.closest('button,[role="button"]');
  }
  function findComposer(button) {
    if (!button || !button.closest) return null;
    // Gmail uses [role=dialog] for pop-out and .M9 for ordinary compose windows.
    // Inline reply and other views are deliberately outside this beta's coverage.
    for (const selector of ['[role="dialog"]', '.M9']) {
      const root = button.closest(selector);
      if (!root) continue;
      const body = root.querySelector('[g_editable="true"][contenteditable="true"], [aria-label="Message Body"][contenteditable="true"], [contenteditable="true"][role="textbox"]');
      if (!body || !root.contains(body)) continue;
      return {root, body};
    }
    return null;
  }
  function snapshot(composer) {
    if (!composer?.root?.isConnected || !composer?.body?.isConnected) return null;
    const root=composer.root;
    const body=(composer.body.innerText || composer.body.textContent || '').trim();
    // Changes to recipients/subject invalidate approvals. Gmail uses different form
    // controls across layouts; collect the available text and editable chip values.
    const fields = Array.from(root.querySelectorAll('input, textarea, [name="subjectbox"], [email], [data-hovercard-id], [data-email], [data-recipient-email]'));
    const meta = fields.map(el=>[
      el.getAttribute('name')||'', el.getAttribute('email')||'', el.getAttribute('data-email')||'',
      el.getAttribute('data-recipient-email')||'', el.getAttribute('data-hovercard-id')||'',
      'value' in el?String(el.value||''):clean(el.textContent)
    ].join(':')).join('|');
    // The whole compose-window innerText includes transient Gmail labels such as
    // "Saving...", "Draft saved", and focus-dependent toolbar text. Fingerprinting
    // that dynamic UI made approval disappear even when the draft was unchanged.
    // Instead collect only recognized recipient chips and editable fields.
    const recipientChips = Array.from(root.querySelectorAll(
      '.vR, .vN, [email], [data-email], [data-recipient-email], [data-hovercard-id], [data-recipient]'
    )).map(el => [
      el.getAttribute('email')||'', el.getAttribute('data-email')||'',
      el.getAttribute('data-recipient-email')||'', el.getAttribute('data-hovercard-id')||'',
      el.getAttribute('data-recipient')||'', clean(el.textContent)
    ].join(':')).join('|');
    return { body, fingerprint: JSON.stringify([body, meta, recipientChips]) };
  }
  globalThis.PausePilotGmail = Object.freeze({clean,isSendButton,findButton,findComposer,snapshot});
})();
