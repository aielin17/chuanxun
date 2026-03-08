/**
 * data-modal.js — 数据管理界面 v6
 * 全新设计：标签页导航 · 浮岛卡片 · 微缩仪表盘
 */
(function () {
    'use strict';

    function injectCSS() {
        if (document.getElementById('dm6-style')) return;
        const s = document.createElement('style');
        s.id = 'dm6-style';
        s.textContent = `
#data-modal { align-items: flex-end !important; padding: 0 !important; }
#data-modal .modal-content {
    padding: 0 !important; width: 100% !important;
    max-width: 520px !important; max-height: 94dvh !important;
    border-radius: 0 !important; overflow: hidden !important;
    display: flex !important; flex-direction: column !important;
    box-shadow: none !important; margin: 0 auto !important;
    background: var(--primary-bg) !important;
}
@media (min-width: 580px) {
    #data-modal { align-items: center !important; padding: 16px !important; }
    #data-modal .modal-content { border-radius: 24px !important; max-height: 88dvh !important; }
}
.dm6 {
    display: flex; flex-direction: column; height: 100%;
    background: var(--primary-bg); color: var(--text-primary);
    font-family: var(--font-family,'Noto Serif SC',serif);
}
.dm6-head {
    flex-shrink: 0; padding: 20px 20px 0;
    display: flex; align-items: center; gap: 14px;
}
.dm6-head-icon {
    width: 42px; height: 42px; border-radius: 14px;
    background: var(--secondary-bg); border: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--accent-color); flex-shrink: 0;
}
.dm6-head-text { flex: 1; }
.dm6-head-title { font-size: 18px; font-weight: 700; letter-spacing: -.5px; color: var(--text-primary); }
.dm6-head-sub { font-size: 11px; color: var(--text-secondary); margin-top: 2px; opacity: .65; }
.dm6-head-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--secondary-bg); border: 1px solid var(--border-color);
    color: var(--text-secondary); display: flex; align-items: center;
    justify-content: center; font-size: 12px; cursor: pointer;
    flex-shrink: 0; transition: all .15s; -webkit-tap-highlight-color: transparent;
}
.dm6-head-close:hover { background: var(--border-color); color: var(--text-primary); }
.dm6-tabs {
    flex-shrink: 0; display: flex; gap: 4px; padding: 14px 16px 0;
}
.dm6-tab {
    flex: 1; padding: 8px 4px; border-radius: 10px; border: none;
    background: transparent; font-size: 11px; font-weight: 600;
    color: var(--text-secondary); cursor: pointer; transition: all .15s;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    font-family: inherit; -webkit-tap-highlight-color: transparent; line-height: 1.3;
}
.dm6-tab i { font-size: 14px; }
.dm6-tab.active {
    background: var(--secondary-bg); color: var(--accent-color);
    border: 1px solid var(--border-color);
}
.dm6-tab:not(.active):hover {
    background: rgba(var(--accent-color-rgb,200,160,120),.07);
    color: var(--text-primary);
}
.dm6-body {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    -webkit-overflow-scrolling: touch; padding: 14px 16px;
}
.dm6-body::-webkit-scrollbar { width: 0; }
.dm6-pane { display: none; }
.dm6-pane.active { display: block; }
.dm6-gauge-wrap {
    background: var(--secondary-bg); border: 1px solid var(--border-color);
    border-radius: 18px; padding: 16px 18px; margin-bottom: 10px;
}
.dm6-gauge-top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.dm6-gauge-label {
    font-size: 11px; font-weight: 700; letter-spacing: .8px;
    text-transform: uppercase; color: var(--text-secondary); flex: 1;
}
.dm6-gauge-pct {
    font-size: 24px; font-weight: 900; letter-spacing: -1.5px;
    color: var(--text-primary); font-variant-numeric: tabular-nums;
}
.dm6-gauge-track { height: 5px; background: var(--border-color); border-radius: 99px; overflow: hidden; margin-bottom: 10px; }
.dm6-gauge-fill { height: 100%; border-radius: 99px; background: var(--accent-color); transition: width 1s cubic-bezier(.4,0,.2,1); }
.dm6-gauge-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
.dm6-stat { background: var(--primary-bg); border-radius: 10px; padding: 8px 10px; border: 1px solid var(--border-color); }
.dm6-stat-n { font-size: 13px; font-weight: 800; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.dm6-stat-l { font-size: 9px; color: var(--text-secondary); margin-top: 1px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dm6-section-label {
    font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--text-secondary);
    opacity: .5; margin: 14px 2px 7px;
}
.dm6-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dm6-card {
    background: var(--secondary-bg); border: 1px solid var(--border-color);
    border-radius: 16px; padding: 14px 14px 12px; cursor: pointer;
    transition: all .15s; -webkit-tap-highlight-color: transparent;
    position: relative; overflow: hidden;
}
.dm6-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 2px; background: var(--accent-color); opacity: 0; transition: opacity .15s;
}
.dm6-card:hover { border-color: var(--accent-color); }
.dm6-card:hover::after { opacity: 1; }
.dm6-card:active { transform: scale(.97); }
.dm6-card-icon {
    width: 32px; height: 32px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; margin-bottom: 9px;
}
.dm6-card-name { font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
.dm6-card-desc { font-size: 10px; color: var(--text-secondary); margin-top: 3px; opacity: .6; line-height: 1.4; }
.dm6-ic-bl { background: rgba(74,144,226,.12); color: #4A90E2; }
.dm6-ic-gr { background: rgba(52,199,89,.12); color: #34C759; }
.dm6-ic-ac { background: rgba(var(--accent-color-rgb,200,160,120),.12); color: var(--accent-color); }
.dm6-ic-pu { background: rgba(175,82,222,.12); color: #AF52DE; }
.dm6-ic-te { background: rgba(90,200,250,.12); color: #5AC8FA; }
.dm6-ic-am { background: rgba(255,159,10,.12); color: #FF9F0A; }
.dm6-row {
    background: var(--secondary-bg); border: 1px solid var(--border-color);
    border-radius: 14px; padding: 13px 14px;
    display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
    transition: border-color .15s;
}
.dm6-row.tap { cursor: pointer; }
.dm6-row.tap:hover { border-color: var(--accent-color); }
.dm6-row.tap:active { transform: scale(.99); }
.dm6-row-icon { width: 34px; height: 34px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
.dm6-row-meta { flex: 1; min-width: 0; }
.dm6-row-name { font-size: 14px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
.dm6-row-desc { font-size: 11px; color: var(--text-secondary); margin-top: 2px; opacity: .6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dm6-row-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.dm6-tog { position: relative; width: 44px; height: 24px; display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; }
.dm6-tog input { opacity:0; width:0; height:0; position:absolute; }
.dm6-tog-bg { position:absolute; inset:0; background:rgba(120,120,128,.2); border-radius:99px; transition:background .25s; }
.dm6-tog-bg::after { content:''; position:absolute; width:18px; height:18px; border-radius:50%; background:#fff; top:3px; left:3px; transition:transform .25s cubic-bezier(.34,1.3,.64,1); box-shadow:0 1px 4px rgba(0,0,0,.18); }
.dm6-tog input:checked + .dm6-tog-bg { background:var(--accent-color); }
.dm6-tog input:checked + .dm6-tog-bg::after { transform:translateX(20px); }
.dm6-btn {
    height: 30px; padding: 0 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600; border: 1.5px solid var(--border-color);
    background: var(--primary-bg); color: var(--text-primary);
    cursor: pointer; white-space: nowrap;
    display: inline-flex; align-items: center; gap: 4px;
    transition: all .15s; font-family: inherit; -webkit-tap-highlight-color: transparent;
}
.dm6-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
.dm6-btn:active { transform: scale(.94); }
.dm6-btn.fill { background: var(--accent-color); border-color: transparent; color: #fff; }
.dm6-btn.fill:hover { opacity: .82; color: #fff; }
.dm6-about-top { text-align: center; padding: 20px 0 10px; }
.dm6-about-logo {
    width: 56px; height: 56px; border-radius: 18px;
    background: var(--secondary-bg); border: 1.5px solid var(--border-color);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin: 0 auto 10px; color: var(--accent-color);
}
.dm6-about-name { font-size: 16px; font-weight: 800; color: var(--text-primary); letter-spacing: -.5px; }
.dm6-about-ver { font-size: 11px; color: var(--text-secondary); margin-top: 3px; opacity: .55; }
.dm6-danger {
    background: rgba(255,59,48,.03); border: 1.5px solid rgba(255,59,48,.2);
    border-radius: 16px; overflow: hidden; margin-top: 6px;
}
.dm6-danger-head { padding: 11px 14px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,59,48,.12); }
.dm6-danger-lbl { font-size: 10px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #FF3B30; flex: 1; }
.dm6-danger-warn { font-size: 10px; color: rgba(255,59,48,.5); font-style: italic; }
.dm6-danger-body { padding: 12px 14px; }
.dm6-danger-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px; opacity: .8; }
.dm6-danger-btns { display: flex; gap: 8px; }
.dm6-dbtn-soft {
    flex: 1; height: 40px; border-radius: 10px;
    border: 1.5px solid var(--border-color); background: var(--secondary-bg);
    color: var(--text-secondary); font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all .15s; font-family: inherit; -webkit-tap-highlight-color: transparent;
}
.dm6-dbtn-soft:hover { border-color: #FF9F0A; color: #FF9F0A; }
.dm6-dbtn-hard {
    flex: 1.2; height: 40px; border-radius: 10px; border: none;
    background: #FF3B30; color: #fff; font-size: 13px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all .15s; font-family: inherit; -webkit-tap-highlight-color: transparent;
    box-shadow: 0 3px 12px rgba(255,59,48,.28);
}
.dm6-dbtn-hard:hover { background: #d42b21; }
.dm6-dbtn-hard:active { transform: scale(.97); box-shadow: none; }
.dm6-foot {
    flex-shrink: 0; padding: 10px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom,12px));
    border-top: 1px solid var(--border-color); background: var(--secondary-bg);
}
.dm6-back {
    width: 100%; height: 42px; border-radius: 12px;
    border: 1.5px solid var(--border-color); background: transparent;
    color: var(--text-secondary); font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: all .15s; font-family: inherit; -webkit-tap-highlight-color: transparent;
}
.dm6-back:hover { color: var(--text-primary); border-color: var(--text-secondary); }
        `;
        document.head.appendChild(s);
    }

    function buildHTML() {
        return `
<div class="dm6">
  <div class="dm6-head">
    <div class="dm6-head-icon"><i class="fas fa-database"></i></div>
    <div class="dm6-head-text">
      <div class="dm6-head-title">数据管理</div>
      <div class="dm6-head-sub">存储 · 备份 · 通知 · 关于</div>
    </div>
    <button class="dm6-head-close" id="close-data"><i class="fas fa-times"></i></button>
  </div>

  <div class="dm6-tabs">
    <button class="dm6-tab active" data-tab="storage"><i class="fas fa-hdd"></i>存储</button>
    <button class="dm6-tab" data-tab="backup"><i class="fas fa-archive"></i>备份</button>
    <button class="dm6-tab" data-tab="notify"><i class="fas fa-bell"></i>通知</button>
    <button class="dm6-tab" data-tab="about"><i class="fas fa-info-circle"></i>关于</button>
  </div>

  <div class="dm6-body">

    <!-- 存储 -->
    <div class="dm6-pane active" id="dm6-pane-storage">
      <div class="dm6-gauge-wrap">
        <div class="dm6-gauge-top">
          <span class="dm6-gauge-label">本地存储占用</span>
          <span class="dm6-gauge-pct" id="dm6-pct">—</span>
        </div>
        <div class="dm6-gauge-track"><div class="dm6-gauge-fill" id="dm6-bar" style="width:0%"></div></div>
        <div class="dm6-gauge-stats">
          <div class="dm6-stat"><div class="dm6-stat-n" id="dm6-s-msg">—</div><div class="dm6-stat-l">聊天记录</div></div>
          <div class="dm6-stat"><div class="dm6-stat-n" id="dm6-s-cfg">—</div><div class="dm6-stat-l">设置数据</div></div>
          <div class="dm6-stat"><div class="dm6-stat-n" id="dm6-s-med">—</div><div class="dm6-stat-l">图片媒体</div></div>
        </div>
        <div style="margin-top:8px;font-size:10px;color:var(--text-secondary);opacity:.5;text-align:right;" id="dm6-sz">—</div>
      </div>

      <div class="dm6-section-label">危险操作</div>
      <div class="dm6-danger">
        <div class="dm6-danger-head">
          <i class="fas fa-exclamation-triangle" style="color:#FF3B30;font-size:12px;"></i>
          <span class="dm6-danger-lbl">清除数据</span>
          <span class="dm6-danger-warn">不可撤销</span>
        </div>
        <div class="dm6-danger-body">
          <div class="dm6-danger-desc">
            「仅清除消息」只删除当前会话的聊天记录，设置与字卡保留。<br>
            「清空全部」将彻底抹除所有本地数据，页面刷新后重新开始。
          </div>
          <div class="dm6-danger-btns">
            <button class="dm6-dbtn-soft" id="dm6-clear-msgs"><i class="fas fa-comment-slash"></i>仅清除消息</button>
            <button class="dm6-dbtn-hard" id="dm6-clear-all"><i class="fas fa-trash-alt"></i>清空全部</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 备份 -->
    <div class="dm6-pane" id="dm6-pane-backup">
      <div class="dm6-section-label">全量操作</div>
      <div class="dm6-row">
        <div class="dm6-row-icon dm6-ic-bl"><i class="fas fa-layer-group"></i></div>
        <div class="dm6-row-meta">
          <div class="dm6-row-name">全量备份</div>
          <div class="dm6-row-desc">外观、设置、字卡、心情、信封全部打包</div>
        </div>
        <div class="dm6-row-right">
          <button class="dm6-btn fill" id="export-all-settings"><i class="fas fa-download"></i>导出</button>
          <button class="dm6-btn" id="import-all-settings"><i class="fas fa-upload"></i>导入</button>
        </div>
      </div>

      <div class="dm6-section-label">单项操作</div>
      <div class="dm6-grid">
        <div class="dm6-card" id="dm6-card-export">
          <div class="dm6-card-icon dm6-ic-gr"><i class="fas fa-comments"></i></div>
          <div class="dm6-card-name">导出聊天</div>
          <div class="dm6-card-desc">仅导出当前会话消息</div>
        </div>
        <div class="dm6-card" id="dm6-card-import">
          <div class="dm6-card-icon dm6-ic-ac"><i class="fas fa-file-import"></i></div>
          <div class="dm6-card-name">导入聊天</div>
          <div class="dm6-card-desc">从备份文件恢复消息</div>
        </div>
      </div>
      <div style="display:none">
        <button id="export-chat-btn"></button>
        <button id="import-chat-btn"></button>
      </div>
    </div>

    <!-- 通知 -->
    <div class="dm6-pane" id="dm6-pane-notify">
      <div class="dm6-section-label">消息通知</div>
      <div class="dm6-row">
        <div class="dm6-row-icon dm6-ic-am"><i class="fas fa-bell"></i></div>
        <div class="dm6-row-meta">
          <div class="dm6-row-name">后台消息推送</div>
          <div class="dm6-row-desc" id="notif-status-text">后台挂起时弹出新消息提醒</div>
        </div>
        <div class="dm6-row-right">
          <label class="dm6-tog">
            <input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)">
            <span class="dm6-tog-bg"></span>
          </label>
        </div>
      </div>

      <div class="dm6-section-label">视频通话</div>
      <div class="dm6-row">
        <div class="dm6-row-icon dm6-ic-te"><i class="fas fa-video"></i></div>
        <div class="dm6-row-meta">
          <div class="dm6-row-name">模拟视频通话</div>
          <div class="dm6-row-desc">开启后可发起通话，对方也会随机来电</div>
        </div>
        <div class="dm6-row-right">
          <label class="dm6-tog">
            <input type="checkbox" id="call-enabled-toggle">
            <span class="dm6-tog-bg"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div class="dm6-pane" id="dm6-pane-about">
      <div class="dm6-about-top">
        <div class="dm6-about-logo"><i class="fas fa-heart"></i></div>
        <div class="dm6-about-name">传讯</div>
        <div class="dm6-about-ver">Chat Simulator · Local Edition</div>
      </div>

      <div class="dm6-section-label">工具</div>
      <div class="dm6-row tap" id="replay-tutorial-btn-row">
        <div class="dm6-row-icon dm6-ic-ac"><i class="fas fa-compass"></i></div>
        <div class="dm6-row-meta">
          <div class="dm6-row-name">重放新手引导</div>
          <div class="dm6-row-desc">重新播放功能介绍教程</div>
        </div>
        <div class="dm6-row-right">
          <button class="dm6-btn" id="replay-tutorial-btn"><i class="fas fa-play"></i>播放</button>
        </div>
      </div>
      <div class="dm6-row tap" id="open-credits-row">
        <div class="dm6-row-icon dm6-ic-pu"><i class="fas fa-scroll"></i></div>
        <div class="dm6-row-meta">
          <div class="dm6-row-name">声明与致谢</div>
          <div class="dm6-row-desc">开源声明、致谢名单</div>
        </div>
        <div class="dm6-row-right">
          <button class="dm6-btn" id="open-credits-btn"><i class="fas fa-arrow-right"></i>查看</button>
        </div>
      </div>
    </div>

  </div>

  <div class="dm6-foot">
    <button class="dm6-back" id="back-data"
      onclick="(function(){hideModal(document.getElementById('data-modal'));showModal(document.getElementById('settings-modal'))})()">
      <i class="fas fa-arrow-left"></i>返回设置
    </button>
  </div>
</div>
        `;
    }

    function fmt(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(2) + ' MB';
    }

    function updateStats() {
        try {
            let total = 0, msgs = 0, cfg = 0, media = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i) || '';
                const v = localStorage.getItem(k) || '';
                const bytes = (k.length + v.length) * 2;
                total += bytes;
                if (k.includes('messages') || k.includes('session')) msgs += bytes;
                else if (v.startsWith('data:image') || v.startsWith('data:video')) media += bytes;
                else cfg += bytes;
            }
            const pct = Math.min(100, total / (5 * 1024 * 1024) * 100);
            const g = id => document.getElementById(id);
            if (g('dm6-sz')) g('dm6-sz').textContent = fmt(total) + ' / ~5 MB';
            if (g('dm6-pct')) g('dm6-pct').textContent = pct.toFixed(1) + '%';
            const bar = g('dm6-bar');
            if (bar) {
                bar.style.width = pct.toFixed(1) + '%';
                bar.style.background = pct > 80 ? '#FF3B30' : pct > 50 ? '#FF9F0A' : 'var(--accent-color)';
            }
            if (g('dm6-s-msg')) g('dm6-s-msg').textContent = fmt(msgs);
            if (g('dm6-s-cfg')) g('dm6-s-cfg').textContent = fmt(cfg);
            if (g('dm6-s-med')) g('dm6-s-med').textContent = fmt(media);
        } catch (e) {}
    }

    function syncToggles() {
        const n = document.getElementById('notif-permission-toggle');
        if (n) n.checked = localStorage.getItem('notifEnabled') === '1' &&
                            'Notification' in window && Notification.permission === 'granted';
        const c = document.getElementById('call-enabled-toggle');
        if (c) c.checked = localStorage.getItem('callFeatureEnabled') !== 'false';
    }

    function wireTabs(container) {
        const tabs = container.querySelectorAll('.dm6-tab');
        tabs.forEach(tab => {
            if (tab._dm6) return;
            tab._dm6 = true;
            tab.addEventListener('click', () => {
                container.querySelectorAll('.dm6-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.dm6-pane').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const pane = container.querySelector('#dm6-pane-' + tab.dataset.tab);
                if (pane) pane.classList.add('active');
            });
        });
    }

    function wireButtons() {
        const cm = document.getElementById('dm6-clear-msgs');
        if (cm && !cm._dm6) {
            cm._dm6 = true;
            cm.addEventListener('click', () => {
                if (!confirm('确定要清除当前会话的所有消息吗？此操作无法恢复！')) return;
                if (typeof messages !== 'undefined') messages.length = 0;
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof renderMessages === 'function') renderMessages();
                if (typeof showNotification === 'function') showNotification('当前会话消息已清除', 'success');
            });
        }
        const ca = document.getElementById('dm6-clear-all');
        if (ca && !ca._dm6) {
            ca._dm6 = true;
            ca.addEventListener('click', () => {
                if (!confirm('⚠️【高危操作】确定要清空全部数据吗？\n\n所有消息、设置、字卡、头像等将被永久删除，不可恢复！')) return;
                if (!confirm('最后确认：清空后页面将自动刷新，无法撤销，继续吗？')) return;
                window._skipBackup = true;
                const doReset = () => {
                    localStorage.clear();
                    if (typeof showNotification === 'function') showNotification('所有数据已清空，即将刷新…', 'info', 2000);
                    setTimeout(() => { window.location.href = window.location.pathname + '?reset=' + Date.now(); }, 2000);
                };
                window.localforage ? localforage.clear().then(doReset).catch(doReset) : doReset();
            });
        }
        const ce = document.getElementById('dm6-card-export');
        if (ce && !ce._dm6) { ce._dm6 = true; ce.addEventListener('click', () => { const r = document.getElementById('export-chat-btn'); if (r) r.click(); }); }
        const ci = document.getElementById('dm6-card-import');
        if (ci && !ci._dm6) { ci._dm6 = true; ci.addEventListener('click', () => { const r = document.getElementById('import-chat-btn'); if (r) r.click(); }); }
    }

    function applyLayout(mc) {
        if (!mc) return;
        mc.style.setProperty('padding', '0', 'important');
        mc.style.setProperty('overflow', 'hidden', 'important');
        mc.style.setProperty('display', 'flex', 'important');
        mc.style.setProperty('flex-direction', 'column', 'important');
    }

    function rebuild() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;
        const mc = modal.querySelector('.modal-content');
        if (!mc || mc.dataset.dm6Built) return;
        mc.dataset.dm6Built = '1';
        mc.innerHTML = buildHTML();
        applyLayout(mc);
        wireTabs(mc);
        syncToggles();
        updateStats();
        wireButtons();
    }

    function watch() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;
        new MutationObserver(() => {
            const d = modal.style.display;
            if (d === 'flex' || d === 'block') {
                rebuild();
                syncToggles();
                updateStats();
                wireButtons();
                setTimeout(() => applyLayout(modal.querySelector('.modal-content')), 40);
            }
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    function init() {
        injectCSS();
        const go = () => { rebuild(); watch(); };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(go, 300));
        } else {
            setTimeout(go, 300);
        }
    }

    init();
})();
