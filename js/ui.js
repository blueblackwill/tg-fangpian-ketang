/* ==========================================================================
   Telegram 仿真 · 渲染与交互内核
   ========================================================================== */
(function (global) {
  'use strict';

  const TG = global.TG = global.TG || {};
  const D = global.TG.data;
  const STORE_KEY = 'zhizhou.telegram.sim.v1';

  const ICON = {
    pin: '<svg><use href="#i-pin"/></svg>',
    muted: '<svg><use href="#i-muted"/></svg>',
    check: '<svg><use href="#i-check"/></svg>',
    checks: '<svg><use href="#i-checks"/></svg>',
    chevron: '<svg><use href="#i-chevron"/></svg>',
    close: '<svg><use href="#i-close"/></svg>',
    external: '<svg><use href="#i-external"/></svg>',
    users: '<svg><use href="#i-users"/></svg>',
    flag: '<svg><use href="#i-flag"/></svg>',
    search: '<svg><use href="#i-search"/></svg>',
    phone: '<svg><use href="#i-phone"/></svg>',
    more: '<svg><use href="#i-more"/></svg>',
    reply: '<svg><use href="#i-reply"/></svg>',
    forward: '<svg><use href="#i-forward"/></svg>',
    moon: '<svg><use href="#i-moon"/></svg>',
    sun: '<svg><use href="#i-sun"/></svg>',
    settings: '<svg><use href="#i-settings"/></svg>',
    bot: '<svg><use href="#i-bot"/></svg>',
    back: '<svg><use href="#i-back"/></svg>',
    attach: '<svg><use href="#i-attach"/></svg>',
    emoji: '<svg><use href="#i-emoji"/></svg>',
    send: '<svg><use href="#i-send"/></svg>',
    info: '<svg><use href="#i-info"/></svg>'
  };

  const SENDERS = {
    mei: { name: '云上客服·小美', color: '#d9607f', tag: '管理员' },
    qiang: { name: '阿强', color: '#527a45' },
    lu: { name: '小鹿', color: '#8f5fbf' },
    wang: { name: '老王', color: '#4d7fa8' },
    mallbot: { name: '云上商铺', color: '#3a7fc1', tag: '机器人' },
    channel: { name: '大自然资产管理者❇️', color: '#2f6b46' }
  };

  const MONTH_DAY = '8月22日';

  let typing = {};
  let saveTimer = null;
  let msgCounter = 0;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linkify(escaped) {
    return escaped
      .replace(/(https?:\/\/[^\s<]+)/g, (u) => '<a href="' + u + '" data-external="' + u + '">' + u + '</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function textHtml(text) { return linkify(esc(text)); }

  function avatarHtml(av, size) {
    if (!av) return '';
    const cls = 'avatar size-' + (size || 42);
    if (av.img) return '<span class="' + cls + '"><img src="' + esc(av.img) + '" alt=""></span>';
    return '<span class="' + cls + '" style="background:' + esc(av.bg || '#5b7fa6') + '"><span class="emo">' + esc(av.text || '?') + '</span></span>';
  }

  function profileOf(key) { return D.profiles[key] || null; }

  function senderKey(m) { return m.sender || 'mei'; }

  function senderInfo(m) {
    const key = senderKey(m);
    const p = profileOf(key);
    if (p) return { name: p.name, color: '#3a7fc1', tag: p.type === 'bot' ? '机器人' : '' };
    return SENDERS[key] || { name: key, color: '#3a7fc1' };
  }

  function minutes(t) {
    const parts = String(t || '00:00').split(':');
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }

  function previewOf(m) {
    if (m.service) return m.service;
    if (m.card === 'order') return '订单详情 · ' + (m.order ? m.order.status : '待支付');
    if (m.card === 'wallet') return 'Okpay 钱包 · 余额 0.00 USDT';
    if (m.card === 'transfer') return '🎁 转账给你 ' + m.transfer.amount + ' U · 请在24小时内领取';
    if (m.card === 'grant') return '成功领取 ' + m.grant.amount + ' USDT';
    if (m.photo) return '🖼 图片' + (m.text ? ' · ' + m.text : '');
    if (m.forward) return '转发自 ' + m.forward;
    const t = (m.text || '').replace(/\n/g, ' ');
    return t.length > 42 ? t.slice(0, 42) + '…' : t;
  }

  /* ---------------------------------------------------------------------
     状态
     --------------------------------------------------------------------- */
  TG.state = null;

  function freshFlags() {
    return {
      openedGroupInfo: false, openedChannel: false, openedBotProfile: false,
      openedLedger: false, openedDomainInfo: false, openedContract: false,
      claimed: false, checkedBalance: false, withdrawAsked: false, withdrawSubmitted: false,
      bindOpened: false, approved: false, rejected: false,
      paid: false, verifyOpened: false, verifyApproved: false, verifyRejected: false,
      drained: false, fishSeen: false
    };
  }

  TG.newState = function (mode) {
    return {
      v: 1,
      started: true,
      mode: mode || 'blind',
      theme: 'light',
      folder: 'all',
      active: 'okpay',
      infoOpen: false,
      chats: D.seedChats(),
      flags: freshFlags(),
      trace: [],
      levels: {},
      settings: { anno: false, showFish: false, showMeta: false },
      createdAt: Date.now(),
      clock: 19 * 60 + 54
    };
  };

  function save() {
    if (!TG.state) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(TG.state)); } catch (e) { /* ignore */ }
    }, 160);
  }
  TG.save = save;

  TG.load = function () {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.chats) return null;
      if (!s.flags) s.flags = freshFlags();
      if (!s.settings) s.settings = { anno: false, showFish: false, showMeta: false };
      if (!s.trace) s.trace = [];
      if (!s.levels) s.levels = {};
      if (typeof s.clock !== 'number') s.clock = 19 * 60 + 54;
      return s;
    } catch (e) { return null; }
  };

  TG.reset = function (mode) {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    TG.state = TG.newState(mode || 'blind');
    typing = {};
    document.body.classList.toggle('theme-dark', false);
    document.body.classList.toggle('theme-light', true);
    document.body.classList.toggle('teach-mode', TG.state.mode === 'teach');
    document.body.classList.toggle('anno-on', !!TG.state.settings.anno);
    if (TG.classroom) TG.classroom.reset();
    renderAll();
    save();
  };

  TG.chat = function (id) {
    id = id || TG.state.active;
    return TG.state.chats.find((c) => c.id === id) || null;
  };

  TG.profile = profileOf;

  /* ---------------------------------------------------------------------
     头像 / 会话列表
     --------------------------------------------------------------------- */
  function chatAvatar(chat, size) {
    const p = chat.profile ? profileOf(chat.profile) : null;
    return avatarHtml(p ? p.avatar : chat.avatar, size);
  }

  function renderSidebar() {
    const list = document.getElementById('chatList');
    const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    const folder = TG.state.folder;
    const chats = TG.state.chats.slice().sort((a, b) => a.order - b.order).filter((c) => {
      if (c.hidden) return false;
      if (q && !(c.title.toLowerCase().includes(q) || (c.lastPreview || '').toLowerCase().includes(q))) return false;
      if (folder === 'unread' && !c.unread) return false;
      if (folder === 'groups' && !(c.type === 'group' || c.type === 'channel')) return false;
      if (folder === 'channels' && c.type !== 'channel') return false;
      return true;
    });

    list.innerHTML = chats.map((c) => {
      const sel = c.id === TG.state.active ? ' selected' : '';
      const badge = c.unread ? '<span class="ci-badge' + (c.muted ? ' muted' : '') + '">' + c.unread + '</span>' : '';
      const icons = (c.muted ? '<span class="ci-icons">' + ICON.muted + '</span>' : '') +
        (c.pinned ? '<span class="ci-icons">' + ICON.pin + '</span>' : '');
      return '<button class="chat-item' + sel + '" data-chat="' + c.id + '">' +
        chatAvatar(c, 54) +
        '<span class="ci-body">' +
          '<span class="ci-top"><span class="ci-name">' + esc(c.title) + '</span><span class="ci-time">' + esc(lastTime(c)) + '</span></span>' +
          '<span class="ci-bottom"><span class="ci-preview">' + esc(c.lastPreview || '') + '</span>' + icons + badge + '</span>' +
        '</span>' +
      '</button>';
    }).join('') || '<div style="padding:28px;text-align:center;color:var(--text-3);font-size:13px">没有找到会话</div>';

    const folders = [
      ['all', '全部'], ['unread', '未读'], ['groups', '群组'], ['channels', '频道']
    ];
    document.getElementById('folders').innerHTML = folders.map(([k, label]) =>
      '<button class="folder' + (TG.state.folder === k ? ' active' : '') + '" data-folder="' + k + '">' + label + '</button>'
    ).join('');

    renderFooter();
  }

  function lastTime(chat) {
    const ms = chat.messages.filter((m) => m.time);
    return ms.length ? ms[ms.length - 1].time : '';
  }

  function renderFooter() {
    const me = D.me;
    document.getElementById('sideFooter').innerHTML =
      '<button class="side-profile" data-self="1">' + avatarHtml(me.avatar, 34) +
      '<span style="text-align:left"><span class="sp-name" style="display:block">' + esc(me.name) + '</span>' +
      '<span class="sp-status" style="display:block">在线</span></span></button>' +
      '<span class="spacer"></span>' +
      '<span class="sim-chip" title="课堂仿真">仿真</span>' +
      '<button class="icon-btn" id="classroomBtn" title="课堂控制台（T）"><svg><use href="#i-paperboat"/></svg></button>' +
      '<button class="icon-btn" id="themeBtn" title="切换主题">' + ICON.moon + '</button>' +
      '<button class="icon-btn" id="settingsBtn" title="课堂设置">' + ICON.settings + '</button>';
    const tb = document.getElementById('themeBtn');
    if (tb) tb.onclick = toggleTheme;
    const cb = document.getElementById('classroomBtn');
    if (cb) cb.onclick = () => TG.classroom && TG.classroom.openPanel();
    const sb = document.getElementById('settingsBtn');
    if (sb) sb.onclick = () => TG.modal({
      title: '设置',
      body: '<div style="font-size:13.5px;line-height:1.9">' +
        '主题：<b>' + (document.body.classList.contains('theme-dark') ? '深色' : '浅色') + '</b><br>' +
        '演练记录：保存在本机浏览器<br>' +
        '课堂控制台：按 <b>T</b> 打开<br>' +
        '复盘报告：按 <b>R</b> 打开<br><br>' +
        '<span style="color:var(--text-3);font-size:12px">这是纸舟课堂的仿真环境，不是真实的 Telegram 客户端。</span></div>',
      buttons: [
        { text: '切换主题', onClick: () => { toggleTheme(); renderFooter(); } },
        { text: '关闭', primary: true, close: true }
      ]
    });
  }

  function toggleTheme() {
    const dark = !document.body.classList.contains('theme-dark');
    document.body.classList.toggle('theme-dark', dark);
    document.body.classList.toggle('theme-light', !dark);
    TG.state.theme = dark ? 'dark' : 'light';
    save();
  }

  /* ---------------------------------------------------------------------
     聊天头部 / 置顶
     --------------------------------------------------------------------- */
  function renderHeader() {
    const chat = TG.chat();
    if (!chat) return;
    const el = document.getElementById('chatHead');
    const p = chat.profile ? profileOf(chat.profile) : null;
    const isTyping = typing[chat.id];
    let sub = chat.subtitle || '';
    if (chat.type === 'group') sub = '1 284 位成员，312 位在线';
    if (chat.type === 'channel') sub = '12 847 位订阅者';
    if (isTyping) sub = isTyping + ' 正在输入…';
    el.innerHTML =
      '<button class="icon-btn mobile-back" data-mobile-back="1">' + ICON.back + '</button>' +
      '<span class="ch-ava" data-info="1" style="cursor:pointer">' + chatAvatar(chat, 42) + '</span>' +
      '<span class="ch-body" data-info="1">' +
        '<span class="ch-title">' + esc(chat.title) + '</span>' +
        '<span class="ch-sub' + (isTyping ? ' typing' : '') + '">' + esc(sub) + '</span>' +
      '</span>' +
      '<span class="ch-actions">' +
        '<button class="icon-btn" id="headSearch" title="搜索">' + ICON.search + '</button>' +
        (chat.type === 'user' ? '<button class="icon-btn" id="headCall" title="通话">' + ICON.phone + '</button>' : '') +
        '<button class="icon-btn" id="headMore" title="更多">' + ICON.more + '</button>' +
      '</span>';

    renderPinned(chat);

    const call = document.getElementById('headCall');
    if (call) call.onclick = () => TG.toast('仿真环境中通话不可用');
    document.getElementById('headMore').onclick = () => chatMenu(chat);
    document.getElementById('headSearch').onclick = () => TG.toast('在仿真中搜索消息：请使用左侧搜索框');
    const back = document.querySelector('[data-mobile-back]');
    if (back) back.onclick = () => document.getElementById('app').classList.remove('mobile-chat');
  }

  function renderPinned(chat) {
    const bar = document.getElementById('pinnedBar');
    if (!chat.pinned) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    bar.classList.remove('hidden');
    bar.innerHTML = '<span class="pin-line"></span>' + ICON.pin +
      '<span class="pin-text"><b>' + esc(chat.pinned.title) + '</b><span class="sub">' + esc(chat.pinned.sub || '') + '</span></span>';
    bar.onclick = () => {
      const node = document.querySelector('[data-msg="' + chat.pinned.id + '"]');
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        node.classList.add('flash');
        setTimeout(() => node.classList.remove('flash'), 1300);
        TG.classroom && TG.classroom.onEvent('pin', { chat: chat.id, msg: chat.pinned.id });
      }
    };
  }

  /* ---------------------------------------------------------------------
     消息渲染
     --------------------------------------------------------------------- */
  function cardOrder(m) {
    const o = m.order;
    return '<div class="order-card">' +
      '<div class="oc-title">订单详情</div>' +
      '<div class="oc-row"><span>📦 商品</span><b>' + esc(o.product) + '</b></div>' +
      '<div class="oc-row"><span>💰 价格</span><b class="oc-price">$' + esc(o.price) + '</b></div>' +
      '<div class="oc-row"><span>📝 描述</span><b>' + esc(o.desc) + '</b></div>' +
      '<div class="oc-row"><span>🔖 必要的争议说明</span><b>虚拟商品售出不退</b></div>' +
      '<div class="oc-row"><span>🆔 订单 ID</span><b>' + esc(o.id) + '</b></div>' +
      '<div class="oc-row"><span>🕐 状态</span><b class="oc-status">' + esc(o.status) + '</b></div>' +
    '</div>';
  }

  function cardWallet(m) {
    const w = m.wallet;
    return '<div class="wallet-msg">' +
      '<div class="wmsg-head"><span class="wmsg-logo">OK</span><b>Okpay</b><span class="wmsg-tag">钱包助手</span></div>' +
      '<div class="wmsg-name">👤 昵称: ' + esc(w.nickname) + '</div>' +
      '<div class="wmsg-id">🆔 ID: ' + esc(w.uid) + '</div>' +
      '<div class="wmsg-bals">' +
        '<div><span>USDT</span><b class="green">' + esc(w.usdt) + '</b></div>' +
        '<div><span>TRX</span><b class="red">' + esc(w.trx) + '</b></div>' +
        '<div><span>CNY</span><b class="blue">' + esc(w.cny) + '</b></div>' +
      '</div>' +
    '</div>';
  }

  function cardTransfer(m) {
    const t = m.transfer;
    return '<div class="okpay-card" data-anno="① 只是消息卡片，不是到账凭证">' +
      '<div class="okc-head"><span class="okc-logo">OK</span><b>Okpay</b><span class="okc-amount-sm">💰</span></div>' +
      '<div class="okc-via">通过 ' + esc(t.from) + '</div>' +
      '<div class="okc-mid">' +
        '<div class="okc-label">转账给你</div>' +
        '<div class="okc-amount">' + esc(t.amount) + ' <small>U</small></div>' +
        '<div class="okc-expire">' + esc(t.expire) + '</div>' +
      '</div>' +
      '<div class="okc-memo">' + esc(t.memo) + '</div>' +
    '</div>';
  }

  function cardGrant(m) {
    const g = m.grant;
    return '<div class="okpay-card grant" data-anno="② 余额由这个页面写入，没有链上交易">' +
      '<div class="okc-head"><span class="okc-logo">OK</span><b>Okpay</b><span class="okc-amount-sm">💰</span></div>' +
      '<div class="okc-label">领取结果</div>' +
      '<div class="okc-grant">成功领取 ' + esc(g.amount) + ' <span class="coin">🟢</span> ' + esc(g.unit) + '-' + esc(g.memo) + '</div>' +
    '</div>';
  }

  function photoHtml(m) {
    if (m.photo.src) {
      return '<div class="photo"><img src="' + esc(m.photo.src) + '" alt="' + esc(m.photo.alt || '') + '" loading="lazy"></div>';
    }
    const f = m.photo;
    const rows = (f.rows || []).map((r) => '<div class="fs-row"><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div>').join('');
    return '<div class="photo fake-shot"><div class="fake-shot-inner">' +
      '<div class="fs-title">' + (f.kind === 'receipt' || !f.fake ? '✅ ' : '') + esc(f.title || '通知') + '</div>' +
      '<div class="fs-amount">' + esc(f.amount || '') + '</div>' + rows +
      '<div class="fs-ok" style="margin-top:8px;font-size:11px">TRC20 · 链上确认 1/1</div>' +
    '</div></div>';
  }

  function linkPreviewHtml(m) {
    if (!m.linkPreview) return '';
    return '<a class="link-preview" href="' + esc(m.linkPreview.url) + '" data-external="' + esc(m.linkPreview.url) + '">' +
      '<span class="lp-bar"></span><span class="lp-body"><b>' + esc(m.linkPreview.title) + '</b><span>' + esc(m.linkPreview.desc) + '</span></span>' +
    '</a>';
  }

  function buttonsHtml(m) {
    if (!m.buttons || !m.buttons.length) return '';
    const rows = m.buttons.map((row) => {
      const cells = row.map((b) => {
        const cls = 'ikb-btn' + (b.danger ? ' danger' : '') + (b.ghost ? ' ghost' : '');
        return '<button class="' + cls + '" data-action="' + esc(b.action) + '" data-msg="' + esc(m.id) + '"' + (b.anno ? ' data-anno="' + esc(b.anno) + '"' : '') + '>' +
          esc(b.text) + (b.webapp ? '<span class="ext">' + ICON.external + '</span>' : '') + '</button>';
      }).join('');
      return '<span class="ikb-row">' + cells + '</span>';
    }).join('');
    return '<span class="ikb">' + rows + '</span>';
  }

  function bubbleHtml(m, chat) {
    const own = m.from === 'me';
    let inner = '';
    if (m.forward) {
      inner += '<div class="fwd">' + ICON.forward + '<span>转发自 ' + esc(m.forward) + '</span></div>';
    }
    if (m.reply) {
      inner += '<div class="quote"><span class="q-name">' + esc(m.reply.name) + '</span>' + esc(m.reply.text) + '</div>';
    }
    if (chat.type === 'group' && !own && !m.forward) {
      const s = senderInfo(m);
      inner += '<div class="sender" style="color:' + esc(s.color) + '" data-profile="' + esc(senderKey(m)) + '">' +
        esc(s.name) + (s.tag ? '<span class="tag">' + esc(s.tag) + '</span>' : '') + '</div>';
    }
    if (m.card === 'order') inner += cardOrder(m);
    if (m.card === 'wallet') inner += cardWallet(m);
    if (m.card === 'transfer') inner += cardTransfer(m);
    if (m.card === 'grant') inner += cardGrant(m);
    if (m.photo) inner += photoHtml(m);
    if (m.text) {
      const anno = m.card === 'order' ? ' data-anno="④ 订单详情：发送方是本群机器人"' : '';
      inner += '<div class="text"' + anno + '>' + textHtml(m.text) + '</div>';
    }
    if (m.linkPreview) inner += linkPreviewHtml(m);
    if (m.via) inner += '<div class="via" data-profile="mallbot" data-anno="⑤ via 署名：发送方是机器人，不是群管理员">via ' + esc(m.via) + '</div>';
    if (m.reactions && m.reactions.length) {
      inner += m.reactions.map((r) => '<span class="reaction">' + esc(r.e) + ' ' + r.n + '</span>').join('');
    }
    let meta = '';
    if (m.views) meta += '<span class="views">' + esc(m.views) + '</span>';
    if (m.time) meta += '<span class="time">' + esc(m.time) + '</span>';
    if (own) meta += '<span class="ticks">' + ICON.checks + '</span>';
    meta = '<span class="meta">' + meta + '</span>';

    const isPhoto = !!m.photo;
    const hasMedia = !!(m.photo || m.card || m.linkPreview);
    if (!hasMedia && m.text) inner += '<span class="meta-space"></span>';
    inner += meta;
    return '<div class="bubble' + (isPhoto ? ' photo-bubble' : '') + (hasMedia ? ' with-card' : '') + '">' + inner + '</div>';
  }

  function messageRow(m, chat, opts) {
    const own = m.from === 'me';
    const prev = opts.prev;
    const same = prev && prev.sender === m.sender && prev.from === m.from && !prev.service &&
      Math.abs(minutes(prev.time) - minutes(m.time)) <= 2 && !m.day;
    const showAvatar = chat.type === 'group' && !own && !same;
    let cls = 'msg-row ' + (own ? 'out' : 'in') + (same ? ' cont' : '');
    if (chat.type === 'bot' || chat.type === 'user') cls += ' private';
    if (chat.type === 'channel') cls += ' channel';
    if (showAvatar) cls += ' show-avatar';

    const av = showAvatar ? chatAvatar({ avatar: (profileOf(senderKey(m)) || {}).avatar }, 34) : '';
    const rowsN = m.buttons ? m.buttons.length : 0;
    const avStyle = rowsN ? ' style="margin-bottom:' + (rowsN * 46 + 6) + 'px"' : '';
    const actions = '<div class="msg-actions">' +
      '<button data-msg-act="reply" data-id="' + m.id + '" title="回复">' + ICON.reply + '</button>' +
      '<button data-msg-act="forward" data-id="' + m.id + '" title="转发">' + ICON.forward + '</button>' +
      '<button data-msg-act="copy" data-id="' + m.id + '" title="复制">' + ICON.info + '</button>' +
    '</div>';

    return '<div class="' + cls + '" data-msg="' + m.id + '" data-day="' + esc(m.day || '') + '">' +
      '<span class="msg-avatar"' + avStyle + '>' + av + '</span>' +
      '<span class="msg-stack"><span class="msg-wrap">' + bubbleHtml(m, chat) + actions + '</span>' + buttonsHtml(m) + '</span>' +
    '</div>';
  }

  function renderMessages() {
    const chat = TG.chat();
    const box = document.getElementById('messages');
    if (!chat) { box.innerHTML = ''; return; }
    let html = '';
    let prev = null;
    let shownDate = null;
    chat.messages.forEach((m) => {
      if (m.day) {
        html += '<div class="date-div"><span>' + esc(m.day) + '</span></div>';
        shownDate = m.day;
      } else if (!shownDate && !m.service) {
        html += '<div class="date-div"><span>2026年' + MONTH_DAY + '</span></div>';
        shownDate = '2026年' + MONTH_DAY;
      }
      if (m.service) {
        html += '<div class="service"><span>' + esc(m.service) + '</span></div>';
        prev = null;
        return;
      }
      html += messageRow(m, chat, { prev: prev });
      prev = m;
    });
    if (typing[chat.id]) {
      html += '<div class="msg-row in cont typing-row" data-typing="1">' +
        (chat.type === 'group' ? '<span class="msg-avatar"></span>' : '') +
        '<span class="msg-stack"><span class="msg-wrap"><span class="bubble"><span class="typing-dots"><i></i><i></i><i></i></span></span></span></span>' +
      '</div>';
    }
    box.innerHTML = html;
    requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
  }

  /* ---------------------------------------------------------------------
     输入区
     --------------------------------------------------------------------- */
  function renderComposer() {
    const chat = TG.chat();
    const wrap = document.getElementById('composerWrap');
    if (!chat) { wrap.innerHTML = ''; return; }
    if (chat.type === 'channel') {
      wrap.innerHTML = '<div class="muted-note">' + (chat.muted ? '频道已静音' : '频道通知已开启') +
        ' · <button class="link-btn" id="unmuteBtn" style="border:0;background:none;color:var(--accent);font-size:13px">' +
        (chat.muted ? '取消静音' : '静音') + '</button></div>';
      const b = document.getElementById('unmuteBtn');
      if (b) b.onclick = () => {
        chat.muted = !chat.muted;
        renderComposer(); renderSidebar();
        TG.toast(chat.muted ? '已静音' : '已取消静音');
        save();
      };
      return;
    }
    if (chat.muted) {
      wrap.innerHTML = '<div class="muted-note">已静音 · <button class="link-btn" id="unmuteBtn" style="border:0;background:none;color:var(--accent);font-size:13px">取消静音</button></div>';
      const b = document.getElementById('unmuteBtn');
      if (b) b.onclick = () => { chat.muted = false; renderComposer(); renderSidebar(); TG.toast('已取消静音'); save(); };
      return;
    }
    const awaitAmount = chat.id === 'okpay' && TG.state.flags.withdrawAsked && !TG.state.flags.withdrawSubmitted;
    const placeholder = awaitAmount ? '回复提现金额（例如 10000）' : '消息';
    wrap.innerHTML =
      '<div class="composer">' +
        '<button class="icon-btn" id="attachBtn" title="附件">' + ICON.attach + '</button>' +
        '<div class="composer-input"><textarea id="msgInput" rows="1" placeholder="' + placeholder + '"></textarea>' +
          '<button class="icon-btn" id="emojiBtn" title="表情" style="width:34px;height:34px;margin-bottom:4px">' + ICON.emoji + '</button>' +
        '</div>' +
        '<button class="send-btn" id="sendBtn" disabled title="发送">' + ICON.send + '</button>' +
      '</div>';
    const input = document.getElementById('msgInput');
    const send = document.getElementById('sendBtn');
    const resize = () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      send.disabled = !input.value.trim();
    };
    input.addEventListener('input', resize);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });
    send.onclick = submit;
    document.getElementById('attachBtn').onclick = () => TG.toast('仿真环境不支持上传文件');
    document.getElementById('emojiBtn').onclick = () => { input.value += '🙂'; input.focus(); resize(); };

    function submit() {
      const v = input.value.trim();
      if (!v) return;
      input.value = ''; resize();
      if (awaitAmount) { TG.flows.run('okpay:withdrawAmount', { text: v }); return; }
      TG.sendUserMessage(v);
    }
  }

  TG.sendUserMessage = function (text) {
    const chat = TG.chat();
    if (!chat) return;
    append(chat.id, { id: nextId(), from: 'me', text: text });
    if (chat.id === 'okpay') {
      TG.botSay('okpay', { text: '收到，客服稍后回复您。如需提现，请点击下方按钮。', buttons: [[{ text: '💸 提币', action: 'okpay:withdraw' }]] }, 900);
    } else if (chat.id === 'kf') {
      TG.botSay('kf', { text: '消息已收到，客服当前咨询较多，请耐心等待。' }, 1200);
    } else if (chat.id === 'mallbot') {
      TG.botSay('mallbot', { text: '请输入下方菜单指令。', buttons: [[{ text: '🛍 全部商品', action: 'mall:catalog' }]] }, 800);
    }
    TG.classroom && TG.classroom.onEvent('message', { chat: chat.id, text: text });
  };

  /* ---------------------------------------------------------------------
     追加 / 编辑 / 输入中
     --------------------------------------------------------------------- */
  function nextId() { return 'm' + Date.now().toString(36) + (msgCounter++).toString(36); }
  function nowTime() { return TG.nextTime(); }
  TG.nowTime = nowTime;
  TG.nextTime = function () {
    const st = TG.state;
    if (!st) return '19:54';
    if (typeof st.clock !== 'number') st.clock = 19 * 60 + 54;
    st.clock += 1;
    const h = Math.floor(st.clock / 60) % 24;
    const m = st.clock % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  };

  function scrollIfNearBottom() {
    const box = document.getElementById('messages');
    if (!box) return;
    const near = box.scrollHeight - box.scrollTop - box.clientHeight < 220;
    if (near) box.scrollTop = box.scrollHeight;
  }

  function append(chatId, msg, opts) {
    const chat = TG.chat(chatId);
    if (!chat) return null;
    if (!msg.id) msg.id = nextId();
    if (!msg.time) msg.time = nowTime();
    chat.messages.push(msg);
    chat.lastPreview = previewOf(msg);
    if (TG.state.active === chatId) {
      renderMessages();
      scrollIfNearBottom();
      if (opts && opts.typing) { /* noop */ }
    } else if (msg.from !== 'me' && !opts?.silent) {
      chat.unread = (chat.unread || 0) + 1;
      renderSidebar();
    }
    save();
    TG.classroom && TG.classroom.onMessage(chatId, msg);
    return msg;
  }
  TG.append = append;

  TG.update = function (chatId, msgId, patch) {
    const chat = TG.chat(chatId);
    if (!chat) return;
    const m = chat.messages.find((x) => x.id === msgId);
    if (!m) return;
    Object.assign(m, patch);
    if (TG.state.active === chatId) renderMessages();
    chat.lastPreview = previewOf(chat.messages[chat.messages.length - 1]);
    renderSidebar();
    save();
  };

  TG.botSay = function (chatId, msg, delay) {
    const chat = TG.chat(chatId);
    if (!chat) return Promise.resolve();
    const wait = typeof delay === 'number' ? delay : 700;
    if (TG.state.active === chatId) {
      typing[chatId] = chat.type === 'bot' ? chat.title : '小美';
      renderMessages();
      renderHeader();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        delete typing[chatId];
        append(chatId, Object.assign({ from: 'them' }, msg));
        if (TG.state.active === chatId) { renderHeader(); }
        resolve();
      }, wait);
    });
  };

  /* ---------------------------------------------------------------------
     右侧资料面板
     --------------------------------------------------------------------- */
  function toggleInfo(force) {
    const app = document.getElementById('app');
    const open = typeof force === 'boolean' ? force : !app.classList.contains('info-open');
    app.classList.toggle('info-open', open);
    TG.state.infoOpen = open;
    if (open) renderInfo();
    save();
  }
  TG.toggleInfo = toggleInfo;

  function renderInfo() {
    const chat = TG.chat();
    const panel = document.getElementById('infoPanel');
    if (!chat) { panel.innerHTML = ''; return; }
    let html = '';
    if (chat.type === 'group') {
      html += '<div class="info-head"><b style="font-size:15px">群组信息</b><button class="icon-btn info-close" data-info-close="1">' + ICON.close + '</button></div>';
      html += '<div class="info-profile">' + chatAvatar(chat, 120) + '<div class="info-name">' + esc(chat.title) + '</div><div class="info-sub">1 284 位成员，312 位在线</div></div>';
      html += '<div class="info-actions">' +
        '<button class="info-action" data-info-act="search"><span class="ic">' + ICON.search + '</span>搜索</button>' +
        '<button class="info-action" data-info-act="mute"><span class="ic">' + ICON.muted + '</span>静音</button>' +
        '<button class="info-action" data-info-act="report"><span class="ic">' + ICON.flag + '</span>举报</button>' +
      '</div>';
      html += '<div class="info-block"><div class="info-label">简介</div><div class="info-value">云上商铺官方会员群｜USDT 卡密 · 代充 · 礼品卡。下单请认准 @YunShangShangPuBot。</div></div>';
      html += '<div class="info-row" style="padding:10px 20px"><span class="k">群组类型</span><span>公开群</span></div>';
      html += '<div class="info-row" style="padding:10px 20px"><span class="k">链接</span><span class="info-value accent">t.me/yunshang_mall</span></div>';
      html += '<div class="info-row" style="padding:10px 20px"><span class="k">创建时间</span><span>2026年8月10日</span></div>';
      html += '<div class="info-block"><div class="info-label">管理员</div>';
      html += memberRow('mei', '管理员', '2026年8月10日加入') + memberRow('mallbot', '机器人', '2026年8月20日加入');
      html += '<div class="info-label" style="margin-top:12px">成员</div>' + memberRow('qiang', '', '2026年8月12日加入') + memberRow('lu', '', '2026年8月16日加入');
      html += '</div>';
      html += '<div class="info-note">提示：群组创建时间与服务消息中的日期可以对照；机器人加入时间晚于群组创建。</div>';
    } else {
      const p = profileOf(chat.profile) || { name: chat.title, avatar: chat.avatar, username: '', bio: '' };
      html += '<div class="info-head"><b style="font-size:15px">资料</b><button class="icon-btn info-close" data-info-close="1">' + ICON.close + '</button></div>';
      html += '<div class="info-profile">' + avatarHtml(p.avatar, 120) + '<div class="info-name">' + esc(p.name) + '</div><div class="info-sub">' + esc(p.username || '') + '</div></div>';
      html += '<div class="info-actions">' +
        '<button class="info-action" data-info-act="search"><span class="ic">' + ICON.search + '</span>搜索</button>' +
        '<button class="info-action" data-info-act="mute"><span class="ic">' + ICON.muted + '</span>静音</button>' +
        '<button class="info-action" data-info-act="report"><span class="ic">' + ICON.flag + '</span>举报</button>' +
      '</div>';
      if (p.bio) html += '<div class="info-block"><div class="info-label">简介</div><div class="info-value">' + esc(p.bio) + '</div></div>';
      html += '<div class="info-block">' +
        '<div class="info-row"><span class="k">账号类型</span><span>' + (p.type === 'bot' ? '机器人' : p.type === 'channel' ? '频道' : '普通用户') + '</span></div>' +
        (p.username ? '<div class="info-row"><span class="k">用户名</span><span class="info-value accent">' + esc(p.username) + '</span></div>' : '') +
        (p.joined && p.joined !== '—' ? '<div class="info-row"><span class="k">' + (p.type === 'channel' ? '创建' : '加入') + '</span><span>' + esc(p.joined) + '</span></div>' : '') +
        (p.common ? '<div class="info-row"><span class="k">共同群组</span><span>' + esc(p.common) + '</span></div>' : '') +
      '</div>';
      if (p.note) html += '<div class="info-note">' + esc(p.note) + '</div>';
    }
    panel.innerHTML = html;
    panel.querySelectorAll('[data-info-close]').forEach((b) => b.onclick = () => toggleInfo(false));
    panel.querySelectorAll('[data-info-act]').forEach((b) => b.onclick = () => {
      const act = b.dataset.infoAct;
      if (act === 'report') TG.reportDialog(chat);
      else TG.toast(act === 'mute' ? '已静音（仿真）' : '搜索仅在左侧搜索框可用');
    });
    panel.querySelectorAll('[data-profile]').forEach((b) => b.onclick = () => TG.showProfile(b.dataset.profile));
    TG.classroom && TG.classroom.onEvent('info', { chat: chat.id });
  }

  function memberRow(key, role, joined) {
    const p = profileOf(key);
    return '<div class="member-row" data-profile="' + key + '">' + avatarHtml(p.avatar, 34) +
      '<span class="mr-name">' + esc(p.name) + '</span>' +
      (role ? '<span class="mr-role">' + esc(role) + '</span>' : '') +
      '<span class="mr-age">' + esc(joined) + '</span></div>';
  }

  TG.showProfile = function (key) {
    const p = profileOf(key);
    if (!p) return;
    const chat = TG.state.chats.find((c) => c.profile === key);
    if (chat) {
      if (TG.state.active !== chat.id) TG.openChat(chat.id);
      renderInfo();
      toggleInfo(true);
    } else {
      TG.modal({
        title: p.name,
        body: '<div style="font-size:13px;line-height:1.8">用户名：<b>' + esc(p.username || '—') + '</b><br>' +
          (p.bio ? '简介：' + esc(p.bio) + '<br>' : '') +
          '账号类型：' + (p.type === 'bot' ? '机器人' : '普通用户') + '<br>' +
          (p.joined && p.joined !== '—' ? '加入：' + esc(p.joined) + '<br>' : '') +
          (p.note ? '<span style="color:var(--text-3)">' + esc(p.note) + '</span>' : '') + '</div>',
        buttons: [{ text: '关闭', close: true }]
      });
    }
    TG.classroom && TG.classroom.onEvent('profile', { key: key, chat: chat ? chat.id : null });
  };

  TG.reportDialog = function (chat) {
    TG.modal({
      title: '举报 ' + chat.title,
      body: '<div style="font-size:13.5px;line-height:1.7">请选择举报原因：<br><br>' +
        '<label style="display:block;padding:6px 0"><input type="radio" name="rp" checked> 诈骗或虚假信息</label>' +
        '<label style="display:block;padding:6px 0"><input type="radio" name="rp"> 冒充他人或机构</label>' +
        '<label style="display:block;padding:6px 0"><input type="radio" name="rp"> 垃圾信息</label></div>' +
        '<div style="font-size:12px;color:var(--text-3);margin-top:10px">这是仿真界面，不会真的提交给 Telegram。</div>',
      buttons: [{ text: '取消', close: true }, { text: '提交举报', primary: true, onClick: () => TG.toast('已记录（仿真）：举报不会真正发送') }]
    });
  };

  /* ---------------------------------------------------------------------
     打开会话 / 渲染总入口
     --------------------------------------------------------------------- */
  TG.openChat = function (id) {
    const chat = TG.chat(id);
    if (!chat) return;
    TG.state.active = id;
    chat.unread = 0;
    if (chat.hidden) chat.hidden = false;
    document.getElementById('app').classList.add('mobile-chat');
    renderAll();
    save();
    TG.classroom && TG.classroom.onOpenChat(id);
  };

  function renderAll() {
    renderSidebar();
    renderHeader();
    renderMessages();
    renderComposer();
    if (document.getElementById('app').classList.contains('info-open')) renderInfo();
  }
  TG.render = renderAll;

  /* ---------------------------------------------------------------------
     菜单 / 通用浮层
     --------------------------------------------------------------------- */
  function chatMenu(chat) {
    TG.modal({
      title: chat.title,
      body: '<div style="display:grid;gap:2px;margin:-6px -10px">' +
        menuItem('资料', 'info') + menuItem('静音', 'mute') + menuItem('举报', 'report') +
        '</div>',
      buttons: [{ text: '关闭', close: true }]
    });
    const root = document.getElementById('modalRoot');
    root.querySelectorAll('[data-menu-act]').forEach((b) => b.onclick = () => {
      const a = b.dataset.menuAct;
      TG.closeModal();
      if (a === 'info') toggleInfo(true);
      if (a === 'mute') { chat.muted = !chat.muted; renderComposer(); renderSidebar(); TG.toast(chat.muted ? '已静音' : '已取消静音'); save(); }
      if (a === 'report') TG.reportDialog(chat);
    });
  }
  function menuItem(label, act) {
    return '<button class="menu-item" data-menu-act="' + act + '" style="border:0;background:none;text-align:left;padding:11px 12px;border-radius:8px;font-size:14px">' + label + '</button>';
  }

  TG.toast = function (text, ms) {
    const root = document.getElementById('toastRoot');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .2s'; }, ms || 1800);
    setTimeout(() => el.remove(), (ms || 1800) + 220);
  };

  TG.modal = function (opts) {
    const root = document.getElementById('modalRoot');
    root.innerHTML = '<div class="modal-backdrop" data-backdrop="1"><div class="modal">' +
      (opts.title ? '<div class="modal-title">' + esc(opts.title) + '</div>' : '') +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      '<div class="modal-foot">' +
        (opts.buttons || [{ text: '关闭', close: true }]).map((b, i) =>
          '<button class="btn ' + (b.primary ? 'primary' : 'ghost') + '" data-modal-btn="' + i + '">' + esc(b.text) + '</button>').join('') +
      '</div></div></div>';
    const buttons = opts.buttons || [{ text: '关闭', close: true }];
    root.querySelectorAll('[data-modal-btn]').forEach((el, i) => {
      el.onclick = () => {
        const b = buttons[i];
        if (b.onClick) b.onClick();
        if (b.close !== false) TG.closeModal();
      };
    });
    const backdrop = root.querySelector('[data-backdrop]');
    if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) TG.closeModal(); };
  };

  TG.closeModal = function () { document.getElementById('modalRoot').innerHTML = ''; };

  TG.alert = function (title, body) {
    TG.modal({ title: title, body: '<div style="font-size:13.5px;line-height:1.7">' + body + '</div>', buttons: [{ text: '知道了', primary: true, close: true }] });
  };

  /* ---------------------------------------------------------------------
     事件绑定
     --------------------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    const chatBtn = e.target.closest('[data-chat]');
    if (chatBtn) { TG.openChat(chatBtn.dataset.chat); return; }

    const folderBtn = e.target.closest('[data-folder]');
    if (folderBtn) { TG.state.folder = folderBtn.dataset.folder; renderSidebar(); save(); return; }

    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      const msgId = actionBtn.dataset.msg;
      actionBtn.classList.add('loading');
      setTimeout(() => actionBtn.classList.remove('loading'), 620);
      TG.classroom && TG.classroom.onAction(action, { chat: TG.state.active, msg: msgId });
      const handled = TG.flows && TG.flows.run(action, { chat: TG.state.active, msg: msgId });
      if (!handled) TG.toast('该操作在仿真中没有实现');
      return;
    }

    const profileEl = e.target.closest('[data-profile]');
    if (profileEl) { TG.showProfile(profileEl.dataset.profile); return; }

    const infoEl = e.target.closest('[data-info]');
    if (infoEl) { toggleInfo(); return; }

    const msgAct = e.target.closest('[data-msg-act]');
    if (msgAct) {
      const act = msgAct.dataset.msgAct;
      if (act === 'copy') {
        const m = (TG.chat().messages || []).find((x) => x.id === msgAct.dataset.id);
        if (m) navigator.clipboard && navigator.clipboard.writeText(m.text || '').catch(() => {});
        TG.toast('已复制');
      } else if (act === 'reply') {
        TG.toast('回复：仿真中可直接在输入框输入');
      } else {
        TG.toast('转发：仿真中未开放');
      }
      return;
    }

    const ext = e.target.closest('[data-external]');
    if (ext) {
      e.preventDefault();
      TG.openBrowser({ url: ext.dataset.external, page: 'external' });
      return;
    }

    if (e.target.closest('[data-self]')) {
      TG.modal({
        title: '我的资料',
        body: '<div style="font-size:13.5px;line-height:1.8">昵称：<b>' + esc(D.me.name) + '</b><br>用户名：' + esc(D.me.username) +
          '<br>手机：' + esc(D.me.phone) + '<br><br><span style="color:var(--text-3);font-size:12px">这是仿真账号，不对应任何真实 Telegram 用户。</span></div>',
        buttons: [{ text: '关闭', close: true }]
      });
      return;
    }
  });

  document.getElementById('searchInput').addEventListener('input', renderSidebar);

  /* ---------------------------------------------------------------------
     启动
     --------------------------------------------------------------------- */
  TG.boot = function (mode, state) {
    TG.state = state || TG.newState(mode || 'blind');
    document.body.classList.toggle('theme-dark', TG.state.theme === 'dark');
    document.body.classList.toggle('theme-light', TG.state.theme !== 'dark');
    document.body.classList.toggle('teach-mode', TG.state.mode === 'teach');
    document.body.classList.toggle('anno-on', !!TG.state.settings.anno);
    document.getElementById('app').classList.toggle('info-open', !!TG.state.infoOpen);
    if (TG.state.settings.showFish) {
      const f = TG.chat('fish');
      if (f) f.hidden = false;
    }
    renderAll();
    const active = TG.chat();
    if (active) active.unread = 0;
    renderSidebar();
    TG.classroom && TG.classroom.boot(TG.state);
  };

  TG.renderAll = renderAll;
  TG.saveState = save;
  TG.renderSidebar = renderSidebar;
  TG.renderComposer = renderComposer;
  TG.renderHeader = renderHeader;
})(window);
