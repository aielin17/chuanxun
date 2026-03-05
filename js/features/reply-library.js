/**
 * features/reply-library.js - 回复库 Reply Library
 * 自定义回复库管理与渲染
 */

function renderReplyLibrary() {
    const list = document.getElementById('custom-replies-list');
    const searchInput = document.getElementById('reply-search-input');
    const addButton = document.getElementById('add-custom-reply');
    const subTabsContainer = document.getElementById('cr-sub-tabs');
    const titleEl = document.getElementById('cr-modal-title');

    const currentConfig = LIBRARY_CONFIG[currentMajorTab];
    titleEl.textContent = currentConfig.title;

    subTabsContainer.innerHTML = currentConfig.tabs.map(tab => `
        <button class="reply-tab-btn ${currentSubTab === tab.id ? 'active' : ''}" 
                data-id="${tab.id}" data-mode="${tab.mode}">
            ${tab.name}
        </button>
    `).join('');

    subTabsContainer.querySelectorAll('.reply-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSubTab = btn.dataset.id;
            renderReplyLibrary();
        });
    });

    list.innerHTML = '';
    list.className = 'content-list-area'; 
    
    const activeTabConfig = currentConfig.tabs.find(t => t.id === currentSubTab);
    list.classList.add(activeTabConfig.mode + '-mode');

    const filterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let itemsToRender = [];
    let renderType = 'text'; 
    if (currentMajorTab === 'reply') {
        if (currentSubTab === 'custom') {
            itemsToRender = customReplies;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增回复';
            addButton.style.display = 'flex';
        } else if (currentSubTab === 'emojis') {
            itemsToRender = CONSTANTS.REPLY_EMOJIS;
            renderType = 'emoji';
            addButton.innerHTML = '<i class="fas fa-plus"></i> 添加Emoji';
            addButton.style.display = 'flex';
        } else if (currentSubTab === 'stickers') {
            itemsToRender = stickerLibrary;
            renderType = 'image';
            addButton.innerHTML = '<i class="fas fa-plus"></i> 添加表情';
            addButton.style.display = 'flex';
        }
    } else if (currentMajorTab === 'atmosphere') {
        addButton.style.display = 'flex';
        if (currentSubTab === 'pokes') {
            itemsToRender = customPokes;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增拍一拍';
        } else if (currentSubTab === 'statuses') {
            itemsToRender = customStatuses;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增状态';
        } else if (currentSubTab === 'mottos') {
            itemsToRender = customMottos;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增格言';
        } else if (currentSubTab === 'intros') {
            itemsToRender = customIntros;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增开场语';
        }
    }

    if (itemsToRender.length === 0 && renderType !== 'emoji') {
        list.innerHTML = renderEmptyState("列表空空如也");
        return;
    }

    if (renderType === 'emoji') {
        if (itemsToRender.length === 0 && customEmojis.length === 0) {
            list.innerHTML = renderEmptyState("列表空空如也");
            return;
        }
        itemsToRender.forEach(item => {
            const div = document.createElement('div');
            div.className = 'emoji-item';
            div.textContent = item;

            list.appendChild(div);
        });
        if (customEmojis.length > 0) {
            const sep = document.createElement('div');
            sep.style.cssText = 'grid-column:1/-1;font-size:11px;color:var(--text-secondary);padding:4px 2px 2px;border-top:1px dashed var(--border-color);margin-top:4px;';
            sep.textContent = '— 自定义 —';
            list.appendChild(sep);
            customEmojis.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'emoji-item';
                div.style.position = 'relative';
                div.innerHTML = `<span style="pointer-events:none;">${item}</span><span class="emoji-custom-del" style="position:absolute;top:-4px;right:-4px;font-size:10px;background:var(--text-secondary);color:#fff;border-radius:50%;width:14px;height:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity 0.2s;">×</span>`;
                div.addEventListener('mouseenter', () => div.querySelector('.emoji-custom-del').style.opacity = '1');
                div.addEventListener('mouseleave', () => div.querySelector('.emoji-custom-del').style.opacity = '0');
                div.querySelector('.emoji-custom-del').addEventListener('click', (e) => {
                    e.stopPropagation();
                    customEmojis.splice(idx, 1);
                    throttledSaveData();
                    renderReplyLibrary();
                });
                list.appendChild(div);
            });
        }
        return;
    }

    itemsToRender.forEach((item, index) => {
        if (renderType === 'text' && filterText && !item.toLowerCase().includes(filterText)) return;
        
        if (renderType === 'image') {
            const div = document.createElement('div');
            div.className = 'sticker-item';
            div.innerHTML = `
                <img src="${item}" loading="lazy">
                <div class="sticker-delete-btn"><i class="fas fa-times"></i></div>
            `;
            div.querySelector('.sticker-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm("删除此表情？")) {
                    stickerLibrary.splice(index, 1);
                    throttledSaveData();
                    renderReplyLibrary();
                }
            });
            list.appendChild(div);
            return;
        }

        const div = document.createElement('div');
        div.className = 'custom-reply-item';
        
        let displayHTML = `<span class="custom-reply-text">${item.replace('|', '<br><small style="opacity:0.7">')}</span>`; 

        const buttonsHTML = `
                <button class="reply-action-mini edit-btn"><i class="fas fa-pen"></i></button>
                <button class="reply-action-mini delete-btn"><i class="fas fa-trash-alt"></i></button>
            `;

        div.innerHTML = `${displayHTML}<div class="custom-reply-actions">${buttonsHTML}</div>`;

        div.querySelector('.delete-btn').onclick = () => deleteItem(index);
        div.querySelector('.edit-btn').onclick = () => editItem(index, item);

        list.appendChild(div);
    });
}
function deleteItem(index) {
    if (!confirm("确定删除吗？")) return;
    
    if (currentMajorTab === 'reply' && currentSubTab === 'custom') customReplies.splice(index, 1);
    else if (currentSubTab === 'pokes') customPokes.splice(index, 1);
    else if (currentSubTab === 'statuses') customStatuses.splice(index, 1);
    else if (currentSubTab === 'mottos') customMottos.splice(index, 1);
    else if (currentSubTab === 'intros') customIntros.splice(index, 1);

    throttledSaveData();
    renderReplyLibrary();
}

