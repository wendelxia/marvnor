(function () {
  'use strict';

  const ENDPOINT = 'https://api.marvnor.com/v1/trial/evaluate';
  const MAX_FACTS = 8;
  const MAX_TEXT = 200;
  const LANGUAGE_KEY = 'marvnor.site.language';
  const FIELDS = ['conclusion', 'conflict', 'reason', 'path', 'decision', 'evidence_kind'];

  function fail(code, field) {
    const error = new Error(code);
    error.code = code;
    if (field) error.field = field;
    return error;
  }

  function cleanText(value, field, optional = false) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text && !optional) throw fail('required', field);
    if (text.length > MAX_TEXT) throw fail('too_long', field);
    return text;
  }

  function buildPayload(relations, question) {
    if (!Array.isArray(relations) || relations.length > MAX_FACTS) throw fail('too_many');
    const facts = relations.map((fact, index) => {
      const result = {};
      for (const field of ['source', 'relation', 'target']) result[field] = cleanText(fact[field], `relations.${index}.${field}`);
      if (![1, -1].includes(fact.polarity)) throw fail('polarity', `relations.${index}.polarity`);
      result.polarity = fact.polarity;
      return result;
    });
    const claim = { id: 'result', source: cleanText(question.source, 'questions.source'), relation: cleanText(question.relation, 'questions.relation') };
    const target = cleanText(question.target, 'questions.target', true);
    if (target) claim.target = target;
    const payload = { relations: facts, questions: [claim] };
    if (new TextEncoder().encode(JSON.stringify(payload)).length > 12288) throw fail('body_limit');
    return payload;
  }

  function getPreset(name) {
    const fact = { source: 'order-001', relation: 'status', target: 'pending', polarity: 1 };
    const question = { source: 'order-001', relation: 'status', target: 'pending' };
    const relations = [fact];
    if (name === 'conflict') { relations.push({ ...fact, target: 'paid' }); question.target = ''; }
    if (name === 'unknown') question.target = 'shipped';
    if (name === 'negative') fact.polarity = -1;
    return { relations, question };
  }

  function parseAnswer(data) {
    const answer = data && data.answers && data.answers.result;
    if (!answer || !['TRUE', 'FALSE', 'UNKNOWN'].includes(answer.conclusion) || typeof answer.conflict !== 'boolean' || !Array.isArray(answer.path) || ['reason', 'decision', 'evidence_kind'].some(field => typeof answer[field] !== 'string')) throw fail('response');
    return Object.fromEntries(FIELDS.map(field => [field, answer[field]]));
  }

  async function evaluate(payload, { fetchImpl = globalThis.fetch, signal, timeoutMs = 25000 } = {}) {
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort();
    if (signal) {
      if (signal.aborted) throw fail('cancelled');
      signal.addEventListener('abort', cancel, { once: true });
    }
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      const response = await fetchImpl(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
        referrerPolicy: 'no-referrer', cache: 'no-store', body: JSON.stringify(payload), signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 429) throw fail('rate_limit');
        if ([400, 413, 422].includes(response.status)) throw fail('validation');
        if (response.status >= 500) throw fail('server');
        throw fail('unavailable');
      }
      let data;
      try { data = await response.json(); } catch { throw fail('response'); }
      return parseAnswer(data);
    } catch (error) {
      if (timedOut) throw fail('timeout');
      if (signal && signal.aborted) throw fail('cancelled');
      if (error.code) throw error;
      throw fail('network');
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', cancel);
    }
  }

  function createRunner({ fetchImpl, timeoutMs, onChange = () => {} } = {}) {
    let generation = 0;
    let controller = null;
    let state = { status: 'idle', answer: null, error: null, payload: null };
    function update(next) { state = next; onChange(state); }
    function cancel() { generation += 1; if (controller) controller.abort(); }
    return {
      get state() { return state; },
      invalidate() { cancel(); update({ status: 'edited', answer: null, error: null, payload: null }); },
      async run(payload) {
        cancel();
        const current = generation;
        controller = new AbortController();
        update({ status: 'loading', answer: null, error: null, payload });
        try {
          const answer = await evaluate(payload, { fetchImpl, timeoutMs, signal: controller.signal });
          if (current === generation) update({ status: 'success', answer, error: null, payload });
        } catch (error) {
          if (current === generation) update({ status: 'error', answer: null, error, payload });
        }
      },
    };
  }

  function chooseLanguage(search, saved) {
    const value = new URLSearchParams(search).get('lang');
    return ['en', 'zh-CN'].includes(value) ? value : saved === 'zh-CN' ? 'zh-CN' : 'en';
  }

  const copy = {
    skip: ['Skip to content', '跳转到正文'], home: ['Home', '首页'], apiDocs: ['API docs', 'API 文档'],
    eyebrow: ['LIVE API TRIAL', '实时 API 试用'], headline: ['Change the records. Check the answer.', '改一条记录，核查一次结果。'],
    lead: ['An order says both “pending” and “paid”. Ask Marvnor to check it, then edit a record and try again.', '同一订单，同时有“pending”和“paid”两条记录。让 Marvnor 检查冲突，再改一条记录试试。'],
    privacy: ['No sign-in or API key. Temporary records are not saved. Use non-sensitive sample data only.', '无需登录或 API 密钥。临时记录不会保存。请仅使用非敏感样本数据。'],
    examples: ['Try an example', '选择一个示例'], presetConflict: ['Conflicting records', '记录冲突'], presetSupported: ['Supported', '有证据支持'], presetUnknown: ['Missing evidence', '缺少证据'], presetNegative: ['Explicit negative', '明确否定'],
    step1: ['01 / RECORDS', '01 / 记录'], recordsTitle: ['Your temporary records', '本次使用的临时记录'], recordsHelp: ['Each row makes one claim. “Negative” explicitly denies that claim.', '每行是一条陈述。“否定”表示明确否认这条陈述。'], recordsCaption: ['Editable temporary records, up to eight', '可编辑的临时记录，最多八条'],
    source: ['Source', '主体'], relation: ['Relation', '关系'], target: ['Target', '目标值'], polarity: ['Polarity', '正负性'], positive: ['Positive', '肯定'], negative: ['Negative', '否定'], remove: ['Remove', '删除'],
    emptyRecords: ['No records supplied. Add a record, or see what the API returns without evidence.', '目前没有记录。可以添加一条，也可以检查 API 在没有证据时的结果。'], addRecord: ['+ Add record', '+ 添加记录'], temporary: ['Edits apply to this request only.', '编辑仅用于本次请求。'],
    step2: ['02 / QUESTION', '02 / 问题'], questionTitle: ['What should Marvnor check?', '想让 Marvnor 核查什么？'], optional: ['(optional)', '（选填）'], targetHelp: ['Leave target empty to list known values. Fill it in to check one claim.', '目标值留空时查询已知值；填写后核查这条具体陈述。'],
    run: ['Check with Marvnor →', '让 Marvnor 核查 →'], running: ['Checking…', '正在核查…'], reset: ['Reset example', '重置示例'], liveLabel: ['Real API · no stored answers', '真实 API · 无预存答案'],
    step3: ['03 / RESULT', '03 / 结果'], answerTitle: ['The evidence, made explicit.', '查看证据与判定。'],
    emptyAnswer: ['Run a check to see the API’s answer here.', '点击核查，这里将显示 API 实时返回的结果。'], editedAnswer: ['Records or question changed. Run another check for a fresh answer.', '记录或问题已修改。请重新核查以获取新结果。'], loadingAnswer: ['Sending this question and these temporary records to Marvnor…', '正在将当前问题和这些临时记录发送给 Marvnor…'],
    idle: ['Ready to check', '等待核查'], edited: ['Edited · check again', '已修改 · 请重新核查'], loading: ['Calling live API…', '正在调用实时 API…'], success: ['Live response received', '已收到实时响应'], error: ['Check did not complete', '本次核查未完成'],
    supported: ['The supplied records support this claim.', '所提交的记录支持这条陈述。'], refuted: ['The supplied records refute this claim. This is not simply missing evidence.', '所提交的记录否定这条陈述。这与单纯缺少证据不同。'], unknown: ['The supplied records do not settle this question. UNKNOWN does not mean FALSE.', '所提交的记录无法确定这个问题。UNKNOWN 不等于 FALSE。'], conflict: ['The records conflict. Confirm the correct value against your original evidence before using it.', '记录存在冲突。请核对原始依据并确认正确值，再使用该结果。'], known: ['The API returned known values from the supplied records.', 'API 返回了所提交记录中的已知值。'],
    candidates: ['Values returned by the API', 'API 返回的候选值'], candidateHelp: ['These values conflict. Check the source evidence and confirm which is correct.', '这些值存在冲突。请核对原始证据并确认正确值。'], candidateKnown: ['Values from this request’s evidence only.', '仅来自本次请求中的证据。'], conflictTarget: [' Leave target empty and run again to inspect known values.', ' 将目标值留空后重新核查，可查看已知候选值。'],
    resultNote: ['TRUE means these records support the claim. It does not verify the outside world. UNKNOWN is not FALSE.', 'TRUE 表示这些记录支持陈述，并不代表已核实外部世界。UNKNOWN 不等于 FALSE。'],
    requestPreview: ['Inspect the request', '查看请求内容'], copyRequest: ['Copy JSON', '复制 JSON'], copied: ['Request JSON copied.', '请求 JSON 已复制。'], copyFailed: ['Copy is unavailable here. Select the JSON text to copy it.', '此处无法自动复制，请选中 JSON 文本后复制。'], previewInvalid: ['Complete each record and the required question fields to preview a valid request.', '补全每条记录及问题的必填项后，可查看有效请求。'],
    limits: ['Anonymous trial limits apply. For larger datasets and saved records, use the account API.', '匿名试用有调用限制。更多记录和持久化存储请使用账户 API。'], footer: ['Marvnor · Record-based memory and conflict management', 'Marvnor · 记录型记忆与冲突管理'], llm: ['How it fits your LLM', '如何配合大模型'],
    required: ['Complete the highlighted field. Every record needs a source, relation and target; the question needs a source and relation.', '请补全标出的字段。每条记录需要主体、关系和目标值；问题需要主体和关系。'], too_many: ['Use up to 8 records per request.', '每次请求最多使用 8 条记录。'], too_long: ['Use no more than 200 characters in each field.', '每个字段最多使用 200 个字符。'], body_limit: ['This request is too large. Shorten the fields or remove a few records (12 KB maximum).', '请求过大，请缩短字段或减少记录（最多 12 KB）。'], polarityError: ['Choose positive or negative for every record.', '请为每条记录选择肯定或否定。'],
    rate_limit: ['The free trial is busy or its request limit has been reached. Wait a little, then check again.', '免费试用正忙或已达到调用限制。请稍后再试。'], validation: ['The API could not accept this request. Check the fields and reduce the record count or text length, then try again.', 'API 无法接受此请求。请检查字段，减少记录或缩短文本后重试。'], server: ['The trial service is temporarily unavailable. Your inputs are still here; try again shortly.', '试用服务暂时不可用。输入内容仍在，请稍后重试。'], unavailable: ['The live trial endpoint is unavailable. Your inputs are still here; try again later.', '实时试用接口暂时不可用。输入内容仍在，请稍后重试。'], timeout: ['The API took too long to respond. Your inputs are still here; try again.', 'API 响应超时。输入内容仍在，请重试。'], network: ['Could not reach the API. Check your connection, then try again.', '无法连接 API。请检查网络后重试。'], response: ['The API returned an unexpected response. No answer was displayed; please try again.', 'API 返回了无法识别的响应。未展示判定结果，请重试。'],
  };

  function mount(document, window) {
    const byId = id => document.getElementById(id);
    let language = 'en';
    let activePreset = 'conflict';
    let resetPreset = 'conflict';
    let validationError = null;
    const t = key => copy[key] ? copy[key][language === 'zh-CN' ? 1 : 0] : key;
    const rows = byId('fact-rows');
    const form = byId('trial-form');
    const runner = createRunner({ fetchImpl: window.fetch.bind(window), onChange: renderState });

    function readDraft() {
      return {
        relations: [...rows.children].map(row => Object.fromEntries([...row.querySelectorAll('[data-field]')].map(input => [input.dataset.field, input.dataset.field === 'polarity' ? Number(input.value) : input.value]))),
        question: Object.fromEntries(['source', 'relation', 'target'].map(field => [field, byId(`question-${field}`).value])),
      };
    }

    function payload() { const draft = readDraft(); return buildPayload(draft.relations, draft.question); }

    function updatePreview() {
      try {
        byId('request-preview').textContent = JSON.stringify(payload(), null, 2);
        byId('copy-request').disabled = false;
      } catch {
        byId('request-preview').textContent = t('previewInvalid');
        byId('copy-request').disabled = true;
      }
      byId('copy-status').textContent = '';
    }

    function labelRows() {
      [...rows.children].forEach((row, index) => {
        for (const label of row.querySelectorAll('[data-field-label]')) label.textContent = t(label.dataset.fieldLabel);
        for (const input of row.querySelectorAll('[data-field]')) input.setAttribute('aria-label', `${language === 'zh-CN' ? '记录' : 'Record'} ${index + 1} · ${t(input.dataset.field)}`);
        const select = row.querySelector('select');
        select.options[0].textContent = t('positive');
        select.options[1].textContent = t('negative');
        row.querySelector('[data-remove]').setAttribute('aria-label', `${t('remove')} ${language === 'zh-CN' ? '记录' : 'record'} ${index + 1}`);
      });
      byId('record-count').textContent = `${rows.children.length} / ${MAX_FACTS}`;
      byId('add-record').disabled = rows.children.length >= MAX_FACTS;
      byId('empty-records').hidden = rows.children.length !== 0;
    }

    function renderRows(relations) {
      rows.replaceChildren();
      relations.forEach(fact => {
        const row = byId('fact-row-template').content.firstElementChild.cloneNode(true);
        for (const input of row.querySelectorAll('[data-field]')) {
          input.value = String(fact[input.dataset.field]);
          if (input.tagName === 'INPUT') input.maxLength = MAX_TEXT;
        }
        row.querySelector('[data-remove]').addEventListener('click', () => {
          const index = [...rows.children].indexOf(row);
          row.remove();
          changed();
          labelRows();
          const next = rows.children[Math.min(index, rows.children.length - 1)];
          (next ? next.querySelector('[data-remove]') : byId('add-record')).focus();
        });
        rows.append(row);
      });
      labelRows();
    }

    function renderPresetButtons() {
      for (const button of document.querySelectorAll('[data-preset]')) button.setAttribute('aria-pressed', String(button.dataset.preset === activePreset));
    }

    function clearValidation() {
      validationError = null;
      form.querySelectorAll('[aria-invalid]').forEach(input => {
        input.removeAttribute('aria-invalid');
        if (input.id === 'question-target') input.setAttribute('aria-describedby', 'target-help');
        else input.removeAttribute('aria-describedby');
      });
    }

    function loadPreset(name, initial = false) {
      const preset = getPreset(name);
      renderRows(preset.relations);
      for (const field of ['source', 'relation', 'target']) byId(`question-${field}`).value = preset.question[field];
      clearValidation();
      if (!initial) runner.invalidate();
      activePreset = name;
      resetPreset = name;
      renderPresetButtons();
      updatePreview();
    }

    function changed() {
      clearValidation();
      activePreset = null;
      renderPresetButtons();
      runner.invalidate();
      updatePreview();
    }

    function renderAnswer(state) {
      const answer = state.answer;
      if (!answer) return;
      for (const field of FIELDS) byId(`output-${field}`).textContent = typeof answer[field] === 'string' ? answer[field] : JSON.stringify(answer[field], null, field === 'path' ? 2 : 0);
      const conflict = answer.conflict;
      byId('answer-badge').textContent = conflict ? 'CONFLICT' : answer.conclusion;
      byId('answer-summary').dataset.tone = conflict ? 'conflict' : answer.conclusion === 'FALSE' ? 'negative' : 'neutral';
      let explanation = t(conflict ? 'conflict' : answer.conclusion === 'FALSE' ? 'refuted' : answer.conclusion === 'TRUE' ? 'supported' : 'unknown');
      const targetMissing = !state.payload.questions[0].target;
      if (!conflict && targetMissing && answer.reason === 'known_values') explanation = t('known');
      if (conflict && !targetMissing && answer.reason !== 'conflicting_values') explanation += t('conflictTarget');
      byId('answer-explanation').textContent = explanation;
      const showValues = answer.path.length > 0 && (targetMissing || answer.reason === 'conflicting_values');
      byId('candidate-section').hidden = !showValues;
      byId('candidate-list').replaceChildren();
      if (showValues) for (const value of answer.path) {
        const item = document.createElement('li');
        item.textContent = typeof value === 'string' ? value : JSON.stringify(value);
        byId('candidate-list').append(item);
      }
      byId('candidate-help').textContent = t(conflict ? 'candidateHelp' : 'candidateKnown');
    }

    function renderState() {
      const state = runner.state;
      const loading = state.status === 'loading';
      const error = validationError || state.error;
      byId('run-trial').disabled = loading;
      byId('run-trial').textContent = t(loading ? 'running' : 'run');
      byId('answer-section').setAttribute('aria-busy', String(loading));
      byId('request-status').textContent = t(error ? 'error' : state.status);
      byId('request-status').dataset.status = error ? 'error' : state.status;
      byId('answer-content').hidden = !state.answer || !!error;
      byId('answer-empty').hidden = !!state.answer || !!error;
      byId('empty-message').textContent = t(loading ? 'loadingAnswer' : state.status === 'edited' ? 'editedAnswer' : 'emptyAnswer');
      byId('trial-error').hidden = !error;
      byId('trial-error').textContent = error ? t(error.code === 'polarity' ? 'polarityError' : error.code) : '';
      renderAnswer(state);
    }

    function savedLanguage() { try { return window.localStorage.getItem(LANGUAGE_KEY); } catch { return null; } }

    function applyLanguage(next) {
      language = next;
      document.documentElement.lang = language;
      document.title = language === 'zh-CN' ? 'Marvnor | 实时核查记录' : 'Marvnor | Try a live record check';
      document.querySelector('meta[name="description"]').content = t('lead');
      for (const node of document.querySelectorAll('[data-t]')) node.textContent = t(node.dataset.t);
      for (const button of document.querySelectorAll('[data-lang]')) button.setAttribute('aria-pressed', String(button.dataset.lang === language));
      for (const link of document.querySelectorAll('[data-home-link]')) {
        const destination = new URL(link.href);
        destination.searchParams.set('lang', language);
        link.href = destination.href;
        if (link.classList.contains('brand')) link.setAttribute('aria-label', language === 'zh-CN' ? 'Marvnor 首页' : 'Marvnor home');
      }
      byId('main-nav').setAttribute('aria-label', language === 'zh-CN' ? '主导航' : 'Main navigation');
      byId('presets').setAttribute('aria-label', language === 'zh-CN' ? '示例场景' : 'Sample scenarios');
      byId('language-switch').setAttribute('aria-label', language === 'zh-CN' ? '语言' : 'Language');
      try { window.localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Language still works through the URL. */ }
      labelRows();
      updatePreview();
      renderState();
    }

    for (const field of ['source', 'relation', 'target']) byId(`question-${field}`).maxLength = MAX_TEXT;
    for (const button of document.querySelectorAll('[data-preset]')) button.addEventListener('click', () => loadPreset(button.dataset.preset));
    form.addEventListener('input', changed);
    form.addEventListener('change', changed);
    byId('add-record').addEventListener('click', () => {
      const draft = readDraft();
      if (draft.relations.length >= MAX_FACTS) return;
      draft.relations.push({ source: '', relation: '', target: '', polarity: 1 });
      renderRows(draft.relations);
      changed();
      rows.lastElementChild.querySelector('input').focus();
    });
    byId('reset-trial').addEventListener('click', () => loadPreset(resetPreset));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      clearValidation();
      let request;
      try { request = payload(); } catch (error) {
        validationError = error;
        renderState();
        if (error.field) {
          const parts = error.field.split('.');
          const input = parts[0] === 'questions' ? byId(`question-${parts[1]}`) : rows.children[Number(parts[1])].querySelector(`[data-field="${parts[2]}"]`);
          input.setAttribute('aria-invalid', 'true');
          input.setAttribute('aria-describedby', 'trial-error');
          input.focus();
        }
        return;
      }
      await runner.run(request);
    });
    byId('copy-request').addEventListener('click', async () => {
      try { await window.navigator.clipboard.writeText(JSON.stringify(payload(), null, 2)); byId('copy-status').textContent = t('copied'); }
      catch { byId('copy-status').textContent = t('copyFailed'); }
    });
    for (const button of document.querySelectorAll('[data-lang]')) button.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', button.dataset.lang);
      window.history.pushState(null, '', url);
      applyLanguage(button.dataset.lang);
    });
    window.addEventListener('popstate', () => applyLanguage(chooseLanguage(window.location.search, savedLanguage())));
    loadPreset('conflict', true);
    const initial = chooseLanguage(window.location.search, savedLanguage());
    const url = new URL(window.location.href);
    if (!['en', 'zh-CN'].includes(url.searchParams.get('lang'))) {
      url.searchParams.set('lang', initial);
      window.history.replaceState(null, '', url);
    }
    applyLanguage(initial);
    byId('language-switch').hidden = false;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { buildPayload, parseAnswer, evaluate, createRunner, getPreset, chooseLanguage, MAX_FACTS, MAX_TEXT };
  else mount(document, window);
})();
