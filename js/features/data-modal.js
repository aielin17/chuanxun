/**
 * data-modal.js — 数据管理界面 v4
 * 全面重制：分区清晰、操作安全、全部重置凸显
 */
(function () {
    'use strict';

    function injectCSS() {
        if (document.getElementById('dm4-style')) return;
        const s = document.createElement('style');
        s.id = 'dm4-style';
        s.textContent = `
#data-modal { align-items: flex-end !important; padding: 0 !important; }
#data-modal .modal-content {
    padding: 0 !important; width: 100% !important; max-width: 540px !important;
    max-height: 94dvh !important; border-radius: 28px 28px 0 0 !important;
    overflow: hidden !important; display: flex !important; flex-direction: column !important;
    box-shadow: 0 -12px 48px rgba(0,0,0,.22) !important; margin: 0 auto !important;
}
@media (min-width:600px){
    #data-modal{align-items:center!important;padding:24px!important;}
    #data-modal .modal-content{border-radius:26px!important;max-height:88dvh!important;}
}
.dm4-handle{width:38px;height:4px;background:var(--border-color);border-radius:99px;margin:11px auto 0;flex-shrink:0;opacity:.45;}
.dm4-header{flex-shrink:0;padding:14px 18px 12px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-color);}
.dm4-hicon{width:44px;height:44px;border-radius:14px;flex-shrink:0;background:linear-gradient(145deg,rgba(var(--accent-color-rgb,224,105,138),.22),rgba(var(--accent-color-rgb,224,105,138),.07));display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--accent-color);box-shadow:0 4px 12px rgba(var(--accent-color-rgb,224,105,138),.18);}
.dm4-hinfo{flex:1;min-width:0;}
.dm4-htitle{font-size:16px;font-weight:800;color:var(--text-primary);letter-spacing:-.3px;line-height:1.25;}
.dm4-hsub{font-size:11px;color:var(--text-secondary);margin-top:2px;opacity:.65;}
.dm4-xbtn{width:30px;height:30px;border-radius:50%;border:none;background:var(--secondary-bg);color:var(--text-secondary);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;flex-shrink:0;transition:background .16s,color .16s;}
.dm4-xbtn:hover{background:rgba(var(--accent-color-rgb,224,105,138),.1);color:var(--accent-color);}
.dm4-body{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 14px 8px;}
.dm4-body::-webkit-scrollbar{width:0;}
.dm4-banner{border-radius:18px;padding:15px 16px 13px;margin-bottom:12px;background:linear-gradient(135deg,rgba(var(--accent-color-rgb,224,105,138),.11) 0%,rgba(var(--accent-color-rgb,224,105,138),.03) 100%);border:1.5px solid rgba(var(--accent-color-rgb,224,105,138),.16);position:relative;overflow:hidden;}
.dm4-banner::after{content:'';position:absolute;top:-24px;right:-24px;width:88px;height:88px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(var(--accent-color-rgb,224,105,138),.13) 0%,transparent 70%);}
.dm4-btop{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;}
.dm4-blbl{font-size:10px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase;color:var(--accent-color);display:flex;align-items:center;gap:5px;}
.dm4-bsz{font-size:11.5px;font-weight:700;color:var(--text-secondary);}
.dm4-track{height:4px;background:rgba(var(--accent-color-rgb,224,105,138),.13);border-radius:99px;overflow:hidden;margin-bottom:10px;}
.dm4-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent-color),rgba(var(--accent-color-rgb,224,105,138),.5));transition:width .9s cubic-bezier(.4,0,.2,1);}
.dm4-chips{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}
.dm4-chip{background:var(--primary-bg);border:1.5px solid var(--border-color);border-radius:12px;padding:8px 6px 7px;text-align:center;}
.dm4-cn{font-size:13px;font-weight:800;color:var(--text-primary);font-variant-numeric:tabular-nums;line-height:1.2;}
.dm4-cl{font-size:9.5px;color:var(--text-secondary);margin-top:2px;opacity:.7;}
.dm4-sec{display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-secondary);opacity:.48;margin:14px 3px 6px;}
.dm4-sec.danger{color:#FF3B30;opacity:.6;}
.dm4-card{background:var(--secondary-bg);border:1.5px solid var(--border-color);border-radius:18px;overflow:hidden;margin-bottom:3px;}
.dm4-row{display:flex;align-items:center;gap:11px;padding:12px 15px;min-height:60px;border-bottom:1px solid var(--border-color);box-sizing:border-box;width:100%;}
.dm4-row:last-child{border-bottom:none;}
.dm4-row.tap{cursor:pointer;transition:background .14s;-webkit-tap-highlight-color:transparent;}
.dm4-row.tap:hover{background:rgba(var(--accent-color-rgb,224,105,138),.04);}
.dm4-row.tap:active{background:rgba(var(--accent-color-rgb,224,105,138),.09);}
.dm4-ic{width:36px;height:36px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;}
.dm4-pink{background:rgba(var(--accent-color-rgb,224,105,138),.13);color:var(--accent-color);}
.dm4-blue{background:rgba(74,144,226,.12);color:#4A90E2;}
.dm4-green{background:rgba(52,199,89,.12);color:#34C759;}
.dm4-amber{background:rgba(255,159,10,.12);color:#FF9F0A;}
.dm4-purple{background:rgba(175,82,222,.12);color:#AF52DE;}
.dm4-teal{background:rgba(90,200,250,.12);color:#5AC8FA;}
.dm4-red{background:rgba(255,59,48,.1);color:#FF3B30;}
.dm4-txt{flex:1;min-width:0;}
.dm4-rt{font-size:13.5px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;}
.dm4-rd{font-size:11px;color:var(--text-secondary);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35;opacity:.78;}
.dm4-right{display:flex;align-items:center;gap:5px;flex-shrink:0;flex-wrap:nowrap;}
.dm4-btn{display:inline-flex;align-items:center;gap:4px;height:32px;padding:0 11px;border-radius:99px;font-size:12px;font-weight:600;border:1.5px solid var(--border-color);background:var(--primary-bg);color:var(--text-primary);cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .16s;font-family:var(--font-family,inherit);-webkit-tap-highlight-color:transparent;user-select:none;}
.dm4-btn:hover{border-color:var(--accent-color);color:var(--accent-color);background:rgba(var(--accent-color-rgb,224,105,138),.07);}
.dm4-btn:active{transform:scale(.93);}
.dm4-btn.solid{background:var(--accent-color);border-color:transparent;color:#fff;}
.dm4-btn.solid:hover{opacity:.83;border-color:transparent;color:#fff;}
.dm4-tog{position:relative;display:inline-flex;align-items:center;width:48px;height:27px;flex-shrink:0;cursor:pointer;}
.dm4-tog input{opacity:0;width:0;height:0;position:absolute;}
.dm4-ttrack{position:absolute;inset:0;background:rgba(120,120,128,.2);border-radius:99px;transition:background .26s;}
.dm4-ttrack::after{content:'';position:absolute;width:21px;height:21px;border-radius:50%;background:#fff;top:3px;left:3px;transition:transform .26s cubic-bezier(.34,1.3,.64,1);box-shadow:0 2px 5px rgba(0,0,0,.2);}
.dm4-tog input:checked+.dm4-ttrack{background:var(--accent-color);}
.dm4-tog input:checked+.dm4-ttrack::after{transform:translateX(21px);}

/* ── Reset zone ── */
.dm4-rzone{border-radius:18px;overflow:hidden;margin-bottom:3px;border:1.5px solid rgba(255,59,48,.22);background:rgba(255,59,48,.025);}
.dm4-rzone .dm4-row{background:transparent;border-bottom:1px solid rgba(255,59,48,.1);}
.dm4-rbtns{display:flex;gap:8px;padding:0 14px 13px;}
.dm4-rbtn-msg{flex:1;height:44px;border-radius:13px;border:1.5px solid var(--border-color);background:var(--primary-bg);color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .16s;font-family:var(--font-family,inherit);-webkit-tap-highlight-color:transparent;}
.dm4-rbtn-msg:hover{border-color:rgba(255,159,10,.5);color:#FF9F0A;background:rgba(255,159,10,.05);}
.dm4-rbtn-msg:active{transform:scale(.97);}
.dm4-rbtn-all{flex:1;height:44px;border-radius:13px;border:1.5px solid rgba(255,59,48,.35);background:rgba(255,59,48,.07);color:#FF3B30;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .16s;font-family:var(--font-family,inherit);-webkit-tap-highlight-color:transparent;}
.dm4-rbtn-all:hover{background:rgba(255,59,48,.13);border-color:#FF3B30;}
.dm4-rbtn-all:active{transform:scale(.97);}

.dm4-footer{flex-shrink:0;padding:10px 14px;padding-bottom:max(12px,env(safe-area-inset-bottom,12px));border-top:1px solid var(--border-color);background:var(--secondary-bg);}
.dm4-backbtn{width:100%;height:44px;border-radius:13px;border:1.5px solid var(--border-color);background:var(--primary-bg);color:var(--text-primary);font-size:13.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .16s;font-family:var(--font-family,inherit);}
.dm4-backbtn:hover{background:rgba(var(--accent-color-rgb,224,105,138),.05);border-color:rgba(var(--accent-color-rgb,224,105,138),.3);}
.dm4-gap{height:8px;}
        `;
        document.head.appendChild(s);
    }

    function buildHTML() {
        return `
<div class="dm4-handle"></div>
<div class="dm4-header">
  <div class="dm4-hicon"><i class="fas fa-database"></i></div>
  <div class="dm4-hinfo">
    <div class="dm4-htitle">数据管理</div>
    <div class="dm4-hsub">备份 · 恢复 · 通知 · 重置</div>
  </div>
  <button class="dm4-xbtn" id="close-data" aria-label="关闭"><i class="fas fa-times"></i></button>
</div>

<div class="dm4-body">

  <div class="dm4-banner">
    <div class="dm4-btop">
      <span class="dm4-blbl"><i class="fas fa-hdd"></i> 本地存储</span>
      <span class="dm4-bsz" id="dm4-sz">计算中…</span>
    </div>
    <div class="dm4-track"><div class="dm4-fill" id="dm4-bar" style="width:0%"></div></div>
    <div class="dm4-chips">
      <div class="dm4-chip"><div class="dm4-cn" id="dm4-s-msg">—</div><div class="dm4-cl">聊天记录</div></div>
      <div class="dm4-chip"><div class="dm4-cn" id="dm4-s-cfg">—</div><div class="dm4-cl">设置数据</div></div>
      <div class="dm4-chip"><div class="dm4-cn" id="dm4-s-med">—</div><div class="dm4-cl">图片/媒体</div></div>
    </div>
  </div>

  <div class="dm4-sec"><i class="fas fa-bell"></i> 消息通知</div>
  <div class="dm4-card">
    <div class="dm4-row">
      <div class="dm4-ic dm4-amber"><i class="fas fa-bell"></i></div>
      <div class="dm4-txt">
        <div class="dm4-rt">后台消息推送</div>
        <div class="dm4-rd" id="notif-status-text">挂在后台时收到新消息自动弹出提醒</div>
      </div>
      <div class="dm4-right">
        <label class="dm4-tog"><input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)"><span class="dm4-ttrack"></span></label>
      </div>
    </div>
  </div>

  <div class="dm4-sec"><i class="fas fa-archive"></i> 备份与恢复</div>
  <div class="dm4-card">
    <div class="dm4-row">
      <div class="dm4-ic dm4-blue"><i class="fas fa-layer-group"></i></div>
      <div class="dm4-txt">
        <div class="dm4-rt">全量备份</div>
        <div class="dm4-rd">外观、设置、字卡、心情、信封等</div>
      </div>
      <div class="dm4-right">
        <button class="dm4-btn solid" id="export-all-settings"><i class="fas fa-download"></i> 导出</button>
        <button class="dm4-btn" id="import-all-settings"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>
    <div class="dm4-row">
      <div class="dm4-ic dm4-green"><i class="fas fa-comments"></i></div>
      <div class="dm4-txt">
        <div class="dm4-rt">聊天记录</div>
        <div class="dm4-rd">仅导出 / 导入消息内容</div>
      </div>
      <div class="dm4-right">
        <button class="dm4-btn solid" id="export-chat-btn"><i class="fas fa-download"></i> 导出</button>
        <button class="dm4-btn" id="import-chat-btn"><i class="fas fa-upload"></i> 导入</button>
      </div>
    </div>
  </div>

  <div class="dm4-sec"><i class="fas fa-video"></i> 视频通话</div>
  <div class="dm4-card">
    <div class="dm4-row">
      <div class="dm4-ic dm4-teal"><i class="fas fa-video"></i></div>
      <div class="dm4-txt">
        <div class="dm4-rt">模拟视频通话</div>
        <div class="dm4-rd">开启后可发起通话，对方也会随机来电</div>
      </div>
      <div class="dm4-right">
        <label class="dm4-tog"><input type="checkbox" id="call-enabled-toggle"><span class="dm4-ttrack"></span></label>
      </div>
    </div>
  </div>

  <div class="dm4-sec"><i class="fas fa-info-circle"></i> 关于</div>
  <div class="dm4-card">
    <div class="dm4-row tap" id="replay-tutorial-btn-row">
      <div class="dm4-ic dm4-pink"><i class="fas fa-compass"></i></div>
      <div class="dm4-txt"><div class="dm4-rt">重放新手引导</div><div class="dm4-rd">重新播放功能介绍教程</div></div>
      <div class="dm4-right"><button class="dm4-btn" id="replay-tutorial-btn"><i class="fas fa-play"></i> 播放</button></div>
    </div>
    <div class="dm4-row tap" id="open-credits-row">
      <div class="dm4-ic dm4-purple"><i class="fas fa-scroll"></i></div>
      <div class="dm4-txt"><div class="dm4-rt">声明与致谢</div><div class="dm4-rd">开源声明、致谢名单</div></div>
      <div class="dm4-right"><button class="dm4-btn" id="open-credits-btn"><i class="fas fa-arrow-right"></i> 查看</button></div>
    </div>
  </div>

  <div class="dm4-sec danger"><i class="fas fa-exclamation-triangle"></i> 危险操作 · 全部重置</div>
  <div class="dm4-rzone">
    <div class="dm4-row">
      <div class="dm4-ic dm4-red"><i class="fas fa-bomb"></i></div>
      <div class="dm4-txt">
        <div class="dm4-rt" style="color:#FF3B30;">全部重置</div>
        <div class="dm4-rd">彻底清空所有本地数据，操作后自动刷新，不可撤销</div>
      </div>
    </div>
    <div class="dm4-rbtns">
      <button class="dm4-rbtn-msg" id="dm4-clear-msgs">
        <i class="fas fa-comment-slash"></i> 仅清除消息
      </button>
      <button class="dm4-rbtn-all" id="dm4-clear-all">
        <i class="fas fa-trash-alt"></i> 全部重置
      </button>
    </div>
  </div>

  <div class="dm4-gap"></div>
</div>

<div class="dm4-footer">
  <button class="dm4-backbtn" id="back-data"
    onclick="(function(){hideModal(document.getElementById('data-modal'));showModal(document.getElementById('settings-modal'))})()">
    <i class="fas fa-arrow-left"></i> 返回设置
  </button>
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
            const pct = Math.min(100, total / (5 * 1024 * 1024) * 100).toFixed(1);
            const g = id => document.getElementById(id);
            const sz  = g('dm4-sz');    if (sz)  sz.textContent  = fmt(total) + ' / ~5 MB';
            const bar = g('dm4-bar');   if (bar) {
                bar.style.width = pct + '%';
                if (parseFloat(pct) > 80)      bar.style.background = 'linear-gradient(90deg,#ff4757,#ff6b8a)';
                else if (parseFloat(pct) > 50) bar.style.background = 'linear-gradient(90deg,#ffa502,rgba(255,165,2,.5))';
            }
            const sm = g('dm4-s-msg'); if (sm) sm.textContent = fmt(msgs);
            const sc = g('dm4-s-cfg'); if (sc) sc.textContent = fmt(cfg);
            const se = g('dm4-s-med'); if (se) se.textContent = fmt(media);
        } catch (e) { /* silent */ }
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

    function wireResetButtons() {
        const clearMsgs = document.getElementById('dm4-clear-msgs');
        const clearAll  = document.getElementById('dm4-clear-all');

        if (clearMsgs && !clearMsgs._dm4Bound) {
            clearMsgs._dm4Bound = true;
            clearMsgs.addEventListener('click', () => {
                if (confirm('确定要清除当前会话的所有消息吗？此操作无法恢复！')) {
                    if (typeof messages !== 'undefined') { messages.length = 0; }
                    if (typeof throttledSaveData === 'function') throttledSaveData();
                    if (typeof renderMessages === 'function') renderMessages();
                    if (typeof showNotification === 'function') showNotification('当前会话消息已清除', 'success');
                }
            });
        }

        if (clearAll && !clearAll._dm4Bound) {
            clearAll._dm4Bound = true;
            clearAll.addEventListener('click', () => {
                if (!confirm('⚠️【高危操作】确定要全部重置吗？\n\n所有数据（消息、设置、字卡、头像等）将永久清除，不可恢复！')) return;
                if (!confirm('最后确认：真的要清除所有数据并刷新页面吗？')) return;

                window._skipBackup = true;
                if (window.localforage) {
                    localforage.clear().then(() => {
                        localStorage.clear();
                        if (typeof showNotification === 'function')
                            showNotification('所有数据已重置，即将刷新…', 'info', 2000);
                        setTimeout(() => {
                            window.location.href = window.location.pathname + '?reset=' + Date.now();
                        }, 2000);
                    }).catch(() => { localStorage.clear(); window.location.reload(); });
                } else {
                    localStorage.clear();
                    window.location.reload();
                }
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
        if (!mc || mc.dataset.dm4Built) return;
        mc.dataset.dm4Built = '1';
        mc.innerHTML = buildHTML();
        applyLayout(mc);
        syncToggles();
        updateStats();
        wireResetButtons();
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
                wireResetButtons();
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
