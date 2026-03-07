/**
 * features-extra.js
 * 新增功能：戳一戳符号开关、顶部栏透明开关、挂机保活音频、全局消息搜索
 */

/* ─── 1. 戳一戳装饰符号开关 ─── */
(function() {
    var POKE_SYM_KEY = 'pokeSymbolEnabled';

    function _getPokeSymbolEnabled() {
        var v = localStorage.getItem(POKE_SYM_KEY);
        return v === null ? true : v === 'true'; // 默认开启
    }

    window._formatPokeText = function(text) {
        if (_getPokeSymbolEnabled()) {
            return '\u2736 ' + text + ' \u2736';
        }
        return text;
    };

    function _syncPokeToggleUI() {
        var enabled = _getPokeSymbolEnabled();
        var sw = document.getElementById('poke-symbol-switch');
        var knob = document.getElementById('poke-symbol-knob');
        var desc = document.getElementById('poke-symbol-desc');
        if (sw) sw.classList.toggle('active', enabled);
        if (desc) desc.textContent = enabled ? '两侧显示 ✦ 符号' : '纯文字，无装饰符号';
    }

    window._togglePokeSymbol = function() {
        var cur = _getPokeSymbolEnabled();
        localStorage.setItem(POKE_SYM_KEY, String(!cur));
        _syncPokeToggleUI();
        if (typeof showNotification === 'function')
            showNotification(!cur ? '已开启戳一戳装饰符号' : '已关闭戳一戳装饰符号', 'success', 1800);
    };

    document.addEventListener('DOMContentLoaded', _syncPokeToggleUI);
    setTimeout(_syncPokeToggleUI, 600);
})();


/* ─── 2. 顶部栏常驻清晰开关 ─── */
(function() {
    var HEADER_CLEAR_KEY = 'headerAlwaysClear';

    function _getHeaderClear() {
        var v = localStorage.getItem(HEADER_CLEAR_KEY);
        return v === 'true'; // 默认关闭（即默认半透明+hover清晰）
    }

    function _applyHeaderOpacity() {
        var clear = _getHeaderClear();
        var header = document.querySelector('.header');
        if (!header) return;
        if (clear) {
            header.style.opacity = '1';
            header.dataset.alwaysClear = 'true';
        } else {
            header.style.opacity = '';
            delete header.dataset.alwaysClear;
        }
    }

    function _syncHeaderToggleUI() {
        var enabled = _getHeaderClear();
        var sw = document.getElementById('header-opacity-switch');
        if (sw) sw.classList.toggle('active', enabled);
    }

    window._toggleHeaderOpacity = function() {
        var cur = _getHeaderClear();
        localStorage.setItem(HEADER_CLEAR_KEY, String(!cur));
        _applyHeaderOpacity();
        _syncHeaderToggleUI();
        if (typeof showNotification === 'function')
            showNotification(!cur ? '顶部栏已常驻清晰' : '顶部栏已恢复悬停清晰', 'success', 1800);
    };

    document.addEventListener('DOMContentLoaded', function() {
        _applyHeaderOpacity();
        _syncHeaderToggleUI();
    });
    setTimeout(function() { _applyHeaderOpacity(); _syncHeaderToggleUI(); }, 800);
})();


