/* ==========================================================================
   左右对照课堂：左边可点仿真，右边同步解释当前这一屏
   ========================================================================== */
(function (global) {
  'use strict';
  const TG = global.TG = global.TG || {};

  const SCENES = {
    group: {
      title: '群与“官方感”', level: '入口', where: '左边：群聊 + 置顶',
      quote: ['「云上商铺｜官方会员群」', '「1 284 位成员，312 位在线」', '「新人必读  本群唯一官方客服 @youyu185」', '「刚提 10000U 秒到，老板大气 🙏」', '转发自 大自然资产管理者❇️：「鱼领取后提现发起授权」'],
      you: '这是官方群：有管理员、有规则、这么多人晒单，应该靠谱。',
      real: '群是真人建的；管理员是群权限，不是 Telegram 认证；人数、晒单、反应都可以安排。群氛围是仿真还原，#297 能证明群菜单里确有「云上商铺机器人」入口。',
      tech: 'Telegram 群由真人账号创建；管理员是群权限。显示名、成员数、晒单、反应都是显示层，不是平台担保。',
      psy: '权威 + 社会认同 + 内群体：先让你觉得“这里有官方、很多人在做”，再让你觉得“不参与就亏”。',
      evidence: '#297 01:32.958 群菜单；#292 发布者宣称官方认证/托管；群内晒单为仿真还原。',
      check: '点资料页看 @、创建时间、管理员；不要只看群名和人数。',
      one: '群是真的，“官方”是自称。',
      sel: '.chat-head'
    },
    wallet: {
      title: '钱包卡：把机器人装成钱包', level: 'Okpay 1/7', where: '左边：Okpay 对话',
      quote: ['「Okpay」「机器人」', '昵称：阿伟　ID：90****21', 'USDT 0.00　TRX 12.30　CNY 0.00', '充值 / 提币 / 转账 / 收款 / 红包 / 个人中心 / Language / 账单 / 商户 / 闪兑 / 官方交易群 / 客服台'],
      you: '这是一个钱包 App，余额和功能都在这里。',
      real: '这是 bot 发的一条消息 + 一排按钮（reply keyboard）。余额是 bot 数据库字段，不是链上 balanceOf；#342 只有「Okpay／机器人」，没有资料页 @。',
      tech: 'sendMessage + inline keyboard；余额由 bot 写；没有 RPC 查询，也没有签名能力。',
      psy: '熟悉布局 + 功能完整感 + 品牌借用：按钮越多，越像“真的有钱包”。',
      evidence: '#342 顶栏「Okpay／机器人」；钱包本体 @ 未取得。',
      check: '关掉 bot，打开真实钱包/区块浏览器查地址；聊天里的余额不算。',
      one: '这是聊天里的一个机器人，不是钱包。',
      sel: '.wallet-msg'
    },
    transfer: {
      title: '红包转账卡：先让你伸一次手', level: 'Okpay 2/7', where: '左边：转账卡',
      quote: ['「转账给你 1.00 U」', '「请在24小时内领取」', '「收款」', '卡片上方还有「通过」署名位置'],
      you: '有人真的转了 1 U 给我，24 小时内不领就没了。',
      real: '这是一条带按钮的消息卡。点「收款」只把 callback_query 发给 bot；没有 txid、没有付款方地址。「通过」只说明由某个账号生成，不是担保。',
      tech: 'bot 消息 + inline_keyboard；按钮的 callback_data 回到 bot 服务器；消息本身不产生链上交易。',
      psy: '互惠 + 紧迫 + 低金额：先给你一点，再给一个时限，金额小到不值得警惕。',
      evidence: '#342 实拍；#341 原文「鱼领取后提现发起授权」。',
      check: '要 txid；点开「通过」账号看资料页；没有 txid 就不是到账。',
      one: '消息卡不是到账，点「收款」只是点了一个按钮。',
      sel: '[data-action="okpay:claim"]'
    },
    claim: {
      title: '领取结果：把 10000 写进“你的余额”', level: 'Okpay 3/7', where: '左边：领取结果卡',
      quote: ['「领取余额」', '「成功领取 10000 USDT-尽情挥霍吧」', '「启动机器人」「启动客服台」'],
      you: '真的领到了 10000，接下来只要提现。',
      real: 'bot 收到点击后，改自己的消息/数据库，把 10000 写进页面余额。没有链上交易，没有 txid；10000 只是仿站的一个数字。',
      tech: 'callback_query → 数据库写 balance → editMessageText；页面显示的是 bot 字段。',
      psy: '可变奖励 + 锚定 + 兴奋：“尽情挥霍吧”让你开始想象怎么花，而不是怎么核实。',
      evidence: '#341 演示图；绿色「高仿 OKPay」和蓝色箭头是图上叠加，归属未核。',
      check: '看账单/链上；没有 txid 的“领取成功”只是页面文字。',
      one: '卡片上的数字不是余额，是别人写给你看的一句话。',
      sel: '[data-action="okpay:claim"]'
    },
    withdraw: {
      title: '提现输入：让你先做一个“承诺”', level: 'Okpay 4/7', where: '左边：提现输入',
      quote: ['「请回复要提现的金额」', '「当前余额: 3456676.76 USDT」', '「100」（用户回复）', '钱包列表：imToken / TokenPocket / BitGet / TronLink / OneKey / 等待接入'],
      you: '我在发起提现，输入金额、填收款方式，钱就会到。',
      real: '你只是在聊天框里输入数字/点按钮；bot 记录金额，没有任何资金动作。真正的资金动作在后面的钱包请求里。',
      tech: '文本消息或 callback_data；bot 写提现单号；没有链上交易。',
      psy: '承诺一致 + 锚定 + 流程感：已经输入金额，放弃会显得前后不一致。',
      evidence: '#343 实拍；绑定提示可见，实际钱包请求未取得。',
      check: '真提现需要地址/手续费/签名；聊天框输入金额不等于提现。',
      one: '在聊天框里输入金额，不会产生一笔提现。',
      sel: '[data-action="okpay:withdraw"]'
    },
    bindmsg: {
      title: '绑定提示：把“提现”改名为“绑定”', level: 'Okpay 5/7', where: '左边：提现受理 + 绑定按钮',
      quote: ['「提现申请已受理」', '「单号：WD20260822-8842」', '「金额：10,000.00 USDT」', '「⚠️ 检测到您的收款钱包尚未绑定」', '「🔗 点击前往绑定」'],
      you: '提现卡住了，绑一下收款钱包就能到账。',
      real: '这一步把你从聊天带到外部站点。接下来不是“填地址”，而是连接钱包、授权额度。提现被改名成“绑定/认证”。',
      tech: 'bot 返回外部 URL 按钮；Telegram 打开内置浏览器；真正的请求在 dapp 里。',
      psy: '权威解释 + 沉没成本 + 小步升级：单号/金额/24 小时都生成了，你不想在这里放弃。',
      evidence: '#343 实拍；「点击前往绑定」是可见的边界。',
      check: '看跳转域名；看钱包下一步要的是地址、连接还是额度。',
      one: '从这里开始，“提现”已经不是提现了。',
      sel: '[data-action="okpay:bind"]'
    },
    bindpage: {
      title: '仿站绑定页：离开 Telegram 的那一刻', level: '网站', where: '左边：内置浏览器',
      quote: ['地址栏：okpay-app.xyz/wallet/bind', '「Okpay 钱包」「绑定收款钱包」', '「提现单号 / 金额 10,000.00 USDT / TRC20 / 待绑定」', '「连接钱包」', '「仅用于验证钱包归属，不会发起任何转账。」'],
      you: '这是 Okpay 的官方绑定页，填完就能收款。',
      real: '这是 Telegram 外的第三方站点。页面由 dapp 前端控制；“不会发起转账”是话术，下一步可能请求连接和代币额度。',
      tech: '独立域名 + dapp 前端；连接/授权由钱包 SDK 发起；页面本身不持有私钥。',
      psy: '视觉权威 + 熟悉钱包 logo + 风险反转：先卸下戒心，再让你连接。',
      evidence: '#343 只到绑定提示；真实域名在证据里被遮住，本页域名是道具。',
      check: '点地址栏的锁看证书；查 WHOIS；和官方域名对比。',
      one: '离开 Telegram 后，页面上写什么都可以。',
      sel: '#bindConnect'
    },
    connect: {
      title: '钱包连接：先给“只读”，再给“转出”', level: '钱包', where: '左边：TronLink 连接弹窗',
      quote: ['「TronLink」', '「okpay-app.xyz 请求连接钱包」', '✓ 查看钱包地址　✓ 查看代币余额　✓ 请求签名', '「拒绝」「连接」'],
      you: '只是连接一下，看看地址，不会动钱。',
      real: '连接通常只给读取权限，本身不转钱；但它是下一步签名的入口。真正的风险在连接之后的 approve。',
      tech: 'WalletConnect / 深链 / WebView；连接授权读取地址/余额；交易仍需单独签名。',
      psy: '低风险第一步 + 熟悉界面 + 铺垫：先做一件“看起来没事”的事，降低戒心。',
      evidence: '没有直接截图；钱包连接是公开标准流程，本屏为重建。',
      check: '看 dapp 域名是否官方；连接后不要急着签名。',
      one: '连接不是转账，但它是签名那扇门的门把手。',
      sel: '#walletApprove'
    },
    approve: {
      title: '授权弹窗：把“转出权”说成“验证”', level: '钱包', where: '左边：TronLink 授权弹窗',
      quote: ['「授权 USDT 额度」', '「授权后，该站点可在额度范围内转走你地址中的 USDT」', '授权对象 TWd4…jwb', '授权额度：无限（2^256-1）', '合约 TQmF…Yb7', '「拒绝」「确认授权」'],
      you: '这是提现/验资的一部分，点一下确认就完成了。',
      real: '你签的是 approve(spender, 无限)：把地址里 USDT 的转出权交给对方。它不转币，所以余额不变；之后对方用 transferFrom 才能转走。',
      tech: 'approve 写 allowance，发出 Approval，不产生 Transfer；无限额度 = 2^256-1；revoke 只能停未来。',
      psy: '权威界面 + 术语遮蔽 + 无即时损失 + 控制错觉：钱包都弹出来了，应该没问题。',
      evidence: '#341 自述“提现发起授权”；approve 是公开标准；实际签名/扣款仍缺。',
      check: '把请求翻译成一句人话；拒绝无限额度；查 spender/合约；签了先 revoke。',
      one: '这一下给的是转出权，不是验证。',
      sel: '#walletApprove'
    },
    contract: {
      title: 'TronScan：核验合约', level: '网站', where: '左边：区块浏览器',
      quote: ['合约地址 TQmF…Yb7', '创建时间 2026-08-20（2 天前）', '是否开源 否', '持有人 1', '累计调用 37 次', '最近调用 approve(spender, MAX)'],
      you: '页面都到这一步了，合约应该没问题。',
      real: '合约新建、未开源、持有人很少、调用集中在 approve——这些都是风险信号；真实的合约字段仍待核。',
      tech: '区块浏览器读取合约创建、源码验证、持有人、调用记录；链上数据公开但需要会看。',
      psy: '“技术核验”本身会给人安全感；但看不懂的核验等于没核验。',
      evidence: '本屏为重建；真实案件缺合约地址与交易哈希。',
      check: '看合约创建时间、是否开源、spender、授权额度；不懂就拒绝。',
      one: '核验不是点开看看，是能说出“谁可以动我什么”。',
      sel: '.scan-page'
    },
    ledger: {
      title: '账单：平台余额有数，链上没钱', level: 'Okpay 6/7', where: '左边：账单消息',
      quote: ['「📊 账单明细」', '「平台余额 +10,000.00 USDT」', '「链上收款 暂无记录」'],
      you: '账单都写了我有 10,000，应该就是我的钱。',
      real: '这是仿站自己做的账本。“平台余额”是它写的数字；“链上收款暂无记录”才是关键：没有 txid、没有 Transfer。',
      tech: '仿站数据库 vs 链上账本；两套账互不相通；页面余额不能替代 txid。',
      psy: '记录感 + 两套账 + 不给 txid：让你只能看页面，不能去链上核对。',
      evidence: '#341/A02 的余额演示；材料没有对应 txid。',
      check: '按地址查 TRC20 Transfer；要 txid；页面余额不算。',
      one: '最该截图的就是这一页：平台有数，链上没账。',
      sel: '[data-action="okpay:ledger"]'
    },
    shop: {
      title: '商铺启动页：用“官方认证”借信任', level: '商城 1/7', where: '左边：云上商铺 bot',
      quote: ['「云上商铺」「机器人」', '「通过 Telegarm 官方加密支付认证」', '「您支付的资金将由 Telegarm 托管」', '「开始」'],
      you: '这是经过 Telegram 官方认证、资金有托管的商店。',
      real: '“官方认证/托管”是发布者写在页面上的宣称，没有平台凭证；Telegarm / Official Ceratificial Shop / Certificationl Pratcliss 等拼写错误本身就是仿冒线索。',
      tech: 'bot 启动页 + 文案；没有 Telegram 支付托管；认证是页面自称。',
      psy: '信任转移 + 权威 + 低门槛：把 Telegram 的品牌借到自己的商店上。',
      evidence: '#292 图与贴文；官方认证/托管未获平台凭证。',
      check: '问 Telegram/支付机构是否有这个商户；不要看页面自称。',
      one: '页面上的“官方认证”，先当成广告语。',
      sel: '.chat-head'
    },
    order: {
      title: '订单卡：把一条消息做成“合同”', level: '商城 2/7', where: '左边：群内订单卡',
      quote: ['「订单详情」', '价格：$1.30', '状态：待支付', '「立即支付」「返回商品列表」「联系客服」', 'via @（后段 02:21）'],
      you: '我下了一笔真实订单，有订单号、有状态，付了就会发货。',
      real: '这是 bot 生成的消息卡；商品、价格、订单号、状态都是后端字段。via 只说明由某个内联 bot 生成，不是担保，也不是合同。',
      tech: 'inline bot / sendMessage + 订单数据库；via_bot 是生成方字段，不是转发来源。',
      psy: '官僚合法性 + 具体数字 + 状态机：订单号、待支付、争议说明，越像正式流程越可信。',
      evidence: 'S04 00:39 订单卡；S07 02:21 via 署名；#295/#296 内联输入。',
      check: '点 via 后面的账号看资料页；订单号不等于发货。',
      one: '订单卡是消息，不是合同；via 是生成方，不是担保方。',
      sel: '[data-msg="g10"]'
    },
    openlink: {
      title: '打开链接：最后一次提醒，最容易被点掉', level: '商城 3/7', where: '左边：Telegram 确认框',
      quote: ['「打开链接」', '「您确定要打开此链接？」', '「取消」「打开」', '地址区域被遮盖'],
      you: '只是打开支付页，点「打开」就继续付款。',
      real: '这是你要离开 Telegram、进入第三方站点的时刻。地址被遮住，无法确认域名；从这里开始，页面不再受 Telegram 约束。',
      tech: 'url 按钮 → 内置浏览器；首次打开外链会弹确认；地址和归属要自己看。',
      psy: '正常化 + 紧迫 + 掩盖：每个支付都会打开链接，这个弹窗看起来只是流程。',
      evidence: 'S05 00:39.958；S08 02:27.083。',
      check: '点「取消」，回到聊天；先看域名/证书再决定。',
      one: '这个确认框是最后的提醒，不是最后一个障碍。',
      sel: '[data-modal-btn]'
    },
    cashier: {
      title: '收银台：1.30 和 10.00 的“应付金额”', level: '商城 4/7', where: '左边：外部收银页',
      quote: ['「支付中心」', '「支付倒计时 4:54」', '「应付金额 1.30 USDT」', '「正在连接支付通道...」', '微信支付 / 支付宝 / QQ钱包支付', '后段：应付金额 10.00 USDT'],
      you: '我在支付一笔正常订单，付完就会发货。',
      real: '这是外部网页；“应付金额”只说明页面要你付多少，不证明已收、不证明收款方。视频里只有支付页，没有实际转账成功凭证。',
      tech: '静态/半静态前端 + 支付渠道/二维码；金额可来自 URL/订单；成功页可由前端伪造。',
      psy: '熟悉支付 + 倒计时 + 小额：1.30 的决策成本低，10.00 是第二单的重复。',
      evidence: '#297 00:54 / 02:34；无收款方、无回执。',
      check: '看收款方/商户名；要独立支付流水；页面不算。',
      one: '页面写“应付”，不等于已经“实收”。',
      sel: '.pay-amount'
    },
    qr: {
      title: '二维码与“支付成功”：小额真付款买信任', level: '商城 5/7', where: '左边：二维码弹窗',
      quote: ['「微信支付」', '1.30 USDT　约 ¥9.42', '「请使用微信扫一扫」', '「我已完成支付」', '「支付成功」「正在通知商家发货」'],
      you: '钱付了，接下来就等发货。',
      real: '二维码指向某个收款方（聚合支付/个人码/链上地址）；“支付成功”可以由前端直接改状态。1.30 不是为了赚钱，是为了让你相信这是一笔正常交易。',
      tech: 'QR 编码收款方；支付结果可能来自前端；真实到账要看独立流水。',
      psy: '登门槛 + 沉没成本 + 真实感：先付小钱，后面更容易配合“验资”。',
      evidence: '#297 只有支付页与金额；实际付款结果待核。',
      check: '看收款方；要独立流水；付款不等于发货。',
      one: '小额真付款，是骗局在“买”你的信任。',
      sel: '.qr'
    },
    kf: {
      title: '客服私聊：把“流程”变成“有人在帮你”', level: '商城 6/7', where: '左边：客服对话',
      quote: ['「OKpay 客服-小美」「机器人」', '「请问怎么提现」', '「怎么绑定钱包」', '「你好这里是人工客服」'],
      you: '有一个真人在负责我的提现问题。',
      real: '这是演示/客服账号，资料页 @ 未取得；“人工客服”是话术。私聊把你从群里带走，见证人消失，话术可以单独改写。',
      tech: '普通账号或 bot 私聊；身份看资料页 @，不是看显示名。',
      psy: '拟人化 + 权威 + 隔离：有名字、有回应，像真的有人在帮你。',
      evidence: '#344 标题与对话；客服 @ 未取得。',
      check: '点资料页看 @；和群管理员/官方账号比对。',
      one: '“人工客服”是话术，不是身份。',
      sel: '.chat-head'
    },
    verify: {
      title: '验资页：第二次授权，换个名字', level: '商城 7/7', where: '左边：验资页',
      quote: ['「云上商铺 · 验资通道」', '「首次提货需完成 1:1 验资」', '「验资额度 1,000 USDT」', '「3 分钟内原路退回」', '「开始验资」'],
      you: '验一下资金，3 分钟退回，然后发货。',
      real: '这是第二次 approve：1,000 USDT 是授权额度，不是转 1,000；“原路退回”在链上没有对应退款。付款和授权是两种交易。',
      tech: '第二次 approve（或新 spender）；没有 Transfer 退款；页面“验资”与钱包“授权额度”是两种动作。',
      psy: '风险反转 + 损失厌恶 + 希望：“原路退回”把风险说成暂时，已经付了 1.30 不想前功尽弃。',
      evidence: '#297 客服/验资线索；页面是重建；实际授权未取得。',
      check: '对比页面“验资”和钱包“授权额度”；要退款流水。',
      one: '验资要的是权限，不是付款。',
      sel: '#verifyStart'
    },
    fish: {
      title: '鱼苗后台：你等提现，他等进钱', level: '后台', where: '左边：鱼苗通知',
      quote: ['「🔔 新授权」', '用户地址 TXk9…M0zY', '授权对象 TWd4…5jwb', '额度：无限', '当前余额：0.00', '「⚡ 命中余额」「✅ 归集完成」'],
      you: '（受害者以为）平台在处理提现。',
      real: '后台用 indexer 看 Approval/Transfer；规则引擎等余额；worker 调 transferFrom；另一个 bot 通知操作者。',
      tech: 'Approval/Transfer 事件 → indexer → 队列 → transferFrom → collector；Telegram bot 通知。',
      psy: '工业化 + 可复制 + 去人格化：频道把受害者叫“鱼”，收割叫“杀鱼”。',
      evidence: '频道自述 #304–305 等；后台画面为重建；具体交易仍缺。',
      check: '这不是受害者界面；看到授权就该 revoke。',
      one: '你盯着“到账”，他盯着“进钱”。',
      sel: '.chat-head'
    },
    backend: {
      title: '后台与监控：从事件到归集', level: '后台', where: '右边：代码级拆解',
      quote: ['「📋 今日汇总」', '授权 37 / 成功归集 9 / 待观察 21', '在线设备 6 · 通道正常', '「🔔 新授权」owner / spender / value（流程示例）'],
      you: '（受害者以为）平台在处理提现。',
      real: '后台由 bot 服务、索引器、规则引擎、队列、worker、归集地址和操作员通知组成。左侧的每一步点击，都会落到这些组件里。',
      tech: '主线：Telegram webhook → 数据库 → 索引器读 Approval/Transfer → 规则引擎打分 → 队列 → worker → 归集 → 操作员 bot。下面是核心代码段；执行归集的那一步故意不给可运行代码。',
      psy: '后台把“人等提现”变成“机器等进钱”：自动化、可复制、去人格化。',
      evidence: '频道自述与公开标准；本页代码是教学伪代码/防御代码，不是可部署的盗币工具。',
      check: '看事件是否唯一、确认数、幂等键；看授权额度、spender、余额；看自己钱包的 approval。',
      one: '你盯着“到账”，后台盯着“Approval 和余额”。',
      sel: '.chat-head',
      code: [
        { t: '1. Telegram webhook：接收点击', lang: 'python', src: `@app.post("/tg/{secret}")
async def tg(secret: str, update: dict):
    if secret != BOT_SECRET:
        raise HTTPException(403)
    if "callback_query" in update:
        cq = update["callback_query"]
        await db.save_callback(cq["id"], cq["data"])
        await queue.enqueue("callback", cq["data"])
    return {"ok": True}` },
        { t: '2. 解码 Approval（只读监控）', lang: 'python', src: `APPROVAL = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"

def decode_approval(log):
    owner   = "0x" + log["topics"][1][-40:]
    spender = "0x" + log["topics"][2][-40:]
    value   = int(log["data"], 16)
    return {"owner": owner, "spender": spender, "value": value}` },
        { t: '3. 规则引擎：谁值得盯', lang: 'python', src: `MAX = 2**256 - 1
def score(a, balance, known):
    s = 0
    if a["value"] == MAX:        s += 50   # 无限额度
    if a["spender"] not in known: s += 20   # 陌生地址
    if balance > 30_000_000:     s += 30   # > 30 USDT
    return s` },
        { t: '4. 队列 / worker：攻击步骤占位', lang: 'python', src: `def worker(job):
    if job.kind == "sweep":
        # 攻击步骤：不提供可运行的 transferFrom 脚本
        raise NotImplementedError("educational only")
    if job.kind == "alert":
        notify_operator(job.payload)` },
        { t: '5. 防御：查授权并撤销', lang: 'javascript', src: `const allowance = await usdt.allowance(owner, spender).call();
if (allowance.gt(0)) {
  await usdt.approve(spender, 0).send({ feeLimit: 100_000_000 });
  console.log("revoked", spender);
}` }
      ]
    },
    review: {
      title: '复盘：把每一页连成一条链', level: '收束', where: '左边：复盘报告',
      quote: ['八个检查点', '被利用 / 危险 / 识破 / 未触及', '「这份报告只记录你在仿真里的点击与核证」'],
      you: '这是一次普通交易，只是流程有点麻烦。',
      real: '这是 8 个决策点：每一步都在把“领钱”换成“给权限”。证据能证明画面，不能替你签名。',
      tech: '复盘记录 trace、检查点、证据与重建标签；不产生真实交易。',
      psy: '把感觉变成记录、把责任放回设计、把防御变成动作。',
      evidence: '#341–#344、#297；重建页已标注。',
      check: '用复盘报告逐页对照；不确定的标“待核”。',
      one: '看懂一页不够，要看懂“下一页为什么会出现”。',
      sel: '.review-overlay'
    }
  };

  const ORDER = ['group', 'wallet', 'transfer', 'claim', 'withdraw', 'bindmsg', 'bindpage', 'connect', 'approve', 'contract', 'ledger', 'shop', 'order', 'openlink', 'cashier', 'qr', 'kf', 'verify', 'fish', 'backend', 'review'];
  const REAL = new Set(['transfer', 'claim', 'withdraw', 'shop', 'order', 'openlink', 'cashier', 'kf']);
  const GAP = new Set(['approve', 'verify']);

  let current = 'wallet';
  let panel = null;

  function e(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.className = 'split-panel';
    panel.id = 'splitPanel';
    panel.setAttribute('aria-label', '左右对照讲解');
    document.body.appendChild(panel);
    return panel;
  }

  function highlight(sel) {
    document.querySelectorAll('.split-focus').forEach((n) => n.classList.remove('split-focus'));
    if (!sel) return;
    let node = null;
    try { node = document.querySelector(sel); } catch (err) { node = null; }
    if (!node) return;
    node.classList.add('split-focus');
    try { node.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) { /* ignore */ }
  }

  function focusCurrent() {
    const sc = SCENES[current];
    if (!sc) return;
    if (current === 'wallet') {
      const m = document.getElementById('messages');
      if (m) {
        m.scrollTop = 0;
        setTimeout(() => { m.scrollTop = 0; }, 120);
      }
      return;
    }
    if (current === 'group' || current === 'order') {
      const n = document.querySelector('[data-msg="g10"]');
      if (n) { try { n.scrollIntoView({ block: 'center' }); } catch (err) {} return; }
    }
    highlight(sc.sel);
  }

  function render() {
    const sc = SCENES[current];
    if (!sc) return;
    ensurePanel();
    const idx = ORDER.indexOf(current);
    panel.innerHTML =
      '<div class="sp-top">' +
        '<div class="sp-kicker">左右对照 · 当前这一屏</div>' +
        '<div class="sp-title-row"><h1 id="spTitle">' + e(sc.title) + '</h1><span class="sp-level">' + e(sc.level) + '</span></div>' +
        '<div class="sp-where">' + e(sc.where) + '　·　第 ' + (idx + 1) + ' / ' + ORDER.length + ' 屏' +
          '　·　<span class="sp-src ' + (REAL.has(current) ? 'real' : GAP.has(current) ? 'gap' : 'recon') + '">' + (REAL.has(current) ? '实拍证据' : GAP.has(current) ? '证据缺口 · 重建' : '界面重建') + '</span></div>' +
        '<div class="sp-actions">' +
          '<button class="sp-btn" id="spPrev" type="button">◀ 上一屏</button>' +
          '<button class="sp-btn" id="spNext" type="button">下一屏 ▶</button>' +
          '<button class="sp-btn" id="spCode" type="button">后台代码</button>' +
          '<button class="sp-btn primary" id="spLocate" type="button">定位左边</button>' +
          '<button class="sp-btn" id="spReset" type="button">重置</button>' +
        '</div>' +
        '<div class="sp-progress"><i style="width:' + Math.round(((idx + 1) / ORDER.length) * 100) + '%"></i></div>' +
      '</div>' +
      '<div class="sp-body">' +
        '<div class="sp-label">左边这一屏的字</div>' +
        '<div class="sp-quote">' + sc.quote.map((q) => e(q)).join('<br>') + '</div>' +
        '<div class="sp-two">' +
          '<div class="sp-cell you"><b>你以为</b>' + e(sc.you) + '</div>' +
          '<div class="sp-cell real"><b>实际</b>' + e(sc.real) + '</div>' +
        '</div>' +
        '<div class="sp-label">技术原理</div><p>' + e(sc.tech) + '</p>' +
        (sc.code ? sc.code.map((c) => '<div class="sp-code"><div class="sp-code-h"><span>' + e(c.t) + '</span><em>' + e(c.lang) + '</em></div><pre><code>' + e(c.src) + '</code></pre></div>').join('') : '') +
        '<div class="sp-label">心理机制</div><p>' + e(sc.psy) + '</p>' +
        '<div class="sp-label">证据 / 怎么核</div><p>' + e(sc.evidence) + '</p><p class="sp-check">' + e(sc.check) + '</p>' +
        '<div class="sp-one"><b>老师一句话：</b>' + e(sc.one) + '</div>' +
        '<div class="sp-foot">左边可以继续点；右边只解释你当前看到的这一屏。手动切屏只换讲解，不改变左边进度。<br>' +
        '<a href="backend.html" target="_blank" rel="noopener">后台与监控（代码）</a>　·　<a href="tech.html" target="_blank" rel="noopener">完整技术原理</a>　·　<a href="walk.html" target="_blank" rel="noopener">20 页逐字讲解</a></div>' +
      '</div>';
    panel.querySelector('#spPrev').onclick = () => show(ORDER[Math.max(0, idx - 1)]);
    panel.querySelector('#spNext').onclick = () => show(ORDER[Math.min(ORDER.length - 1, idx + 1)]);
    panel.querySelector('#spLocate').onclick = () => highlight(sc.sel);
    panel.querySelector('#spCode').onclick = () => showBackend();
    panel.querySelector('#spReset').onclick = () => {
      TG.reset('blind');
      setTimeout(() => { TG.openChat('okpay'); show('wallet'); }, 200);
    };
    panel.scrollTop = 0;
    focusCurrent();
  }

  function show(key) {
    if (!SCENES[key]) return;
    current = key;
    render();
  }

  function showBackend() {
    if (TG.chat && TG.chat() !== 'fish') {
      TG.openChat('fish');
      setTimeout(() => show('backend'), 60);
    } else {
      show('backend');
    }
  }

  const ACTION_MAP = {
    'okpay:claim': 'claim',
    'okpay:withdraw': 'withdraw',
    'okpay:bind': 'bindmsg',
    'okpay:ledger': 'ledger',
    'pay:open': 'openlink',
    'verify:open': 'verify',
    'mall:catalog': 'shop',
    'mall:deal': 'shop',
    'mall:orders': 'order',
    'mall:buy': 'order'
  };

  TG.split = {
    init() {
      document.body.classList.add('split-mode');
      ensurePanel();
      show('wallet');
      return true;
    },
    show,
    current() { return current; },
    onAction(action) {
      if (!panel) return;
      const key = ACTION_MAP[action];
      if (key) show(key);
      if (action.indexOf('okpay:amount') === 0) show('bindmsg');
      if (action.indexOf('mall:product') === 0) show('shop');
      if (action.indexOf('mall:buy') === 0) show('order');
      if (action.indexOf('chat:') === 0) return;
    },
    onOpenChat(id) {
      if (!panel) return;
      if (id === 'group') show('group');
      if (id === 'okpay') show('wallet');
      if (id === 'mallbot') show('shop');
      if (id === 'kf') show('kf');
      if (id === 'fish') show('fish');
      if (id === 'channel') show('group');
    },
    onBrowser(page) {
      if (!panel) return;
      if (page === 'bind') show('bindpage');
      if (page === 'pay') show('cashier');
      if (page === 'verify') show('verify');
      if (page === 'contract') show('contract');
      if (page === 'domain') show('bindpage');
    },
    onWallet(kind, dapp) {
      if (!panel) return;
      if (kind === 'connect') show('connect');
      else if (kind === 'approve') show(String(dapp || '').indexOf('ys-shop') >= 0 ? 'verify' : 'approve');
    },
    onEvent(type, payload) {
      if (!panel) return;
      payload = payload || {};
      if (type === 'browser') this.onBrowser(payload.page);
      if (type === 'approve') show(String(payload.dapp || '').indexOf('ys-shop') >= 0 ? 'verify' : 'approve');
      if (type === 'reject') show(String(payload.dapp || '').indexOf('ys-shop') >= 0 ? 'verify' : 'approve');
      if (type === 'wallet-open') this.onWallet(payload.kind, payload.dapp);
      if (type === 'verify') {
        if (payload.kind === 'opened-wallet-connect') show('connect');
        if (payload.kind === 'opened-verify') show('verify');
        if (payload.kind === 'contract') show('contract');
      }
      if (type === 'pay-channel') show('qr');
      if (type === 'info' && payload.chat === 'group') show('group');
    }
  };
})(window);
