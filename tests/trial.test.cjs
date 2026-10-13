const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPayload, parseAnswer, evaluate, createRunner, getPreset, chooseLanguage, MAX_FACTS, MAX_TEXT } = require('../docs/trial.js');

const fact = { source: 'order-001', relation: 'status', target: 'pending', polarity: 1 };
const question = { source: 'order-001', relation: 'status', target: 'pending' };
const answer = { conclusion: 'TRUE', conflict: false, reason: 'supported_evidence', path: ['order-001', 'pending'], decision: 'answer', evidence_kind: 'direct' };
const response = (result = answer) => ({ ok: true, status: 200, json: async () => ({ answers: { result } }) });

test('builds a minimal temporary request, trims text and omits an empty optional target', () => {
  const payload = buildPayload([{ ...fact, source: ' order-001 ', ignored: 'not sent' }], { ...question, target: '  ', history: 'not sent' });
  assert.deepEqual(payload, { relations: [fact], questions: [{ id: 'result', source: 'order-001', relation: 'status' }] });
});

test('supports an empty record set without inventing evidence', () => {
  assert.deepEqual(buildPayload([], question).relations, []);
});

test('rejects incomplete records and questions before making a request', () => {
  assert.throws(() => buildPayload([{ ...fact, target: ' ' }], question), error => error.code === 'required' && error.field === 'relations.0.target');
  assert.throws(() => buildPayload([fact], { ...question, source: '' }), error => error.code === 'required' && error.field === 'questions.source');
});

test('caps the public form at eight records and its documented text length', () => {
  assert.equal(MAX_FACTS, 8);
  assert.throws(() => buildPayload(Array.from({ length: 9 }, () => fact), question), { code: 'too_many' });
  assert.throws(() => buildPayload([{ ...fact, target: 'x'.repeat(MAX_TEXT + 1) }], question), { code: 'too_long' });
});

test('checks the 12 KB request cap in UTF-8 bytes, including multibyte records', () => {
  const full = { source: 'a'.repeat(MAX_TEXT), relation: 'b'.repeat(MAX_TEXT), target: 'c'.repeat(MAX_TEXT), polarity: 1 };
  assert.equal(buildPayload(Array.from({ length: 8 }, () => full), question).relations.length, 8);
  const multibyte = { ...full, source: '汉'.repeat(MAX_TEXT), relation: '字'.repeat(MAX_TEXT), target: '值'.repeat(MAX_TEXT) };
  assert.throws(() => buildPayload(Array.from({ length: 8 }, () => multibyte), question), { code: 'body_limit' });
});

test('preserves explicit negative evidence and rejects unsupported polarity', () => {
  assert.equal(buildPayload([{ ...fact, polarity: -1 }], question).relations[0].polarity, -1);
  assert.throws(() => buildPayload([{ ...fact, polarity: 0 }], question), { code: 'polarity' });
});

test('presets contain editable inputs only and each call returns fresh objects', () => {
  const conflict = getPreset('conflict');
  assert.deepEqual(conflict.relations.map(item => item.target), ['pending', 'paid']);
  assert.equal(conflict.question.target, '');
  assert.equal(getPreset('negative').relations[0].polarity, -1);
  assert.equal(getPreset('supported').question.target, 'pending');
  assert.equal(getPreset('unknown').question.target, 'shipped');
  assert.equal(conflict.answers, undefined);
  conflict.relations[0].target = 'changed';
  assert.equal(getPreset('conflict').relations[0].target, 'pending');
});

test('preserves UNKNOWN versus FALSE and all six server fields', () => {
  for (const conclusion of ['TRUE', 'FALSE', 'UNKNOWN']) {
    const actual = { ...answer, conclusion, reason: 'server_reason' };
    assert.deepEqual(parseAnswer({ answers: { result: actual } }), actual);
  }
  assert.equal(parseAnswer({ answers: { result: { ...answer, conflict: true } } }).conflict, true);
});

test('rejects malformed success responses instead of displaying an invented answer', () => {
  for (const invalid of [{}, { answers: {} }, { answers: { result: { ...answer, conclusion: 'YES' } } }, { answers: { result: { ...answer, conflict: 'false' } } }, { answers: { result: { ...answer, path: null } } }]) {
    assert.throws(() => parseAnswer(invalid), { code: 'response' });
  }
});

test('sends only the current request to the live endpoint without credentials', async () => {
  const payload = buildPayload([fact], question);
  let request;
  const actual = await evaluate(payload, { fetchImpl: async (url, options) => { request = { url, options }; return response(); } });
  assert.equal(request.url, 'https://api.marvnor.com/v1/trial/evaluate');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.credentials, 'omit');
  assert.equal(request.options.referrerPolicy, 'no-referrer');
  assert.deepEqual(request.options.headers, { 'Content-Type': 'application/json' });
  assert.deepEqual(JSON.parse(request.options.body), payload);
  assert.deepEqual(actual, answer);
});

test('maps rate limits, invalid requests and server errors to actionable states', async () => {
  for (const [status, code] of [[429, 'rate_limit'], [400, 'validation'], [413, 'validation'], [422, 'validation'], [500, 'server'], [503, 'server'], [404, 'unavailable']]) {
    await assert.rejects(evaluate(buildPayload([fact], question), { fetchImpl: async () => ({ ok: false, status }) }), { code });
  }
});

test('network, malformed JSON and timeouts never fall back to recorded answers', async () => {
  const payload = buildPayload([fact], question);
  await assert.rejects(evaluate(payload, { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } }), { code: 'network' });
  await assert.rejects(evaluate(payload, { fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError(); } }) }), { code: 'response' });
  await assert.rejects(evaluate(payload, { timeoutMs: 5, fetchImpl: (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))) }), { code: 'timeout' });
});

test('editing clears a completed result and a late response cannot restore it', async () => {
  let resolve;
  const runner = createRunner({ fetchImpl: () => new Promise(done => { resolve = done; }) });
  const pending = runner.run(buildPayload([fact], question));
  assert.equal(runner.state.status, 'loading');
  runner.invalidate();
  assert.equal(runner.state.status, 'edited');
  resolve(response());
  await pending;
  assert.equal(runner.state.status, 'edited');
  assert.equal(runner.state.answer, null);
  const successful = createRunner({ fetchImpl: async () => response() });
  await successful.run(buildPayload([fact], question));
  assert.equal(successful.state.status, 'success');
  successful.invalidate();
  assert.equal(successful.state.answer, null);
});

test('a newer evaluation wins if an older request finishes later', async () => {
  const pendingResponses = [];
  const runner = createRunner({ fetchImpl: () => new Promise(resolve => pendingResponses.push(resolve)) });
  const oldRequest = runner.run(buildPayload([fact], question));
  const newRequest = runner.run(buildPayload([], question));
  pendingResponses[1](response({ ...answer, conclusion: 'UNKNOWN' }));
  await newRequest;
  pendingResponses[0](response());
  await oldRequest;
  assert.equal(runner.state.answer.conclusion, 'UNKNOWN');
});

test('language preference accepts only supported URL values and falls back to saved language', () => {
  assert.equal(chooseLanguage('?lang=zh-CN', 'en'), 'zh-CN');
  assert.equal(chooseLanguage('?lang=en', 'zh-CN'), 'en');
  assert.equal(chooseLanguage('?lang=invalid', 'zh-CN'), 'zh-CN');
  assert.equal(chooseLanguage('', null), 'en');
});
