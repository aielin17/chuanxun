/**
 * screenshot.js - 长截屏功能（重构版）
 * 支持消息预览选取 + 导出长图
 */

(function () {
    'use strict';

    // ── 动态加载 html2canvas ────────────────────────────────────────────────
    function _loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') { resolve(); return; }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload  = resolve;
            script.onerror = () => reject(new Error('html2canvas 加载失败'));
            document.head.appendChild(script);
        });
    }

    // ── 注入弹窗 HTML（只注入一次）──────────────────────────────────────────
    function _injectModalIfNeeded() {
        if (document.getElementById('screenshot-select-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'screenshot-select-modal';
        modal.style.cssText = [
            'display:none',
            'position:fixed',
            'inset:0',
            'z-index:99999',
            'background:rgba(0,0,0,0.65)',
            'backdrop-filter:blur(6px)',
            'align-items:center',
            'justify-content:center'
        ].join(';');

        modal.innerHTML = `
<div style="background:var(--secondary-bg,#1a1a2e);border:1px solid var(--border-color,rgba(255,255,255,0.1));border-radius:18px;padding:0;width:min(520px,94vw);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,0.5);overflow:hidden;">
  <div style="padding:16px 20px 14px;border-bottom:1px solid var(--border-color,rgba(255,255,255,0.08));display:flex;align-items:center;gap:10px;flex-shrink:0;">
    <i class="fas fa-camera" style="color:var(--accent-color,#a78bfa);font-size:15px;"></i>
    <span style="font-weight:700;font-size:15px;flex:1;">长截屏 · 选取消息</span>
    <span id="ss-sel-count" style="font-size:12px;color:var(--text-secondary,#888);"></span>
    <button id="ss-modal-close" style="background:none;border:none;cursor:pointer;padding:4px 6px;color:var(--text-secondary,#888);font-size:16px;line-height:1;border-radius:6px;">✕</button>
  </div>
  <div style="padding:10px 16px;border-bottom:1px solid var(--border-color,rgba(255,255,255,0.06));display:flex;gap:8px;flex-wrap:wrap;align-items:center;flex-shrink:0;">
    <button id="ss-select-all" style="padding:5px 12px;border-radius:20px;border:1px solid var(--border-color,rgba(255,255,255,0.15));background:transparent;color:var(--text-primary,#eee);font-size:12px;cursor:pointer;">全选</button>
    <button id="ss-select-none" style="padding:5px 12px;border-radius:20px;border:1px solid var(--border-color,rgba(255,255,255,0.15));background:transparent;color:var(--text-primary,#eee);font-size:12px;cursor:pointer;">清空</button>
    <span style="font-size:11.5px;color:var(--text-secondary,#888);margin-left:4px;">点击消息行以切换选中</span>
  </div>
  <div id="ss-msg-list" style="flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:4px;"></div>
  <div style="padding:14px 20px;border-top:1px solid var(--border-color,rgba(255,255,255,0.08));display:flex;gap:10px;justify-content:flex-end;flex-shrink:0;">
    <button id="ss-cancel-btn" style="padding:8px 20px;border-radius:10px;border:1px solid var(--border-color,rgba(255,255,255,0.15));background:transparent;color:var(--text-primary,#eee);font-size:13px;cursor:pointer;">取消</button>
    <button id="ss-export-btn" style="padding:8px 22px;border-radius:10px;border:none;background:var(--accent-color,#a78bfa);color:#fff;font-size:13px;cursor:pointer;font-weight:600;"><i class="fas fa-download" style="margin-right:6px;"></i>导出截图</button>
  </div>
</div>`;
        document.body.appendChild(modal);
    }

    // ── 获取消息数据 ──────────────────────────────────────────────────────────
    function _getMessages() {
        if (typeof messages !== 'undefined' && Array.isArray(messages) && messages.length) {
            return messages;
        }
        const items = [];
        document.querySelectorAll('#chat-container .message-item, #chat-container [data-msg-id]').forEach((el, idx) => {
            const id   = el.dataset.msgId || el.dataset.id || String(idx);
            const isMy = el.classList.contains('sent') || el.classList.contains('my-message');
            const textEl = el.querySelector('.message-text, .msg-text, .bubble-text, .text');
            const text = textEl ? textEl.textContent.trim() : el.textContent.trim().slice(0, 80);
            if (text) items.push({ id, sender: isMy ? 'me' : 'partner', text });
        });
        return items;
    }

    // ── 已选 id 集合 ──────────────────────────────────────────────────────────
    let _selectedIds = new Set();

    function _updateSelCount(total) {
        const el = document.getElementById('ss-sel-count');
        if (el) el.textContent = '已选 ' + _selectedIds.size + ' / ' + total + ' 条';
    }

    // ── 构建预览列表 ──────────────────────────────────────────────────────────
    function _buildPreviewList(msgs) {
        const list = document.getElementById('ss-msg-list');
        if (!list) return;
        list.innerHTML = '';

        if (!msgs.length) {
            list.innerHTML = '<div style="text-align:center;color:var(--text-secondary,#888);padding:32px 0;font-size:13px;">暂无消息记录</div>';
            return;
        }

        const myName      = (typeof settings !== 'undefined' && settings.myName)      ? settings.myName      : '我';
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '对方';

        msgs.forEach((msg, idx) => {
            const isMy = msg.sender === 'me' || msg.isMy || msg.type === 'sent';
            const id   = msg.id || String(idx);
            const sel  = _selectedIds.has(id);

            let contentText = msg.text || msg.content || '';
            if (typeof contentText !== 'string') contentText = '[图片]';
            if (!contentText && (msg.image || msg.imageUrl)) contentText = '[图片]';
            if (!contentText) contentText = '[消息]';

            let timeStr = '';
            if (msg.timestamp) {
                const d = new Date(msg.timestamp);
                timeStr = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
            }

            const senderName = isMy ? myName : partnerName;
            const displayText = contentText.length > 120 ? contentText.slice(0, 120) + '…' : contentText;

            const row = document.createElement('div');
            row.dataset.ssId  = id;
            row.dataset.ssIdx = idx;
            row.style.cssText = [
                'display:flex',
                'align-items:flex-start',
                'gap:8px',
                'padding:7px 10px',
                'border-radius:10px',
                'cursor:pointer',
                'transition:background 0.15s',
                'flex-direction:' + (isMy ? 'row-reverse' : 'row'),
                'background:' + (sel ? 'rgba(var(--accent-color-rgb,167,139,250),0.15)' : 'transparent'),
                'border:1px solid ' + (sel ? 'rgba(var(--accent-color-rgb,167,139,250),0.4)' : 'transparent')
            ].join(';');

            row.innerHTML = `
<div class="ss-check" style="width:18px;height:18px;border-radius:50%;border:2px solid var(--border-color,rgba(255,255,255,0.2));flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;background:${sel ? 'var(--accent-color,#a78bfa)' : 'transparent'};transition:all 0.15s;color:#fff;font-size:10px;">${sel ? '✓' : ''}</div>
<div style="max-width:70%;padding:6px 10px;border-radius:10px;background:${isMy ? 'rgba(var(--accent-color-rgb,167,139,250),0.25)' : 'var(--primary-bg,rgba(255,255,255,0.06))'};font-size:12.5px;color:var(--text-primary,#eee);line-height:1.5;word-break:break-word;">
  <div style="font-size:10.5px;color:var(--text-secondary,#888);margin-bottom:2px;">${senderName}${timeStr ? '  ' + timeStr : ''}</div>
  <div>${displayText}</div>
</div>`;

            row.addEventListener('click', () => {
                if (_selectedIds.has(id)) { _selectedIds.delete(id); }
                else { _selectedIds.add(id); }
                const nowSel = _selectedIds.has(id);
                row.style.background = nowSel ? 'rgba(var(--accent-color-rgb,167,139,250),0.15)' : 'transparent';
                row.style.borderColor = nowSel ? 'rgba(var(--accent-color-rgb,167,139,250),0.4)' : 'transparent';
                const chk = row.querySelector('.ss-check');
                if (chk) {
                    chk.style.background = nowSel ? 'var(--accent-color,#a78bfa)' : 'transparent';
                    chk.textContent = nowSel ? '✓' : '';
                }
                _updateSelCount(msgs.length);
            });

            list.appendChild(row);
        });

        _updateSelCount(msgs.length);
    }

    // ── 打开弹窗 ──────────────────────────────────────────────────────────────
    window.openScreenshotModal = function () {
        _injectModalIfNeeded();
        const modal = document.getElementById('screenshot-select-modal');
        if (!modal) return;

        const msgs = _getMessages();
        _selectedIds = new Set(msgs.map((m, i) => m.id || String(i)));
        _buildPreviewList(msgs);

        modal.style.display = 'flex';

        if (!modal._ssBindDone) {
            modal._ssBindDone = true;

            const closeModal = () => { modal.style.display = 'none'; };

            document.getElementById('ss-modal-close').addEventListener('click', closeModal);
            document.getElementById('ss-cancel-btn').addEventListener('click', closeModal);
            modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

            document.getElementById('ss-select-all').addEventListener('click', () => {
                const m = _getMessages();
                _selectedIds = new Set(m.map((msg, i) => msg.id || String(i)));
                _buildPreviewList(m);
            });

            document.getElementById('ss-select-none').addEventListener('click', () => {
                _selectedIds.clear();
                _buildPreviewList(_getMessages());
            });

            document.getElementById('ss-export-btn').addEventListener('click', async () => {
                if (_selectedIds.size === 0) {
                    if (typeof showNotification === 'function') showNotification('请先选择要截图的消息', 'warning');
                    return;
                }
                closeModal();
                await _doScreenshot();
            });
        }
    };

    // ── 执行截图 ─────────────────────────────────────────────────────────────
    window._takeChatScreenshot = function () { window.openScreenshotModal(); };

    async function _doScreenshot() {
        if (typeof html2canvas === 'undefined') {
            if (typeof showNotification === 'function') showNotification('正在加载截图引擎，请稍候…', 'info', 2500);
            try { await _loadHtml2Canvas(); }
            catch (e) {
                if (typeof showNotification === 'function') showNotification('截图引擎加载失败，请检查网络', 'error');
                return;
            }
        }

        const container = document.getElementById('chat-container');
        if (!container) {
            if (typeof showNotification === 'function') showNotification('找不到聊天区域', 'error');
            return;
        }

        if (typeof showNotification === 'function') showNotification('正在生成截图，请稍候…', 'info', 10000);

        // 隐藏未选中的消息
        const allMsgEls = Array.from(container.querySelectorAll('.message-item, [data-msg-id]'));
        const hiddenEls = [];
        allMsgEls.forEach((el, idx) => {
            const id = el.dataset.msgId || el.dataset.id || String(idx);
            if (!_selectedIds.has(id)) {
                hiddenEls.push({ el, val: el.style.display });
                el.style.display = 'none';
            }
        });

        const saved = {
            overflow:  container.style.overflow,
            height:    container.style.height,
            maxHeight: container.style.maxHeight
        };
        container.style.overflow  = 'visible';
        container.style.height    = 'auto';
        container.style.maxHeight = 'none';

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        try {
            const bg = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg').trim() || '#ffffff';
            const canvas = await html2canvas(container, {
                backgroundColor: bg,
                scale: Math.min(window.devicePixelRatio || 2, 3),
                useCORS: true,
                allowTaint: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                width:  container.scrollWidth,
                height: container.scrollHeight,
                windowWidth:  container.scrollWidth,
                windowHeight: container.scrollHeight,
                ignoreElements: el =>
                    el.id === 'typing-indicator' ||
                    el.classList.contains('empty-state') ||
                    el.classList.contains('notification'),
            });

            const now = new Date();
            const pad = n => String(n).padStart(2, '0');
            const filename = '聊天截图_' + now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes()) + '.png';

            canvas.toBlob(blob => {
                if (!blob) { if (typeof showNotification === 'function') showNotification('截图生成失败，请重试', 'error'); return; }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 5000);
                if (typeof showNotification === 'function') showNotification('截图已保存 ✦', 'success', 3000);
            }, 'image/png');

        } catch (err) {
            console.error('[screenshot]', err);
            if (typeof showNotification === 'function') showNotification('截图失败：' + (err.message || '未知错误'), 'error');
        } finally {
            container.style.overflow  = saved.overflow;
            container.style.height    = saved.height;
            container.style.maxHeight = saved.maxHeight;
            hiddenEls.forEach(({ el, val }) => { el.style.display = val; });
        }
    }

    // ── 同步 cs-panel 里工具栏收纳开关 ──────────────────────────────────────
    document.addEventListener('click', function (e) {
        if (e.target.closest('.cs-tab[data-panel="cs-panel-display"]')) _syncToolbarCompactSwitch();
    });

    function _syncToolbarCompactSwitch() {
        const sw = document.getElementById('toolbar-compact-switch-cs');
        if (sw) sw.classList.toggle('active', typeof settings !== 'undefined' && !!settings.toolbarCompact);
    }

    function _patchShowModal() {
        const orig = window.showModal;
        if (typeof orig !== 'function') return false;
        window.showModal = function (el) {
            orig.apply(this, arguments);
            if (el && el.id === 'chat-modal') setTimeout(_syncToolbarCompactSwitch, 100);
        };
        return true;
    }
    if (!_patchShowModal()) window.addEventListener('load', _patchShowModal);

    let _uiPatched = false;
    const _uiPoll = setInterval(() => {
        if (_uiPatched) { clearInterval(_uiPoll); return; }
        if (typeof window._updateToolbarCompactUI === 'function') {
            const orig = window._updateToolbarCompactUI;
            window._updateToolbarCompactUI = function () { orig.apply(this, arguments); _syncToolbarCompactSwitch(); };
            _uiPatched = true;
            clearInterval(_uiPoll);
        }
    }, 500);

})();
