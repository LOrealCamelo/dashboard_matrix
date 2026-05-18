/* ULTRONOS // Autonomous Store Command Center (v1) */
(() => {
  'use strict';

  const state = {
    speed: 1, paused: false,
    revenue: 4908.72, orders: 8, products: 10, agentsActive: 5,
    tokens: 82401, day: 47, shipped: 536, output: 538, sent: 482,
    queue: 17, pass: 80, throughput: 117, sessions: 1284, rev24: 184.40
  };

  const AGENTS = {
    trend:   { name: 'ASTRA',  role: 'Recon Analyst',  produced: '142 indexed', tasks: 12, active: '4h 11m', color: 'cyan' },
    ideas:   { name: 'VEGA',   role: 'Ideation',       produced: '47 concepts', tasks: 9,  active: '3h 02m', color: 'violet' },
    script:  { name: 'NOVA',   role: 'Copy Synth',     produced: '88 scripts',  tasks: 6,  active: '5h 18m', color: 'magenta' },
    image:   { name: 'PIXEL',  role: 'Visual Forge',   produced: '312 renders', tasks: 11, active: '6h 44m', color: 'orange' },
    listing: { name: 'FORGE',  role: 'Listing Smith',  produced: '400 items',   tasks: 17, active: '2h 14m', color: 'amber' },
    seo:     { name: 'SAGE',   role: 'Keyword Oracle', produced: '62 optims',   tasks: 0,  active: 'standby', color: 'green' },
    qa:      { name: 'LUMEN',  role: 'Integrity Audit',produced: '188 passed',  tasks: 4,  active: '5h 32m', color: 'cyan' },
    publish: { name: 'ATLAS',  role: 'Deploy Engineer',produced: '24 launched', tasks: 2,  active: '4h 02m', color: 'orange' },
    msg:     { name: 'ECHO',   role: 'Support Liaison',produced: '156 replied', tasks: 5,  active: '7h 21m', color: 'green' },
    sales:   { name: 'ORACLE', role: 'Revenue Sentinel', produced: '$4,908.72', tasks: 1, active: '∞', color: 'amber' }
  };

  const PRODUCTS = ['Velvet Tarot Deck', 'Lunar Affirmations 3.0', 'Cyberpunk Cat Tee',
    'Birthstone Moon Ritual', 'Minimalist Witch Print', 'Crypto Sigil Sticker',
    'Lo-Fi Spell Journal', 'AI Oversized Hoodie', 'Self-Improvement Planner',
    'Mystic Affirmation Card', 'Neon Crystal Poster', 'Astro Mug 2.0'];

  const FEED_TEMPLATES = [
    { lvl: 'info', text: 'PIXEL // batch #{n} render complete' },
    { lvl: 'ok',   text: 'ATLAS // "{name}" → live on etsy' },
    { lvl: 'info', text: 'ASTRA // scraped {n} trend signals' },
    { lvl: 'warn', text: 'LUMEN // ⚠ flagging blurry mockup batch #{n}' },
    { lvl: 'ok',   text: 'ECHO // ticket #{n} resolved (refund)' },
    { lvl: 'info', text: 'NOVA // copy synth: "{name}"' },
    { lvl: 'info', text: 'FORGE // SKU MN-LR-{n} assembled' },
    { lvl: 'ok',   text: 'SAGE // title optimized +{n}% CTR' },
    { lvl: 'ok',   text: 'ORACLE // revenue +${n} last hour' }
  ];

  const $ = id => document.getElementById(id);
  const setText = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  const fmtMoney = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = n => Math.floor(n).toLocaleString('en-US');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const pad2 = n => String(Math.floor(n)).padStart(2, '0');

  function tickClock() {
    const now = new Date();
    setText('hud-clock', `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`);
  }

  function tick() {
    if (state.paused) return;
    state.revenue += rand(0.4, 2.8) * state.speed;
    state.rev24 += rand(0.05, 0.4) * state.speed;
    state.tokens -= Math.floor(rand(5, 22) * state.speed);
    state.sessions += Math.floor(rand(0, 3) * state.speed);
    if (Math.random() < 0.02 * state.speed) state.orders++;
    if (Math.random() < 0.008 * state.speed) state.products++;
    if (Math.random() < 0.04 * state.speed) state.output++;
    if (Math.random() < 0.035 * state.speed) state.shipped++;
    if (Math.random() < 0.03 * state.speed) state.sent++;
    state.pass = 78 + Math.floor(Math.sin(Date.now() / 5000) * 4);
    paint();
  }

  function paint() {
    setText('stat-revenue', fmtMoney(state.revenue));
    setText('stat-orders', state.orders);
    setText('stat-products', state.products);
    setText('stat-agents-active', state.agentsActive);
    setText('stat-day', String(state.day).padStart(3, '0'));
    setText('ps-pass', state.pass);
    setText('ps-output', state.output);
    setText('ps-shipped', state.shipped);
    setText('ps-sent', state.sent);
    setText('ps-queue', state.queue);
    setText('metric-rev24', fmtMoney(state.rev24));
    setText('metric-conv', (3.5 + Math.sin(Date.now() / 7000) * 0.6).toFixed(1));
    setText('metric-aov', fmtMoney(state.rev24 / Math.max(1, state.orders) * 1.2));
    setText('metric-sessions', fmtInt(state.sessions));
    setText('oq-rev', fmtMoney(state.revenue / 2.5));
  }

  function drawSalesChart() {
    const line = $('sales-line'); const area = $('sales-area');
    if (!line) return;
    const w = 400, h = 90, pts = 40;
    const data = [];
    for (let i = 0; i < pts; i++) {
      const x = (i / (pts - 1)) * w;
      const wave = Math.sin(i * 0.4 + Date.now() / 5000) * 18 + Math.sin(i * 0.9) * 10;
      const trend = (i / pts) * -22;
      data.push([x, 55 + trend + wave + (Math.random() - 0.5) * 3]);
    }
    let d = `M${data[0][0]} ${data[0][1]}`;
    for (let i = 1; i < pts; i++) d += ` L${data[i][0]} ${data[i][1].toFixed(1)}`;
    line.setAttribute('d', d);
    if (area) area.setAttribute('d', d + ` L${w} ${h} L0 ${h} Z`);
  }

  const feedList = $('feed-list');
  function pushFeed() {
    if (!feedList || state.paused) return;
    const tpl = pick(FEED_TEMPLATES);
    const text = tpl.text.replace('{n}', Math.floor(rand(1, 999))).replace('{name}', pick(PRODUCTS));
    const now = new Date();
    const ts = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    const li = document.createElement('li');
    li.innerHTML = `<span class="t">${ts}</span><span class="lvl ${tpl.lvl}">${tpl.lvl.toUpperCase()}</span><span>${text}</span>`;
    feedList.prepend(li);
    while (feedList.children.length > 22) feedList.lastChild.remove();
  }

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sp = parseFloat(btn.dataset.speed);
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (sp === 0) { state.paused = true; toast('warn', 'PAUSED', 'Simulation halted'); return; }
      state.paused = false; state.speed = sp;
      toast('info', 'SPEED', `@ ${sp}×`);
    });
  });

  function updatePopup(roomKey) {
    const a = AGENTS[roomKey]; if (!a) return;
    setText('popup-name', a.name);
    setText('popup-sub', a.role.toLowerCase());
    setText('popup-agent', a.name);
    setText('popup-produced', a.produced);
    setText('popup-tasks', a.tasks);
    setText('popup-active', a.active);
    setText('popup-autos', `${a.tasks} active`);
  }
  document.querySelectorAll('.chamber').forEach(ch => {
    ch.addEventListener('mouseenter', () => updatePopup(ch.dataset.room));
    ch.addEventListener('click', () => toast('info', 'AGENT', AGENTS[ch.dataset.room]?.name || ''));
  });
  document.querySelectorAll('.bn-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.bn-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      toast('info', b.dataset.nav.toUpperCase(), `${b.dataset.nav} view`);
    });
  });
  document.querySelectorAll('.mission').forEach(m => {
    m.addEventListener('click', () => {
      const title = m.querySelector('.mission__title')?.textContent || '';
      toast('info', 'MISSION', title);
    });
  });

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

  const burst = $('mission-burst');
  function triggerBurst() {
    setText('burst-name', pick(PRODUCTS).toUpperCase());
    burst.classList.add('active');
    state.products++; state.shipped++; state.revenue += rand(18, 45);
    toast('ok', 'DEPLOYED', `${pick(PRODUCTS)} is live`);
    setTimeout(() => burst.classList.remove('active'), 1800);
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'd' || e.key === 'D') triggerBurst();
  });

  // Boot
  tickClock(); paint(); drawSalesChart();
  updatePopup('listing');
  for (let i = 0; i < 8; i++) pushFeed();

  setInterval(tickClock, 1000);
  setInterval(tick, 800);
  setInterval(pushFeed, 2200);
  setInterval(drawSalesChart, 5000);
  setInterval(triggerBurst, 22000);

  setTimeout(() => toast('ok', 'BOOT', 'ULTRONOS online · 6 agents synced'), 600);
  setTimeout(() => toast('info', 'PRINTIFY', 'Connection verified'), 2400);
  setTimeout(() => toast('warn', 'LUMEN', 'Mockup #67 flagged for review'), 6800);
})();
