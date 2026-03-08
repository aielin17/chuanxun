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
