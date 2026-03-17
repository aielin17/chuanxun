let currentPage = 1;
const totalPages = 5;
let currentDateKey = "";
let toastTimeout;
let homeViewMode = 'auto'; // 'grid' | 'calendar' | 'auto'

const sounds = {
    click: new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmImBze5u+wVRwASe7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="),
    flip: new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhX1qiV1gf4+cpUgcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmImBze5u+wVRwASe7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="),
    page: new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmImBze5u+wVRwASe7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="),
    unlock: new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhX1qiV1gf4+cpUgcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmImBze5u+wVRwASe7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="),
    copy: new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmImBze5u+wVRwASe7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
};

function playSound(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].volume = 0.3;
        sounds[name].play().catch(() => {});
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

function formatMD(dateKey) {
    // dateKey: YYYY-MM-DD
    const d = new Date(dateKey + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return dateKey;
    return `${d.getMonth() + 1}/${d.getDate()}`;
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
    const letters = String(text || '').replace(/\s+/g, '');
    if (!letters) return '';
    const items = letters.split('').slice(0, 10).map((ch, i) => {
        const r1 = (i * 37) % 100;
        const r2 = (i * 61) % 100;
        const rot = ((i * 19) % 21) - 10;
        const opa = 0.08 + ((i * 7) % 10) / 100;
        return `<span style="--x:${r1}%;--y:${r2}%;--r:${rot}deg;--o:${opa}">${ch}</span>`;
    }).join('');
    return `<div class="letter-swarm" aria-hidden="true">${items}</div>`;
}

function renderGridHome(keys) {
    const grid = document.getElementById('dateGrid');
    const cal = document.getElementById('calendarView');
    grid.style.display = 'grid';
    cal.style.display = 'none';
    grid.innerHTML = '';

    keys.forEach(key => {
        const item = dayData[key];
        const md = formatMD(key);
        const swarm = buildLetterSwarm('LETTER');
        grid.innerHTML += `
        <div class="date-card" data-date="${key}">
            ${swarm}
            <div class="date-card-main">
                <span class="date-badge">${md}</span>
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    <div class="card-front-hint">轻触翻开</div>
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
                    <div class="card-front-hint">轻触翻开</div>
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
            <button class="copy-btn" onclick="copyText('${txt}')"></button>
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), 2000);
}

function revealAll(gridId) {
    playSound('flip');
    const list = document.querySelectorAll(`#${gridId} .flip-card:not(.flipped)`);
    list.forEach((el, i) => {
        setTimeout(() => el.classList.add('flipped'), i * 100);
    });
    showToast('已全部翻开');
}

function unlockSecret() {
    const data = dayData[currentDateKey];
    const val = document.getElementById('secretPwd').value.trim();
    if (val === data.secretPwd) {
        playSound('unlock');
        document.getElementById('passwordArea').style.display = 'none';
        document.getElementById('secretContent').style.display = 'block';
        showToast('解锁成功');
    } else {
        showToast('密码错误');
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
    homeViewMode = localStorage.getItem('homeViewMode') || 'auto';
    bindHomeViewToggle();
    renderDateList();
    hideLoader();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // 减少移动端双击/连点缩放与延迟
    document.body.style.touchAction = 'manipulation';
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    }, { passive: false });
});