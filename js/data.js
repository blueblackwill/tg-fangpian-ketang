/* ==========================================================================
   案例数据 · 依据 2026-08 频道「大自然资产管理者❇️」与云上商铺公开材料复原
   - 所有余额、地址、域名均为课堂虚构
   - 关键文案尽量保留原话：领取余额 / 点击前往绑定 / 请在24小时内领取 / 1.30 USDT
   ========================================================================== */
(function (global) {
  'use strict';

  const ME = {
    name: '阿伟',
    username: '@awei_2026',
    avatar: { text: '伟', bg: 'linear-gradient(135deg,#4f8ef7,#2f6fd0)' },
    phone: '+61 4** *** 821'
  };

  const PROFILES = {
    mei: {
      name: '云上客服·小美', username: '@youyu185', avatar: { text: '美', bg: 'linear-gradient(135deg,#f19ab0,#d9607f)' },
      bio: '云上商铺专属客服｜7×24 在线｜售后请直接留言',
      common: '1 个共同群组', type: 'user', joined: '2026年8月10日加入',
      note: '群内自称官方客服，但账号是普通用户，不是机器人认证账号。'
    },
    mallbot: {
      name: '云上商铺', username: '@YunShangShangPuBot', avatar: { text: '云', bg: 'linear-gradient(135deg,#6fb1e8,#3a7fc1)' },
      bio: '云上商铺 - TG购物平台｜USDT 卡密 · 代充 · 礼品卡',
      common: '1 个共同群组', type: 'bot', joined: '2026年8月20日加入',
      note: '当前资料页显示名「云上商铺 - TG购物平台」，@YunShangShangPuBot；历史视频没有打开资料页，不能确认同一账号。'
    },
    okpay: {
      name: 'Okpay', username: '', avatar: { text: 'OK', bg: 'linear-gradient(135deg,#f6a23c,#e8730f)' },
      bio: 'Okpay 钱包助手｜充值 · 提币 · 红包',
      common: '无', type: 'bot', joined: '—',
      note: '历史画面只有「Okpay／机器人」，没有资料页 @；名称与真正的 OKPay 没有可核实的关联。'
    },
    qiang: {
      name: '阿强', username: '@qiang_88', avatar: { text: '强', bg: 'linear-gradient(135deg,#7d9f6e,#527a45)' },
      bio: '长期收 U｜卡密代充', common: '1 个共同群组', type: 'user', joined: '2026年8月12日加入'
    },
    lu: {
      name: '小鹿', username: '@xiaolu_77', avatar: { text: '鹿', bg: 'linear-gradient(135deg,#c79ae0,#8f5fbf)' },
      bio: '', common: '1 个共同群组', type: 'user', joined: '2026年8月16日加入'
    },
    wang: {
      name: '老王', username: '@wang_lao', avatar: { text: '王', bg: 'linear-gradient(135deg,#7ea6c9,#4d7fa8)' },
      bio: '诚信第一', common: '1 个共同群组', type: 'user', joined: '2026年8月11日加入'
    },
    fish: {
      name: '鱼苗通知', username: '@yumiao_notify_bot', avatar: { text: '鱼', bg: 'linear-gradient(135deg,#4e8f7a,#2d6a56)' },
      bio: '', common: '无', type: 'bot', joined: '—'
    },
    channel: {
      name: '大自然资产管理者❇️', username: '@blueblackwill', avatar: { text: '❇', bg: 'linear-gradient(135deg,#5c9e6d,#2f6b46)' },
      bio: '频道 · 12 847 位订阅者', common: '—', type: 'channel', joined: '2023年5月22日创建'
    }
  };

  const PRODUCTS = [
    { id: 'p1', name: '新人体验卡', price: 1.30, desc: '新用户首单体验，限购 1 次', emoji: '🎟️', tag: '首单专享' },
    { id: 'p2', name: 'USDT 充值卡 10U', price: 10.00, desc: '10 USDT 面值，机器人自动发货', emoji: '💳', tag: '热卖' },
    { id: 'p3', name: 'USDT 充值卡 100U', price: 99.00, desc: '100 USDT 面值，批量优惠', emoji: '💳', tag: '批量' },
    { id: 'p4', name: 'App Store 礼品卡 25U', price: 25.00, desc: '美区礼品卡，秒发卡密', emoji: '🎁', tag: '' },
    { id: 'p5', name: 'Steam 充值卡 50U', price: 48.00, desc: '全球区，库存充足', emoji: '🎮', tag: '' },
    { id: 'p6', name: '云上会员月卡', price: 5.00, desc: '解锁专属客服与优先发货', emoji: '👑', tag: '' }
  ];

  const CHANNEL_URL = 'https://t.me/blueblackwill';

  /* ---------------------------------------------------------------------
     群组：云上商铺｜官方会员群
     --------------------------------------------------------------------- */
  const GROUP_MESSAGES = [
    { id: 'g1', service: '群组已创建', day: '2026年8月10日' },
    { id: 'g2', service: '云上客服·小美 邀请 云上商铺 加入群组', day: '2026年8月20日' },
    {
      id: 'g3', sender: 'mei', time: '19:20', pinned: true, day: '2026年8月22日',
      text: '欢迎新朋友 👋\n本群是「云上商铺」官方会员群。下单请直接联系 @YunShangShangPuBot，客服不会主动私聊你，谨防假冒。\n\n🛍 全场 USDT 卡密 · 代充 · 礼品卡\n🧧 每晚 20:00 群内红包雨'
    },
    {
      id: 'g4', sender: 'qiang', time: '19:22',
      photo: { fake: 'receipt', title: '到账通知', amount: '50.00 USDT', rows: [['类型', '卡密订单'], ['订单号', 'YS-…-0612'], ['状态', '已完成']] },
      text: '昨天的 50U 卡密秒发，稳 👍', reactions: [{ e: '👍', n: 6 }]
    },
    { id: 'g5', sender: 'lu', time: '19:26', text: '请问提现一直让绑定钱包，正常吗？' },
    {
      id: 'g6', sender: 'mei', time: '19:27', reply: { name: '小鹿', text: '请问提现一直让绑定钱包，正常吗？' },
      text: '正常流程哈，绑定后 24 小时内到账。\n有疑问直接找我 @youyu185'
    },
    {
      id: 'g7', sender: 'wang', time: '19:31',
      photo: { fake: 'receipt', title: '提现成功', amount: '10,000.00 USDT', rows: [['网络', 'TRC20'], ['状态', '已到账'], ['时间', '19:28:41']] },
      text: '刚提 10000U 秒到，老板大气 🙏', reactions: [{ e: '👍', n: 14 }, { e: '🔥', n: 5 }]
    },
    {
      id: 'g8', sender: 'mallbot', time: '19:33', via: '@YunShangShangPuBot',
      text: '🛍 云上商铺 · 今日在售\n\n🎟️ 新人体验卡 — 1.30 USDT\n💳 USDT 充值卡 10U — 10.00 USDT\n💳 USDT 充值卡 100U — 99.00 USDT\n🎁 App Store 礼品卡 25U — 25.00 USDT\n\n👉 点下方按钮直接下单，机器人自动发货。',
      buttons: [
        [{ text: '🛍 全部商品', action: 'mall:catalog' }],
        [{ text: '📦 我的订单', action: 'mall:orders' }]
      ]
    },
    {
      id: 'g9', sender: 'mei', time: '19:35', pinned: true,
      text: '🧧 今晚 20:00 红包雨，满 100U 返 20U，先到先得。\n新朋友先看置顶，认准唯一客服 @youyu185。'
    },
    {
      id: 'g10', sender: 'mallbot', time: '19:47', via: '@YunShangShangPuBot',
      card: 'order',
      order: { id: 'YS20260822-0731', product: '新人体验卡', price: '1.30', status: '待支付', desc: '新用户首单体验，限购 1 次' },
      buttons: [
        [{ text: '💳 立即支付', action: 'pay:open', webapp: true, anno: '⑥ 收银台在外部域名，不在 Telegram 内' }],
        [{ text: '⬅️ 返回商品列表', action: 'mall:catalog' }],
        [{ text: '💬 联系客服', action: 'chat:kf' }]
      ]
    },
    { id: 'g11', sender: 'lu', time: '19:49', text: '客服说首次提货要验资，真的假的' },
    { id: 'g12', sender: 'mei', time: '19:50', reply: { name: '小鹿', text: '客服说首次提货要验资，真的假的' }, text: '正常的，验资款原路退回，放心。' },
    {
      id: 'g13', sender: 'channel', forward: '大自然资产管理者❇️', time: '19:53', views: '2.1K',
      text: '鱼领取后提现发起授权\n\n红包只是引子。领了余额想提现，就会让你绑定钱包做授权，授权成功后台会收到通知。',
      reactions: [{ e: '👀', n: 9 }],
      linkPreview: { title: '大自然资产管理者❇️', desc: 't.me/blueblackwill', url: CHANNEL_URL }
    }
  ];

  /* ---------------------------------------------------------------------
     云上商铺 bot
     --------------------------------------------------------------------- */
  const MALLBOT_MESSAGES = [
    {
      id: 'b1', time: '19:12',
      text: '欢迎使用云上商铺！\n🛍 全场 USDT 卡密 · 官方直发\n\n👇 请选择下方菜单开始',
      buttons: [
        [{ text: '🛍 全部商品', action: 'mall:catalog' }, { text: '🔥 今日特价', action: 'mall:deal' }],
        [{ text: '📦 我的订单', action: 'mall:orders' }, { text: '💬 联系客服', action: 'chat:kf' }]
      ]
    },
    {
      id: 'b2', time: '19:47', card: 'order',
      order: { id: 'YS20260822-0731', product: '新人体验卡', price: '1.30', status: '待支付', desc: '新用户首单体验，限购 1 次' },
      buttons: [
        [{ text: '💳 立即支付', action: 'pay:open', webapp: true, anno: '⑥ 收银台在外部域名，不在 Telegram 内' }],
        [{ text: '⬅️ 返回商品列表', action: 'mall:catalog' }],
        [{ text: '💬 联系客服', action: 'chat:kf' }]
      ]
    }
  ];

  /* ---------------------------------------------------------------------
     Okpay 钱包 bot
     --------------------------------------------------------------------- */
  const OKPAY_MESSAGES = [
    {
      id: 'o1', time: '19:41', card: 'wallet',
      wallet: { nickname: '阿伟', uid: '90****21', usdt: '0.00', trx: '12.30', cny: '0.00' },
      buttons: [
        [{ text: '💰 充值', action: 'okpay:deposit' }, { text: '💸 提币', action: 'okpay:withdraw' }],
        [{ text: '🔁 转账', action: 'okpay:transfer' }, { text: '📥 收款', action: 'okpay:receive' }],
        [{ text: '🧧 红包', action: 'okpay:redpacket' }, { text: '👤 个人中心', action: 'okpay:me' }],
        [{ text: '🌐 Language', action: 'okpay:lang' }, { text: '📊 账单', action: 'okpay:ledger' }],
        [{ text: '🏪 商户', action: 'okpay:merchant' }, { text: '🔄 闪兑', action: 'okpay:swap' }],
        [{ text: '👥 官方交易群', action: 'chat:group' }, { text: '🎧 客服台', action: 'chat:kf' }]
      ]
    },
    {
      id: 'o2', time: '19:51', card: 'transfer',
      transfer: { from: '云上商铺官方', amount: '1.00', memo: '新人红包', expire: '请在24小时内领取' },
      buttons: [[{ text: '📥 收款', action: 'okpay:claim' }]]
    },
  ];

  /* ---------------------------------------------------------------------
     客服私聊
     --------------------------------------------------------------------- */
  const KF_MESSAGES = [
    { id: 'k1', time: '19:46', text: '您好，我是云上商铺专属客服小美 👩‍💼\n\n下单后把订单号发给我，我帮您安排发货。\n首次提货需要完成 1:1 验资，验资款会原路退回。' },
    { id: 'k2', time: '19:47', text: '客服在线时间 9:00–24:00（悉尼时间）。\n有订单问题直接留言，看到会回复。' }
  ];

  /* ---------------------------------------------------------------------
     频道
     --------------------------------------------------------------------- */
  const CHANNEL_MESSAGES = [
    { id: 'c1', service: '频道已创建', day: '2023年5月22日' },
    { id: 'c6', time: '16:58', views: '1.4K', day: '2026年8月22日', text: '今日新增授权 37 单，鱼苗正常。' },
    { id: 'c5', time: '17:30', views: '1.7K', text: 'OKpay 客服-小美（机器人）已上线，提现问题直接找她。' },
    {
      id: 'c4', time: '18:05', views: '2.1K',
      photo: { fake: 'withdraw', title: '提现申请', amount: '10,000.00 USDT', rows: [['单号', 'WD…8842'], ['提示', '点击前往绑定钱包']] },
      text: '提现页要求绑定钱包，点进去就是授权。'
    },
    {
      id: 'c3', time: '18:40', views: '1.9K',
      photo: { fake: 'transfer', title: 'Okpay 转账', amount: '1.00 U', rows: [['来自', '云上商铺官方'], ['提示', '请在24小时内领取'], ['按钮', '收款']] },
      text: 'Okpay 转账卡片，通过机器人署名。'
    },
    {
      id: 'c2', time: '19:11', views: '2.3K', pinned: true,
      text: '鱼领取后提现发起授权\n\n红包和转账只是入口。领了余额想提现，就会引导你绑定钱包；授权成功后，后台会收到通知，等钱包进钱再处理。\n\n这套流程已经跑了 37 单。',
      reactions: [{ e: '👀', n: 23 }, { e: '🔥', n: 7 }]
    }
  ];

  /* ---------------------------------------------------------------------
     鱼苗通知（操作者后台视角）
     --------------------------------------------------------------------- */
  const FISH_MESSAGES = [
    {
      id: 'f1', time: '10:02',
      text: '📋 今日汇总\n授权 37 / 成功归集 9 / 待观察 21\n在线设备 6 · 通道正常'
    }
  ];

  const CHATS = [
    {
      id: 'okpay', type: 'bot', title: 'Okpay', profile: 'okpay', unread: 2, order: 1,
      avatar: PROFILES.okpay.avatar, subtitle: '机器人',
      lastPreview: '🎁 转账给你 1.00 U · 请在24小时内领取',
      messages: OKPAY_MESSAGES
    },
    {
      id: 'group', type: 'group', title: '云上商铺｜官方会员群', profile: null, unread: 4, order: 2,
      avatar: { text: '云', bg: 'linear-gradient(135deg,#63a6e0,#3577b8)' },
      subtitle: '1 284 位成员，312 位在线',
      pinned: { id: 'g3', title: '新人必读', sub: '本群唯一官方客服 @youyu185' },
      lastPreview: '转发自 大自然资产管理者❇️',
      messages: GROUP_MESSAGES
    },
    {
      id: 'mallbot', type: 'bot', title: '云上商铺', profile: 'mallbot', unread: 1, order: 3,
      avatar: PROFILES.mallbot.avatar, subtitle: '机器人',
      lastPreview: '订单详情 · 待支付 · 1.30 USDT',
      messages: MALLBOT_MESSAGES
    },
    {
      id: 'kf', type: 'user', title: '云上客服·小美', profile: 'mei', unread: 0, order: 4,
      avatar: PROFILES.mei.avatar, subtitle: '最近上线 19:47',
      lastPreview: '客服在线时间 9:00–24:00（悉尼时间）',
      messages: KF_MESSAGES
    },
    {
      id: 'channel', type: 'channel', title: '大自然资产管理者❇️', profile: 'channel', unread: 0, order: 5,
      avatar: PROFILES.channel.avatar, subtitle: '12 847 位订阅者',
      pinned: { id: 'c2', title: '#341 置顶', sub: '鱼领取后提现发起授权' },
      lastPreview: '鱼领取后提现发起授权',
      muted: true, messages: CHANNEL_MESSAGES
    },
    {
      id: 'fish', type: 'bot', title: '鱼苗通知', profile: 'fish', unread: 0, order: 99, hidden: true,
      avatar: PROFILES.fish.avatar, subtitle: '机器人',
      lastPreview: '今日汇总 · 授权 37',
      messages: FISH_MESSAGES
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  global.TG = global.TG || {};
  global.TG.data = {
    me: ME,
    profiles: PROFILES,
    products: PRODUCTS,
    chats: CHATS,
    channelUrl: CHANNEL_URL,
    clone: clone,
    seedChats: function () { return clone(CHATS); }
  };
})(window);
