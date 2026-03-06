/**
 * screenshot.js - 长截屏功能
 * Long Screenshot Feature
 */

(function () {
    /* ─── Constants ─────────────────────────────────────────── */
    const MODAL_ID = 'screenshot-modal';

    /* ─── Open modal ─────────────────────────────────────────── */
    window.openScreenshotModal = function () {
        let modal = document.getElementById(MODAL_ID);
        if (!modal) {
            modal = _buildModal();
            document.body.appendChild(modal);
        }
        _populateMessageList(modal);
        _syncUI(modal);
        modal.classList.add('open');
    };

    /* ─── Build modal DOM ────────────────────────────────────── */
    function _buildModal() {
        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'screenshot-modal-overlay';
        modal.innerHTML = `
<div class="screenshot-modal-box">
    <!-- header -->
    <div class="screenshot-modal-header">
        <span class="screenshot-modal-icon"><i class="fas fa-camera"></i></span>
        <span class="screenshot-modal-title">长截屏</span>
        <button class="screenshot-close-btn" id="screenshot-close-btn" aria-label="关闭">
            <i class="fas fa-times"></i>
        </button>
    </div>

    <!-- options -->
    <div class="screenshot-section">
        <div class="screenshot-section-label">截图选项</div>
        <div class="screenshot-options-grid">
            <label class="screenshot-option-pill" id="opt-background">
                <input type="checkbox" id="sc-opt-bg" checked>
                <i class="fas fa-image"></i>
                <span>背景</span>
            </label>
            <label class="screenshot-option-pill" id="opt-bubble">
                <input type="checkbox" id="sc-opt-bubble" checked>
                <i class="fas fa-comment-alt"></i>
                <span>气泡样式</span>
            </label>
            <label class="screenshot-option-pill" id="opt-font">
                <input type="checkbox" id="sc-opt-font" checked>
                <i class="fas fa-font"></i>
                <span>字体样式</span>
            </label>
            <label class="screenshot-option-pill" id="opt-avatar">
                <input type="checkbox" id="sc-opt-avatar" checked>
                <i class="fas fa-user-circle"></i>
                <span>头像</span>
            </label>
            <label class="screenshot-option-pill" id="opt-timestamp">
                <input type="checkbox" id="sc-opt-timestamp">
                <i class="fas fa-clock"></i>
                <span>时间戳</span>
            </label>
        </div>
    </div>

    <!-- message selector -->
    <div class="screenshot-section">
        <div class="screenshot-section-label-row">
            <span class="screenshot-section-label">选择消息</span>
            <div class="screenshot-range-btns">
                <button class="screenshot-range-btn" id="sc-select-all">全选</button>
                <button class="screenshot-range-btn" id="sc-select-none">全不选</button>
                <button class="screenshot-range-btn" id="sc-select-last20">最近20条</button>
                <button class="screenshot-range-btn" id="sc-select-last50">最近50条</button>
            </div>
        </div>
        <div class="screenshot-msg-list" id="sc-msg-list">
            <!-- populated dynamically -->
        </div>
        <div class="screenshot-selected-count" id="sc-selected-count">已选 0 条</div>
    </div>

    <!-- actions -->
    <div class="screenshot-actions">
        <button class="screenshot-btn-secondary" id="screenshot-cancel-btn">取消</button>
        <button class="screenshot-btn-primary" id="screenshot-capture-btn">
            <i class="fas fa-download"></i> 生成截图
        </button>
    </div>
</div>

<!-- progress overlay (hidden) -->
<div class="screenshot-progress-overlay" id="sc-progress-overlay" style="display:none;">
    <div class="screenshot-progress-box">
        <div class="screenshot-spinner"></div>
        <div class="screenshot-progress-text" id="sc-progress-text">正在渲染...</div>
    </div>
</div>
`;
        /* Events */
        modal.querySelector('#screenshot-close-btn').addEventListener('click', () => _closeModal(modal));
        modal.querySelector('#screenshot-cancel-btn').addEventListener('click', () => _closeModal(modal));
        modal.addEventListener('click', e => { if (e.target === modal) _closeModal(modal); });

        modal.querySelector('#sc-select-all').addEventListener('click', () => _setAll(modal, true));
        modal.querySelector('#sc-select-none').addEventListener('click', () => _setAll(modal, false));
        modal.querySelector('#sc-select-last20').addEventListener('click', () => _selectLast(modal, 20));
        modal.querySelector('#sc-select-last50').addEventListener('click', () => _selectLast(modal, 50));

        modal.querySelector('#screenshot-capture-btn').addEventListener('click', () => _capture(modal));

        /* Sync pill states on checkbox change */
        modal.querySelectorAll('.screenshot-option-pill input').forEach(cb => {
            cb.addEventListener('change', () => _syncUI(modal));
        });

        return modal;
    }

    /* ─── Populate message list ──────────────────────────────── */
    function _populateMessageList(modal) {
        const list = modal.querySelector('#sc-msg-list');
        list.innerHTML = '';
        const msgs = (typeof messages !== 'undefined' ? messages : []);
        if (!msgs.length) {
            list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">暂无消息</div>';
            return;
        }
        msgs.forEach((msg, idx) => {
            const item = document.createElement('label');
            item.className = 'sc-msg-item';
            item.dataset.idx = idx;
            const isSent = msg.sender === 'user';
            const senderName = isSent
                ? (typeof settings !== 'undefined' ? settings.myName || '我' : '我')
                : (typeof settings !== 'undefined' ? settings.partnerName || '对方' : '对方');
            const preview = _msgPreview(msg);
            const timeStr = msg.timestamp ? _formatTime(msg.timestamp) : '';
            item.innerHTML = `
<input type="checkbox" class="sc-msg-check" data-idx="${idx}" checked>
<div class="sc-msg-info">
    <span class="sc-msg-sender ${isSent ? 'sent' : 'received'}">${_esc(senderName)}</span>
    <span class="sc-msg-preview">${_esc(preview)}</span>
</div>
<span class="sc-msg-time">${timeStr}</span>
`;
            item.querySelector('.sc-msg-check').addEventListener('change', () => _updateCount(modal));
            list.appendChild(item);
        });
        _updateCount(modal);
    }

    function _msgPreview(msg) {
        if (msg.type === 'image') return '[图片]';
        if (msg.type === 'sticker') return '[表情]';
        if (msg.type === 'poke') return '[戳一戳] ' + (msg.content || '');
        return (msg.content || '').slice(0, 40);
    }

    function _formatTime(ts) {
        try {
            const d = new Date(ts);
            const pad = n => String(n).padStart(2, '0');
            return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch { return ''; }
    }

    function _esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    /* ─── UI helpers ─────────────────────────────────────────── */
    function _syncUI(modal) {
        modal.querySelectorAll('.screenshot-option-pill').forEach(pill => {
            const cb = pill.querySelector('input[type=checkbox]');
            pill.classList.toggle('active', cb && cb.checked);
        });
    }

    function _updateCount(modal) {
        const checked = modal.querySelectorAll('.sc-msg-check:checked').length;
        modal.querySelector('#sc-selected-count').textContent = `已选 ${checked} 条`;
    }

    function _setAll(modal, checked) {
        modal.querySelectorAll('.sc-msg-check').forEach(cb => { cb.checked = checked; });
        _updateCount(modal);
    }

    function _selectLast(modal, n) {
        const all = Array.from(modal.querySelectorAll('.sc-msg-check'));
        all.forEach(cb => { cb.checked = false; });
        all.slice(-n).forEach(cb => { cb.checked = true; });
        _updateCount(modal);
    }

    function _closeModal(modal) {
        modal.classList.remove('open');
    }

    /* ─── Capture ────────────────────────────────────────────── */
    async function _capture(modal) {
        const checked = Array.from(modal.querySelectorAll('.sc-msg-check:checked'));
        if (!checked.length) {
            if (typeof showNotification === 'function') showNotification('请至少选择一条消息', 'warning');
            return;
        }
        const selectedIdxs = checked.map(cb => parseInt(cb.dataset.idx));
        const opts = {
            bg: modal.querySelector('#sc-opt-bg').checked,
            bubble: modal.querySelector('#sc-opt-bubble').checked,
            font: modal.querySelector('#sc-opt-font').checked,
            avatar: modal.querySelector('#sc-opt-avatar').checked,
            timestamp: modal.querySelector('#sc-opt-timestamp').checked,
        };

        /* Show progress */
        const progress = modal.querySelector('#sc-progress-overlay');
        const progressText = modal.querySelector('#sc-progress-text');
        progress.style.display = 'flex';
        progressText.textContent = '正在构建聊天画面...';

        await _nextFrame();

        try {
            const canvas = await _renderToCanvas(selectedIdxs, opts, progressText);
            progressText.textContent = '正在生成图片...';
            await _nextFrame();
            _downloadCanvas(canvas);
            progress.style.display = 'none';
            _closeModal(modal);
            if (typeof showNotification === 'function') showNotification('截图已保存 ✦', 'success');
        } catch (err) {
            progress.style.display = 'none';
            console.error('[screenshot] 截图失败:', err);
            if (typeof showNotification === 'function') showNotification('截图生成失败，请重试', 'error');
        }
    }

    function _nextFrame() {
        return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    }

    /* ─── Render to canvas ───────────────────────────────────── */
    async function _renderToCanvas(idxs, opts, progressText) {
        /* If html2canvas is available, use clone-DOM approach */
        if (typeof html2canvas === 'function') {
            return _renderWithHtml2Canvas(idxs, opts, progressText);
        }
        /* Fallback: pure canvas drawing */
        return _renderFallback(idxs, opts);
    }

    /* ── html2canvas path ── */
    async function _renderWithHtml2Canvas(idxs, opts, progressText) {
        /* Build an off-screen chat container clone */
        const container = document.getElementById('chat-container');
        if (!container) throw new Error('chat-container not found');

        progressText.textContent = '正在克隆聊天区域...';
        await _nextFrame();

        /* Collect wrapper elements that match selected indices */
        const msgs = typeof messages !== 'undefined' ? messages : [];
        const selectedIds = new Set(idxs.map(i => msgs[i] && msgs[i].id).filter(Boolean));

        /* Create wrapper clone */
        const clone = document.createElement('div');
        clone.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: ${Math.min(container.offsetWidth, 480)}px;
            min-height: 100px;
            padding: 16px 12px;
            box-sizing: border-box;
            overflow: visible;
        `;

        /* Apply background */
        if (opts.bg) {
            const bgStyle = window.getComputedStyle(container).backgroundImage;
            const bgColor = window.getComputedStyle(container).backgroundColor;
            clone.style.backgroundImage = bgStyle;
            clone.style.backgroundColor = bgColor;
            clone.style.backgroundSize = window.getComputedStyle(container).backgroundSize;
            clone.style.backgroundPosition = window.getComputedStyle(container).backgroundPosition;
        } else {
            clone.style.backgroundColor = '#ffffff';
        }

        /* Copy font if needed */
        if (opts.font) {
            clone.style.fontFamily = window.getComputedStyle(document.body).fontFamily;
        }

        /* Copy message wrappers */
        const wrappers = container.querySelectorAll('.message-wrapper');
        wrappers.forEach(wr => {
            const msgId = wr.dataset.msgId || wr.dataset.id;
            if (!selectedIds.has(msgId)) return;

            const clonedWr = wr.cloneNode(true);

            /* Strip avatar if not wanted */
            if (!opts.avatar) {
                clonedWr.querySelectorAll('.message-avatar').forEach(a => { a.style.display = 'none'; });
            }

            /* Strip timestamp unless wanted */
            if (!opts.timestamp) {
                clonedWr.querySelectorAll('.message-time, .msg-time, .timestamp').forEach(t => { t.style.display = 'none'; });
            }

            /* Remove bubble custom styles if not wanted */
            if (!opts.bubble) {
                clonedWr.querySelectorAll('.message, .message-sent, .message-received').forEach(b => {
                    b.style.borderRadius = '';
                    b.style.boxShadow = '';
                });
            }

            clone.appendChild(clonedWr);
        });

        document.body.appendChild(clone);
        progressText.textContent = '正在渲染截图...';
        await _nextFrame();

        let canvas;
        try {
            canvas = await html2canvas(clone, {
                allowTaint: true,
                useCORS: true,
                logging: false,
                backgroundColor: null,
                scale: window.devicePixelRatio || 2,
            });
        } finally {
            document.body.removeChild(clone);
        }
        return canvas;
    }

    /* ── Fallback: manual canvas drawing ── */
    async function _renderFallback(idxs, opts) {
        const msgs = typeof messages !== 'undefined' ? messages : [];
        const selected = idxs.map(i => msgs[i]).filter(Boolean);

        const PADDING = 16;
        const BUBBLE_MAX_W = 260;
        const FONT_SIZE = 14;
        const LINE_H = 22;
        const AVATAR_SIZE = 36;
        const AVATAR_GAP = 10;
        const ROW_GAP = 12;

        /* Measure total height */
        const rowHeights = selected.map(msg => {
            if (msg.type === 'image') return AVATAR_SIZE + ROW_GAP + 20;
            const text = msg.content || '';
            const lines = Math.max(1, Math.ceil((text.length * FONT_SIZE * 0.6) / BUBBLE_MAX_W));
            return Math.max(AVATAR_SIZE, lines * LINE_H + 20) + ROW_GAP;
        });

        const totalH = rowHeights.reduce((a, b) => a + b, 0) + PADDING * 2;
        const W = Math.min(window.innerWidth, 480);
        const SCALE = window.devicePixelRatio || 2;

        const canvas = document.createElement('canvas');
        canvas.width = W * SCALE;
        canvas.height = totalH * SCALE;
        const ctx = canvas.getContext('2d');
        ctx.scale(SCALE, SCALE);

        /* Background */
        if (opts.bg) {
            const chatBg = document.getElementById('chat-container');
            const bgColor = chatBg ? window.getComputedStyle(chatBg).backgroundColor : '#f5f5f5';
            ctx.fillStyle = bgColor || '#f5f5f5';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(0, 0, W, totalH);

        /* Draw messages */
        if (opts.font) {
            const bodyFont = window.getComputedStyle(document.body).fontFamily;
            ctx.font = `${FONT_SIZE}px ${bodyFont}`;
        } else {
            ctx.font = `${FONT_SIZE}px sans-serif`;
        }

        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#7b68ee';
        const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1a1a2e';

        let y = PADDING;

        for (let i = 0; i < selected.length; i++) {
            const msg = selected[i];
            const isSent = msg.sender === 'user';
            const rowH = rowHeights[i];

            if (isSent) {
                /* Sent bubble — right aligned */
                const bubbleX = W - PADDING - (opts.avatar ? AVATAR_SIZE + AVATAR_GAP : 0);
                const text = msg.type === 'image' ? '[图片]' : (msg.content || '');
                const lines = _wrapText(ctx, text, BUBBLE_MAX_W - 24);
                const bH = lines.length * LINE_H + 16;
                const bW = Math.min(BUBBLE_MAX_W, Math.max(...lines.map(l => ctx.measureText(l).width + 24), 60));

                /* Bubble */
                if (opts.bubble) {
                    _roundRect(ctx, bubbleX - bW, y, bW, bH, 14, accentColor);
                } else {
                    _roundRect(ctx, bubbleX - bW, y, bW, bH, 6, accentColor);
                }

                /* Text */
                ctx.fillStyle = '#ffffff';
                lines.forEach((line, li) => {
                    ctx.fillText(line, bubbleX - bW + 12, y + 12 + li * LINE_H + FONT_SIZE);
                });

                /* Avatar */
                if (opts.avatar) {
                    _drawAvatarCircle(ctx, W - PADDING - AVATAR_SIZE, y, AVATAR_SIZE, accentColor, '我');
                }

                /* Timestamp */
                if (opts.timestamp && msg.timestamp) {
                    ctx.fillStyle = textPrimary + '80';
                    ctx.font = `10px sans-serif`;
                    const ts = _formatTime(msg.timestamp);
                    const tsW = ctx.measureText(ts).width;
                    ctx.fillText(ts, bubbleX - bW - tsW - 4, y + bH - 6);
                    if (opts.font) {
                        const bodyFont = window.getComputedStyle(document.body).fontFamily;
                        ctx.font = `${FONT_SIZE}px ${bodyFont}`;
                    } else {
                        ctx.font = `${FONT_SIZE}px sans-serif`;
                    }
                }

            } else {
                /* Received bubble — left aligned */
                const bubbleX = PADDING + (opts.avatar ? AVATAR_SIZE + AVATAR_GAP : 0);
                const text = msg.type === 'image' ? '[图片]' : (msg.content || '');
                const lines = _wrapText(ctx, text, BUBBLE_MAX_W - 24);
                const bH = lines.length * LINE_H + 16;
                const bW = Math.min(BUBBLE_MAX_W, Math.max(...lines.map(l => ctx.measureText(l).width + 24), 60));
                const receivedBg = getComputedStyle(document.documentElement).getPropertyValue('--bubble-received').trim() || '#f0f0f0';

                if (opts.bubble) {
                    _roundRect(ctx, bubbleX, y, bW, bH, 14, receivedBg || '#e8e8e8');
                } else {
                    _roundRect(ctx, bubbleX, y, bW, bH, 6, receivedBg || '#e8e8e8');
                }

                ctx.fillStyle = textPrimary || '#1a1a2e';
                lines.forEach((line, li) => {
                    ctx.fillText(line, bubbleX + 12, y + 12 + li * LINE_H + FONT_SIZE);
                });

                if (opts.avatar) {
                    const partnerColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim() || '#a78bfa';
                    _drawAvatarCircle(ctx, PADDING, y, AVATAR_SIZE, partnerColor, '对');
                }

                if (opts.timestamp && msg.timestamp) {
                    ctx.fillStyle = textPrimary + '80';
                    ctx.font = `10px sans-serif`;
                    ctx.fillText(_formatTime(msg.timestamp), bubbleX + bW + 4, y + bH - 6);
                    if (opts.font) {
                        const bodyFont = window.getComputedStyle(document.body).fontFamily;
                        ctx.font = `${FONT_SIZE}px ${bodyFont}`;
                    } else {
                        ctx.font = `${FONT_SIZE}px sans-serif`;
                    }
                }
            }

            y += rowH;
        }

        return canvas;
    }

    function _wrapText(ctx, text, maxW) {
        if (!text) return [''];
        const words = Array.from(text);
        const lines = [];
        let cur = '';
        for (const ch of words) {
            if (ch === '\n') { lines.push(cur); cur = ''; continue; }
            const test = cur + ch;
            if (ctx.measureText(test).width > maxW && cur) {
                lines.push(cur);
                cur = ch;
            } else {
                cur = test;
            }
        }
        if (cur) lines.push(cur);
        return lines.length ? lines : [''];
    }

    function _roundRect(ctx, x, y, w, h, r, color) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function _drawAvatarCircle(ctx, x, y, size, color, initial) {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${size * 0.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, x + size / 2, y + size / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    /* ─── Download ───────────────────────────────────────────── */
    function _downloadCanvas(canvas) {
        const date = new Date();
        const pad = n => String(n).padStart(2, '0');
        const filename = `聊天截图_${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}.png`;

        if (navigator.share && navigator.canShare) {
            canvas.toBlob(blob => {
                if (!blob) { _canvasDownloadFallback(canvas, filename); return; }
                const file = new File([blob], filename, { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    navigator.share({ files: [file], title: '聊天截图' })
                        .catch(() => _canvasDownloadFallback(canvas, filename));
                } else {
                    _canvasDownloadFallback(canvas, filename);
                }
            }, 'image/png');
        } else {
            _canvasDownloadFallback(canvas, filename);
        }
    }

    function _canvasDownloadFallback(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /* ─── Inject CSS ─────────────────────────────────────────── */
    const STYLE = `
/* ══════════════════════════════════════════════
   Screenshot Modal
══════════════════════════════════════════════ */
.screenshot-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 9200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.28s ease;
}
.screenshot-modal-overlay.open {
    opacity: 1;
    pointer-events: all;
}
.screenshot-modal-box {
    background: var(--secondary-bg, #fff);
    border-radius: 24px 24px 0 0;
    width: 100%;
    max-width: 520px;
    max-height: 88vh;
    overflow-y: auto;
    padding: 0 0 max(20px, env(safe-area-inset-bottom,0px));
    transform: translateY(40px);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
    position: relative;
}
.screenshot-modal-overlay.open .screenshot-modal-box {
    transform: translateY(0);
}
.screenshot-modal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 20px 14px;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    position: sticky;
    top: 0;
    background: var(--secondary-bg, #fff);
    z-index: 10;
    border-radius: 24px 24px 0 0;
}
.screenshot-modal-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--accent-color, #7b68ee), var(--accent-secondary, #a78bfa));
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 14px; flex-shrink: 0;
}
.screenshot-modal-title {
    font-size: 15px; font-weight: 700;
    color: var(--text-primary, #1a1a2e);
    flex: 1;
}
.screenshot-close-btn {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--primary-bg, #f5f5f5);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary, #888);
    font-size: 13px;
    transition: background 0.15s;
}
.screenshot-close-btn:hover { background: var(--border-color, #e5e7eb); }

/* Sections */
.screenshot-section {
    padding: 16px 20px 0;
}
.screenshot-section-label {
    font-size: 11px; font-weight: 700;
    color: var(--text-secondary, #888);
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 10px;
}
.screenshot-section-label-row {
    display: flex; align-items: center;
    justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
    margin-bottom: 10px;
}
.screenshot-range-btns {
    display: flex; gap: 6px; flex-wrap: wrap;
}
.screenshot-range-btn {
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid var(--border-color, #e5e7eb);
    background: var(--primary-bg, #f5f5f5);
    color: var(--text-secondary, #888);
    font-size: 11px; cursor: pointer;
    transition: all 0.15s;
}
.screenshot-range-btn:hover {
    border-color: var(--accent-color, #7b68ee);
    color: var(--accent-color, #7b68ee);
}

/* Options grid */
.screenshot-options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 8px;
    margin-bottom: 4px;
}
.screenshot-option-pill {
    display: flex; flex-direction: column;
    align-items: center; gap: 6px;
    padding: 12px 8px 10px;
    border-radius: 14px;
    border: 1.5px solid var(--border-color, #e5e7eb);
    background: var(--primary-bg, #f9f9f9);
    cursor: pointer;
    transition: all 0.18s;
    font-size: 12px; color: var(--text-secondary, #888);
    user-select: none;
}
.screenshot-option-pill input { display: none; }
.screenshot-option-pill i { font-size: 16px; }
.screenshot-option-pill.active {
    border-color: var(--accent-color, #7b68ee);
    background: color-mix(in srgb, var(--accent-color,#7b68ee) 10%, transparent);
    color: var(--accent-color, #7b68ee);
}

/* Message list */
.screenshot-msg-list {
    max-height: 36vh;
    overflow-y: auto;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 14px;
    background: var(--primary-bg, #f9f9f9);
}
.sc-msg-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    transition: background 0.12s;
}
.sc-msg-item:last-child { border-bottom: none; }
.sc-msg-item:hover { background: color-mix(in srgb, var(--accent-color,#7b68ee) 5%, transparent); }
.sc-msg-check {
    width: 16px; height: 16px;
    accent-color: var(--accent-color, #7b68ee);
    flex-shrink: 0; cursor: pointer;
}
.sc-msg-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
}
.sc-msg-sender {
    font-size: 11px; font-weight: 600;
}
.sc-msg-sender.sent { color: var(--accent-color, #7b68ee); }
.sc-msg-sender.received { color: var(--text-secondary, #888); }
.sc-msg-preview {
    font-size: 12px; color: var(--text-secondary, #888);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sc-msg-time {
    font-size: 10px; color: var(--text-secondary, #aaa);
    flex-shrink: 0; white-space: nowrap;
}
.screenshot-selected-count {
    font-size: 11px; color: var(--text-secondary, #888);
    text-align: right; margin-top: 6px; padding-right: 2px;
}

/* Actions */
.screenshot-actions {
    display: flex; gap: 10px;
    padding: 16px 20px 0;
}
.screenshot-btn-secondary {
    flex: 1; padding: 12px;
    border-radius: 12px;
    border: 1.5px solid var(--border-color, #e5e7eb);
    background: var(--primary-bg, #f5f5f5);
    color: var(--text-secondary, #888);
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
}
.screenshot-btn-secondary:hover { border-color: var(--accent-color, #7b68ee); }
.screenshot-btn-primary {
    flex: 2; padding: 12px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--accent-color, #7b68ee), var(--accent-secondary, #a78bfa));
    color: #fff;
    font-size: 14px; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
}
.screenshot-btn-primary:active { opacity: 0.82; }

/* Progress overlay */
.screenshot-progress-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.45);
    border-radius: 24px 24px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
}
.screenshot-progress-box {
    background: var(--secondary-bg, #fff);
    border-radius: 16px;
    padding: 28px 36px;
    display: flex; flex-direction: column;
    align-items: center; gap: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.screenshot-spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--border-color, #e5e7eb);
    border-top-color: var(--accent-color, #7b68ee);
    border-radius: 50%;
    animation: sc-spin 0.8s linear infinite;
}
@keyframes sc-spin { to { transform: rotate(360deg); } }
.screenshot-progress-text {
    font-size: 13px; color: var(--text-secondary, #888);
    font-weight: 500;
}
`;

    const styleTag = document.createElement('style');
    styleTag.id = 'screenshot-styles';
    styleTag.textContent = STYLE;
    document.head.appendChild(styleTag);

})();