function editItem(index, oldText) {
    let newText;
    if (currentSubTab === 'intros') {
        const parts = oldText.split('|');
        const l1 = prompt("修改主标题:", parts[0]);
        if(l1 === null) return;
        const l2 = prompt("修改副标题:", parts[1] || "");
        if(l2 === null) return;
        newText = `${l1}|${l2}`;
    } else {
        newText = prompt("修改内容:", oldText);
    }

    if (newText === null || newText.trim() === "") return;

    if (currentMajorTab === 'reply' && currentSubTab === 'custom') customReplies[index] = newText;
    else if (currentSubTab === 'pokes') customPokes[index] = newText;
    else if (currentSubTab === 'statuses') customStatuses[index] = newText;
    else if (currentSubTab === 'mottos') customMottos[index] = newText;
    else if (currentSubTab === 'intros') customIntros[index] = newText;

    throttledSaveData();
    renderReplyLibrary();
}
function renderEmptyState(text) {
    return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-secondary); opacity: 0.6; grid-column: 1 / -1;">
        <div style="width: 60px; height: 60px; background: var(--secondary-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: var(--shadow);">
            <i class="fas fa-search" style="font-size: 24px; color: var(--accent-color);"></i>
        </div>
        <p style="font-size:15px; font-weight: 500; text-align:center; line-height:1.5;">${text}</p>
    </div>`;
}

function initReplyLibraryListeners() {
    const entryBtn = document.getElementById('custom-replies-function');
    if (entryBtn) {
        entryBtn.addEventListener('click', () => {
            hideModal(DOMElements.advancedModal.modal);
            currentMajorTab = 'reply';
            currentSubTab = 'custom';
            document.querySelectorAll('.sidebar-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.major === 'reply');
            });
            renderReplyLibrary();
            showModal(DOMElements.customRepliesModal.modal);
        });
    }

    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentMajorTab = btn.dataset.major;

            if (currentMajorTab === 'announcement') {
                return;
            }

            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            var toolbar = document.getElementById('cr-toolbar');
            var subTabs = document.getElementById('cr-sub-tabs');
            var addBtn = document.getElementById('add-custom-reply');
            var titleEl = document.getElementById('cr-modal-title');
            if (listArea) listArea.style.display = '';
            if (annPanel) annPanel.style.display = 'none';
            if (toolbar) toolbar.style.display = '';
            if (subTabs) subTabs.style.display = '';
            if (addBtn) addBtn.style.display = '';
            if (titleEl) titleEl.textContent = '内容管理';
            
            currentSubTab = LIBRARY_CONFIG[currentMajorTab].tabs[0].id;
            
            renderReplyLibrary();
        });
    });

    const searchInput = document.getElementById('reply-search-input');
    if (searchInput) searchInput.addEventListener('input', renderReplyLibrary);
    const dedupBtn = document.getElementById('dedup-replies-btn');
    if (dedupBtn) {
        dedupBtn.addEventListener('click', () => {
            let totalRemoved = 0;

            const crDedup = deduplicateContentArray(customReplies, CONSTANTS.REPLY_MESSAGES);
            customReplies = crDedup.result;
            totalRemoved += crDedup.removedCount;

            const cpDedup = deduplicateContentArray(customPokes);
            customPokes = cpDedup.result;
            totalRemoved += cpDedup.removedCount;

            const csDedup = deduplicateContentArray(customStatuses);
            customStatuses = csDedup.result;
            totalRemoved += csDedup.removedCount;

            const cmDedup = deduplicateContentArray(customMottos);
            customMottos = cmDedup.result;
            totalRemoved += cmDedup.removedCount;

            const ciDedup = deduplicateContentArray(customIntros);
            customIntros = ciDedup.result;
            totalRemoved += ciDedup.removedCount;

            const preEmojiCount = customEmojis.length;
            customEmojis = [...new Set(customEmojis)];
            totalRemoved += (preEmojiCount - customEmojis.length);

            if (totalRemoved > 0) {
                throttledSaveData();
                renderReplyLibrary();
                showNotification(`🧹 舒适了！共为您清理了 ${totalRemoved} 条重复内容`, 'success');
            } else {
                showNotification('✨ 当前字卡库很干净，没有重复内容哦', 'info');
            }
        });
    }
    const exportBtn = document.getElementById('export-replies-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';

            const makeRow = (id, icon, label, count) => `
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 12px;border:1px solid var(--border-color);border-radius:12px;background:var(--primary-bg);font-size:13px;color:var(--text-primary);">
                    <input type="checkbox" id="${id}" checked style="accent-color:var(--accent-color);width:15px;height:15px;">
                    <i class="${icon}" style="color:var(--accent-color);width:16px;text-align:center;"></i>
                    <span>${label}${count != null ? `<span style="font-size:11px;color:var(--text-secondary);margin-left:4px;">(${count} 条)</span>` : ''}</span>
                </label>`;

            overlay.innerHTML = `
                <div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:88%;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:modalContentSlideIn 0.3s ease forwards;">
                    <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:4px;display:flex;align-items:center;gap:8px;">
                        <i class="fas fa-file-export" style="color:var(--accent-color);font-size:14px;"></i>选择导出内容
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;">选择要导出的字卡模块（表情包因体积原因已排除）</div>
                    <div style="display:flex;flex-direction:column;gap:9px;margin-bottom:20px;">
                        ${makeRow('_re_replies', 'fas fa-comment-dots', '主字卡', customReplies.length)}
                        ${makeRow('_re_pokes', 'fas fa-hand-point-right', '拍一拍', customPokes.length)}
                        ${makeRow('_re_statuses', 'fas fa-circle-dot', '对方状态', customStatuses.length)}
                        ${makeRow('_re_mottos', 'fas fa-quote-left', '顶部格言', customMottos.length)}
                        ${makeRow('_re_intros', 'fas fa-play-circle', '开场动画', customIntros.length)}
                        ${makeRow('_re_emojis', 'fas fa-smile', 'Emoji 库', customEmojis.length)}
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button id="_re_cancel" style="flex:1;padding:11px;border:1px solid var(--border-color);border-radius:12px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button>
                        <button id="_re_confirm" style="flex:2;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;justify-content:center;gap:7px;">
                            <i class="fas fa-download"></i>确认导出
                        </button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);

            function closeRe() { overlay.remove(); }
            overlay.addEventListener('click', ev => { if (ev.target === overlay) closeRe(); });
            document.getElementById('_re_cancel').onclick = closeRe;

            document.getElementById('_re_confirm').onclick = function() {
                const inclReplies  = document.getElementById('_re_replies').checked;
                const inclPokes    = document.getElementById('_re_pokes').checked;
                const inclStatuses = document.getElementById('_re_statuses').checked;
                const inclMottos   = document.getElementById('_re_mottos').checked;
                const inclIntros   = document.getElementById('_re_intros').checked;
                const inclEmojis   = document.getElementById('_re_emojis').checked;
                if (!inclReplies && !inclPokes && !inclStatuses && !inclMottos && !inclIntros && !inclEmojis) {
                    showNotification('请至少选择一项', 'error');
                    return;
                }
                closeRe();

                const libraryData = { exportDate: new Date().toISOString(), modules: [] };
                if (inclReplies)  { libraryData.customReplies = customReplies;                 libraryData.modules.push('replies'); }
                if (inclPokes)    { libraryData.customPokes = customPokes;                     libraryData.modules.push('pokes'); }
                if (inclStatuses) { libraryData.customStatuses = customStatuses;               libraryData.modules.push('statuses'); }
                if (inclMottos)   { libraryData.customMottos = customMottos;                   libraryData.modules.push('mottos'); }
                if (inclIntros)   { libraryData.customIntros = customIntros;                   libraryData.modules.push('intros'); }
                if (inclEmojis)   { libraryData.customEmojis = customEmojis;                   libraryData.modules.push('emojis'); }

                const fileName = `reply-library-${libraryData.modules.join('+')}-${new Date().toISOString().slice(0, 10)}.json`;
                const dataStr = JSON.stringify(libraryData, null, 2);
                exportDataToMobileOrPC(dataStr, fileName);
                showNotification('字卡导出成功', 'success');
            };
        });
    }

    const importBtn = document.getElementById('import-replies-btn');
    const importInput = document.getElementById('import-replies-input');
    
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            e.target.value = '';

            if (file.size > 50 * 1024 * 1024) {
                showNotification('文件过大，请检查是否是正确的字卡备份文件', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                let data;
                try {
                    data = JSON.parse(event.target.result);
                } catch (parseErr) {
                    console.error('字卡文件解析失败:', parseErr);
                    showNotification('文件解析失败，可能已损坏或格式不正确', 'error');
                    return;
                }

                const knownFields = ['customReplies','customPokes','customStatuses','customMottos','customIntros','customEmojis'];
                const hasValidField = knownFields.some(f => Array.isArray(data[f]));
                if (!hasValidField) {
                    showNotification('无效的字卡备份文件，未找到可识别的内容', 'error');
                    return;
                }

                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';

                const makeRow = (id, icon, label, count, available) => {
                    if (!available) return '';
                    return `<label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 12px;border:1px solid var(--border-color);border-radius:12px;background:var(--primary-bg);font-size:13px;color:var(--text-primary);">
                        <input type="checkbox" id="${id}" checked style="accent-color:var(--accent-color);width:15px;height:15px;">
                        <i class="${icon}" style="color:var(--accent-color);width:16px;text-align:center;"></i>
                        <span>${label}${count != null ? `<span style="font-size:11px;color:var(--text-secondary);margin-left:4px;">(${count} 条)</span>` : ''}</span>
                    </label>`;
                };

                overlay.innerHTML = `
                    <div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:88%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:modalContentSlideIn 0.3s ease forwards;max-height:90vh;overflow-y:auto;">
                        <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:4px;display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-file-import" style="color:var(--accent-color);font-size:14px;"></i>选择导入内容
                        </div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:14px;">文件中包含以下模块，勾选需要导入的部分</div>
                        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
                            ${makeRow('_ri_replies',  'fas fa-comment-dots',   '主字卡',       Array.isArray(data.customReplies)  ? data.customReplies.length  : null, Array.isArray(data.customReplies))}
                            ${makeRow('_ri_pokes',    'fas fa-hand-point-right','拍一拍',       Array.isArray(data.customPokes)    ? data.customPokes.length    : null, Array.isArray(data.customPokes))}
                            ${makeRow('_ri_statuses', 'fas fa-circle-dot',     '对方状态',     Array.isArray(data.customStatuses) ? data.customStatuses.length : null, Array.isArray(data.customStatuses))}
                            ${makeRow('_ri_mottos',   'fas fa-quote-left',     '顶部格言',     Array.isArray(data.customMottos)   ? data.customMottos.length   : null, Array.isArray(data.customMottos))}
                            ${makeRow('_ri_intros',   'fas fa-play-circle',    '开场动画',     Array.isArray(data.customIntros)   ? data.customIntros.length   : null, Array.isArray(data.customIntros))}
                            ${makeRow('_ri_emojis',   'fas fa-smile',          'Emoji 库',     Array.isArray(data.customEmojis)   ? data.customEmojis.length   : null, Array.isArray(data.customEmojis))}
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border-color);border-radius:12px;background:var(--primary-bg);margin-bottom:16px;">
                            <i class="fas fa-code-branch" style="color:var(--accent-color);font-size:13px;"></i>
                            <span style="font-size:12px;color:var(--text-primary);flex:1;">导入方式</span>
                            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);cursor:pointer;">
                                <input type="radio" name="_ri_mode" id="_ri_mode_merge" value="merge" checked style="accent-color:var(--accent-color);">追加合并
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);cursor:pointer;margin-left:8px;">
                                <input type="radio" name="_ri_mode" id="_ri_mode_overwrite" value="overwrite" style="accent-color:var(--accent-color);">覆盖替换
                            </label>
                        </div>
                        <div style="display:flex;gap:10px;">
                            <button id="_ri_cancel" style="flex:1;padding:11px;border:1px solid var(--border-color);border-radius:12px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button>
                            <button id="_ri_confirm" style="flex:2;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;justify-content:center;gap:7px;">
                                <i class="fas fa-upload"></i>确认导入
                            </button>
                        </div>
                    </div>`;
                document.body.appendChild(overlay);

                function closeRi() { overlay.remove(); }
                overlay.addEventListener('click', ev => { if (ev.target === overlay) closeRi(); });
                document.getElementById('_ri_cancel').onclick = closeRi;

                document.getElementById('_ri_confirm').onclick = function() {
                    const doReplies  = Array.isArray(data.customReplies)          && document.getElementById('_ri_replies')?.checked;
                    const doPokes    = Array.isArray(data.customPokes)             && document.getElementById('_ri_pokes')?.checked;
                    const doStatuses = Array.isArray(data.customStatuses)          && document.getElementById('_ri_statuses')?.checked;
                    const doMottos   = Array.isArray(data.customMottos)            && document.getElementById('_ri_mottos')?.checked;
                    const doIntros   = Array.isArray(data.customIntros)            && document.getElementById('_ri_intros')?.checked;
                    const doEmojis   = Array.isArray(data.customEmojis)            && document.getElementById('_ri_emojis')?.checked;
                    if (!doReplies && !doPokes && !doStatuses && !doMottos && !doIntros && !doEmojis) {
                        showNotification('请至少选择一项', 'error');
                        return;
                    }

                    const overwrite = document.getElementById('_ri_mode_overwrite').checked;
                    closeRi();

                    try {
                        let totalAdded = 0;
                        if (overwrite) {
                            if (doReplies)  { customReplies = data.customReplies;                 totalAdded += data.customReplies.length; }
                            if (doPokes)    { customPokes = data.customPokes;                     totalAdded += data.customPokes.length; }
                            if (doStatuses) { customStatuses = data.customStatuses;               totalAdded += data.customStatuses.length; }
                            if (doMottos)   { customMottos = data.customMottos;                   totalAdded += data.customMottos.length; }
                            if (doIntros)   { customIntros = data.customIntros;                   totalAdded += data.customIntros.length; }
                            if (doEmojis)   { customEmojis = data.customEmojis; }
                        } else {
                            if (doReplies) {
                                const before = customReplies.length;
                                customReplies = deduplicateContentArray([...customReplies, ...data.customReplies], CONSTANTS.REPLY_MESSAGES).result;
                                totalAdded += customReplies.length - before;
                            }
                            if (doPokes) {
                                const before = customPokes.length;
                                customPokes = deduplicateContentArray([...customPokes, ...data.customPokes]).result;
                                totalAdded += customPokes.length - before;
                            }
                            if (doStatuses) {
                                const before = customStatuses.length;
                                customStatuses = deduplicateContentArray([...customStatuses, ...data.customStatuses]).result;
                                totalAdded += customStatuses.length - before;
                            }
                            if (doMottos) {
                                const before = customMottos.length;
                                customMottos = deduplicateContentArray([...customMottos, ...data.customMottos]).result;
                                totalAdded += customMottos.length - before;
                            }
                            if (doIntros) {
                                const before = customIntros.length;
                                customIntros = deduplicateContentArray([...customIntros, ...data.customIntros]).result;
                                totalAdded += customIntros.length - before;
                            }
                            if (doEmojis)   { customEmojis = [...new Set([...customEmojis, ...data.customEmojis])]; }
                        }

                        throttledSaveData();
                        if (typeof renderReplyLibrary === 'function') renderReplyLibrary();
                        const modeLabel = overwrite ? '覆盖' : '追加';
                        showNotification(`导入成功（${modeLabel}）${totalAdded > 0 ? `，共 ${totalAdded} 条` : ''}`, 'success', 3000);
                    } catch (err) {
                        console.error('字卡导入处理失败:', err);
                        showNotification('导入过程中发生错误：' + err.message, 'error');
                    }
                };
            };
            reader.onerror = () => {
                showNotification('文件读取失败，请重试', 'error');
            };
            reader.readAsText(file, 'UTF-8');
        });
    }
    const addBtn = document.getElementById('add-custom-reply');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (currentSubTab === 'stickers') {
                document.getElementById('sticker-file-input').click();
                return;
            }

            if (currentSubTab === 'emojis') {
                const input = prompt('请输入要添加的 Emoji（支持组合表情）:');
                if (input && input.trim()) {
                    customEmojis.push(input.trim());
                    throttledSaveData();
                    renderReplyLibrary();
                    showNotification('Emoji 已添加', 'success');
                }
                return;
            }

            let input;
            if (currentSubTab === 'intros') {
                 const l1 = prompt("请输入主标题 (如: 𝑳𝒐𝒗𝒆):");
                 if(!l1) return;
                 const l2 = prompt("请输入副标题 (如: 若要由我来谈论爱的话):");
                 input = `${l1}|${l2}`;
            } else {
                 input = prompt(`请输入新的${getCategoryName(currentSubTab)}:`);
            }

