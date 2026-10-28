(() => {
  'use strict';

  const storageKey = 'marvnor.site.language';
  const translated = {
    'meta.description': '为 AI Agent 提供项目记忆：保存已确认的信息，按当前问题找回并核验记录，指出冲突，支持纠错与删除。',
    'meta.ogTitle': 'Marvnor：告别多窗口拼凑，一个对话无缝做完整个项目。',
    'meta.ogDescription': '为 AI Agent 提供项目记忆：保存已确认的信息，按当前问题找回并核验记录，指出冲突，支持纠错与删除。',
    'brand.label': 'Marvnor 首页',
    'nav.label': '主导航',
    'locale.label': '语言',
    'chart.label': '最后一个问题的模型输入：完整历史 5,328 个 token；相关结果 95 个 token，减少 98.2%。',
    'skip': '跳转到正文',
    'nav.api': 'API 文档',
    'nav.signIn': '登录',
    'hero.eyebrow': 'AI AGENT 的项目记忆',
    'hero.title1': '告别多窗口拼凑，',
    'hero.title2': '一个对话无缝做完整个项目。',
    'hero.lead': 'Marvnor 为你的 AI 提供可持续使用的项目记忆。通过 MCP 或 API，让 Agent 保存已确认的需求、决定和变更，用时找回与当前问题相关的记录，并核对依据、指出冲突。信息变了可以更新，记错了可以纠正或删除。',
    'hero.lead2': '你少重复交代，AI 少混淆新旧信息。按需取回记录，减少长历史的重复输入，让项目接着往下做。',
    'hero.try': '免注册创建测试 Key',
    'hero.results': '查看实际 API 结果',
    'hero.trialNote': '500 积分 · 30 天试用',
    'hero.signupNote': '之后注册，另领 1,000 积分 ↗',
    'signup.link': '开始接入 ↗',
    'signup.summary': '测试 Key → 使用自己的资料 → 到期前在同一浏览器注册并确认接续。',
    'feedback.title': '用户反馈',
    'feedback.before': '匿名用户原始截图：接入之前。点击放大。',
    'feedback.after': '匿名用户原始反馈截图：接入之后。点击放大。',
    'demo.eyebrow': '一个订单，五个步骤',
    'demo.title1': '从记录冲突',
    'demo.title2': '到可核查的结果。',
    'demo.recording': '公开 API 运行记录',
    'demo.date': '2026 年 10 月 10 日 12:09 UTC',
    'demo.description': '一个订单只有一个付款状态。如果保存的记录同时写着“pending”和“paid”，会怎样？',
    'step1.title': '保存一条记录',
    'step1.action': '保存',
    'step1.result': '记录支持 pending。',
    'step2.title': '加入冲突记录',
    'step2.action': '再保存',
    'step2.result': '两种状态均为 UNKNOWN，存在冲突。请核对原始依据。',
    'step2.response': '查看实际响应',
    'step3.title': '处理冲突',
    'step3.action': '在这个示例中，删除错误的“paid”记录。',
    'step3.result': '记录再次支持 pending，冲突消失。',
    'step4.title': '更正剩余记录',
    'step4.action': '将保存的值改为',
    'step4.result': '记录支持 paid；pending 变为 UNKNOWN。',
    'step5.title': '删除示例数据',
    'step5.action': '仅删除本示例创建的记录。',
    'step5.result': '两个值都不再有记录支持。',
    'demo.responses': '查看完整响应记录 ↗',
    'demo.run': '用 API 运行示例 ↗',
    'demo.note': '本页展示保存的结果，不会实时调用 API。运行示例按当前 API 计费规则消耗积分。',
    'savings.eyebrow': '减少历史输入，保留相关证据',
    'savings.title1': '只发送当前问题',
    'savings.title2': '需要的事实。',
    'savings.description': '在 160 轮合成历史测试的最后一个问题中，相关核查结果代替了完整历史；两种输入下的回答都正确。',
    'savings.read': '查看测试与 token 计算 ↗',
    'chart.title': '最后一个问题的模型输入',
    'chart.full': '完整历史',
    'chart.fullValue': '5,328 token',
    'chart.relevant': '相关结果',
    'chart.relevantValue': '95 token',
    'chart.less': '输入减少',
    'chart.note': '仅指最后一次请求的输入量，不代表总费用节省。',
    'start.eyebrow': '试试你的使用场景',
    'start.title1': '一个文件，一把 API 密钥。',
    'start.title2': '结果可逐步核查。',
    'start.description': '在产品首页创建测试 Key，再下载并运行示例，在隐藏输入框粘贴 Key。脚本会检查每一步，并定向删除它创建的测试记录。',
    'start.billing': '运行示例会消耗积分，不会从外部支付账户自动扣款。',
    'start.example': '获取示例 ↗',
    'start.python': 'Python 3.9+ · 仅使用标准库',
    'start.try': '创建测试 Key ↗',
    'contact.title': '正在开发 AI 代理或项目记忆工具？',
    'contact.description': '带来一个具体场景，使用非敏感样本数据一起测试。',
    'footer.tagline': 'Marvnor · 记录型记忆与冲突管理',
    'footer.llm': '如何配合大模型',
    'footer.tests': '测试与方法',
  };

  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  const attributeNodes = [...document.querySelectorAll('[data-i18n-attr]')];
  const buttons = [...document.querySelectorAll('[data-lang]')];
  const portalLinks = [...document.querySelectorAll('[data-portal-link]')];
  const homeLink = document.querySelectorAll('[data-home-link]')[0];
  const switcher = document.querySelectorAll('[data-locale-switch]')[0];
  const originalTitle = document.title;
  const originalText = new Map(textNodes.map(node => [node, node.textContent]));
  const originalAttributes = new Map(attributeNodes.map(node => [node, node.getAttribute(node.dataset.i18nAttribute)]));

  function storedLanguage() {
    try { return window.localStorage.getItem(storageKey); } catch { return null; }
  }

  function saveLanguage(language) {
    try { window.localStorage.setItem(storageKey, language); } catch { /* URL and current page remain usable. */ }
  }

  function selectedLanguage() {
    const fromUrl = new URL(window.location.href).searchParams.get('lang');
    if (fromUrl === 'en' || fromUrl === 'zh-CN') return fromUrl;
    return storedLanguage() === 'zh-CN' ? 'zh-CN' : 'en';
  }

  function applyLanguage(language) {
    const chinese = language === 'zh-CN';
    document.documentElement.lang = chinese ? 'zh-CN' : 'en';
    document.title = chinese ? 'Marvnor | AI Agent 的项目记忆' : originalTitle;
    for (const node of textNodes) {
      node.textContent = chinese ? translated[node.dataset.i18n] : originalText.get(node);
    }
    for (const node of attributeNodes) {
      node.setAttribute(node.dataset.i18nAttribute, chinese ? translated[node.dataset.i18nAttr] : originalAttributes.get(node));
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    for (const link of portalLinks) {
      const destination = new URL(link.href);
      destination.searchParams.set('lang', language);
      link.href = destination.href;
    }
    const home = new URL(homeLink.href);
    home.searchParams.set('lang', language);
    homeLink.href = home.href;
    saveLanguage(language);
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const language = button.dataset.lang;
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      window.history.pushState(null, '', url);
      applyLanguage(language);
    });
  }
  window.addEventListener('popstate', () => applyLanguage(selectedLanguage()));
  const initialLanguage = selectedLanguage();
  const initialUrl = new URL(window.location.href);
  if (!['en', 'zh-CN'].includes(initialUrl.searchParams.get('lang'))) {
    initialUrl.searchParams.set('lang', initialLanguage);
    window.history.replaceState(null, '', initialUrl);
  }
  applyLanguage(initialLanguage);
  switcher.hidden = false;
})();
