const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'index.html'), 'utf8');
const script = path.join(__dirname, '..', 'docs', 'locale.js');

function page(url, stored = null, storageFails = false) {
  const elements = new Map();
  for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) {
    assert(!elements.has(key), `duplicate translation key: ${key}`);
    elements.set(key, { dataset: { i18n: key }, textContent: '', setAttribute(name, value) { this[name] = value; } });
  }
  const attrs = new Map();
  for (const [, key, attr] of html.matchAll(/data-i18n-attr="([^"]+)" data-i18n-attribute="([^"]+)"/g)) {
    attrs.set(key, { dataset: { i18nAttr: key, i18nAttribute: attr }, getAttribute(name) { return this[name] || ''; }, setAttribute(name, value) { this[name] = value; } });
  }
  const buttons = ['en', 'zh-CN'].map(lang => ({ dataset: { lang }, listeners: {}, setAttribute(name, value) { this[name] = value; }, addEventListener(name, fn) { this.listeners[name] = fn; } }));
  const portalLinks = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*\bdata-portal-link\b/g)].map(match => ({ href: match[1].replaceAll('&amp;', '&') }));
  const feedbackImages = [...html.matchAll(/<img[^>]+data-feedback-image="([^"]+)"[^>]*>/g)].map(([tag, kind]) => {
    const link = {};
    const dataset = Object.fromEntries([...tag.matchAll(/data-([a-z-]+)="([^"]+)"/g)].map(([, key, value]) => [key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value]));
    return { kind, dataset, link, closest(selector) { assert.equal(selector, 'a'); return link; } };
  });
  const homeLink = { href: new URL('./?lang=en', url).href };
  const switcher = { hidden: true };
  let current = new URL(url);
  const historyEntries = [current.href];
  let historyIndex = 0;
  let saved = stored;
  const window = {
    get location() { return { href: current.href, search: current.search }; },
    history: {
      pushState(_state, _title, value) {
        current = new URL(value, current);
        historyEntries.splice(++historyIndex, Infinity, current.href);
      },
      replaceState(_state, _title, value) {
        current = new URL(value, current);
        historyEntries[historyIndex] = current.href;
      },
      back() {
        if (historyIndex > 0) {
          current = new URL(historyEntries[--historyIndex]);
          window.listeners.popstate();
        }
      },
    },
    localStorage: {
      getItem() { if (storageFails) throw Error('blocked'); return saved; },
      setItem(_key, value) { if (storageFails) throw Error('blocked'); saved = value; },
    },
    listeners: {},
    addEventListener(name, fn) { this.listeners[name] = fn; },
  };
  const document = {
    documentElement: { lang: 'en' },
    title: html.match(/<title>([^<]+)<\/title>/)[1],
    querySelectorAll(selector) {
      if (selector === '[data-i18n]') return [...elements.values()];
      if (selector === '[data-i18n-attr]') return [...attrs.values()];
      if (selector === '[data-lang]') return buttons;
      if (selector === '[data-portal-link]') return portalLinks;
      if (selector === '[data-feedback-image]') return feedbackImages;
      if (selector === '[data-home-link]') return [homeLink];
      if (selector === '[data-locale-switch]') return [switcher];
      throw Error(`unexpected selector: ${selector}`);
    },
  };
  vm.runInNewContext(fs.readFileSync(script, 'utf8'), { window, document, URL }, { filename: script });
  return { elements, attrs, buttons, portalLinks, feedbackImages, homeLink, switcher, window, document, get url() { return current; }, get stored() { return saved; } };
}

test('Chinese URL selects translated page, metadata, accessible labels and buttons', () => {
  const app = page('https://example.test/marvnor/?lang=zh-CN&ref=demo', 'en');
  assert.equal(app.document.documentElement.lang, 'zh-CN');
  assert.match(app.document.title, /守真大模型系统/);
  assert.match(app.elements.get('hero.lead').textContent, /记录/);
  assert.match(app.attrs.get('chart.label')['aria-label'], /5,328/);
  assert.match(app.attrs.get('meta.description').content, /记录/);
  assert.equal(app.buttons[1]['aria-pressed'], 'true');
  assert.equal(app.stored, 'zh-CN');
  assert.equal(app.switcher.hidden, false);
  assert.deepEqual(new Set(app.portalLinks.map(link => new URL(link.href).pathname)),
    new Set(['/docs/api', '/login', '/home', '/register', '/docs']));
  assert(app.portalLinks.every(link => new URL(link.href).searchParams.get('lang') === 'zh-CN'));
  assert.equal(new URL(app.homeLink.href).searchParams.get('lang'), 'zh-CN');
});

