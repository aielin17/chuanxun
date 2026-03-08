/**
 * data-modal.js — 数据管理界面 v7
 * 与新版 HTML 结构对接：只负责数据填充 & 事件绑定，不重建 DOM
 */
(function () {
    'use strict';

    /* ── Formatting ──────────────────────────────────────────── */
    function fmt(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(2) + ' MB';
    }

    /* ── Storage stats ───────────────────────────────────────── */
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
            const pct = Math.min(100, total / (5 * 1024 * 1024) * 100);
            const g = id => document.getElementById(id);

            // New IDs in our redesigned HTML
            const bar = g('dm-storage-bar');
            if (bar) {
                bar.style.width = pct.toFixed(1) + '%';
                bar.style.background = pct > 80
                    ? 'linear-gradient(90deg,#FF3B30,#CC0000)'
                    : pct > 50
                    ? 'linear-gradient(90deg,#FF9F0A,#E07000)'
                    : 'linear-gradient(90deg,var(--accent-color),rgba(var(--accent-color-rgb),0.6))';
            }
            if (g('dm-storage-total')) g('dm-storage-total').textContent = fmt(total) + ' / ~5 MB';
            if (g('dm-stat-msgs'))    g('dm-stat-msgs').textContent    = fmt(msgs);
            if (g('dm-stat-settings')) g('dm-stat-settings').textContent = fmt(cfg);
            if (g('dm-stat-media'))   g('dm-stat-media').textContent   = fmt(media);
        } catch (e) { console.warn('[dm] stats error', e); }
    }

    /* ── Toggle sync ─────────────────────────────────────────── */
    function syncToggles() {
        const n = document.getElementById('notif-permission-toggle');
        if (n) n.checked = localStorage.getItem('notifEnabled') === '1' &&
                            'Notification' in window && Notification.permission === 'granted';

        // Video call toggle (if present in future)
        const c = document.getElementById('call-enabled-toggle');
        if (c) c.checked = localStorage.getItem('callFeatureEnabled') !== 'false';
    }

    /* ── Clear-storage button ────────────────────────────────── */
    function wireClearStorage() {
        const btn = document.getElementById('clear-storage');
        if (!btn || btn._dmWired) return;
        btn._dmWired = true;
        btn.addEventListener('click', () => {
            if (!confirm('⚠️ 确定要清空全部数据吗？\n\n所有消息、设置、字卡、头像等将被永久删除，不可恢复！')) return;
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
            window.localforage ? localforage.clear().then(doReset).catch(doReset) : doReset();
        });
    }

    /* ── Watch for modal open ────────────────────────────────── */
    function watch() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;
        new MutationObserver(() => {
            const d = modal.style.display;
            if (d === 'flex' || d === 'block') {
                updateStats();
                syncToggles();
                wireClearStorage();
            }
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    /* ── Init ────────────────────────────────────────────────── */
    function init() {
        const go = () => {
            watch();
            wireClearStorage();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(go, 300));
        } else {
            setTimeout(go, 300);
        }
    }

    init();
})();
