/**
 * features/notifications.js - 通知 Notifications & Storage
 * 推送通知与存储使用量
 */

function updateStorageUsageBar() {
    // 兼容新版 data-modal 的元素 ID（dm-storage-bar / dm-storage-total / dm-stat-*）
    var bar      = document.getElementById('dm-storage-bar')    || document.getElementById('storage-usage-fill');
    var label    = document.getElementById('dm-storage-total')  || document.getElementById('storage-usage-text');
    var statMsgs = document.getElementById('dm-stat-msgs');
    var statCfg  = document.getElementById('dm-stat-settings');
    var statMed  = document.getElementById('dm-stat-media');

    function fmt(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(2) + ' MB';
    }

    function applyStats(total, msgs, cfg, media) {
        var pct = Math.min(total / (5 * 1024 * 1024) * 100, 100);
        if (bar) {
            bar.style.width = pct.toFixed(1) + '%';
            if (pct > 80)
                bar.style.background = 'linear-gradient(90deg,#FF3B30,#CC0000)';
            else if (pct > 50)
                bar.style.background = 'linear-gradient(90deg,#FF9F0A,#E07000)';
            else
                bar.style.background = 'linear-gradient(90deg,var(--accent-color),rgba(var(--accent-color-rgb),0.6))';
        }
        if (label)    label.textContent    = fmt(total) + ' / ~5 MB';
        if (statMsgs) statMsgs.textContent = fmt(msgs);
        if (statCfg)  statCfg.textContent  = fmt(cfg);
        if (statMed)  statMed.textContent  = fmt(media);
    }

    function fromLocalStorage() {
        var total = 0, msgs = 0, cfg = 0, media = 0;
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i) || '';
            var v = localStorage.getItem(k) || '';
            var bytes = (k.length + v.length) * 2;
            total += bytes;
            if (k.includes('messages') || k.includes('session')) msgs += bytes;
            else if (v.startsWith('data:image') || v.startsWith('data:video')) media += bytes;
            else cfg += bytes;
        }
        applyStats(total, msgs, cfg, media);
    }

    try {
        if (window.localforage) {
            localforage.keys().then(function(keys) {
                var promises = keys.map(function(k) {
                    return localforage.getItem(k).then(function(v) {
                        if (v === null || v === undefined) return { bytes: 0, type: 'cfg' };
                        var str = typeof v === 'string' ? v : JSON.stringify(v);
                        var bytes = (k.length + str.length) * 2;
                        var type = (k.includes('messages') || k.includes('session')) ? 'msgs'
                                 : (str.startsWith('data:image') || str.startsWith('data:video')) ? 'media'
                                 : 'cfg';
                        return { bytes: bytes, type: type };
                    });
                });
                Promise.all(promises).then(function(items) {
                    var total = 0, msgs = 0, cfg = 0, media = 0;
                    items.forEach(function(it) {
                        total += it.bytes;
                        if (it.type === 'msgs') msgs += it.bytes;
                        else if (it.type === 'media') media += it.bytes;
                        else cfg += it.bytes;
                    });
                    applyStats(total, msgs, cfg, media);
                });
            }).catch(fromLocalStorage);
        } else {
            fromLocalStorage();
        }
    } catch(e) {
        fromLocalStorage();
    }
}

(function() {
    var orig = window.showModal;
    if (typeof orig === 'function') {
        window.showModal = function(el) {
            orig.apply(this, arguments);
            if (el && el.id === 'data-modal') {
                setTimeout(updateStorageUsageBar, 200);
            }
        };
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('data-settings');
    if (btn) {
        btn.addEventListener('click', function() { setTimeout(updateStorageUsageBar, 300); });
    }
});

window._sendPartnerNotification = function(title, body) {
    try {
        var enabled = localStorage.getItem('notifEnabled') === '1';
        if (!enabled) return;
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        if (!document.hidden) return; 
        new Notification(title || '传讯', {
            body: body || '对方发来了消息',
            icon: document.querySelector('#partner-avatar img') ? document.querySelector('#partner-avatar img').src : undefined,
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
                try {
                    new Notification('传讯通知已开启 ✨', {
                        body: '你现在可以在后台收到消息提醒了',
                        tag: 'notif-test'
                    });
                } catch(e) {}
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

document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('notif-permission-toggle');
    var statusEl = document.getElementById('notif-status-text');
    if (!toggle) return;
    var enabled = localStorage.getItem('notifEnabled') === '1';
    var granted = ('Notification' in window) && Notification.permission === 'granted';
    toggle.checked = enabled && granted;
    if (toggle.checked && statusEl) {
        statusEl.textContent = '✅ 已开启 — 当页面在后台时，收到消息会弹出系统通知';
    } else if (statusEl) {
        if ('Notification' in window && Notification.permission === 'denied') {
            statusEl.textContent = '❌ 通知权限已被浏览器屏蔽，请自行搜索如何开启';
        } else {
            statusEl.textContent = '关闭状态 — 开启后可在后台接收消息提醒';
        }
    }
});
