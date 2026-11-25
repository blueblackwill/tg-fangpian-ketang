/* ==========================================================================
   业务流程：商城订单 / Okpay 红包提现 / 钱包绑定 / 收银台 / 验资
   ========================================================================== */
(function (global) {
  'use strict';
  const TG = global.TG = global.TG || {};
  const D = global.TG.data;

  const F = () => TG.state.flags;

  function chatHas(chatId, fn) {
    const c = TG.chat(chatId);
    if (!c) return null;
    return c.messages.find(fn);
  }

  function updateOrderCards(status, extra) {
    ['group', 'mallbot'].forEach((id) => {
      const c = TG.chat(id);
      if (!c) return;
      c.messages.forEach((m) => {
        if (m.card === 'order' && (!extra || extra.id === m.order.id)) {
          m.order.status = status;
          if (status === '已支付') {
            m.buttons = [
              [{ text: '💬 联系客服', action: 'chat:kf' }],
              [{ text: '📦 查看订单', action: 'mall:orders' }]
            ];
          }
        }
      });
    });
    TG.render();
    TG.saveState();
  }

  function botSay(chatId, msg, delay) { return TG.botSay(chatId, msg, delay); }

  function ensureProduct(id) { return D.products.find((p) => p.id === id); }

  function orderId() {
    let max = 730;
    TG.state.chats.forEach((c) => c.messages.forEach((m) => {
      if (m.order && m.order.id) {
        const n = parseInt(String(m.order.id).split('-')[1], 10);
        if (n > max) max = n;
      }
    }));
    return 'YS20260822-' + String(max + 1).padStart(4, '0');
  }

  /* ---------------------------------------------------------------------
     商城
     --------------------------------------------------------------------- */
  function catalogButtons() {
    return D.products.map((p) => ([{ text: p.emoji + ' ' + p.name + ' · ' + p.price.toFixed(2) + 'U', action: 'mall:product:' + p.id }]))
      .concat([[
        { text: '📦 我的订单', action: 'mall:orders' },
        { text: '💬 联系客服', action: 'chat:kf' }
      ]]);
  }

  function catalogText() {
    return '🛍 云上商铺 · 全部商品\n\n' +
      D.products.map((p, i) => {
        const num = ['①', '②', '③', '④', '⑤', '⑥'][i] || (i + 1) + '.';
        return num + ' ' + p.emoji + ' ' + p.name + ' — ' + p.price.toFixed(2) + ' USDT' + (p.tag ? ' · ' + p.tag : '');
      }).join('\n') +
      '\n\n点下方按钮直接下单，机器人自动发货。';
  }

  function showCatalog() {
    const msg = {
      id: 'catalog', text: catalogText(), buttons: catalogButtons()
    };
    const existing = chatHas('mallbot', (m) => m.id === 'catalog');
    if (existing) TG.update('mallbot', 'catalog', msg);
    else TG.append('mallbot', Object.assign({ from: 'them', time: TG.nowTime() }, msg));
    if (TG.state.active === 'group') {
      TG.toast('正在打开云上商铺…');
      setTimeout(() => TG.openChat('mallbot'), 260);
    } else if (TG.state.active !== 'mallbot') {
      TG.openChat('mallbot');
    }
  }

  function productDetail(id) {
    const p = ensureProduct(id);
    if (!p) return;
    TG.append('mallbot', {
      from: 'them',
      text: p.emoji + ' ' + p.name + '\n\n💰 价格：' + p.price.toFixed(2) + ' USDT\n📦 库存：充足\n🚚 发货：付款后自动发货\n📝 ' + p.desc + '\n\n⚠️ 虚拟商品售出不退',
      buttons: [[{ text: '🛒 立即购买', action: 'mall:buy:' + id }], [{ text: '⬅️ 返回商品列表', action: 'mall:catalog' }]]
    });
    if (TG.state.active !== 'mallbot') TG.openChat('mallbot');
  }

  function createOrder(id) {
    const p = ensureProduct(id) || D.products[0];
    const oid = orderId();
    F().order = { id: oid, product: p.name, price: p.price.toFixed(2), status: '待支付', desc: p.desc };
    F().orderCreated = true;
    TG.append('mallbot', {
      from: 'them', card: 'order', order: F().order,
      buttons: [
        [{ text: '💳 立即支付', action: 'pay:open', webapp: true, anno: '⑥ 收银台在外部域名' }],
        [{ text: '⬅️ 返回商品列表', action: 'mall:catalog' }],
        [{ text: '💬 联系客服', action: 'chat:kf' }]
      ]
    });
    TG.botSay('mallbot', { text: '订单已创建，请在 5 分钟内完成支付。超时订单将自动关闭。' }, 500);
    TG.toast('订单已创建');
  }

  function showOrders() {
    const o = F().order;
    if (!o) {
      TG.append('mallbot', { from: 'them', text: '📦 我的订单\n\n暂无订单。' });
      return;
    }
    TG.append('mallbot', {
      from: 'them',
      text: '📦 我的订单\n\n订单号：' + o.id + '\n商品：' + o.product + '\n金额：' + o.price + ' USDT\n状态：' + o.status,
      buttons: o.status === '待支付'
        ? [[{ text: '💳 立即支付', action: 'pay:open', webapp: true }]]
        : [[{ text: '💬 联系客服', action: 'chat:kf' }]]
    });
  }

  /* ---------------------------------------------------------------------
     Okpay
     --------------------------------------------------------------------- */
  function claim() {
    if (F().claimed) { TG.toast('这张红包已经领过了'); return; }
    F().claimed = true;
    TG.append('okpay', {
      from: 'them', card: 'grant',
      grant: { amount: '10000', unit: 'USDT', memo: '尽情挥霍吧' },
      buttons: [
        [{ text: '🚀 启动机器人', action: 'okpay:robot' }],
        [{ text: '🎧 启动客服台', action: 'chat:kf' }]
      ]
    });
    // 余额卡同步
    const w = chatHas('okpay', (m) => m.card === 'wallet');
    if (w) { w.wallet.usdt = '10,000.00'; w.wallet.cny = '72,500.00'; }
    setTimeout(() => {
      TG.classroom && TG.classroom.hit('balance', { action: 'posted' });
      TG.append('okpay', {
        from: 'them',
        text: '💰 平台余额已更新\n\nUSDT：10,000.00\n状态：可提现\n\n如需提现，请点击下方按钮。',
        buttons: [
          [{ text: '💸 提币', action: 'okpay:withdraw' }],
          [{ text: '📊 账单', action: 'okpay:ledger' }]
        ]
      });
      TG.render();
    }, 650);
    TG.classroom && TG.classroom.hit('gift', { action: 'claim' });
    TG.toast('成功领取 10000 USDT（仿真）');
  }

  function askWithdraw() {
    if (F().withdrawAsked) { TG.openChat('okpay'); TG.toast('请直接回复提现金额'); return; }
    F().withdrawAsked = true;
    TG.append('okpay', {
      from: 'them',
      text: '请回复要提现的金额\n\n当前余额：' + (F().claimed ? '10,000.00' : '0.00') + ' USDT',
      buttons: [
        [{ text: '10000', action: 'okpay:amount:10000' }, { text: '5000', action: 'okpay:amount:5000' }],
        [{ text: '全部', action: 'okpay:amount:all' }]
      ]
    });
    TG.renderComposer();
    TG.classroom && TG.classroom.hit('withdraw', { action: 'ask' });
  }

  function submitWithdraw(amount, typed) {
    if (F().withdrawSubmitted) { TG.toast('提现申请已提交，请等待处理'); return; }
    F().withdrawSubmitted = true;
    F().withdrawAmount = amount;
    if (!typed) TG.append('okpay', { from: 'me', text: amount === 'all' ? '10000' : amount });
    const shown = amount === 'all' ? '10,000.00' : Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    TG.append('okpay', {
      from: 'them',
      text: '提现申请已受理\n\n单号：WD20260822-8842\n金额：' + shown + ' USDT\n预计到账：24 小时内\n\n⚠️ 检测到您的收款钱包尚未绑定，请先完成钱包认证。',
      buttons: [[{ text: '🔗 点击前往绑定', action: 'okpay:bind', webapp: true, anno: '③ 把「提现」改名成「绑定钱包」' }]]
    });
    TG.renderComposer();
    TG.classroom && TG.classroom.hit('withdraw', { action: 'submitted', amount: shown });
  }

  function showLedger() {
    TG.classroom && TG.classroom.verify('ledger');
    const claimed = F().claimed;
    TG.append('okpay', {
      from: 'them',
      text: '📊 账单明细\n\n' +
        '平台余额\n' + (claimed ? '+10,000.00 USDT　领取（站内）' : '0.00 USDT') + '\n' +
        '链上收款\n暂无记录\n\n' +
        '说明：平台余额是站内数字，提现需要绑定收款钱包后由平台打款。',
      buttons: [[{ text: '💸 提币', action: 'okpay:withdraw' }], [{ text: '🔗 绑定钱包', action: 'okpay:bind', webapp: true }]]
    });
    TG.toast('账单：没有链上入账记录');
  }

  function bindPage() {
    TG.confirmOpenLink('https://okpay-app.xyz/wallet/bind?uid=909021', () => {
      F().bindOpened = true;
      TG.openBrowser({ page: 'bind' });
      TG.classroom && TG.classroom.hit('approve', { action: 'open-bind', reached: true });
    });
  }

  function openPay(ctx) {
    const active = TG.chat(TG.state.active);
    const clicked = active && active.messages.find((m) => m.id === (ctx && ctx.msg));
    const o = (clicked && clicked.order) || F().order ||
      (TG.chat('group').messages.find((m) => m.card === 'order') || {}).order;
    if (o) F().order = o;
    TG.classroom && TG.classroom.hit('order', { action: 'pay', order: o && o.id });
    const amt = o ? o.price : '1.30';
    const oid = o ? o.id : 'YS20260822-0731';
    TG.confirmOpenLink('https://okpay-app.xyz/shop/pay?order=' + oid, () => {
      TG.openBrowser({ page: 'pay', params: { amount: amt, order: oid } });
      TG.classroom && TG.classroom.hit('link', { action: 'open-pay', host: 'okpay-app.xyz' });
    });
  }

  /* ---------------------------------------------------------------------
     支付回调
     --------------------------------------------------------------------- */
  function paid() {
    if (F().paid) { TG.toast('订单已支付'); return; }
    F().paid = true;
    const o = F().order;
    TG.paySuccess();
    TG.closeModal();
    updateOrderCards('已支付', { id: o ? o.id : null });
    TG.botSay('mallbot', {
      text: '✅ 支付成功\n\n订单号：' + (o ? o.id : 'YS20260822-0731') + '\n金额：' + (o ? o.price : '1.30') + ' USDT\n\n正在通知仓库配货。首次提货请联系专属客服完成验证。',
      buttons: [[{ text: '💬 联系客服', action: 'chat:kf' }], [{ text: '📦 查看订单', action: 'mall:orders' }]]
    }, 700);
    TG.botSay('kf', {
      text: '已确认您的付款 ✅\n\n订单 ' + (o ? o.id : 'YS20260822-0731') + ' 已进入配货队列。\n首次提货需要完成 1:1 验资，验资款会在 3 分钟内原路退回。',
      buttons: [[{ text: '🔗 开始验资', action: 'verify:open', webapp: true }]]
    }, 1500);
    F().verifyOffered = true;
    TG.classroom && TG.classroom.hit('pay', { action: 'paid' });
  }

  function bindApproved() {
    F().approved = true;
    TG.append('okpay', {
      from: 'them',
      text: '✅ 钱包认证成功\n\n提现通道已开启，10,000.00 USDT 将在 24 小时内到账。',
      buttons: [[{ text: '📊 查看提现进度', action: 'okpay:ledger' }]]
    });
    if (TG.refreshBrowser) TG.refreshBrowser();
    fishSay('🔔 新授权\n\n用户：阿伟\n用户地址：' + TG.WEB.victim + '\n授权对象：' + TG.WEB.spender + '\n代币：USDT (TRC20)\n额度：无限\n当前余额：0.00\n状态：监控中');
    TG.classroom && TG.classroom.hit('approve', { action: 'approved' });
    TG.toast('授权成功（仿真）：已向对方开放无限额度');
  }

  function bindRejected() {
    F().rejected = true;
    TG.closeBrowser();
    TG.append('okpay', { text: '您已取消钱包认证，本次提现未提交。', from: 'them' });
    TG.classroom && TG.classroom.hit('approve', { action: 'rejected', escaped: true });
    TG.toast('已拒绝授权');
  }

  function verifyOpen() {
    const vo = F().order;
    TG.confirmOpenLink('https://ys-shop-vip.top/verify?order=' + (vo ? vo.id : 'YS20260822-0731'), () => {
      F().verifyOpened = true;
      TG.openBrowser({ page: 'verify', params: { order: vo ? vo.id : 'YS20260822-0731', amount: vo ? vo.price : '1.30' } });
      TG.classroom && TG.classroom.hit('verify', { action: 'open', reached: true });
    });
  }

  function verifyApproved() {
    F().verifyApproved = true;
    if (TG.refreshBrowser) TG.refreshBrowser();
    TG.botSay('kf', {
      text: '✅ 验资通过\n\n仓库正在安排发货，预计 30 分钟内发出。请留意群内通知。'
    }, 600);
    TG.classroom && TG.classroom.hit('verify', { action: 'approved' });
    TG.toast('验资通过（仿真）');
  }

  function verifyRejected() {
    F().verifyRejected = true;
    TG.closeBrowser();
    TG.append('kf', { text: '您已取消验资。订单将为您保留 24 小时，超时自动关闭。', from: 'them' });
    TG.classroom && TG.classroom.hit('verify', { action: 'rejected', escaped: true });
    TG.toast('已拒绝验资授权');
  }

  /* ---------------------------------------------------------------------
     后台鱼苗
     --------------------------------------------------------------------- */
  function fishSay(text) {
    const fish = TG.chat('fish');
    if (!fish) return;
    if (TG.state.settings.showFish) fish.hidden = false;
    TG.append('fish', { from: 'them', text: text });
    if (!TG.state.settings.showFish) fish.hidden = true;
    TG.renderSidebar();
  }
  TG.fishSay = fishSay;

  function fastForward() {
    if (F().drained) { TG.toast('已经演示过资金归集'); return; }
    if (!F().approved && !F().verifyApproved) { TG.toast('先完成一次钱包授权，再看后台结果'); return; }
    F().drained = true;
    TG.append('okpay', {
      from: 'them', day: '2026年8月25日',
      text: '💰 余额变动通知\n\n+2,000.00 USDT\n网络：TRC20\n时间：2026-08-25 03:12\n状态：已到账'
    });
    setTimeout(() => {
      TG.append('okpay', {
        from: 'them',
        text: '❌ 提现失败\n\n原因：可用余额不足\n当前余额：0.00 USDT\n\n如有疑问请联系客服。'
      });
      fishSay('⚡ 命中余额\n\n用户地址：' + TG.WEB.victim + '\n检测到 +2,000.00 USDT\n授权对象：' + TG.WEB.spender + '\n授权额度：无限\n执行归集…');
      setTimeout(() => {
        fishSay('✅ 归集完成\n\n转出：2,000.00 USDT\n目标地址：TQmF…9k2\n剩余：0.00\n耗时：8 秒');
        TG.append('fish', { from: 'them', text: '📋 今日新增\n授权 38 · 归集 10 · 待观察 20' });
        const w = TG.chat('okpay').messages.find((m) => m.card === 'wallet');
        if (w) { w.wallet.usdt = '0.00'; w.wallet.cny = '0.00'; TG.render(); }
      }, 1400);
    }, 1200);
    TG.classroom && TG.classroom.hit('approve', { action: 'drained' });
    TG.toast('已模拟 3 天后：余额被自动划走');
  }

  /* ---------------------------------------------------------------------
     小按钮
     --------------------------------------------------------------------- */
  const SMALL = {
    'okpay:deposit': '充值通道维护中，请稍后再试。',
    'okpay:transfer': '请输入收款人 @用户名 或钱包地址。',
    'okpay:receive': '您的收款地址（TRC20）：' + TG.WEB.victim,
    'okpay:redpacket': '当前没有可领取的群红包。',
    'okpay:me': '昵称：阿伟\nID：90****21\n注册：2026-08-21\n实名：未认证',
    'okpay:lang': 'Language / 语言：简体中文（仿真）',
    'okpay:merchant': '商户入驻通道暂未开放。',
    'okpay:swap': '闪兑通道维护中。',
    'okpay:robot': '机器人已启动。请选择下方功能。'
  };

  /* ---------------------------------------------------------------------
     路由
     --------------------------------------------------------------------- */
  function run(action, ctx) {
    ctx = ctx || {};
    const parts = String(action || '').split(':');

    if (action === 'chat:group') { TG.openChat('group'); return true; }
    if (action === 'chat:kf') { TG.openChat('kf'); return true; }
    if (action === 'chat:okpay') { TG.openChat('okpay'); return true; }
    if (action === 'chat:mallbot') { TG.openChat('mallbot'); return true; }

    if (action === 'mall:catalog') { showCatalog(); return true; }
    if (action === 'mall:deal') {
      TG.append('mallbot', { from: 'them', text: '🔥 今日特价\n\n🎟️ 新人体验卡 — 1.30 USDT\n限量 50 份，每个账号限购 1 次。', buttons: [[{ text: '🛒 立即购买', action: 'mall:buy:p1' }]] });
      return true;
    }
    if (action === 'mall:orders') { showOrders(); return true; }
    if (parts[0] === 'mall' && parts[1] === 'product') { productDetail(parts[2]); return true; }
    if (parts[0] === 'mall' && parts[1] === 'buy') { createOrder(parts[2] || 'p1'); return true; }
    if (action === 'mall:contact') { TG.openChat('kf'); return true; }

    if (action === 'pay:open') { openPay(ctx); return true; }
    if (action === 'web:paid') { paid(); return true; }
    if (action === 'web:approved') { bindApproved(); return true; }
    if (action === 'web:rejected') { bindRejected(); return true; }
    if (action === 'web:verifyApproved') { verifyApproved(); return true; }
    if (action === 'web:verifyRejected') { verifyRejected(); return true; }

    if (action === 'okpay:claim') { claim(); return true; }
    if (action === 'okpay:withdraw') { askWithdraw(); return true; }
    if (parts[0] === 'okpay' && parts[1] === 'amount') {
      submitWithdraw(parts[2] || '10000', false);
      return true;
    }
    if (action === 'okpay:ledger') { showLedger(); return true; }
    if (action === 'okpay:bind') { bindPage(); return true; }
    if (action === 'verify:open') { verifyOpen(); return true; }
    if (SMALL[action]) {
      TG.append(TG.state.active, { from: 'them', text: SMALL[action] });
      return true;
    }
    return false;
  }

  TG.flows = {
    run: run,
    fastForward: fastForward,
    openPay: openPay,
    bindPage: bindPage,
    claim: claim,
    askWithdraw: askWithdraw,
    submitWithdraw: submitWithdraw,
    showLedger: showLedger,
    verifyOpen: verifyOpen,
    productDetail: productDetail,
    createOrder: createOrder,
    showCatalog: showCatalog,
    paid: paid
  };
})(window);
