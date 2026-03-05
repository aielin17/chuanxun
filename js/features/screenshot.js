/**
 * screenshot.js - 长截屏功能
 * 将聊天记录渲染为长图并保存
 */

(function () {
    'use strict';

    // ── 主入口 ──────────────────────────────────────────────────────────────
    window._takeChatScreenshot = async function () {
        const btn = document.getElementById('cs-screenshot-btn');

        // 需要 html2canvas
        if (typeof html2canvas === 'undefined') {
            if (typeof showNotification === 'function') {
                showNotification('正在加载截图引擎，请稍候…', 'info', 2500);
            }
            await _loadHtml2Canvas();
        }

        const container = document.getElementById('chat-container');
        if (!container) {
            if (typeof showNotification === 'function') showNotification('找不到聊天区域', 'error');
            return;
        }

        // 显示进度
        if (typeof showNotification === 'function') showNotification('正在生成截图，请稍候…', 'info', 8000);
        if (btn) btn.style.opacity = '0.5';

        try {
            // 临时展开全部消息
            const originalOverflow = container.style.overflow;
            const originalHeight   = container.style.height;
            const originalMaxH     = container.style.maxHeight;

            container.style.overflow  = 'visible';
            container.style.height    = 'auto';
            container.style.maxHeight = 'none';

            // 等一帧让布局稳定
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            const canvas = await html2canvas(container, {
                backgroundColor: getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary-bg').trim() || '#ffffff',
                scale: window.devicePixelRatio || 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                width: container.scrollWidth,
                height: container.scrollHeight,
                windowWidth: container.scrollWidth,
                windowHeight: container.scrollHeight,
            });

            // 恢复样式
            container.style.overflow  = originalOverflow;
            container.style.height    = originalHeight;
            container.style.maxHeight = originalMaxH;

            // 生成文件名
            const now = new Date();
            const pad = n => String(n).padStart(2, '0');
            const filename = `聊天截图_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.png`;

            // 下载
            canvas.toBlob(blob => {
                if (!blob) {
                    if (typeof showNotification === 'function') showNotification('截图生成失败', 'error');
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a   = document.createElement('a');
                a.href     = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 3000);

                if (typeof showNotification === 'function') showNotification('截图已保存 ✦', 'success', 3000);
            }, 'image/png');

        } catch (err) {
            console.error('[screenshot]', err);
            if (typeof showNotification === 'function') showNotification('截图失败，请重试', 'error');
        } finally {
            if (btn) btn.style.opacity = '';
        }
    };

    // ── 动态加载 html2canvas ─────────────────────────────────────────────────
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

    // ── 同步 cs-panel-display 里收纳按钮的开关状态 ──────────────────────────
    // 在聊天设置「显示」面板打开时同步一次
    document.addEventListener('click', function (e) {
        const tab = e.target.closest('.cs-tab[data-panel="cs-panel-display"]');
        if (!tab) return;
        _syncToolbarCompactSwitch();
    });

    function _syncToolbarCompactSwitch() {
        const sw = document.getElementById('toolbar-compact-switch-cs');
        if (!sw) return;
        const on = typeof settings !== 'undefined' && !!settings.toolbarCompact;
        sw.classList.toggle('active', on);
    }

    // 每次聊天设置模态框打开时也同步
    const _origShowModal = window.showModal;
    if (typeof _origShowModal === 'function') {
        window.showModal = function (el) {
            _origShowModal.apply(this, arguments);
            if (el && el.id === 'chat-modal') {
                setTimeout(_syncToolbarCompactSwitch, 100);
            }
        };
    } else {
        // showModal 可能还未定义，延迟 patch
        window.addEventListener('load', function () {
            const orig = window.showModal;
            if (typeof orig === 'function') {
                window.showModal = function (el) {
                    orig.apply(this, arguments);
                    if (el && el.id === 'chat-modal') {
                        setTimeout(_syncToolbarCompactSwitch, 100);
                    }
                };
            }
        });
    }

    // 也让 _updateToolbarCompactUI 调用后同步 cs 面板里的开关
    const _origUpdate = window._updateToolbarCompactUI;
    if (typeof _origUpdate === 'function') {
        window._updateToolbarCompactUI = function () {
            _origUpdate.apply(this, arguments);
            _syncToolbarCompactSwitch();
        };
    }
    // 用 MutationObserver 补丁以防 _updateToolbarCompactUI 在此脚本之后才定义
    let _patched = false;
    const _tryPatch = setInterval(function () {
        if (_patched) { clearInterval(_tryPatch); return; }
        if (typeof window._updateToolbarCompactUI === 'function') {
            const orig2 = window._updateToolbarCompactUI;
            window._updateToolbarCompactUI = function () {
                orig2.apply(this, arguments);
                _syncToolbarCompactSwitch();
            };
            _patched = true;
            clearInterval(_tryPatch);
        }
    }, 500);

})();
