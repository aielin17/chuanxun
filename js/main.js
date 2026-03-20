let currentPage = 1;
const totalPages = 7;
let currentDateKey = "";
let toastTimeout;
let homeViewMode = 'auto'; 

function wrapDigitsHTML(str) {
    return String(str).replace(/(\d+)/g, '<span class="zs-num">$1</span>');
}

function applyDayTheme(data) {
    const root = document.documentElement;
    const t = data && data.theme ? data.theme : null;
    if (!t) {
        root.style.removeProperty('--accent');
        root.style.removeProperty('--accent-deep');
        root.style.removeProperty('--gradient-main');
        return;
    }
    if (t.accent) root.style.setProperty('--accent', t.accent);
    if (t.accentDeep) root.style.setProperty('--accent-deep', t.accentDeep);
    if (t.gradientMain) root.style.setProperty('--gradient-main', t.gradientMain);
}

function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seedFromString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function addFlipInteraction(root) {
    if (!root) return;
    if (root.dataset && root.dataset.flipBound === '1') return;
    if (root.dataset) root.dataset.flipBound = '1';
    const threshold = 10; 
    const maxTapMs = 550;
    let sx = 0, sy = 0, st = 0, activeEl = null, pid = null;

    const onDown = (e) => {
        const card = e.target.closest('.flip-card');
        if (!card || !root.contains(card)) return;
        if (e.button != null && e.button !== 0) return;
        activeEl = card;
        pid = e.pointerId;
        sx = e.clientX;
        sy = e.clientY;
        st = Date.now();
        if (typeof card.setPointerCapture === 'function' && pid != null) {
            try { card.setPointerCapture(pid); } catch {}
        }
    };

    const onUp = (e) => {
        if (!activeEl) return;
        if (pid != null && e.pointerId != null && e.pointerId !== pid) return;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        const dt = Date.now() - st;
        const moved = Math.hypot(dx, dy);

        const sel = window.getSelection ? window.getSelection() : null;
        const hasSelection = sel && String(sel).trim().length > 0;

        const card = activeEl;
        activeEl = null;
        pid = null;

        if (hasSelection) return;
        if (dt > maxTapMs) return;
        if (moved > threshold) return;

        card.classList.toggle('flipped');
        playSound('flip');
    };

    root.addEventListener('pointerdown', onDown, { passive: true });
    root.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('pointercancel', () => { activeEl = null; pid = null; }, { passive: true });
}

