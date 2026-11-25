/* ==========================================================================
   仿真网页层：收银台 / 绑定钱包 / 验资 / 合约浏览 / 域名信息 / 钱包授权
   ========================================================================== */
(function (global) {
  'use strict';
  const TG = global.TG = global.TG || {};
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let browser = { url: '', host: '', path: '', page: '', params: {}, onClose: null, above: false };
  let countdownTimer = null;
  let progressTimer = null;

  const PAGES = {
    pay: { host: 'okpay-app.xyz', path: '/shop/pay?order=YS20260822-0731' },
    bind: { host: 'okpay-app.xyz', path: '/wallet/bind?uid=909021' },
    verify: { host: 'ys-shop-vip.top', path: '/verify?order=YS20260822-0731' },
    contract: { host: 'tronscan.org', path: '/#/contract/TQmFk8sV3nR2pXw9kLd4' },
    domain: { host: 'whois.domaintools.com', path: '/okpay-app.xyz' },
    external: { host: 't.me', path: '/blueblackwill' }
  };

  const CONTRACT = 'TQmFk8sV3nR2pXw9kLd4Yb7Hc5Nq2ZtAbX';
  const VICTIM = 'TXk9Qm2vR7pL4dN8sW3aB6cF1hJ5kM0zYR';
  const SPENDER = 'TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb';

  TG.WEB = { contract: CONTRACT, spender: SPENDER, victim: VICTIM, pages: PAGES };

  /* ---------------------------------------------------------------------
     打开 / 关闭
     --------------------------------------------------------------------- */
  TG.openBrowser = function (opts) {
    const el = document.getElementById('browser');
    browser = {
      url: opts.url || '',
      host: opts.host || (PAGES[opts.page] || {}).host || 'okpay-app.xyz',
      path: opts.path || '',
      page: opts.page || 'external',
      params: opts.params || {},
      onClose: opts.onClose || null,
      above: !!opts.above
    };
    if (!browser.path && PAGES[browser.page]) {
      browser.host = PAGES[browser.page].host;
      browser.path = PAGES[browser.page].path;
    }
    if (browser.page === 'pay' && browser.params.order) browser.path = '/shop/pay?order=' + browser.params.order;
    if (browser.page === 'verify' && browser.params.order) browser.path = '/verify?order=' + browser.params.order;
    document.getElementById('urlHost').textContent = browser.host;
    document.getElementById('urlPath').textContent = browser.path;
    document.getElementById('urlLock').classList.remove('warn');
    el.classList.toggle('above-wallet', browser.above);
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    renderPage();
    progress();
    TG.classroom && TG.classroom.onEvent('browser', { page: browser.page, host: browser.host, path: browser.path });
  };

  TG.closeBrowser = function () {
    const el = document.getElementById('browser');
    el.classList.remove('open');
    el.classList.remove('above-wallet');
    el.setAttribute('aria-hidden', 'true');
    clearInterval(countdownTimer);
    clearInterval(progressTimer);
    const cb = browser.onClose;
    browser.onClose = null;
    if (cb) setTimeout(cb, 220);
  };

  TG.browserInfo = function () { return Object.assign({}, browser); };

  TG.navigate = function (page, params) {
    const p = PAGES[page];
    if (!p) return;
    browser.page = page;
    browser.host = p.host;
    browser.path = p.path;
    browser.params = params || {};
    document.getElementById('urlHost').textContent = p.host;
    document.getElementById('urlPath').textContent = p.path;
    renderPage();
    progress();
  };

  function progress() {
    const bar = document.getElementById('browserProgress');
    clearInterval(progressTimer);
    bar.style.width = '0';
    bar.classList.remove('done');
    let w = 8;
    bar.style.width = w + '%';
    progressTimer = setInterval(() => {
      w += Math.random() * 26;
      if (w >= 92) { clearInterval(progressTimer); w = 92; }
      bar.style.width = w + '%';
    }, 120);
    setTimeout(() => {
      clearInterval(progressTimer);
      bar.style.width = '100%';
      setTimeout(() => bar.classList.add('done'), 260);
    }, 520);
  }

  function renderPage() {
    const body = document.getElementById('browserBody');
    body.classList.toggle('light', browser.page !== 'pay' && browser.page !== 'verify' && browser.page !== 'contract' && browser.page !== 'external');
    if (browser.page === 'pay') body.innerHTML = payPage();
    if (browser.page === 'bind') body.innerHTML = bindPage();
    if (browser.page === 'verify') body.innerHTML = verifyPage();
    if (browser.page === 'contract') body.innerHTML = contractPage();
    if (browser.page === 'domain') body.innerHTML = domainPage();
    if (browser.page === 'external') body.innerHTML = externalPage();
    bindPageEvents();
  }

  /* ---------------------------------------------------------------------
     收银台
     --------------------------------------------------------------------- */
  function payPage() {
    const paid = TG.state.flags.paid;
    const amt = browser.params.amount || '1.30';
    const oid = browser.params.order || 'YS20260822-0731';
    if (paid) {
      return '<div class="pay-page"><div class="pp-head">支付中心</div><div class="pay-success">' +
        '<div class="tick"><svg><use href="#i-check"/></svg></div>' +
        '<h3>支付成功</h3><p>订单 ' + esc(oid) + '<br>金额 ' + esc(amt) + ' USDT<br><br>正在通知商家发货，请返回 Telegram 联系客服完成提货。</p>' +
        '<button class="pay-connecting" data-web-close="1" style="width:auto;padding:0 28px;margin:0 auto">返回 Telegram</button>' +
      '</div></div>';
    }
    return '<div class="pay-page">' +
      '<div class="pp-head">支付中心</div>' +
      '<div class="pp-wrap">' +
        '<div class="pay-card">' +
          '<div class="pay-count"><span>支付倒计时</span><b id="payCount">04:54</b></div>' +
          '<div class="pay-amount-label">应付金额</div>' +
          '<div class="pay-amount" data-anno="⑥ 这是外部站点，不在 Telegram 内">' + esc(amt) + '<span>USDT</span></div>' +
        '</div>' +
        '<div id="payChannels">' +
          '<button class="pay-connecting" disabled id="connectBtn" style="opacity:.9">正在连接支付通道…</button>' +
        '</div>' +
        '<div class="pay-tip">请在 5 分钟内完成支付，超时订单将自动关闭。<br>支付遇到问题？<a href="#" data-web-support="1">联系在线客服</a></div>' +
      '</div>' +
    '</div>';
  }

  function startCountdown() {
    clearInterval(countdownTimer);
    let left = 294;
    const el = document.getElementById('payCount');
    if (!el) return;
    const tick = () => {
      if (!document.getElementById('payCount')) { clearInterval(countdownTimer); return; }
      left = Math.max(0, left - 1);
      const m = String(Math.floor(left / 60)).padStart(2, '0');
      const s = String(left % 60).padStart(2, '0');
      const node = document.getElementById('payCount');
      if (node) node.textContent = m + ':' + s;
      if (left === 0) clearInterval(countdownTimer);
    };
    countdownTimer = setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------------
     Okpay 绑定钱包
     --------------------------------------------------------------------- */
  function bindPage() {
    const done = TG.state.flags.approved;
    if (done) {
      return '<div class="bind-page">' +
        '<div class="bp-nav"><span class="logo">OK</span>Okpay 钱包</div>' +
        '<div class="bp-wrap"><div class="bp-title">钱包已绑定</div>' +
        '<div class="bp-sub">收款钱包验证通过。提现通道已开启，资金将在 24 小时内到账。</div>' +
        '<div class="bp-card"><div class="bp-row"><span>提现单号</span><b>WD20260822-8842</b></div>' +
        '<div class="bp-row"><span>提现金额</span><b>10,000.00 USDT</b></div>' +
        '<div class="bp-row"><span>收款地址</span><b>TXk9…M0zY</b></div>' +
        '<div class="bp-row"><span>状态</span><b style="color:#1f9d55">已激活</b></div></div>' +
        '<button class="bp-cta" data-web-close="1">返回 Telegram</button></div></div>';
    }
    return '<div class="bind-page">' +
      '<div class="bp-nav"><span class="logo">OK</span>Okpay 钱包</div>' +
      '<div class="bp-wrap">' +
        '<div class="bp-title">绑定收款钱包</div>' +
        '<div class="bp-sub">为保障您的提现地址安全和正确，请使用下方钱包完成验证。绑定成功后即可顺利到账。</div>' +
        '<div class="bp-card">' +
          '<div class="bp-row"><span>提现单号</span><b>WD20260822-8842</b></div>' +
          '<div class="bp-row"><span>提现金额</span><b>10,000.00 USDT</b></div>' +
          '<div class="bp-row"><span>收款网络</span><b>TRC20</b></div>' +
          '<div class="bp-row"><span>状态</span><b style="color:#e8730f">待绑定</b></div>' +
        '</div>' +
        '<div class="bp-wallets">' +
          walletIcon('imToken', '#2b6ce6', 'i') + walletIcon('TokenPocket', '#2f8de4', 'TP') +
          walletIcon('BitGet', '#12b886', 'B') + walletIcon('TronLink', '#e8412f', 'T') +
          walletIcon('OneKey', '#1f9d55', '1') + walletIcon('等待接入', '#b6bcc2', '+') +
        '</div>' +
        '<button class="bp-cta" id="bindConnect">连接钱包</button>' +
        '<div class="bp-warn">仅用于验证钱包归属，不会发起任何转账。</div>' +
      '</div>' +
    '</div>';
  }

  function walletIcon(name, color, letter) {
    return '<div class="bp-wallet"><span class="ico" style="background:' + color + '">' + letter + '</span>' + esc(name) + '</div>';
  }

  /* ---------------------------------------------------------------------
     验资
     --------------------------------------------------------------------- */
  function verifyPage() {
    if (TG.state.flags.verifyApproved) {
      return '<div class="verify-page"><div class="vp-head">云上商铺 · 验资通道</div>' +
        '<div class="vp-wrap"><div class="pay-success" style="padding-top:40px">' +
        '<div class="tick" style="background:rgba(61,220,132,.12);color:#3ddc84;margin:0 auto 16px"><svg><use href="#i-check"/></svg></div>' +
        '<h3>验资通过</h3><p>系统已在您的钱包中确认额度。<br>仓库正在安排发货，请返回 Telegram 查看客服消息。</p>' +
        '<button class="vp-cta" data-web-close="1" style="width:200px;margin:0 auto">返回 Telegram</button></div></div></div>';
    }
    const vOid = browser.params.order || 'YS20260822-0731';
    const vPaid = browser.params.amount || '1.30';
    return '<div class="verify-page">' +
      '<div class="vp-head">云上商铺 · 验资通道</div>' +
      '<div class="vp-wrap">' +
        '<span class="vp-badge">首次提货 · 1:1 验资</span>' +
        '<div class="vp-title">完成验资后立即发货</div>' +
        '<div class="vp-sub">订单 ' + esc(vOid) + ' 已支付。为确认账户资金通道正常，首次提货需完成 1:1 验资，验资款将在 3 分钟内原路退回。</div>' +
        '<div class="vp-card">' +
          '<div class="vp-row"><span>订单号</span><b>' + esc(vOid) + '</b></div>' +
          '<div class="vp-row"><span>商品</span><b>新人体验卡</b></div>' +
          '<div class="vp-row"><span>已付金额</span><b>' + esc(vPaid) + ' USDT</b></div>' +
          '<div class="vp-row"><span>验资额度</span><b class="big">1,000 USDT</b></div>' +
          '<div class="vp-row"><span>退回时间</span><b>3 分钟内</b></div>' +
        '</div>' +
        '<button class="vp-cta" id="verifyStart">开始验资</button>' +
        '<div class="vp-note">验资通过钱包额度确认完成，不产生实际转账。<br>如遇问题请联系专属客服 @youyu185。</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------------------------------------------------------------------
     合约与域名
     --------------------------------------------------------------------- */
  function contractPage() {
    return '<div class="scan-page">' +
      '<div class="sp-head"><span class="sp-logo"></span><b>TronScan</b><span style="margin-left:auto;font-size:12px;color:#7d8a96">TRON</span></div>' +
      '<div class="sp-wrap">' +
        '<h2>合约详情</h2>' +
        '<div class="sp-block">' +
          '<div class="sp-kv"><span>合约地址</span><b>' + CONTRACT + '</b></div>' +
          '<div class="sp-kv"><span>代币</span><b>USDT (TRC20)</b></div>' +
          '<div class="sp-kv"><span>创建时间</span><b class="bad">2026-08-20 14:32（2 天前）</b></div>' +
          '<div class="sp-kv"><span>创建者</span><b>' + SPENDER + '</b></div>' +
          '<div class="sp-kv"><span>是否开源</span><b class="bad">否</b></div>' +
          '<div class="sp-kv"><span>持有人</span><b>1</b></div>' +
          '<div class="sp-kv"><span>累计调用</span><b>37 次</b></div>' +
        '</div>' +
        '<div class="sp-block"><div class="sp-title">最近调用 · approve</div>' +
          '<div class="sp-code"># 37  2026-08-22 19:53:07\napprove(spender=' + SPENDER + ',\namount=115792089237316195423570985008687907853269984665640564039457584007913129639935)\nstatus: SUCCESS</div>' +
        '</div>' +
        '<div class="sp-block"><div class="sp-title">说明</div>' +
          '<div class="sp-kv"><span>权限类型</span><b class="bad">无限额度代币授权</b></div>' +
          '<div class="sp-kv"><span>可否转出</span><b class="bad">授权对象可转走该地址全部 USDT</b></div>' +
        '</div>' +
        '<div style="font-size:11.5px;color:#74818d;line-height:1.7">本页为课堂仿真，数据用于对照公开链上浏览器。真实核验请以链上交易哈希为准。</div>' +
      '</div>' +
    '</div>';
  }

  function domainPage() {
    return '<div class="scan-page" style="background:#f4f6f8;color:#1d2731">' +
      '<div class="sp-head" style="border-color:#e3e8ee"><span class="sp-logo" style="background:#2f6fed"></span><b style="color:#1d2731">WHOIS 查询</b></div>' +
      '<div class="sp-wrap">' +
        '<h2 style="color:#1d2731">okpay-app.xyz</h2>' +
        '<div class="sp-block" style="background:#fff;border-color:#e3e8ee">' +
          kvLight('注册时间', '2026-08-17（5 天前）') +
          kvLight('注册商', 'Namecheap, Inc.') +
          kvLight('到期时间', '2027-08-17') +
          kvLight('隐私保护', '已开启') +
          kvLight('解析 IP', '104.21.**.**（Cloudflare）') +
        '</div>' +
        '<div class="sp-block" style="background:#fff;border-color:#e3e8ee">' +
          '<div class="sp-title" style="color:#5c6874">与官方域名对比</div>' +
          kvLight('okpay.com 注册时间', '2019-06-11') +
          kvLight('是否同一注册人', '否') +
          kvLight('结论', 'okpay-app.xyz 是独立注册的新域名，与 okpay.com 无关联') +
        '</div>' +
        '<div style="font-size:11.5px;color:#7d8a96;line-height:1.7">课堂仿真页面。真实查询请使用 whois 工具或域名注册局信息。</div>' +
      '</div>' +
    '</div>';
  }
  function kvLight(k, v) {
    return '<div class="sp-kv" style="color:#6b7783"><span>' + esc(k) + '</span><b style="color:#1d2731">' + esc(v) + '</b></div>';
  }

  function externalPage() {
    return '<div style="min-height:100%;background:#17212b;color:#e9edf0;display:flex;align-items:center;justify-content:center;padding:30px">' +
      '<div style="max-width:420px;text-align:center">' +
        '<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#5c9e6d,#2f6b46);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:32px">❇</div>' +
        '<h2 style="margin:0 0 6px">大自然资产管理者❇️</h2>' +
        '<p style="color:#8fa0af;font-size:13.5px;line-height:1.7">12 847 位订阅者<br>t.me/blueblackwill</p>' +
        '<p style="color:#6f8090;font-size:12px;line-height:1.7;margin-top:18px">这是仿真页面。按 Esc 或点击左上角关闭返回 Telegram。</p>' +
      '</div></div>';
  }

  /* ---------------------------------------------------------------------
     页面事件
     --------------------------------------------------------------------- */
  function bindPageEvents() {
    const connect = document.getElementById('bindConnect');
    if (connect) connect.onclick = () => {
      TG.classroom && TG.classroom.onEvent('verify', { kind: 'opened-wallet-connect' });
      TG.openWallet({
        kind: 'connect',
        dapp: 'okpay-app.xyz',
        onConnect: () => {
          setTimeout(() => TG.openWallet({
            kind: 'approve',
            dapp: 'okpay-app.xyz',
            amount: '无限',
            unlimited: true,
            onApprove: () => TG.flows.run('web:approved'),
            onReject: () => TG.flows.run('web:rejected')
          }), 260);
        }
      });
    };
    const verifyStart = document.getElementById('verifyStart');
    if (verifyStart) verifyStart.onclick = () => {
      TG.classroom && TG.classroom.onEvent('verify', { kind: 'opened-verify' });
      TG.openWallet({
        kind: 'approve',
        dapp: 'ys-shop-vip.top',
        amount: '1,000',
        unlimited: false,
        onApprove: () => TG.flows.run('web:verifyApproved'),
        onReject: () => TG.flows.run('web:verifyRejected')
      });
    };
    const support = document.querySelector('[data-web-support]');
    if (support) support.onclick = (e) => { e.preventDefault(); TG.closeBrowser(); TG.openChat('kf'); };

    const chans = document.getElementById('connectBtn');
    if (chans && browser.page === 'pay') {
      setTimeout(() => {
        const holder = document.getElementById('payChannels');
        if (!holder || TG.state.flags.paid) return;
        holder.innerHTML =
          '<button class="pay-channel wechat" data-channel="微信支付"><span class="pc-ico">微</span>微信支付</button>' +
          '<button class="pay-channel alipay" data-channel="支付宝"><span class="pc-ico">支</span>支付宝</button>' +
          '<button class="pay-channel qq" data-channel="QQ钱包"><span class="pc-ico">Q</span>QQ钱包支付</button>';
        holder.querySelectorAll('[data-channel]').forEach((b) => b.onclick = () => openQr(b.dataset.channel));
      }, 1300);
      startCountdown();
    }

    const closeBtns = document.querySelectorAll('[data-web-close]');
    closeBtns.forEach((b) => b.onclick = () => TG.closeBrowser());
  }

  /* ---------------------------------------------------------------------
     二维码支付
     --------------------------------------------------------------------- */
  function qrSvg(seed) {
    const n = 25;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const cells = [];
    const finder = (x, y) => (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (finder(x, y)) continue;
        h = (h * 1103515245 + 12345) >>> 0;
        if ((h >>> 16) % 100 < 46) cells.push([x, y]);
      }
    }
    const rects = cells.map(([x, y]) => '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>').join('');
    const f = [[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y]) =>
      '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="none" stroke="#111" stroke-width="1"/>' +
      '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>').join('');
    return '<svg viewBox="0 0 ' + n + ' ' + n + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">' +
      '<rect width="' + n + '" height="' + n + '" fill="#fff"/><g fill="#111">' + rects + f + '</g></svg>';
  }

  function openQr(channel) {
    TG.classroom && TG.classroom.onEvent('pay-channel', { channel: channel });
    TG.modal({
      title: channel,
      body: '<div class="qr-wrap"><div class="qr">' + qrSvg('okpay' + channel) + '</div>' +
        '<div class="qr-meta"><b>' + esc(browser.params.amount || '1.30') + ' USDT</b>约 ¥9.42<br>订单号 ' + esc(browser.params.order || 'YS20260822-0731') + '<br>' +
        '<span style="font-size:12px;color:var(--text-3)">请使用' + esc(channel) + '扫一扫</span></div></div>' +
        '<div style="font-size:12px;color:var(--text-3);padding:0 22px;line-height:1.6">课堂仿真：二维码不指向任何真实收款账户，不会扣款。</div>',
      buttons: [
        { text: '取消', close: true },
        { text: '我已完成支付', primary: true, onClick: () => TG.flows.run('web:paid') }
      ]
    });
  }

  /* ---------------------------------------------------------------------
     钱包授权弹窗
     --------------------------------------------------------------------- */
  let walletOpts = null;
  TG.openWallet = function (opts) {
    walletOpts = opts || {};
    if (TG.split) TG.split.onWallet(walletOpts.kind, walletOpts.dapp);
    document.body.classList.toggle('teach-mode', !!(TG.state && TG.state.mode === 'teach'));
    const el = document.getElementById('walletSheet');
    const card = document.getElementById('walletCard');
    const isApprove = walletOpts.kind === 'approve';
    const amount = walletOpts.amount || '0';
    const raw = isApprove
      ? 'function approve(address spender, uint256 amount)\nspender: ' + SPENDER + '\namount: ' + (walletOpts.unlimited ? 'MAX_UINT256' : '1000000000') + '  // 1,000 USDT (6 decimals)'
      : 'connect()\npermissions: [view address, view balance]';
    card.innerHTML =
      '<div class="wallet-head"><span class="wallet-logo">TL</span><span class="wallet-name">TronLink</span>' +
        '<span class="wallet-net">TRON · TRC20</span></div>' +
      '<div class="wallet-dapp"><span class="dapp-ico">OK</span><span><span class="dapp-host">' + esc(walletOpts.dapp) + '</span>' +
        '<span class="dapp-sub">' + (isApprove ? '请求授权代币额度' : '请求连接钱包') + '</span></span></div>' +
      '<div class="wallet-body">' +
        '<div class="wallet-title">' + (isApprove ? '授权 USDT 额度' : '连接钱包') + '</div>' +
        '<div class="wallet-desc">' + (isApprove
          ? '授权后，该站点可在额度范围内转走你地址中的 USDT，无需再次确认。'
          : '连接后站点可以查看你的钱包地址与余额，并可发起交易请求。') + '</div>' +
        (isApprove
          ? '<div class="wallet-table">' +
              '<div class="wallet-tr"><span>代币</span><b>USDT (TRC20)</b></div>' +
              '<div class="wallet-tr"><span>授权对象</span><b class="mono">' + SPENDER + '</b></div>' +
              '<div class="wallet-tr"><span>授权额度</span><b class="red" data-anno="⑦ 这里是授权额度，不是付款金额">' + (walletOpts.unlimited ? '无限（2^256-1）' : esc(amount) + ' USDT') + '</b></div>' +
              '<div class="wallet-tr"><span>预计矿工费</span><b>27.5 TRX</b></div>' +
              '<div class="wallet-tr"><span>合约</span><b class="mono">' + CONTRACT + '</b></div>' +
            '</div>' +
            '<button class="wallet-link" id="walletRawToggle">查看原始请求' + TG_ICON_CHEVRON() + '</button>' +
            '<div class="wallet-raw" id="walletRaw">' + esc(raw) + '</div>' +
            '<button class="wallet-link" id="walletContract" style="margin-top:6px">在 TronScan 核验合约' + TG_ICON_EXT() + '</button>' +
            '<div class="wallet-scam-warning">课堂提示：这里签的是「授权额度」，不是付款。授权成功后，对方可在额度内转走你地址里的 USDT，而页面上不会出现扣款记录。</div>'
          : '<div class="wallet-perm"><span class="tick"><svg><use href="#i-check"/></svg></span><span>查看钱包地址</span></div>' +
            '<div class="wallet-perm"><span class="tick"><svg><use href="#i-check"/></svg></span><span>查看代币余额</span></div>' +
            '<div class="wallet-perm"><span class="tick"><svg><use href="#i-check"/></svg></span><span>请求签名（每次仍需你确认）</span></div>') +
      '</div>' +
      '<div class="wallet-foot">' +
        '<button class="btn reject" id="walletReject">拒绝</button>' +
        '<button class="btn approve" id="walletApprove">' + (isApprove ? '确认授权' : '连接') + '</button>' +
      '</div>' +
      '<div class="wallet-note">' + (isApprove ? '授权不是转账，但可能造成同样甚至更大的损失。' : '只连接你信任的站点。') + '</div>';
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');

    const rawToggle = document.getElementById('walletRawToggle');
    if (rawToggle) rawToggle.onclick = () => {
      const box = document.getElementById('walletRaw');
      box.classList.toggle('open');
      TG.classroom && TG.classroom.onEvent('verify', { kind: 'raw-request' });
    };
    const contractLink = document.getElementById('walletContract');
    if (contractLink) contractLink.onclick = () => {
      TG.classroom && TG.classroom.onEvent('verify', { kind: 'contract' });
      TG.closeWallet();
      TG.openBrowser({
        page: 'contract',
        above: true,
        onClose: () => { TG.openWallet(walletOpts); }
      });
    };
    document.getElementById('walletReject').onclick = () => {
      const o = walletOpts;
      TG.closeWallet();
      TG.classroom && TG.classroom.onEvent('reject', { kind: o.kind, dapp: o.dapp });
      if (o.onReject) o.onReject();
    };
    document.getElementById('walletApprove').onclick = () => {
      const btn = document.getElementById('walletApprove');
      btn.textContent = '处理中…';
      btn.disabled = true;
      const wait = walletOpts.kind === 'connect' ? 300 : 780;
      setTimeout(() => {
        const o = walletOpts;
        TG.closeWallet();
        TG.classroom && TG.classroom.onEvent('approve', { kind: o.kind, dapp: o.dapp, unlimited: !!o.unlimited, amount: o.amount });
        if (o.onApprove) o.onApprove();
        else if (o.kind === 'connect' && o.onConnect) o.onConnect();
      }, wait);
    };
  };

  function TG_ICON_CHEVRON() { return '<svg style="width:12px;height:12px"><use href="#i-chevron"/></svg>'; }
  function TG_ICON_EXT() { return '<svg style="width:12px;height:12px"><use href="#i-external"/></svg>'; }

  TG.closeWallet = function () {
    const el = document.getElementById('walletSheet');
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
  };

  /* ---------------------------------------------------------------------
     打开链接确认框（还原 Telegram 的「打开链接」）
     --------------------------------------------------------------------- */
  TG.confirmOpenLink = function (url, onOpen) {
    TG.modal({
      title: '打开链接',
      body: '<div style="font-size:14px;line-height:1.7">您确定要打开此链接？</div>' +
        '<div style="margin-top:10px;background:var(--hover);border-radius:8px;padding:9px 11px;font-size:12.5px;color:var(--text-2);word-break:break-all">' + esc(url) + '</div>' +
        '<div style="font-size:12px;color:var(--text-3);margin-top:9px">链接将在 Telegram 内置浏览器中打开。</div>',
      buttons: [
        { text: '取消', close: true },
        { text: '打开', primary: true, onClick: onOpen }
      ]
    });
  };

  /* ---------------------------------------------------------------------
     浏览器顶部控件
     --------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('browserClose').onclick = () => TG.closeBrowser();
    document.getElementById('urlReload').onclick = () => { renderPage(); progress(); };
    document.getElementById('browserMenu').onclick = () => TG.toast('仿真浏览器：仅支持返回 Telegram');
    document.getElementById('urlLock').onclick = () => {
      TG.classroom && TG.classroom.onEvent('verify', { kind: 'domain-lock' });
      const host = browser.host;
      const isScam = host === 'okpay-app.xyz' || host === 'ys-shop-vip.top';
      TG.modal({
        title: '连接信息',
        body: '<div style="font-size:13.5px;line-height:1.8">' +
          '<b>' + esc(host) + '</b><br>' +
          '连接：TLS 加密<br>证书颁发给：' + esc(host) + '<br>证书签发时间：2026-08-19（3 天前）<br>' +
          '证书有效期：90 天<br><br>' +
          (isScam ? '<span style="color:var(--text-3);font-size:12.5px">证书只说明连接是加密的，不代表网站属于官方。新注册域名 + 新证书是常见风险信号。</span><br><br>' : '') +
          '<button class="btn sm ghost" id="whoisBtn">查看域名注册信息</button>' +
        '</div>',
        buttons: [{ text: '关闭', close: true }]
      });
      const wb = document.getElementById('whoisBtn');
      if (wb) wb.onclick = () => {
        TG.closeModal();
        TG.closeBrowser();
        TG.openBrowser({ page: 'domain', above: true, onClose: () => {} });
        TG.classroom && TG.classroom.onEvent('verify', { kind: 'whois' });
      };
    };
  });

  /* 供流程层调用：支付成功 */
  TG.refreshBrowser = renderPage;

  TG.paySuccess = function () {
    TG.state.flags.paid = true;
    TG.saveState();
    if (browser.page === 'pay') renderPage();
    TG.toast('支付成功（仿真）');
  };
})(window);
