/* ==========================================================================
   AI Agent Operations Hub — Claude Code Command Center
   ========================================================================== */

(() => {
  'use strict';

  // --------------------------------------------------------
  // STATE
  // --------------------------------------------------------
  const state = {
    speed: 1,
    paused: false,
    revenue: 4908.72,
    orders: 1388,
    flows: 24,
    agentsActive: 12,
    agentsTotal: 20,
    health: 98.7,
    day: 6,
    cpu: 63, memory: 71, network: 54, storage: 68
  };

  const AGENTS = {
    research:  { name: 'Research Agent', role: 'Scanning sources',     status: 'ACTIVE',  queue: 4,  task: 'Indexing 142 new docs from arxiv & github', color: 'cyan' },
    plan:      { name: 'Plan Agent',     role: 'Architecting solution',status: 'ACTIVE',  queue: 2,  task: 'Drafting architecture for billing module',  color: 'purple' },
    code:      { name: 'Code Agent',     role: 'Writing clean code',   status: 'ACTIVE',  queue: 7,  task: 'Implementing /api/v2/users endpoint',       color: 'gold' },
    test:      { name: 'Test Agent',     role: 'Running tests',        status: 'ACTIVE',  queue: 3,  task: 'Executing jest suite — 142/180 passed',     color: 'purple' },
    qa:        { name: 'QA Agent',       role: 'Validating quality',   status: 'ACTIVE',  queue: 5,  task: 'Reviewing PR #2148 — 8/12 checks passed',   color: 'cyan' },
    deploy:    { name: 'Deploy Agent',   role: 'Deploying to prod',    status: 'ACTIVE',  queue: 1,  task: 'Rolling out api/v2 release to canary',      color: 'gold' },
    voice:     { name: 'Voice Agent',    role: 'Listening & responding', status: 'ACTIVE', queue: 0, task: 'Handling 42 inbound calls today',           color: 'cyan' },
    chatbot:   { name: 'Chatbot Agent',  role: 'Conversational AI',    status: 'ACTIVE',  queue: 11, task: '3 active conversations · avg latency 1.1s', color: 'purple' },
    analytics: { name: 'Analytics Agent',role: 'Insights & reporting', status: 'ACTIVE',  queue: 2,  task: 'Generating weekly performance report',      color: 'cyan' }
  };

  const FEED_TEMPLATES = [
    { agent: 'Code Agent',     color: 'gold',   text: 'Pushed {n} commits to feature/{branch}' },
    { agent: 'QA Agent',       color: 'purple', text: 'Completed test suite — {n} passed' },
    { agent: 'Deploy Agent',   color: 'gold',   text: 'Deployed v{n}.{m} to staging' },
    { agent: 'Voice Agent',    color: 'cyan',   text: 'Handled {n} calls in last hour' },
    { agent: 'Research Agent', color: 'green',  text: 'Found {n} new docs · arxiv:{x}' },
    { agent: 'Plan Agent',     color: 'purple', text: 'Drafted architecture for {feat}' },
    { agent: 'Test Agent',     color: 'purple', text: 'Caught regression in /api/v2/{ep}' },
    { agent: 'Chatbot Agent',  color: 'purple', text: 'Resolved {n} conversations' },
    { agent: 'Analytics Agent',color: 'cyan',   text: 'Weekly report generated · +{n}% MoM' }
  ];

  const BRANCHES = ['auth-rewrite', 'billing-v2', 'ui-refresh', 'api-cache', 'observability'];
  const FEATURES = ['payment flow', 'webhook retry', 'CSRF guard', 'rate limiter', 'session store'];
  const ENDPOINTS = ['users', 'orders', 'webhooks', 'sessions', 'tokens'];

  // --------------------------------------------------------
  // UTILS
  // --------------------------------------------------------
  const fmtMoney = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = n => Math.floor(n).toLocaleString('en-US');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const pad2 = n => String(Math.floor(n)).padStart(2, '0');
  const $ = id => document.getElementById(id);
  const setText = (id, v) => { const e = $(id); if (e) e.textContent = v; };

  // --------------------------------------------------------
  // CLOCK
  // --------------------------------------------------------
  function tickClock() {
    const now = new Date();
    setText('hud-clock', `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`);
  }

  // --------------------------------------------------------
  // STAT TICKER
  // --------------------------------------------------------
  function tick() {
    if (state.paused) return;
    state.revenue += rand(0.1, 1.6) * state.speed;
    if (Math.random() < 0.05 * state.speed) state.orders++;
    if (Math.random() < 0.01 * state.speed) state.flows = Math.max(8, Math.min(30, state.flows + (Math.random() < 0.5 ? 1 : -1)));
    state.health = Math.max(94, Math.min(99.9, state.health + (Math.random() - 0.5) * 0.08));

    state.cpu = Math.max(20, Math.min(90, state.cpu + (Math.random() - 0.5) * 2));
    state.memory = Math.max(40, Math.min(92, state.memory + (Math.random() - 0.5) * 1.4));
    state.network = Math.max(20, Math.min(85, state.network + (Math.random() - 0.5) * 2.5));
    state.storage = Math.max(50, Math.min(80, state.storage + (Math.random() - 0.5) * 0.6));

    paint();
  }

  function paint() {
    setText('stat-revenue', fmtMoney(state.revenue));
    setText('stat-orders', fmtInt(state.orders));
    setText('stat-flows', state.flows);
    setText('stat-agents-active', state.agentsActive);
    setText('stat-health', state.health.toFixed(1));
    setText('stat-day', state.day);

    // Usage bars
    document.querySelectorAll('.usage').forEach((row, i) => {
      const val = [state.cpu, state.memory, state.network, state.storage][i];
      if (val == null) return;
      const fill = row.querySelector('.usage__fill');
      const num  = row.querySelector('b');
      if (fill) fill.style.setProperty('--w', val.toFixed(0) + '%');
      if (num)  num.textContent = Math.floor(val) + '%';
    });
  }

  // --------------------------------------------------------
  // SPARKLINES (top stat cards)
  // --------------------------------------------------------
  function drawSpark(rootId, color, trend = 'up') {
    const root = $(rootId);
    if (!root) return;
    const line = root.querySelector('.spark-line');
    const fill = root.querySelector('.spark-fill');
    const pts = 14, w = 60, h = 22;
    const data = [];
    for (let i = 0; i < pts; i++) {
      const x = (i / (pts - 1)) * w;
      const baseY = trend === 'up' ? h - (i / pts) * 12 - 4 : (i / pts) * 10 + 4;
      const noise = Math.sin(i * 0.6 + Date.now() / 4000) * 3 + (Math.random() - 0.5) * 2;
      data.push([x, baseY + noise]);
    }
    let d = `M${data[0][0]} ${data[0][1].toFixed(1)}`;
    for (let i = 1; i < pts; i++) d += ` L${data[i][0]} ${data[i][1].toFixed(1)}`;
    if (line) { line.setAttribute('d', d); line.style.stroke = color; }
    if (fill) fill.setAttribute('d', d + ` L${w} ${h} L0 ${h} Z`);
  }

  function drawAllSparks() {
    drawSpark('spark-revenue', '#22c55e', 'up');
    drawSpark('spark-orders', '#38e8ff', 'up');
    drawSpark('spark-flows', '#a855f7', 'up');
  }

  // --------------------------------------------------------
  // EVENT STREAM
  // --------------------------------------------------------
  const eventStream = $('event-stream');

  function makeEvent() {
    const tpl = pick(FEED_TEMPLATES);
    const text = tpl.text
      .replace('{n}', Math.floor(rand(1, 99)))
      .replace('{m}', Math.floor(rand(0, 9)))
      .replace('{branch}', pick(BRANCHES))
      .replace('{feat}', pick(FEATURES))
      .replace('{ep}', pick(ENDPOINTS))
      .replace('{x}', Math.floor(rand(1000, 9999)));
    const now = new Date();
    const ts = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    return { agent: tpl.agent, color: tpl.color, time: ts, desc: text };
  }

  const botSvg = `<svg viewBox="0 0 24 24"><rect x="6" y="8" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9.5" cy="12" r="1" fill="currentColor"/><circle cx="14.5" cy="12" r="1" fill="currentColor"/><line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="3" r="1" fill="currentColor"/></svg>`;

  function addEvent() {
    if (!eventStream || state.paused) return;
    const e = makeEvent();
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="event__avatar bot ${e.color}">${botSvg}</div>
      <div class="event__body">
        <div class="event__time">${e.time}</div>
        <div class="event__title">${e.agent}</div>
        <div class="event__desc">${e.desc}</div>
      </div>`;
    eventStream.prepend(li);
    while (eventStream.children.length > 18) eventStream.lastChild.remove();
  }

  // --------------------------------------------------------
  // SPEED CTRL
  // --------------------------------------------------------
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sp = parseFloat(btn.dataset.speed);
      // pause button
      if (sp === 0) {
        state.paused = true;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        toast('warn', 'PAUSED', 'Simulation halted');
        return;
      }
      state.paused = false;
      state.speed = sp;
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      toast('info', 'SPEED', `Simulation @ ${sp}×`);
    });
  });

  // --------------------------------------------------------
  // CHAMBER → DRAWER
  // --------------------------------------------------------
  const drawer = $('agent-drawer');
  const backdrop = $('backdrop');

  function openDrawer(roomKey) {
    const a = AGENTS[roomKey];
    if (!a) return;
    setText('drawer-name', a.name.toUpperCase());
    setText('drawer-role', a.role);
    setText('drawer-status', a.status);
    setText('drawer-queue', a.queue);
    setText('drawer-task', a.task);
    drawer.classList.add('open');
    backdrop.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
  }
  $('drawer-close')?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  document.querySelectorAll('.chamber').forEach(ch => {
    ch.addEventListener('click', () => openDrawer(ch.dataset.room));
  });

  // --------------------------------------------------------
  // BOTTOM NAV
  // --------------------------------------------------------
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      toast('info', btn.dataset.nav.toUpperCase(), `Switched to ${btn.dataset.nav} view`);
    });
  });

  document.querySelectorAll('.mission').forEach(m => {
    m.addEventListener('click', () => {
      const title = m.querySelector('.mission__title')?.textContent || 'mission';
      toast('info', 'MISSION', title);
    });
  });

  // --------------------------------------------------------
  // TOASTS
  // --------------------------------------------------------
  const toasts = $('toasts');
  function toast(type, title, msg) {
    if (!toasts) return;
    const t = document.createElement('div');
    t.className = `toast ${type === 'ok' ? 'ok' : type === 'warn' ? 'warn' : ''}`;
    const icon = type === 'ok' ? '✓' : type === 'warn' ? '⚠' : '◉';
    t.innerHTML = `<span class="icon">${icon}</span><div class="body"><strong>${title}</strong>${msg}</div>`;
    toasts.appendChild(t);
    setTimeout(() => t.remove(), 5200);
  }

  // --------------------------------------------------------
  // MISSION BURST
  // --------------------------------------------------------
  const burst = $('mission-burst');
  const DEPLOY_NAMES = [
    'api/v2 release', 'auth-rewrite branch', 'billing module', 'cache invalidation',
    'webhook retry logic', 'rate limiter v3', 'session store migration', 'observability stack'
  ];
  function triggerBurst() {
    setText('burst-name', pick(DEPLOY_NAMES));
    burst.classList.add('active');
    state.flows++;
    toast('ok', 'DEPLOYED', 'Workflow completed successfully');
    setTimeout(() => burst.classList.remove('active'), 1800);
  }

  // --------------------------------------------------------
  // KEYBOARD
  // --------------------------------------------------------
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'd' || e.key === 'D') triggerBurst();
  });

  // --------------------------------------------------------
  // BOOT
  // --------------------------------------------------------
  tickClock();
  paint();
  drawAllSparks();

  setInterval(tickClock, 1000);
  setInterval(tick, 700);
  setInterval(addEvent, 3000);
  setInterval(drawAllSparks, 4000);
  setInterval(triggerBurst, 28000);

  setTimeout(() => toast('ok', 'SYSTEM', 'All agents online · 9 chambers active'), 700);
  setTimeout(() => toast('info', 'CODE AGENT', 'Pushed 3 commits to auth-rewrite'), 3200);
  setTimeout(() => toast('warn', 'TEST AGENT', 'Caught regression in /api/v2/users'), 7400);
})();
