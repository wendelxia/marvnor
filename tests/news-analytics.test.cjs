const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {randomUUID} = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname, '../docs/news-analytics.js'), 'utf8');

function browser(options = {}) {
  const events = {}, sent = [], storage = options.storage || new Map();
  const button = {hidden: true, disabled: false, textContent: '', setAttribute() {}, addEventListener(type, fn) {this[type] = fn;}};
  let clock = Date.now();
  class Clock extends Date { static now() { return clock; } }
  const document = {
    documentElement: {lang: options.language || 'zh-CN'},
    visibilityState: options.hidden ? 'hidden' : 'visible',
    currentScript: {dataset: {article: '20261101-results'}},
    querySelector() {return button;},
    addEventListener(type, fn) {events[type] = fn;}
  };
  const context = {document, navigator: options.navigator || {}, crypto: {randomUUID}, Date: Clock,
    URL, URLSearchParams,
    location: {origin: 'https://wendelxia.github.io', pathname: '/marvnor/news.zh-CN.html', search: options.search || ''},
    localStorage: {
      getItem(key) {if (options.noStorage) throw Error('blocked'); return storage.get(key) ?? null;},
      setItem(key, value) {if (options.noStorage) throw Error('blocked'); storage.set(key, value);},
      removeItem(key) {storage.delete(key);}
    },
    fetch(url, init) {sent.push({url, ...init, payload: JSON.parse(init.body)}); return options.fail ? Promise.reject(Error('offline')) : Promise.resolve();},
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return {context, sent, storage, button, document,
    advance() {clock += 86400000;},
    rerun() {vm.runInContext(source, context);},
    visible() {document.visibilityState = 'visible'; events.visibilitychange?.();},
    click(href = 'https://api.marvnor.com/docs?lang=zh-CN') {events.click?.({target: {closest() {return {href};}}});}
  };
}

test('one anonymous view with no credentials or referrer', () => {
  const b = browser();
  assert.equal(b.sent.length, 1);
  assert.equal(b.sent[0].credentials, 'omit');
  assert.equal(b.sent[0].referrerPolicy, 'no-referrer');
  assert.equal(b.sent[0].mode, 'no-cors');
  assert.equal(b.sent[0].keepalive, true);
  assert.deepEqual(Object.keys(b.sent[0].payload).sort(), ['article','event','event_id','language','test','visitor']);
  assert.equal(b.sent[0].payload.test, false);
  b.rerun(); b.visible();
  assert.equal(b.sent.length, 1);
});
test('refresh shares same daily visitor but has a new view id', () => {
  const a = browser(), b = browser({storage: a.storage});
  assert.equal(a.sent[0].payload.visitor, b.sent[0].payload.visitor);
  assert.notEqual(a.sent[0].payload.event_id, b.sent[0].payload.event_id);
});
test('hidden pages wait for visibility', () => {
  const b = browser({hidden: true}); assert.equal(b.sent.length, 0);
  b.visible(); b.visible(); assert.equal(b.sent.length, 1);
});
test('only relevant CTA is counted, once per page', () => {
  const b = browser(); b.click('https://github.com/wendelxia/marvnor');
  b.click(); b.click();
  assert.equal(b.sent.length, 2);
  assert.equal(b.sent[1].payload.event, 'get_started');
  assert.equal(b.sent[0].payload.event_id, b.sent[1].payload.event_id);
});
test('daily identifier rotates and old value is replaced', () => {
  const b = browser(), first = b.sent[0].payload.visitor;
  b.advance(); b.click();
  assert.notEqual(b.sent[1].payload.visitor, first);
  assert.equal(b.storage.size, 1);
});
test('DNT, GPC, automation and explicit off emit nothing', () => {
  for (const options of [{navigator: {doNotTrack: '1'}}, {navigator: {globalPrivacyControl: true}},
    {navigator: {webdriver: true}}, {search: '?analytics=off'}]) {
    const b = browser(options); b.visible(); b.click(); assert.equal(b.sent.length, 0);
  }
});
test('test mode is identified and separate from real visitors', () => {
  const a = browser(), b = browser({storage: a.storage, search: '?analytics=test', navigator: {webdriver:true}});
  assert.equal(b.sent[0].payload.test, true);
  assert.notEqual(a.sent[0].payload.visitor, b.sent[0].payload.visitor);
});
test('blocked storage quietly disables analytics', () => {
  const b = browser({noStorage: true}); b.click(); assert.equal(b.sent.length, 0);
});
test('failed collector never interrupts reading or links', async () => {
  const b = browser({fail: true}); b.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(b.sent.length, 2);
});
test('opt out stops future sends and persists across visits', () => {
  const b = browser(); b.button.click(); b.click();
  assert.equal(b.sent.length, 1);
  const second = browser({storage: b.storage});
  assert.equal(second.sent.length, 0);
});
test('both languages load the same small deferred script and privacy control', () => {
  for (const file of ['news.html', 'news.zh-CN.html']) {
    const html = fs.readFileSync(require('node:path').join(__dirname, '../docs', file), 'utf8');
    assert.match(html, /<script src="news-analytics.js" data-article="20261101-results" defer><\/script>/);
    assert.match(html, /id="news-analytics-toggle"/);
  }
  assert.ok(Buffer.byteLength(source) < 5000);
});
