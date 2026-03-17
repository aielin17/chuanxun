let currentPage = 1;
const totalPages = 5;
let currentReadingData = null;

function playSound(type) {
    const sound = document.getElementById(`sound-${type}`);
    if(sound) {
        sound.currentTime = 0; 
        sound.play().catch(e => console.log("浏览器限制自动播放音效，需用户交互后生效"));
    }
}

function toggleTheme() {
    playSound('click');
    const body = document.body;
    const icon = document.getElementById("themeIcon");
    if (body.getAttribute("data-theme") === "dark") {
        body.setAttribute("data-theme", "light");
        icon.innerText = "dark_mode";
    } else {
        body.setAttribute("data-theme", "dark");
        icon.innerText = "light_mode";
    }
}

window.onload = function() {
    const grid = document.getElementById("dateGrid");
    messageData.forEach(data => {
        const card = document.createElement("div");
        card.className = "date-card";
        card.innerHTML = `
            <span class="date-badge">${data.dateText}</span>
            <span class="date-desc">${data.desc}</span>
        `;
        card.onclick = () => openReading(data.id);
        grid.appendChild(card);
    });
};

function openReading(id) {
    playSound('magic');
    currentReadingData = messageData.find(item => item.id === id);
    if(!currentReadingData) return;

    document.getElementById("loader").style.display = "block";
    
    setTimeout(() => {
        document.getElementById("albumContainer").style.display = "none";
        document.getElementById("messageContainer").style.display = "flex";
        
        renderContent();
        
        currentPage = 1;
        updateProgress();
        showPage(1);
        document.getElementById("loader").style.display = "none";
    }, 500);
}

function renderContent() {
    const data = currentReadingData;

    const zodiacGrid = document.getElementById("render-zodiacs");
    zodiacGrid.innerHTML = data.zodiacs.map(z => `
        <div class="info-item">
            ${zodiacIcons[z] || '✨'} 
            <div>${z}</div>
        </div>
    `).join('');

    const colorGrid = document.getElementById("render-colors");
    colorGrid.innerHTML = data.colors.map(c => `
        <div class="dot" style="background: ${c.hex};" onclick="showToast('成功感应能量：${c.name}'); playSound('click')"></div>
    `).join('');

    const statusList = document.getElementById("render-status");
    statusList.innerHTML = data.status.map(s => `<li>${s}</li>`).join('');

    renderCards("cardsGrid", data.publicCards, false);

    renderCards("secretCardsGrid", data.secretCards, true);
    
    document.getElementById('passwordArea').style.display = 'flex';
    document.getElementById('secretContent').style.display = 'none';
    document.getElementById('secretPwd').value = '';

    const musicList = document.getElementById("render-music");
    musicList.innerHTML = data.musics.map(m => `
        <div class="music-item">
            <span><strong>《${m.title}》</strong> - ${m.artist}</span>
            <button class="btn-action" style="padding: 5px 10px;" onclick="copyText('${m.artist} - 《${m.title}》'); playSound('click')">
                复制
            </button>
        </div>
    `).join('');
}

function renderCards(containerId, cardsArray, isSecret) {
    const container = document.getElementById(containerId);
    const shuffled = [...cardsArray].sort(() => Math.random() - 0.5);
    
    container.innerHTML = shuffled.map((text, index) => {
        const number = index + 1;
        return `
            <div class="flip-card" onclick="flipSingleCard(this)">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        ${isSecret ? `S-${number}` : number}
                    </div>
                    <div class="flip-card-back">
                        <div style="margin-bottom:-10px; color:var(--accent-pink);">❝</div>
                        <div style="flex-grow:1; display:flex; align-items:center; padding: 10px;">${text}</div>
                        <div style="margin-top:-10px; color:var(--accent-pink); transform:rotate(180deg);">❝</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
function flipSingleCard(cardElement) {
    if(!cardElement.classList.contains('flipped')) {
        playSound('flip');
    }
    cardElement.classList.toggle('flipped');
}

function revealAll(gridId) {
    playSound('magic');
    const cards = document.querySelectorAll(`#${gridId} .flip-card:not(.flipped)`);
    cards.forEach((card, index) => {
        setTimeout(() => {
            playSound('flip');
            card.classList.add('flipped');
        }, index * 150);
    });
}

function changePage(step) {
    playSound('page');
    document.getElementById(`page-${currentPage}`).classList.remove('active');
    currentPage += step;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    showPage(currentPage);
    updateProgress();
}

function showPage(pageNum) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageNum}`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    document.getElementById('progressFill').style.width = `${(currentPage / totalPages) * 100}%`;
}

function backToAlbum() {
    playSound('click');
    document.getElementById("messageContainer").style.display = "none";
    document.getElementById("albumContainer").style.display = "block";
}

function unlockSecret() {
    const inputPwd = document.getElementById("secretPwd").value;
    
    const correctPwd = currentReadingData.password; 
    
    if (inputPwd === correctPwd) {
        playSound('success');
        document.getElementById("passwordArea").style.display = "none";
        document.getElementById("secretContent").style.display = "block";
        showToast("✔ 验证成功，已解锁特供传讯");
    } else {
        playSound('click');
        showToast("✖ 密钥错误，请重试");
        document.getElementById("secretPwd").value = "";
    }
}
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✔ 已复制: ${text}`);
    }).catch(() => showToast("✖ 复制失败"));
}