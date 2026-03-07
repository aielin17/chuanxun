/**
 * call.js v4.0
 * Fixes: pill drag, data-modal redesign, icon scaling, bw-theme, search avatars
 */

(function () {
    'use strict';

    const KEY_ENABLED  = 'callFeatureEnabled';
    const KEY_POS      = 'callWindowPos';
    const KEY_SIZE     = 'callWindowSize';
    const KEY_PILL_POS = 'callPillPos';
    const BG_LF_KEY    = 'callBgImageData';

    const S = {
        enabled:         localStorage.getItem(KEY_ENABLED) !== 'false',
        active:          false,
        startTime:       null,
        elapsed:         0,
        timerRAF:        null,
        minimized:       false,
        immersive:       false,
        bgImage:         null,
        pos:             JSON.parse(localStorage.getItem(KEY_POS)  || 'null'),
        pillPos:         JSON.parse(localStorage.getItem(KEY_PILL_POS) || 'null'),
        size:            JSON.parse(localStorage.getItem(KEY_SIZE) || '{"w":280,"h":440}'),
        dragOff:         null,
        pillDragOff:     null,
        resizeInit:      null,
        incomingTimer:   null,
        connectingTimer: null,
        randomCallTimer: null,
        isPartnerCall:   false,
    };

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    /* ── BG storage ─────────────────────────────────────────── */
    function loadBg() {
        if (!window.localforage) return;
        localforage.getItem(BG_LF_KEY).then(v => { if (v) { S.bgImage = v; applyBg(); } }).catch(() => {});
    }
    function saveBg(d) {
        if (!d || !window.localforage) return;
        localforage.setItem(BG_LF_KEY, d).catch(e => console.warn('[call] bg:', e));
    }

    /* ── SVG hangup icon ────────────────────────────────────── */
    const SVG_HANGUP = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%;">
  <path d="M6.5 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1C10.57 21 3 13.43 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.46.57 3.58.11.35.03.74-.24 1.02L6.5 10.8z" fill="white"/>
  <line x1="21" y1="3" x2="3" y2="21" stroke="white" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

    /* ── CSS injection ──────────────────────────────────────── */
    function injectCSS() {
        const el = document.createElement('style');
        el.id = 'call-feature-style';
        el.textContent = `
/* ═══ INCOMING ══════════════════════════════════════════ */
#call-incoming-overlay{
    position:fixed;inset:0;z-index:99990;
    display:none;align-items:center;justify-content:center;
    background:rgba(0,0,0,.62);
    backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);
}
#call-incoming-overlay.visible{display:flex;animation:cFi .35s ease;}
.call-inc-card{
    width:270px;
    background:linear-gradient(160deg,rgba(255,255,255,.11),rgba(255,255,255,.04));
    border:1px solid rgba(255,255,255,.18);border-radius:32px;
    padding:42px 28px 34px;
    display:flex;flex-direction:column;align-items:center;gap:8px;color:#fff;
    box-shadow:0 32px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.15);
    animation:cCu .45s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden;
}
.call-inc-card::before{
    content:'';position:absolute;inset:0;pointer-events:none;
    background:radial-gradient(ellipse at 50% 0%,rgba(var(--accent-color-rgb,224,105,138),.28),transparent 65%);
}
.call-inc-ring{position:relative;margin-bottom:8px;}
.call-inc-ring::before,.call-inc-ring::after{
    content:'';position:absolute;inset:-10px;border-radius:50%;
    border:1.5px solid rgba(255,255,255,.18);animation:cRp 2.2s ease-in-out infinite;
}
.call-inc-ring::after{inset:-20px;border-color:rgba(255,255,255,.08);animation-delay:.6s;}
.call-inc-avatar{
    width:88px;height:88px;border-radius:50%;
    background:var(--accent-color,#e0698a);
    display:flex;align-items:center;justify-content:center;overflow:hidden;
    border:2px solid rgba(255,255,255,.25);box-shadow:0 8px 32px rgba(0,0,0,.38);
}
.call-inc-avatar img{width:100%;height:100%;object-fit:cover;}
.call-inc-avatar i{font-size:36px;color:rgba(255,255,255,.85);}
.call-inc-name{font-size:22px;font-weight:700;margin-top:6px;}
.call-inc-sub{font-size:12.5px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:6px;}
.call-inc-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.5);animation:cBl 1.1s step-end infinite;}
.call-inc-actions{display:flex;gap:44px;margin-top:24px;}
.call-inc-btn{display:flex;flex-direction:column;align-items:center;gap:7px;background:none;border:none;cursor:pointer;color:#fff;}
.call-inc-circle{
    width:64px;height:64px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    transition:transform .18s,box-shadow .18s;padding:14px;
}
.call-inc-btn:hover .call-inc-circle{transform:scale(1.1);}
.call-inc-btn:active .call-inc-circle{transform:scale(.93);}
.call-inc-reject .call-inc-circle{background:linear-gradient(135deg,#ff5252,#c62828);box-shadow:0 6px 22px rgba(255,82,82,.45);}
.call-inc-accept .call-inc-circle{background:linear-gradient(135deg,#4caf50,#2e7d32);box-shadow:0 6px 22px rgba(76,175,80,.45);padding:18px;}
.call-inc-lbl{font-size:12px;color:rgba(255,255,255,.5);font-weight:500;}
.call-inc-accept-icon{width:100%;height:100%;display:block;}

/* ═══ CALL WINDOW ════════════════════════════════════════ */
#call-window{
    position:fixed;z-index:99900;
    border-radius:22px;overflow:visible;
    display:none;flex-direction:column;
    box-shadow:0 24px 70px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.1);
    user-select:none;touch-action:none;
    min-width:160px;min-height:240px;
    max-width:90vw;max-height:90vh;
    will-change:transform;
}
#call-window.visible{display:flex;animation:cWi .42s cubic-bezier(.22,1,.36,1);}
#call-window-inner{border-radius:22px;overflow:hidden;flex:1;display:flex;flex-direction:column;position:relative;}

/* Background */
#call-window-bg{position:absolute;inset:0;z-index:0;}
.call-bg-grad{position:absolute;inset:0;background:linear-gradient(155deg,#0d1b2a 0%,#1b263b 50%,#415a77 100%);}
#call-window-bg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;}
.call-orb{position:absolute;border-radius:50%;filter:blur(44px);opacity:.3;animation:cOrb linear infinite;pointer-events:none;}
.call-orb-1{width:120px;height:120px;background:var(--accent-color,#e0698a);top:-20px;left:-20px;animation-duration:18s;}
.call-orb-2{width:85px;height:85px;background:#4a90d9;bottom:10px;right:-10px;animation-duration:22s;animation-delay:-9s;}
.call-orb-3{width:65px;height:65px;background:#9b59b6;top:40%;left:45%;animation-duration:28s;animation-delay:-15s;}
.call-overlay{
    position:absolute;inset:0;z-index:1;transition:opacity .4s;
    background:linear-gradient(to bottom,rgba(0,0,0,.5) 0%,rgba(0,0,0,.05) 35%,rgba(0,0,0,.05) 62%,rgba(0,0,0,.65) 100%);
}

/* Header */
#call-window-header{
    position:relative;z-index:10;
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 12px 6px;cursor:grab;transition:opacity .35s;
}
#call-window-header:active{cursor:grabbing;}
.call-badge{
    display:flex;align-items:center;gap:5px;
    background:rgba(0,0,0,.3);backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:3px 10px;
}
.call-rec-dot{width:6px;height:6px;border-radius:50%;background:#4caf50;box-shadow:0 0 6px #4caf50;animation:cBl 1.8s ease-in-out infinite alternate;flex-shrink:0;}
.call-timer-txt{font-size:11px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.9);font-variant-numeric:tabular-nums;}
.call-top-btns{display:flex;gap:3px;}
.call-top-btn{
    width:26px;height:26px;border-radius:50%;border:none;
    background:rgba(255,255,255,.1);backdrop-filter:blur(6px);
    color:rgba(255,255,255,.75);cursor:pointer;font-size:10px;
    display:flex;align-items:center;justify-content:center;
    transition:background .2s,transform .15s;
}
.call-top-btn:hover{background:rgba(255,255,255,.2);transform:scale(1.08);}

/* Connecting */
#call-connecting-state{
    position:relative;z-index:10;
    display:none;flex-direction:column;align-items:center;
    justify-content:center;flex:1;gap:8px;padding:12px;transition:opacity .35s;
}
#call-connecting-state.visible{display:flex;}
.call-conn-dots{display:flex;gap:6px;margin-top:3px;}
.call-conn-dots span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.55);animation:cCd .9s ease-in-out infinite;}
.call-conn-dots span:nth-child(2){animation-delay:.15s;}
.call-conn-dots span:nth-child(3){animation-delay:.3s;}

/* Body — responsive avatar/name sizing */
#call-window-body{
    position:relative;z-index:10;
    flex:1;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:8px;
    padding:4px 10px;transition:opacity .35s;
}
.call-av-wrap{position:relative;}
.call-av-pulse{position:absolute;inset:-8px;border-radius:50%;border:1.5px solid rgba(255,255,255,.2);animation:cAp 2.5s ease-in-out infinite;}
.call-av-pulse2{position:absolute;inset:-15px;border-radius:50%;border:1px solid rgba(255,255,255,.08);animation:cAp 2.5s ease-in-out infinite .6s;}
/* Avatar size scales with window — default 68px, shrinks at small sizes */
.call-avatar{
    width:clamp(36px,18%,72px);height:clamp(36px,18%,72px);border-radius:50%;
    background:var(--accent-color,#e0698a);
    border:2px solid rgba(255,255,255,.28);
    overflow:hidden;display:flex;align-items:center;justify-content:center;
    box-shadow:0 6px 20px rgba(0,0,0,.4);position:relative;z-index:1;
}
.call-avatar img{width:100%;height:100%;object-fit:cover;}
/* Icon size also scales */
.call-avatar i{font-size:clamp(14px,7%,28px);color:rgba(255,255,255,.8);}
.call-name{
    font-size:clamp(11px,5%,17px);font-weight:700;color:#fff;
    text-shadow:0 2px 8px rgba(0,0,0,.5);letter-spacing:.02em;margin-top:1px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90%;
}
/* Connecting shares same avatar/name classes */
#call-connecting-state .call-avatar{width:clamp(40px,20%,72px);height:clamp(40px,20%,72px);}
#call-connecting-state .call-avatar i{font-size:clamp(16px,8%,28px);}
.call-wave{display:flex;align-items:center;gap:2px;height:16px;}
.call-wave span{width:2.5px;border-radius:3px;background:rgba(255,255,255,.5);animation:cWv .85s ease-in-out infinite;}
.call-wave span:nth-child(1){height:5px;animation-delay:0s;}
.call-wave span:nth-child(2){height:11px;animation-delay:.1s;}
.call-wave span:nth-child(3){height:16px;animation-delay:.2s;}
.call-wave span:nth-child(4){height:11px;animation-delay:.3s;}
.call-wave span:nth-child(5){height:5px;animation-delay:.4s;}

/* Controls */
#call-window-controls{
    position:relative;z-index:10;
    display:flex;align-items:center;justify-content:center;
    padding:8px 12px 14px;transition:opacity .35s;
}
.call-hangup-btn{
    width:clamp(44px,14%,58px);height:clamp(44px,14%,58px);
    border-radius:50%;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#ff5252,#c62828);
    box-shadow:0 6px 22px rgba(255,82,82,.5),0 0 0 1px rgba(255,255,255,.1);
    transition:transform .18s,box-shadow .2s;
    padding:clamp(11px,4%,16px);
}
.call-hangup-btn:hover{transform:scale(1.1);box-shadow:0 10px 30px rgba(255,82,82,.6);}
.call-hangup-btn:active{transform:scale(.9);}

/* Util buttons */
.call-util-btn{
    position:absolute;z-index:10;
    width:28px;height:28px;border-radius:50%;border:none;
    background:rgba(255,255,255,.12);backdrop-filter:blur(8px);
    color:rgba(255,255,255,.65);cursor:pointer;font-size:10px;
    display:flex;align-items:center;justify-content:center;
    transition:background .2s,color .2s,transform .15s;
}
.call-util-btn:hover{background:rgba(255,255,255,.22);color:#fff;transform:scale(1.08);}
.call-util-btn.active{background:rgba(255,255,255,.28);color:#fff;}
#call-bg-btn{bottom:72px;right:10px;}
#call-immersive-btn{bottom:72px;left:10px;}
#call-bg-file-input{display:none;}

/* IMMERSIVE */
#call-window.immersive #call-window-header,
#call-window.immersive #call-window-body,
#call-window.immersive #call-connecting-state,
#call-window.immersive #call-window-controls,
#call-window.immersive #call-bg-btn,
#call-window.immersive .call-overlay{opacity:0;pointer-events:none;}
#call-window.immersive #call-immersive-btn{opacity:.35;pointer-events:all;}
#call-window.immersive #call-immersive-btn:hover{opacity:1;}

/* Resize handle */
#call-resize-handle{
    position:absolute;bottom:-2px;right:-2px;z-index:99901;
    width:22px;height:22px;cursor:se-resize;
    display:flex;align-items:flex-end;justify-content:flex-end;padding:5px;touch-action:none;
}
#call-resize-handle::after{
    content:'';width:10px;height:10px;
    border-right:2px solid rgba(255,255,255,.35);border-bottom:2px solid rgba(255,255,255,.35);
    border-radius:0 0 4px 0;
}

/* Size presets */
#call-size-presets{
    position:fixed;z-index:99960;
    display:none;flex-direction:column;gap:2px;
    background:rgba(14,20,38,.93);backdrop-filter:blur(18px);
    border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:5px;
    box-shadow:0 12px 38px rgba(0,0,0,.55);min-width:140px;
}
#call-size-presets.open{display:flex;animation:cFi .18s ease;}
.call-size-btn{
    padding:7px 11px;font-size:12px;color:rgba(255,255,255,.8);
    background:none;border:none;border-radius:8px;
    cursor:pointer;white-space:nowrap;text-align:left;
    transition:background .15s;display:flex;align-items:center;gap:8px;
}
.call-size-btn:hover{background:rgba(255,255,255,.1);color:#fff;}
.call-size-btn i{color:var(--accent-color,#e0698a);width:12px;}

/* ═══ MINI PILL — draggable ══════════════════════════════ */
#call-mini-pill{
    position:fixed;bottom:82px;right:16px;z-index:99901;
    display:none;align-items:center;gap:9px;
    background:rgba(10,18,38,.92);backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.12);
    border-radius:30px;padding:8px 14px 8px 10px;
    box-shadow:0 8px 30px rgba(0,0,0,.4);
    cursor:grab;color:#fff;user-select:none;touch-action:none;
}
#call-mini-pill:active{cursor:grabbing;}
#call-mini-pill.visible{display:flex;animation:cPi .3s cubic-bezier(.22,1,.36,1);}
.call-mini-av{
    width:30px;height:30px;border-radius:50%;
    background:var(--accent-color,#e0698a);overflow:hidden;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.call-mini-av img{width:100%;height:100%;object-fit:cover;}
.call-mini-av i{font-size:12px;color:rgba(255,255,255,.8);}
.call-mini-info{display:flex;flex-direction:column;gap:1px;}
.call-mini-name{font-size:12px;font-weight:600;line-height:1.1;}
.call-mini-time{font-size:11px;color:rgba(255,255,255,.5);font-variant-numeric:tabular-nums;font-weight:500;letter-spacing:.04em;}
.call-mini-dot{width:6px;height:6px;border-radius:50%;background:#4caf50;box-shadow:0 0 6px #4caf50;animation:cBl 1.6s ease-in-out infinite alternate;flex-shrink:0;}
.call-mini-hangup{
    width:30px;height:30px;border-radius:50%;border:none;
    background:rgba(255,82,82,.75);cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    padding:8px;
    transition:background .2s,transform .15s;flex-shrink:0;
}
.call-mini-hangup:hover{background:#ff5252;transform:scale(1.12);}

/* ═══ TOOLBAR BUTTON — match attachment-btn ══════════════ */
#call-toolbar-btn{
    background-color:var(--message-received-bg) !important;
    color:var(--text-secondary) !important;
}
#call-toolbar-btn:hover{color:var(--text-primary) !important;}
body.bottom-collapse-mode #call-toolbar-btn{display:none !important;}

/* ═══ SETTINGS ════════════════════════════════════════════ */
.call-settings-row{
    display:flex;align-items:center;gap:12px;padding:12px 14px;
    border-bottom:1px solid var(--border-color,rgba(128,128,128,.15));
}
.call-settings-row:last-child{border-bottom:none;}
.call-settings-icon{
    width:34px;height:34px;border-radius:10px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,rgba(var(--accent-color-rgb,224,105,138),.18),rgba(var(--accent-color-rgb,224,105,138),.07));
    color:var(--accent-color,#e0698a);font-size:14px;
}
.call-settings-info{flex:1;min-width:0;}
.call-settings-title{font-size:13.5px;font-weight:500;color:var(--text-primary,inherit);}
.call-settings-desc{font-size:11.5px;color:var(--text-secondary,rgba(128,128,128,.8));margin-top:2px;}
.call-feature-toggle{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;}
.call-feature-toggle input{opacity:0;width:0;height:0;}
.call-toggle-slider{position:absolute;cursor:pointer;inset:0;background:var(--border-color,rgba(128,128,128,.25));border-radius:24px;transition:.3s;}
.call-toggle-slider::before{content:'';position:absolute;width:18px;height:18px;border-radius:50%;background:#fff;left:3px;top:3px;transition:.3s;box-shadow:0 1px 4px rgba(0,0,0,.25);}
.call-feature-toggle input:checked + .call-toggle-slider{background:var(--accent-color,#e0698a);}
.call-feature-toggle input:checked + .call-toggle-slider::before{transform:translateX(20px);}

/* ═══ DATA MODAL — COMPLETE REDESIGN ═════════════════════ */
#data-modal{align-items:center;padding:16px;}
#data-modal .modal-content{
    width:min(480px,92vw);
    max-height:min(680px,90vh);
    border-radius:24px;
    display:flex;flex-direction:column;
    overflow:hidden;
    padding:0;
}

/* Header */
#data-modal .dm-header{
    padding:20px 22px 16px;
    background:linear-gradient(135deg,rgba(var(--accent-color-rgb,224,105,138),.12),rgba(var(--accent-color-rgb,224,105,138),.04));
    border-bottom:1px solid var(--border-color);
    flex-shrink:0;
}
#data-modal .dm-header-title{
    font-size:18px;font-weight:800;
    display:flex;align-items:center;gap:12px;
}
#data-modal .dm-header-icon{
    width:38px;height:38px;border-radius:12px;
    background:linear-gradient(135deg,rgba(var(--accent-color-rgb,224,105,138),.3),rgba(var(--accent-color-rgb,224,105,138),.12));
    display:flex;align-items:center;justify-content:center;
    color:var(--accent-color);font-size:16px;flex-shrink:0;
}

/* Body scroll */
#data-modal .dm-body{
    flex:1;overflow-y:auto;overflow-x:hidden;
    padding:16px 18px 12px;
    -webkit-overflow-scrolling:touch;
}

/* Storage card */
#data-modal .dm-storage-card{
    background:linear-gradient(135deg,rgba(var(--accent-color-rgb,224,105,138),.1),rgba(var(--accent-color-rgb,224,105,138),.04));
    border:1px solid rgba(var(--accent-color-rgb,224,105,138),.2);
    border-radius:16px;padding:14px 16px;margin-bottom:18px;
}
#data-modal .dm-storage-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
#data-modal .dm-storage-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--accent-color);opacity:.85;}
#data-modal .dm-storage-val{font-size:12.5px;font-weight:700;color:var(--text-primary);}
#data-modal .dm-storage-bar-bg{height:5px;background:rgba(var(--accent-color-rgb,224,105,138),.15);border-radius:99px;overflow:hidden;margin-bottom:12px;}
#data-modal .dm-storage-bar-fill{height:100%;background:var(--accent-color);border-radius:99px;transition:width .6s ease;}
#data-modal .dm-storage-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
#data-modal .dm-storage-item{background:var(--secondary-bg);border-radius:10px;padding:8px 10px;text-align:center;}
#data-modal .dm-storage-item-val{font-size:13px;font-weight:700;color:var(--text-primary);}
#data-modal .dm-storage-item-key{font-size:10px;color:var(--text-secondary);margin-top:2px;}

/* Section labels */
#data-modal .dm-group-label{
    font-size:10px;font-weight:800;letter-spacing:.9px;text-transform:uppercase;
    color:var(--text-secondary);opacity:.55;margin:18px 2px 8px;
}
#data-modal .dm-group-label:first-of-type{margin-top:2px;}

/* Cards */
#data-modal .dm-card{
    background:var(--primary-bg);
    border:1px solid var(--border-color);
    border-radius:16px;overflow:hidden;margin-bottom:4px;
}

/* Rows — CLEAN layout, no overflow */
#data-modal .dm-row{
    display:grid;
    grid-template-columns:36px 1fr auto;
    align-items:center;
    gap:10px;
    padding:13px 14px;
    border-bottom:1px solid var(--border-color);
    cursor:default;
}
#data-modal .dm-row:last-child{border-bottom:none;}
#data-modal .dm-notif-row{
    display:grid;
    grid-template-columns:36px 1fr auto;
    align-items:center;
    gap:10px;
    padding:13px 14px;
}

/* Row icon */
#data-modal .dm-row-icon{
    width:34px;height:34px;border-radius:10px;
    display:flex;align-items:center;justify-content:center;font-size:14px;
}
#data-modal .dm-row-icon.blue  {background:rgba(74,144,226,.12);color:#4A90E2;}
#data-modal .dm-row-icon.green {background:rgba(123,200,164,.12);color:#7BC8A4;}
#data-modal .dm-row-icon.amber {background:rgba(255,193,7,.12);color:#FFA000;}
#data-modal .dm-row-icon.purple{background:rgba(187,158,199,.12);color:#BB9EC7;}
#data-modal .dm-row-icon.red   {background:rgba(255,100,100,.12);color:#f05050;}
#data-modal .dm-row-icon.gray  {background:rgba(var(--accent-color-rgb),0.1);color:var(--accent-color);}
#data-modal .dm-row-icon.video {background:rgba(var(--accent-color-rgb,224,105,138),.12);color:var(--accent-color);}

/* Row info */
#data-modal .dm-row-info{min-width:0;}
#data-modal .dm-row-title{font-size:13.5px;font-weight:600;color:var(--text-primary);}
#data-modal .dm-row-desc{font-size:11.5px;color:var(--text-secondary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* Row action — right side, always contained */
#data-modal .dm-row-action{
    display:flex;gap:5px;align-items:center;flex-shrink:0;
}

/* Buttons */
#data-modal .dm-btn{
    padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;
    border:1.5px solid var(--border-color);
    background:var(--secondary-bg);color:var(--text-primary);
    cursor:pointer;transition:all .2s;white-space:nowrap;
    display:inline-flex;align-items:center;gap:4px;
}
#data-modal .dm-btn:hover{border-color:var(--accent-color);color:var(--accent-color);background:rgba(var(--accent-color-rgb),.06);}
#data-modal .dm-btn.primary{background:var(--accent-color);color:#fff;border-color:var(--accent-color);}
#data-modal .dm-btn.primary:hover{opacity:.88;}
#data-modal .dm-btn.danger{border-color:rgba(240,80,80,.3);color:#f05050;}
#data-modal .dm-btn.danger:hover{background:rgba(240,80,80,.06);border-color:#f05050;}

/* Footer */
#data-modal .dm-footer{
    flex-shrink:0;display:flex;gap:8px;padding:12px 18px;
    padding-bottom:max(14px,env(safe-area-inset-bottom,0px));
    border-top:1px solid var(--border-color);
    background:var(--secondary-bg);
}

/* Mobile */
@media(max-width:440px){
    #data-modal .modal-content{border-radius:24px 24px 0 0;}
    #data-modal{align-items:flex-end;padding:0;}
    #data-modal .dm-row{grid-template-columns:34px 1fr;grid-template-rows:auto auto;}
    #data-modal .dm-row-action{grid-column:2;justify-content:flex-start;padding-bottom:2px;}
    #data-modal .dm-row-desc{white-space:normal;}
    #data-modal .dm-notif-row{grid-template-columns:34px 1fr auto;}
}

/* ═══ BLACK-WHITE THEME FIX ════════════════════════════════ */
/* In dark mode, override accent to light so text is visible */
html[data-theme="dark"][data-color-theme="black-white"]{
    --accent-color:#c8c8c8;
    --accent-color-rgb:200,200,200;
    --accent-color-dark:#e0e0e0;
    --message-sent-bg:#3a3a3a;
    --message-sent-text:#ffffff;
}
/* In light mode, ensure sent text is white on dark bubble */
html:not([data-theme="dark"])[data-color-theme="black-white"] .message-sent{
    color:#ffffff !important;
}
/* Any UI element using accent color in dark+bw should be visible */
html[data-theme="dark"][data-color-theme="black-white"] .dm-row-title,
html[data-theme="dark"][data-color-theme="black-white"] .dm-row-desc{
    color:var(--text-primary);
}

/* ═══ KEYFRAMES ════════════════════════════════════════════ */
@keyframes cFi{from{opacity:0}to{opacity:1}}
@keyframes cCu{from{opacity:0;transform:translateY(28px) scale(.94)}to{opacity:1;transform:none}}
@keyframes cWi{from{opacity:0;transform:scale(.84) translateY(18px)}to{opacity:1;transform:none}}
@keyframes cPi{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
@keyframes cRp{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:.15;transform:scale(1.12)}}
@keyframes cAp{0%,100%{opacity:.65;transform:scale(1)}50%{opacity:.15;transform:scale(1.15)}}
@keyframes cBl{from{opacity:1}to{opacity:.2}}
@keyframes cOrb{0%{transform:translate(0,0) rotate(0)}33%{transform:translate(18px,-14px) rotate(120deg)}66%{transform:translate(-10px,18px) rotate(240deg)}100%{transform:translate(0,0) rotate(360deg)}}
@keyframes cWv{0%,100%{transform:scaleY(1);opacity:.5}50%{transform:scaleY(.35);opacity:.25}}
@keyframes cCd{0%,80%,100%{transform:scale(.75);opacity:.35}40%{transform:scale(1.2);opacity:1}}
        `;
        document.head.appendChild(el);
    }

    /* ── HTML injection ──────────────────────────────────── */
    function injectHTML() {
        const root = document.createElement('div');
        root.id = 'call-feature-root';
        root.innerHTML = `
<!-- INCOMING -->
<div id="call-incoming-overlay">
  <div class="call-inc-card">
    <div class="call-inc-ring">
      <div class="call-inc-avatar" id="call-inc-avatar"><i class="fas fa-user" id="call-inc-av-icon"></i></div>
    </div>
    <div class="call-inc-name" id="call-inc-name">对方</div>
    <div class="call-inc-sub"><span class="call-inc-dot"></span><span>邀请您进行视频通话</span></div>
    <div class="call-inc-actions">
      <button class="call-inc-btn call-inc-reject" id="call-inc-reject">
        <div class="call-inc-circle">${SVG_HANGUP}</div>
        <span class="call-inc-lbl">拒绝</span>
      </button>
      <button class="call-inc-btn call-inc-accept" id="call-inc-accept">
        <div class="call-inc-circle">
          <svg class="call-inc-accept-icon" viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/></svg>
        </div>
        <span class="call-inc-lbl">接听</span>
      </button>
    </div>
  </div>
</div>

<!-- CALL WINDOW -->
<div id="call-window">
  <div id="call-window-inner">
    <div id="call-window-bg">
      <div class="call-bg-grad"></div>
      <div class="call-orb call-orb-1"></div>
      <div class="call-orb call-orb-2"></div>
      <div class="call-orb call-orb-3"></div>
      <img id="call-bg-img" src="" alt="">
    </div>
    <div class="call-overlay"></div>
    <div id="call-window-header">
      <div class="call-badge"><span class="call-rec-dot"></span><span class="call-timer-txt" id="call-timer-display">00:00</span></div>
      <div class="call-top-btns">
        <button class="call-top-btn" id="call-size-preset-toggle" title="调整大小"><i class="fas fa-expand-alt"></i></button>
        <button class="call-top-btn" id="call-minimize-btn" title="最小化"><i class="fas fa-minus"></i></button>
      </div>
    </div>
    <div id="call-connecting-state">
      <div class="call-av-wrap">
        <div class="call-av-pulse"></div><div class="call-av-pulse2"></div>
        <div class="call-avatar" id="call-conn-avatar"><i class="fas fa-user" id="call-conn-av-icon"></i></div>
      </div>
      <div class="call-name" id="call-conn-name">对方</div>
      <div style="font-size:11px;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:5px;"><i class="fas fa-video" style="font-size:9px;"></i> 正在连接</div>
      <div class="call-conn-dots"><span></span><span></span><span></span></div>
    </div>
    <div id="call-window-body">
      <div class="call-av-wrap">
        <div class="call-av-pulse"></div><div class="call-av-pulse2"></div>
        <div class="call-avatar" id="call-win-avatar"><i class="fas fa-user" id="call-win-av-icon"></i></div>
      </div>
      <div class="call-name" id="call-win-name">通话中</div>
      <div class="call-wave"><span></span><span></span><span></span><span></span><span></span></div>
    </div>
    <button class="call-util-btn" id="call-immersive-btn" title="沉浸模式"><i class="fas fa-eye-slash"></i></button>
    <button class="call-util-btn" id="call-bg-btn" title="更换背景"><i class="fas fa-image"></i></button>
    <input type="file" id="call-bg-file-input" accept="image/*,.gif">
    <div id="call-window-controls">
      <button class="call-hangup-btn" id="call-hangup-btn" title="挂断">${SVG_HANGUP}</button>
    </div>
  </div>
  <div id="call-resize-handle"></div>
</div>

<!-- SIZE PRESETS -->
<div id="call-size-presets">
  <button class="call-size-btn" data-w="160" data-h="240"><i class="fas fa-compress-alt"></i>迷你</button>
  <button class="call-size-btn" data-w="220" data-h="350"><i class="fas fa-minus-square"></i>小</button>
  <button class="call-size-btn" data-w="280" data-h="440"><i class="fas fa-square"></i>标准</button>
  <button class="call-size-btn" data-w="360" data-h="560"><i class="fas fa-expand"></i>大</button>
</div>

<!-- MINI PILL -->
<div id="call-mini-pill">
  <div class="call-mini-av" id="call-mini-av"><i class="fas fa-user" id="call-mini-av-icon"></i></div>
  <div class="call-mini-info">
    <div class="call-mini-name" id="call-mini-name">通话中</div>
    <div class="call-mini-time" id="call-mini-timer">00:00</div>
  </div>
  <span class="call-mini-dot"></span>
  <button class="call-mini-hangup" id="call-mini-hangup" title="挂断">${SVG_HANGUP}</button>
</div>
        `;
        document.body.appendChild(root);
    }

    /* ── Settings inject ─────────────────────────────────── */
    function injectSettings() {
        const anchor = document.getElementById('notif-permission-toggle');
        if (!anchor) return;
        const notifCard = anchor.closest('.dm-card');
        if (!notifCard) return;
        document.getElementById('call-settings-card')?.remove();
        document.getElementById('call-settings-lbl')?.remove();

        const lbl = document.createElement('div');
        lbl.className = 'dm-group-label'; lbl.id = 'call-settings-lbl';
        lbl.innerHTML = '<i class="fas fa-video" style="margin-right:5px;"></i>视频通话';

        const card = document.createElement('div');
        card.className = 'dm-card'; card.id = 'call-settings-card';
        card.innerHTML = `
          <div class="call-settings-row">
            <div class="call-settings-icon"><i class="fas fa-video"></i></div>
            <div class="call-settings-info">
              <div class="call-settings-title">模拟视频通话</div>
              <div class="call-settings-desc">开启后可发起通话，梦角也会随机来电</div>
            </div>
            <label class="call-feature-toggle">
              <input type="checkbox" id="call-enabled-toggle" ${S.enabled ? 'checked' : ''}>
              <span class="call-toggle-slider"></span>
            </label>
          </div>`;

        notifCard.parentNode.insertBefore(lbl, notifCard.nextSibling);
        notifCard.parentNode.insertBefore(card, lbl.nextSibling);
    }

    /* ── Toolbar button ──────────────────────────────────── */
    function injectToolbarBtn() {
        if (document.getElementById('call-toolbar-btn')) return;
        const attachBtn = document.getElementById('attachment-btn');
        if (!attachBtn) return;
        const btn = document.createElement('button');
        btn.id = 'call-toolbar-btn';
        btn.title = '视频通话';
        btn.className = 'input-btn collapse-hideable';
        btn.style.display = S.enabled ? '' : 'none';
        btn.innerHTML = '<i class="fas fa-video"></i>';
        btn.addEventListener('click', () => {
            if (!S.enabled) return;
            if (S.active) { restoreWindow(); return; }
            startCall(false);
        });
        attachBtn.parentNode.insertBefore(btn, attachBtn);
    }

    /* ── Helpers ─────────────────────────────────────────── */
    function fmt(ms) {
        const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
        return h > 0
            ? `${h}:${String(m % 60).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
            : `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
    }
    const getAvSrc = () => {
        const img = document.querySelector('#partner-avatar img,[id*="partner-avatar"] img,.partner-avatar img');
        return img ? img.src : null;
    };
    const getName = () => (window.settings?.partnerName) || document.getElementById('partner-name')?.textContent.trim() || '对方';
    function fillAv(avId, icId) {
        const av = document.getElementById(avId), src = getAvSrc();
        if (av && src) av.innerHTML = `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
        else { const ic = document.getElementById(icId); if (ic) ic.style.display = ''; }
    }
    function fillNm(id) { const e = document.getElementById(id); if (e) e.textContent = getName(); }

    /* ── Timer ───────────────────────────────────────────── */
    function tick() {
        if (!S.active || !S.startTime) return;
        S.elapsed = Date.now() - S.startTime;
        const t = fmt(S.elapsed);
        const a = document.getElementById('call-timer-display'), b = document.getElementById('call-mini-timer');
        if (a) a.textContent = t; if (b) b.textContent = t;
        S.timerRAF = requestAnimationFrame(tick);
    }

    /* ── Background ──────────────────────────────────────── */
    function applyBg() {
        const img = document.getElementById('call-bg-img');
        if (!img) return;
        if (S.bgImage) { img.src = S.bgImage; img.style.display = 'block'; }
        else { img.src = ''; img.style.display = 'none'; }
    }

    /* ── Positioning ─────────────────────────────────────── */
    function positionWindow() {
        const win = document.getElementById('call-window');
        if (!win) return;
        win.style.width = S.size.w + 'px'; win.style.height = S.size.h + 'px';
        if (S.pos) {
            win.style.left   = clamp(S.pos.x, 0, window.innerWidth  - S.size.w) + 'px';
            win.style.top    = clamp(S.pos.y, 0, window.innerHeight - S.size.h) + 'px';
            win.style.right = 'auto'; win.style.bottom = 'auto';
        } else {
            win.style.right = '20px'; win.style.top = '72px';
            win.style.left = 'auto'; win.style.bottom = 'auto';
        }
    }
    function positionPill() {
        const pill = document.getElementById('call-mini-pill');
        if (!pill) return;
        if (S.pillPos) {
            pill.style.left   = clamp(S.pillPos.x, 0, window.innerWidth  - pill.offsetWidth)  + 'px';
            pill.style.top    = clamp(S.pillPos.y, 0, window.innerHeight - pill.offsetHeight) + 'px';
            pill.style.right  = 'auto'; pill.style.bottom = 'auto';
        }
    }

    /* ── Chat message ────────────────────────────────────── */
    function sendCallMsg(dur) {
        if (dur < 2000) return;
        const text = `📹 视频通话已结束 · ${fmt(dur)}`;
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        if (!input || !sendBtn) return;
        const prev = input.value;
        input.value = text; sendBtn.click();
        setTimeout(() => { if (input.value === text) input.value = prev; }, 100);
    }

    /* ── Start / End ─────────────────────────────────────── */
    function startCall(isPartner) {
        if (!S.enabled) return;
        S.active = true; S.startTime = null; S.elapsed = 0;
        S.minimized = false; S.isPartnerCall = !!isPartner;
        S.immersive = false;
        document.getElementById('call-window')?.classList.remove('immersive');

        fillAv('call-conn-avatar','call-conn-av-icon');
        fillAv('call-win-avatar','call-win-av-icon');
        fillAv('call-mini-av','call-mini-av-icon');
        fillNm('call-conn-name'); fillNm('call-win-name'); fillNm('call-mini-name');
        applyBg(); positionWindow();

        const win = document.getElementById('call-window');
        const body = document.getElementById('call-window-body');
        const conn = document.getElementById('call-connecting-state');
        const timerEl = document.getElementById('call-timer-display');

        if (win)    win.classList.add('visible');
        if (conn)   conn.classList.add('visible');
        if (body)   body.style.display = 'none';
        if (timerEl) timerEl.textContent = '连接中';

        clearTimeout(S.connectingTimer);
        S.connectingTimer = setTimeout(() => {
            if (!S.active) return;
            S.startTime = Date.now();
            if (conn)  conn.classList.remove('visible');
            if (body)  body.style.display = '';
            tick();
        }, 1400 + Math.random() * 1400);
    }

    function endCall() {
        if (!S.active) return;
        const dur = S.elapsed;
        S.active = false; S.startTime = null;
        cancelAnimationFrame(S.timerRAF);
        clearTimeout(S.connectingTimer); clearTimeout(S.incomingTimer);

        ['call-window','call-mini-pill','call-incoming-overlay'].forEach(id => {
            const e = document.getElementById(id);
            if (e) { e.classList.remove('visible'); if (id === 'call-window') e.classList.remove('immersive'); }
        });
        const body = document.getElementById('call-window-body');
        const conn = document.getElementById('call-connecting-state');
        if (body) body.style.display = '';
        if (conn) conn.classList.remove('visible');
        S.immersive = false;
        const btn = document.getElementById('call-immersive-btn');
        if (btn) { btn.classList.remove('active'); btn.querySelector('i').className = 'fas fa-eye-slash'; }

        saveState(); sendCallMsg(dur);
        if (typeof showNotification === 'function' && dur > 1500)
            showNotification(`通话结束 · ${fmt(dur)}`, 'info', 3000);
    }

    /* ── Incoming ────────────────────────────────────────── */
    function showIncomingCall() {
        if (!S.enabled || S.active) return;
        const ov = document.getElementById('call-incoming-overlay');
        if (!ov) return;
        fillAv('call-inc-avatar','call-inc-av-icon'); fillNm('call-inc-name');
        ov.classList.add('visible');
        clearTimeout(S.incomingTimer);
        S.incomingTimer = setTimeout(() => ov.classList.remove('visible'), 22000);
    }

    /* ── Random calls ────────────────────────────────────── */
    function scheduleRandomCall() {
        clearTimeout(S.randomCallTimer);
        if (!S.enabled) return;
        const ms = (15 + Math.random() * 45) * 60 * 1000;
        S.randomCallTimer = setTimeout(() => {
            if (S.enabled && !S.active && Math.random() < 0.25) showIncomingCall();
            scheduleRandomCall();
        }, ms);
    }

    /* ── Minimize / Restore ──────────────────────────────── */
    function minimizeWindow() {
        S.minimized = true;
        document.getElementById('call-window')?.classList.remove('visible');
        const pill = document.getElementById('call-mini-pill');
        if (pill) { pill.classList.add('visible'); positionPill(); }
    }
    function restoreWindow() {
        S.minimized = false;
        const win = document.getElementById('call-window');
        if (win) { positionWindow(); win.classList.add('visible'); }
        document.getElementById('call-mini-pill')?.classList.remove('visible');
    }

    /* ── Immersive ───────────────────────────────────────── */
    function toggleImmersive() {
        S.immersive = !S.immersive;
        const win = document.getElementById('call-window');
        const btn = document.getElementById('call-immersive-btn');
        if (win) win.classList.toggle('immersive', S.immersive);
        if (btn) {
            btn.classList.toggle('active', S.immersive);
            btn.title = S.immersive ? '退出沉浸' : '沉浸模式';
            btn.querySelector('i').className = S.immersive ? 'fas fa-eye' : 'fas fa-eye-slash';
        }
    }

    /* ── Size presets ────────────────────────────────────── */
    function openSizePresets() {
        const p = document.getElementById('call-size-presets');
        const btn = document.getElementById('call-size-preset-toggle');
        if (!p || !btn) return;
        const r = btn.getBoundingClientRect();
        p.style.top  = (r.bottom + 8) + 'px';
        p.style.left = Math.max(8, r.left - 40) + 'px';
        p.classList.add('open');
    }

    /* ── Drag: call window (pointer capture) ─────────────── */
    function initDrag() {
        const header = document.getElementById('call-window-header');
        const win    = document.getElementById('call-window');
        if (!header || !win) return;
        let active = false;
        header.addEventListener('pointerdown', e => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            e.preventDefault();
            const r = win.getBoundingClientRect();
            S.dragOff = { x: e.clientX - r.left, y: e.clientY - r.top };
            active = true;
            try { header.setPointerCapture(e.pointerId); } catch(_) {}
        });
        header.addEventListener('pointermove', e => {
            if (!active || !S.dragOff) return;
            e.preventDefault();
            win.style.left = clamp(e.clientX - S.dragOff.x, 0, window.innerWidth  - win.offsetWidth)  + 'px';
            win.style.top  = clamp(e.clientY - S.dragOff.y, 0, window.innerHeight - win.offsetHeight) + 'px';
            win.style.right = 'auto'; win.style.bottom = 'auto';
        });
        const stop = e => {
            if (!active) return; active = false; S.dragOff = null;
            const r = win.getBoundingClientRect(); S.pos = { x: r.left, y: r.top }; saveState();
            try { header.releasePointerCapture(e.pointerId); } catch(_) {}
        };
        header.addEventListener('pointerup', stop); header.addEventListener('pointercancel', stop);
    }

    /* ── Drag: mini pill ─────────────────────────────────── */
    function initPillDrag() {
        const pill = document.getElementById('call-mini-pill');
        if (!pill) return;
        let active = false, didMove = false;
        pill.addEventListener('pointerdown', e => {
            if (e.target.closest('.call-mini-hangup')) return;
            e.preventDefault();
            const r = pill.getBoundingClientRect();
            S.pillDragOff = { x: e.clientX - r.left, y: e.clientY - r.top };
            active = true; didMove = false;
            try { pill.setPointerCapture(e.pointerId); } catch(_) {}
        });
        pill.addEventListener('pointermove', e => {
            if (!active || !S.pillDragOff) return;
            e.preventDefault(); didMove = true;
            pill.style.left   = clamp(e.clientX - S.pillDragOff.x, 0, window.innerWidth  - pill.offsetWidth)  + 'px';
            pill.style.top    = clamp(e.clientY - S.pillDragOff.y, 0, window.innerHeight - pill.offsetHeight) + 'px';
            pill.style.right = 'auto'; pill.style.bottom = 'auto';
        });
        const stop = e => {
            if (!active) return; active = false;
            if (didMove) {
                const r = pill.getBoundingClientRect();
                S.pillPos = { x: r.left, y: r.top };
                localStorage.setItem(KEY_PILL_POS, JSON.stringify(S.pillPos));
            }
            S.pillDragOff = null;
            try { pill.releasePointerCapture(e.pointerId); } catch(_) {}
        };
        pill.addEventListener('pointerup', stop); pill.addEventListener('pointercancel', stop);
    }

    /* ── Resize ──────────────────────────────────────────── */
    function initResize() {
        const handle = document.getElementById('call-resize-handle');
        const win    = document.getElementById('call-window');
        if (!handle || !win) return;
        let active = false;
        handle.addEventListener('pointerdown', e => {
            e.preventDefault(); e.stopPropagation();
            const r = win.getBoundingClientRect();
            S.resizeInit = { ex: e.clientX, ey: e.clientY, w: r.width, h: r.height };
            active = true;
            try { handle.setPointerCapture(e.pointerId); } catch(_) {}
        });
        handle.addEventListener('pointermove', e => {
            if (!active || !S.resizeInit) return; e.preventDefault();
            S.size.w = clamp(S.resizeInit.w + (e.clientX - S.resizeInit.ex), 160, 600);
            S.size.h = clamp(S.resizeInit.h + (e.clientY - S.resizeInit.ey), 240, 800);
            win.style.width = S.size.w + 'px'; win.style.height = S.size.h + 'px';
        });
        const stop = e => {
            if (!active) return; active = false; S.resizeInit = null; saveState();
            try { handle.releasePointerCapture(e.pointerId); } catch(_) {}
        };
        handle.addEventListener('pointerup', stop); handle.addEventListener('pointercancel', stop);
    }

    /* ── Persist ─────────────────────────────────────────── */
    function saveState() {
        localStorage.setItem(KEY_POS,  JSON.stringify(S.pos));
        localStorage.setItem(KEY_SIZE, JSON.stringify(S.size));
    }
    function syncEnabled() {
        const btn = document.getElementById('call-toolbar-btn');
        if (btn) btn.style.display = S.enabled ? '' : 'none';
        if (!S.enabled && S.active) endCall();
        S.enabled ? scheduleRandomCall() : clearTimeout(S.randomCallTimer);
    }

    /* ── Events ──────────────────────────────────────────── */
    function bindEvents() {
        document.getElementById('call-inc-reject')?.addEventListener('click', () => {
            document.getElementById('call-incoming-overlay')?.classList.remove('visible');
            clearTimeout(S.incomingTimer);
            const input = document.getElementById('message-input'), sb = document.getElementById('send-btn');
            if (input && sb) { input.value = `📵 已拒绝 ${getName()} 的视频通话`; sb.click(); }
        });
        document.getElementById('call-inc-accept')?.addEventListener('click', () => {
            document.getElementById('call-incoming-overlay')?.classList.remove('visible');
            clearTimeout(S.incomingTimer); startCall(true);
        });
        document.getElementById('call-hangup-btn')?.addEventListener('click', endCall);
        document.getElementById('call-mini-hangup')?.addEventListener('click', e => { e.stopPropagation(); endCall(); });
        document.getElementById('call-minimize-btn')?.addEventListener('click', minimizeWindow);
        document.getElementById('call-mini-pill')?.addEventListener('click', e => {
            if (e.target.closest('.call-mini-hangup')) return;
            // Only restore if not a drag
            if (!S.pillDragOff) restoreWindow();
        });
        document.getElementById('call-immersive-btn')?.addEventListener('click', e => { e.stopPropagation(); toggleImmersive(); });
        document.getElementById('call-window')?.addEventListener('click', e => {
            if (S.immersive && !e.target.closest('#call-immersive-btn')) toggleImmersive();
        });
        document.getElementById('call-size-preset-toggle')?.addEventListener('click', e => {
            e.stopPropagation();
            const p = document.getElementById('call-size-presets');
            if (!p) return;
            p.classList.contains('open') ? p.classList.remove('open') : openSizePresets();
        });
        document.addEventListener('click', e => {
            const btn = e.target.closest('.call-size-btn');
            if (!btn) return;
            S.size.w = parseInt(btn.dataset.w); S.size.h = parseInt(btn.dataset.h);
            const win = document.getElementById('call-window');
            if (win) { win.style.width = S.size.w + 'px'; win.style.height = S.size.h + 'px'; }
            document.getElementById('call-size-presets')?.classList.remove('open');
            saveState();
        });
        document.addEventListener('click', e => {
            if (!e.target.closest('#call-size-preset-toggle') && !e.target.closest('#call-size-presets'))
                document.getElementById('call-size-presets')?.classList.remove('open');
        });
        document.getElementById('call-bg-btn')?.addEventListener('click', () => document.getElementById('call-bg-file-input')?.click());
        document.getElementById('call-bg-file-input')?.addEventListener('change', e => {
            const file = e.target.files?.[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => { S.bgImage = ev.target.result; saveBg(S.bgImage); applyBg(); showNotification?.('通话背景已更新 ✓','success',2000); };
            reader.readAsDataURL(file); e.target.value = '';
        });
        document.addEventListener('change', e => {
            if (e.target.id !== 'call-enabled-toggle') return;
            S.enabled = e.target.checked; localStorage.setItem(KEY_ENABLED, S.enabled); syncEnabled();
        });

        initDrag(); initPillDrag(); initResize();
    }

    /* ── Public API ──────────────────────────────────────── */
    window.callFeature = { startCall, endCall, showIncomingCall, restoreWindow, minimizeWindow };

    /* ── Init ────────────────────────────────────────────── */
    function init() {
        injectCSS(); injectHTML(); bindEvents(); loadBg();
        const tryInject = () => {
            injectSettings(); injectToolbarBtn();
            if (S.enabled) scheduleRandomCall();
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryInject);
        else setTimeout(tryInject, 900);
    }

    init();
})();
