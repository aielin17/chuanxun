/**
 * call.js - 视频通话功能 (Premium Redesign)
 * v2.0 — Fixed: size presets, quota error, hangup icon, collapse mode,
 *         removed extra buttons, video-only, post-call message, alignment
 */

(function () {
    'use strict';

    const KEY_ENABLED = 'callFeatureEnabled';
    const KEY_POS     = 'callWindowPos';
    const KEY_SIZE    = 'callWindowSize';
    const BG_LF_KEY   = 'callBgImageData';

    const S = {
        enabled:    localStorage.getItem(KEY_ENABLED) !== 'false',
        active:     false,
        startTime:  null,
        elapsed:    0,
        timerRAF:   null,
        minimized:  false,
        bgImage:    null,
        pos:        JSON.parse(localStorage.getItem(KEY_POS)  || 'null'),
        size:       JSON.parse(localStorage.getItem(KEY_SIZE) || '{"w":300,"h":480}'),
        dragOff:    null,
        resizeInit: null,
        incomingTimer: null,
        connectingTimer: null,
    };

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // ─── Load BG from localforage ──────────────────────────────────
    function loadBgFromStorage() {
        if (window.localforage) {
            localforage.getItem(BG_LF_KEY).then(val => {
                if (val) { S.bgImage = val; applyBg(); }
            }).catch(() => {});
        }
    }

    function saveBgToStorage(dataUrl) {
        if (!dataUrl) return;
        // Only save if under 3MB to avoid quota issues
        if (dataUrl.length > 3 * 1024 * 1024) {
            showNotification('背景图片太大，已应用但不会持久保存（建议使用较小图片）', 'warning', 4000);
            return;
        }
        if (window.localforage) {
            localforage.setItem(BG_LF_KEY, dataUrl).catch(() => {});
        } else {
            try { localStorage.setItem(KEY_BG_FALLBACK, dataUrl); } catch(e) {}
        }
    }

    // ─── CSS ──────────────────────────────────────────────────────
    function injectCSS() {
        const style = document.createElement('style');
        style.id = 'call-feature-style';
        style.textContent = `
/* ═══════════════════════════════════════════════
   INCOMING OVERLAY
═══════════════════════════════════════════════ */
#call-incoming-overlay {
    position: fixed; inset: 0; z-index: 99990;
    display: none; align-items: center; justify-content: center;
    background: rgba(0,0,0,.6);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
}
#call-incoming-overlay.visible { display: flex; animation: cFadeIn .35s ease; }

.call-inc-card {
    width: 270px;
    background: linear-gradient(160deg, rgba(255,255,255,.1) 0%, rgba(255,255,255,.04) 100%);
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 32px;
    padding: 40px 28px 32px;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    color: #fff;
    box-shadow: 0 32px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.15);
    animation: cCardUp .45s cubic-bezier(.22,1,.36,1);
    position: relative; overflow: hidden;
}
.call-inc-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(var(--accent-color-rgb,224,105,138),.25) 0%, transparent 65%);
    pointer-events: none;
}
.call-inc-avatar-ring {
    position: relative; margin-bottom: 6px;
}
.call-inc-avatar-ring::before,
.call-inc-avatar-ring::after {
    content: '';
    position: absolute; inset: -8px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,.18);
    animation: cRingPulse 2s ease-in-out infinite;
}
.call-inc-avatar-ring::after {
    inset: -16px;
    border-color: rgba(255,255,255,.08);
    animation-delay: .5s;
}
.call-inc-avatar {
    width: 88px; height: 88px; border-radius: 50%;
    background: var(--accent-color, #e0698a);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    border: 2px solid rgba(255,255,255,.25);
    box-shadow: 0 8px 30px rgba(0,0,0,.35);
}
.call-inc-avatar img { width:100%; height:100%; object-fit:cover; }
.call-inc-avatar i { font-size: 36px; color: rgba(255,255,255,.85); }
.call-inc-name { font-size: 22px; font-weight: 700; letter-spacing: .01em; margin-top: 4px; }
.call-inc-sub {
    font-size: 13px; color: rgba(255,255,255,.55);
    display: flex; align-items: center; gap: 6px;
}
.call-inc-sub-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,.5); animation: cBlink 1.1s step-end infinite;
}
.call-inc-actions { display: flex; gap: 40px; margin-top: 22px; }
.call-inc-btn {
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    background: none; border: none; cursor: pointer; color: #fff;
}
.call-inc-btn-circle {
    width: 62px; height: 62px; border-radius: 50%; border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #fff;
    transition: transform .18s, box-shadow .18s;
}
.call-inc-btn:hover .call-inc-btn-circle { transform: scale(1.1); }
.call-inc-btn:active .call-inc-btn-circle { transform: scale(.93); }
.call-inc-reject .call-inc-btn-circle {
    background: linear-gradient(135deg, #ff5252, #c62828);
    box-shadow: 0 6px 22px rgba(255,82,82,.45);
}
.call-inc-accept .call-inc-btn-circle {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    box-shadow: 0 6px 22px rgba(76,175,80,.45);
}
.call-inc-btn-label { font-size: 12px; color: rgba(255,255,255,.55); font-weight: 500; }

/* ═══════════════════════════════════════════════
   CALL WINDOW
═══════════════════════════════════════════════ */
#call-window {
    position: fixed; z-index: 99900;
    border-radius: 24px;
    overflow: visible;
    display: none;
    flex-direction: column;
    box-shadow: 0 28px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.1);
    user-select: none;
    min-width: 220px; min-height: 340px;
    max-width: 90vw; max-height: 90vh;
    will-change: transform;
}
#call-window.visible { display: flex; animation: cWinIn .45s cubic-bezier(.22,1,.36,1); }

/* Inner clip — keeps overflow:hidden for bg */
#call-window-inner {
    border-radius: 24px; overflow: hidden;
    flex: 1; display: flex; flex-direction: column;
    position: relative;
}

/* Background layer */
#call-window-bg {
    position: absolute; inset: 0; z-index: 0;
}
.call-bg-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, #0d1b2a 0%, #1b263b 45%, #415a77 100%);
}
#call-window-bg img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    display: none;
}
/* Animated bokeh orbs */
.call-orb {
    position: absolute; border-radius: 50%;
    filter: blur(40px); opacity: .35;
    animation: cOrb linear infinite;
    pointer-events: none;
}
.call-orb-1 {
    width: 120px; height: 120px;
    background: var(--accent-color, #e0698a);
    top: -20px; left: -20px;
    animation-duration: 18s; animation-delay: 0s;
}
.call-orb-2 {
    width: 90px; height: 90px;
    background: #4a90d9;
    bottom: 20px; right: -10px;
    animation-duration: 22s; animation-delay: -8s;
}
.call-orb-3 {
    width: 70px; height: 70px;
    background: #9b59b6;
    top: 40%; left: 50%;
    animation-duration: 28s; animation-delay: -14s;
}
.call-win-overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(to bottom,
        rgba(0,0,0,.5) 0%,
        rgba(0,0,0,.05) 35%,
        rgba(0,0,0,.05) 60%,
        rgba(0,0,0,.65) 100%);
}

/* Header */
#call-window-header {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 8px;
    cursor: grab;
}
#call-window-header:active { cursor: grabbing; }

.call-win-badge {
    display: flex; align-items: center; gap: 6px;
    background: rgba(0,0,0,.32); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 20px; padding: 4px 11px;
}
.call-win-rec-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #4caf50; box-shadow: 0 0 8px #4caf50;
    animation: cBlink 1.8s ease-in-out infinite alternate;
    flex-shrink: 0;
}
.call-win-timer-text {
    font-size: 12px; font-weight: 700; letter-spacing: .08em;
    color: rgba(255,255,255,.9); font-variant-numeric: tabular-nums;
}
.call-win-quality {
    display: flex; gap: 2px; align-items: flex-end;
}
.call-win-quality span {
    width: 3px; background: rgba(255,255,255,.5); border-radius: 1px;
    display: block;
}
.call-win-quality span:nth-child(1) { height: 5px; }
.call-win-quality span:nth-child(2) { height: 8px; }
.call-win-quality span:nth-child(3) { height: 11px; background: rgba(255,255,255,.85); }

.call-win-top-btns { display: flex; gap: 5px; }
.call-win-top-btn {
    width: 30px; height: 30px; border-radius: 50%; border: none;
    background: rgba(255,255,255,.1); backdrop-filter: blur(6px);
    color: rgba(255,255,255,.75); cursor: pointer; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, transform .15s;
}
.call-win-top-btn:hover { background: rgba(255,255,255,.2); transform: scale(1.08); }
.call-win-top-btn:active { transform: scale(.9); }

/* Connecting state */
#call-connecting-state {
    position: relative; z-index: 10;
    display: none; flex-direction: column; align-items: center;
    justify-content: center; flex: 1; gap: 10px; padding: 16px;
}
#call-connecting-state.visible { display: flex; }
.call-connecting-dots {
    display: flex; gap: 8px; margin-top: 4px;
}
.call-connecting-dots span {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,.6);
    animation: cConnDot .9s ease-in-out infinite;
}
.call-connecting-dots span:nth-child(2) { animation-delay: .15s; }
.call-connecting-dots span:nth-child(3) { animation-delay: .3s; }

/* Body */
#call-window-body {
    position: relative; z-index: 10;
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
    padding: 8px 16px;
}
.call-win-avatar-wrap { position: relative; }
.call-win-avatar-pulse {
    position: absolute; inset: -10px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,.2);
    animation: cAvatarPulse 2.5s ease-in-out infinite;
}
.call-win-avatar-pulse-2 {
    position: absolute; inset: -18px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.1);
    animation: cAvatarPulse 2.5s ease-in-out infinite .6s;
}
.call-win-avatar {
    width: 78px; height: 78px; border-radius: 50%;
    background: var(--accent-color, #e0698a);
    border: 2.5px solid rgba(255,255,255,.3);
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 10px 30px rgba(0,0,0,.4);
    position: relative; z-index: 1;
}
.call-win-avatar img { width:100%; height:100%; object-fit:cover; }
.call-win-avatar i { font-size: 30px; color: rgba(255,255,255,.8); }
.call-win-name {
    font-size: 18px; font-weight: 700; color: #fff;
    text-shadow: 0 2px 10px rgba(0,0,0,.5);
    letter-spacing: .02em; margin-top: 4px;
}
.call-win-type-label {
    font-size: 12px; color: rgba(255,255,255,.5);
    display: flex; align-items: center; gap: 5px;
}

/* Sound wave */
.call-win-wave {
    display: flex; align-items: center; gap: 3px; height: 24px;
}
.call-win-wave span {
    width: 3px; border-radius: 3px;
    background: rgba(255,255,255,.55);
    animation: cWave .8s ease-in-out infinite;
}
.call-win-wave span:nth-child(1) { height: 8px;  animation-delay: 0s; }
.call-win-wave span:nth-child(2) { height: 16px; animation-delay: .1s; }
.call-win-wave span:nth-child(3) { height: 22px; animation-delay: .2s; }
.call-win-wave span:nth-child(4) { height: 16px; animation-delay: .3s; }
.call-win-wave span:nth-child(5) { height: 8px;  animation-delay: .4s; }

/* Controls */
#call-window-controls {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: center;
    padding: 12px 16px 20px; gap: 0;
}
.call-ctrl-hangup-btn {
    width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #ff5252 0%, #c62828 100%);
    box-shadow: 0 8px 28px rgba(255,82,82,.5), 0 0 0 1px rgba(255,255,255,.12);
    transition: transform .18s, box-shadow .2s;
    color: #fff; font-size: 0; /* hide FA icon, use custom */
    position: relative;
}
.call-ctrl-hangup-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 36px rgba(255,82,82,.6), 0 0 0 1px rgba(255,255,255,.2);
}
.call-ctrl-hangup-btn:active { transform: scale(.92); }
/* Custom hang-up phone icon via CSS */
.call-ctrl-hangup-btn::before {
    content: '';
    display: block;
    width: 26px; height: 26px;
    background: #fff;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z' fill='%23fff'/%3E%3Cline x1='22' y1='2' x2='2' y2='22' stroke='%23fff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z' fill='%23fff'/%3E%3Cline x1='22' y1='2' x2='2' y2='22' stroke='%23fff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
    -webkit-mask-size: contain; mask-size: contain;
    -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
    -webkit-mask-position: center; mask-position: center;
}

/* BG upload btn */
.call-bg-upload-btn {
    position: absolute; bottom: 80px; right: 14px; z-index: 10;
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: rgba(255,255,255,.12); backdrop-filter: blur(8px);
    color: rgba(255,255,255,.65); cursor: pointer; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, color .2s, transform .15s;
}
.call-bg-upload-btn:hover { background: rgba(255,255,255,.22); color: #fff; transform: scale(1.1); }
#call-bg-file-input { display: none; }

/* Resize handle — outside inner clip */
#call-resize-handle {
    position: absolute; bottom: -2px; right: -2px; z-index: 99901;
    width: 24px; height: 24px; cursor: se-resize;
    display: flex; align-items: flex-end; justify-content: flex-end; padding: 5px;
}
#call-resize-handle::after {
    content: '';
    width: 11px; height: 11px;
    border-right: 2px solid rgba(255,255,255,.35);
    border-bottom: 2px solid rgba(255,255,255,.35);
    border-radius: 0 0 4px 0;
}

/* Size presets — portaled to body, not inside call-window */
#call-size-presets {
    position: fixed; z-index: 99950;
    display: none; flex-direction: column; gap: 3px;
    background: rgba(15,22,40,.92); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px; padding: 6px;
    box-shadow: 0 12px 36px rgba(0,0,0,.5);
    min-width: 150px;
}
#call-size-presets.open { display: flex; animation: cFadeIn .18s ease; }
.call-size-preset-btn {
    padding: 8px 12px; font-size: 12px; color: rgba(255,255,255,.8);
    background: none; border: none; border-radius: 8px;
    cursor: pointer; white-space: nowrap; text-align: left;
    transition: background .15s; display: flex; align-items: center; gap: 8px;
}
.call-size-preset-btn:hover { background: rgba(255,255,255,.1); color: #fff; }
.call-size-preset-btn i { color: var(--accent-color, #e0698a); width: 12px; }

/* ═══════════════════════════════════════════════
   MINI PILL
═══════════════════════════════════════════════ */
#call-mini-pill {
    position: fixed; bottom: 80px; right: 16px; z-index: 99901;
    display: none; align-items: center; gap: 9px;
    background: rgba(10,18,38,.88); backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 30px; padding: 9px 16px 9px 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
    cursor: pointer; color: #fff;
    user-select: none;
}
#call-mini-pill.visible { display: flex; animation: cPillIn .3s cubic-bezier(.22,1,.36,1); }
.call-mini-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--accent-color, #e0698a); overflow: hidden;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.call-mini-avatar img { width:100%; height:100%; object-fit:cover; }
.call-mini-avatar i { font-size: 12px; color: rgba(255,255,255,.8); }
.call-mini-info { display: flex; flex-direction: column; gap: 1px; }
.call-mini-name { font-size: 12px; font-weight: 600; line-height: 1; }
.call-mini-timer {
    font-size: 11px; color: rgba(255,255,255,.55);
    font-variant-numeric: tabular-nums; font-weight: 500; letter-spacing: .04em;
}
.call-mini-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #4caf50; box-shadow: 0 0 6px #4caf50;
    animation: cBlink 1.6s ease-in-out infinite alternate; flex-shrink: 0;
}
.call-mini-hangup {
    width: 28px; height: 28px; border-radius: 50%; border: none;
    background: rgba(255,82,82,.75); color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, transform .15s; flex-shrink: 0;
    font-size: 0; position: relative;
}
.call-mini-hangup::before {
    content: '';
    width: 14px; height: 14px;
    display: block;
    background: #fff;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z' fill='%23fff'/%3E%3Cline x1='22' y1='2' x2='2' y2='22' stroke='%23fff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.1.3 0 .7-.2 1L6.6 10.8z' fill='%23fff'/%3E%3Cline x1='22' y1='2' x2='2' y2='22' stroke='%23fff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E");
    -webkit-mask-size: contain; mask-size: contain;
    -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
    -webkit-mask-position: center; mask-position: center;
}
.call-mini-hangup:hover { background: #ff5252; transform: scale(1.12); }

/* ═══════════════════════════════════════════════
   SETTINGS CARD
═══════════════════════════════════════════════ */
.call-settings-row {
    display: flex; align-items: center; gap: 14px; padding: 12px 0;
    border-bottom: 1px solid var(--border-color, rgba(128,128,128,.15));
}
.call-settings-row:last-child { border-bottom: none; }
.call-settings-icon {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(var(--accent-color-rgb,224,105,138),.2), rgba(var(--accent-color-rgb,224,105,138),.08));
    color: var(--accent-color, #e0698a); font-size: 15px;
}
.call-settings-info { flex: 1; min-width: 0; }
.call-settings-title { font-size: 14px; font-weight: 500; color: var(--text-color, inherit); }
.call-settings-desc { font-size: 12px; color: var(--secondary-text, rgba(128,128,128,.8)); margin-top: 2px; }
.call-feature-toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.call-feature-toggle input { opacity: 0; width: 0; height: 0; }
.call-toggle-slider {
    position: absolute; cursor: pointer; inset: 0;
    background: var(--border-color, rgba(128,128,128,.25)); border-radius: 24px; transition: .3s;
}
.call-toggle-slider::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; left: 3px; top: 3px;
    transition: .3s; box-shadow: 0 1px 4px rgba(0,0,0,.25);
}
.call-feature-toggle input:checked + .call-toggle-slider { background: var(--accent-color, #e0698a); }
.call-feature-toggle input:checked + .call-toggle-slider::before { transform: translateX(20px); }
.call-simulate-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 20px; border: none;
    background: rgba(var(--accent-color-rgb,224,105,138),.12);
    color: var(--accent-color, #e0698a); font-size: 12px;
    cursor: pointer; transition: background .2s, transform .15s;
    border: 1px solid rgba(var(--accent-color-rgb,224,105,138),.22);
    white-space: nowrap;
}
.call-simulate-btn:hover { background: rgba(var(--accent-color-rgb,224,105,138),.22); transform: translateY(-1px); }

/* ═══════════════════════════════════════════════
   TOOLBAR BUTTON — matches existing input-btn style
═══════════════════════════════════════════════ */
#call-toolbar-btn {
    /* Inherits .input-btn class styles */
}

/* Collapse mode — hide call button */
body.bottom-collapse-mode #call-toolbar-btn {
    display: none !important;
}

/* ═══════════════════════════════════════════════
   KEYFRAMES
═══════════════════════════════════════════════ */
@keyframes cFadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes cCardUp  { from { opacity: 0; transform: translateY(28px) scale(.94); } to { opacity: 1; transform: none; } }
@keyframes cWinIn   { from { opacity: 0; transform: scale(.85) translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes cPillIn  { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
@keyframes cRingPulse {
    0%,100% { opacity: .6; transform: scale(1); }
    50%      { opacity: .2; transform: scale(1.12); }
}
@keyframes cAvatarPulse {
    0%,100% { opacity: .7; transform: scale(1); }
    50%      { opacity: .2; transform: scale(1.15); }
}
@keyframes cBlink    { from { opacity: 1; } to { opacity: .2; } }
@keyframes cOrb      {
    0%   { transform: translate(0,0) rotate(0deg); }
    33%  { transform: translate(20px, -15px) rotate(120deg); }
    66%  { transform: translate(-10px, 20px) rotate(240deg); }
    100% { transform: translate(0,0) rotate(360deg); }
}
@keyframes cWave {
    0%,100% { transform: scaleY(1); opacity: .55; }
    50%      { transform: scaleY(.4); opacity: .3; }
}
@keyframes cConnDot {
    0%,80%,100% { transform: scale(.8); opacity: .4; }
    40%          { transform: scale(1.2); opacity: 1; }
}
        `;
        document.head.appendChild(style);
    }

    // ─── HTML ─────────────────────────────────────────────────────
    function injectHTML() {
        const root = document.createElement('div');
        root.id = 'call-feature-root';
        root.innerHTML = `
<!-- INCOMING OVERLAY -->
<div id="call-incoming-overlay">
  <div class="call-inc-card">
    <div class="call-inc-avatar-ring">
      <div class="call-inc-avatar" id="call-inc-avatar">
        <i class="fas fa-user" id="call-inc-avatar-icon"></i>
      </div>
    </div>
    <div class="call-inc-name" id="call-inc-name">对方</div>
    <div class="call-inc-sub">
      <span class="call-inc-sub-dot"></span>
      <span>邀请您进行视频通话</span>
    </div>
    <div class="call-inc-actions">
      <button class="call-inc-btn call-inc-reject" id="call-inc-reject">
        <div class="call-inc-btn-circle"><i class="fas fa-times"></i></div>
        <span class="call-inc-btn-label">拒绝</span>
      </button>
      <button class="call-inc-btn call-inc-accept" id="call-inc-accept">
        <div class="call-inc-btn-circle"><i class="fas fa-video"></i></div>
        <span class="call-inc-btn-label">接听</span>
      </button>
    </div>
  </div>
</div>

<!-- ACTIVE CALL WINDOW -->
<div id="call-window">
  <div id="call-window-inner">
    <!-- Background -->
    <div id="call-window-bg">
      <div class="call-bg-gradient"></div>
      <div class="call-orb call-orb-1"></div>
      <div class="call-orb call-orb-2"></div>
      <div class="call-orb call-orb-3"></div>
      <img id="call-bg-img" src="" alt="">
    </div>
    <div class="call-win-overlay"></div>

    <!-- Header -->
    <div id="call-window-header">
      <div class="call-win-badge">
        <span class="call-win-rec-dot" id="call-win-status-dot"></span>
        <span class="call-win-timer-text" id="call-timer-display">00:00</span>
        <div class="call-win-quality">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="call-win-top-btns">
        <button class="call-win-top-btn" id="call-size-preset-toggle" title="调整大小">
          <i class="fas fa-expand-alt"></i>
        </button>
        <button class="call-win-top-btn" id="call-minimize-btn" title="最小化">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    </div>

    <!-- Connecting state -->
    <div id="call-connecting-state">
      <div class="call-win-avatar-wrap">
        <div class="call-win-avatar-pulse"></div>
        <div class="call-win-avatar-pulse-2"></div>
        <div class="call-win-avatar" id="call-connecting-avatar">
          <i class="fas fa-user" id="call-connecting-avatar-icon"></i>
        </div>
      </div>
      <div class="call-win-name" id="call-connecting-name">对方</div>
      <div class="call-win-type-label"><i class="fas fa-video" style="font-size:10px;"></i> 正在连接...</div>
      <div class="call-connecting-dots"><span></span><span></span><span></span></div>
    </div>

    <!-- Body (active call) -->
    <div id="call-window-body">
      <div class="call-win-avatar-wrap">
        <div class="call-win-avatar-pulse"></div>
        <div class="call-win-avatar-pulse-2"></div>
        <div class="call-win-avatar" id="call-win-avatar">
          <i class="fas fa-user" id="call-win-avatar-icon"></i>
        </div>
      </div>
      <div class="call-win-name" id="call-win-name">通话中</div>
      <div class="call-win-wave">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>

    <!-- BG Upload -->
    <button class="call-bg-upload-btn" id="call-bg-upload-btn" title="更换背景">
      <i class="fas fa-image"></i>
    </button>
    <input type="file" id="call-bg-file-input" accept="image/*,.gif">

    <!-- Controls -->
    <div id="call-window-controls">
      <button class="call-ctrl-hangup-btn" id="call-hangup-btn" title="挂断"></button>
    </div>
  </div>

  <!-- Resize handle (outside inner clip) -->
  <div id="call-resize-handle" title="拖拽调整大小"></div>
</div>

<!-- SIZE PRESETS (portaled to avoid overflow:hidden clipping) -->
<div id="call-size-presets">
  <button class="call-size-preset-btn" data-w="220" data-h="360"><i class="fas fa-compress-alt"></i>小巧</button>
  <button class="call-size-preset-btn" data-w="300" data-h="480"><i class="fas fa-square"></i>标准</button>
  <button class="call-size-preset-btn" data-w="380" data-h="580"><i class="fas fa-expand"></i>宽敞</button>
  <button class="call-size-preset-btn" data-w="460" data-h="680"><i class="fas fa-expand-arrows-alt"></i>超大</button>
</div>

<!-- MINI PILL -->
<div id="call-mini-pill">
  <div class="call-mini-avatar" id="call-mini-avatar">
    <i class="fas fa-user" id="call-mini-avatar-icon"></i>
  </div>
  <div class="call-mini-info">
    <div class="call-mini-name" id="call-mini-name">通话中</div>
    <div class="call-mini-timer" id="call-mini-timer">00:00</div>
  </div>
  <span class="call-mini-dot"></span>
  <button class="call-mini-hangup" id="call-mini-hangup" title="挂断"></button>
</div>
        `;
        document.body.appendChild(root);
    }

    // ─── Settings Inject ──────────────────────────────────────────
    function injectSettingsToggle() {
        const anchor = document.getElementById('notif-permission-toggle');
        if (!anchor) return;
        const notifCard = anchor.closest('.dm-card');
        if (!notifCard) return;

        const label = document.createElement('div');
        label.className = 'dm-group-label';
        label.innerHTML = '<i class="fas fa-video" style="margin-right:5px;"></i>通话功能';

        const card = document.createElement('div');
        card.className = 'dm-card';
        card.id = 'call-settings-card';
        card.innerHTML = `
            <div class="call-settings-row">
                <div class="call-settings-icon"><i class="fas fa-video"></i></div>
                <div class="call-settings-info">
                    <div class="call-settings-title">模拟视频通话</div>
                    <div class="call-settings-desc">开启后可在聊天中发起模拟视频通话</div>
                </div>
                <label class="call-feature-toggle">
                    <input type="checkbox" id="call-enabled-toggle" ${S.enabled ? 'checked' : ''}>
                    <span class="call-toggle-slider"></span>
                </label>
            </div>
            <div class="call-settings-row" id="call-simulate-row" style="${S.enabled ? '' : 'display:none;'}">
                <div class="call-settings-icon"><i class="fas fa-bell"></i></div>
                <div class="call-settings-info">
                    <div class="call-settings-title">模拟来电</div>
                    <div class="call-settings-desc">模拟对方发起视频通话请求</div>
                </div>
                <button class="call-simulate-btn" id="call-simulate-incoming">
                    <i class="fas fa-phone-volume"></i> 模拟来电
                </button>
            </div>
        `;

        notifCard.parentNode.insertBefore(label, notifCard.nextSibling);
        notifCard.parentNode.insertBefore(card, label.nextSibling);
    }

    // ─── Toolbar Button ───────────────────────────────────────────
    function injectToolbarButton() {
        const attachBtn = document.getElementById('attachment-btn');
        if (!attachBtn) return;
        if (document.getElementById('call-toolbar-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'call-toolbar-btn';
        btn.title = '视频通话';
        // Use same classes as other input buttons for consistent alignment
        btn.className = 'icon-btn input-btn collapse-hideable';
        btn.style.cssText = `display: ${S.enabled ? '' : 'none'};`;
        btn.innerHTML = '<i class="fas fa-video"></i>';
        btn.addEventListener('click', () => {
            if (!S.enabled) return;
            if (S.active) { restoreWindow(); return; }
            startCall();
        });

        attachBtn.parentNode.insertBefore(btn, attachBtn);
    }

    // ─── Timer ────────────────────────────────────────────────────
    function formatTime(ms) {
        const s  = Math.floor(ms / 1000);
        const m  = Math.floor(s / 60);
        const h  = Math.floor(m / 60);
        const ss = String(s % 60).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
    }

    function tickTimer() {
        if (!S.active || !S.startTime) return;
        S.elapsed = Date.now() - S.startTime;
        const t = formatTime(S.elapsed);
        const timerEl = document.getElementById('call-timer-display');
        const miniTimer = document.getElementById('call-mini-timer');
        if (timerEl)   timerEl.textContent   = t;
        if (miniTimer) miniTimer.textContent  = t;
        S.timerRAF = requestAnimationFrame(tickTimer);
    }

    // ─── Partner info helpers ─────────────────────────────────────
    function getPartnerAvatar() {
        const img = document.querySelector('#partner-avatar img') ||
                    document.querySelector('[id*="partner-avatar"] img') ||
                    document.querySelector('.partner-avatar img');
        return img ? img.src : null;
    }
    function getPartnerName() {
        if (window.settings && settings.partnerName) return settings.partnerName;
        const el = document.getElementById('partner-name');
        return el ? el.textContent.trim() : '对方';
    }

    function applyPartnerInfo(avatarId, iconId, nameId, miniAvatarId, miniIconId, miniNameId) {
        const name   = getPartnerName();
        const avatar = getPartnerAvatar();

        const setAvatar = (avId, icId) => {
            const avEl = document.getElementById(avId);
            const icEl = document.getElementById(icId);
            if (avEl && avatar) {
                avEl.innerHTML = `<img src="${avatar}" alt="${name}">`;
            } else if (icEl) {
                icEl.style.display = '';
            }
        };
        setAvatar(avatarId, iconId);
        if (miniAvatarId) setAvatar(miniAvatarId, miniIconId);

        if (nameId)    { const el = document.getElementById(nameId);    if (el) el.textContent = name; }
        if (miniNameId){ const el = document.getElementById(miniNameId); if (el) el.textContent = name; }
    }

    // ─── Send post-call message ───────────────────────────────────
    function sendCallEndMessage(duration) {
        if (duration < 3000) return; // skip if rejected immediately
        const timeStr = formatTime(duration);
        const text = `📹 视频通话已结束 · 通话时长 ${timeStr}`;
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        if (!input || !sendBtn) return;

        // Temporarily set value and trigger send
        const prevVal = input.value;
        input.value = text;
        sendBtn.click();
        // Restore if send didn't consume it (edge case)
        setTimeout(() => { if (input.value === text) input.value = prevVal; }, 100);
    }

    // ─── Background ───────────────────────────────────────────────
    function applyBg() {
        const img = document.getElementById('call-bg-img');
        if (!img) return;
        if (S.bgImage) {
            img.src = S.bgImage;
            img.style.display = 'block';
        } else {
            img.src = '';
            img.style.display = 'none';
        }
    }

    // ─── Window positioning ───────────────────────────────────────
    function positionWindow() {
        const win = document.getElementById('call-window');
        if (!win) return;
        win.style.width  = S.size.w + 'px';
        win.style.height = S.size.h + 'px';

        if (S.pos) {
            win.style.left   = clamp(S.pos.x, 0, window.innerWidth  - S.size.w) + 'px';
            win.style.top    = clamp(S.pos.y, 0, window.innerHeight - S.size.h) + 'px';
            win.style.right  = 'auto';
            win.style.bottom = 'auto';
        } else {
            win.style.right  = '20px';
            win.style.top    = '72px';
            win.style.left   = 'auto';
            win.style.bottom = 'auto';
        }
    }

    // ─── Start / End ──────────────────────────────────────────────
    function startCall() {
        if (!S.enabled) return;
        S.active    = true;
        S.startTime = null; // Will set after connecting
        S.elapsed   = 0;
        S.minimized = false;

        // Show connecting state first
        const win = document.getElementById('call-window');
        const body = document.getElementById('call-window-body');
        const connecting = document.getElementById('call-connecting-state');
        const timerBadge = document.getElementById('call-timer-display');

        applyPartnerInfo('call-connecting-avatar', 'call-connecting-avatar-icon', 'call-connecting-name', null, null, null);
        applyPartnerInfo('call-win-avatar', 'call-win-avatar-icon', 'call-win-name', 'call-mini-avatar', 'call-mini-avatar-icon', 'call-mini-name');
        applyBg();
        positionWindow();

        if (win) win.classList.add('visible');
        if (connecting) connecting.classList.add('visible');
        if (body) body.style.display = 'none';
        if (timerBadge) timerBadge.textContent = '连接中';

        // Simulate connecting delay 1.5–3s
        const delay = 1500 + Math.random() * 1500;
        S.connectingTimer = setTimeout(() => {
            if (!S.active) return;
            S.startTime = Date.now();
            if (connecting) connecting.classList.remove('visible');
            if (body) body.style.display = '';
            tickTimer();
        }, delay);
    }

    function endCall() {
        if (!S.active) return;

        const duration = S.elapsed;
        S.active    = false;
        S.startTime = null;
        cancelAnimationFrame(S.timerRAF);
        clearTimeout(S.connectingTimer);

        const win  = document.getElementById('call-window');
        const pill = document.getElementById('call-mini-pill');
        const inc  = document.getElementById('call-incoming-overlay');
        if (win)  win.classList.remove('visible');
        if (pill) pill.classList.remove('visible');
        if (inc)  inc.classList.remove('visible');
        clearTimeout(S.incomingTimer);

        // Reset body/connecting visibility for next call
        const body = document.getElementById('call-window-body');
        const connecting = document.getElementById('call-connecting-state');
        if (body) body.style.display = '';
        if (connecting) connecting.classList.remove('visible');

        saveWindowState();

        // Send call-end message in chat
        sendCallEndMessage(duration);

        if (typeof showNotification === 'function' && duration > 2000) {
            showNotification(`通话结束 · 时长 ${formatTime(duration)}`, 'info', 3000);
        }
    }

    // ─── Incoming call ────────────────────────────────────────────
    function showIncomingCall() {
        if (!S.enabled || S.active) return;
        const overlay = document.getElementById('call-incoming-overlay');
        if (!overlay) return;
        applyPartnerInfo('call-inc-avatar', 'call-inc-avatar-icon', 'call-inc-name', null, null, null);
        overlay.classList.add('visible');
        S.incomingTimer = setTimeout(() => overlay.classList.remove('visible'), 20000);
    }

    // ─── Minimize / Restore ───────────────────────────────────────
    function minimizeWindow() {
        S.minimized = true;
        const win  = document.getElementById('call-window');
        const pill = document.getElementById('call-mini-pill');
        if (win)  win.classList.remove('visible');
        if (pill) pill.classList.add('visible');
    }

    function restoreWindow() {
        S.minimized = false;
        const win  = document.getElementById('call-window');
        const pill = document.getElementById('call-mini-pill');
        if (win)  { positionWindow(); win.classList.add('visible'); }
        if (pill) pill.classList.remove('visible');
    }

    // ─── Size presets positioning ─────────────────────────────────
    function openSizePresets() {
        const presets = document.getElementById('call-size-presets');
        const btn = document.getElementById('call-size-preset-toggle');
        if (!presets || !btn) return;

        const rect = btn.getBoundingClientRect();
        presets.style.top  = (rect.bottom + 8) + 'px';
        presets.style.left = (rect.left - 80) + 'px';
        presets.classList.add('open');
    }

    // ─── Drag ─────────────────────────────────────────────────────
    function initDrag() {
        const header = document.getElementById('call-window-header');
        const win    = document.getElementById('call-window');
        if (!header || !win) return;

        const onStart = (ex, ey) => {
            const rect = win.getBoundingClientRect();
            S.dragOff = { x: ex - rect.left, y: ey - rect.top };
        };
        const onMove = (ex, ey) => {
            if (!S.dragOff) return;
            const nx = clamp(ex - S.dragOff.x, 0, window.innerWidth  - win.offsetWidth);
            const ny = clamp(ey - S.dragOff.y, 0, window.innerHeight - win.offsetHeight);
            win.style.left = nx + 'px'; win.style.top = ny + 'px';
            win.style.right = 'auto'; win.style.bottom = 'auto';
        };
        const onEnd = () => {
            if (!S.dragOff) return;
            S.dragOff = null;
            const rect = win.getBoundingClientRect();
            S.pos = { x: rect.left, y: rect.top };
            saveWindowState();
        };

        header.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientX, e.clientY); });
        header.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('mousemove',  e => onMove(e.clientX, e.clientY));
        document.addEventListener('touchmove',  e => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('mouseup',  onEnd);
        document.addEventListener('touchend', onEnd);
    }

    // ─── Resize ───────────────────────────────────────────────────
    function initResize() {
        const handle = document.getElementById('call-resize-handle');
        const win    = document.getElementById('call-window');
        if (!handle || !win) return;

        const onStart = (ex, ey) => {
            const rect = win.getBoundingClientRect();
            S.resizeInit = { ex, ey, w: rect.width, h: rect.height };
        };
        const onMove = (ex, ey) => {
            if (!S.resizeInit) return;
            S.size.w = clamp(S.resizeInit.w + (ex - S.resizeInit.ex), 220, 600);
            S.size.h = clamp(S.resizeInit.h + (ey - S.resizeInit.ey), 320, 800);
            win.style.width = S.size.w + 'px'; win.style.height = S.size.h + 'px';
        };
        const onEnd = () => {
            if (!S.resizeInit) return;
            S.resizeInit = null; saveWindowState();
        };

        handle.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientX, e.clientY); });
        handle.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('mousemove',  e => onMove(e.clientX, e.clientY));
        document.addEventListener('touchmove',  e => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('mouseup',  onEnd);
        document.addEventListener('touchend', onEnd);
    }

    // ─── Save ─────────────────────────────────────────────────────
    function saveWindowState() {
        localStorage.setItem(KEY_POS,  JSON.stringify(S.pos));
        localStorage.setItem(KEY_SIZE, JSON.stringify(S.size));
    }

    function updateCallEnabled() {
        const btn = document.getElementById('call-toolbar-btn');
        if (btn) btn.style.display = S.enabled ? '' : 'none';
        const simRow = document.getElementById('call-simulate-row');
        if (simRow) simRow.style.display = S.enabled ? '' : 'none';
        if (!S.enabled && S.active) endCall();
    }

    // ─── Events ───────────────────────────────────────────────────
    function bindEvents() {
        // Incoming: reject
        document.getElementById('call-inc-reject')?.addEventListener('click', () => {
            document.getElementById('call-incoming-overlay')?.classList.remove('visible');
            clearTimeout(S.incomingTimer);
        });

        // Incoming: accept
        document.getElementById('call-inc-accept')?.addEventListener('click', () => {
            document.getElementById('call-incoming-overlay')?.classList.remove('visible');
            clearTimeout(S.incomingTimer);
            startCall();
        });

        // Hang up (main)
        document.getElementById('call-hangup-btn')?.addEventListener('click', endCall);

        // Hang up (mini)
        document.getElementById('call-mini-hangup')?.addEventListener('click', (e) => {
            e.stopPropagation(); endCall();
        });

        // Minimize
        document.getElementById('call-minimize-btn')?.addEventListener('click', minimizeWindow);

        // Restore via pill click
        document.getElementById('call-mini-pill')?.addEventListener('click', (e) => {
            if (e.target.closest('.call-mini-hangup')) return;
            restoreWindow();
        });

        // Size preset toggle
        document.getElementById('call-size-preset-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const presets = document.getElementById('call-size-presets');
            if (!presets) return;
            if (presets.classList.contains('open')) {
                presets.classList.remove('open');
            } else {
                openSizePresets();
            }
        });

        // Size preset items — use event delegation for reliability
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.call-size-preset-btn');
            if (!btn) return;
            S.size.w = parseInt(btn.dataset.w);
            S.size.h = parseInt(btn.dataset.h);
            const win = document.getElementById('call-window');
            if (win) { win.style.width = S.size.w + 'px'; win.style.height = S.size.h + 'px'; }
            document.getElementById('call-size-presets')?.classList.remove('open');
            saveWindowState();
        });

        // Close size presets on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#call-size-preset-toggle') && !e.target.closest('#call-size-presets')) {
                document.getElementById('call-size-presets')?.classList.remove('open');
            }
        });

        // BG upload
        document.getElementById('call-bg-upload-btn')?.addEventListener('click', () => {
            document.getElementById('call-bg-file-input')?.click();
        });

        document.getElementById('call-bg-file-input')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            // Warn if too large
            if (file.size > 4 * 1024 * 1024) {
                showNotification?.('图片太大（>4MB），请选择更小的图片', 'warning', 3000);
                e.target.value = ''; return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                S.bgImage = ev.target.result;
                saveBgToStorage(S.bgImage);
                applyBg();
                showNotification?.('通话背景已更新 ✓', 'success', 2000);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });

        // Settings toggle
        document.addEventListener('change', (e) => {
            if (e.target.id === 'call-enabled-toggle') {
                S.enabled = e.target.checked;
                localStorage.setItem(KEY_ENABLED, S.enabled);
                updateCallEnabled();
            }
        });

        // Simulate incoming
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#call-simulate-incoming')) return;
            const dataModal = document.getElementById('data-modal');
            if (dataModal && typeof hideModal === 'function') hideModal(dataModal);
            setTimeout(() => showIncomingCall(), 400);
        });

        initDrag();
        initResize();
    }

    // ─── Public API ───────────────────────────────────────────────
    window.callFeature = { startCall, endCall, showIncomingCall, restoreWindow, minimizeWindow };

    // ─── Init ─────────────────────────────────────────────────────
    function init() {
        injectCSS();
        injectHTML();
        bindEvents();
        loadBgFromStorage();

        const tryInject = () => {
            injectSettingsToggle();
            injectToolbarButton();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInject);
        } else {
            setTimeout(tryInject, 800);
        }
    }

    init();
})();
