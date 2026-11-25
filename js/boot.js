/* ==========================================================================
   启动：课堂入口、恢复上次演练、快捷键入口
   ========================================================================== */
(function (global) {
  'use strict';
  const TG = global.TG = global.TG || {};
  const splash = document.getElementById('splash');

  function addAndroidChrome() {
    if (!document.body.classList.contains('android-mode')) return;
    if (document.querySelector('.android-status')) return;
    const app = document.getElementById('app');
    const sb = document.createElement('div');
    sb.className = 'android-status';
    sb.innerHTML = '<span>14:49</span><span class="a-icons">' +
      '<svg viewBox="0 0 14 12"><path d="M1 10h2V7H1zm3 0h2V5H4zm3 0h2V3H7zm3 0h2V1h-2z"/></svg>' +
      '<svg viewBox="0 0 14 12"><path d="M7 10.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM3.2 6.2a5.4 5.4 0 0 1 7.6 0l-1 1a4 4 0 0 0-5.6 0zM.9 3.9a8.7 8.7 0 0 1 12.2 0l-1 1a7.3 7.3 0 0 0-10.2 0z"/></svg>' +
      '<span class="a-battery"></span></span>';
    app.prepend(sb);
    const note = document.createElement('div');
    note.className = 'android-note';
    note.textContent = '受控仿真 · 本地运行 · 无真实账号 / 钱包 / 资金';
    document.body.appendChild(note);
  }

  function hideSplash() {
    splash.style.transition = 'opacity .2s ease';
    splash.style.opacity = '0';
    setTimeout(() => splash.classList.add('hidden'), 210);
  }

  function start(mode, restored) {
    if (TG.state) return;
    hideSplash();
    const state = restored || TG.newState(mode);
    TG.boot(mode, state);
    if (mode === 'teach') setTimeout(() => TG.classroom.openPanel(), 320);
    if (!restored) {
      setTimeout(() => {
        TG.toast(mode === 'teach' ? '讲解模式：T 打开控制台，R 看复盘' : '演练开始：按真实节奏操作即可', 2600);
      }, 700);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const saved = TG.load();
    const resume = document.getElementById('resumeSession');
    if (saved) resume.classList.remove('hidden');

    document.getElementById('startBlind').onclick = () => start('blind', null);
    document.getElementById('startTeach').onclick = () => start('teach', null);
    resume.onclick = () => start(saved.mode || 'blind', saved);

    document.getElementById('classroomFab').onclick = () => TG.classroom.openPanel();

    // 直接带 #teach 打开时进入教师视角，方便课前预演
    if (location.hash === '#teach') {
      setTimeout(() => start('teach', null), 100);
    }
    if (location.hash === '#student') {
      setTimeout(() => start('blind', null), 100);
    }
    if (location.hash === '#lab') {
      setTimeout(() => start('teach', null), 100);
    }
    if (location.hash === '#android') {
      document.body.classList.add('android-mode');
      setTimeout(() => {
        start('blind', null);
        addAndroidChrome();
        setTimeout(() => { if (TG.state) TG.openChat('okpay'); }, 600);
      }, 100);
    }
    if (location.hash === '#split') {
      document.body.classList.add('android-mode', 'split-mode');
      setTimeout(() => {
        start('blind', null);
        addAndroidChrome();
        if (TG.split) TG.split.init();
        setTimeout(() => { if (TG.state) TG.openChat('okpay'); }, 700);
      }, 100);
    }

    window.addEventListener('beforeunload', () => TG.saveState());
  });
})(window);
