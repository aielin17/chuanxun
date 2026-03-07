/**
 * data-modal.js — 数据管理界面完整重建
 * Uses dm2-* class prefix to avoid ALL conflicts with styles.css
 */
(function () {
    'use strict';

    /* ── Inject dm2 CSS ─────────────────────────────────────────── */
    function injectCSS() {
        if (document.getElementById('dm2-style')) return;
        const s = document.createElement('style');
        s.id = 'dm2-style';
        s.textContent = `
/* dm2 = data-modal v2, fully namespaced */

/* Force modal-content sizing */
#data-modal .modal-content {
    padding: 0 !important;
    max-width: 460px !important;
    width: calc(100% - 32px) !important;
    max-height: min(700px, 88vh) !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    border-radius: 20px !important;
}

/* ── Header ── */
.dm2-header {
    flex-shrink: 0;
    padding: 0 0 0 0;
    border-bottom: 1.5px solid var(--border-color);
}
.dm2-header-inner {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 20px 18px;
    background: linear-gradient(135deg,
        rgba(var(--accent-color-rgb,224,105,138),.12) 0%,
        rgba(var(--accent-color-rgb,224,105,138),.03) 100%);
}
.dm2-header-icon {
    width: 44px; height: 44px;
    border-radius: 14px;
    background: linear-gradient(145deg,
        rgba(var(--accent-color-rgb,224,105,138),.28),
        rgba(var(--accent-color-rgb,224,105,138),.1));
    display: flex; align-items: center; justify-content: center;
    color: var(--accent-color);
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 3px 12px rgba(var(--accent-color-rgb,224,105,138),.22);
}
.dm2-header-text { flex: 1; min-width: 0; }
.dm2-title {
    font-size: 18px; font-weight: 800;
    color: var(--text-primary);
    line-height: 1.2;
    font-family: var(--font-family);
}
.dm2-subtitle {
    font-size: 11.5px;
    color: var(--text-secondary);
    margin-top: 3px;
    opacity: .75;
}

/* ── Body ── */
.dm2-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 14px 16px 6px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}
.dm2-body::-webkit-scrollbar { display: none; }

/* ── Storage card ── */
.dm2-storage-card {
    background: linear-gradient(135deg,
        rgba(var(--accent-color-rgb,224,105,138),.1) 0%,
        rgba(var(--accent-color-rgb,224,105,138),.03) 100%);
    border: 1.5px solid rgba(var(--accent-color-rgb,224,105,138),.2);
    border-radius: 16px;
    padding: 15px 16px 14px;
    margin-bottom: 18px;
}
.dm2-storage-top {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
}
.dm2-storage-lbl {
    font-size: 10px; font-weight: 800; letter-spacing: .9px;
    text-transform: uppercase; color: var(--accent-color);
}
.dm2-storage-val {
    font-size: 12px; font-weight: 700; color: var(--text-secondary);
}
.dm2-bar-bg {
    height: 4px;
    background: rgba(var(--accent-color-rgb,224,105,138),.15);
    border-radius: 99px; overflow: hidden; margin-bottom: 13px;
}
.dm2-bar-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--accent-color), rgba(var(--accent-color-rgb,224,105,138),.6));
    transition: width .7s ease;
}
.dm2-stat-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 8px;
}
.dm2-stat-item {
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 11px; padding: 9px 6px; text-align: center;
}
.dm2-stat-num {
    font-size: 13px; font-weight: 700; color: var(--text-primary);
    font-variant-numeric: tabular-nums;
}
.dm2-stat-key {
    font-size: 10px; color: var(--text-secondary); margin-top: 2px;
}

/* ── Section label ── */
.dm2-section-lbl {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; font-weight: 800; letter-spacing: 1px;
    text-transform: uppercase; color: var(--text-secondary);
    opacity: .5; margin: 16px 2px 7px;
}

/* ── Card container ── */
.dm2-card {
    background: var(--secondary-bg);
    border: 1.5px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 4px;
}

/* ── Row — THE critical rule: NO WRAP ── */
.dm2-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1.5px solid var(--border-color);
    min-width: 0;
    box-sizing: border-box;
    width: 100%;
}
.dm2-row:last-child { border-bottom: none; }
.dm2-row[data-click] { cursor: pointer; transition: background .18s; }
.dm2-row[data-click]:hover { background: rgba(var(--accent-color-rgb,224,105,138),.04); }
.dm2-row[data-click]:active { background: rgba(var(--accent-color-rgb,224,105,138),.08); }

/* ── Icon ── */
.dm2-icon {
    width: 36px; height: 36px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
}
.dm2-icon-blue   { background:rgba(74,144,226,.14);   color:#4A90E2; }
.dm2-icon-green  { background:rgba(78,186,141,.14);   color:#4EBA8D; }
.dm2-icon-amber  { background:rgba(245,166,35,.14);   color:#f5a623; }
.dm2-icon-purple { background:rgba(168,130,220,.14);  color:#a882dc; }
.dm2-icon-red    { background:rgba(240,80,80,.13);    color:#f05050; }
.dm2-icon-accent { background:rgba(var(--accent-color-rgb,224,105,138),.14); color:var(--accent-color); }

/* ── Info block ── */
.dm2-info {
    flex: 1 1 0%;
    min-width: 0;
    overflow: hidden;
}
.dm2-row-title {
    font-size: 13.5px; font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.3;
    font-family: var(--font-family);
}
.dm2-row-desc {
    font-size: 11.5px; color: var(--text-secondary);
    margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1.3;
}

/* ── Right-side action — NEVER wraps ── */
.dm2-action {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    flex-wrap: nowrap;
}

/* ── Buttons ── */
.dm2-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px; font-weight: 600;
    border: 1.5px solid var(--border-color);
    background: var(--primary-bg);
    color: var(--text-primary);
    cursor: pointer;
    white-space: nowrap;
    transition: all .2s;
    font-family: var(--font-family);
    user-select: none;
}
.dm2-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(var(--accent-color-rgb,224,105,138),.07);
}
.dm2-btn:active { transform: scale(.95); }
.dm2-btn.primary {
    background: var(--accent-color); color: #fff;
    border-color: transparent;
}
.dm2-btn.primary:hover { opacity: .85; }
.dm2-btn.danger {
    color: #f05050; border-color: rgba(240,80,80,.3);
    background: transparent;
}
.dm2-btn.danger:hover { background: rgba(240,80,80,.08); border-color: #f05050; }

/* ── Toggle switch ── */
.dm2-toggle {
    position: relative; display: inline-block;
    width: 44px; height: 24px; flex-shrink: 0;
}
.dm2-toggle input { opacity: 0; width: 0; height: 0; }
.dm2-toggle-track {
    position: absolute; cursor: pointer; inset: 0;
    background: var(--border-color); border-radius: 24px; transition: .3s;
}
.dm2-toggle-track::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; left: 3px; top: 3px;
    transition: .3s; box-shadow: 0 1px 4px rgba(0,0,0,.22);
}
.dm2-toggle input:checked + .dm2-toggle-track { background: var(--accent-color); }
.dm2-toggle input:checked + .dm2-toggle-track::before { transform: translateX(20px); }

/* ── Chevron for nav rows ── */
.dm2-chevron {
    color: var(--text-secondary); opacity: .35;
    font-size: 11px; flex-shrink: 0;
}

/* ── Footer ── */
.dm2-footer {
    flex-shrink: 0;
    display: flex; gap: 8px;
    padding: 12px 16px;
    padding-bottom: max(14px, env(safe-area-inset-bottom, 0px));
    border-top: 1.5px solid var(--border-color);
    background: var(--secondary-bg);
}
.dm2-footer .modal-btn { flex: 1; }

/* ── Mobile ── */
@media (max-width: 480px) {
    #data-modal .modal-content {
        max-width: 100% !important;
        width: 100% !important;
        border-radius: 22px 22px 0 0 !important;
        max-height: 90vh !important;
    }
    #data-modal { align-items: flex-end !important; padding: 0 !important; }
}
        `;
        document.head.appendChild(s);
    }

    /* ── Build the new modal inner HTML ────────────────────────── */
    function buildModalHTML() {
        return `
<div class="dm2-header">
  <div class="dm2-header-inner">
    <div class="dm2-header-icon"><i class="fas fa-database"></i></div>
    <div class="dm2-header-text">
      <div class="dm2-title">数据管理</div>
      <div class="dm2-subtitle">备份 · 恢复 · 通知 · 设置</div>
    </div>
  </div>
</div>

<div class="dm2-body">

  <!-- 存储概览 -->
  <div class="dm2-storage-card" id="dm-storage-card">
    <div class="dm2-storage-top">
      <span class="dm2-storage-lbl"><i class="fas fa-hdd" style="margin-right:5px;"></i>本地存储</span>
      <span class="dm2-storage-val" id="dm-storage-total">计算中…</span>
    </div>
    <div class="dm2-bar-bg"><div class="dm2-bar-fill" id="dm-storage-bar" style="width:0%"></div></div>
    <div class="dm2-stat-grid">
      <div class="dm2-stat-item"><div class="dm2-stat-num" id="dm-stat-msgs">—</div><div class="dm2-stat-key">聊天记录</div></div>
      <div class="dm2-stat-item"><div class="dm2-stat-num" id="dm-stat-settings">—</div><div class="dm2-stat-key">设置数据</div></div>
      <div class="dm2-stat-item"><div class="dm2-stat-num" id="dm-stat-media">—</div><div class="dm2-stat-key">图片/媒体</div></div>
    </div>
  </div>

  <!-- 消息通知 -->
  <div class="dm2-section-lbl"><i class="fas fa-bell"></i>消息通知</div>
  <div class="dm2-card">
    <div class="dm2-row">
      <div class="dm2-icon dm2-icon-amber"><i class="fas fa-bell"></i></div>
      <div class="dm2-info">
        <div class="dm2-row-title">后台消息推送</div>
        <div class="dm2-row-desc" id="notif-status-text">挂在后台时收到新消息自动弹出提醒</div>
      </div>
      <div class="dm2-action">
        <label class="dm2-toggle">
          <input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)">
          <span class="dm2-toggle-track"></span>
        </label>
      </div>
    </div>
  </div>

  <!-- 备份与恢复 -->
  <div class="dm2-section-lbl"><i class="fas fa-archive"></i>备份与恢复</div>
  <div class="dm2-card">
    <div class="dm2-row">
      <div class="dm2-icon dm2-icon-blue"><i class="fas fa-layer-group"></i></div>
      <div class="dm2-info">
        <div class="dm2-row-title">全量备份</div>
        <div class="dm2-row-desc">外观、设置、字卡、心情、信封等</div>
      </div>
      <div class="dm2-action">
        <button class="dm2-btn primary" id="export-all-settings"><i class="fas fa-download"></i> 导出</button>
        <button class="dm2-btn" id="import-all-settings"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>
    <div class="dm2-row">
      <div class="dm2-icon dm2-icon-green"><i class="fas fa-comments"></i></div>
      <div class="dm2-info">
        <div class="dm2-row-title">聊天记录</div>
        <div class="dm2-row-desc">仅导出 / 导入消息内容</div>
      </div>
      <div class="dm2-action">
        <button class="dm2-btn primary" id="export-chat-btn"><i class="fas fa-download"></i> 导出</button>
        <button class="dm2-btn" id="import-chat-btn"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>
  </div>

  <!-- 视频通话 -->
  <div class="dm2-section-lbl"><i class="fas fa-video"></i>视频通话</div>
  <div class="dm2-card" id="call-settings-card">
    <div class="dm2-row">
      <div class="dm2-icon dm2-icon-accent"><i class="fas fa-video"></i></div>
      <div class="dm2-info">
        <div class="dm2-row-title">模拟视频通话</div>
        <div class="dm2-row-desc">开启后可发起通话，梦角也会随机来电</div>
      </div>
      <div class="dm2-action">
        <label class="dm2-toggle">
          <input type="checkbox" id="call-enabled-toggle">
          <span class="dm2-toggle-track"></span>
        </label>
      </div>
    </div>
  </div>

  <!-- 危险操作 -->
  <div class="dm2-section-lbl" style="color:#f05050;opacity:.6;"><i class="fas fa-exclamation-triangle" style="color:#f05050;"></i>危险操作</div>
  <div class="dm2-card">
    <div class="dm2-row">
      <div class="dm2-icon dm2-icon-red"><i class="fas fa-trash-alt"></i></div>
      <div class="dm2-info">
        <div class="dm2-row-title">重置全部数据</div>
        <div class="dm2-row-desc">清空所有本地数据，操作不可撤销</div>
      </div>
      <div class="dm2-action">
        <div class="dm2-btn danger settings-item" id="clear-storage" style="display:inline-flex;align-items:center;gap:5px;">
          <i class="fas fa-sync-alt"></i> 重置
        </div>
      </div>
    </div>
  </div>

  <!-- 关于 -->
  <div class="dm2-section-lbl"><i class="fas fa-info-circle"></i>关于</div>
  <div class="dm2-card">
    <div class="dm2-row" data-click="1" id="replay-tutorial-btn-row" style="cursor:pointer;">
      <div class="dm2-icon dm2-icon-accent"><i class="fas fa-question-circle"></i></div>
      <div class="dm2-info">
        <div class="dm2-row-title">重放新手引导</div>
        <div class="dm2-row-desc">重新播放功能介绍教程</div>
      </div>
      <div class="dm2-action">
        <button class="dm2-btn settings-item" id="replay-tutorial-btn"><i class="fas fa-play"></i> 播放</button>
      </div>
    </div>
    <div class="dm2-row" data-click="1" id="open-credits-row" style="cursor:pointer;">
      <div class="dm2-icon dm2-icon-purple"><i class="fas fa-scroll"></i></div>
      <div class="dm2-info">
        <div class="dm2-row-title">声明与致谢</div>
        <div class="dm2-row-desc">开源声明、致谢名单</div>
      </div>
      <div class="dm2-action">
        <button class="dm2-btn settings-item" id="open-credits-btn"><i class="fas fa-arrow-right"></i> 查看</button>
      </div>
    </div>
  </div>

  <div style="height:8px;"></div>

</div><!-- /dm2-body -->

<div class="dm2-footer">
  <button class="modal-btn modal-btn-secondary" id="back-data" onclick="(function(){hideModal(document.getElementById('data-modal'));showModal(document.getElementById('settings-modal'))})()">
    <i class="fas fa-arrow-left"></i> 返回
  </button>
  <button class="modal-btn modal-btn-secondary" id="close-data">关闭</button>
</div>
        `;
    }

    /* ── Apply inline overrides to modal-content ────────────────── */
    function applyModalContentStyles(mc) {
        mc.style.setProperty('padding', '0', 'important');
        mc.style.setProperty('overflow', 'hidden', 'important');
        mc.style.setProperty('display', 'flex', 'important');
        mc.style.setProperty('flex-direction', 'column', 'important');
        mc.style.setProperty('max-width', '460px', 'important');
        mc.style.setProperty('border-radius', '20px', 'important');
    }

    /* ── Sync toggles after rebuild ─────────────────────────────── */
    function syncToggles() {
        // Notification toggle
        const notifTog = document.getElementById('notif-permission-toggle');
        if (notifTog) {
            const stored = localStorage.getItem('notifEnabled');
            notifTog.checked = stored === 'true';
        }
        // Call toggle
        const callTog = document.getElementById('call-enabled-toggle');
        if (callTog) {
            callTog.checked = localStorage.getItem('callFeatureEnabled') !== 'false';
        }
    }

    /* ── Main rebuild ───────────────────────────────────────────── */
    function rebuild() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;

        const mc = modal.querySelector('.modal-content');
        if (!mc || mc.dataset.dm2Built) return;
        mc.dataset.dm2Built = '1';

        // Replace inner HTML
        mc.innerHTML = buildModalHTML();

        // Force inline styles (override showModal's transform/opacity logic by re-applying after)
        applyModalContentStyles(mc);

        // Keep showModal working: patch opacity/transform back after each open
        // showModal sets opacity=1 and transform='translateY(0) scale(1)' via rAF
        // Our padding:0 etc are set via setProperty with 'important', not touched by showModal
        // So we just need to ensure they stay. Done.

        syncToggles();
    }

    /* ── Watch for modal open ───────────────────────────────────── */
    function watchModal() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;

        new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.type === 'attributes' && m.attributeName === 'style') {
                    const d = modal.style.display;
                    if (d === 'flex' || d === 'block') {
                        rebuild();
                        syncToggles();
                        // Re-apply after showModal's rAF
                        setTimeout(() => {
                            const mc = modal.querySelector('.modal-content');
                            if (mc) applyModalContentStyles(mc);
                        }, 50);
                    }
                }
            }
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    /* ── Init ───────────────────────────────────────────────────── */
    function init() {
        injectCSS();
        const go = () => { rebuild(); watchModal(); };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(go, 300));
        } else {
            setTimeout(go, 300);
        }
    }

    init();
})();
