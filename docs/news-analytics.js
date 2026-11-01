(() => {
  'use strict';
  if (window.marvnorNewsAnalytics) return;
  window.marvnorNewsAnalytics = true;
  const mode = new URLSearchParams(location.search).get('analytics');
  const language = document.documentElement.lang;
  const article = document.currentScript.dataset.article;
  const control = document.querySelector('#news-analytics-toggle');
  const test = mode === 'test';
  const privateMode = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  if (location.origin !== 'https://wendelxia.github.io' || !['en', 'zh-CN'].includes(language) ||
      article !== '20261101-results' || mode === 'off' || (navigator.webdriver && !test)) return;
  const identityKey = 'marvnor_news_day' + (test ? '_test' : '');
  const optoutKey = 'marvnor_news_optout';
  let disabled = privateMode, available = true, viewed = false, clicked = false;
  let pageId;
  try {
    disabled ||= localStorage.getItem(optoutKey) === '1';
    pageId = crypto.randomUUID();
  } catch (_) { available = false; }

  function identity() {
    const day = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
    let saved;
    try { saved = JSON.parse(localStorage.getItem(identityKey) || 'null'); } catch (_) {}
    if (!saved || saved.day !== day || typeof saved.id !== 'string') {
      saved = {day, id: crypto.randomUUID()};
      localStorage.setItem(identityKey, JSON.stringify(saved));
    }
    return saved.id;
  }
  function send(event) {
    if (disabled || !available) return false;
    try {
      const body = JSON.stringify({article, language, event, visitor: identity(), event_id: pageId, test});
      fetch('https://api.marvnor.com/public/news-event', {
        method: 'POST', mode: 'no-cors', credentials: 'omit', referrerPolicy: 'no-referrer',
        keepalive: true, headers: {'Content-Type': 'text/plain;charset=UTF-8'}, body
      }).catch(() => {});
      return true;
    } catch (_) { return false; }
  }
  function view() {
    if (!viewed && document.visibilityState === 'visible') viewed = send('view');
  }
  function label() {
    if (!control) return;
    control.hidden = false;
    control.disabled = privateMode || !available;
    const on = !disabled && available;
    control.textContent = language === 'en' ? 'Anonymous stats: ' + (on ? 'on' : 'off') : '匿名统计：' + (on ? '开' : '关');
    control.setAttribute('aria-pressed', String(on));
  }
  control?.addEventListener('click', () => {
    if (privateMode || !available) return;
    try {
      disabled = !disabled;
      localStorage.setItem(optoutKey, disabled ? '1' : '0');
      if (disabled) localStorage.removeItem(identityKey);
      label();
      if (!disabled) view();
    } catch (_) { available = false; label(); }
  });
  document.addEventListener('visibilitychange', view);
  document.addEventListener('click', event => {
    if (clicked) return;
    const link = event.target.closest('a');
    if (!link) return;
    const url = new URL(link.href, location.origin);
    if (url.origin === 'https://api.marvnor.com' && url.pathname === '/docs') {
      view();
      clicked = send('get_started');
    }
  });
  label();
  view();
})();