if (input && input.trim()) {
                const val = input.trim();
                let isDuplicate = false;
                const valNorm = normalizeStringStrict(val);

                if (currentSubTab === 'custom' && (customReplies.some(r => normalizeStringStrict(r) === valNorm) || CONSTANTS.REPLY_MESSAGES.some(r => normalizeStringStrict(r) === valNorm))) isDuplicate = true;
                else if (currentSubTab === 'pokes' && customPokes.some(r => normalizeStringStrict(r) === valNorm)) isDuplicate = true;
                else if (currentSubTab === 'statuses' && customStatuses.some(r => normalizeStringStrict(r) === valNorm)) isDuplicate = true;
                else if (currentSubTab === 'mottos' && customMottos.some(r => normalizeStringStrict(r) === valNorm)) isDuplicate = true;
                else if (currentSubTab === 'intros' && customIntros.some(r => normalizeStringStrict(r) === valNorm)) isDuplicate = true;

                if (isDuplicate) {
                    showNotification('该内容已存在', 'warning');
                    return;
                }

                if (currentSubTab === 'custom') customReplies.unshift(val);
                else if (currentSubTab === 'pokes') customPokes.unshift(val);
                else if (currentSubTab === 'statuses') customStatuses.unshift(val);
                else if (currentSubTab === 'mottos') customMottos.unshift(val);
                else if (currentSubTab === 'intros') customIntros.unshift(val);
                
                throttledSaveData();
                renderReplyLibrary();
                showNotification('添加成功', 'success');
            }        });
    }
}
function getCategoryName(tabId) {
    const map = {
        'custom': '回复', 'pokes': '拍一拍', 'statuses': '状态', 
        'mottos': '格言', 'intros': '开场语'
    };
    return map[tabId] || '内容';
}
        function updateTabUI() {
            document.querySelectorAll('.reply-tab-btn').forEach(btn => {
                if (btn.dataset.tab === currentReplyTab) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            const searchInput = document.getElementById('reply-search-input');
            if (searchInput) searchInput.value = '';
        }


        function initRippleFeedback() {

            const rippleTargets = [
                '.input-btn',
                '.action-btn',
                '.modal-btn',
                '.settings-item',
                '.batch-action-btn',
                '.coin-btn-action',
                '.import-export-btn',
                '.reply-tab-btn',
                '.anniversary-type-btn',
                '.reply-tool-btn',
                '.session-action-btn',
                '.fav-action-btn'
            ];


            document.addEventListener('mousedown', function(e) {

                const target = e.target.closest(rippleTargets.join(','));

                if (target) {
                    createRipple(e, target);
                }
            });

            function createRipple(event, button) {

                if (!button.classList.contains('ripple-effect')) {
                    button.classList.add('ripple-effect');
                }


                const circle = document.createElement('span');
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;


                const rect = button.getBoundingClientRect();


                const clientX = event.clientX || (event.touches ? event.touches[0].clientX: 0);
                const clientY = event.clientY || (event.touches ? event.touches[0].clientY: 0);

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${clientX - rect.left - radius}px`;
                circle.style.top = `${clientY - rect.top - radius}px`;
                circle.classList.add('ripple-wave');


                const ripple = button.getElementsByClassName('ripple-wave')[0];
                if (ripple) {
                    ripple.remove();
                }


                button.appendChild(circle);


                setTimeout(() => {
                    circle.remove();
                }, 600);
            }
        }
        function applyAvatarFrame(avatarContainer, frameSettings) {
            let frameElement = avatarContainer.querySelector('.avatar-frame');
            
            if (frameSettings && frameSettings.src) {
                if (!frameElement) {
                    frameElement = document.createElement('img');
                    frameElement.className = 'avatar-frame';
                    avatarContainer.appendChild(frameElement);
                }
                frameElement.src = frameSettings.src;
                frameElement.style.width = `${frameSettings.size || 100}%`;
                frameElement.style.height = `${frameSettings.size || 100}%`;
                
                const offsetX = frameSettings.offsetX || 0;
                const offsetY = frameSettings.offsetY || 0;
                frameElement.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
            } else {
                if (frameElement) {
                    frameElement.remove();
                }
            }
        }

        function setupAvatarFrameSettings() {
            const setupControlsFor = (type) => {
                const preview = document.getElementById(`${type}-frame-preview`);
                const uploadBtn = document.getElementById(`${type}-frame-upload-btn`);
                const removeBtn = document.getElementById(`${type}-frame-remove-btn`);
                const fileInput = document.getElementById(`${type}-frame-file-input`);
                const sizeSlider = document.getElementById(`${type}-frame-size`);
                const sizeValue = document.getElementById(`${type}-frame-size-value`);
                const xSlider = document.getElementById(`${type}-frame-offset-x`);
                const xValue = document.getElementById(`${type}-frame-offset-x-value`);
                const ySlider = document.getElementById(`${type}-frame-offset-y`);
                const yValue = document.getElementById(`${type}-frame-offset-y-value`);
                
                if (!preview || !uploadBtn || !sizeSlider) return;

                const settingsKey = type === 'my' ? 'myAvatarFrame' : 'partnerAvatarFrame';
                const avatarContainer = type === 'my' ? DOMElements.me.avatarContainer : DOMElements.partner.avatarContainer;
                const avatarElement = type === 'my' ? DOMElements.me.avatar : DOMElements.partner.avatar;


const updatePreview = () => {
    let avatarContent = avatarElement.innerHTML;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = avatarContent;
    const img = tempDiv.querySelector('img');
    if (img) {
        avatarContent = `<img src="${img.src}" alt="preview">`;
    }

    const frameSettings = settings[settingsKey];

    let frameHtml = '';
    if (frameSettings && frameSettings.src) {
        const size = frameSettings.size || 100;
        const offsetX = frameSettings.offsetX || 0;
        const offsetY = frameSettings.offsetY || 0;
        
        frameHtml = `<img src="${frameSettings.src}" class="preview-frame" 
            style="width: ${size}%; height: ${size}%; transform: translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px));">`;
    }

    preview.innerHTML = `
        <div class="preview-bg-layer">
            ${avatarContent}
        </div>
        ${frameHtml}
    `;
};
                
                const updateControls = () => {
                    const frame = settings[settingsKey];
                    sizeSlider.value = frame?.size || 100;
                    sizeValue.textContent = `${sizeSlider.value}%`;
                    xSlider.value = frame?.offsetX || 0;
                    xValue.textContent = `${xSlider.value}px`;
                    ySlider.value = frame?.offsetY || 0;
                    yValue.textContent = `${ySlider.value}px`;
                    updatePreview();
                };
                
                uploadBtn.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 1024 * 1024) {
                        showNotification('头像框图片大小不能超过1MB', 'error');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (!settings[settingsKey]) {
                            settings[settingsKey] = { size: 100, offsetX: 0, offsetY: 0 };
                        }
                        settings[settingsKey].src = event.target.result;
                        applyAvatarFrame(avatarContainer, settings[settingsKey]);
                        updateControls();
                        throttledSaveData();
                    };
                    reader.readAsDataURL(file);
                });
                
                removeBtn.addEventListener('click', () => {
                    settings[settingsKey] = null;
                    applyAvatarFrame(avatarContainer, null);
                    updateControls();
                    throttledSaveData();
                });

                [sizeSlider, xSlider, ySlider].forEach(slider => {
                    slider.addEventListener('input', () => {
                        if (!settings[settingsKey]) return;
                        settings[settingsKey].size = parseInt(sizeSlider.value);
                        settings[settingsKey].offsetX = parseInt(xSlider.value);
                        settings[settingsKey].offsetY = parseInt(ySlider.value);
                        applyAvatarFrame(avatarContainer, settings[settingsKey]);
                        updateControls();
                        renderMessages(true); 
                    });
                     slider.addEventListener('change', throttledSaveData);
                });

                updateControls();
            };
            
            setupControlsFor('my');
            setupControlsFor('partner');
        }

        function applyAllAvatarFrames() {
            applyAvatarFrame(DOMElements.me.avatarContainer, settings.myAvatarFrame);
            applyAvatarFrame(DOMElements.partner.avatarContainer, settings.partnerAvatarFrame);
            applyAvatarShapeToDOM('my', settings.myAvatarShape || 'circle');
            applyAvatarShapeToDOM('partner', settings.partnerAvatarShape || 'circle');
            if (settings.avatarCornerRadius) {
                document.documentElement.style.setProperty('--avatar-corner-radius', settings.avatarCornerRadius + 'px');
            }
        }

