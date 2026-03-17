let currentPage = 1;
const totalPages = 5;
let currentDateKey = "";
let toastTimeout;

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

function renderDateList() {
    const grid = document.getElementById('dateGrid');
    grid.innerHTML = '';
    Object.keys(dayData).forEach(key => {
        const item = dayData[key];
        grid.innerHTML += `
        <div class="date-card" data-date="${key}">
            <span class="date-badge">${item.title}</span>
            <span class="date-desc">${item.desc}</span>
        </div>`;
    });
    bindDateCards();
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
        const path = zodiacIcons[name] || '';
        zodiacGrid.innerHTML += `
        <div class="info-item">
            <div class="zodiac-icon">
                <svg viewBox="0 0 24 24"><path d="${path}"></path></svg>
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
        cardsGrid.innerHTML += `
        <div class="flip-card" onclick="this.classList.toggle('flipped');playSound('flip')">
            <div class="flip-card-inner">
                <div class="flip-card-front">${i + 1}</div>
                <div class="flip-card-back">
                    <div class="quote-mark">❝</div>
                    <div>${msg}</div>
                    <div class="quote-mark" style="transform:rotate(180deg)">❝</div>
                </div>
            </div>
        </div>`;
    });

    const secretGrid = document.getElementById('secretCardsGrid');
    secretGrid.innerHTML = '';
    const shuffledSecret = [...data.secretCards].sort(() => Math.random() - 0.5);
    shuffledSecret.forEach((msg, i) => {
        secretGrid.innerHTML += `
        <div class="flip-card" onclick="this.classList.toggle('flipped');playSound('flip')">
            <div class="flip-card-inner">
                <div class="flip-card-front">S${i + 1}</div>
                <div class="flip-card-back">
                    <div class="quote-mark">❝</div>
                    <div>${msg}</div>
                    <div class="quote-mark" style="transform:rotate(180deg)">❝</div>
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
    renderDateList();
    hideLoader();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});