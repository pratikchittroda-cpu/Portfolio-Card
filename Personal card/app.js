// Edit this object to personalize the card. Empty values are intentionally left blank.
const contact = {
  firstName: 'Pratik',
  lastName: '',
  role: 'Independent developer',
  bio: 'I build ambitious apps and websites where sharp design, thoughtful code, and AI meet.',
  email: 'pratikchittroda@gmail.com',
  phone: '8980183557',
  location: 'Gujarat',
  website: '/portfolio',
  cardUrl: '',
  socials: {
    github: 'https://github.com/pratikchittroda-cpu',
    instagram: 'https://www.instagram.com/pratik.limitless',
    linkedin: 'https://www.linkedin.com/in/pratik-chittroda/'
  }
};

(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const valueOf = (value) => (typeof value === 'string' ? value.trim() : '');

  const fullName = [contact.firstName, contact.lastName]
    .map(valueOf)
    .filter(Boolean)
    .join(' ');
  const displayName = fullName || 'Pratik';
  const toast = $('#toast');
  const toastText = $('#toastText');
  let toastTimer;

  document.title = 'Pratik — Digital card';

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function isHttpUrl(value) {
    const candidate = valueOf(value);
    if (!candidate) return false;
    try {
      const parsed = new URL(candidate);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function isLocalUrl(value) {
    try {
      const parsed = new URL(value, window.location.href);
      return (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
        || parsed.hostname === 'localhost'
        || parsed.hostname === '127.0.0.1'
        || parsed.hostname === '::1'
        || parsed.origin === 'null';
    } catch {
      return true;
    }
  }

  function missingMessage(label) {
    return `Add your ${label} in app.js`;
  }

  function configureActionLink(element, value, href, label) {
    if (!element) return;
    const configured = Boolean(valueOf(value));
    if (configured) {
      element.href = href;
      element.removeAttribute('aria-disabled');
      return;
    }

    // Remove any placeholder href from the HTML so an unset value cannot navigate.
    element.removeAttribute('href');
    element.setAttribute('aria-disabled', 'true');
    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showToast(missingMessage(label));
    });
  }

  function configureUrlLink(element, value, label) {
    if (!element) return;
    const configured = valueOf(value);
    if (isHttpUrl(configured)) {
      element.href = configured;
      element.target = '_blank';
      element.rel = 'noreferrer';
      element.removeAttribute('aria-disabled');
      return;
    }

    // Allow relative paths (e.g. '/portfolio') as valid internal links.
    if (configured && (configured.startsWith('/') || configured.startsWith('./'))) {
      element.href = configured;
      element.removeAttribute('aria-disabled');
      return;
    }

    element.removeAttribute('href');
    element.setAttribute('aria-disabled', 'true');
    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showToast(configured ? `Add a valid ${label} URL in app.js` : missingMessage(label));
    });
  }

  const displayNameElement = $('#displayName');
  const displayRoleElement = $('#displayRole');
  const displayBioElement = $('#displayBio');
  if (displayNameElement) displayNameElement.textContent = displayName;
  if (displayRoleElement) {
    const roleAndLocation = [valueOf(contact.role), valueOf(contact.location)]
      .filter(Boolean)
      .join(' · ');
    displayRoleElement.textContent = roleAndLocation;
  }
  if (displayBioElement) displayBioElement.textContent = valueOf(contact.bio);

  const emailText = $('#emailText');
  const phoneText = $('#phoneText');
  if (emailText) emailText.textContent = valueOf(contact.email) || 'Add email';
  if (phoneText) phoneText.textContent = valueOf(contact.phone) || 'Add phone';

  configureActionLink($('#emailLink'), contact.email, `mailto:${valueOf(contact.email)}`, 'email');
  configureActionLink(
    $('#phoneLink'),
    contact.phone,
    `tel:${valueOf(contact.phone).replace(/[^+\d]/g, '')}`,
    'phone number'
  );
  configureUrlLink($('#websiteLink'), contact.website, 'website');

  const socialLabels = {
    github: 'GitHub',
    instagram: 'Instagram',
    linkedin: 'LinkedIn'
  };
  $$('[data-social]').forEach((element) => {
    const socialName = element.dataset.social;
    configureUrlLink(element, contact.socials && contact.socials[socialName], socialLabels[socialName] || socialName);
  });

  const configuredContactMethods = [
    valueOf(contact.email),
    valueOf(contact.phone),
    isHttpUrl(contact.website) ? contact.website : '',
    ...Object.values(contact.socials || {}).filter(isHttpUrl)
  ].some(Boolean);
  const profileCard = $('.identity-card');
  if (profileCard) {
    profileCard.classList.toggle('profile-incomplete', !configuredContactMethods);
    profileCard.dataset.profileIncomplete = String(!configuredContactMethods);
  }
  if (document.body) document.body.classList.toggle('profile-incomplete', !configuredContactMethods);
  const availability = $('#availability');
  if (availability && !configuredContactMethods) {
    availability.textContent = 'Profile incomplete — add contact details in app.js';
  }

  async function copyText(text, successMessage = 'Copied to clipboard') {
    const copyValue = valueOf(text);
    if (!copyValue) {
      showToast('Nothing to copy');
      return false;
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(copyValue);
        showToast(successMessage);
        return true;
      }
    } catch {
      // Try the older browser fallback below.
    }

    let helper;
    try {
      if (typeof document.execCommand !== 'function') throw new Error('Clipboard fallback unavailable');
      helper = document.createElement('textarea');
      helper.value = copyValue;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy') === true;
      if (!copied) throw new Error('Clipboard copy failed');
      showToast(successMessage);
      return true;
    } catch {
      showToast('Could not copy to clipboard');
      return false;
    } finally {
      if (helper) helper.remove();
    }
  }

  $$('.copy-action').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const field = button.dataset.field;
      const value = field && Object.prototype.hasOwnProperty.call(contact, field) ? contact[field] : '';
      if (!valueOf(value)) {
        showToast(missingMessage(field || 'contact detail'));
        return;
      }
      void copyText(value).catch(() => showToast('Could not copy to clipboard'));
    });
  });

  function shareUrl() {
    return isHttpUrl(contact.cardUrl) ? valueOf(contact.cardUrl) : window.location.href;
  }

  const dialog = $('#contactDialog');
  const dialogTitle = $('#dialogTitle');
  const dialogClose = $('#dialogClose');
  const shareUrlInput = $('#shareUrl');
  const dialogHint = $('#dialogHint');
  const copyLink = $('#copyLink');
  const dialogSave = $('#dialogSave');
  let previouslyFocused;

  function updateShareDialog() {
    const url = shareUrl();
    if (dialogTitle) dialogTitle.textContent = `${displayName}'s share link`;
    if (shareUrlInput) {
      shareUrlInput.value = url;
      shareUrlInput.readOnly = true;
    }
    if (dialogHint) {
      dialogHint.textContent = isLocalUrl(url)
        ? 'This is a local URL. To share with others, deploy the card to a hosted public URL and set contact.cardUrl in app.js.'
        : 'Copy this public card link or share it with your preferred app.';
    }
  }

  function restoreFocus() {
    if (previouslyFocused && typeof previouslyFocused.focus === 'function' && previouslyFocused.isConnected) {
      previouslyFocused.focus();
    }
    previouslyFocused = undefined;
  }

  function closeDialog() {
    if (!dialog) return;
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else restoreFocus();
  }

  function openShareDialog() {
    if (!dialog) {
      showToast(isLocalUrl(shareUrl())
        ? 'Deploy this card to a hosted public URL before sharing'
        : 'Sharing is unavailable');
      return;
    }
    updateShareDialog();
    previouslyFocused = document.activeElement;
    try {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      if (dialogClose) dialogClose.focus();
    } catch {
      dialog.setAttribute('open', '');
    }
  }

  async function shareCard() {
    const url = shareUrl();
    const shareData = {
      title: `${displayName} — Contact Card`,
      text: `Connect with ${displayName}, ${valueOf(contact.role)}.`,
      url
    };
    if (navigator.share && !isLocalUrl(url)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    openShareDialog();
  }

  const shareTop = $('#shareTop');
  if (shareTop) shareTop.addEventListener('click', () => void shareCard().catch(() => openShareDialog()));
  const qrTrigger = $('#qrTrigger');
  if (qrTrigger) {
    qrTrigger.setAttribute('aria-label', 'Share this card');
    qrTrigger.setAttribute('title', 'Share this card');
    qrTrigger.addEventListener('click', openShareDialog);
  }
  if (dialogClose) dialogClose.addEventListener('click', closeDialog);
  if (dialog) {
    dialog.addEventListener('close', restoreFocus);
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const outsideBounds = event.clientX < rect.left
        || event.clientX > rect.right
        || event.clientY < rect.top
        || event.clientY > rect.bottom;
      if (event.target === dialog && outsideBounds) closeDialog();
    });
  }
  if (copyLink) {
    copyLink.addEventListener('click', () => {
      void copyText(shareUrl(), 'Card link copied').catch(() => showToast('Could not copy to clipboard'));
    });
  }

  function escapeVCard(value) {
    return valueOf(value)
      .replace(/\\/g, '\\\\')
      .replace(/\r\n|\r|\n/g, '\\n')
      .replace(/([,;])/g, '\\$1');
  }

  function addVCardField(lines, prefix, value) {
    if (valueOf(value)) lines.push(`${prefix}:${escapeVCard(value)}`);
  }

  function addVCardStructuredField(lines, prefix, values) {
    if (values.some(valueOf)) {
      lines.push(`${prefix}:${values.map(escapeVCard).join(';')}`);
    }
  }

  function makeVCard() {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    addVCardStructuredField(lines, 'N', [contact.lastName, contact.firstName, '', '', '']);
    addVCardField(lines, 'FN', displayName);
    addVCardField(lines, 'TITLE', contact.role);
    addVCardField(lines, 'TEL;TYPE=CELL', contact.phone);
    addVCardField(lines, 'EMAIL;TYPE=INTERNET', contact.email);
    if (valueOf(contact.location)) {
      addVCardStructuredField(lines, 'ADR;TYPE=WORK', ['', '', contact.location, '', '', '', '']);
    }
    if (isHttpUrl(contact.website)) addVCardField(lines, 'URL', contact.website);
    Object.entries(contact.socials || {}).forEach(([network, url]) => {
      if (isHttpUrl(url)) addVCardField(lines, `X-SOCIALPROFILE;TYPE=${network}`, url);
    });
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }

  function saveContact() {
    try {
      const blob = new Blob([makeVCard()], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'contact'}.vcf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Contact download started');
    } catch {
      showToast('Could not download contact');
    }
  }

  const saveContactButton = $('#saveContact');
  if (saveContactButton) saveContactButton.addEventListener('click', saveContact);
  if (dialogSave) dialogSave.addEventListener('click', saveContact);
})();