test('switching to English updates URL and preserves unrelated query parameters', () => {
  const app = page('https://example.test/marvnor/?lang=zh-CN&ref=demo');
  app.buttons[0].listeners.click();
  assert.equal(app.url.searchParams.get('lang'), 'en');
  assert.equal(app.url.searchParams.get('ref'), 'demo');
  assert.equal(app.document.documentElement.lang, 'en');
  assert.match(app.document.title, /Truth-Preserving Model System/);
  assert.equal(app.buttons[0]['aria-pressed'], 'true');
  assert.equal(app.stored, 'en');
  assert(app.portalLinks.every(link => new URL(link.href).searchParams.get('lang') === 'en'));
  const trialLink = app.portalLinks.find(link => new URL(link.href).pathname === '/home');
  assert.equal(new URL(trialLink.href).searchParams.get('utm_source'), 'github_pages');
});

test('saved language works without URL and blocked storage falls back safely', () => {
  assert.equal(page('https://example.test/marvnor/', 'zh-CN').document.documentElement.lang, 'zh-CN');
  const app = page('https://example.test/marvnor/', null, true);
  assert.equal(app.document.documentElement.lang, 'en');
  app.buttons[1].listeners.click();
  assert.equal(app.document.documentElement.lang, 'zh-CN');
  assert.equal(app.url.searchParams.get('lang'), 'zh-CN');
});

test('browser back restores the language selected by the URL', () => {
  const app = page('https://example.test/marvnor/?lang=zh-CN');
  app.buttons[0].listeners.click();
  app.window.history.pushState(null, '', '?lang=zh-CN');
  app.window.listeners.popstate();
  assert.equal(app.document.documentElement.lang, 'zh-CN');
  assert.equal(app.buttons[1]['aria-pressed'], 'true');
});

test('back from English restores saved Chinese when the initial URL lacked lang', () => {
  const app = page('https://example.test/marvnor/?utm_source=demo#start', 'zh-CN');
  assert.equal(app.url.searchParams.get('lang'), 'zh-CN');
  assert.equal(app.url.searchParams.get('utm_source'), 'demo');
  assert.equal(app.url.hash, '#start');
  app.buttons[0].listeners.click();
  assert.equal(app.document.documentElement.lang, 'en');
  app.window.history.back();
  assert.equal(app.document.documentElement.lang, 'zh-CN');
  assert.equal(app.url.searchParams.get('lang'), 'zh-CN');
  assert.equal(app.stored, 'zh-CN');
});

test('all marked text and accessibility attributes have a Chinese translation', () => {
  const source = fs.readFileSync(script, 'utf8');
  const keys = [...source.matchAll(/^\s+'([^']+)':/gm)].map(match => match[1]);
  const textKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]);
  const attrKeys = [...html.matchAll(/data-i18n-attr="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(new Set(keys), new Set([...textKeys, ...attrKeys]));
  assert.equal(keys.length, new Set(keys).size);
});

test('recorded evidence remains linked and onboarding uses only the MCP setup', () => {
  assert.match(html, /examples\/recorded-run\.json/);
  assert.doesNotMatch(html, /"reason": "conflicting_values"/);
  const start = html.split('<section id="start"')[1].split('</section>')[0];
  assert.match(start, /https:\/\/api\.marvnor\.com\/v1\/mcp/);
  assert.match(start, /Authorization: Bearer &lt;MARVNOR_API_KEY&gt;/);
  assert.doesNotMatch(start, /Python|quickstart\.py|download|hidden prompt/);
  assert.match(html, /<script src="locale\.js" defer><\/script>/);
  assert.match(html, /data-lang="en"/);
  assert.match(html, /data-lang="zh-CN"/);
});

