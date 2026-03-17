let currentPage = 1;
const totalPages = 5;
let currentDateKey = "";
let toastTimeout;
let homeViewMode = 'auto'; // 'grid' | 'calendar' | 'auto'
const fontScales = [
    { key: 's', label: '小', scale: 0.94 },
    { key: 'm', label: '中', scale: 1.00 },
    { key: 'l', label: '大', scale: 1.10 }
];

const audioEngine = {
    ctx: null,
    master: null,
    ready: false,
    volume: 0.4
};

function ensureAudio() {
    if (audioEngine.ready) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
        audioEngine.ctx = new AC();
        audioEngine.master = audioEngine.ctx.createGain();
        audioEngine.master.gain.value = audioEngine.volume;
        audioEngine.master.connect(audioEngine.ctx.destination);
        audioEngine.ready = true;
        return true;
    } catch {
        return false;
    }
}

function beep({ freq = 440, dur = 0.06, type = 'sine', gain = 0.18, sweepTo = null } = {}) {
    if (!ensureAudio()) return;
    const ctx = audioEngine.ctx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), t0 + Math.max(0.02, dur));

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g);
    g.connect(audioEngine.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
}

function noiseBurst({ dur = 0.08, gain = 0.08, hp = 800, lp = 6800 } = {}) {
    if (!ensureAudio()) return;
    const ctx = audioEngine.ctx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t0 = ctx.currentTime;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.2);

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const hpF = ctx.createBiquadFilter();
    hpF.type = 'highpass';
    hpF.frequency.setValueAtTime(hp, t0);

    const lpF = ctx.createBiquadFilter();
    lpF.type = 'lowpass';
    lpF.frequency.setValueAtTime(lp, t0);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.02, dur));

    src.connect(hpF);
    hpF.connect(lpF);
    lpF.connect(g);
    g.connect(audioEngine.master);
    src.start(t0);
    src.stop(t0 + dur + 0.01);
}

