/**
 * data-modal.js — 数据管理界面 · 全新重设计
 * Mobile-first · 视觉焕新 · 沉浸式卡片设计
 */
(function () {
    'use strict';

    function injectCSS() {
        if (document.getElementById('dm2-style')) return;
        const s = document.createElement('style');
        s.id = 'dm2-style';
        s.textContent = `
/* ═══════════════════════════════════════════════
   dm3 — Data Modal v3  |  Mobile-first redesign
   ═══════════════════════════════════════════════ */

#data-modal .modal-content {
    padding: 0 !important;
    max-width: 480px !important;
    width: calc(100% - 24px) !important;
    max-height: min(88vh, 760px) !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    border-radius: 28px !important;
    box-shadow: 0 32px 80px rgba(0,0,0,.28), 0 8px 24px rgba(0,0,0,.14) !important;
}

/* ── Hero Header ─────────────────────────────── */
.dm3-hero {
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    padding: 28px 24px 22px;
    background: linear-gradient(135deg,
        rgba(var(--accent-color-rgb,224,105,138),.18) 0%,
        rgba(var(--accent-color-rgb,224,105,138),.06) 60%,
        transparent 100%);
    border-bottom: 1px solid rgba(var(--accent-color-rgb,224,105,138),.12);
}
.dm3-hero::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle,
        rgba(var(--accent-color-rgb,224,105,138),.16) 0%,
        transparent 70%);
    pointer-events: none;
}
.dm3-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(var(--accent-color-rgb,224,105,138),.15);
    border: 1px solid rgba(var(--accent-color-rgb,224,105,138),.3);
    color: var(--accent-color);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 10px;
}
.dm3-hero-title {
    font-size: 26px;
    font-weight: 900;
    color: var(--text-primary);
    line-height: 1.15;
    letter-spacing: -.3px;
    font-family: var(--font-family);
}
.dm3-hero-sub {
    font-size: 12.5px;
    color: var(--text-secondary);
    margin-top: 5px;
    opacity: .7;
    font-weight: 400;
}

/* ── Body ────────────────────────────────────── */
.dm3-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 16px 8px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
}
.dm3-body::-webkit-scrollbar { display: none; }

/* ── Storage widget ──────────────────────────── */
.dm3-storage {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg,
        rgba(var(--accent-color-rgb,224,105,138),.14),
        rgba(var(--accent-color-rgb,224,105,138),.04));
    border: 1.5px solid rgba(var(--accent-color-rgb,224,105,138),.22);
    border-radius: 20px;
    padding: 18px 18px 16px;
    margin-bottom: 20px;
}
.dm3-storage::after {
    content: '\\f1c0';
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    position: absolute;
    right: 18px; top: 50%;
    transform: translateY(-50%);
    font-size: 56px;
    color: rgba(var(--accent-color-rgb,224,105,138),.07);
    pointer-events: none;
}
.dm3-storage-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
}
.dm3-storage-label {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--accent-color);
}
.dm3-storage-size {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
}
.dm3-progress {
    height: 6px;
    background: rgba(var(--accent-color-rgb,224,105,138),.15);
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 14px;
}
.dm3-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg,
        var(--accent-color),
        rgba(var(--accent-color-rgb,224,105,138),.5));
    transition: width .8s cubic-bezier(.34,1.56,.64,1);
    box-shadow: 0 0 8px rgba(var(--accent-color-rgb,224,105,138),.4);
}
.dm3-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}
.dm3-stat {
    background: var(--primary-bg);
    border: 1px solid rgba(var(--accent-color-rgb,224,105,138),.1);
    border-radius: 12px;
    padding: 10px 8px 8px;
    text-align: center;
    transition: transform .2s;
}
.dm3-stat:active { transform: scale(.96); }
.dm3-stat-n {
    font-size: 15px;
    font-weight: 800;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
    line-height: 1;
}
.dm3-stat-l {
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 4px;
    opacity: .7;
}

/* ── Section header ──────────────────────────── */
.dm3-section {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 4px;
    margin: 18px 0 8px;
}
.dm3-section-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent-color);
    flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb,224,105,138),.2);
}
.dm3-section-text {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: var(--text-secondary);
    opacity: .55;
}
.dm3-section-line {
    flex: 1;
    height: 1px;
    background: var(--border-color);
    opacity: .5;
}

/* ── Cards ───────────────────────────────────── */
.dm3-card {
    background: var(--secondary-bg);
    border: 1.5px solid var(--border-color);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 6px;
    transition: border-color .2s;
}
.dm3-card:hover {
    border-color: rgba(var(--accent-color-rgb,224,105,138),.25);
}

/* ── Rows ────────────────────────────────────── */
.dm3-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border-color);
    box-sizing: border-box;
    min-height: 68px;
    transition: background .15s;
}
.dm3-row:last-child { border-bottom: none; }
.dm3-row.clickable { cursor: pointer; }
.dm3-row.clickable:active {
    background: rgba(var(--accent-color-rgb,224,105,138),.06);
}

/* ── Icon bubbles ────────────────────────────── */
.dm3-icon {
    width: 40px; height: 40px;
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: transform .2s;
}
.dm3-row:active .dm3-icon { transform: scale(.92); }
.dm3-ic-blue   { background: linear-gradient(135deg,#4a90e2,#5ba3f5); color:#fff; box-shadow:0 4px 12px rgba(74,144,226,.3); }
.dm3-ic-green  { background: linear-gradient(135deg,#27ae60,#2ecc71); color:#fff; box-shadow:0 4px 12px rgba(46,204,113,.3); }
.dm3-ic-amber  { background: linear-gradient(135deg,#f39c12,#f5a623); color:#fff; box-shadow:0 4px 12px rgba(245,166,35,.3); }
.dm3-ic-purple { background: linear-gradient(135deg,#8e44ad,#a882dc); color:#fff; box-shadow:0 4px 12px rgba(168,130,220,.3); }
.dm3-ic-red    { background: linear-gradient(135deg,#e74c3c,#f05050); color:#fff; box-shadow:0 4px 12px rgba(240,80,80,.3); }
.dm3-ic-accent { background: linear-gradient(135deg, var(--accent-color), rgba(var(--accent-color-rgb,224,105,138),.7)); color:#fff; box-shadow:0 4px 12px rgba(var(--accent-color-rgb,224,105,138),.35); }

/* ── Text block ──────────────────────────────── */
.dm3-info {
    flex: 1;
    min-width: 0;
}
.dm3-row-t {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    font-family: var(--font-family);
}
.dm3-row-d {
    font-size: 11.5px;
    color: var(--text-secondary);
    margin-top: 3px;
    opacity: .65;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

/* ── Actions ─────────────────────────────────── */
.dm3-action {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
}

/* ── Buttons ─────────────────────────────────── */
.dm3-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border-radius: 22px;
    font-size: 12.5px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: all .2s cubic-bezier(.34,1.56,.64,1);
    font-family: var(--font-family);
    user-select: none;
    letter-spacing: .2px;
    min-height: 34px;
}
.dm3-btn:active { transform: scale(.93) !important; }

.dm3-btn-ghost {
    background: var(--primary-bg);
    color: var(--text-primary);
    border: 1.5px solid var(--border-color);
}
.dm3-btn-ghost:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(var(--accent-color-rgb,224,105,138),.06);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--accent-color-rgb,224,105,138),.15);
}

.dm3-btn-primary {
    background: linear-gradient(135deg, var(--accent-color), rgba(var(--accent-color-rgb,224,105,138),.75));
    color: #fff;
    box-shadow: 0 4px 14px rgba(var(--accent-color-rgb,224,105,138),.35);
}
.dm3-btn-primary:hover {
    opacity: .88;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(var(--accent-color-rgb,224,105,138),.45);
}

.dm3-btn-danger {
    background: rgba(240,80,80,.1);
    color: #f05050;
    border: 1.5px solid rgba(240,80,80,.25);
}
.dm3-btn-danger:hover {
    background: rgba(240,80,80,.18);
    border-color: #f05050;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(240,80,80,.2);
}

/* ── Toggle ──────────────────────────────────── */
.dm3-toggle {
    position: relative;
    display: inline-block;
    width: 48px; height: 26px;
    flex-shrink: 0;
}
.dm3-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.dm3-track {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: rgba(var(--accent-color-rgb,224,105,138),.15);
    border: 1.5px solid rgba(var(--accent-color-rgb,224,105,138),.2);
    border-radius: 26px;
    transition: all .3s cubic-bezier(.34,1.56,.64,1);
}
.dm3-track::before {
    content: '';
    position: absolute;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #ccc;
    left: 2px; top: 1px;
    transition: all .3s cubic-bezier(.34,1.56,.64,1);
    box-shadow: 0 2px 6px rgba(0,0,0,.2);
}
.dm3-toggle input:checked + .dm3-track {
    background: linear-gradient(135deg, var(--accent-color), rgba(var(--accent-color-rgb,224,105,138),.7));
    border-color: transparent;
    box-shadow: 0 3px 10px rgba(var(--accent-color-rgb,224,105,138),.35);
}
.dm3-toggle input:checked + .dm3-track::before {
    transform: translateX(22px);
    background: #fff;
}

/* ── Danger section special styling ─────────── */
.dm3-card.dm3-danger-card {
    border-color: rgba(240,80,80,.2);
    background: linear-gradient(to right,
        rgba(240,80,80,.04),
        var(--secondary-bg));
}

/* ── Footer ──────────────────────────────────── */
.dm3-footer {
    flex-shrink: 0;
    display: flex;
    gap: 10px;
    padding: 14px 16px;
    padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--border-color);
    background: var(--secondary-bg);
    backdrop-filter: blur(8px);
}

/* ── Mobile bottom sheet ─────────────────────── */
@media (max-width: 520px) {
    #data-modal .modal-content {
        max-width: 100% !important;
        width: 100% !important;
        border-radius: 28px 28px 0 0 !important;
        max-height: 92vh !important;
        margin: 0 !important;
    }
    #data-modal {
        align-items: flex-end !important;
        padding: 0 !important;
    }
    .dm3-hero {
        padding: 24px 20px 18px;
    }
    .dm3-hero-title {
        font-size: 22px;
    }
    .dm3-body {
        padding: 14px 14px 6px;
    }
    .dm3-row {
        padding: 15px 16px;
        min-height: 64px;
    }
    .dm3-btn {
        padding: 7px 12px;
        font-size: 12px;
    }
    .dm3-footer {
        padding: 12px 14px;
        padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
    }

    /* Stack 2-btn rows vertically on very small screens */
    .dm3-action.dm3-stack-mobile {
        flex-direction: column;
        gap: 5px;
    }
    .dm3-action.dm3-stack-mobile .dm3-btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 360px) {
    .dm3-stats { grid-template-columns: repeat(3, 1fr); gap: 5px; }
    .dm3-stat-n { font-size: 13px; }
}

/* ── Entrance animation ──────────────────────── */
@keyframes dm3-row-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
.dm3-card .dm3-row {
    animation: dm3-row-in .3s ease both;
}
.dm3-card .dm3-row:nth-child(1) { animation-delay: .04s; }
.dm3-card .dm3-row:nth-child(2) { animation-delay: .08s; }
.dm3-card .dm3-row:nth-child(3) { animation-delay: .12s; }

/* ── Handle dark/light mode icon tint ───────── */
.dm3-ic-blue,
.dm3-ic-green,
.dm3-ic-amber,
.dm3-ic-purple,
.dm3-ic-red,
.dm3-ic-accent {
    --shadow-dark: rgba(0,0,0,.45);
}
        `;
        document.head.appendChild(s);
    }

    function buildModalHTML() {
        return `
<div class="dm3-hero">
  <div class="dm3-hero-badge"><i class="fas fa-database" style="font-size:9px;"></i> 数据中心</div>
  <div class="dm3-hero-title">数据管理</div>
  <div class="dm3-hero-sub">备份恢复 · 通知设置 · 存储概览</div>
</div>

<div class="dm3-body">

  <!-- 存储概览 -->
  <div class="dm3-storage" id="dm-storage-card">
    <div class="dm3-storage-head">
      <span class="dm3-storage-label"><i class="fas fa-hdd" style="margin-right:5px;"></i>本地存储</span>
      <span class="dm3-storage-size" id="dm-storage-total">计算中…</span>
    </div>
    <div class="dm3-progress">
      <div class="dm3-progress-fill" id="dm-storage-bar" style="width:0%"></div>
    </div>
    <div class="dm3-stats">
      <div class="dm3-stat">
        <div class="dm3-stat-n" id="dm-stat-msgs">—</div>
        <div class="dm3-stat-l">聊天记录</div>
      </div>
      <div class="dm3-stat">
        <div class="dm3-stat-n" id="dm-stat-settings">—</div>
        <div class="dm3-stat-l">设置数据</div>
      </div>
      <div class="dm3-stat">
        <div class="dm3-stat-n" id="dm-stat-media">—</div>
        <div class="dm3-stat-l">图片媒体</div>
      </div>
    </div>
  </div>

  <!-- 消息通知 -->
  <div class="dm3-section">
    <div class="dm3-section-dot"></div>
    <div class="dm3-section-text">消息通知</div>
    <div class="dm3-section-line"></div>
  </div>
  <div class="dm3-card">
    <div class="dm3-row">
      <div class="dm3-icon dm3-ic-amber"><i class="fas fa-bell"></i></div>
      <div class="dm3-info">
        <div class="dm3-row-t">后台消息推送</div>
        <div class="dm3-row-d" id="notif-status-text">挂在后台时收到新消息自动弹出提醒</div>
      </div>
      <div class="dm3-action">
        <label class="dm3-toggle">
          <input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)">
          <span class="dm3-track"></span>
        </label>
      </div>
    </div>
  </div>

  <!-- 备份与恢复 -->
  <div class="dm3-section">
    <div class="dm3-section-dot"></div>
    <div class="dm3-section-text">备份与恢复</div>
    <div class="dm3-section-line"></div>
  </div>
  <div class="dm3-card">
    <div class="dm3-row">
      <div class="dm3-icon dm3-ic-blue"><i class="fas fa-layer-group"></i></div>
      <div class="dm3-info">
        <div class="dm3-row-t">全量备份</div>
        <div class="dm3-row-d">外观、设置、字卡、心情、信封等</div>
      </div>
      <div class="dm3-action dm3-stack-mobile">
        <button class="dm3-btn dm3-btn-primary" id="export-all-settings"><i class="fas fa-download"></i> 导出</button>
        <button class="dm3-btn dm3-btn-ghost" id="import-all-settings"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>
    <div class="dm3-row">
      <div class="dm3-icon dm3-ic-green"><i class="fas fa-comments"></i></div>
      <div class="dm3-info">
        <div class="dm3-row-t">聊天记录</div>
        <div class="dm3-row-d">仅导出 / 导入消息内容</div>
      </div>
      <div class="dm3-action dm3-stack-mobile">
        <button class="dm3-btn dm3-btn-primary" id="export-chat-btn"><i class="fas fa-download"></i> 导出</button>
        <button class="dm3-btn dm3-btn-ghost" id="import-chat-btn"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>
  </div>

  <!-- 视频通话 -->
  <div class="dm3-section">
    <div class="dm3-section-dot"></div>
    <div class="dm3-section-text">视频通话</div>
    <div class="dm3-section-line"></div>
  </div>
  <div class="dm3-card" id="call-settings-card">
    <div class="dm3-row">
      <div class="dm3-icon dm3-ic-accent"><i class="fas fa-video"></i></div>
      <div class="dm3-info">
        <div class="dm3-row-t">模拟视频通话</div>
        <div class="dm3-row-d">开启后可发起通话，梦角也会随机来电</div>
      </div>
      <div class="dm3-action">
        <label class="dm3-toggle">
          <input type="checkbox" id="call-enabled-toggle">
          <span class="dm3-track"></span>
        </label>
      </div>
    </div>
  </div>

  <!-- 关于 -->
  <div class="dm3-section">
    <div class="dm3-section-dot"></div>
    <div class="dm3-section-text">关于</div>
    <div class="dm3-section-line"></div>
  </div>
  <div class="dm3-card">
    <div class="dm3-row clickable" id="replay-tutorial-btn-row">
      <div class="dm3-icon dm3-ic-accent"><i class="fas fa-question-circle"></i></div>
      <div class="dm3-info">
        <div class="dm3-row-t">重放新手引导</div>
        <div class="dm3-row-d">重新播放功能介绍教程</div>
      </div>
      <div class="dm3-action">
        <button class="dm3-btn dm3-btn-ghost settings-item" id="replay-tutorial-btn">
          <i class="fas fa-play"></i> 播放
        </button>
      </div>
    </div>
    <div class="dm3-row clickable" id="open-credits-row">
      <div class="dm3-icon dm3-ic-purple"><i class="fas fa-scroll"></i></div>
      <div class="dm3-info">
        <div class="dm3-row-t">声明与致谢</div>
        <div class="dm3-row-d">开源声明、致谢名单</div>
      </div>
      <div class="dm3-action">
        <button class="dm3-btn dm3-btn-ghost settings-item" id="open-credits-btn">
          <i class="fas fa-arrow-right"></i> 查看
        </button>
      </div>
    </div>
  </div>

  <!-- 危险操作 -->
  <div class="dm3-section">
    <div class="dm3-section-dot" style="background:#f05050;box-shadow:0 0 0 2px rgba(240,80,80,.2);"></div>
    <div class="dm3-section-text" style="color:#f05050;opacity:.7;">危险操作</div>
    <div class="dm3-section-line"></div>
  </div>
  <div class="dm3-card dm3-danger-card">
    <div class="dm3-row">
      <div class="dm3-icon dm3-ic-red"><i class="fas fa-trash-alt"></i></div>
      <div class="dm3-info">
        <div class="dm3-row-t">重置全部数据</div>
        <div class="dm3-row-d">清空所有本地数据，操作不可撤销</div>
      </div>
      <div class="dm3-action">
        <button class="dm3-btn dm3-btn-danger settings-item" id="clear-storage">
          <i class="fas fa-sync-alt"></i> 重置
        </button>
      </div>
    </div>
  </div>

  <div style="height:10px;"></div>

</div><!-- /dm3-body -->

<div class="dm3-footer">
  <button class="modal-btn modal-btn-secondary" id="back-data"
    onclick="(function(){hideModal(document.getElementById('data-modal'));showModal(document.getElementById('settings-modal'))})()">
    <i class="fas fa-arrow-left"></i> 返回
  </button>
  <button class="modal-btn modal-btn-secondary" id="close-data">关闭</button>
</div>
        `;
    }

    function applyModalContentStyles(mc) {
        mc.style.setProperty('padding', '0', 'important');
        mc.style.setProperty('overflow', 'hidden', 'important');
        mc.style.setProperty('display', 'flex', 'important');
        mc.style.setProperty('flex-direction', 'column', 'important');
        mc.style.setProperty('max-width', '480px', 'important');
        mc.style.setProperty('border-radius', '28px', 'important');
    }

    function syncToggles() {
        const notifTog = document.getElementById('notif-permission-toggle');
        if (notifTog) {
            notifTog.checked = localStorage.getItem('notifEnabled') === 'true';
        }
        const callTog = document.getElementById('call-enabled-toggle');
        if (callTog) {
            callTog.checked = localStorage.getItem('callFeatureEnabled') !== 'false';
        }
    }

    function rebuild() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;
        const mc = modal.querySelector('.modal-content');
        if (!mc || mc.dataset.dm2Built) return;
        mc.dataset.dm2Built = '1';
        mc.innerHTML = buildModalHTML();
        applyModalContentStyles(mc);
        syncToggles();
    }

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
                        setTimeout(() => {
                            const mc = modal.querySelector('.modal-content');
                            if (mc) applyModalContentStyles(mc);
                        }, 50);
                    }
                }
            }
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

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
