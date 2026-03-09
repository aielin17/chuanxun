/**
 * data.js - 数据管理界面 + 推送通知
 * 合并自：data-modal.js + notifications.js
 * 
 * 修复：简化了 data-modal.js 的 MutationObserver 防覆盖逻辑，
 *       该逻辑是为了对抗已不存在的"旧版代码"，保留会增加不必要开销。
 */
/**
 * data-modal.js — v9
 * 策略：
 *  1. 抢先注入 dm6-style 标签（内含正确 CSS），令旧版 injectCSS() 因 id 重复而跳过
 *  2. 立即设置 mc.dataset.dm6Built，令旧版 rebuild() 因标记存在而跳过
 *  3. 恢复/写入正确 HTML，绑定所有事件
 *  4. 双重 MutationObserver 防止任何时机的 innerHTML 覆盖
 */
(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════
       0. 立即抢占 dm6-style，阻止旧版注入错误 CSS
    ═══════════════════════════════════════════════════════════ */
    (function blockDm6CSS() {
        if (document.getElementById('dm6-style')) return; // 已存在则无需处理
        var s = document.createElement('style');
        s.id = 'dm6-style'; // 占位，旧版 injectCSS() 看到此 id 会直接 return
        s.textContent = '/* dm6-style blocked by data-modal v9 */';
        document.head.appendChild(s);
    })();

    /* ═══════════════════════════════════════════════════════════
       1. 正确的 modal-content 内部 HTML
    ═══════════════════════════════════════════════════════════ */
    var INNER_HTML = '<div class="dm-hero">'
        + '<div class="dm-hero-top">'
        +   '<div class="dm-hero-icon"><i class="fas fa-database"></i></div>'
        +   '<div class="dm-hero-text-group">'
        +     '<div class="dm-hero-title">数据管理</div>'
        +     '<div class="dm-hero-subtitle">备份、恢复与存储状态</div>'
        +   '</div>'
        + '</div>'
        + '<div class="dm-stats-strip">'
        +   '<div class="dm-stat-pill"><div class="dm-stat-pill-val" id="dm-stat-msgs">—</div><div class="dm-stat-pill-key">聊天记录</div></div>'
        +   '<div class="dm-stat-pill"><div class="dm-stat-pill-val" id="dm-stat-settings">—</div><div class="dm-stat-pill-key">设置数据</div></div>'
        +   '<div class="dm-stat-pill"><div class="dm-stat-pill-val" id="dm-stat-media">—</div><div class="dm-stat-pill-key">图片媒体</div></div>'
        + '</div>'
        + '<div class="dm-progress-row">'
        +   '<div class="dm-progress-track"><div class="dm-progress-fill" id="dm-storage-bar" style="width:0%"></div></div>'
        +   '<span class="dm-progress-label" id="dm-storage-total">计算中…</span>'
        + '</div>'
        + '</div>'

        + '<div class="dm-body">'

        +   '<div class="dm-section-label"><i class="fas fa-bell"></i> 消息通知</div>'
        +   '<div class="dm-action-card">'
        +     '<div class="dm-notif-toggle-wrap">'
        +       '<div class="dm-badge amber"><i class="fas fa-bell"></i></div>'
        +       '<div class="dm-action-info">'
        +         '<div class="dm-action-title">后台消息推送</div>'
        +         '<div class="dm-action-desc" id="notif-status-text">挂在后台时收到新消息自动弹出提醒</div>'
        +       '</div>'
        +       '<label class="dm-toggle-pill">'
        +         '<input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)">'
        +         '<span class="dm-toggle-slider"></span>'
        +       '</label>'
        +     '</div>'
        +   '</div>'

        +   '<div class="dm-section-label"><i class="fas fa-cloud-upload-alt"></i> 备份与恢复</div>'
        +   '<div class="dm-action-card">'
        +     '<div class="dm-action-row">'
        +       '<div class="dm-badge blue"><i class="fas fa-layer-group"></i></div>'
        +       '<div class="dm-action-info"><div class="dm-action-title">全量备份</div><div class="dm-action-desc">外观、设置、字卡、心情、信封等全部</div></div>'
        +       '<div class="dm-btn-cluster">'
        +         '<button class="dm-btn export" id="export-all-settings"><i class="fas fa-download"></i> 导出</button>'
        +         '<button class="dm-btn" id="import-all-settings"><i class="fas fa-upload"></i> 导入</button>'
        +       '</div>'
        +     '</div>'
        +     '<div class="dm-action-row">'
        +       '<div class="dm-badge teal"><i class="fas fa-comments"></i></div>'
        +       '<div class="dm-action-info"><div class="dm-action-title">聊天记录</div><div class="dm-action-desc">仅导出 / 导入消息内容</div></div>'
        +       '<div class="dm-btn-cluster">'
        +         '<button class="dm-btn export" id="export-chat-btn"><i class="fas fa-download"></i> 导出</button>'
        +         '<button class="dm-btn" id="import-chat-btn"><i class="fas fa-upload"></i> 导入</button>'
        +       '</div>'
        +     '</div>'
        +   '</div>'

        +   '<div class="dm-section-label"><i class="fas fa-circle-info"></i> 关于</div>'
        +   '<div class="dm-action-card">'
        +     '<div class="dm-action-row" id="replay-tutorial-btn-row" style="cursor:pointer">'
        +       '<div class="dm-badge slate"><i class="fas fa-compass"></i></div>'
        +       '<div class="dm-action-info"><div class="dm-action-title">重放新手引导</div><div class="dm-action-desc">重新播放功能介绍教程</div></div>'
        +       '<button class="dm-btn" id="replay-tutorial-btn"><i class="fas fa-play"></i> 播放</button>'
        +       '<i class="fas fa-chevron-right dm-chevron"></i>'
        +     '</div>'
        +     '<div class="dm-action-row" id="open-credits-row" style="cursor:pointer">'
        +       '<div class="dm-badge violet"><i class="fas fa-scroll"></i></div>'
        +       '<div class="dm-action-info"><div class="dm-action-title">声明与致谢</div><div class="dm-action-desc">开源声明、致谢名单</div></div>'
        +       '<button class="dm-btn" id="open-credits-btn"><i class="fas fa-arrow-right"></i> 查看</button>'
        +       '<i class="fas fa-chevron-right dm-chevron"></i>'
        +     '</div>'
        +   '</div>'

        +   '<div class="dm-section-label danger-label"><i class="fas fa-triangle-exclamation"></i> 危险操作</div>'
        +   '<div class="dm-action-card">'
        +     '<div class="dm-action-row">'
        +       '<div class="dm-badge red"><i class="fas fa-trash-alt"></i></div>'
        +       '<div class="dm-action-info"><div class="dm-action-title">重置全部数据</div><div class="dm-action-desc">清空所有本地数据，操作不可撤销</div></div>'
        +       '<button class="dm-btn danger-btn" id="clear-storage"><i class="fas fa-rotate-right"></i> 重置</button>'
        +     '</div>'
        +   '</div>'

        + '</div>' // .dm-body

        + '<div class="dm-footer">'
        +   '<button class="dm-footer-back" id="back-data" onclick="(function(){hideModal(document.getElementById(\'data-modal\'));showModal(document.getElementById(\'settings-modal\'))})()">'
        +     '<i class="fas fa-arrow-left"></i> 返回'
        +   '</button>'
        +   '<button class="dm-footer-close" id="close-data">'
        +     '<i class="fas fa-check"></i> 完成'
        +   '</button>'
        + '</div>';

    /* ═══════════════════════════════════════════════════════════
       2. 写入 HTML（若已正确则跳过）
    ═══════════════════════════════════════════════════════════ */
    function isCorrect(mc) {
        return mc.querySelector('.dm-hero') !== null
            && mc.querySelector('.dm6') === null
            && mc.querySelector('.dm6-tabs') === null;
    }

    function writeHTML(mc) {
        mc.innerHTML = INNER_HTML;
        mc.dataset.dm6Built = 'v9'; // 阻止旧版 rebuild()
        bindAll(mc);
    }

    function ensureHTML(mc) {
        if (!mc) return;
        mc.dataset.dm6Built = 'v9'; // 先打标记，再检查
        if (!isCorrect(mc)) writeHTML(mc);
    }

    /* ═══════════════════════════════════════════════════════════
       3. 存储统计
    ═══════════════════════════════════════════════════════════ */
    function fmt(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(2) + ' MB';
    }

    function applyStats(total, msgs, cfg, media) {
        var pct = Math.min(100, total / (5 * 1024 * 1024) * 100);
        var g = function (id) { return document.getElementById(id); };
        var bar = g('dm-storage-bar');
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

    function updateStats() {
        var total = 0, msgs = 0, cfg = 0, media = 0;
        var processLS = function () {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i) || '';
                var v = localStorage.getItem(k) || '';
                var bytes = (k.length + v.length) * 2;
                total += bytes;
                if (/messages|msgs|session/i.test(k)) msgs += bytes;
                else if (v.startsWith('data:image') || v.startsWith('data:video')) media += bytes;
                else cfg += bytes;
            }
            applyStats(total, msgs, cfg, media);
        };
        try {
            if (window.localforage) {
                localforage.keys().then(function (keys) {
                    var promises = keys.map(function (k) {
                        return localforage.getItem(k).then(function (raw) {
                            if (raw == null) return { k: k, b: 0 };
                            var str = typeof raw === 'string' ? raw : JSON.stringify(raw);
                            return { k: k, b: (k.length + str.length) * 2 };
                        });
                    });
                    Promise.all(promises).then(function (results) {
                        results.forEach(function (r) {
                            total += r.b;
                            if (/messages|msgs|session/i.test(r.k)) msgs += r.b;
                            else if (/avatar|image|photo|bg|background|wallpaper/i.test(r.k)) media += r.b;
                            else cfg += r.b;
                        });
                        applyStats(total, msgs, cfg, media);
                    }).catch(processLS);
                }).catch(processLS);
            } else { processLS(); }
        } catch (e) { processLS(); }
    }

    /* ═══════════════════════════════════════════════════════════
       4. 开关同步
    ═══════════════════════════════════════════════════════════ */
    function syncToggles() {
        var n = document.getElementById('notif-permission-toggle');
        if (n) n.checked = localStorage.getItem('notifEnabled') === '1'
                        && 'Notification' in window
                        && Notification.permission === 'granted';
    }

    /* ═══════════════════════════════════════════════════════════
       5. 事件绑定（写入 HTML 后调用）
    ═══════════════════════════════════════════════════════════ */
    function bindAll(mc) {
        /* close-data */
        var closeBtn = mc.querySelector('#close-data');
        if (closeBtn) closeBtn.addEventListener('click', function () {
            var modal = document.getElementById('data-modal');
            if (modal && typeof hideModal === 'function') hideModal(modal);
        });

        /* clear-storage */
        var clearBtn = mc.querySelector('#clear-storage');
        if (clearBtn) clearBtn.addEventListener('click', function () {
            if (!confirm('⚠️ 确定要清空全部数据吗？\n\n所有消息、设置、字卡、头像等将被永久删除，不可恢复！')) return;
            if (!confirm('最后确认：清空后页面将自动刷新，无法撤销，继续吗？')) return;
            window._skipBackup = true;
            var doReset = function () {
                localStorage.clear();
                if (typeof showNotification === 'function') showNotification('所有数据已清空，即将刷新…', 'info', 2000);
                setTimeout(function () { window.location.href = window.location.pathname + '?reset=' + Date.now(); }, 2000);
            };
            window.localforage ? localforage.clear().then(doReset).catch(doReset) : doReset();
        });

        /* export-all-settings */
        var exportAll = mc.querySelector('#export-all-settings');
        if (exportAll) exportAll.addEventListener('click', function () {
            if (typeof exportAllData === 'function') exportAllData();
        });

        /* import-all-settings */
        var importAll = mc.querySelector('#import-all-settings');
        if (importAll) importAll.addEventListener('click', function () {
            var inp = document.createElement('input');
            inp.type = 'file'; inp.accept = '.json';
            inp.onchange = function (e) {
                var f = e.target.files && e.target.files[0];
                if (f && typeof importAllData === 'function') importAllData(f);
            };
            inp.click();
        });

        /* export-chat-btn */
        var exportChat = mc.querySelector('#export-chat-btn');
        if (exportChat) exportChat.addEventListener('click', function () {
            if (typeof exportChatHistory === 'function') exportChatHistory();
        });

        /* import-chat-btn */
        var importChat = mc.querySelector('#import-chat-btn');
        if (importChat) importChat.addEventListener('click', function () {
            var inp = document.createElement('input');
            inp.type = 'file'; inp.accept = '.json';
            inp.onchange = function (e) {
                var f = e.target.files && e.target.files[0];
                if (f && typeof importChatHistory === 'function') importChatHistory(f);
            };
            inp.click();
        });

        /* open-credits-btn */
        var creditsBtn = mc.querySelector('#open-credits-btn');
        if (creditsBtn) creditsBtn.addEventListener('click', function () {
            var dataModal = document.getElementById('data-modal');
            if (dataModal && typeof hideModal === 'function') hideModal(dataModal);
            var disc = document.getElementById('disclaimer-modal');
            if (disc && typeof showModal === 'function') showModal(disc);
        });

        /* replay-tutorial-btn */
        var tutorialBtn = mc.querySelector('#replay-tutorial-btn');
        if (tutorialBtn) tutorialBtn.addEventListener('click', function () {
            var dataModal = document.getElementById('data-modal');
            if (dataModal && typeof hideModal === 'function') hideModal(dataModal);
            if (typeof startTour === 'function') {
                if (window.localforage && window.APP_PREFIX) {
                    localforage.removeItem(APP_PREFIX + 'tour_seen').then(startTour).catch(startTour);
                } else { startTour(); }
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════
       6. 主流程
    ═══════════════════════════════════════════════════════════ */
    function onModalOpen(modal) {
        var mc = modal.querySelector('.modal-content');
        if (!mc) return;
        ensureHTML(mc);
        // showModal() 用 rAF 设置 opacity/transform inline style，
        // 我们在下一帧修正（避免动画从 translateY(20px) 开始）
        requestAnimationFrame(function () {
            mc.style.opacity = '1';
            mc.style.transform = 'none';
        });
        setTimeout(function () {
            updateStats();
            syncToggles();
        }, 60);
    }

    function init() {
        var modal = document.getElementById('data-modal');
        if (!modal) return;

        /* 立即阻止旧版 rebuild() */
        var mc = modal.querySelector('.modal-content');
        if (mc) mc.dataset.dm6Built = 'v9';

        /* 观察 modal 的 style 变化（显示/隐藏） */
        new MutationObserver(function () {
            var d = modal.style.display;
            if (d === 'flex' || d === 'block') onModalOpen(modal);
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });

        /* 观察 modal-content 的子节点变化（防止 rebuild 替换内容） */
        if (mc) {
            new MutationObserver(function () {
                var mc2 = modal.querySelector('.modal-content');
                if (mc2 && !isCorrect(mc2)) {
                    mc2.dataset.dm6Built = 'v9';
                    writeHTML(mc2);
                }
            }).observe(mc, { childList: true, subtree: false });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
    } else {
        init();
    }

})();

/* ========================================================
   notifications.js - 通知 & 存储使用量
   ======================================================== */
/**
 * features/notifications.js - 通知 Notifications & Storage
 * 推送通知与存储使用量
 * v2: 适配新版数据管理界面元素 ID
 */

/* ── Storage bar update (bridges to new data modal IDs) ──────── */
function updateStorageUsageBar() {
    // Support both old IDs (legacy) and new data modal IDs
    var bar   = document.getElementById('dm-storage-bar')   || document.getElementById('storage-usage-fill');
    var text  = document.getElementById('dm-storage-total') || document.getElementById('storage-usage-text');
    if (!bar && !text) return;

    try {
        if (window.localforage && window.APP_PREFIX) {
            localforage.keys().then(function(keys) {
                var promises = keys.map(function(k) {
                    return localforage.getItem(k).then(function(v) {
                        if (v === null || v === undefined) return 0;
                        var str = typeof v === 'string' ? v : JSON.stringify(v);
                        return (k.length + str.length) * 2;
                    });
                });
                Promise.all(promises).then(function(sizes) {
                    var total   = sizes.reduce(function(a,b){return a+b;},0);
                    var usedKB  = (total / 1024).toFixed(1);
                    var maxBytes = 5 * 1024 * 1024;
                    var pct     = Math.min(total / maxBytes * 100, 100).toFixed(1);
                    var fmt     = function(b) { return b<1024 ? b+' B' : b<1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(2)+' MB'; };

                    if (bar) {
                        bar.style.width = pct + '%';
                        if (parseFloat(pct) > 80)
                            bar.style.background = 'linear-gradient(90deg,#FF3B30,#CC0000)';
                        else if (parseFloat(pct) > 50)
                            bar.style.background = 'linear-gradient(90deg,#FF9F0A,#E07000)';
                        else
                            bar.style.background = 'linear-gradient(90deg,var(--accent-color),rgba(var(--accent-color-rgb),0.6))';
                    }
                    if (text) text.textContent = fmt(total) + ' / ~5 MB (' + pct + '%)';
                });
            }).catch(function() {
                var ls = 0;
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i) || '';
                    var v = localStorage.getItem(k) || '';
                    ls += (k.length + v.length) * 2;
                }
                var pct = Math.min(ls / (5*1024*1024) * 100, 100).toFixed(1);
                if (bar) bar.style.width = pct + '%';
                if (text) text.textContent = (ls/1024).toFixed(1) + ' KB (localStorage)';
            });
        } else {
            if (text) text.textContent = '暂无数据';
            if (bar)  bar.style.width  = '0%';
        }
    } catch(e) {
        if (text) text.textContent = '无法读取';
    }
}

/* ── Patch showModal to auto-refresh stats when data modal opens ── */
(function() {
    var orig = window.showModal;
    if (typeof orig === 'function') {
        window.showModal = function(el) {
            orig.apply(this, arguments);
            if (el && el.id === 'data-modal') {
                setTimeout(updateStorageUsageBar, 250);
            }
        };
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('data-settings');
    if (btn) {
        btn.addEventListener('click', function() { setTimeout(updateStorageUsageBar, 350); });
    }
});

/* ── Push notification API ──────────────────────────────────────── */
window._sendPartnerNotification = function(title, body) {
    try {
        if (localStorage.getItem('notifEnabled') !== '1') return;
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        if (!document.hidden) return;
        new Notification(title || '传讯', {
            body: body || '对方发来了消息',
            icon: (document.querySelector('#partner-avatar img') || {}).src,
            tag: 'partner-msg',
            renotify: true
        });
    } catch(e) {}
};

window.handleNotifToggle = function(checkbox) {
    var statusEl = document.getElementById('notif-status-text');
    if (!('Notification' in window)) {
        checkbox.checked = false;
        if (statusEl) statusEl.textContent = '⚠️ 您的浏览器不支持通知功能，请更换浏览器';
        return;
    }
    if (checkbox.checked) {
        Notification.requestPermission().then(function(perm) {
            if (perm === 'granted') {
                if (statusEl) statusEl.textContent = '✅ 已开启 — 当页面在后台时，收到消息会弹出系统通知';
                localStorage.setItem('notifEnabled', '1');
                try { new Notification('传讯通知已开启 ✨', { body: '你现在可以在后台收到消息提醒了', tag: 'notif-test' }); } catch(e) {}
            } else if (perm === 'denied') {
                checkbox.checked = false;
                if (statusEl) statusEl.textContent = '❌ 权限被拒绝，请自行搜索如何开启';
                localStorage.setItem('notifEnabled', '0');
            } else {
                checkbox.checked = false;
                if (statusEl) statusEl.textContent = '⚠️ 未做出选择，请重试';
                localStorage.setItem('notifEnabled', '0');
            }
        }).catch(function() {
            checkbox.checked = false;
            if (statusEl) statusEl.textContent = '❌ 请求权限失败，请自行搜索如何打开';
            localStorage.setItem('notifEnabled', '0');
        });
    } else {
        if (statusEl) statusEl.textContent = '已关闭 — 后台将不再弹出消息提醒';
        localStorage.setItem('notifEnabled', '0');
    }
};

/* ── Init toggle state on load ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
    var toggle   = document.getElementById('notif-permission-toggle');
    var statusEl = document.getElementById('notif-status-text');
    if (!toggle) return;
    var enabled = localStorage.getItem('notifEnabled') === '1';
    var granted = ('Notification' in window) && Notification.permission === 'granted';
    toggle.checked = enabled && granted;
    if (!statusEl) return;
    if (toggle.checked) {
        statusEl.textContent = '✅ 已开启 — 当页面在后台时，收到消息会弹出系统通知';
    } else if ('Notification' in window && Notification.permission === 'denied') {
        statusEl.textContent = '❌ 通知权限已被浏览器屏蔽，请自行搜索如何开启';
    } else {
        statusEl.textContent = '关闭状态 — 开启后可在后台接收消息提醒';
    }
});