function playSound(name) {
    switch (name) {
        case 'click':
            beep({ freq: 560, dur: 0.038, type: 'triangle', gain: 0.10, sweepTo: 520 });
            setTimeout(() => beep({ freq: 920, dur: 0.020, type: 'sine', gain: 0.03, sweepTo: 860 }), 18);
            break;
        case 'page':
            noiseBurst({ dur: 0.08, gain: 0.05, hp: 700, lp: 5200 });
            beep({ freq: 360, dur: 0.06, type: 'sine', gain: 0.10, sweepTo: 520 });
            setTimeout(() => beep({ freq: 520, dur: 0.05, type: 'sine', gain: 0.07, sweepTo: 660 }), 70);
            break;
        case 'flip':
            noiseBurst({ dur: 0.06, gain: 0.06, hp: 900, lp: 7200 });
            beep({ freq: 240, dur: 0.07, type: 'square', gain: 0.06, sweepTo: 170 });
            setTimeout(() => beep({ freq: 760, dur: 0.028, type: 'triangle', gain: 0.05, sweepTo: 620 }), 55);
            break;
        case 'unlock':
            beep({ freq: 660, dur: 0.08, type: 'sine', gain: 0.10, sweepTo: 880 });
            setTimeout(() => beep({ freq: 990, dur: 0.08, type: 'sine', gain: 0.09, sweepTo: 1180 }), 90);
            setTimeout(() => beep({ freq: 1320, dur: 0.07, type: 'triangle', gain: 0.06, sweepTo: 1480 }), 190);
            break;
        case 'error':
            beep({ freq: 220, dur: 0.10, type: 'sawtooth', gain: 0.08, sweepTo: 140 });
            setTimeout(() => beep({ freq: 160, dur: 0.08, type: 'sawtooth', gain: 0.06, sweepTo: 120 }), 90);
            break;
        case 'copy':
            beep({ freq: 740, dur: 0.04, type: 'triangle', gain: 0.09, sweepTo: 920 });
            setTimeout(() => beep({ freq: 1040, dur: 0.03, type: 'triangle', gain: 0.05, sweepTo: 1180 }), 45);
            break;
        default:
            beep({ freq: 440, dur: 0.05, type: 'sine', gain: 0.08 });
    }
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function initTheme() {
    const hour = new Date().getHours();
    const isDark = hour >= 19 || hour < 6;
    const saved = localStorage.getItem('theme');
    const theme = saved || (isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
}

function getFontScaleKey() {
    const saved = localStorage.getItem('fontScale');
    if (saved === 's' || saved === 'm' || saved === 'l') return saved;
    return 'm';
}

function applyFontScale(key) {
    const item = fontScales.find(x => x.key === key) || fontScales[1];
    document.documentElement.style.setProperty('--font-scale', String(item.scale));
    localStorage.setItem('fontScale', item.key);
    const btn = document.getElementById('fontToggle');
    if (btn) btn.setAttribute('aria-label', `字号：${item.label}`);
}

function cycleFontScale() {
    const cur = getFontScaleKey();
    const idx = fontScales.findIndex(x => x.key === cur);
    const next = fontScales[(Math.max(0, idx) + 1) % fontScales.length].key;
    applyFontScale(next);
    playSound('click');
    showToast(`字号：${fontScales.find(x => x.key === next)?.label || '中'}`, 'success');
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    playSound('click');
}

function scrollActiveToTop() {
    const album = document.getElementById('albumContainer');
    const msg = document.getElementById('messageContainer');
    const msgVisible = !!(msg && window.getComputedStyle(msg).display !== 'none');
    const el = msgVisible ? msg : album;
    if (!el) return;
    if (typeof el.scrollTo === 'function') el.scrollTo({ top: 0, behavior: 'smooth' });
    else el.scrollTop = 0;
}

function formatMD(dateKey) {
    // dateKey: YYYY-MM-DD
    const d = new Date(dateKey + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return dateKey;
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatMDParts(dateKey) {
    const d = new Date(dateKey + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return { m: '', d: dateKey };
    return { m: `${d.getMonth() + 1}月`, d: String(d.getDate()) };
}

function getHomeMode() {
    const keys = Object.keys(dayData);
    const saved = localStorage.getItem('homeViewMode');
    if (saved === 'grid' || saved === 'calendar') return saved;
    // auto: 少量用列表，多了进入日历态
    return keys.length > 8 ? 'calendar' : 'grid';
}

function setHomeMode(mode) {
    homeViewMode = mode;
    localStorage.setItem('homeViewMode', mode);
    renderDateList();
}

function bindHomeViewToggle() {
    const gridBtn = document.getElementById('viewGridBtn');
    const calBtn = document.getElementById('viewCalendarBtn');
    if (!gridBtn || !calBtn) return;

    const apply = (mode) => {
        gridBtn.classList.toggle('active', mode === 'grid');
        calBtn.classList.toggle('active', mode === 'calendar');
        gridBtn.setAttribute('aria-pressed', String(mode === 'grid'));
        calBtn.setAttribute('aria-pressed', String(mode === 'calendar'));
    };

    gridBtn.addEventListener('click', () => { playSound('click'); apply('grid'); setHomeMode('grid'); });
    calBtn.addEventListener('click', () => { playSound('click'); apply('calendar'); setHomeMode('calendar'); });

    apply(getHomeMode());
}

function buildLetterSwarm(text) {
    // 主页卡片背后的字母装饰已移除（更冷淡的杂志风）
    return '';
}

function renderGridHome(keys) {
    const grid = document.getElementById('dateGrid');
    const cal = document.getElementById('calendarView');
    grid.style.display = 'grid';
    cal.style.display = 'none';
    grid.innerHTML = '';

    keys.forEach(key => {
        const item = dayData[key];
        const md = formatMDParts(key);
        grid.innerHTML += `
        <div class="date-card" data-date="${key}">
            <div class="date-card-main">
                <span class="date-badge">
                    <span class="date-m">${md.m}</span>
                    <span class="date-d">${md.d}<span class="date-d-suffix">日</span></span>
                </span>
                <span class="date-desc">${item.desc || ''}</span>
            </div>
        </div>`;
    });
    bindDateCards();
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function renderCalendarHome(keys) {
    const grid = document.getElementById('dateGrid');
    const cal = document.getElementById('calendarView');
    grid.style.display = 'none';
    cal.style.display = 'block';
    cal.innerHTML = '';

    const dates = keys.map(k => new Date(k + 'T00:00:00')).filter(d => !Number.isNaN(d.getTime()));
    const anchor = dates.length ? dates.sort((a,b)=>a-b)[dates.length - 1] : new Date();
    const monthStart = startOfMonth(anchor);
    const monthEnd = endOfMonth(anchor);
    const monthLabel = `${anchor.getFullYear()}.${String(anchor.getMonth() + 1).padStart(2, '0')}`;

    const keySet = new Set(keys);
    const firstDay = (monthStart.getDay() + 6) % 7; // Monday=0
    const daysInMonth = monthEnd.getDate();

    cal.innerHTML += `
        <div class="calendar-head">
            <div class="calendar-month">${monthLabel}</div>
            <div class="calendar-legend">有内容的日期会高亮</div>
        </div>
        <div class="calendar-grid" role="grid" aria-label="${monthLabel} 日历">
            ${['一','二','三','四','五','六','日'].map(w=>`<div class="cal-dow" role="columnheader">${w}</div>`).join('')}
            ${Array.from({length: firstDay}).map(()=>`<div class="cal-cell is-empty" role="gridcell" aria-disabled="true"></div>`).join('')}
            ${Array.from({length: daysInMonth}).map((_, i) => {
                const day = i + 1;
                const k = `${anchor.getFullYear()}-${String(anchor.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const has = keySet.has(k);
                const md = `${anchor.getMonth()+1}/${day}`;
                const label = has ? (dayData[k]?.desc || '有内容') : '无内容';
                return `
                <button class="cal-cell ${has ? 'has-data' : ''}" type="button" ${has ? `data-date="${k}"` : 'disabled'} role="gridcell" aria-label="${md}，${label}">
                    <span class="cal-day">${day}</span>
                </button>`;
            }).join('')}
        </div>
    `;

    cal.querySelectorAll('.cal-cell.has-data').forEach(btn => {
        btn.addEventListener('click', function() {
            playSound('click');
            showLoader();
            currentDateKey = this.getAttribute('data-date');
            setTimeout(() => {
                document.getElementById('albumContainer').style.display = 'none';
                document.getElementById('messageContainer').style.display = 'flex';
                renderCurrentDayData();
                currentPage = 1;
                showPage(1);
                hideLoader();
                scrollActiveToTop();
            }, 500);
        });
    });
}

function renderDateList() {
    const keys = Object.keys(dayData).sort((a, b) => a.localeCompare(b));
    const mode = homeViewMode === 'auto' ? getHomeMode() : homeViewMode;
    if (mode === 'calendar') renderCalendarHome(keys);
    else renderGridHome(keys);
}

function bindDateCards() {
    document.querySelectorAll('.date-card').forEach(card => {
        card.addEventListener('click', function() {
            playSound('click');
            showLoader();
            currentDateKey = this.getAttribute('data-date');
            setTimeout(() => {
                document.getElementById('albumContainer').style.display = 'none';
                document.getElementById('messageContainer').style.display = 'flex';
                renderCurrentDayData();
                currentPage = 1;
                showPage(1);
                hideLoader();
                scrollActiveToTop();
            }, 500);
        });
    });
}

function renderCurrentDayData() {
    const data = dayData[currentDateKey];
    if (!data) return;

    const zodiacGrid = document.getElementById('zodiacGrid');
    zodiacGrid.innerHTML = '';
    data.zodiac.forEach(name => {
        const icon = zodiacIcons[name] || `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
        zodiacGrid.innerHTML += `
        <div class="info-item">
            <div class="zodiac-icon">
                ${icon}
            </div>
            <span>${name}</span>
        </div>`;
    });

    const statusList = document.getElementById('statusList');
    statusList.innerHTML = '';
    data.status.forEach(s => {
        statusList.innerHTML += `<li>${s}</li>`;
    });

    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';
    const shuffledCards = [...data.cards].sort(() => Math.random() - 0.5);
    shuffledCards.forEach((msg, i) => {
        const label = String(i + 1).padStart(2, '0');
        cardsGrid.innerHTML += `
        <div class="flip-card" onclick="this.classList.toggle('flipped');playSound('flip')">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="card-front-number">${label}</div>
                </div>
                <div class="flip-card-back">
                    <div class="quote-row">
                        <span class="quote-mark">❝</span>
                        <span class="card-id">#${label}</span>
                    </div>
                    <div class="card-message">${msg}</div>
                    <div class="quote-row quote-row-end">
                        <span class="quote-mark quote-mark-end">❝</span>
                    </div>
                </div>
            </div>
        </div>`;
    });

    const secretGrid = document.getElementById('secretCardsGrid');
    secretGrid.innerHTML = '';
    const shuffledSecret = [...data.secretCards].sort(() => Math.random() - 0.5);
    shuffledSecret.forEach((msg, i) => {
        const label = `S${String(i + 1).padStart(2, '0')}`;
        secretGrid.innerHTML += `
        <div class="flip-card" onclick="this.classList.toggle('flipped');playSound('flip')">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="card-front-number">${label}</div>
                </div>
                <div class="flip-card-back">
                    <div class="quote-row">
                        <span class="quote-mark">❝</span>
                        <span class="card-id">#${label}</span>
                    </div>
                    <div class="card-message">${msg}</div>
                    <div class="quote-row quote-row-end">
                        <span class="quote-mark quote-mark-end">❝</span>
                    </div>
                </div>
            </div>
        </div>`;
    });

    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '';
    data.musics.forEach(m => {
        const txt = `${m.artist}《${m.title}》`;
        musicList.innerHTML += `
        <div class="music-item">
            <div style="display:flex;align-items:center;gap:15px;">
                <div class="music-icon">
                    <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
                </div>
                <span>${m.artist} - <strong>${m.title}</strong></span>
            </div>
            <button class="copy-btn" onclick="copyText('${txt}')" aria-label="复制歌曲信息">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H6c-1.1 0-2 .9-2 2v12h2V3h10V1zm3 4H10c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H10V7h9v14z"></path></svg>
            </button>
        </div>`;
    });
}

function backToAlbum() {
    playSound('click');
    showLoader();
    setTimeout(() => {
        document.getElementById('messageContainer').style.display = 'none';
        document.getElementById('albumContainer').style.display = 'block';
        hideLoader();
        scrollActiveToTop();
    }, 300);
}

function showPage(n) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${n}`).classList.add('active');
    currentPage = n;
    const w = (n / totalPages) * 100;
    document.getElementById('progressFill').style.width = w + '%';
}

function changePage(step) {
    playSound('page');
    const next = currentPage + step;
    if (next < 1 || next > totalPages) return;
    showPage(next);
    scrollActiveToTop();
}

function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.dataset.type = type;
    t.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), type === 'error' ? 2600 : 2000);
}

function revealAll(gridId) {
    const cards = Array.from(document.querySelectorAll(`#${gridId} .flip-card`));
    if (!cards.length) return;
    const allFlipped = cards.every(el => el.classList.contains('flipped'));
    playSound('flip');
    cards.forEach((el, i) => {
        setTimeout(() => el.classList.toggle('flipped', !allFlipped), i * 70);
    });
    showToast(allFlipped ? '已全部合上' : '已全部展开', 'success');
}

function unlockSecret() {
    const data = dayData[currentDateKey];
    const val = document.getElementById('secretPwd').value.trim();
    if (val === data.secretPwd) {
        playSound('unlock');
        document.getElementById('passwordArea').style.display = 'none';
        document.getElementById('secretContent').style.display = 'block';
        showToast('已解锁 · 特供已开启', 'success');
    } else {
        playSound('error');
        const input = document.getElementById('secretPwd');
        input.classList.remove('shake');
        // 触发 reflow 以重复动画
        void input.offsetWidth;
        input.classList.add('shake');
        showToast('密钥不正确。不必强求。', 'error');
    }
}

function copyText(text) {
    playSound('copy');
    navigator.clipboard.writeText(text).then(() => {
        showToast(`已复制：${text}`);
    }).catch(() => showToast('复制失败'));
}

window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    applyFontScale(getFontScaleKey());
    homeViewMode = localStorage.getItem('homeViewMode') || 'auto';
    bindHomeViewToggle();
    renderDateList();
    hideLoader();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    const fontBtn = document.getElementById('fontToggle');
    if (fontBtn) fontBtn.addEventListener('click', cycleFontScale);

    // 首次用户手势后预热音频（避免 iOS/部分浏览器自动播放限制）
    const warm = () => {
        ensureAudio();
        document.removeEventListener('pointerdown', warm);
        document.removeEventListener('touchstart', warm);
        document.removeEventListener('keydown', warm);
    };
    document.addEventListener('pointerdown', warm, { passive: true });
    document.addEventListener('touchstart', warm, { passive: true });
    document.addEventListener('keydown', warm);

    // 左右滑动翻页（不阻塞竖向滚动）
    const wrap = document.getElementById('messageContainer');
    let sx = 0, sy = 0, st = 0, tracking = false;
    wrap.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const t = e.touches[0];
        sx = t.clientX; sy = t.clientY; st = Date.now();
        tracking = true;
    }, { passive: true });
    wrap.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;
        const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
        if (!t) return;
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        const dt = Date.now() - st;
        const adx = Math.abs(dx), ady = Math.abs(dy);
        if (dt > 700) return;
        if (adx < 60 || adx < ady * 1.2) return; // 更偏横向才触发
        if (dx < 0) changePage(1);
        else changePage(-1);
    }, { passive: true });
});