test('news follows the selected language and both published articles retain test scope', () => {
  const app = page('https://example.test/marvnor/?lang=zh-CN');
  assert.equal(app.attrs.get('news.href').href, 'news.zh-CN.html');
  for (const [file, lang, brand, scope] of [
    ['news.html', 'en', 'Truth-Preserving Model System', 'structured records'],
    ['news.zh-CN.html', 'zh-CN', '守真大模型系统', '结构化记录'],
  ]) {
    const article = fs.readFileSync(path.join(__dirname, '..', 'docs', file), 'utf8');
    assert.ok(article.includes('lang="' + lang + '"'));
    assert.ok(article.includes(brand));
    assert.ok(article.includes(scope));
    assert.ok(article.includes('98.2%'));
    assert.equal((article.match(/<h1>/g) || []).length, 1);
    assert.doesNotMatch(article, /Bearer|source, relation|source.*target|djet_live_|PRIVATE KEY/);
  }
});

test('feedback uses original images instead of a written case', () => {
  const app = page('https://example.test/marvnor/?lang=zh-CN');
  assert.equal(app.elements.get('feedback.title').textContent, '用户反馈');
  assert.equal(app.elements.get('feedback.beforeLabel')?.textContent, '接入前');
  assert.equal(app.elements.get('feedback.afterLabel')?.textContent, '接入后');
  assert.ok(html.includes('width="1110" height="915"'));
  for (const name of ['feedback-before.png', 'feedback-after.png']) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'assets', name)));
    assert.ok(html.includes(`data-zh-src="assets/${name}"`));
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'assets', name.replace('.png', '-en.png'))));
  }
  assert.doesNotMatch(html, /project-conversation\.md|story\.summary|one user reported/);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'docs', 'cases', 'project-conversation.md')), false);
});

test('feedback image, full-size link and dimensions follow language in both directions', () => {
  const app = page('https://example.test/marvnor/?lang=zh-CN');
  assert.equal(app.feedbackImages.length, 2);
  for (const image of app.feedbackImages) {
    assert.equal(image.src, `assets/feedback-${image.kind}.png`);
    assert.equal(image.link.href, image.src);
    assert.equal(image.height, image.kind === 'before' ? 589 : 887);
  }
  app.buttons[0].listeners.click();
  for (const image of app.feedbackImages) {
    assert.equal(image.src, `assets/feedback-${image.kind}-en.png`);
    assert.equal(image.link.href, image.src);
    assert.equal(image.height, image.kind === 'before' ? 617 : 915);
  }
  app.window.history.back();
  assert.equal(app.feedbackImages[0].src, 'assets/feedback-before.png');
  assert.match(html, /Original Chinese screenshots/);
});

test('landing page starts with the guest test key and keeps signup distinct', () => {
  assert.match(html, /href="https:\/\/api\.marvnor\.com\/home\?lang=en[^\"]*"[^>]*data-portal-link>\s*<span data-i18n="hero\.try"/);
  assert.match(html, /data-i18n="hero\.trialNote"/);
  assert.match(html, /data-i18n="hero\.signupNote"/);
  const source = fs.readFileSync(script, 'utf8');
  assert.match(source, /'hero\.try': '免注册创建测试 Key'/);
  assert.match(source, /'hero\.trialNote': '500 积分 · 30 天试用'/);
});

test('retired news URLs point to current bilingual news without old implementation copy', () => {
  const root = path.join(__dirname, '..');
  for (const [file, target, brand] of [
    ['2026-10-05-launch.md', 'news.html', 'Truth-Preserving Model System'],
    ['2026-10-10-benchmark-results.zh-CN.md', 'news.zh-CN.html', '守真大模型系统'],
  ]) {
    const text = fs.readFileSync(path.join(root, 'docs', 'news', file), 'utf8');
    assert.ok(text.includes(brand));
    assert.ok(text.includes('https://wendelxia.github.io/marvnor/' + target));
    assert.ok(text.includes('../../TESTS.md'));
    assert.doesNotMatch(text, /source, relation and target|来源、关系和目标|专有托管|Decision Gateway/);
  }
  const highlights = fs.readFileSync(path.join(root, 'docs', 'benchmarks', '2026-10-10', 'highlights.md'), 'utf8');
  assert.ok(highlights.includes('Truth-Preserving Model System'));
  assert.doesNotMatch(highlights, /source, relation and target/);
});
