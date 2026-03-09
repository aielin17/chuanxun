/**
 * data-modal.js — 数据管理界面 v8
 * 核心修复：阻止旧版 rebuild() 覆盖新 HTML，并在被覆盖时自动恢复。
 */
(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────
       1. 正确的模态框 HTML（与 index.html 保持一致）
    ───────────────────────────────────────────────────────── */
    var CORRECT_HTML = `
        <!-- Hero Header with storage stats -->
        <div class="dm-hero">
            <div class="dm-hero-top">
                <div class="dm-hero-icon"><i class="fas fa-database"></i></div>
                <div class="dm-hero-text-group">
                    <div class="dm-hero-title">数据管理</div>
                    <div class="dm-hero-subtitle">备份、恢复与存储状态</div>
                </div>
            </div>
            <div class="dm-stats-strip">
                <div class="dm-stat-pill">
                    <div class="dm-stat-pill-val" id="dm-stat-msgs">—</div>
                    <div class="dm-stat-pill-key">聊天记录</div>
                </div>
                <div class="dm-stat-pill">
                    <div class="dm-stat-pill-val" id="dm-stat-settings">—</div>
                    <div class="dm-stat-pill-key">设置数据</div>
                </div>
                <div class="dm-stat-pill">
                    <div class="dm-stat-pill-val" id="dm-stat-media">—</div>
                    <div class="dm-stat-pill-key">图片媒体</div>
                </div>
            </div>
            <div class="dm-progress-row">
                <div class="dm-progress-track">
                    <div class="dm-progress-fill" id="dm-storage-bar" style="width:0%"></div>
                </div>
                <span class="dm-progress-label" id="dm-storage-total">计算中…</span>
            </div>
        </div>

        <!-- Body -->
        <div class="dm-body">

            <!-- 消息通知 -->
            <div class="dm-section-label"><i class="fas fa-bell"></i> 消息通知</div>
            <div class="dm-action-card">
                <div class="dm-notif-toggle-wrap">
                    <div class="dm-badge amber"><i class="fas fa-bell"></i></div>
                    <div class="dm-action-info">
                        <div class="dm-action-title">后台消息推送</div>
                        <div class="dm-action-desc" id="notif-status-text">挂在后台时收到新消息自动弹出提醒</div>
                    </div>
                    <label class="dm-toggle-pill">
                        <input type="checkbox" id="notif-permission-toggle" onchange="handleNotifToggle(this)">
                        <span class="dm-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <!-- 备份与恢复 -->
            <div class="dm-section-label"><i class="fas fa-cloud-upload-alt"></i> 备份与恢复</div>
            <div class="dm-action-card">
                <div class="dm-action-row">
                    <div class="dm-badge blue"><i class="fas fa-layer-group"></i></div>
                    <div class="dm-action-info">
                        <div class="dm-action-title">全量备份</div>
                        <div class="dm-action-desc">外观、设置、字卡、心情、信封等全部</div>
                    </div>
                    <div class="dm-btn-cluster">
                        <button class="dm-btn export" id="export-all-settings"><i class="fas fa-download"></i> 导出</button>
                        <button class="dm-btn" id="import-all-settings"><i class="fas fa-upload"></i> 导入</button>
                    </div>
                </div>
                <div class="dm-action-row">
                    <div class="dm-badge teal"><i class="fas fa-comments"></i></div>
                    <div class="dm-action-info">
                        <div class="dm-action-title">聊天记录</div>
                        <div class="dm-action-desc">仅导出 / 导入消息内容</div>
                    </div>
                    <div class="dm-btn-cluster">
                        <button class="dm-btn export" id="export-chat-btn"><i class="fas fa-download"></i> 导出</button>
                        <button class="dm-btn" id="import-chat-btn"><i class="fas fa-upload"></i> 导入</button>
                    </div>
                </div>
            </div>

            <!-- 关于 -->
            <div class="dm-section-label"><i class="fas fa-circle-info"></i> 关于</div>
            <div class="dm-action-card">
                <div class="dm-action-row" style="cursor:pointer;" id="replay-tutorial-btn-row">
                    <div class="dm-badge slate"><i class="fas fa-compass"></i></div>
                    <div class="dm-action-info">
                        <div class="dm-action-title">重放新手引导</div>
                        <div class="dm-action-desc">重新播放功能介绍教程</div>
                    </div>
                    <button class="dm-btn" id="replay-tutorial-btn"><i class="fas fa-play"></i> 播放</button>
                    <i class="fas fa-chevron-right dm-chevron"></i>
                </div>
                <div class="dm-action-row" style="cursor:pointer;" id="open-credits-row">
                    <div class="dm-badge violet"><i class="fas fa-scroll"></i></div>
                    <div class="dm-action-info">
                        <div class="dm-action-title">声明与致谢</div>
                        <div class="dm-action-desc">开源声明、致谢名单</div>
                    </div>
                    <button class="dm-btn" id="open-credits-btn"><i class="fas fa-arrow-right"></i> 查看</button>
                    <i class="fas fa-chevron-right dm-chevron"></i>
                </div>
            </div>

            <!-- 危险操作 -->
            <div class="dm-section-label danger-label"><i class="fas fa-triangle-exclamation"></i> 危险操作</div>
            <div class="dm-action-card">
                <div class="dm-action-row">
                    <div class="dm-badge red"><i class="fas fa-trash-alt"></i></div>
                    <div class="dm-action-info">
                        <div class="dm-action-title">重置全部数据</div>
                        <div class="dm-action-desc">清空所有本地数据，操作不可撤销</div>
                    </div>
                    <button class="dm-btn danger-btn" id="clear-storage"><i class="fas fa-rotate-right"></i> 重置</button>
                </div>
            </div>

        </div><!-- /.dm-body -->

        <!-- Footer -->
        <div class="dm-footer">
            <button class="dm-footer-back" id="back-data"
                onclick="(function(){hideModal(document.getElementById('data-modal'));showModal(document.getElementById('settings-modal'))})()">
                <i class="fas fa-arrow-left"></i> 返回
            </button>
            <button class="dm-footer-close" id="close-data">
                <i class="fas fa-check"></i> 完成
            </button>
        </div>
    `;

    /* ─────────────────────────────────────────────────────────
       2. 检测并恢复 HTML
    ───────────────────────────────────────────────────────── */
    function isCorrectHTML(mc) {
        // 新版 HTML 有 dm-hero；旧版 dm6 结构有 dm6-tabs
        return mc.querySelector('.dm-hero') !== null &&
               mc.querySelector('.dm6-tabs') === null;
    }

    function restoreHTML(mc) {
        mc.innerHTML = CORRECT_HTML;
        mc.dataset.dmV8 = '1';
        // 重新绑定 close-data（listeners.js 在 DOMContentLoaded 时已绑定，
        // 但 innerHTML 替换后旧元素消失，需要重新绑定）
        var closeBtn = document.getElementById('close-data');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                var modal = document.getElementById('data-modal');
                if (modal && typeof hideModal === 'function') hideModal(modal);
            });
        }
        // 重绑 export/import (listeners.js 的绑定在 DOMContentLoaded 时已执行，元素被替换后失效)
        rebindBackupBtns();
    }

    function rebindBackupBtns() {
        var exportAll = document.getElementById('export-all-settings');
        if (exportAll && !exportAll._dmBound) {
            exportAll._dmBound = true;
            exportAll.addEventListener('click', function () {
                if (typeof exportAllData === 'function') exportAllData();
                else if (typeof window.exportAllData === 'function') window.exportAllData();
            });
        }
        var importAll = document.getElementById('import-all-settings');
        if (importAll && !importAll._dmBound) {
            importAll._dmBound = true;
            importAll.addEventListener('click', function () {
                var inp = document.createElement('input');
                inp.type = 'file'; inp.accept = '.json';
                inp.onchange = function (e) {
                    var f = e.target.files && e.target.files[0];
                    if (f && typeof importAllData === 'function') importAllData(f);
                };
                inp.click();
            });
        }
        var exportChat = document.getElementById('export-chat-btn');
        if (exportChat && !exportChat._dmBound) {
            exportChat._dmBound = true;
            exportChat.addEventListener('click', function () {
                if (typeof exportChatHistory === 'function') exportChatHistory();
            });
        }
        var importChat = document.getElementById('import-chat-btn');
        if (importChat && !importChat._dmBound) {
            importChat._dmBound = true;
            importChat.addEventListener('click', function () {
                var inp = document.createElement('input');
                inp.type = 'file'; inp.accept = '.json';
                inp.onchange = function (e) {
                    var f = e.target.files && e.target.files[0];
                    if (f && typeof importChatHistory === 'function') importChatHistory(f);
                };
                inp.click();
            });
        }
        var credits = document.getElementById('open-credits-btn');
        if (credits && !credits._dmBound) {
            credits._dmBound = true;
            credits.addEventListener('click', function () {
                var dataModal = document.getElementById('data-modal');
                if (dataModal && typeof hideModal === 'function') hideModal(dataModal);
                var disc = document.getElementById('disclaimer-modal');
                if (disc && typeof showModal === 'function') showModal(disc);
            });
        }
        var tutorial = document.getElementById('replay-tutorial-btn');
        if (tutorial && !tutorial._dmBound) {
            tutorial._dmBound = true;
            tutorial.addEventListener('click', function () {
                var dataModal = document.getElementById('data-modal');
                if (dataModal && typeof hideModal === 'function') hideModal(dataModal);
                if (typeof startTour === 'function') {
                    if (window.localforage && window.APP_PREFIX) {
                        localforage.removeItem(APP_PREFIX + 'tour_seen').then(startTour).catch(startTour);
                    } else {
                        startTour();
                    }
                }
            });
        }
    }

    /* ─────────────────────────────────────────────────────────
       3. 存储统计
    ───────────────────────────────────────────────────────── */
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

    /* ─────────────────────────────────────────────────────────
       4. 开关同步
    ───────────────────────────────────────────────────────── */
    function syncToggles() {
        var n = document.getElementById('notif-permission-toggle');
        if (n) n.checked = localStorage.getItem('notifEnabled') === '1' &&
                           'Notification' in window && Notification.permission === 'granted';
    }

    /* ─────────────────────────────────────────────────────────
       5. 主入口：监听模态框打开，防止 dm6 rebuild 覆盖
    ───────────────────────────────────────────────────────── */
    function init() {
        var modal = document.getElementById('data-modal');
        if (!modal) return;

        // 立即标记，阻止旧版 data-modal.js 的 rebuild() 运行
        // 旧代码检查: if (mc.dataset.dm6Built) return;
        var mc = modal.querySelector('.modal-content');
        if (mc) mc.dataset.dm6Built = 'blocked-by-v8';

        // MutationObserver：每次模态框被显示时检查并恢复 HTML
        new MutationObserver(function () {
            var d = modal.style.display;
            if (d !== 'flex' && d !== 'block') return;

            var mc2 = modal.querySelector('.modal-content');
            if (!mc2) return;

            // 如果旧代码已经跑了（出现 dm6 结构），立即恢复
            if (!isCorrectHTML(mc2)) {
                restoreHTML(mc2);
            }

            // 确保 dm6Built 标记始终存在
            mc2.dataset.dm6Built = 'blocked-by-v8';

            // 修复 showModal 的内联动画冲突
            requestAnimationFrame(function () {
                mc2.style.removeProperty('transform');
                mc2.style.removeProperty('opacity');
            });

            setTimeout(function () {
                updateStats();
                syncToggles();
                rebindBackupBtns();
            }, 80);
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });

        // 同时监听 modal-content 的 innerHTML 变化（防止 rebuild 后我们没注意到）
        if (mc) {
            new MutationObserver(function () {
                var mc3 = modal.querySelector('.modal-content');
                if (!mc3) return;
                if (!isCorrectHTML(mc3)) {
                    mc3.dataset.dm6Built = 'blocked-by-v8';
                    restoreHTML(mc3);
                }
            }).observe(mc, { childList: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
    } else {
        init();
    }

})();
