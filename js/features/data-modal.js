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

            // Try localforage first (more complete), fallback to localStorage
            const processLS = () => {
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i) || '';
                    const v = localStorage.getItem(k) || '';
                    const bytes = (k.length + v.length) * 2;
                    total += bytes;
                    if (/messages|msgs|session/i.test(k)) msgs += bytes;
                    else if (v.startsWith('data:image') || v.startsWith('data:video')) media += bytes;
                    else cfg += bytes;
                }
                applyStats(total, msgs, cfg, media);
            };

            if (window.localforage) {
                localforage.keys().then(keys => {
                    const promises = keys.map(k =>
                        localforage.getItem(k).then(raw => {
                            if (raw == null) return { k, bytes: 0 };
                            const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
                            return { k, bytes: (k.length + str.length) * 2 };
                        })
                    );
                    Promise.all(promises).then(results => {
                        results.forEach(({ k, bytes }) => {
                            total += bytes;
                            if (/messages|msgs|session/i.test(k)) msgs += bytes;
                            else if (/avatar|image|photo|bg|background|wallpaper/i.test(k)) media += bytes;
                            else cfg += bytes;
                        });
                        applyStats(total, msgs, cfg, media);
                    }).catch(processLS);
                }).catch(processLS);
            } else {
                processLS();
            }
        } catch (e) {
            console.warn('[dm] stats error', e);
            const el = document.getElementById('dm-storage-total');
            if (el) el.textContent = '无法读取';
        }
    }

    function applyStats(total, msgs, cfg, media) {
        const pct = Math.min(100, total / (5 * 1024 * 1024) * 100);
        const g = id => document.getElementById(id);

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
        if (g('dm-stat-msgs'))     g('dm-stat-msgs').textContent     = fmt(msgs);
        if (g('dm-stat-settings')) g('dm-stat-settings').textContent = fmt(cfg);
        if (g('dm-stat-media'))    g('dm-stat-media').textContent    = fmt(media);
    }

    /* ── Toggle sync ─────────────────────────────────────────── */
    function syncToggles() {
        const n = document.getElementById('notif-permission-toggle');
        if (n) n.checked = localStorage.getItem('notifEnabled') === '1' &&
                           'Notification' in window && Notification.permission === 'granted';
        const c = document.getElementById('call-enabled-toggle');
        if (c) c.checked = localStorage.getItem('callFeatureEnabled') !== 'false';
    }

    /* ── Fix showModal's inline transform which fights our sheet animation ── */
    function fixModalAnimation() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;
        // showModal() sets content.style.transform='translateY(0) scale(1)'
        // which overrides our CSS animation. We patch it right after.
        const mc = modal.querySelector('.modal-content');
        if (mc) {
            // Remove the inline transform/opacity set by showModal so our CSS animation plays
            mc.style.removeProperty('transform');
            mc.style.removeProperty('opacity');
        }
    }

    /* ── Clear-storage: prevent double binding with listeners.js ── */
    function wireClearStorage() {
        const btn = document.getElementById('clear-storage');
        if (!btn || btn._dmWired) return;
        btn._dmWired = true;
        // listeners.js also wires this - we skip to avoid double confirm
        // The listeners.js wiring calls clearAllAppData() which handles everything
    }

    /* ── Watch for modal open ────────────────────────────────── */
    function watch() {
        const modal = document.getElementById('data-modal');
        if (!modal) return;
        new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === 'style') {
                    const d = modal.style.display;
                    if (d === 'flex' || d === 'block') {
                        // Fix animation conflict with showModal's inline styles
                        requestAnimationFrame(fixModalAnimation);
                        setTimeout(() => {
                            updateStats();
                            syncToggles();
                        }, 50);
                    }
                }
            }
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    /* ── Init ────────────────────────────────────────────────── */
    function init() {
        const go = () => { watch(); };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(go, 100));
        } else {
            setTimeout(go, 100);
        }
    }

    init();
})();
