/**
 * data-modal.js — 数据管理界面 v6
 * 设计风格：极简卡片 · 精致细节 · 全主题适配
 */
(function () {
    'use strict';

    function injectCSS() {
        if (document.getElementById('dm6-style')) return;
        const s = document.createElement('style');
        s.id = 'dm6-style';
        s.textContent = `
/* ── Modal shell reset ── */
#data-modal {
    align-items: flex-end !important;
    padding: 0 !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    background: rgba(0,0,0,0.5) !important;
}
#data-modal .modal-content {
    padding: 0 !important;
    width: 100% !important;
    max-width: 520px !important;
    max-height: 92dvh !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    box-shadow: 0 -2px 40px rgba(0,0,0,0.18) !important;
    margin: 0 auto !important;
    background: var(--primary-bg) !important;
}
@media (min-width: 580px) {
    #data-modal { align-items: center !important; padding: 24px !important; }
    #data-modal .modal-content {
        border-radius: 26px !important;
        max-height: 88dvh !important;
        box-shadow: 0 8px 48px rgba(0,0,0,0.22) !important;
    }
}

/* ── Root shell ── */
.dm6-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--primary-bg);
    color: var(--text-primary);
    font-family: var(--font-family, 'Noto Serif SC', serif);
    border-radius: inherit;
    overflow: hidden;
}

/* ── Header ── */
.dm6-header {
    flex-shrink: 0;
    padding: 20px 20px 16px;
    background: var(--secondary-bg);
    border-bottom: 1px solid var(--border-color);
}
.dm6-header-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}
.dm6-header-icon {
    width: 42px; height: 42px;
    border-radius: 14px;
    background: linear-gradient(135deg,
        var(--accent-color) 0%,
        var(--accent-color-dark, var(--accent-color)) 100%
    );
    display: flex; align-items: center; justify-content: center;
    font-size: 17px;
    color: var(--send-btn-text-color, #fff);
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(var(--accent-color-rgb,150,150,150), 0.32);
}
.dm6-header-text { flex: 1; min-width: 0; }
.dm6-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.4px;
    line-height: 1.15;
}
.dm6-subtitle {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
    opacity: 0.7;
}
.dm6-close {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 1.5px solid var(--border-color);
    background: transparent;
    color: var(--text-secondary);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; cursor: pointer;
    transition: all .15s;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
}
.dm6-close:hover { background: var(--accent-color); color: var(--send-btn-text-color, #fff); border-color: transparent; }
.dm6-close:active { transform: scale(.9); }

/* ── Storage widget ── */
.dm6-stobox {
    background: var(--primary-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 13px 14px 11px;
}
.dm6-sto-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 9px;
}
.dm6-sto-label {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.2px;
    color: var(--text-secondary); opacity: .75;
}
.dm6-sto-num {
    font-size: 11px; font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
}
.dm6-sto-track {
    height: 3.5px;
    background: var(--border-color);
    border-radius: 99px; overflow: hidden;
    margin-bottom: 10px;
}
.dm6-sto-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-color-dark, var(--accent-color)));
    transition: width 1.2s cubic-bezier(.22,1,.36,1);
    min-width: 3px;
}
.dm6-sto-chips {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 7px;
}
.dm6-chip {
    background: var(--secondary-bg);
    border-radius: 10px;
    padding: 7px 5px 6px;
    text-align: center;
    border: 1px solid var(--border-color);
}
.dm6-chip-n {
    font-size: 11.5px; font-weight: 800;
    color: var(--text-primary); line-height: 1.2;
}
.dm6-chip-l { font-size: 9px; color: var(--text-secondary); margin-top: 2px; }

/* ── Scrollable body ── */
.dm6-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding: 16px 16px 4px;
}
.dm6-body::-webkit-scrollbar { display: none; }

/* ── Section group ── */
.dm6-group { margin-bottom: 14px; }
.dm6-group-label {
    font-size: 10.5px; font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 1.2px;
    padding: 0 5px; margin-bottom: 6px; opacity: 0.65;
}
.dm6-card {
    background: var(--secondary-bg);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
}

/* ── Row ── */
.dm6-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    position: relative;
    -webkit-tap-highlight-color: transparent;
    transition: background .1s;
}
.dm6-row::after {
    content: '';
    position: absolute;
    bottom: 0; left: 52px; right: 0;
    height: 1px;
    background: var(--border-color);
    opacity: 0.55;
}
.dm6-row:last-child::after { display: none; }
.dm6-row.tap { cursor: pointer; }
.dm6-row.tap:hover  { background: rgba(var(--accent-color-rgb,150,150,150), 0.04); }
.dm6-row.tap:active { background: rgba(var(--accent-color-rgb,150,150,150), 0.09); }

/* Icon box */
.dm6-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
}
.dm6-i-acc  { background: rgba(var(--accent-color-rgb,200,150,150),.13); color: var(--accent-color); }
.dm6-i-blue { background: rgba(74,144,226,.12); color: #4A90E2; }
.dm6-i-green{ background: rgba(52,199,89,.12); color: #34C759; }
.dm6-i-amber{ background: rgba(255,159,10,.13); color: #FF9F0A; }
.dm6-i-purp { background: rgba(175,82,222,.12); color: #AF52DE; }
.dm6-i-teal { background: rgba(90,200,250,.12); color: #5AC8FA; }
.dm6-i-red  { background: rgba(255,59,48,.11); color: #FF3B30; }

/* Row text */
.dm6-meta { flex: 1; min-width: 0; }
.dm6-name {
    font-size: 13.5px; font-weight: 600;
    color: var(--text-primary); line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dm6-desc {
    font-size: 11px; color: var(--text-secondary);
    margin-top: 2px; opacity: .7; line-height: 1.35;
}
#notif-status-text { white-space: normal !important; }

/* Right controls */
.dm6-end { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }

/* Buttons */
.dm6-btn {
    height: 30px; padding: 0 11px;
    border-radius: 8px;
    font-size: 12px; font-weight: 600;
    border: 1.5px solid var(--border-color);
    background: var(--primary-bg);
    color: var(--text-secondary);
    cursor: pointer; white-space: nowrap;
    display: inline-flex; align-items: center; gap: 4px;
    transition: all .13s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
}
.dm6-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
.dm6-btn:active { transform: scale(.93); }
.dm6-btn.fill {
    background: var(--accent-color);
    border-color: transparent;
    color: var(--send-btn-text-color, #fff);
    box-shadow: 0 2px 8px rgba(var(--accent-color-rgb,150,150,150),.28);
}
.dm6-btn.fill:hover { opacity: .83; border-color: transparent; color: var(--send-btn-text-color, #fff); }

/* Toggle */
.dm6-tog {
    position: relative; display: inline-flex; align-items: center;
    width: 44px; height: 25px; flex-shrink: 0; cursor: pointer;
}
.dm6-tog input { opacity: 0; width: 0; height: 0; position: absolute; }
.dm6-tog-bg {
    position: absolute; inset: 0;
    background: rgba(120,120,128,.22);
    border-radius: 99px;
    transition: background .22s;
}
.dm6-tog-bg::after {
    content: ''; position: absolute;
    width: 19px; height: 19px; border-radius: 50%;
    background: #fff;
    top: 3px; left: 3px;
    transition: transform .22s cubic-bezier(.34,1.4,.64,1);
    box-shadow: 0 2px 4px rgba(0,0,0,.22);
}
.dm6-tog input:checked + .dm6-tog-bg { background: var(--accent-color); }
.dm6-tog input:checked + .dm6-tog-bg::after { transform: translateX(19px); }

/* ── Danger zone ── */
.dm6-danger {
    background: var(--secondary-bg);
    border-radius: 16px;
    border: 1px solid rgba(255,59,48,.22);
    overflow: hidden;
    margin-bottom: 14px;
}
.dm6-danger-head {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 14px 10px;
    border-bottom: 1px solid rgba(255,59,48,.13);
    background: rgba(255,59,48,.03);
}
.dm6-danger-title {
    font-size: 10.5px; font-weight: 800;
    letter-spacing: 1.2px; text-transform: uppercase;
    color: #FF3B30; flex: 1;
}
.dm6-danger-note { font-size: 10px; color: rgba(255,59,48,.5); font-style: italic; }
.dm6-danger-body { padding: 12px 14px; }
.dm6-danger-text {
    font-size: 11.5px; color: var(--text-secondary);
    line-height: 1.6; margin-bottom: 12px; opacity: .85;
}
.dm6-danger-btns { display: flex; gap: 8px; }
.dm6-soft {
    flex: 1; height: 40px; border-radius: 10px;
    border: 1.5px solid var(--border-color);
    background: var(--primary-bg);
    color: var(--text-secondary);
    font-size: 12.5px; font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    transition: all .13s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
}
.dm6-soft:hover { border-color: #FF9F0A; color: #FF9F0A; }
.dm6-soft:active { transform: scale(.97); }
.dm6-hard {
    flex: 1.35; height: 40px; border-radius: 10px;
    border: none;
    background: #FF3B30;
    color: #fff;
    font-size: 12.5px; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    transition: all .13s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 3px 12px rgba(255,59,48,.3);
}
.dm6-hard:hover { background: #d62b20; }
.dm6-hard:active { transform: scale(.97); box-shadow: none; }

/* ── Footer ── */
.dm6-footer {
    flex-shrink: 0;
    padding: 12px 16px;
    padding-bottom: max(14px, env(safe-area-inset-bottom, 14px));
    border-top: 1px solid var(--border-color);
    background: var(--secondary-bg);
}
.dm6-back {
    width: 100%; height: 42px; border-radius: 12px;
    border: 1.5px solid var(--border-color);
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: all .13s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
}
.dm6-back:hover { color: var(--text-primary); border-color: var(--text-secondary); }
.dm6-back:active { transform: scale(.98); }
        `;
        document.head.appendChild(s);
    }

    function buildHTML() {
        return `
<div class="dm6-shell">

  <!-- Header with storage -->
  <div class="dm6-header">
    <div class="dm6-header-row">
      <div class="dm6-header-icon"><i class="fas fa-database"></i></div>
      <div class="dm6-header-text">
        <div class="dm6-title">数据管理</div>
        <div class="dm6-subtitle">备份 · 恢复 · 通知 · 清理</div>
      </div>
      <button class="dm6-close" id="close-data" aria-label="关闭">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="dm6-stobox">
      <div class="dm6-sto-top">
        <span class="dm6-sto-label">本地存储</span>
        <span class="dm6-sto-num" id="dm6-sz">计算中…</span>
      </div>
      <div class="dm6-sto-track">
        <div class="dm6-sto-fill" id="dm6-bar" style="width:0%"></div>
      </div>
      <div class="dm6-sto-chips">
        <div class="dm6-chip"><div class="dm6-chip-n" id="dm6-s-msg">—</div><div class="dm6-chip-l">聊天记录</div></div>
        <div class="dm6-chip"><div class="dm6-chip-n" id="dm6-s-cfg">—</div><div class="dm6-chip-l">设置数据</div></div>
        <div class="dm6-chip"><div class="dm6-chip-n" id="dm6-s-med">—</div><div class="dm6-chip-l">图片媒体</div></div>
      </div>
    </div>
  </div>

  <!-- Scrollable body -->
  <div class="dm6-body">

    <!-- 通知 -->
    <div class="dm6-group">
      <div class="dm6-group-label">通知</div>
      <div class="dm6-card">
        <div class="dm6-row">
          <div class="dm6-icon dm6-i-amber"><i class="fas fa-bell"></i></div>
          <div class="dm6-meta">
            <div class="dm6-name">后台消息推送</div>
            <div class="dm6-desc" id="notif-status-text">后台挂起时弹出系统提醒</div>
          </div>
          <div class="dm6-end">
            <label class="dm6-tog">
              <input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)">
              <span class="dm6-tog-bg"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 备份与恢复 -->
    <div class="dm6-group">
      <div class="dm6-group-label">备份与恢复</div>
      <div class="dm6-card">
        <div class="dm6-row">
          <div class="dm6-icon dm6-i-acc"><i class="fas fa-layer-group"></i></div>
          <div class="dm6-meta">
            <div class="dm6-name">全量备份</div>
            <div class="dm6-desc">外观、设置、字卡、心情、信封全部打包</div>
          </div>
          <div class="dm6-end">
            <button class="dm6-btn fill" id="export-all-settings"><i class="fas fa-download"></i> 导出</button>
            <button class="dm6-btn" id="import-all-settings"><i class="fas fa-upload"></i> 导入</button>
          </div>
        </div>
        <div class="dm6-row">
          <div class="dm6-icon dm6-i-green"><i class="fas fa-comments"></i></div>
          <div class="dm6-meta">
            <div class="dm6-name">聊天记录</div>
            <div class="dm6-desc">仅导出 / 导入消息内容</div>
          </div>
          <div class="dm6-end">
            <button class="dm6-btn fill" id="export-chat-btn"><i class="fas fa-download"></i> 导出</button>
            <button class="dm6-btn" id="import-chat-btn"><i class="fas fa-upload"></i> 导入</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能 -->
    <div class="dm6-group">
      <div class="dm6-group-label">功能</div>
      <div class="dm6-card">
        <div class="dm6-row">
          <div class="dm6-icon dm6-i-teal"><i class="fas fa-video"></i></div>
          <div class="dm6-meta">
            <div class="dm6-name">模拟视频通话</div>
            <div class="dm6-desc">开启后可发起通话，对方也会随机来电</div>
          </div>
          <div class="dm6-end">
            <label class="dm6-tog">
              <input type="checkbox" id="call-enabled-toggle">
              <span class="dm6-tog-bg"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div class="dm6-group">
      <div class="dm6-group-label">关于</div>
      <div class="dm6-card">
        <div class="dm6-row tap" id="replay-tutorial-btn-row">
          <div class="dm6-icon dm6-i-acc"><i class="fas fa-compass"></i></div>
          <div class="dm6-meta">
            <div class="dm6-name">重放新手引导</div>
            <div class="dm6-desc">重新播放功能介绍教程</div>
          </div>
          <div class="dm6-end">
            <button class="dm6-btn" id="replay-tutorial-btn"><i class="fas fa-play"></i> 播放</button>
          </div>
        </div>
        <div class="dm6-row tap" id="open-credits-row">
          <div class="dm6-icon dm6-i-purp"><i class="fas fa-scroll"></i></div>
          <div class="dm6-meta">
            <div class="dm6-name">声明与致谢</div>
            <div class="dm6-desc">开源声明、致谢名单</div>
          </div>
          <div class="dm6-end">
            <button class="dm6-btn" id="open-credits-btn"><i class="fas fa-arrow-right"></i> 查看</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 危险操作 -->
    <div class="dm6-danger">
      <div class="dm6-danger-head">
        <i class="fas fa-exclamation-triangle" style="color:#FF3B30;font-size:12px;flex-shrink:0;"></i>
        <span class="dm6-danger-title">危险操作</span>
        <span class="dm6-danger-note">不可撤销</span>
      </div>
      <div class="dm6-danger-body">
        <div class="dm6-danger-text">
          「仅清除消息」只删除当前会话聊天记录，设置与字卡保留。<br>
          「清空全部」将抹除所有本地数据，页面刷新后重新开始。
        </div>
        <div class="dm6-danger-btns">
          <button class="dm6-soft" id="dm6-clear-msgs">
            <i class="fas fa-comment-slash"></i> 仅清除消息
          </button>
          <button class="dm6-hard" id="dm6-clear-all">
            <i class="fas fa-trash-alt"></i> 清空全部
          </button>
        </div>
      </div>
    </div>

    <div style="height:6px;"></div>
  </div><!-- /dm6-body -->

  <!-- Footer -->
  <div class="dm6-footer">
    <button class="dm6-back" id="back-data"
      onclick="(function(){hideModal(document.getElementById('data-modal'));showModal(document.getElementById('settings-modal'))})()">
      <i class="fas fa-arrow-left"></i> 返回设置
    </button>
  </div>

</div><!-- /dm6-shell -->
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
            const pct = Math.min(100, total / (5 * 1024 * 1024) * 100).toFixed(1);
            const g = id => document.getElementById(id);
            const sz  = g('dm6-sz');  if (sz) sz.textContent = fmt(total) + ' / ~5 MB';
            const bar = g('dm6-bar'); if (bar) {
                bar.style.width = pct + '%';
                if (parseFloat(pct) > 80)
                    bar.style.background = 'linear-gradient(90deg,#FF3B30,#ff6b6b)';
                else if (parseFloat(pct) > 50)
                    bar.style.background = 'linear-gradient(90deg,#FF9F0A,#ffcc44)';
                else
                    bar.style.background = 'linear-gradient(90deg,var(--accent-color),var(--accent-color-dark,var(--accent-color)))';
            }
            const sm = g('dm6-s-msg'); if (sm) sm.textContent = fmt(msgs);
            const sc = g('dm6-s-cfg'); if (sc) sc.textContent = fmt(cfg);
            const se = g('dm6-s-med'); if (se) se.textContent = fmt(media);
        } catch (e) {}
    }

    function syncToggles() {
        const n = document.getElementById('notif-permission-toggle');
        if (n) {
            const enabled = localStorage.getItem('notifEnabled') === '1';
            const granted = ('Notification' in window) && Notification.permission === 'granted';
            n.checked = enabled && granted;
        }
        const c = document.getElementById('call-enabled-toggle');
        if (c) c.checked = localStorage.getItem('callFeatureEnabled') !== 'false';
    }

    function wireButtons() {
        const clearMsgs = document.getElementById('dm6-clear-msgs');
        if (clearMsgs && !clearMsgs._dm6) {
            clearMsgs._dm6 = true;
            clearMsgs.addEventListener('click', () => {
                if (!confirm('确定要清除当前会话的所有消息吗？此操作无法恢复！')) return;
                if (typeof messages !== 'undefined') messages.length = 0;
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof renderMessages === 'function') renderMessages();
                if (typeof showNotification === 'function') showNotification('当前会话消息已清除', 'success');
            });
        }
        const clearAll = document.getElementById('dm6-clear-all');
        if (clearAll && !clearAll._dm6) {
            clearAll._dm6 = true;
            clearAll.addEventListener('click', () => {
                if (!confirm('⚠️【高危操作】确定要清空全部数据吗？\n\n所有消息、设置、字卡、头像等将被永久删除，不可恢复！')) return;
                if (!confirm('最后确认：清空后页面将自动刷新，无法撤销，继续吗？')) return;
                window._skipBackup = true;
                const doReset = () => {
                    localStorage.clear();
                    if (typeof showNotification === 'function')
                        showNotification('所有数据已清空，即将刷新…', 'info', 2000);
                    setTimeout(() => {
                        window.location.href = window.location.pathname + '?reset=' + Date.now();
                    }, 2000);
                };
                if (window.localforage) {
                    localforage.clear().then(doReset).catch(doReset);
                } else { doReset(); }
            });
        }
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
