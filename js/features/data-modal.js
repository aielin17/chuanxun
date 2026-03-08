/**
 * data-modal.js — 数据管理界面 v5
 * 全新视觉语言：杂志排版 · 强对比 · 大字号分区
 */
(function () {
    'use strict';

    function injectCSS() {
        if (document.getElementById('dm5-style')) return;
        const s = document.createElement('style');
        s.id = 'dm5-style';
        s.textContent = `
/* ── Reset inherited modal styles ── */
#data-modal { align-items: flex-end !important; padding: 0 !important; }
#data-modal .modal-content {
    padding: 0 !important;
    width: 100% !important;
    max-width: 560px !important;
    max-height: 96dvh !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    box-shadow: none !important;
    margin: 0 auto !important;
    background: var(--primary-bg) !important;
}
@media (min-width: 600px) {
    #data-modal { align-items: center !important; padding: 20px !important; }
    #data-modal .modal-content {
        border-radius: 20px !important;
        max-height: 90dvh !important;
    }
}

/* ── SHELL ── */
.dm5-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--primary-bg);
    font-family: var(--font-family, 'Noto Serif SC', serif);
    color: var(--text-primary);
}

/* ── TOP STRIPE ── */
.dm5-stripe {
    flex-shrink: 0;
    background: var(--accent-color);
    padding: 18px 20px 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
}
.dm5-stripe::before {
    content: '';
    position: absolute;
    right: -30px; top: -30px;
    width: 130px; height: 130px;
    border-radius: 50%;
    background: rgba(255,255,255,.08);
}
.dm5-stripe::after {
    content: '';
    position: absolute;
    right: 30px; bottom: -50px;
    width: 90px; height: 90px;
    border-radius: 50%;
    background: rgba(255,255,255,.05);
}
.dm5-stripe-left { flex: 1; z-index: 1; }
.dm5-stripe-eyebrow {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,.65);
    margin-bottom: 5px;
    display: flex; align-items: center; gap: 6px;
}
.dm5-stripe-eyebrow::before {
    content: '';
    display: inline-block;
    width: 20px; height: 1.5px;
    background: rgba(255,255,255,.5);
}
.dm5-stripe-title {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -1.2px;
    line-height: 1;
}
.dm5-stripe-sub {
    font-size: 11px;
    color: rgba(255,255,255,.6);
    margin-top: 6px;
    font-weight: 400;
}
.dm5-stripe-close {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,.3);
    background: rgba(255,255,255,.1);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    cursor: pointer;
    z-index: 1;
    flex-shrink: 0;
    margin-top: 2px;
    transition: background .2s;
    -webkit-tap-highlight-color: transparent;
}
.dm5-stripe-close:hover { background: rgba(255,255,255,.25); }

/* ── STORAGE BAR (below stripe) ── */
.dm5-stobar {
    flex-shrink: 0;
    padding: 10px 20px;
    background: var(--secondary-bg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 12px;
}
.dm5-stobar-track {
    flex: 1;
    height: 3px;
    background: var(--border-color);
    border-radius: 99px;
    overflow: hidden;
}
.dm5-stobar-fill {
    height: 100%;
    border-radius: 99px;
    background: var(--accent-color);
    transition: width .9s cubic-bezier(.4,0,.2,1);
}
.dm5-stobar-nums {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
}
.dm5-chips-row {
    flex-shrink: 0;
    display: grid;
    grid-template-columns: repeat(3,1fr);
    padding: 0 14px 12px;
    gap: 8px;
    background: var(--secondary-bg);
    border-bottom: 1px solid var(--border-color);
}
.dm5-chip {
    text-align: center;
    padding: 7px 4px 6px;
    border-radius: 10px;
    background: var(--primary-bg);
    border: 1px solid var(--border-color);
}
.dm5-chip-n {
    font-size: 12px; font-weight: 800;
    color: var(--text-primary); line-height: 1.2;
    font-variant-numeric: tabular-nums;
}
.dm5-chip-l {
    font-size: 9px; color: var(--text-secondary);
    margin-top: 2px; opacity: .7;
}

/* ── SCROLLABLE BODY ── */
.dm5-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}
.dm5-body::-webkit-scrollbar { width: 0; }

/* ── CHAPTER DIVIDER ── */
.dm5-chapter {
    display: flex;
    align-items: center;
    padding: 16px 20px 8px;
    gap: 10px;
}
.dm5-chapter-num {
    font-size: 9px; font-weight: 900;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--accent-color);
    background: rgba(var(--accent-color-rgb,224,105,138),.1);
    padding: 3px 8px; border-radius: 5px;
    flex-shrink: 0;
}
.dm5-chapter-title {
    font-size: 11px; font-weight: 700;
    color: var(--text-secondary);
    letter-spacing: .5px;
    text-transform: uppercase;
    flex: 1;
}
.dm5-chapter-line {
    flex: 1;
    height: 1px;
    background: var(--border-color);
}

/* ── ITEM ROW ── */
.dm5-item {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 12px 20px;
    transition: background .13s;
    -webkit-tap-highlight-color: transparent;
    position: relative;
}
.dm5-item::after {
    content: '';
    position: absolute;
    bottom: 0; left: 20px; right: 20px;
    height: 1px;
    background: var(--border-color);
    opacity: .5;
}
.dm5-item:last-of-type::after { display: none; }
.dm5-item.tap { cursor: pointer; }
.dm5-item.tap:hover  { background: rgba(var(--accent-color-rgb,224,105,138),.04); }
.dm5-item.tap:active { background: rgba(var(--accent-color-rgb,224,105,138),.09); }

/* icon box */
.dm5-ic {
    width: 38px; height: 38px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}
.dm5-ac   { background: rgba(var(--accent-color-rgb,224,105,138),.12); color: var(--accent-color); }
.dm5-bl   { background: rgba(74,144,226,.12); color: #4A90E2; }
.dm5-gr   { background: rgba(52,199,89,.12);  color: #34C759; }
.dm5-am   { background: rgba(255,159,10,.12); color: #FF9F0A; }
.dm5-pu   { background: rgba(175,82,222,.12); color: #AF52DE; }
.dm5-te   { background: rgba(90,200,250,.12); color: #5AC8FA; }
.dm5-re   { background: rgba(255,59,48,.11);  color: #FF3B30; }

/* text */
.dm5-meta { flex: 1; min-width: 0; }
.dm5-name {
    font-size: 14px; font-weight: 600;
    color: var(--text-primary); line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dm5-desc {
    font-size: 11px; color: var(--text-secondary);
    margin-top: 2px; line-height: 1.35; opacity: .75;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* right */
.dm5-right {
    display: flex; align-items: center; gap: 5px;
    flex-shrink: 0; flex-wrap: nowrap;
}

/* buttons */
.dm5-btn {
    height: 32px; padding: 0 12px;
    border-radius: 8px;
    font-size: 12px; font-weight: 600;
    border: 1.5px solid var(--border-color);
    background: var(--secondary-bg);
    color: var(--text-primary);
    cursor: pointer; white-space: nowrap;
    display: inline-flex; align-items: center; gap: 4px;
    transition: all .15s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
}
.dm5-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
.dm5-btn:active { transform: scale(.93); }
.dm5-btn.fill {
    background: var(--accent-color); border-color: transparent; color: #fff;
}
.dm5-btn.fill:hover { opacity: .83; color: #fff; border-color: transparent; }

/* toggle */
.dm5-tog {
    position: relative; display: inline-flex; align-items: center;
    width: 46px; height: 26px; flex-shrink: 0; cursor: pointer;
}
.dm5-tog input { opacity:0; width:0; height:0; position:absolute; }
.dm5-tog-bg {
    position: absolute; inset: 0;
    background: rgba(120,120,128,.22); border-radius: 99px; transition: background .25s;
}
.dm5-tog-bg::after {
    content: ''; position: absolute;
    width: 20px; height: 20px; border-radius: 50%; background: #fff;
    top: 3px; left: 3px;
    transition: transform .25s cubic-bezier(.34,1.3,.64,1);
    box-shadow: 0 2px 5px rgba(0,0,0,.2);
}
.dm5-tog input:checked + .dm5-tog-bg { background: var(--accent-color); }
.dm5-tog input:checked + .dm5-tog-bg::after { transform: translateX(20px); }

/* ── DANGER ZONE ── */
.dm5-danger-zone {
    margin: 8px 14px 14px;
    border-radius: 16px;
    overflow: hidden;
    border: 1.5px solid rgba(255,59,48,.25);
    background: rgba(255,59,48,.03);
}
.dm5-danger-head {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px 11px;
    border-bottom: 1px solid rgba(255,59,48,.15);
}
.dm5-danger-label {
    font-size: 10px; font-weight: 900;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: #FF3B30; flex: 1;
}
.dm5-danger-warn {
    font-size: 10px; color: rgba(255,59,48,.65); font-style: italic;
}
.dm5-danger-body {
    padding: 13px 16px;
}
.dm5-danger-desc {
    font-size: 12px; color: var(--text-secondary);
    line-height: 1.55; margin-bottom: 13px; opacity: .85;
}
.dm5-danger-btns {
    display: flex; gap: 8px;
}
.dm5-dbtn-soft {
    flex: 1; height: 42px; border-radius: 10px;
    border: 1.5px solid var(--border-color);
    background: var(--secondary-bg);
    color: var(--text-secondary);
    font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all .15s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
}
.dm5-dbtn-soft:hover { border-color: rgba(255,159,10,.5); color: #FF9F0A; }
.dm5-dbtn-soft:active { transform: scale(.97); }
.dm5-dbtn-hard {
    flex: 1.2; height: 42px; border-radius: 10px;
    border: none;
    background: #FF3B30;
    color: #fff;
    font-size: 13px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all .15s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 4px 16px rgba(255,59,48,.3);
}
.dm5-dbtn-hard:hover { background: #e02a20; box-shadow: 0 6px 20px rgba(255,59,48,.4); }
.dm5-dbtn-hard:active { transform: scale(.97); box-shadow: none; }

/* ── FOOTER ── */
.dm5-footer {
    flex-shrink: 0;
    padding: 10px 14px;
    padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
    border-top: 1px solid var(--border-color);
    background: var(--secondary-bg);
}
.dm5-back {
    width: 100%; height: 44px; border-radius: 12px;
    border: 1.5px solid var(--border-color);
    background: transparent; color: var(--text-secondary);
    font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: all .15s; font-family: inherit;
    -webkit-tap-highlight-color: transparent;
}
.dm5-back:hover { color: var(--text-primary); border-color: var(--text-secondary); }
.dm5-back:active { transform: scale(.98); }
        `;
        document.head.appendChild(s);
    }

    function buildHTML() {
        return `
<div class="dm5-shell">

  <!-- ①  彩色顶部标题带 -->
  <div class="dm5-stripe">
    <div class="dm5-stripe-left">
      <div class="dm5-stripe-eyebrow">DATA CENTER</div>
      <div class="dm5-stripe-title">数据管理</div>
      <div class="dm5-stripe-sub">备份 · 恢复 · 通知 · 清理</div>
    </div>
    <button class="dm5-stripe-close" id="close-data" aria-label="关闭">
      <i class="fas fa-times"></i>
    </button>
  </div>

  <!-- ②  存储进度条 -->
  <div class="dm5-stobar">
    <span style="font-size:10px;font-weight:700;color:var(--text-secondary);white-space:nowrap;letter-spacing:.5px;text-transform:uppercase;">存储</span>
    <div class="dm5-stobar-track">
      <div class="dm5-stobar-fill" id="dm5-bar" style="width:0%"></div>
    </div>
    <span class="dm5-stobar-nums" id="dm5-sz">—</span>
  </div>
  <!-- 存储三格 -->
  <div class="dm5-chips-row">
    <div class="dm5-chip"><div class="dm5-chip-n" id="dm5-s-msg">—</div><div class="dm5-chip-l">聊天记录</div></div>
    <div class="dm5-chip"><div class="dm5-chip-n" id="dm5-s-cfg">—</div><div class="dm5-chip-l">设置数据</div></div>
    <div class="dm5-chip"><div class="dm5-chip-n" id="dm5-s-med">—</div><div class="dm5-chip-l">图片媒体</div></div>
  </div>

  <!-- ③  可滚动区域 -->
  <div class="dm5-body">

    <!-- SECTION A: 通知 -->
    <div class="dm5-chapter">
      <span class="dm5-chapter-num">01</span>
      <span class="dm5-chapter-title">消息通知</span>
      <div class="dm5-chapter-line"></div>
    </div>

    <div class="dm5-item">
      <div class="dm5-ic dm5-am"><i class="fas fa-bell"></i></div>
      <div class="dm5-meta">
        <div class="dm5-name">后台消息推送</div>
        <div class="dm5-desc" id="notif-status-text">后台挂起时，收到新消息自动弹出提醒</div>
      </div>
      <div class="dm5-right">
        <label class="dm5-tog">
          <input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)">
          <span class="dm5-tog-bg"></span>
        </label>
      </div>
    </div>

    <!-- SECTION B: 备份 -->
    <div class="dm5-chapter">
      <span class="dm5-chapter-num">02</span>
      <span class="dm5-chapter-title">备份与恢复</span>
      <div class="dm5-chapter-line"></div>
    </div>

    <div class="dm5-item">
      <div class="dm5-ic dm5-bl"><i class="fas fa-layer-group"></i></div>
      <div class="dm5-meta">
        <div class="dm5-name">全量备份</div>
        <div class="dm5-desc">外观、设置、字卡、心情、信封全部打包</div>
      </div>
      <div class="dm5-right">
        <button class="dm5-btn fill" id="export-all-settings"><i class="fas fa-download"></i> 导出</button>
        <button class="dm5-btn" id="import-all-settings"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>

    <div class="dm5-item">
      <div class="dm5-ic dm5-gr"><i class="fas fa-comments"></i></div>
      <div class="dm5-meta">
        <div class="dm5-name">聊天记录</div>
        <div class="dm5-desc">仅导出 / 导入消息内容</div>
      </div>
      <div class="dm5-right">
        <button class="dm5-btn fill" id="export-chat-btn"><i class="fas fa-download"></i> 导出</button>
        <button class="dm5-btn" id="import-chat-btn"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>

    <!-- SECTION C: 视频通话 -->
    <div class="dm5-chapter">
      <span class="dm5-chapter-num">03</span>
      <span class="dm5-chapter-title">视频通话</span>
      <div class="dm5-chapter-line"></div>
    </div>

    <div class="dm5-item">
      <div class="dm5-ic dm5-te"><i class="fas fa-video"></i></div>
      <div class="dm5-meta">
        <div class="dm5-name">模拟视频通话</div>
        <div class="dm5-desc">开启后可发起通话，对方也会随机来电</div>
      </div>
      <div class="dm5-right">
        <label class="dm5-tog">
          <input type="checkbox" id="call-enabled-toggle">
          <span class="dm5-tog-bg"></span>
        </label>
      </div>
    </div>

    <!-- SECTION D: 关于 -->
    <div class="dm5-chapter">
      <span class="dm5-chapter-num">04</span>
      <span class="dm5-chapter-title">关于</span>
      <div class="dm5-chapter-line"></div>
    </div>

    <div class="dm5-item tap" id="replay-tutorial-btn-row">
      <div class="dm5-ic dm5-ac"><i class="fas fa-compass"></i></div>
      <div class="dm5-meta">
        <div class="dm5-name">重放新手引导</div>
        <div class="dm5-desc">重新播放功能介绍教程</div>
      </div>
      <div class="dm5-right">
        <button class="dm5-btn" id="replay-tutorial-btn"><i class="fas fa-play"></i> 播放</button>
      </div>
    </div>

    <div class="dm5-item tap" id="open-credits-row">
      <div class="dm5-ic dm5-pu"><i class="fas fa-scroll"></i></div>
      <div class="dm5-meta">
        <div class="dm5-name">声明与致谢</div>
        <div class="dm5-desc">开源声明、致谢名单</div>
      </div>
      <div class="dm5-right">
        <button class="dm5-btn" id="open-credits-btn"><i class="fas fa-arrow-right"></i> 查看</button>
      </div>
    </div>

    <!-- SECTION E: 危险区 -->
    <div class="dm5-chapter">
      <span class="dm5-chapter-num" style="background:rgba(255,59,48,.12);color:#FF3B30;">05</span>
      <span class="dm5-chapter-title" style="color:#FF3B30;">危险操作</span>
      <div class="dm5-chapter-line" style="background:rgba(255,59,48,.2);"></div>
    </div>

    <div class="dm5-danger-zone">
      <div class="dm5-danger-head">
        <i class="fas fa-exclamation-triangle" style="color:#FF3B30;font-size:13px;"></i>
        <span class="dm5-danger-label">清除数据</span>
        <span class="dm5-danger-warn">操作不可撤销</span>
      </div>
      <div class="dm5-danger-body">
        <div class="dm5-danger-desc">
          「仅清除消息」只删除当前会话的聊天记录，设置与字卡保留。<br>
          「清空全部」将彻底抹除所有本地数据，页面刷新后重新开始。
        </div>
        <div class="dm5-danger-btns">
          <button class="dm5-dbtn-soft" id="dm5-clear-msgs">
            <i class="fas fa-comment-slash"></i> 仅清除消息
          </button>
          <button class="dm5-dbtn-hard" id="dm5-clear-all">
            <i class="fas fa-trash-alt"></i> 清空全部
          </button>
        </div>
      </div>
    </div>

    <div style="height:10px;"></div>
  </div><!-- /dm5-body -->

  <!-- ④ footer -->
  <div class="dm5-footer">
    <button class="dm5-back" id="back-data"
      onclick="(function(){hideModal(document.getElementById('data-modal'));showModal(document.getElementById('settings-modal'))})()">
      <i class="fas fa-arrow-left"></i> 返回设置
    </button>
  </div>

</div><!-- /dm5-shell -->
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
            const sz  = g('dm5-sz');    if (sz)  sz.textContent = fmt(total) + ' / ~5 MB';
            const bar = g('dm5-bar');   if (bar) {
                bar.style.width = pct + '%';
                if      (parseFloat(pct) > 80) bar.style.background = '#FF3B30';
                else if (parseFloat(pct) > 50) bar.style.background = '#FF9F0A';
                else                           bar.style.background = 'var(--accent-color)';
            }
            const sm = g('dm5-s-msg'); if (sm) sm.textContent = fmt(msgs);
            const sc = g('dm5-s-cfg'); if (sc) sc.textContent = fmt(cfg);
            const se = g('dm5-s-med'); if (se) se.textContent = fmt(media);
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
        const clearMsgs = document.getElementById('dm5-clear-msgs');
        if (clearMsgs && !clearMsgs._dm5) {
            clearMsgs._dm5 = true;
            clearMsgs.addEventListener('click', () => {
                if (!confirm('确定要清除当前会话的所有消息吗？此操作无法恢复！')) return;
                if (typeof messages !== 'undefined') messages.length = 0;
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof renderMessages === 'function') renderMessages();
                if (typeof showNotification === 'function') showNotification('当前会话消息已清除', 'success');
            });
        }
        const clearAll = document.getElementById('dm5-clear-all');
        if (clearAll && !clearAll._dm5) {
            clearAll._dm5 = true;
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
        if (!mc || mc.dataset.dm5Built) return;
        mc.dataset.dm5Built = '1';
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