/* ─── 3. 挂机保活音频 ─── */
(function() {
    var KEEPALIVE_KEY = 'keepaliveAudioEnabled';
    var KEEPALIVE_URL = 'https://img.heliar.top/file/1772885159972_silence.m4a';
    var _audio = null;
    var _unlockBound = false;

    function _getEnabled() {
        return localStorage.getItem(KEEPALIVE_KEY) === 'true';
    }

    function _createAudio() {
        if (_audio) return _audio;
        _audio = new Audio(KEEPALIVE_URL);
        _audio.loop = true;
        _audio.volume = 0.001; // 几乎静音，但保持活跃
        _audio.preload = 'auto';
        return _audio;
    }

    function _startKeepalive() {
        var a = _createAudio();
        a.play().catch(function(err) {
            // 浏览器可能要求用户交互才能播放，注册一次性解锁
            if (!_unlockBound) {
                _unlockBound = true;
                var unlock = function() {
                    if (_getEnabled()) {
                        a.play().catch(function(){});
                    }
                    document.removeEventListener('touchstart', unlock);
                    document.removeEventListener('click', unlock);
                };
                document.addEventListener('touchstart', unlock, { once: true });
                document.addEventListener('click', unlock, { once: true });
            }
        });
    }

    function _stopKeepalive() {
        if (_audio) {
            _audio.pause();
            _audio.currentTime = 0;
        }
    }

    function _syncUI() {
        var enabled = _getEnabled();
        var sw = document.getElementById('keepalive-audio-switch');
        var desc = document.getElementById('keepalive-audio-desc');
        if (sw) sw.classList.toggle('active', enabled);
        if (desc) desc.textContent = enabled
            ? '保活已开启 — 静音循环音频运行中'
            : '静音循环音频，防止页面被系统挂起';
    }

    window._toggleKeepaliveAudio = function() {
        var cur = _getEnabled();
        var next = !cur;
        localStorage.setItem(KEEPALIVE_KEY, String(next));
        _syncUI();
        if (next) {
            _startKeepalive();
            if (typeof showNotification === 'function')
                showNotification('保活音频已开启，页面将保持活跃 🔊', 'success', 2500);
        } else {
            _stopKeepalive();
            if (typeof showNotification === 'function')
                showNotification('保活音频已关闭', 'info', 1800);
        }
    };

    // 页面可见性变化时保持播放
    document.addEventListener('visibilitychange', function() {
        if (!_getEnabled()) return;
        if (document.visibilityState === 'visible') {
            var a = _createAudio();
            if (a.paused) a.play().catch(function(){});
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        _syncUI();
        if (_getEnabled()) _startKeepalive();
    });
    setTimeout(function() {
        _syncUI();
        if (_getEnabled() && (!_audio || _audio.paused)) _startKeepalive();
    }, 1500);
})();


/* ─── 4. 全局消息搜索 / 按日期搜索 ─── */
(function() {
    window._runMsgSearch = function() {
        var inp = document.getElementById('msg-search-input');
        var fromInp = document.getElementById('msg-search-date-from');
        var toInp = document.getElementById('msg-search-date-to');
        var resultsEl = document.getElementById('msg-search-results');
        if (!resultsEl) return;

        var query = inp ? inp.value.trim().toLowerCase() : '';
        var fromDate = fromInp && fromInp.value ? new Date(fromInp.value + 'T00:00:00') : null;
        var toDate = toInp && toInp.value ? new Date(toInp.value + 'T23:59:59') : null;

        if (!query && !fromDate && !toDate) {
            resultsEl.innerHTML = '<div style="text-align:center;padding:24px 0;color:var(--text-secondary);font-size:13px;"><i class="fas fa-search" style="font-size:24px;opacity:0.3;display:block;margin-bottom:8px;"></i>输入关键词或选择日期范围开始搜索</div>';
            return;
        }

        if (typeof messages === 'undefined' || !messages || messages.length === 0) {
            resultsEl.innerHTML = '<div style="text-align:center;padding:20px 0;color:var(--text-secondary);font-size:13px;">暂无聊天记录</div>';
            return;
        }

        var results = messages.filter(function(msg) {
            if (msg.type === 'system') return false;
            var ts = msg.timestamp ? new Date(msg.timestamp) : null;
            if (fromDate && ts && ts < fromDate) return false;
            if (toDate && ts && ts > toDate) return false;
            if (query && msg.text) {
                return msg.text.toLowerCase().indexOf(query) !== -1;
            }
            if (query && !msg.text) return false;
            return true;
        });

        if (results.length === 0) {
            resultsEl.innerHTML = '<div style="text-align:center;padding:20px 0;color:var(--text-secondary);font-size:13px;"><i class="fas fa-inbox" style="display:block;font-size:22px;opacity:0.3;margin-bottom:8px;"></i>未找到匹配的消息</div>';
            return;
        }

        var senderName = function(msg) {
            if (msg.sender === 'user') {
                return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
            }
            return (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '对方';
        };

        var highlight = function(text, keyword) {
            if (!keyword || !text) return _escHtml(text || '');
            var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return _escHtml(text).replace(new RegExp('(' + escaped + ')', 'gi'), '<mark style="background:rgba(var(--accent-color-rgb),0.25);color:var(--text-primary);border-radius:3px;padding:0 2px;">$1</mark>');
        };

        var formatTime = function(ts) {
            if (!ts) return '';
            var d = new Date(ts);
            return d.getFullYear() + '/' +
                   String(d.getMonth()+1).padStart(2,'0') + '/' +
                   String(d.getDate()).padStart(2,'0') + ' ' +
                   String(d.getHours()).padStart(2,'0') + ':' +
                   String(d.getMinutes()).padStart(2,'0');
        };

        var html = '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;padding:0 2px;">找到 <b style=\'color:var(--accent-color)\'>' + results.length + '</b> 条结果</div>';
        html += results.slice(0, 200).map(function(msg) {
            var isMe = msg.sender === 'user';
            var previewText = msg.text
                ? (msg.text.length > 120 ? msg.text.slice(0, 120) + '…' : msg.text)
                : (msg.image ? '[图片]' : '');
            return '<div class="search-result-item" style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;border:1px solid var(--border-color);margin-bottom:6px;background:var(--primary-bg);cursor:pointer;" onclick="window._scrollToMsg && window._scrollToMsg(' + msg.id + ')">' +
                '<div style="width:28px;height:28px;border-radius:50%;background:rgba(var(--accent-color-rgb),' + (isMe ? '0.15' : '0.08') + ');display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:var(--accent-color);">' +
                    '<i class="fas fa-' + (isMe ? 'user' : 'user-circle') + '"></i>' +
                '</div>' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">' +
                        '<span style="font-size:12px;font-weight:600;color:var(--text-primary);">' + _escHtml(senderName(msg)) + '</span>' +
                        '<span style="font-size:11px;color:var(--text-secondary);flex-shrink:0;margin-left:8px;">' + formatTime(msg.timestamp) + '</span>' +
                    '</div>' +
                    '<div style="font-size:12.5px;color:var(--text-secondary);line-height:1.5;word-break:break-word;">' + highlight(previewText, query) + '</div>' +
                '</div>' +
            '</div>';
        }).join('');

        if (results.length > 200) {
            html += '<div style="text-align:center;font-size:12px;color:var(--text-secondary);padding:8px 0;">仅显示前 200 条，请缩小搜索范围</div>';
        }

        resultsEl.innerHTML = html;
    };

    function _escHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // 跳转到消息
    window._scrollToMsg = function(id) {
        var el = document.querySelector('[data-id="' + id + '"]') ||
                 document.querySelector('[data-message-id="' + id + '"]');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = 'background 0.3s ease';
            el.style.background = 'rgba(var(--accent-color-rgb),0.12)';
            setTimeout(function() { el.style.background = ''; }, 1800);
            // 关闭统计模态框
            var statsModal = document.getElementById('stats-modal');
            if (statsModal && typeof hideModal === 'function') {
                setTimeout(function() { hideModal(statsModal); }, 400);
            }
        } else {
            if (typeof showNotification === 'function')
                showNotification('该消息可能已不在当前视图中', 'info', 2000);
        }
    };
})();
