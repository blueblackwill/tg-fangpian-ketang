/* ==========================================================================
   课堂层：8 个检查点 · 讲解条 · 显微镜 · 教师面板 · 复盘报告
   ========================================================================== */
(function (global) {
  'use strict';
  const TG = global.TG = global.TG || {};
  const C = TG.classroom = {};

  const LEVELS = [
    {
      key: 'gift', n: 1, title: '红包到账了吗', short: '红包',
      where: 'Okpay 对话 · 19:51',
      quote: '「转账给你 1.00 U」「请在24小时内领取」',
      actual: '这是一张消息卡片，不是交易。点「收款」后，10,000 USDT 由仿站页面写进余额，没有链上交易，也没有交易哈希。频道自己写的是：「鱼领取后提现发起授权」。',
      evidence: [
        { img: 'assets/evidence/okpay-transfer.png', cap: '#342 转账卡片（公开材料，已脱敏）' },
        { text: '频道 #341 置顶原话：「鱼领取后提现发起授权」。' }
      ],
      correct: '先在真实钱包或区块浏览器里找到对应 txid，再谈「到账」。消息卡片只能说明对方发了这句话。',
      verify: '打开「账单」，看链上收款有没有记录。',
      tags: ['E1 可见文字', 'E0 缺流水']
    },
    {
      key: 'balance', n: 2, title: '页面余额 10,000', short: '余额',
      where: 'Okpay 钱包 · 19:52',
      quote: '「💰 平台余额已更新 / USDT：10,000.00 / 状态：可提现」',
      actual: '余额是仿站自报的数字。账单里「平台余额 +10,000」和「链上收款 暂无记录」并排出现，说明它只是站内记账，不是钱包里的钱。',
      evidence: [
        { text: '仿真账单还原了关键对照：平台余额有数字，链上收款为空。' },
        { text: '真实材料缺独立余额与到账流水；页面数字不能替代资金凭证。' }
      ],
      correct: '把「页面余额」和「资金流水」分成两份记录。平台余额只能证明页面这样写。',
      verify: '点「账单」，对比平台余额与链上记录。',
      tags: ['页面数字', 'E0 缺流水']
    },
    {
      key: 'withdraw', n: 3, title: '提现改成了绑定钱包', short: '提现',
      where: 'Okpay 提现 · 19:53',
      quote: '「请回复要提现的金额」「检测到您的收款钱包尚未绑定」「点击前往绑定」',
      actual: '真正的提现只需要填地址，不需要「授权」。这里把提现拆成「绑定钱包 → 授权」，是从「领钱」转向「交出权限」的分界点。',
      evidence: [
        { img: 'assets/evidence/okpay-withdraw.png', cap: '#343 提现与绑定提示（公开材料，已脱敏）' },
        { text: '频道 #341 把提现与授权连在一起讲。' }
      ],
      correct: '看到「绑定 / 验证 / 验资 / 激活通道」先停一下，问：钱包接下来要我签的到底是什么？',
      verify: '在绑定页点地址栏的锁，查看域名与证书。',
      tags: ['流程改名', 'E0 缺钱包请求']
    },
    {
      key: 'approve', n: 4, title: '无限额度授权', short: '授权',
      where: '钱包授权弹窗 · 19:54',
      quote: '「授权 USDT 额度：无限」「授权后，该站点可在额度范围内转走你地址中的 USDT」',
      actual: '钱包里签的是 approve(spender, 2^256-1)，不是转账。授权成功后，对方可在额度内转走该地址的 USDT。地址里没钱时看起来「没损失」，等进钱再被划走。合约 2 天前创建、未开源、已调用 37 次。',
      evidence: [
        { text: '频道自述：#341「授权成功后后台收到通知」，#305/#316 讲关注余额、等进钱再处理。' },
        { text: 'TRON 的 approve 是代币额度接口，不是付款接口。' }
      ],
      correct: '拒绝无限额度；核对 spender、合约与额度；已经签过的，用 revoke 取消授权。',
      verify: '在钱包弹窗点「在 TronScan 核验合约」，看创建时间与开源状态。',
      tags: ['无限额度', '授权≠转账', '可撤销']
    },
    {
      key: 'order', n: 5, title: '订单是谁发的', short: '订单',
      where: '云上商铺群 · 19:47',
      quote: '「订单详情 / 商品 / 价格 $1.30 / 订单 ID / 状态：待支付」，署名 via @YunShangShangPuBot',
      actual: '订单卡由 @YunShangShangPuBot 生成，群管理员却是 @youyu185；机器人 8 月 20 日才入群，没有官方认证。订单看起来很正规，但「官方」只是群里的自称。',
      evidence: [
        { img: 'assets/evidence/shop-order.png', cap: '#297 00:39 订单与客服（公开材料，已脱敏）' },
        { text: '频道 #295/#296 的内联发单记录显示署名来自另一个账号。' }
      ],
      correct: '点开 via 后面的机器人、点开群资料，核对「谁在卖、谁在收款」，不要只看卡片排版。',
      verify: '点发送者名字或资料面板，看账号类型、用户名、加入时间。',
      tags: ['via 署名', '机器人无认证', 'E1']
    },
    {
      key: 'link', n: 6, title: '离开 Telegram 的收银台', short: '外链',
      where: '内置浏览器 · 19:55',
      quote: '「打开链接 / 您确定要打开此链接？」→ okpay-app.xyz/shop/pay',
      actual: '收银台不在 Telegram 里，而在 okpay-app.xyz。这个域名 5 天前才注册，与 okpay.com 不是同一注册人。Telegram 的「打开链接」确认框，本身就是在提示你：要离开聊天了。',
      evidence: [
        { img: 'assets/evidence/open-link.png', cap: '#297 02:27 打开链接确认框' },
        { text: '视频 00:54 的支付中心金额为 1.30 USDT。' }
      ],
      correct: '看域名、看注册时间、看证书签发时间；不在聊天里直接点「支付」。',
      verify: '点地址栏的锁，查看证书与域名注册信息。',
      tags: ['外部域名', '新注册', '证书≠合法']
    },
    {
      key: 'pay', n: 7, title: '1.30 USDT 的付款', short: '付款',
      where: '收银台 · 19:56',
      quote: '「支付中心 / 应付金额 1.30 USDT / 微信支付 / 支付宝 / QQ钱包」',
      actual: '这笔可能是真实付款，但它是引流：付款成功 ≠ 提货，更不等于验资通过。原始录像里只有订单和支付页，缺实际转账成功凭证。',
      evidence: [
        { img: 'assets/evidence/cashier.png', cap: '#297 00:54 支付中心（公开材料）' },
        { text: '第二段 02:34 出现 10.00 USDT 的支付中心，同样缺转账凭证。' }
      ],
      correct: '虚拟商品先验商家；把「付款记录」「订单状态」「授权记录」分成三件事。',
      verify: '没有可核验的收款方信息时，这单就不该付。',
      tags: ['小额引流', '付款≠提货', 'E0 缺凭证']
    },
    {
      key: 'verify', n: 8, title: '「验资」其实是再授权', short: '验资',
      where: '验资页 · 20:02',
      quote: '「首次提货需完成 1:1 验资 / 验资额度 1,000 USDT / 验资款会原路退回」',
      actual: '验资页要的是 1,000 USDT 的授权额度，不是转 1,000 USDT。付款是转账，授权是给权限；两笔记录类型完全不同。授权后对方仍可在额度内划走资金。',
      evidence: [
        { text: '频道 #341 把「提现授权」与「鱼苗后台」放在同一条流程里讲。' },
        { text: '原后台实现、实际签名、扣款与资金去向仍待核；本页只还原界面逻辑。' }
      ],
      correct: '任何「验资 / 激活 / 通道验证」要求授权额度的，直接退出。已授权的用 revoke 取消。',
      verify: '对比页面写「验资」、钱包写「授权额度」的差别。',
      tags: ['授权≠付款', '二次收割']
    }
  ];


  /* ---------------------------------------------------------------------
     每一关的技术原理（给教师/复盘用；不涉及可部署的攻击代码）
     --------------------------------------------------------------------- */
  const TECH = {
    gift: 'Telegram 侧：机器人用 sendMessage 发一条带 inline_keyboard 的消息。你点「收款」时，Telegram 只把 callback_query（含 data、from、message_id）交给机器人服务器，钱不会动。仿站服务器收到后，在自己的数据库或会话里把 balance 加 10000，再调用 editMessageText 把同一张卡改成「领取成功」。所以卡片与页面余额都只是机器人的数据库字段，没有链上交易，也没有 txid。',
    balance: '余额页读的是仿站的 user.balance 字段，不是 TRON 节点的 balanceOf。两套账本互不相通：仿站可以写 10,000，链上仍是 0。真正的到账要在区块浏览器按地址查 TRC20 的 Transfer 事件或 txid；仿站没有提供这些，反而用「平台余额」和「链上收款」两栏并排来制造可信感。',
    withdraw: '「提现」按钮调用仿站 API，服务端返回「需绑定钱包」并把页面跳到 /wallet/bind。真实的提现是交易所/钱包的签名转账或平台内部结算，不会要求 approve。这里把「提现」改名为「绑定」，是为了让下一步的钱包授权看起来像提现流程的一部分，而不是一次权限交割。',
    approve: '绑定页通过 WalletConnect、深链或内置浏览器调起钱包。dapp 构造 TRC20 的 approve(spender, amount) 交易；钱包把 to=USDT 合约、data=approve(...)、spender、amount 展示给你。你确认后，钱包用私钥签名并广播。链上只产生 Approval 事件，不转币，所以余额不变；之后 spender 调 transferFrom(你的地址, 收款地址, 额度) 才真正把 USDT 转走。',
    order: '订单卡是 inline bot 生成的消息：用户在群里 @bot 下单，Telegram 把结果以「via @bot」署名发到群里；bot 服务器保存 order_id、商品、金额、状态。卡片上的「官方」只是群昵称和话术，不是 Telegram 认证；via 的账号和群管理员可以是两个不同主体，这正是要核对的地方。',
    link: '「立即支付」是 url 按钮（群聊里 web_app 按钮不可用），Telegram 弹出「打开链接」确认后，在内置浏览器打开第三方域名。收银台是独立站点，不在 Telegram 内；域名、证书签发时间、WHOIS 注册时间才是可核对的线索，而不是页面上的「官方」两个字。',
    pay: '收银台是静态或半静态前端：订单号、金额从 URL 参数或后端读取；「正在连接支付通道…」只是 JS/CSS 动画；二维码指向聚合支付、个人收款码或链上地址。「支付成功」可以由前端直接改状态，也可以由真实回调触发；真实小额付款可能进入马甲账户，退款和追回都很难。',
    verify: '验资页再次调起钱包，构造第二笔 approve（额度 1,000 USDT 或另一个 spender）。它和前面的 1.30 USDT 付款是两种完全不同的交易：付款是 Transfer，授权是 Approval。所谓「验资款原路退回」在链上并没有对应退款；对方真正要的是这笔额度。'
  };


  /* ---------------------------------------------------------------------
     每一关的心理机制（课堂讲解用）
     --------------------------------------------------------------------- */
  const PSY = {
    gift: '这一关用的是「互惠 + 可变奖励 + 社会认同」：先给你一个可领取的提示，让你觉得欠对方一个动作；金额未知，点开才知道，形成小额赌博式的期待；群成员数、晒单、反应，让「大家都在领」变成背景事实。第一次点击本身不危险，危险的是它建立了「我已经参与」的承诺。',
    balance: '这一关用的是「禀赋效应 + 锚定 + 损失厌恶」：余额一显示在「我的账户」里，大脑就把它记成自己的钱；10,000 这个数字会成为锚，让后面的 1.30、1,000 都显得小；一旦想放弃提现，感觉不是「没赚到」，而是「损失了 10,000」。实际上它只是仿站数据库里的一个字段。',
    withdraw: '这一关用的是「承诺一致 + 沉没成本 + 权威解释 + 认知负荷」：你已经领了、输了金额，现在放弃会显得前后不一致；「为了资金安全/地址正确」把绑定说成正规流程；钱包、网络、地址这些术语让你倾向于跟着提示走。骗子把「领钱」切换成「给权限」，但让切换看起来只是提现的必要一步。',
    approve: '这一关用的是「权威界面 + 术语遮蔽 + 小步升级 + 紧迫 + 控制错觉」：钱包是你最信任的界面；approve、spender、allowance 这些词大多数人翻译不出「对方可以转走我的币」；连接（只读）→ 授权（可转走）是一小步一小步升级的；24 小时/倒计时压缩思考；「我可以随时 revoke」让你觉得风险可控。最危险的一秒，是你能看到「授权」两个字，却没有把它翻译成一句人话。',
    order: '这一关用的是「社会认同 + 权威 + 代价信号」：群里的人、管理员、晒单让「这家店」看起来真实；订单卡有商品、价格、订单号、状态，像一份正式交易；1.30 的真实付款是代价信号——「如果是骗局，为什么要真的收这么小的钱？」真实的小单让后面的大额验资显得只是流程。',
    link: '这一关用的是「信任转移 + 熟悉图标 + 视觉权威 + 默认效应」：支付中心、倒计时、微信/支付宝/QQ 的 logo 让你把「正规支付」的感觉转移到这个页面上；页面越像，越少人去看域名。Telegram 的「打开链接」确认框本来是一次提醒，但在「马上就能提现/发货」的情绪里，它容易被当成一个必须点掉的步骤。',
    pay: '这一关用的是「登门槛 + 沉没成本 + 互惠 + 官僚合法性」：先让你付一笔很小的真钱，付过之后你就成了「客户」，会按客户的逻辑等发货；订单号、客服、仓库、配货这些流程让交易显得正式；「验资款原路退回」是风险反转，让你觉得下一步只是暂时的。1.30 不是为了赚钱，是为了让你相信「这是一笔正常交易」。',
    verify: '这一关用的是「双重束缚 + 损失厌恶 + 风险反转 + 希望」：停下像损失，继续也可能损失；「1:1 验资、原路退回」把一次授权说成暂时的验证；已经付了 1.30、等了货，再验一次就能拿回——这是典型的沉没成本加希望。真正的破局不是算「还能拿回多少」，而是算「现在还能保住多少」。'
  };

  const VERIFY_MAP = {
    ledger: ['gift', 'balance'],
    'domain-lock': ['link', 'approve', 'withdraw'],
    whois: ['link', 'withdraw'],
    contract: ['approve', 'verify'],
    'raw-request': ['approve', 'verify'],
    'bot-profile': ['order'],
    'group-info': ['order']
  };

  const RISKY = {
    gift: ['claim'],
    balance: ['posted'],
    withdraw: ['submitted'],
    approve: ['approved'],
    order: ['pay'],
    link: ['open-pay'],
    pay: ['paid'],
    verify: ['approved']
  };

  let lastCheckpoint = null;
  let activeTab = 'actual';

  C.levels = LEVELS;

  function state() { return TG.state; }
  function lv(key) { return state().levels[key] || (state().levels[key] = { seen: false, actions: [], verifies: [] }); }
  function F() { return state().flags; }

  function now() { return Date.now(); }

  function timeLabel(ts) {
    const d = new Date(ts);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
  }

  function trace(entry) {
    if (!state().trace) state().trace = [];
    entry.t = now();
    entry.at = timeLabel(entry.t);
    state().trace.push(entry);
    if (state().trace.length > 300) state().trace.shift();
    TG.saveState();
  }

  /* ---------------------------------------------------------------------
     状态与事件
     --------------------------------------------------------------------- */
  C.hit = function (key, data) {
    const l = lv(key);
    l.seen = true;
    data = data || {};
    const action = data.action || 'seen';
    l.actions.push(action);
    if (data.reached && !l.reachedAt) l.reachedAt = now();
    if ((RISKY[key] || []).includes(action)) {
      if (!l.riskyAt) l.riskyAt = now();
      if (!data.escaped) {
        trace({ type: 'risk', level: key, label: LEVELS.find((x) => x.key === key).title, detail: action });
      }
    }
    if (data.escaped) {
      l.escaped = true;
      l.escapedAt = now();
      trace({ type: 'safe', level: key, label: LEVELS.find((x) => x.key === key).title, detail: '退出：' + action });
    }
    lastCheckpoint = key;
    if (state().mode === 'teach') showStrip(key);
    TG.saveState();
  };

  C.verify = function (kind) {
    const keys = VERIFY_MAP[kind] || [];
    keys.forEach((key) => {
      const l = lv(key);
      l.seen = true;
      if (!l.verifiedAt) l.verifiedAt = now();
      if (!l.verifies.includes(kind)) l.verifies.push(kind);
    });
    trace({ type: 'verify', level: keys[0], label: '核证', detail: kind });
    if (state().mode === 'teach' && keys.length) {
      lastCheckpoint = keys[0];
      showStrip(keys[0], '已记录核证：' + kindLabel(kind));
    }
    TG.saveState();
  };

  function kindLabel(kind) {
    return ({
      ledger: '查看账单', 'domain-lock': '查看连接信息', whois: '查询域名',
      contract: '核验合约', 'raw-request': '查看原始请求', 'bot-profile': '核对账号资料',
      'group-info': '查看群资料'
    })[kind] || kind;
  }

  C.onAction = function (action, ctx) {
    if (TG.split) TG.split.onAction(action, ctx);
    const map = {
      'okpay:claim': 'gift', 'okpay:withdraw': 'withdraw', 'okpay:bind': 'approve',
      'pay:open': 'order', 'verify:open': 'verify'
    };
    if (map[action]) lv(map[action]).seen = true;
    trace({ type: 'action', level: map[action], label: action, detail: (ctx && ctx.chat) || '' });
    TG.saveState();
  };

  C.onEvent = function (type, payload) {
    if (TG.split) TG.split.onEvent(type, payload);
    if (type === 'profile') {
      if (payload.key === 'mallbot' || payload.key === 'mei') C.verify('bot-profile');
      if (payload.key === 'mallbot') lv('order').seen = true;
    }
    if (type === 'info' && payload.chat === 'group') {
      C.verify('group-info');
    }
    if (type === 'verify') {
      C.verify(payload.kind);
    }
    if (type === 'reject') {
      const key = payload.kind === 'approve' ? (payload.dapp === 'ys-shop-vip.top' ? 'verify' : 'approve') : null;
      if (key) C.hit(key, { action: 'rejected', escaped: true });
    }
    if (type === 'approve') {
      trace({ type: 'approve', level: payload.kind, label: '钱包确认', detail: payload.dapp + ' · ' + payload.amount });
    }
    if (type === 'browser') {
      if (payload.page === 'pay') lv('link').seen = true;
      if (payload.page === 'bind') lv('approve').seen = true;
      if (payload.page === 'verify') lv('verify').seen = true;
    }
    if (type === 'pay-channel') {
      trace({ type: 'info', level: 'pay', label: '选择支付方式', detail: payload.channel });
    }
  };

  C.onMessage = function (chatId, msg) {
    if (msg.from === 'me') trace({ type: 'message', level: null, label: '发送消息', detail: (msg.text || '').slice(0, 40) });
  };

  C.onOpenChat = function (id) {
    if (TG.split) TG.split.onOpenChat(id);
    if (id === 'group') lv('order').seen = true;
    if (id === 'okpay') lv('gift').seen = true;
  };

  C.status = function (key) {
    const l = state().levels[key];
    if (!l || (!l.seen && !l.riskyAt && !l.verifiedAt)) return 'untouched';
    if (l.riskyAt && l.escaped) return 'risky';
    if (l.riskyAt && l.verifiedAt && l.verifiedAt < l.riskyAt) return 'aware';
    if (l.riskyAt) return 'trapped';
    if (l.reachedAt) return 'risky';
    if (l.verifiedAt) return 'verified';
    return 'untouched';
  };

  const STATUS_TEXT = { trapped: '被利用', risky: '危险但退出', aware: '核证后仍继续', verified: '已识破', untouched: '未触及' };
  const STATUS_PILL = { trapped: 'pill trapped', risky: 'pill risky', aware: 'pill risky', verified: 'pill verified', untouched: 'pill untouched' };

  /* ---------------------------------------------------------------------
     讲解条 + 显微镜
     --------------------------------------------------------------------- */
  function stripEl() {
    let el = document.getElementById('teachStrip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'teachStrip';
      el.className = 'teach-strip floating hidden';
      document.body.appendChild(el);
    }
    return el;
  }

  function showStrip(key, note) {
    if (state().mode !== 'teach') return;
    const level = LEVELS.find((l) => l.key === key);
    if (!level) return;
    const el = stripEl();
    const st = C.status(key);
    el.classList.remove('hidden');
    el.innerHTML = '<span class="ts-badge">检查点 ' + level.n + '/8</span>' +
      '<span class="ts-text"><b>' + level.title + '</b> · ' + (note || STATUS_TEXT[st]) + '</span>' +
      '<button class="ts-btn" id="tsOpen">看这一步</button>' +
      '<button class="ts-close" id="tsClose" aria-label="关闭">' + '<svg><use href="#i-close"/></svg>' + '</button>';
    document.getElementById('tsOpen').onclick = () => openMicroscope(key);
    document.getElementById('tsClose').onclick = () => el.classList.add('hidden');
  }

  function openMicroscope(key) {
    const level = LEVELS.find((l) => l.key === key);
    if (!level) return;
    let el = document.getElementById('microscope');
    if (!el) {
      el = document.createElement('div');
      el.id = 'microscope';
      el.className = 'microscope';
      document.body.appendChild(el);
    }
    el.classList.add('open');
    const strip = document.getElementById('teachStrip');
    if (strip) strip.classList.add('hidden');
    el.innerHTML = '<div class="ms-head"><span class="ms-k">' + level.n + '/8</span>' +
      '<span class="ms-title">' + level.title + '</span>' +
      '<button class="ts-close" id="msClose"><svg><use href="#i-close"/></svg></button></div>' +
      '<div class="ms-tabs">' +
        ['actual', 'quote', 'evidence', 'tech', 'psy', 'correct'].map((t) =>
          '<button class="ms-tab' + (t === activeTab ? ' active' : '') + '" data-ms-tab="' + t + '">' +
          ({ actual: '实际发生', quote: '界面说', evidence: '证据', tech: '技术原理', psy: '心理机制', correct: '怎么做' })[t] + '</button>').join('') +
      '</div><div class="ms-body" id="msBody"></div>' +
      '<div class="ms-foot"><a class="btn sm ghost" href="tech.html" target="_blank" rel="noopener">技术拆解</a>' +
      '<a class="btn sm ghost" href="心理机制拆解.md" target="_blank" rel="noopener">心理拆解</a>' +
      '<button class="btn sm ghost" id="msReview">复盘</button>' +
      '<button class="btn sm primary" id="msNext">' + (level.n < 8 ? '下一个' : '结束') + '</button></div>';
    document.getElementById('msClose').onclick = () => el.classList.remove('open');
    el.querySelectorAll('[data-ms-tab]').forEach((b) => b.onclick = () => {
      activeTab = b.dataset.msTab;
      el.querySelectorAll('[data-ms-tab]').forEach((x) => x.classList.toggle('active', x === b));
      renderMsBody(level);
    });
    document.getElementById('msReview').onclick = () => { el.classList.remove('open'); C.openReview(); };
    document.getElementById('msNext').onclick = () => {
      if (level.n < 8) { activeTab = 'actual'; openMicroscope(LEVELS[level.n].key); }
      else { el.classList.remove('open'); C.openReview(); }
    };
    renderMsBody(level);
  }

  function renderMsBody(level) {
    const body = document.getElementById('msBody');
    if (!body) return;
    let html = '';
    if (activeTab === 'actual') html = '<p>' + level.actual + '</p><div class="ms-quote">' + level.quote + '</div>';
    if (activeTab === 'quote') html = '<p>界面上你能看到的原文：</p><div class="ms-quote">' + level.quote + '</div><p style="color:var(--text-3);font-size:12px">页面文字只是页面文字，不等于资金动作。</p>';
    if (activeTab === 'evidence') {
      html = level.evidence.map((e) => {
        if (e.img) return '<div class="ms-evidence"><img src="' + e.img + '" alt=""><div><b>' + e.cap + '</b></div></div>';
        return '<p>• ' + e.text + '</p>';
      }).join('');
    }
    if (activeTab === 'tech') html = '<p>' + (TECH[level.key] || '') + '</p><p style="color:var(--text-3);font-size:12px">本页只解释机制，不提供可用于真实诈骗的代码；复现只在本地仿真或测试网进行。</p>';
    if (activeTab === 'psy') html = '<p>' + (PSY[level.key] || '') + '</p><p style="color:var(--text-3);font-size:12px">心理分析是推断，不是对受害者的诊断；完整拆解见 <a href="心理机制拆解.md" target="_blank" rel="noopener">心理机制拆解.md</a>。</p>';
    if (activeTab === 'correct') html = '<p>' + level.correct + '</p><p style="color:var(--text-2)"><b>核证动作：</b>' + level.verify + '</p>';
    body.innerHTML = html;
  }

  /* ---------------------------------------------------------------------
     教师面板
     --------------------------------------------------------------------- */

  let labTimer = null;

  function labCounts() {
    const c = { trapped: 0, risky: 0, aware: 0, verified: 0, untouched: 0 };
    LEVELS.forEach((l) => { c[C.status(l.key)] += 1; });
    return c;
  }

  function labElapsed() {
    if (!state() || !state().createdAt) return '0:00';
    const sec = Math.max(0, Math.floor((Date.now() - state().createdAt) / 1000));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function statsHtml() {
    const c = labCounts();
    const s = state();
    const chat = TG.chat();
    return '<div class="tp-stat"><b>' + labElapsed() + '</b><span>用时</span></div>' +
      '<div class="tp-stat"><b>' + (s.trace || []).length + '</b><span>操作记录</span></div>' +
      '<div class="tp-stat"><b>' + c.trapped + ' / ' + (c.risky + c.aware) + '</b><span>被利用 / 危险</span></div>' +
      '<div class="tp-stat"><b>' + (chat ? escText(chat.title) : '—') + '</b><span>当前会话</span></div>';
  }

  function startLabTimer() {
    if (labTimer) clearInterval(labTimer);
    const tick = () => {
      const el = document.getElementById('tpStats');
      if (!el) { clearInterval(labTimer); labTimer = null; return; }
      el.innerHTML = statsHtml();
    };
    labTimer = setInterval(tick, 1000);
  }

  C.labStats = function () {
    return { mode: state().mode, elapsed: labElapsed(), trace: (state().trace || []).length, counts: labCounts() };
  };

  function download(name, text, type) {
    const blob = new Blob([text], { type: type || 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  C.exportJSON = function () {
    const data = {
      exportedAt: new Date().toISOString(),
      simulation: true,
      note: '纸舟课堂本地仿真；无真实账号、钱包、资金或网络请求。',
      summary: C.labStats(),
      levels: state().levels,
      trace: state().trace
    };
    download('telegram-drill-' + Date.now() + '.json', JSON.stringify(data, null, 2), 'application/json');
    TG.toast('已导出 JSON');
  };

  C.exportCSV = function () {
    const rows = [['at', 'type', 'level', 'label', 'detail']];
    (state().trace || []).forEach((e) => {
      rows.push([e.at || '', e.type || '', e.level || '', e.label || '', String(e.detail || '').replace(/"/g, '""')]);
    });
    const csv = '\ufeff' + rows.map((r) => r.map((x) => '"' + String(x) + '"').join(',')).join('\n');
    download('telegram-drill-' + Date.now() + '.csv', csv, 'text/csv');
    TG.toast('已导出 CSV');
  };

  C.openPanel = function () {
    const ov = document.getElementById('teacherPanel');
    const s = state();
    const rows = LEVELS.map((l) => {
      const st = C.status(l.key);
      const cls = st === 'trapped' ? ' trapped' : (st === 'verified' ? ' done' : '');
      return '<button class="tp-level' + cls + '" data-jump="' + l.n + '"><span class="n">' + l.n + '</span><span class="t">' + l.title + '</span></button>';
    }).join('');
    ov.innerHTML = '<div class="teacher-panel" role="dialog" aria-label="教师控制台">' +
      '<div class="tp-head"><span class="tp-logo"><svg><use href="#i-paperboat"/></svg></span><h2>教师控制台</h2>' +
      '<button class="icon-btn tp-close" id="tpClose"><svg><use href="#i-close"/></svg></button></div>' +
      '<div class="tp-sec"><h3>课堂模式</h3>' +
        '<div class="tp-row"><div>讲解模式<div class="tp-desc">显示检查点与显微镜；关闭后是学生盲测视角</div></div>' +
        '<button class="tp-switch' + (s.mode === 'teach' ? ' on' : '') + '" id="swTeach"></button></div>' +
        '<div class="tp-row"><div>证据标注<div class="tp-desc">在可疑位置标出编号提示</div></div>' +
        '<button class="tp-switch' + (s.settings.anno ? ' on' : '') + '" id="swAnno"></button></div>' +
        '<div class="tp-row"><div>后台视角（鱼苗通知）<div class="tp-desc">显示操作者一端收到的授权与归集消息</div></div>' +
        '<button class="tp-switch' + (s.settings.showFish ? ' on' : '') + '" id="swFish"></button></div>' +
        '<div class="tp-row"><div>深色主题</div><button class="tp-switch' + (document.body.classList.contains('theme-dark') ? ' on' : '') + '" id="swTheme"></button></div>' +
      '</div>' +
      '<div class="tp-sec"><h3>跳到检查点</h3><div class="tp-levels">' + rows + '</div>' +
        '<div class="tp-note" style="margin-top:10px">跳转只改变本地场景，不会替学生做选择。适合课前预演或分段讲解。</div></div>' +
      '<div class="tp-sec"><h3>受控测试台</h3>' +
        '<div class="tp-stats" id="tpStats">' + statsHtml() + '</div>' +
        '<div class="tp-actions">' +
          '<button class="btn ghost" id="labGift">红包线</button>' +
          '<button class="btn ghost" id="labMall">商城线</button>' +
          '<button class="btn ghost" id="labJson">导出 JSON</button>' +
          '<button class="btn ghost" id="labCsv">导出 CSV</button>' +
        '</div>' +
        '<div class="tp-note" style="margin-top:8px">记录只在本机：点击、检查点、耗时、结果。没有网络请求，没有真实账号、钱包或资金。测试前请让被测者知道这是仿真。</div>' +
      '</div>' +
      '<div class="tp-sec"><h3>课堂操作</h3><div class="tp-actions">' +
        '<button class="btn ghost" id="tpFast">快进 3 天后</button>' +
        '<button class="btn primary" id="tpReview">结束并复盘</button>' +
        '<button class="btn ghost" id="tpReset">重新开始</button>' +
        '<button class="btn ghost" id="tpPrint">打印复盘</button>' +
        '<a class="btn ghost" href="tech.html" target="_blank" rel="noopener">技术原理</a>' +
        '<a class="btn ghost" href="心理机制拆解.md" target="_blank" rel="noopener">心理机制</a>' +
        '<a class="btn ghost" href="walk.html" target="_blank" rel="noopener">逐页讲解</a>' +
      '</div></div>' +
      '<div class="tp-foot">快捷键：T 控制台 · R 复盘 · A 标注 · D 主题 · Esc 关闭。<br>' +
      '全部流程在本机运行，没有真实账号、真实群组或真实资金。</div>' +
    '</div>';
    ov.classList.add('open');
    document.getElementById('tpClose').onclick = C.closePanel;
    ov.onclick = (e) => { if (e.target === ov) C.closePanel(); };

    const swTeach = document.getElementById('swTeach');
    swTeach.onclick = () => { C.setMode(s.mode === 'teach' ? 'blind' : 'teach'); C.openPanel(); };
    document.getElementById('swAnno').onclick = () => {
      s.settings.anno = !s.settings.anno;
      document.body.classList.toggle('anno-on', s.settings.anno);
      TG.saveState(); C.openPanel();
    };
    document.getElementById('swFish').onclick = () => {
      s.settings.showFish = !s.settings.showFish;
      const fish = TG.chat('fish');
      if (fish) fish.hidden = !s.settings.showFish;
      TG.renderSidebar(); TG.saveState(); C.openPanel();
      if (s.settings.showFish) TG.openChat('fish');
    };
    document.getElementById('swTheme').onclick = () => {
      const dark = !document.body.classList.contains('theme-dark');
      document.body.classList.toggle('theme-dark', dark);
      document.body.classList.toggle('theme-light', !dark);
      s.theme = dark ? 'dark' : 'light';
      TG.saveState(); C.openPanel();
    };
    ov.querySelectorAll('[data-jump]').forEach((b) => b.onclick = () => {
      C.closePanel();
      C.jumpTo(parseInt(b.dataset.jump, 10));
    });
    document.getElementById('tpFast').onclick = () => { C.closePanel(); TG.flows.fastForward(); };
    document.getElementById('tpReview').onclick = () => { C.closePanel(); C.openReview(); };
    document.getElementById('tpReset').onclick = () => {
      TG.modal({
        title: '重新开始？',
        body: '当前操作记录会被清空，回到第一次打开的状态。',
        buttons: [
          { text: '取消', close: true },
          { text: '重新开始', primary: true, onClick: () => {
            const mode = state().mode;
            C.closePanel();
            TG.reset(mode);
            C.boot(TG.state);
          } }
        ]
      });
    };
    document.getElementById('tpPrint').onclick = () => { C.closePanel(); C.openReview(); setTimeout(() => window.print(), 400); };
    document.getElementById('labGift').onclick = () => { C.closePanel(); C.jumpTo(1); };
    document.getElementById('labMall').onclick = () => { C.closePanel(); C.jumpTo(5); };
    document.getElementById('labJson').onclick = () => C.exportJSON();
    document.getElementById('labCsv').onclick = () => C.exportCSV();
    startLabTimer();
  };

  C.closePanel = function () {
    document.getElementById('teacherPanel').classList.remove('open');
    if (labTimer) { clearInterval(labTimer); labTimer = null; }
  };

  C.setMode = function (mode) {
    state().mode = mode;
    document.body.classList.toggle('teach-mode', mode === 'teach');
    if (mode === 'teach') {
      const hidden = LEVELS.find((l) => C.status(l.key) !== 'untouched');
      if (hidden) showStrip(hidden.key);
    } else {
      const strip = document.getElementById('teachStrip');
      if (strip) strip.classList.add('hidden');
      const ms = document.getElementById('microscope');
      if (ms) ms.classList.remove('open');
    }
    TG.saveState();
  };

  /* ---------------------------------------------------------------------
     场景跳转
     --------------------------------------------------------------------- */
  C.jumpTo = function (n) {
    const f = F();
    const openOkpay = () => { TG.openChat('okpay'); };
    if (n === 1) {
      openOkpay();
      lastCheckpoint = 'gift';
      if (state().mode === 'teach') showStrip('gift');
      return;
    }
    if (n === 2) {
      if (!f.claimed) TG.flows.claim();
      setTimeout(() => { openOkpay(); lastCheckpoint = 'balance'; if (state().mode === 'teach') showStrip('balance'); }, 900);
      return;
    }
    if (n === 3) {
      if (!f.claimed) TG.flows.claim();
      setTimeout(() => { openOkpay(); TG.flows.askWithdraw(); }, 850);
      return;
    }
    if (n === 4) {
      if (!f.claimed) TG.flows.claim();
      f.withdrawAsked = true; f.withdrawSubmitted = true;
      setTimeout(() => {
        openOkpay();
        f.bindOpened = true;
        TG.openBrowser({ page: 'bind' });
        lastCheckpoint = 'approve'; if (state().mode === 'teach') showStrip('approve');
      }, 900);
      return;
    }
    if (n === 5) {
      TG.openChat('group');
      setTimeout(() => {
        const node = document.querySelector('[data-msg="g10"]');
        if (node) { node.scrollIntoView({ block: 'center' }); node.classList.add('flash'); setTimeout(() => node.classList.remove('flash'), 1400); }
      }, 250);
      lastCheckpoint = 'order'; if (state().mode === 'teach') showStrip('order');
      return;
    }
    if (n === 6) {
      TG.openBrowser({ page: 'pay' });
      lastCheckpoint = 'link'; if (state().mode === 'teach') showStrip('link');
      return;
    }
    if (n === 7) {
      TG.openBrowser({ page: 'pay' });
      setTimeout(() => {
        const btn = document.getElementById('connectBtn');
        if (btn) btn.click();
      }, 1600);
      lastCheckpoint = 'pay'; if (state().mode === 'teach') showStrip('pay');
      return;
    }
    if (n === 8) {
      f.verifyOpened = true;
      TG.openBrowser({ page: 'verify' });
      lastCheckpoint = 'verify'; if (state().mode === 'teach') showStrip('verify');
      return;
    }
  };

  /* ---------------------------------------------------------------------
     复盘
     --------------------------------------------------------------------- */
  C.openReview = function () {
    const ov = document.getElementById('review');
    ov.classList.add('open');
    ov.innerHTML = reviewHtml();
    document.getElementById('rvClose').onclick = () => { ov.classList.remove('open'); };
    document.getElementById('rvPrint').onclick = () => window.print();
    document.getElementById('rvRestart').onclick = () => {
      const mode = state().mode;
      ov.classList.remove('open');
      TG.reset(mode);
      C.boot(TG.state);
    };
    ov.scrollTop = 0;
    trace({ type: 'review', level: null, label: '打开复盘', detail: '' });
  };

  function statCounts() {
    const c = { trapped: 0, risky: 0, aware: 0, verified: 0, untouched: 0 };
    LEVELS.forEach((l) => { c[C.status(l.key)] += 1; });
    return c;
  }

  function reviewHtml() {
    const c = statCounts();
    const s = state();
    const generated = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const trapped = c.trapped;
    const bad = c.trapped + c.aware;
    const verdict = (bad === 0 && c.verified === 0)
      ? { t: '还没有走完任何检查点。', s: '先让学生自己操作，再打开这份报告；没有操作记录时，这里不会替他们下结论。', stamp: '未开始' }
      : bad === 0
      ? { t: '这次演练，骗子的剧本没有走通。', s: '每个关键环节都留下了核证记录。把同样的动作带到真实账号上，先查流水、再谈提现。', stamp: '稳' }
      : bad <= 2
        ? { t: '关键的一步停住了，但仍有环节被带走。', s: '有几处按钮点下去之前，还没有核对「谁在要钱、要的是付款还是权限」。复盘时重点看标红的检查点。', stamp: '复习' }
        : { t: '高风险：几乎按骗子的剧本走完了。', s: '从红包到授权，每一步都符合真实案例的节奏。好消息是这是仿真——把 8 个检查点的正确动作重做一遍。', stamp: '高危' };
    if (TG.state.flags.approved) {
      verdict.s += ' 本次演练签出了无限额度的 USDT 授权。';
    }

    const cards = LEVELS.map((l) => {
      const st = C.status(l.key);
      const lvState = s.levels[l.key] || {};
      const ev = l.evidence.map((e) => e.img
        ? '<figure><img src="' + e.img + '" alt=""><figcaption>' + e.cap + '</figcaption></figure>'
        : '').join('');
      return '<div class="rv-card">' +
        '<div class="rv-card-head"><span class="idx">' + l.n + '</span><span class="name">' + l.title + '</span>' +
        '<span class="' + STATUS_PILL[st] + '">' + STATUS_TEXT[st] + '</span></div>' +
        '<div class="rv-card-body">' +
          '<div class="rv-narr">' +
            '<div class="lbl">界面说</div><div class="rv-quote">' + l.quote + '</div>' +
            '<div class="lbl">实际发生</div><p>' + l.actual + '</p>' +
            '<div class="lbl">正确做法</div><p>' + l.correct + '</p>' +
          '</div>' +
          '<div class="rv-side">' +
            '<div class="lbl">你的操作</div><div class="val">' +
              (lvState.riskyAt ? '走到了「' + (l.short) + '」这一步' : '没有继续操作') +
              (lvState.escaped ? '，随后退出' : '') +
              (st === 'aware' ? '<br><b>核证后仍继续操作</b>' : '') +
              (lvState.verifiedAt ? '<br>核证：' + lvState.verifies.map(kindLabel).join('、') : '<br>没有留下核证记录') +
            '</div>' +
            '<div class="lbl">证据</div><div class="val">' + l.evidence.filter((e) => e.text).map((e) => '• ' + e.text).join('<br>') + '</div>' +
            (ev ? '<div class="rv-evidence">' + ev + '</div>' : '') +
            '<div class="rv-tags" style="margin-top:10px">' + l.tags.map((t) => '<span class="rv-tag ' + (t.indexOf('E0') === 0 ? 'e0' : t.indexOf('E1') === 0 ? 'e1' : '') + '">' + t + '</span>').join('') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const tl = (s.trace || []).filter((e) => e.type !== 'review').slice(-40).map((e) => {
      const cls = e.type === 'risk' ? 'risk' : (e.type === 'safe' || e.type === 'verify') ? 'safe' : '';
      const label = e.level ? (LEVELS.find((l) => l.key === e.level) || {}).title : '';
      return '<div class="rv-tl-row ' + cls + '"><span class="tm">' + e.at + '</span><span class="dot2"></span>' +
        '<span class="tx">' + escText(actLabel(e)) + (label ? ' · ' + label : '') + '</span>' +
        '<span class="lv">' + (e.type === 'risk' ? '风险操作' : e.type === 'verify' ? '核证' : e.type === 'safe' ? '退出' : '') + '</span></div>';
    }).join('') || '<div class="rv-empty">还没有操作记录。</div>';

    return '<div class="rv-bar">' +
      '<span class="rv-brand"><span class="boat"><svg><use href="#i-paperboat"/></svg></span>纸舟课堂 · 演练复盘</span>' +
      '<span class="rv-spacer"></span><span class="rv-meta">案例 2026-08-22 · 生成 ' + generated + '</span>' +
      '<button class="btn sm ghost" id="rvPrint">打印 / 存 PDF</button>' +
      '<button class="btn sm ghost" id="rvRestart">重新演练</button>' +
      '<button class="btn sm primary" id="rvClose">返回聊天</button>' +
    '</div>' +
    '<div class="rv-wrap">' +
      '<div class="rv-kicker">Telegram 社群骗局 · 操作复盘</div>' +
      '<h1 class="rv-title">从一条红包消息<br>到一次无限授权</h1>' +
      '<p class="rv-sub">这份报告只记录你在仿真里的点击与核证，不对应任何真实账号或资金。案例结构依据 2026 年 8 月频道「大自然资产管理者❇️」与云上商铺公开材料复原；原后台实现、实际签名、扣款与资金去向仍待核。</p>' +
      '<p class="rv-sub" style="font-size:12.5px;color:#8a7f66;margin-top:6px">注意：仿真里的域名注册时间、合约创建与调用次数、余额与地址都是课堂道具，用来训练核对动作，不是链上事实。真实核验请以交易哈希和官方查询为准。</p>' +
      '<div class="rv-summary">' +
        '<div class="rv-stat red"><div class="n">' + c.trapped + '</div><div class="l">检查点被利用</div></div>' +
        '<div class="rv-stat amber"><div class="n">' + (c.risky + c.aware) + '</div><div class="l">危险操作（含核证后继续）</div></div>' +
        '<div class="rv-stat green"><div class="n">' + c.verified + '</div><div class="l">识破并停手</div></div>' +
        '<div class="rv-stat"><div class="n">' + c.untouched + '</div><div class="l">未触及</div></div>' +
      '</div>' +
      '<div class="rv-verdict"><div class="stamp">' + verdict.stamp + '</div><div><div class="vt">' + verdict.t + '</div><div class="vs">' + verdict.s + '</div></div></div>' +
      '<div class="rv-sec-title"><h2>八个检查点</h2><span>按案例流程排序 · 颜色对应你的实际操作</span></div>' +
      '<div class="rv-grid">' + cards + '</div>' +
      '<div class="rv-sec-title"><h2>操作时间线</h2><span>本次演练的实际点击记录 · 本机时间</span></div>' +
      '<div class="rv-timeline">' + tl + '</div>' +
      '<div class="rv-sec-title"><h2>三条铁律</h2><span>带走这三句话</span></div>' +
      '<div class="rv-rules">' +
        '<div class="rv-rule"><div class="rn">RULE 01</div><div class="rt">消息里的金额，不是到账。</div><div class="rd">只认独立钱包或平台的流水。卡片、聊天记录、页面余额都只是「显示」。</div></div>' +
        '<div class="rv-rule"><div class="rn">RULE 02</div><div class="rt">提现不该要求授权。</div><div class="rd">让你「绑定 / 验证 / 验资 / 激活通道」的，先看钱包请求：是付款，还是给出额度？</div></div>' +
        '<div class="rv-rule"><div class="rn">RULE 03</div><div class="rt">无限额度 = 交出转出权。</div><div class="rd">授权不是转账，但后果可能更大。已经签过的，用 revoke 取消，不要等「补钱」。</div></div>' +
      '</div>' +
      '<div class="rv-foot"><b>证据与出处</b><br>' +
        '• 频道原文与截图：Telegram 频道「大自然资产管理者❇️」#341–#345（2026-08-22）。<br>' +
        '• 云上商铺视频：#297 00:39 订单卡、00:54 支付中心 1.30 USDT、02:21 订单卡、02:27 打开链接确认、02:34 支付中心 10.00 USDT。<br>' +
        '• 本机材料：仿OKPay与云上商铺图文证据.pdf（12 页，20 张证据图）。<br>' +
        '• 技术参考：Telegram Bot API callback_query；TRON TRC20 approve / revoke；<a href="tech.html" target="_blank" rel="noopener">完整技术拆解</a>。<br><br>' +
        '仿真中的域名 okpay-app.xyz、ys-shop-vip.top、地址 TQmF…、余额与订单号均为课堂虚构。证据图来自公开频道材料，已脱敏。<br>' +
        '<b>纸舟课堂</b> · 本页可打印为 A4 学案。' +
      '</div>' +
    '</div>';
  }

  function actLabel(e) {
    if (e.type === 'action') {
      return ({
        'okpay:claim': '点击「收款」领取红包',
        'okpay:withdraw': '点击「提币」',
        'okpay:bind': '点击「点击前往绑定」',
        'pay:open': '点击「立即支付」',
        'verify:open': '点击「开始验资」'
      })[e.label] || e.label;
    }
    if (e.type === 'risk') return '继续操作：' + e.label;
    if (e.type === 'verify') return '核证：' + kindLabel(e.detail);
    if (e.type === 'safe') return '退出：' + e.label;
    if (e.type === 'message') return '发送消息';
    if (e.type === 'approve') return '钱包确认授权';
    return e.label || e.type;
  }

  function escText(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------------------------------------------------------------------
     启动
     --------------------------------------------------------------------- */
  C.boot = function (s) {
    if (!s.levels) s.levels = {};
    if (!s.trace) s.trace = [];
    if (!s.settings) s.settings = { anno: false, showFish: false };
    if (s.mode === 'teach') {
      const seen = LEVELS.find((l) => C.status(l.key) !== 'untouched');
      if (seen) setTimeout(() => showStrip(seen.key), 300);
    }
  };

  C.reset = function () {
    lastCheckpoint = null;
    const strip = document.getElementById('teachStrip');
    if (strip) strip.remove();
    const ms = document.getElementById('microscope');
    if (ms) ms.classList.remove('open');
    document.getElementById('review').classList.remove('open');
    document.getElementById('teacherPanel').classList.remove('open');
  };

  C.openMicroscope = openMicroscope;

  document.addEventListener('keydown', function (e) {
    if (!TG.state) return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === 't') { e.preventDefault(); C.openPanel(); }
    if (k === 'r') { e.preventDefault(); C.openReview(); }
    if (k === 'a' && TG.state) {
      e.preventDefault();
      TG.state.settings.anno = !TG.state.settings.anno;
      document.body.classList.toggle('anno-on', TG.state.settings.anno);
      TG.toast(TG.state.settings.anno ? '证据标注：开' : '证据标注：关');
      TG.saveState();
    }
    if (k === 'd') {
      e.preventDefault();
      const dark = !document.body.classList.contains('theme-dark');
      document.body.classList.toggle('theme-dark', dark);
      document.body.classList.toggle('theme-light', !dark);
      if (TG.state) { TG.state.theme = dark ? 'dark' : 'light'; TG.saveState(); }
    }
    if (k === 'escape') {
      C.closePanel();
      const ms = document.getElementById('microscope');
      if (ms) ms.classList.remove('open');
      const strip = document.getElementById('teachStrip');
      if (strip) strip.classList.add('hidden');
      document.getElementById('walletSheet').classList.remove('open');
      TG.closeBrowser();
      document.getElementById('review').classList.remove('open');
      TG.closeModal();
    }
  });

  /* 让讲解条固定在输入区上方 */
  const style = document.createElement('style');
  style.textContent = '.teach-strip.floating{position:fixed;left:50%;transform:translateX(-50%);bottom:76px;z-index:50;width:min(720px,92vw);box-shadow:0 10px 30px rgba(16,35,47,.18)}';
  document.head.appendChild(style);
})(window);
