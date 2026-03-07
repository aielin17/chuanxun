/**
 * call.js - 视频/语音通话功能
 * Floating Video/Voice Call Widget
 * 
 * 集成方式：在 index.html 的 </body> 前添加：
 * <script src="js/features/call.js"></script>
 */

(function () {
    'use strict';

    // ─── Storage Keys ─────────────────────────────────────────────
    const KEY_ENABLED  = 'callFeatureEnabled';
    const KEY_BG       = 'callBgImage';
    const KEY_POS      = 'callWindowPos';
    const KEY_SIZE     = 'callWindowSize';

    // ─── State ────────────────────────────────────────────────────
    const S = {
        enabled:    localStorage.getItem(KEY_ENABLED) !== 'false',
        active:     false,
        type:       'video',   // 'video' | 'voice'
        startTime:  null,
        elapsed:    0,
        timerRAF:   null,
        muted:      false,
        camOff:     false,
        minimized:  false,
        bgImage:    localStorage.getItem(KEY_BG) || null,
        pos:        JSON.parse(localStorage.getItem(KEY_POS)  || 'null'),
        size:       JSON.parse(localStorage.getItem(KEY_SIZE) || '{"w":300,"h":460}'),
        dragOff:    null,
        resizeInit: null,
        incomingTimer: null,
    };

    // Clamp helper
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // ─── CSS ──────────────────────────────────────────────────────
    function injectCSS() {
        const style = document.createElement('style');
        style.id = 'call-feature-style';
        style.textContent = `
/* ═══════════════════════════════════════════════════
   CALL FEATURE — Incoming Overlay
═══════════════════════════════════════════════════ */
#call-incoming-overlay {
    position: fixed; inset: 0; z-index: 99990;
    display: none; align-items: center; justify-content: center;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: callFadeIn .35s ease;
}
#call-incoming-overlay.visible { display: flex; }

.call-incoming-card {
    width: 260px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 28px;
    padding: 36px 24px 28px;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    color: #fff;
    box-shadow: 0 24px 60px rgba(0,0,0,.5);
    animation: callCardUp .4s cubic-bezier(.22,1,.36,1);
}
.call-incoming-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--accent-color, #e0698a);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    box-shadow: 0 0 0 4px rgba(255,255,255,.15), 0 0 0 8px rgba(255,255,255,.07);
    margin-bottom: 4px;
    animation: callPulse 1.8s ease-in-out infinite;
}
.call-incoming-avatar img { width:100%; height:100%; object-fit:cover; }
.call-incoming-avatar-fallback { font-size: 32px; color: #fff; }
.call-incoming-name { font-size: 20px; font-weight: 600; letter-spacing: .02em; }
.call-incoming-label {
    font-size: 13px; opacity: .65; display: flex; align-items: center; gap: 5px;
}
.call-incoming-label i { font-size: 11px; animation: callBlink 1.2s step-end infinite; }
.call-incoming-actions {
    display: flex; gap: 32px; margin-top: 20px;
}
.call-inc-btn {
    width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: #fff; transition: transform .18s, box-shadow .18s;
}
.call-inc-btn:hover { transform: scale(1.1); }
.call-inc-btn:active { transform: scale(.95); }
.call-inc-reject { background: linear-gradient(135deg, #ff4d4d, #c0392b); box-shadow: 0 4px 18px rgba(255,77,77,.5); }
.call-inc-accept { background: linear-gradient(135deg, #27ae60, #1e8449); box-shadow: 0 4px 18px rgba(39,174,96,.5); }

/* ═══════════════════════════════════════════════════
   CALL WINDOW — Main Floating Widget
═══════════════════════════════════════════════════ */
#call-window {
    position: fixed; z-index: 99900;
    border-radius: 22px;
    overflow: hidden;
    display: none;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08);
    user-select: none;
    animation: callWinIn .4s cubic-bezier(.22,1,.36,1);
    min-width: 200px; min-height: 300px;
    max-width: 90vw; max-height: 90vh;
    will-change: transform;
}
#call-window.visible { display: flex; }

/* Background layer */
#call-window-bg {
    position: absolute; inset: 0; z-index: 0;
    background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    background-size: cover; background-position: center;
}
#call-window-bg img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    pointer-events: none;
}
.call-win-overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(to bottom,
        rgba(0,0,0,.42) 0%,
        rgba(0,0,0,.1) 40%,
        rgba(0,0,0,.1) 60%,
        rgba(0,0,0,.5) 100%);
}

/* Header bar */
#call-window-header {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px;
    cursor: grab;
}
#call-window-header:active { cursor: grabbing; }
.call-win-timer {
    font-size: 13px; font-weight: 600; letter-spacing: .06em;
    color: rgba(255,255,255,.9);
    background: rgba(0,0,0,.28);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 20px; padding: 3px 10px;
    font-variant-numeric: tabular-nums;
}
.call-win-top-btns { display: flex; gap: 6px; }
.call-win-top-btn {
    width: 28px; height: 28px; border-radius: 50%; border: none;
    background: rgba(255,255,255,.12); backdrop-filter: blur(4px);
    color: rgba(255,255,255,.8); cursor: pointer; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, transform .15s;
}
.call-win-top-btn:hover { background: rgba(255,255,255,.22); transform: scale(1.08); }
.call-win-top-btn:active { transform: scale(.93); }

/* Body */
#call-window-body {
    position: relative; z-index: 10;
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
    padding: 10px 16px;
}
.call-win-avatar {
    width: 74px; height: 74px; border-radius: 50%;
    background: var(--accent-color, #e0698a);
    border: 3px solid rgba(255,255,255,.25);
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(0,0,0,.4);
}
.call-win-avatar img { width:100%; height:100%; object-fit:cover; }
.call-win-avatar-icon { font-size: 28px; color: rgba(255,255,255,.8); }
.call-win-name {
    font-size: 16px; font-weight: 600; color: #fff;
    text-shadow: 0 1px 6px rgba(0,0,0,.5);
    letter-spacing: .02em;
}
.call-win-status {
    font-size: 12px; color: rgba(255,255,255,.55);
    display: flex; align-items: center; gap: 5px;
}
.call-win-status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #27ae60; box-shadow: 0 0 6px #27ae60;
    animation: callBlink 1.5s ease-in-out infinite alternate;
}

/* Bottom controls */
#call-window-controls {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: center;
    gap: 14px; padding: 14px 16px 18px;
}
.call-ctrl-btn {
    border: none; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform .18s, box-shadow .18s, background .2s;
    color: #fff;
}
.call-ctrl-btn:active { transform: scale(.9) !important; }
.call-ctrl-sm {
    width: 44px; height: 44px; font-size: 16px;
    background: rgba(255,255,255,.14); backdrop-filter: blur(6px);
}
.call-ctrl-sm:hover { background: rgba(255,255,255,.24); transform: scale(1.05); }
.call-ctrl-sm.active { background: rgba(255,255,255,.85); color: #333; }
.call-ctrl-hangup {
    width: 56px; height: 56px; font-size: 20px;
    background: linear-gradient(135deg, #ff4d4d, #c0392b);
    box-shadow: 0 6px 20px rgba(255,77,77,.5);
}
.call-ctrl-hangup:hover { transform: scale(1.08); box-shadow: 0 8px 28px rgba(255,77,77,.6); }

/* BG upload zone */
.call-win-bg-hint {
    position: absolute; bottom: 88px; right: 12px; z-index: 10;
}
.call-bg-upload-btn {
    width: 30px; height: 30px; border-radius: 50%; border: none;
    background: rgba(255,255,255,.12); backdrop-filter: blur(6px);
    color: rgba(255,255,255,.6); cursor: pointer; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, color .2s, transform .15s;
}
.call-bg-upload-btn:hover { background: rgba(255,255,255,.22); color: #fff; transform: scale(1.1); }
#call-bg-file-input { display: none; }

/* Resize handle */
#call-resize-handle {
    position: absolute; bottom: 0; right: 0; z-index: 20;
    width: 22px; height: 22px; cursor: se-resize;
    display: flex; align-items: flex-end; justify-content: flex-end;
    padding: 5px;
}
#call-resize-handle::after {
    content: '';
    width: 10px; height: 10px;
    border-right: 2px solid rgba(255,255,255,.3);
    border-bottom: 2px solid rgba(255,255,255,.3);
    border-radius: 0 0 3px 0;
}

/* Size presets */
.call-size-presets {
    position: absolute; right: 44px; bottom: 88px; z-index: 10;
    display: none; flex-direction: column; gap: 4px;
    background: rgba(0,0,0,.45); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px; padding: 6px;
}
.call-size-presets.open { display: flex; }
.call-size-preset-btn {
    padding: 5px 10px; font-size: 11px; color: rgba(255,255,255,.8);
    background: none; border: none; border-radius: 6px;
    cursor: pointer; white-space: nowrap; text-align: left;
    transition: background .15s;
}
.call-size-preset-btn:hover { background: rgba(255,255,255,.12); }

/* ═══════════════════════════════════════════════════
   MINI PILL — Minimized State
═══════════════════════════════════════════════════ */
#call-mini-pill {
    position: fixed; bottom: 80px; right: 16px; z-index: 99901;
    display: none; align-items: center; gap: 8px;
    background: rgba(15,25,50,.85); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 28px; padding: 8px 14px;
    box-shadow: 0 8px 28px rgba(0,0,0,.4);
    cursor: pointer; color: #fff;
    animation: callPillIn .3s cubic-bezier(.22,1,.36,1);
    user-select: none;
}
#call-mini-pill.visible { display: flex; }
.call-mini-dot { width: 8px; height: 8px; border-radius: 50%; background: #27ae60; box-shadow: 0 0 6px #27ae60; animation: callBlink 1.5s ease-in-out infinite alternate; flex-shrink: 0; }
.call-mini-timer { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: .04em; }
.call-mini-hangup {
    width: 24px; height: 24px; border-radius: 50%; border: none;
    background: rgba(255,77,77,.7); color: #fff; cursor: pointer;
    font-size: 10px; display: flex; align-items: center; justify-content: center;
    transition: background .2s, transform .15s; flex-shrink: 0;
}
.call-mini-hangup:hover { background: #ff4d4d; transform: scale(1.1); }

/* ═══════════════════════════════════════════════════
   SETTINGS INJECT
═══════════════════════════════════════════════════ */
.call-settings-row {
    display: flex; align-items: center; gap: 14px; padding: 12px 0;
    border-bottom: 1px solid var(--border-color, rgba(255,255,255,.07));
}
.call-settings-icon {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(var(--accent-color-rgb,224,105,138),.2), rgba(var(--accent-color-rgb,224,105,138),.08));
    color: var(--accent-color, #e0698a); font-size: 15px;
}
.call-settings-info { flex: 1; min-width: 0; }
.call-settings-title { font-size: 14px; font-weight: 500; color: var(--text-color, #fff); }
.call-settings-desc { font-size: 12px; color: var(--secondary-text, rgba(255,255,255,.45)); margin-top: 2px; }
.call-feature-toggle {
    position: relative; display: inline-block;
    width: 44px; height: 24px; flex-shrink: 0;
}
.call-feature-toggle input { opacity: 0; width: 0; height: 0; }
.call-toggle-slider {
    position: absolute; cursor: pointer; inset: 0;
    background: var(--border-color, rgba(255,255,255,.15));
    border-radius: 24px; transition: .3s;
}
.call-toggle-slider::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; left: 3px; top: 3px;
    transition: .3s; box-shadow: 0 1px 4px rgba(0,0,0,.3);
}
.call-feature-toggle input:checked + .call-toggle-slider {
    background: var(--accent-color, #e0698a);
}
.call-feature-toggle input:checked + .call-toggle-slider::before {
    transform: translateX(20px);
}

/* Simulate incoming call button (in advanced settings) */
.call-simulate-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 20px; border: none;
    background: rgba(var(--accent-color-rgb,224,105,138),.15);
    color: var(--accent-color, #e0698a); font-size: 12px;
    cursor: pointer; transition: background .2s, transform .15s;
    border: 1px solid rgba(var(--accent-color-rgb,224,105,138),.25);
}
.call-simulate-btn:hover { background: rgba(var(--accent-color-rgb,224,105,138),.25); transform: translateY(-1px); }
.call-simulate-btn:active { transform: translateY(0); }

/* ═══════════════════════════════════════════════════
   KEYFRAMES
═══════════════════════════════════════════════════ */
@keyframes callFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes callCardUp { from { opacity: 0; transform: translateY(30px) scale(.95); } to { opacity: 1; transform: none; } }
@keyframes callWinIn  { from { opacity: 0; transform: scale(.88); } to { opacity: 1; transform: scale(1); } }
@keyframes callPillIn { from { opacity: 0; transform: translateY(10px) scale(.9); } to { opacity: 1; transform: none; } }
@keyframes callPulse  { 0%,100% { box-shadow: 0 0 0 4px rgba(255,255,255,.15), 0 0 0 8px rgba(255,255,255,.07); } 50% { box-shadow: 0 0 0 6px rgba(255,255,255,.2), 0 0 0 12px rgba(255,255,255,.04); } }
@keyframes callBlink  { from { opacity: 1; } to { opacity: .35; } }
@keyframes callRing   { 0%,100% { transform: rotate(0); } 15% { transform: rotate(-12deg); } 30% { transform: rotate(12deg); } 45% { transform: rotate(-8deg); } 60% { transform: rotate(8deg); } 75% { transform: rotate(-4deg); } }
.call-ring-anim { animation: callRing .6s ease-in-out 3; }
        `;
        document.head.appendChild(style);
    }

    // ─── HTML Injection ───────────────────────────────────────────
    function injectHTML() {
        const container = document.createElement('div');
        container.id = 'call-feature-root';
        container.innerHTML = `

<!-- ░░░ INCOMING CALL OVERLAY ░░░ -->
<div id="call-incoming-overlay">
    <div class="call-incoming-card">
        <div class="call-incoming-avatar" id="call-inc-avatar">
            <i class="fas fa-user call-incoming-avatar-fallback" id="call-inc-avatar-icon"></i>
        </div>
        <div class="call-incoming-name" id="call-inc-name">对方</div>
        <div class="call-incoming-label">
            <i class="fas fa-signal"></i>
            <span id="call-inc-type-label">邀请您进行视频通话</span>
        </div>
        <div class="call-incoming-actions">
            <button class="call-inc-btn call-inc-reject" id="call-inc-reject" title="拒绝">
                <i class="fas fa-phone-slash"></i>
            </button>
            <button class="call-inc-btn call-inc-accept" id="call-inc-accept" title="接听">
                <i class="fas fa-phone"></i>
            </button>
        </div>
    </div>
</div>

<!-- ░░░ ACTIVE CALL WINDOW ░░░ -->
<div id="call-window">
    <div id="call-window-bg">
        <img id="call-bg-img" src="" alt="" style="display:none;">
    </div>
    <div class="call-win-overlay"></div>

    <!-- Header / Drag Handle -->
    <div id="call-window-header">
        <div class="call-win-timer" id="call-timer-display">00:00</div>
        <div class="call-win-top-btns">
            <button class="call-win-top-btn" id="call-size-preset-toggle" title="调整大小">
                <i class="fas fa-expand-alt"></i>
            </button>
            <button class="call-win-top-btn" id="call-minimize-btn" title="最小化">
                <i class="fas fa-minus"></i>
            </button>
        </div>
    </div>

    <!-- Size Presets Dropdown -->
    <div class="call-size-presets" id="call-size-presets">
        <button class="call-size-preset-btn" data-w="220" data-h="320">小 220 × 320</button>
        <button class="call-size-preset-btn" data-w="300" data-h="460">中 300 × 460</button>
        <button class="call-size-preset-btn" data-w="380" data-h="560">大 380 × 560</button>
        <button class="call-size-preset-btn" data-w="480" data-h="680">超大 480 × 680</button>
    </div>

    <!-- Body -->
    <div id="call-window-body">
        <div class="call-win-avatar" id="call-win-avatar">
            <i class="fas fa-user call-win-avatar-icon" id="call-win-avatar-icon"></i>
        </div>
        <div class="call-win-name" id="call-win-name">通话中</div>
        <div class="call-win-status">
            <span class="call-win-status-dot" id="call-win-status-dot"></span>
            <span id="call-win-status-text">通话中</span>
        </div>
    </div>

    <!-- BG Upload -->
    <div class="call-win-bg-hint">
        <button class="call-bg-upload-btn" id="call-bg-upload-btn" title="更换背景（支持 GIF）">
            <i class="fas fa-image"></i>
        </button>
        <input type="file" id="call-bg-file-input" accept="image/*,.gif">
    </div>

    <!-- Controls -->
    <div id="call-window-controls">
        <button class="call-ctrl-btn call-ctrl-sm" id="call-mute-btn" title="静音">
            <i class="fas fa-microphone"></i>
        </button>
        <button class="call-ctrl-btn call-ctrl-sm" id="call-cam-btn" title="摄像头">
            <i class="fas fa-video"></i>
        </button>
        <button class="call-ctrl-btn call-ctrl-hangup" id="call-hangup-btn" title="挂断">
            <i class="fas fa-phone-slash"></i>
        </button>
    </div>

    <!-- Resize Handle -->
    <div id="call-resize-handle" title="拖拽调整大小"></div>
</div>

<!-- ░░░ MINI PILL ░░░ -->
<div id="call-mini-pill">
    <span class="call-mini-dot"></span>
    <span class="call-mini-timer" id="call-mini-timer">00:00</span>
    <button class="call-mini-hangup" id="call-mini-hangup" title="挂断">
        <i class="fas fa-phone-slash"></i>
    </button>
</div>
        `;
        document.body.appendChild(container);
    }

    // ─── Settings Inject ──────────────────────────────────────────
    function injectSettingsToggle() {
        // Find the notifications settings section in data-modal
        const targetAnchor = document.getElementById('notif-permission-toggle');
        if (!targetAnchor) return;

        // Insert after the notification card
        const notifCard = targetAnchor.closest('.dm-card');
        if (!notifCard) return;

        const groupLabel = document.createElement('div');
        groupLabel.className = 'dm-group-label';
        groupLabel.innerHTML = '<i class="fas fa-phone" style="margin-right:4px;"></i>通话功能';

        const card = document.createElement('div');
        card.className = 'dm-card';
        card.id = 'call-settings-card';
        card.innerHTML = `
            <div class="call-settings-row">
                <div class="call-settings-icon"><i class="fas fa-phone-alt"></i></div>
                <div class="call-settings-info">
                    <div class="call-settings-title">模拟通话功能</div>
                    <div class="call-settings-desc">开启后可发起或接收模拟视频/语音通话</div>
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
                    <div class="call-settings-desc">模拟对方发起一次通话请求</div>
                </div>
                <button class="call-simulate-btn" id="call-simulate-incoming">
                    <i class="fas fa-phone-volume"></i> 模拟来电
                </button>
            </div>
        `;

        notifCard.parentNode.insertBefore(groupLabel, notifCard.nextSibling);
        notifCard.parentNode.insertBefore(card, groupLabel.nextSibling);
    }

    // ─── Inject Chat Toolbar Button ───────────────────────────────
    function injectToolbarButton() {
        // Add a call button near the send area
        const attachBtn = document.getElementById('attachment-btn');
        if (!attachBtn) return;

        const btn = document.createElement('button');
        btn.id = 'call-toolbar-btn';
        btn.title = '发起通话';
        btn.className = 'icon-btn';
        btn.style.cssText = `
            background: none; border: none; cursor: pointer;
            color: var(--secondary-text, rgba(255,255,255,.5));
            font-size: 16px; padding: 6px;
            transition: color .2s, transform .15s;
            display: ${S.enabled ? 'inline-flex' : 'none'};
            align-items: center; justify-content: center;
        `;
        btn.innerHTML = '<i class="fas fa-phone-alt"></i>';
        btn.addEventListener('mouseenter', () => btn.style.color = 'var(--accent-color, #e0698a)');
        btn.addEventListener('mouseleave', () => btn.style.color = 'var(--secondary-text, rgba(255,255,255,.5))');
        btn.addEventListener('click', showCallTypeMenu);

        attachBtn.parentNode.insertBefore(btn, attachBtn);
    }

    // ─── Call Type Menu ───────────────────────────────────────────
    function showCallTypeMenu() {
        if (!S.enabled) return;
        if (S.active) { restoreWindow(); return; }

        // simple menu
        const existing = document.getElementById('call-type-menu');
        if (existing) { existing.remove(); return; }

        const btn = document.getElementById('call-toolbar-btn');
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.id = 'call-type-menu';
        menu.style.cssText = `
            position:fixed; bottom:${window.innerHeight - rect.top + 8}px; left:${rect.left}px;
            background:var(--secondary-bg, rgba(20,25,40,.96)); backdrop-filter:blur(16px);
            border:1px solid var(--border-color, rgba(255,255,255,.1)); border-radius:14px;
            padding:6px; display:flex; flex-direction:column; gap:2px;
            box-shadow:0 10px 36px rgba(0,0,0,.4); z-index:99800; animation:callFadeIn .2s;
        `;
        const items = [
            { icon: 'fa-video', label: '发起视频通话', type: 'video' },
            { icon: 'fa-phone-alt', label: '发起语音通话', type: 'voice' },
        ];
        items.forEach(({ icon, label, type }) => {
            const item = document.createElement('button');
            item.style.cssText = `
                display:flex; align-items:center; gap:10px; padding:9px 14px;
                background:none; border:none; cursor:pointer; border-radius:10px;
                color:var(--text-color, #fff); font-size:13px; white-space:nowrap;
                transition:background .15s;
            `;
            item.innerHTML = `<i class="fas ${icon}" style="color:var(--accent-color,#e0698a);width:14px;"></i>${label}`;
            item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,.07)');
            item.addEventListener('mouseleave', () => item.style.background = 'none');
            item.addEventListener('click', () => { menu.remove(); startCall(type); });
            menu.appendChild(item);
        });
        document.body.appendChild(menu);
        setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 0);
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
        if (timerEl)  timerEl.textContent  = t;
        if (miniTimer) miniTimer.textContent = t;
        S.timerRAF = requestAnimationFrame(tickTimer);
    }

    // ─── Avatar helpers ───────────────────────────────────────────
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

    function applyPartnerInfo(prefix) {
        const name   = getPartnerName();
        const avatar = getPartnerAvatar();

        const nameEl   = document.getElementById(`call-${prefix}-name`);
        const avatarEl = document.getElementById(`call-${prefix}-avatar`);
        const iconEl   = document.getElementById(`call-${prefix}-avatar-icon`);

        if (nameEl) nameEl.textContent = name;
        if (avatarEl && avatar) {
            avatarEl.innerHTML = `<img src="${avatar}" alt="${name}">`;
        } else if (iconEl) {
            iconEl.style.display = '';
        }
    }

    // ─── Window Positioning ───────────────────────────────────────
    function positionWindow() {
        const win = document.getElementById('call-window');
        if (!win) return;
        win.style.width  = S.size.w + 'px';
        win.style.height = S.size.h + 'px';

        if (S.pos) {
            win.style.left = clamp(S.pos.x, 0, window.innerWidth  - S.size.w) + 'px';
            win.style.top  = clamp(S.pos.y, 0, window.innerHeight - S.size.h) + 'px';
            win.style.right  = 'auto';
            win.style.bottom = 'auto';
        } else {
            // Default: top-right
            win.style.right  = '20px';
            win.style.top    = '80px';
            win.style.left   = 'auto';
            win.style.bottom = 'auto';
        }
    }

    // ─── Background ───────────────────────────────────────────────
    function applyBg() {
        const bgDiv = document.getElementById('call-window-bg');
        const img   = document.getElementById('call-bg-img');
        if (!bgDiv || !img) return;
        if (S.bgImage) {
            img.src = S.bgImage;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    }

    // ─── Start / End Call ─────────────────────────────────────────
    function startCall(type = 'video') {
        if (!S.enabled) return;
        S.active    = true;
        S.type      = type;
        S.startTime = Date.now();
        S.elapsed   = 0;
        S.muted     = false;
        S.camOff    = false;
        S.minimized = false;

        applyPartnerInfo('win');
        applyBg();
        positionWindow();

        // Show window
        const win = document.getElementById('call-window');
        if (win) win.classList.add('visible');

        // Update cam button visibility
        const camBtn = document.getElementById('call-cam-btn');
        if (camBtn) camBtn.style.display = type === 'video' ? '' : 'none';

        // Update status text
        const statusText = document.getElementById('call-win-status-text');
        if (statusText) statusText.textContent = type === 'video' ? '视频通话中' : '语音通话中';

        // Start timer
        tickTimer();
    }

    function endCall() {
        if (!S.active) return;

        const duration = S.elapsed;
        S.active    = false;
        S.startTime = null;
        cancelAnimationFrame(S.timerRAF);

        // Hide all call UI
        const win  = document.getElementById('call-window');
        const pill = document.getElementById('call-mini-pill');
        const inc  = document.getElementById('call-incoming-overlay');
        if (win)  win.classList.remove('visible');
        if (pill) pill.classList.remove('visible');
        if (inc)  inc.classList.remove('visible');
        clearTimeout(S.incomingTimer);

        // Save final window pos/size
        saveWindowState();

        // Notify
        if (typeof showNotification === 'function' && duration > 2000) {
            showNotification(`通话结束 · 时长 ${formatTime(duration)}`, 'info', 3000);
        }
    }

    // ─── Incoming Call ────────────────────────────────────────────
    function showIncomingCall(type = 'video') {
        if (!S.enabled) return;
        if (S.active) return;

        const overlay = document.getElementById('call-incoming-overlay');
        const typeLabel = document.getElementById('call-inc-type-label');
        if (!overlay) return;

        applyPartnerInfo('inc');
        if (typeLabel) typeLabel.textContent = type === 'video' ? '邀请您进行视频通话' : '邀请您进行语音通话';
        overlay.classList.add('visible');

        // Ring icon animation
        const icon = document.getElementById('call-inc-accept');
        if (icon) icon.classList.add('call-ring-anim');
        setTimeout(() => { if (icon) icon.classList.remove('call-ring-anim'); }, 2000);

        // Auto dismiss after 20s
        S.incomingTimer = setTimeout(() => {
            overlay.classList.remove('visible');
        }, 20000);
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
            win.style.left   = nx + 'px';
            win.style.top    = ny + 'px';
            win.style.right  = 'auto';
            win.style.bottom = 'auto';
        };
        const onEnd = () => {
            if (!S.dragOff) return;
            S.dragOff = null;
            const rect = win.getBoundingClientRect();
            S.pos = { x: rect.left, y: rect.top };
            saveWindowState();
        };

        header.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientX, e.clientY); });
        header.addEventListener('touchstart', e => { onStart(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
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
            const dw = ex - S.resizeInit.ex;
            const dh = ey - S.resizeInit.ey;
            S.size.w = clamp(S.resizeInit.w + dw, 200, 600);
            S.size.h = clamp(S.resizeInit.h + dh, 280, 800);
            win.style.width  = S.size.w + 'px';
            win.style.height = S.size.h + 'px';
        };
        const onEnd = () => {
            if (!S.resizeInit) return;
            S.resizeInit = null;
            saveWindowState();
        };

        handle.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientX, e.clientY); });
        handle.addEventListener('touchstart', e => { onStart(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
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

    // ─── Update Enabled State ─────────────────────────────────────
    function updateCallEnabled() {
        const btn = document.getElementById('call-toolbar-btn');
        if (btn) btn.style.display = S.enabled ? 'inline-flex' : 'none';
        const simRow = document.getElementById('call-simulate-row');
        if (simRow) simRow.style.display = S.enabled ? '' : 'none';

        if (!S.enabled && S.active) endCall();
    }

    // ─── Event Binding ────────────────────────────────────────────
    function bindEvents() {
        // Incoming: reject
        document.getElementById('call-inc-reject')?.addEventListener('click', () => {
            document.getElementById('call-incoming-overlay').classList.remove('visible');
            clearTimeout(S.incomingTimer);
        });

        // Incoming: accept
        document.getElementById('call-inc-accept')?.addEventListener('click', () => {
            document.getElementById('call-incoming-overlay').classList.remove('visible');
            clearTimeout(S.incomingTimer);
            // Read the call type from overlay
            const labelEl = document.getElementById('call-inc-type-label');
            const type = labelEl && labelEl.textContent.includes('视频') ? 'video' : 'voice';
            startCall(type);
        });

        // Hang up (main)
        document.getElementById('call-hangup-btn')?.addEventListener('click', endCall);

        // Hang up (mini)
        document.getElementById('call-mini-hangup')?.addEventListener('click', (e) => {
            e.stopPropagation();
            endCall();
        });

        // Minimize
        document.getElementById('call-minimize-btn')?.addEventListener('click', minimizeWindow);

        // Restore (click pill)
        document.getElementById('call-mini-pill')?.addEventListener('click', (e) => {
            if (e.target.closest('.call-mini-hangup')) return;
            restoreWindow();
        });

        // Mute
        document.getElementById('call-mute-btn')?.addEventListener('click', () => {
            S.muted = !S.muted;
            const btn = document.getElementById('call-mute-btn');
            if (!btn) return;
            btn.classList.toggle('active', S.muted);
            btn.querySelector('i').className = S.muted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
            btn.title = S.muted ? '取消静音' : '静音';
        });

        // Camera toggle
        document.getElementById('call-cam-btn')?.addEventListener('click', () => {
            S.camOff = !S.camOff;
            const btn = document.getElementById('call-cam-btn');
            if (!btn) return;
            btn.classList.toggle('active', S.camOff);
            btn.querySelector('i').className = S.camOff ? 'fas fa-video-slash' : 'fas fa-video';
            btn.title = S.camOff ? '开启摄像头' : '关闭摄像头';
        });

        // Size presets toggle
        document.getElementById('call-size-preset-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const presets = document.getElementById('call-size-presets');
            if (presets) presets.classList.toggle('open');
        });

        // Size preset items
        document.querySelectorAll('.call-size-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                S.size.w = parseInt(btn.dataset.w);
                S.size.h = parseInt(btn.dataset.h);
                const win = document.getElementById('call-window');
                if (win) { win.style.width = S.size.w + 'px'; win.style.height = S.size.h + 'px'; }
                document.getElementById('call-size-presets')?.classList.remove('open');
                saveWindowState();
            });
        });

        // Close size menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#call-size-preset-toggle') && !e.target.closest('#call-size-presets')) {
                document.getElementById('call-size-presets')?.classList.remove('open');
            }
        });

        // BG upload button
        document.getElementById('call-bg-upload-btn')?.addEventListener('click', () => {
            document.getElementById('call-bg-file-input')?.click();
        });

        // BG file input
        document.getElementById('call-bg-file-input')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                S.bgImage = ev.target.result;
                localStorage.setItem(KEY_BG, S.bgImage);
                applyBg();
                if (typeof showNotification === 'function')
                    showNotification('通话背景已更新', 'success', 2000);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });

        // Settings: enabled toggle
        document.addEventListener('change', (e) => {
            if (e.target.id === 'call-enabled-toggle') {
                S.enabled = e.target.checked;
                localStorage.setItem(KEY_ENABLED, S.enabled ? 'true' : 'false');
                updateCallEnabled();
            }
        });

        // Settings: simulate incoming
        document.addEventListener('click', (e) => {
            if (e.target.closest('#call-simulate-incoming')) {
                const type = Math.random() > 0.5 ? 'video' : 'voice';
                // Close the modal first
                const dataModal = document.getElementById('data-modal');
                if (dataModal && typeof hideModal === 'function') hideModal(dataModal);
                setTimeout(() => showIncomingCall(type), 400);
            }
        });

        initDrag();
        initResize();
    }

    // ─── Expose Public API ────────────────────────────────────────
    window.callFeature = {
        startCall,
        endCall,
        showIncomingCall,
        restoreWindow,
        minimizeWindow,
    };

    // ─── Init ─────────────────────────────────────────────────────
    function init() {
        injectCSS();
        injectHTML();
        bindEvents();
        // Defer settings inject and toolbar button (wait for DOM)
        const tryInject = () => {
            injectSettingsToggle();
            injectToolbarButton();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInject);
        } else {
            // DOM is ready but other scripts may not have run yet
            setTimeout(tryInject, 800);
        }
    }

    init();

})();