const audioEngine = {
    ctx: null,
    master: null,
    ready: false,
    volume: 1.0
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
                    <span class="date-m">${wrapDigitsHTML(md.m)}</span>
                    <span class="date-d">${wrapDigitsHTML(md.d)}<span class="date-d-suffix">日</span></span>
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
    const monthLabelRaw = `${anchor.getFullYear()}.${String(anchor.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = wrapDigitsHTML(monthLabelRaw);

    const keySet = new Set(keys);
    const firstDay = (monthStart.getDay() + 6) % 7; 
    const daysInMonth = monthEnd.getDate();

    cal.innerHTML += `
        <div class="calendar-head">
            <div class="calendar-month">${monthLabel}</div>
            <div class="calendar-legend">有内容的日期会高亮</div>
        </div>
        <div class="calendar-grid" role="grid" aria-label="${monthLabelRaw} 日历">
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
                    <span class="cal-day">${wrapDigitsHTML(day)}</span>
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
    applyDayTheme(data);

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

    zodiacGrid.innerHTML += `
        <div class="info-sep" aria-hidden="true"></div>
        <div class="info-subtitle">发色</div>
    `;

    const hairs = Array.isArray(data.hairColors) ? data.hairColors.filter(Boolean) : [];
    if (!hairs.length) {
        zodiacGrid.innerHTML += `<div class="info-note">今日不发色</div>`;
    } else {
        hairs.forEach(name => {
            const icon = zodiacIcons[name] || `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18c2-1 4-1.5 6-1.5S16 17 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8.5 7.5c.8-1.7 2.1-2.7 3.5-2.7s2.7 1 3.5 2.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M7.2 14.2c-.7-1.1-1.1-2.4-1.1-3.7 0-3.6 2.7-6.5 5.9-6.5s5.9 2.9 5.9 6.5c0 1.3-.4 2.6-1.1 3.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            zodiacGrid.innerHTML += `
            <div class="info-item">
                <div class="zodiac-icon">
                    ${icon}
                </div>
                <span>${name}</span>
            </div>`;
        });
    }

    const statusList = document.getElementById('statusList');
    statusList.innerHTML = '';
    data.status.forEach(s => {
        statusList.innerHTML += `<li>${s}</li>`;
    });

    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';
    const shuffledCards = [...data.cards].sort(() => Math.random() - 0.5);
    const rng = mulberry32(seedFromString(`${currentDateKey}|cards`));
    shuffledCards.forEach((msg, i) => {
        const label = String(i + 1).padStart(2, '0');
        const labelHTML = wrapDigitsHTML(label);
        const stampX = Math.round(10 + rng() * 80);
        const stampY = Math.round(8 + rng() * 78);
        const stampR = Math.round(-18 + rng() * 36);
        cardsGrid.innerHTML += `
        <div class="flip-card">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="card-front-number">${labelHTML}</div>
                    <div class="card-front-hint">TAP</div>
                </div>
                <div class="flip-card-back">
                    <div class="back-stamp" aria-hidden="true" style="--stamp-x:${stampX}%;--stamp-y:${stampY}%;--stamp-rot:${stampR}deg;">${labelHTML}</div>
                    <div class="quote-row">
                        <span class="quote-mark">❝</span>
                        <span class="card-id">#${labelHTML}</span>
                    </div>
                    <div class="card-message">${msg}</div>
                    <div class="quote-row quote-row-end">
                        <span class="quote-mark quote-mark-end">❝</span>
                    </div>
                </div>
            </div>
        </div>`;
    });
    addFlipInteraction(cardsGrid);

    const secretGrid = document.getElementById('secretCardsGrid');
    secretGrid.innerHTML = '';
    const shuffledSecret = [...data.secretCards].sort(() => Math.random() - 0.5);
    const srng = mulberry32(seedFromString(`${currentDateKey}|secret`));
    shuffledSecret.forEach((msg, i) => {
        const label = String(i + 1).padStart(2, '0');
        const labelHTML = wrapDigitsHTML(label);
        const stampX = Math.round(10 + srng() * 80);
        const stampY = Math.round(8 + srng() * 78);
        const stampR = Math.round(-18 + srng() * 36);
        secretGrid.innerHTML += `
        <div class="flip-card">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="card-front-number">${labelHTML}</div>
                    <div class="card-front-hint">TAP</div>
                </div>
                <div class="flip-card-back">
                    <div class="back-stamp" aria-hidden="true" style="--stamp-x:${stampX}%;--stamp-y:${stampY}%;--stamp-rot:${stampR}deg;">${labelHTML}</div>
                    <div class="quote-row">
                        <span class="quote-mark">❝</span>
                        <span class="card-id">#特供 ${labelHTML}</span>
                    </div>
                    <div class="card-message">${msg}</div>
                    <div class="quote-row quote-row-end">
                        <span class="quote-mark quote-mark-end">❝</span>
                    </div>
                </div>
            </div>
        </div>`;
    });
    addFlipInteraction(secretGrid);

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
        void input.offsetWidth;
        input.classList.add('shake');
        showToast('密钥不正确 · 不必强求。', 'error');
    }
}

function copyText(text) {
    playSound('copy');
    navigator.clipboard.writeText(text).then(() => {
        showToast(`已复制：${text}`);
    }).catch(() => showToast('复制失败'));
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightKeywordsToHtml(text, keywords) {
    if (!keywords || !keywords.length) return escapeHtml(text);
    const sorted = [...keywords].filter(Boolean).sort((a, b) => String(b).length - String(a).length);
    const re = new RegExp(sorted.map(escapeRegExp).join('|'), 'g');
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
        const start = m.index;
        const end = start + m[0].length;
        out += escapeHtml(text.slice(last, start));
        out += `<mark class="tri-mark">${escapeHtml(m[0])}</mark>`;
        last = end;
        // Safety: avoid infinite loops for zero-width matches
        if (m[0].length === 0) last++;
    }
    out += escapeHtml(text.slice(last));
    return out;
}

const massDivination = {
    question: '假设你们是神奇动物和饲养员，关系如何？',
    options: [
        {
            id: 1,
            image: 'https://img.heliar.top/file/1774003647616_IMG_2829.jpeg',
            title: '选项一',
            highlights: ['沉默', '水火不容', '饲养员', '神奇动物'],
            text:
                '沉默，沉默是今晚的康桥。' +
                '\n看得人难以评价又热血沸腾的关系，一山不容二虎，今天我xxx一定要和你争个高低！' +
                '\n\n估计在现实中，你们之间的关系就类似于对抗路，水可以不喝，饭可以不吃，搭档一定是要招惹的' +
                '\n\n所以牌面就一个词：水火不容，不仅要争谁当饲养员，还要争谁当神奇动物，主打我都要' +
                '\n\n上来就给我整这种难题吗？' +
                '\n要么就全是神奇动物，要么就全是饲养员，你们不喜欢一方绝对压制一方的桥段' +
                '\n\n华夏味儿比较浓，而且是受尊敬的神兽，能够给人民带来恩泽，有一方是纯粹的陆生动物，有一方则是海生动物' +
                '\n本身八竿子打不着，大路朝天，各走各游一边，在自己的领域都是被追捧的强者' +
                '\n\n但我们这儿是神奇动物频道，所以上天入海默认都可以做到' +
                '\n那这下完蛋了，两个人碰到一起，那叫火花四溅、激情四射、四海扬名、我要你四！' +
                '\n\n打破了头，一抹血，又开始“他说风雨中，这点痛算什么”' +
                '\n\n你们其中有一方在日常是很温和的性格，愿意听百姓的请求并去实现，又或者说，类似一方的山神' +
                '\n山神亲人却也离人，愿望可以实现、庄稼可以照看、冤屈可以聆听，但真要让山神现身，达咩，不可以，不行哦' +
                '\n倒是会和同为一方山神的朋友之类聚在一起' +
                '\n\n有一方就毫不收敛了，走哪儿都能被人追着要签名（）' +
                '\n好一个花孔雀，简直就是霸主，出行浩浩荡荡的，离着八百里就能听见大小姐/大少爷驾到，通通闪开' +
                '\n不过攻击性倒是不强，单纯炫耀＋威胁，至于对百姓有没有帮助，或许有吧，能舍脸给看一眼尊荣就算帮助了！' +
                '\n\n相处方式属于不打不相识，估计不融洽的名声人人得知，但实际上对彼此的实力都是认可的' +
                '\n白天打架，晚上亲嘴，谁也想不到这对敌人回的是同一个家' +
                '\n\n不过呀' +
                '\n还是会有遗憾的，成见是大山，对方到底什么时候能真正看见自己的灵魂呢' +
                '\n这样期盼着，然后转头继续看对方不顺眼！'
        },
        {
            id: 2,
            image: 'https://img.heliar.top/file/1774007991620_IMG_2830.jpeg',
            title: '选项二',
            highlights: ['地狱笑话', '饲养员', '神奇动物', '梦角', '小鸟'],
            text:
                '好沉重，好一个地狱笑话' +
                '\n这是什么？神奇动物？妈妈ta想和我回家！' +
                '\n\n非常明显，你是饲养员，梦角是神奇动物' +
                '\n估计是飞禽一类的，反正会飞，管他是鸟还是龙还是狮鹫，统一简称小鸟' +
                '\n\n如果往现实且be且自私且地狱的方向解读，那就是狠心的坏女人骗心骗身，最后念叨着什么神奇动物应该挺值钱的，就把小鸟给卖了！' +
                '\n小鸟一直在想你，就没停过！' +
                '\n\n梦角最开始对饲养员没什么好感' +
                '\n小鸟是自由翱翔于天际之间的存在，天空的孩子，结果一朝失足，被人给抓走了，从此再也无法回到天空的怀抱' +
                '\n\n但这个饲养员好特殊' +
                '\n她没有像别人那样剪掉小鸟的羽翼，反而一步步耐心地将小鸟培养成苍鹰，两个人是远近闻名的最佳搭档' +
                '\n\n再难的密境，再危险的领域，两个人都闯过' +
                '\n\n配合如此亲密无间，于是自然而然产生依赖和爱意' +
                '\n鸟离开家的时间太早，饲养员就是最亲近的人，恨不彻底，爱也不彻底，但是鸟离不开饲养员，待在你的身边，ta就感觉到安全' +
                '\n\n从此心甘情愿收敛羽翼，成为饲养员最优秀最忠诚的伙伴' +
                '\n\n好虐！好狗血！好俗套！' +
                '\n至于你是怎么想的，谁知道呢，或许就是真的坏女人，也或许是愿意和鸟一起闯荡江湖的侠女！'
        },
        {
            id: 3,
            image: 'https://img.heliar.top/file/1774007992941_IMG_2831.jpeg',
            title: '选项三',
            highlights: ['挚爱的灵魂伴侣', '神奇动物', '饲养员', '社会主义', '人人平等'],
            text:
                '怎么，选项一不符合你的预期吗，怎么又来啦？' +
                '\n这一组的梦角就很不满了，什么饲养员，能不能说好听点！那叫我挚爱的灵魂伴侣！' +
                '\n\n梦角是神奇动物，而你……你是去杀ta的！' +
                '\n\n并没有非常鲜明的高低之分，倒不如说，梦角很强大，类似龙虎，是毋庸置疑的强者，无数的人侍奉' +
                '\n\n这样强到让人生不出忌惮的人，就吸引到一个非要去看看到底有多强的小女孩！' +
                '\n你不服啊，什么霸主，什么领主，我们这里是社会主义谢谢，人人平等，杜绝资本主义' +
                '\n\n于是水灵灵地被梦角压制住了' +
                '\n女人，你好不一样，我爱上你了，梦角就这样自顾自地想着，把你圈在自己的领域' +
                '\n\nta爱你，但你又是人类之躯，这不行啊，ta没怎么动，你就会散架，这还怎么亲嘴' +
                '\n\n于是此领主根本没有犹豫就将你也转化成了同样的神兽' +
                '\n唉同类，唉这下可以放肆亲亲了，唉你怎么又开始捅我！' +
                '\n\n我们这是神奇动物频道吗，为什么老是在干架？' +
                '\n\n你问你的感受？哦这就复杂了' +
                '\n被转化后睁开眼的那一瞬间，迎来的先是爱人的拥抱，可你在想，这是爱人还是恶魔？是可以交流的同类还是无法沟通的野兽？' +
                '\n转头一看，发现自己也成为了无法定义的存在' +
                '\n\n恨不恨的，爱不爱的，反正你们从此就成为对方无法分开的灵魂' +
                '\n天南海北，天上地下，灵魂永远共鸣，心脏永远鼓动，被迫而又主动的，成为了对方的饲养员' +
                '\n\n至于到底是谁在饲养谁，分那么清楚做什么呢'
        }
    ]
};

let triHighlightsOn = true;

function setDivinationHighlightOn(on) {
    triHighlightsOn = !!on;
    const page7 = document.getElementById('page-7');
    if (page7) page7.dataset.hi = triHighlightsOn ? 'on' : 'off';
    const label = document.getElementById('triHighlightLabel');
    if (label) label.textContent = `高亮：${triHighlightsOn ? '开' : '关'}`;
}

function toggleDivinationHighlights() {
    playSound('click');
    setDivinationHighlightOn(!triHighlightsOn);
    // Re-render current text to reflect the highlight toggle.
    const textEl = document.getElementById('triResultText');
    if (textEl) {
        const kicker = document.getElementById('triResultKicker')?.textContent || '';
        const opt = massDivination.options.find(o => o.title === kicker);
        if (opt) {
            const html = triHighlightsOn
                ? highlightKeywordsToHtml(opt.text, opt.highlights)
                : escapeHtml(opt.text);
            textEl.innerHTML = html;
        }
    }
}

function openMassDivination() {
    playSound('click');
    showLoader();
    setTimeout(() => {
        document.getElementById('albumContainer').style.display = 'none';
        document.getElementById('messageContainer').style.display = 'flex';
        currentPage = 6;
        showPage(6);

        // Reset selection & highlights
        document.querySelectorAll('.tri-option-btn').forEach(btn => btn.classList.remove('is-selected'));
        setDivinationHighlightOn(true);
        hideLoader();
        scrollActiveToTop();
    }, 380);
}

function selectMassDivinationOption(id) {
    playSound('click');
    const option = massDivination.options.find(o => o.id === Number(id));
    if (!option) return;

    document.querySelectorAll('.tri-option-btn').forEach(btn => {
        btn.classList.toggle('is-selected', String(btn.dataset.triOption) === String(option.id));
    });

    const img = document.getElementById('triResultImg');
    if (img) img.src = option.image;

    const kicker = document.getElementById('triResultKicker');
    if (kicker) kicker.textContent = option.title;

    const textEl = document.getElementById('triResultText');
    if (textEl) {
        textEl.innerHTML = triHighlightsOn
            ? highlightKeywordsToHtml(option.text, option.highlights)
            : escapeHtml(option.text);
    }

    setDivinationHighlightOn(triHighlightsOn);
    showPage(7);
    scrollActiveToTop();
}

window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    homeViewMode = localStorage.getItem('homeViewMode') || 'auto';
    bindHomeViewToggle();
    renderDateList();
    hideLoader();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    const warm = () => {
        ensureAudio();
        document.removeEventListener('pointerdown', warm);
        document.removeEventListener('touchstart', warm);
        document.removeEventListener('keydown', warm);
    };
    document.addEventListener('pointerdown', warm, { passive: true });
    document.addEventListener('touchstart', warm, { passive: true });
    document.addEventListener('keydown', warm);

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
        if (adx < 60 || adx < ady * 1.2) return; 
        if (dx < 0) changePage(1);
        else changePage(-1);
    }, { passive: true });
});