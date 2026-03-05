/**
 * features/reply-library.js - 回复库 Reply Library
 * 自定义回复库管理与渲染 — 重构版（含分组、批量管理、新导入导出UI）
 */

// ─── 分组数据（全局，随customReplies等一起存储）───
// customReplyGroups: Array<{ id, name, color, disabled, items: string[] }>
// replyGroupsEnabled: bool — 总开关

if (typeof customReplyGroups === 'undefined') window.customReplyGroups = [];
if (typeof replyGroupsEnabled === 'undefined') window.replyGroupsEnabled = false;

// ─── 批量选择状态 ───
let _batchSelectedIndices = new Set();
let _batchModeActive = false;

// ─── 分组颜色预设 ───
const GROUP_COLORS = [
    '#e87461','#f5a623','#f8d347','#6ac97f',
    '#5db8f5','#9b7fe8','#f06292','#80cbc4'
];

// ────────────────────────────────────────────────
//  主渲染入口
// ────────────────────────────────────────────────
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
            _batchModeActive = false;
            _batchSelectedIndices.clear();
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

    // ── 批量操作工具栏（仅主字卡显示）──
    _renderBatchToolbar(currentMajorTab === 'reply' && currentSubTab === 'custom');

    if (itemsToRender.length === 0 && renderType !== 'emoji') {
        list.innerHTML = renderEmptyState('列表空空如也');
        return;
    }

    if (renderType === 'emoji') {
        _renderEmojiTab(list, itemsToRender);
        return;
    }

    if (renderType === 'image') {
        _renderStickerTab(list, itemsToRender);
        return;
    }

    // ── 主字卡：支持分组视图 ──
    if (currentMajorTab === 'reply' && currentSubTab === 'custom') {
        _renderCustomRepliesWithGroups(list, itemsToRender, filterText);
    } else {
        _renderPlainList(list, itemsToRender, filterText);
    }
}

// ────────────────────────────────────────────────
//  批量操作工具栏
// ────────────────────────────────────────────────
function _renderBatchToolbar(show) {
    let toolbar = document.getElementById('batch-ops-toolbar');
    if (!show) {
        if (toolbar) toolbar.style.display = 'none';
        return;
    }

    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'batch-ops-toolbar';
        toolbar.style.cssText = `
            display:flex;align-items:center;gap:8px;padding:8px 0 12px;
            flex-wrap:wrap;border-bottom:1px solid var(--border-color);
            margin-bottom:10px;
        `;
        const listEl = document.getElementById('custom-replies-list');
        listEl.parentNode.insertBefore(toolbar, listEl);
    }
    toolbar.style.display = 'flex';

    const totalItems = customReplies.length;
    const selectedCount = _batchSelectedIndices.size;

    toolbar.innerHTML = `
        <button id="batch-toggle-btn" style="
            padding:5px 12px;border-radius:20px;border:1px solid var(--border-color);
            background:${_batchModeActive ? 'var(--accent-color)' : 'var(--primary-bg)'};
            color:${_batchModeActive ? '#fff' : 'var(--text-secondary)'};
            font-size:12px;cursor:pointer;font-family:var(--font-family);
            display:flex;align-items:center;gap:5px;transition:all 0.2s;
        ">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor"/>
                <rect x="7" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.6"/>
                <rect x="1" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.6"/>
                <rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.4"/>
            </svg>
            ${_batchModeActive ? `已选 ${selectedCount}/${totalItems}` : '批量管理'}
        </button>
        ${_batchModeActive ? `
            <button id="batch-select-all-btn" style="
                padding:5px 10px;border-radius:20px;border:1px solid var(--border-color);
                background:var(--primary-bg);color:var(--text-secondary);
                font-size:12px;cursor:pointer;font-family:var(--font-family);
            ">${selectedCount === totalItems ? '取消全选' : '全选'}</button>
            <div style="flex:1;"></div>
            <button id="batch-group-btn" title="批量分组" style="
                padding:5px 10px;border-radius:20px;border:1px solid var(--border-color);
                background:var(--primary-bg);color:var(--text-primary);
                font-size:12px;cursor:pointer;font-family:var(--font-family);
                display:flex;align-items:center;gap:4px;
                ${selectedCount === 0 ? 'opacity:0.4;pointer-events:none;' : ''}
            ">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1 2.5C1 1.67 1.67 1 2.5 1h2c.36 0 .7.13.96.36L6.5 2.5H9c.83 0 1.5.67 1.5 1.5V8c0 .83-.67 1.5-1.5 1.5H2C1.17 9.5 1 8.83 1 8V2.5z" stroke="currentColor" stroke-width="1" fill="none"/>
                </svg>
                分组
            </button>
            <button id="batch-disable-btn" title="批量屏蔽" style="
                padding:5px 10px;border-radius:20px;border:1px solid var(--border-color);
                background:var(--primary-bg);color:var(--text-primary);
                font-size:12px;cursor:pointer;font-family:var(--font-family);
                display:flex;align-items:center;gap:4px;
                ${selectedCount === 0 ? 'opacity:0.4;pointer-events:none;' : ''}
            ">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1"/>
                    <line x1="2.5" y1="2.5" x2="8.5" y2="8.5" stroke="currentColor" stroke-width="1"/>
                </svg>
                屏蔽
            </button>
            <button id="batch-delete-btn" title="批量删除" style="
                padding:5px 10px;border-radius:20px;border:1px solid rgba(255,80,80,0.3);
                background:rgba(255,80,80,0.06);color:#e05050;
                font-size:12px;cursor:pointer;font-family:var(--font-family);
                display:flex;align-items:center;gap:4px;
                ${selectedCount === 0 ? 'opacity:0.4;pointer-events:none;' : ''}
            ">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <polyline points="2,3 9,3" stroke="currentColor" stroke-width="1"/>
                    <path d="M4 3V2h3v1M3.5 3l.5 6h3.5l.5-6" stroke="currentColor" stroke-width="1" fill="none"/>
                </svg>
                删除
            </button>
        ` : ''}
    `;

    document.getElementById('batch-toggle-btn').onclick = () => {
        _batchModeActive = !_batchModeActive;
        _batchSelectedIndices.clear();
        renderReplyLibrary();
    };

    if (_batchModeActive) {
        document.getElementById('batch-select-all-btn').onclick = () => {
            if (_batchSelectedIndices.size === totalItems) {
                _batchSelectedIndices.clear();
            } else {
                customReplies.forEach((_, i) => _batchSelectedIndices.add(i));
            }
            renderReplyLibrary();
        };

        document.getElementById('batch-group-btn').onclick = () => {
            if (_batchSelectedIndices.size === 0) return;
            _showBatchGroupPicker();
        };

        document.getElementById('batch-disable-btn').onclick = () => {
            if (_batchSelectedIndices.size === 0) return;
            _batchToggleDisable();
        };

        document.getElementById('batch-delete-btn').onclick = () => {
            if (_batchSelectedIndices.size === 0) return;
            if (!confirm(`确定删除选中的 ${_batchSelectedIndices.size} 条？`)) return;
            const indices = [..._batchSelectedIndices].sort((a, b) => b - a);
            indices.forEach(i => customReplies.splice(i, 1));
            // 同步删除分组引用
            if (customReplyGroups) {
                customReplyGroups.forEach(g => {
                    indices.forEach(i => {
                        const item = customReplies[i]; // already deleted, use stored
                    });
                });
            }
            _batchSelectedIndices.clear();
            throttledSaveData();
            renderReplyLibrary();
            showNotification(`已删除 ${indices.length} 条`, 'success');
        };
    }
}

// ────────────────────────────────────────────────
//  分组面板渲染（在主字卡上方）
// ────────────────────────────────────────────────
function _renderCustomRepliesWithGroups(list, items, filterText) {
    // 获取已屏蔽项目集合
    const disabledSet = _getDisabledItemsSet();

    if (!customReplyGroups || customReplyGroups.length === 0) {
        // 无分组时的默认列表
        _renderPlainList(list, items, filterText, disabledSet);
        return;
    }

    // 先渲染各分组
    const inGroupItems = new Set();
    customReplyGroups.forEach(group => {
        const groupItems = (group.items || [])
            .map(itemText => ({ text: itemText, idx: items.indexOf(itemText) }))
            .filter(x => x.idx >= 0);
        groupItems.forEach(x => inGroupItems.add(x.idx));

        const filteredGroupItems = filterText
            ? groupItems.filter(x => x.text.toLowerCase().includes(filterText))
            : groupItems;

        _renderGroupSection(list, group, filteredGroupItems, disabledSet);
    });

    // 未分组项目
    const ungroupedItems = items
        .map((text, idx) => ({ text, idx }))
        .filter(x => !inGroupItems.has(x.idx));

    if (ungroupedItems.length > 0) {
        const filteredUngrouped = filterText
            ? ungroupedItems.filter(x => x.text.toLowerCase().includes(filterText))
            : ungroupedItems;

        if (filteredUngrouped.length > 0) {
            const section = document.createElement('div');
            section.style.cssText = 'margin-bottom:12px;';
            section.innerHTML = `
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding:0 2px;">
                    <span style="font-size:11px;color:var(--text-secondary);font-weight:500;">未分组</span>
                    <span style="font-size:11px;color:var(--text-secondary);opacity:0.6;">(${filteredUngrouped.length})</span>
                </div>
            `;
            const innerList = document.createElement('div');
            filteredUngrouped.forEach(({ text, idx }) => {
                innerList.appendChild(_createTextItem(text, idx, disabledSet));
            });
            section.appendChild(innerList);
            list.appendChild(section);
        }
    }
}

function _renderGroupSection(list, group, groupItems, disabledSet) {
    const isCollapsed = group._collapsed || false;

    const section = document.createElement('div');
    section.className = 'reply-group-section';
    section.style.cssText = `margin-bottom:10px;border-radius:12px;overflow:hidden;border:1px solid var(--border-color);`;

    const header = document.createElement('div');
    header.style.cssText = `
        display:flex;align-items:center;gap:8px;padding:9px 12px;
        background:var(--secondary-bg);cursor:pointer;user-select:none;
        ${group.disabled ? 'opacity:0.5;' : ''}
    `;
    header.innerHTML = `
        <span style="width:8px;height:8px;border-radius:50%;background:${group.color || '#aaa'};flex-shrink:0;"></span>
        <span style="font-size:13px;font-weight:600;color:var(--text-primary);flex:1;">${group.name}</span>
        <span style="font-size:11px;color:var(--text-secondary);">${groupItems.length} 条</span>
        <button class="group-disable-toggle" title="${group.disabled ? '启用分组' : '屏蔽分组'}" style="
            background:none;border:none;cursor:pointer;padding:3px 6px;border-radius:6px;
            color:${group.disabled ? 'var(--accent-color)' : 'var(--text-secondary)'};
            font-size:11px;display:flex;align-items:center;gap:3px;
        ">
            ${group.disabled ? `
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6s1.5-3 4-3 4 3 4 3-1.5 3-4 3-4-3-4-3z" stroke="currentColor" stroke-width="1"/>
                    <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
                </svg>
            ` : `
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1"/>
                    <line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" stroke-width="1"/>
                </svg>
            `}
        </button>
        <button class="group-edit-btn" title="编辑分组" style="
            background:none;border:none;cursor:pointer;padding:3px 6px;border-radius:6px;
            color:var(--text-secondary);font-size:11px;
        ">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" stroke-width="1" fill="none"/>
            </svg>
        </button>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="group-chevron" style="
            color:var(--text-secondary);transition:transform 0.2s;
            transform:${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
        ">
            <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
    `;

    const bodyWrap = document.createElement('div');
    bodyWrap.style.cssText = `display:${isCollapsed ? 'none' : 'block'};`;

    const innerList = document.createElement('div');
    innerList.style.cssText = `padding:4px 8px 8px;`;

    if (groupItems.length === 0) {
        innerList.innerHTML = `<div style="padding:16px;text-align:center;font-size:12px;color:var(--text-secondary);opacity:0.6;">此分组暂无内容</div>`;
    } else {
        groupItems.forEach(({ text, idx }) => {
            innerList.appendChild(_createTextItem(text, idx, disabledSet));
        });
    }

    bodyWrap.appendChild(innerList);
    section.appendChild(header);
    section.appendChild(bodyWrap);
    list.appendChild(section);

    // 折叠/展开
    header.addEventListener('click', (e) => {
        if (e.target.closest('.group-disable-toggle') || e.target.closest('.group-edit-btn')) return;
        group._collapsed = !group._collapsed;
        bodyWrap.style.display = group._collapsed ? 'none' : 'block';
        header.querySelector('.group-chevron').style.transform = group._collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
    });

    // 屏蔽/启用分组
    header.querySelector('.group-disable-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        group.disabled = !group.disabled;
        throttledSaveData();
        renderReplyLibrary();
        showNotification(group.disabled ? `分组「${group.name}」已屏蔽` : `分组「${group.name}」已启用`, 'success');
    });

    // 编辑分组
    header.querySelector('.group-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        _showGroupEditor(group);
    });
}

// ────────────────────────────────────────────────
//  普通列表渲染（无分组）
// ────────────────────────────────────────────────
function _renderPlainList(list, items, filterText, disabledSet) {
    const ds = disabledSet || _getDisabledItemsSet();
    items.forEach((item, index) => {
        if (filterText && !item.toLowerCase().includes(filterText)) return;
        list.appendChild(_createTextItem(item, index, ds));
    });
}

function _createTextItem(item, index, disabledSet) {
    const div = document.createElement('div');
    div.className = 'custom-reply-item';
    const isDisabled = disabledSet && disabledSet.has(item);

    if (_batchModeActive) {
        div.style.cursor = 'pointer';
        const isSelected = _batchSelectedIndices.has(index);
        div.style.background = isSelected ? 'rgba(var(--accent-color-rgb,180,140,100),0.12)' : '';
        div.style.borderRadius = '8px';
        div.style.padding = '6px 8px';
        div.style.marginBottom = '2px';
        div.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex:1;">
                <div style="
                    width:16px;height:16px;border-radius:4px;flex-shrink:0;
                    border:1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'};
                    background:${isSelected ? 'var(--accent-color)' : 'transparent'};
                    display:flex;align-items:center;justify-content:center;
                ">
                    ${isSelected ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>' : ''}
                </div>
                <span class="custom-reply-text" style="${isDisabled ? 'opacity:0.4;text-decoration:line-through;' : ''}">${item.replace('|', '<br><small style="opacity:0.7">')}</span>
            </div>
        `;
        div.addEventListener('click', () => {
            if (_batchSelectedIndices.has(index)) {
                _batchSelectedIndices.delete(index);
            } else {
                _batchSelectedIndices.add(index);
            }
            renderReplyLibrary();
        });
        return div;
    }

    let displayHTML = `<span class="custom-reply-text" style="${isDisabled ? 'opacity:0.4;text-decoration:line-through;' : ''}">${item.replace('|', '<br><small style="opacity:0.7">')}</span>`;
    const disableIcon = isDisabled
        ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6s1.5-3 4-3 4 3 4 3-1.5 3-4 3-4-3-4-3z" stroke="currentColor" stroke-width="1"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/></svg>`
        : `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1"/><line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" stroke-width="1"/></svg>`;

    div.innerHTML = `${displayHTML}<div class="custom-reply-actions">
        <button class="reply-action-mini disable-btn" title="${isDisabled ? '启用' : '屏蔽'}" style="color:${isDisabled ? 'var(--accent-color)' : ''}">${disableIcon}</button>
        <button class="reply-action-mini group-btn" title="分配分组">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3C1 2.17 1.67 1.5 2.5 1.5h2c.36 0 .7.13.96.36L6.5 3H10c.83 0 1.5.67 1.5 1.5V9c0 .83-.67 1.5-1.5 1.5H2C1.17 10.5 1 9.83 1 9V3z" stroke="currentColor" stroke-width="1" fill="none"/></svg>
        </button>
        <button class="reply-action-mini edit-btn"><i class="fas fa-pen"></i></button>
        <button class="reply-action-mini delete-btn"><i class="fas fa-trash-alt"></i></button>
    </div>`;

    div.querySelector('.delete-btn').onclick = () => deleteItem(index);
    div.querySelector('.edit-btn').onclick = () => editItem(index, item);
    div.querySelector('.disable-btn').onclick = () => _toggleItemDisable(item);
    div.querySelector('.group-btn').onclick = (e) => {
        e.stopPropagation();
        _showSingleItemGroupPicker(item);
    };

    return div;
}

// ────────────────────────────────────────────────
//  Emoji & Sticker 渲染（不变）
// ────────────────────────────────────────────────
function _renderEmojiTab(list, itemsToRender) {
    if (itemsToRender.length === 0 && customEmojis.length === 0) {
        list.innerHTML = renderEmptyState('列表空空如也');
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
}

function _renderStickerTab(list, itemsToRender) {
    itemsToRender.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'sticker-item';
        div.innerHTML = `
            <img src="${item}" loading="lazy">
            <div class="sticker-delete-btn"><i class="fas fa-times"></i></div>
        `;
        div.querySelector('.sticker-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('删除此表情？')) {
                stickerLibrary.splice(index, 1);
                throttledSaveData();
                renderReplyLibrary();
            }
        });
        list.appendChild(div);
    });
}

// ────────────────────────────────────────────────
//  屏蔽功能
// ────────────────────────────────────────────────
function _getDisabledItemsSet() {
    try {
        const raw = localStorage.getItem('disabledReplyItems');
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
}

function _saveDisabledItemsSet(set) {
    localStorage.setItem('disabledReplyItems', JSON.stringify([...set]));
}

function _toggleItemDisable(itemText) {
    const set = _getDisabledItemsSet();
    if (set.has(itemText)) {
        set.delete(itemText);
        showNotification('已启用', 'success');
    } else {
        set.add(itemText);
        showNotification('已屏蔽（不会出现在随机回复中）', 'info');
    }
    _saveDisabledItemsSet(set);
    renderReplyLibrary();
}

function _batchToggleDisable() {
    const set = _getDisabledItemsSet();
    const selectedItems = [..._batchSelectedIndices].map(i => customReplies[i]);
    const allDisabled = selectedItems.every(item => set.has(item));
    if (allDisabled) {
        selectedItems.forEach(item => set.delete(item));
        showNotification(`已启用 ${selectedItems.length} 条`, 'success');
    } else {
        selectedItems.forEach(item => set.add(item));
        showNotification(`已屏蔽 ${selectedItems.length} 条`, 'info');
    }
    _saveDisabledItemsSet(set);
    _batchSelectedIndices.clear();
    renderReplyLibrary();
}

// ────────────────────────────────────────────────
//  分组管理弹窗
// ────────────────────────────────────────────────
function _showGroupManager() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';

    const renderGroupList = () => {
        const gl = overlay.querySelector('#gm-group-list');
        if (!gl) return;
        if (!customReplyGroups || customReplyGroups.length === 0) {
            gl.innerHTML = `<div style="text-align:center;padding:30px 0;color:var(--text-secondary);font-size:13px;">暂无分组，点击下方按钮创建</div>`;
            return;
        }
        gl.innerHTML = customReplyGroups.map((g, i) => `
            <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border-color);border-radius:10px;background:var(--primary-bg);${g.disabled ? 'opacity:0.5;' : ''}">
                <span style="width:10px;height:10px;border-radius:50%;background:${g.color || '#aaa'};flex-shrink:0;"></span>
                <span style="flex:1;font-size:13px;color:var(--text-primary);">${g.name}</span>
                <span style="font-size:11px;color:var(--text-secondary);">${(g.items || []).length} 条</span>
                <button data-action="toggle" data-idx="${i}" style="background:none;border:none;cursor:pointer;padding:3px;color:${g.disabled ? 'var(--accent-color)' : 'var(--text-secondary)'};" title="${g.disabled ? '启用' : '屏蔽'}">
                    ${g.disabled ? '◉' : '◎'}
                </button>
                <button data-action="edit" data-idx="${i}" style="background:none;border:none;cursor:pointer;padding:3px;color:var(--text-secondary);">✎</button>
                <button data-action="del" data-idx="${i}" style="background:none;border:none;cursor:pointer;padding:3px;color:#e05050;">✕</button>
            </div>
        `).join('');

        gl.querySelectorAll('button[data-action]').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                const action = btn.dataset.action;
                if (action === 'toggle') {
                    customReplyGroups[idx].disabled = !customReplyGroups[idx].disabled;
                    throttledSaveData();
                    renderGroupList();
                    renderReplyLibrary();
                } else if (action === 'edit') {
                    overlay.remove();
                    _showGroupEditor(customReplyGroups[idx]);
                } else if (action === 'del') {
                    if (confirm(`删除分组「${customReplyGroups[idx].name}」？（字卡不会被删除）`)) {
                        customReplyGroups.splice(idx, 1);
                        throttledSaveData();
                        renderGroupList();
                        renderReplyLibrary();
                    }
                }
            };
        });
    };

    overlay.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:88%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.4);max-height:80vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <div style="font-size:15px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color:var(--accent-color);">
                        <path d="M1 4C1 2.9 1.9 2 3 2h3c.5 0 .9.2 1.2.5L8.5 4H13c1.1 0 2 .9 2 2V12c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V4z" stroke="currentColor" stroke-width="1.2" fill="none"/>
                    </svg>
                    分组管理
                </div>
                <button id="gm-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--text-secondary);">×</button>
            </div>
            <div id="gm-group-list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;"></div>
            <button id="gm-add" style="width:100%;padding:11px;border:1px dashed var(--accent-color);border-radius:12px;background:none;color:var(--accent-color);font-size:13px;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;justify-content:center;gap:6px;">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                新建分组
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    renderGroupList();

    overlay.querySelector('#gm-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#gm-add').onclick = () => {
        overlay.remove();
        _showGroupEditor(null);
    };
}

function _showGroupEditor(group) {
    const isNew = !group;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';

    const currentColor = group?.color || GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];

    overlay.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:88%;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
            <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:16px;">
                ${isNew ? '新建分组' : '编辑分组'}
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px;">分组名称</label>
                <input id="ge-name" value="${group?.name || ''}" placeholder="输入分组名…" style="
                    width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border-color);
                    border-radius:10px;background:var(--primary-bg);color:var(--text-primary);
                    font-size:13px;font-family:var(--font-family);outline:none;
                ">
            </div>
            <div style="margin-bottom:20px;">
                <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:8px;">颜色标签</label>
                <div id="ge-colors" style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${GROUP_COLORS.map(c => `
                        <div data-color="${c}" style="
                            width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;
                            border:2px solid ${c === currentColor ? '#fff' : 'transparent'};
                            box-shadow:${c === currentColor ? '0 0 0 2px var(--accent-color)' : 'none'};
                            transition:all 0.15s;
                        "></div>
                    `).join('')}
                </div>
            </div>
            <div style="display:flex;gap:10px;">
                <button id="ge-cancel" style="flex:1;padding:11px;border:1px solid var(--border-color);border-radius:12px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button>
                <button id="ge-save" style="flex:2;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);">保存</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    let selectedColor = currentColor;

    overlay.querySelectorAll('[data-color]').forEach(dot => {
        dot.onclick = () => {
            selectedColor = dot.dataset.color;
            overlay.querySelectorAll('[data-color]').forEach(d => {
                const isSelected = d.dataset.color === selectedColor;
                d.style.border = `2px solid ${isSelected ? '#fff' : 'transparent'}`;
                d.style.boxShadow = isSelected ? '0 0 0 2px var(--accent-color)' : 'none';
            });
        };
    });

    overlay.querySelector('#ge-cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#ge-save').onclick = () => {
        const name = overlay.querySelector('#ge-name').value.trim();
        if (!name) { showNotification('请输入分组名称', 'warning'); return; }

        if (isNew) {
            if (!window.customReplyGroups) window.customReplyGroups = [];
            customReplyGroups.push({ id: Date.now(), name, color: selectedColor, disabled: false, items: [] });
        } else {
            group.name = name;
            group.color = selectedColor;
        }
        throttledSaveData();
        overlay.remove();
        renderReplyLibrary();
        showNotification(isNew ? '分组已创建' : '分组已更新', 'success');
    };
}

function _showSingleItemGroupPicker(itemText) {
    if (!customReplyGroups || customReplyGroups.length === 0) {
        showNotification('请先创建分组', 'info');
        _showGroupEditor(null);
        return;
    }
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';

    overlay.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:20px;padding:20px;width:88%;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
            <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:12px;">选择分组</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border:1px solid var(--border-color);border-radius:10px;background:var(--primary-bg);">
                    <input type="radio" name="sgp" value="" ${!customReplyGroups.some(g => g.items?.includes(itemText)) ? 'checked' : ''} style="accent-color:var(--accent-color);">
                    <span style="font-size:13px;color:var(--text-secondary);">不分组</span>
                </label>
                ${customReplyGroups.map((g, i) => `
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border:1px solid var(--border-color);border-radius:10px;background:var(--primary-bg);">
                        <input type="radio" name="sgp" value="${i}" ${g.items?.includes(itemText) ? 'checked' : ''} style="accent-color:var(--accent-color);">
                        <span style="width:8px;height:8px;border-radius:50%;background:${g.color || '#aaa'};flex-shrink:0;"></span>
                        <span style="font-size:13px;color:var(--text-primary);">${g.name}</span>
                    </label>
                `).join('')}
            </div>
            <div style="display:flex;gap:10px;">
                <button id="sgp-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button>
                <button id="sgp-save" style="flex:2;padding:10px;border:none;border-radius:10px;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);">确认</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#sgp-cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#sgp-save').onclick = () => {
        const checked = overlay.querySelector('input[name="sgp"]:checked');
        if (!checked) return;
        // 先从所有分组中移除
        customReplyGroups.forEach(g => {
            if (g.items) g.items = g.items.filter(t => t !== itemText);
        });
        // 添加到新分组
        if (checked.value !== '') {
            const idx = parseInt(checked.value);
            if (!customReplyGroups[idx].items) customReplyGroups[idx].items = [];
            customReplyGroups[idx].items.push(itemText);
        }
        throttledSaveData();
        overlay.remove();
        renderReplyLibrary();
        showNotification('分组已更新', 'success');
    };
}

function _showBatchGroupPicker() {
    if (!customReplyGroups || customReplyGroups.length === 0) {
        showNotification('请先创建分组', 'info');
        _showGroupEditor(null);
        return;
    }
    const selectedItems = [..._batchSelectedIndices].map(i => customReplies[i]);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';

    overlay.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:20px;padding:20px;width:88%;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
            <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">批量分组</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;">将选中的 ${selectedItems.length} 条添加到分组</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border:1px solid var(--border-color);border-radius:10px;background:var(--primary-bg);">
                    <input type="radio" name="bgp" value="" checked style="accent-color:var(--accent-color);">
                    <span style="font-size:13px;color:var(--text-secondary);">移出所有分组</span>
                </label>
                ${customReplyGroups.map((g, i) => `
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border:1px solid var(--border-color);border-radius:10px;background:var(--primary-bg);">
                        <input type="radio" name="bgp" value="${i}" style="accent-color:var(--accent-color);">
                        <span style="width:8px;height:8px;border-radius:50%;background:${g.color || '#aaa'};flex-shrink:0;"></span>
                        <span style="font-size:13px;color:var(--text-primary);">${g.name}</span>
                    </label>
                `).join('')}
            </div>
            <div style="display:flex;gap:10px;">
                <button id="bgp-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button>
                <button id="bgp-save" style="flex:2;padding:10px;border:none;border-radius:10px;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);">确认</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#bgp-cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#bgp-save').onclick = () => {
        const checked = overlay.querySelector('input[name="bgp"]:checked');
        if (!checked) return;
        customReplyGroups.forEach(g => {
            if (g.items) g.items = g.items.filter(t => !selectedItems.includes(t));
        });
        if (checked.value !== '') {
            const idx = parseInt(checked.value);
            if (!customReplyGroups[idx].items) customReplyGroups[idx].items = [];
            selectedItems.forEach(item => {
                if (!customReplyGroups[idx].items.includes(item)) {
                    customReplyGroups[idx].items.push(item);
                }
            });
        }
        throttledSaveData();
        _batchSelectedIndices.clear();
        overlay.remove();
        renderReplyLibrary();
        showNotification(`已将 ${selectedItems.length} 条移入分组`, 'success');
    };
}

// ────────────────────────────────────────────────
//  CRUD
// ────────────────────────────────────────────────
function deleteItem(index) {
    if (!confirm('确定删除吗？')) return;
    const item = (currentMajorTab === 'reply' && currentSubTab === 'custom') ? customReplies[index] : null;
    if (currentMajorTab === 'reply' && currentSubTab === 'custom') customReplies.splice(index, 1);
    else if (currentSubTab === 'pokes') customPokes.splice(index, 1);
    else if (currentSubTab === 'statuses') customStatuses.splice(index, 1);
    else if (currentSubTab === 'mottos') customMottos.splice(index, 1);
    else if (currentSubTab === 'intros') customIntros.splice(index, 1);

    // 从分组中移除
    if (item && customReplyGroups) {
        customReplyGroups.forEach(g => {
            if (g.items) g.items = g.items.filter(t => t !== item);
        });
    }

    throttledSaveData();
    renderReplyLibrary();
}

function editItem(index, oldText) {
    let newText;
    if (currentSubTab === 'intros') {
        const parts = oldText.split('|');
        const l1 = prompt('修改主标题:', parts[0]);
        if (l1 === null) return;
        const l2 = prompt('修改副标题:', parts[1] || '');
        if (l2 === null) return;
        newText = `${l1}|${l2}`;
    } else {
        newText = prompt('修改内容:', oldText);
    }

    if (newText === null || newText.trim() === '') return;

    // 同步更新分组中的文本
    if (customReplyGroups && currentMajorTab === 'reply' && currentSubTab === 'custom') {
        customReplyGroups.forEach(g => {
            if (g.items) {
                const idx = g.items.indexOf(oldText);
                if (idx >= 0) g.items[idx] = newText.trim();
            }
        });
    }

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

// ────────────────────────────────────────────────
//  导出 UI（全新矢量风格）
// ────────────────────────────────────────────────
function _showExportUI() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s ease;';

    const modules = [
        { id: '_re_replies',  icon: _iconComment(),   label: '主字卡',    count: customReplies.length,  key: 'customReplies' },
        { id: '_re_pokes',    icon: _iconHand(),      label: '拍一拍',    count: customPokes.length,    key: 'customPokes' },
        { id: '_re_statuses', icon: _iconDot(),       label: '对方状态',  count: customStatuses.length, key: 'customStatuses' },
        { id: '_re_mottos',   icon: _iconQuote(),     label: '顶部格言',  count: customMottos.length,   key: 'customMottos' },
        { id: '_re_intros',   icon: _iconPlay(),      label: '开场动画',  count: customIntros.length,   key: 'customIntros' },
        { id: '_re_emojis',   icon: _iconSmile(),     label: 'Emoji 库',  count: customEmojis.length,   key: 'customEmojis' },
        { id: '_re_groups',   icon: _iconFolder(),    label: '字卡分组',  count: (customReplyGroups||[]).length, key: 'customReplyGroups', extra: true },
    ];

    overlay.innerHTML = `
        <div style="
            background:var(--secondary-bg);border-radius:24px 24px 0 0;
            width:100%;max-width:480px;padding:0 0 env(safe-area-inset-bottom,0);
            box-shadow:0 -10px 60px rgba(0,0,0,0.3);
            animation:slideUpSheet 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
        ">
            <div style="width:36px;height:4px;border-radius:2px;background:var(--border-color);margin:12px auto 0;"></div>
            <div style="padding:20px 22px 6px;display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <div style="font-size:16px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                        ${_iconExport('var(--accent-color)',20)} 导出字卡
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">选择要导出的模块</div>
                </div>
                <button id="_re_close" style="background:var(--primary-bg);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
            </div>
            <div style="padding:10px 22px 16px;display:flex;flex-direction:column;gap:6px;">
                ${modules.map(m => `
                    <label style="
                        display:flex;align-items:center;gap:12px;cursor:pointer;
                        padding:12px 14px;border-radius:14px;
                        background:var(--primary-bg);
                        border:1.5px solid var(--border-color);
                        transition:border-color 0.15s;
                    " class="export-row">
                        <div style="
                            width:36px;height:36px;border-radius:10px;
                            background:rgba(var(--accent-color-rgb,180,140,100),0.12);
                            display:flex;align-items:center;justify-content:center;
                            color:var(--accent-color);flex-shrink:0;
                        ">${m.icon}</div>
                        <div style="flex:1;">
                            <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${m.label}</div>
                            <div style="font-size:11px;color:var(--text-secondary);">${m.count} 条${m.extra ? ' · 含分组结构' : ''}</div>
                        </div>
                        <div class="toggle-switch" data-id="${m.id}" style="
                            width:42px;height:24px;border-radius:12px;background:var(--accent-color);
                            position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;
                        ">
                            <div style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s;transform:translateX(18px);box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
                        </div>
                        <input type="checkbox" id="${m.id}" checked style="display:none;">
                    </label>
                `).join('')}
            </div>
            <div style="padding:0 22px 24px;display:flex;gap:10px;">
                <button id="_re_cancel_btn" style="
                    flex:1;padding:13px;border:1px solid var(--border-color);border-radius:14px;
                    background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;
                    font-family:var(--font-family);
                ">取消</button>
                <button id="_re_confirm_btn" style="
                    flex:2;padding:13px;border:none;border-radius:14px;
                    background:var(--accent-color);color:#fff;font-size:14px;font-weight:600;
                    cursor:pointer;font-family:var(--font-family);
                    display:flex;align-items:center;justify-content:center;gap:8px;
                ">
                    ${_iconExport('#fff',16)} 确认导出
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // toggle开关
    overlay.querySelectorAll('.toggle-switch').forEach(sw => {
        sw.onclick = () => {
            const cb = document.getElementById(sw.dataset.id);
            cb.checked = !cb.checked;
            const knob = sw.querySelector('div');
            if (cb.checked) {
                sw.style.background = 'var(--accent-color)';
                knob.style.transform = 'translateX(18px)';
            } else {
                sw.style.background = 'var(--border-color)';
                knob.style.transform = 'translateX(0)';
            }
        };
    });

    const close = () => { overlay.style.animation = 'fadeOut 0.15s ease forwards'; setTimeout(() => overlay.remove(), 150); };
    overlay.querySelector('#_re_close').onclick = close;
    overlay.querySelector('#_re_cancel_btn').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelector('#_re_confirm_btn').onclick = () => {
        const inclReplies  = document.getElementById('_re_replies').checked;
        const inclPokes    = document.getElementById('_re_pokes').checked;
        const inclStatuses = document.getElementById('_re_statuses').checked;
        const inclMottos   = document.getElementById('_re_mottos').checked;
        const inclIntros   = document.getElementById('_re_intros').checked;
        const inclEmojis   = document.getElementById('_re_emojis').checked;
        const inclGroups   = document.getElementById('_re_groups').checked;

        if (!inclReplies && !inclPokes && !inclStatuses && !inclMottos && !inclIntros && !inclEmojis && !inclGroups) {
            showNotification('请至少选择一项', 'error'); return;
        }
        close();
        const libraryData = { exportDate: new Date().toISOString(), modules: [] };
        if (inclReplies)  { libraryData.customReplies = customReplies;     libraryData.modules.push('replies'); }
        if (inclPokes)    { libraryData.customPokes = customPokes;         libraryData.modules.push('pokes'); }
        if (inclStatuses) { libraryData.customStatuses = customStatuses;   libraryData.modules.push('statuses'); }
        if (inclMottos)   { libraryData.customMottos = customMottos;       libraryData.modules.push('mottos'); }
        if (inclIntros)   { libraryData.customIntros = customIntros;       libraryData.modules.push('intros'); }
        if (inclEmojis)   { libraryData.customEmojis = customEmojis;       libraryData.modules.push('emojis'); }
        if (inclGroups)   { libraryData.customReplyGroups = customReplyGroups; libraryData.modules.push('groups'); }
        const fileName = `reply-library-${libraryData.modules.join('+')}-${new Date().toISOString().slice(0,10)}.json`;
        exportDataToMobileOrPC(JSON.stringify(libraryData, null, 2), fileName);
        showNotification('字卡导出成功', 'success');
    };
}

// ────────────────────────────────────────────────
//  导入 UI（全新底部抽屉）
// ────────────────────────────────────────────────
function _showImportUI(data) {
    const knownFields = ['customReplies','customPokes','customStatuses','customMottos','customIntros','customEmojis','customReplyGroups'];
    const hasValid = knownFields.some(f => Array.isArray(data[f]));
    if (!hasValid) { showNotification('无效的字卡备份文件，未找到可识别的内容', 'error'); return; }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s ease;';

    const modules = [
        { id: '_ri_replies',  icon: _iconComment(),   label: '主字卡',    data: data.customReplies,     key: 'customReplies' },
        { id: '_ri_pokes',    icon: _iconHand(),      label: '拍一拍',    data: data.customPokes,       key: 'customPokes' },
        { id: '_ri_statuses', icon: _iconDot(),       label: '对方状态',  data: data.customStatuses,    key: 'customStatuses' },
        { id: '_ri_mottos',   icon: _iconQuote(),     label: '顶部格言',  data: data.customMottos,      key: 'customMottos' },
        { id: '_ri_intros',   icon: _iconPlay(),      label: '开场动画',  data: data.customIntros,      key: 'customIntros' },
        { id: '_ri_emojis',   icon: _iconSmile(),     label: 'Emoji 库',  data: data.customEmojis,      key: 'customEmojis' },
        { id: '_ri_groups',   icon: _iconFolder(),    label: '字卡分组',  data: data.customReplyGroups, key: 'customReplyGroups', extra: true },
    ].filter(m => Array.isArray(m.data));

    overlay.innerHTML = `
        <div style="
            background:var(--secondary-bg);border-radius:24px 24px 0 0;
            width:100%;max-width:480px;padding:0 0 env(safe-area-inset-bottom,0);
            box-shadow:0 -10px 60px rgba(0,0,0,0.3);
            animation:slideUpSheet 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
            max-height:90vh;display:flex;flex-direction:column;
        ">
            <div style="width:36px;height:4px;border-radius:2px;background:var(--border-color);margin:12px auto 0;flex-shrink:0;"></div>
            <div style="padding:20px 22px 6px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                <div>
                    <div style="font-size:16px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                        ${_iconImport('var(--accent-color)',20)} 导入字卡
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">文件中包含以下 ${modules.length} 个模块</div>
                </div>
                <button id="_ri_close" style="background:var(--primary-bg);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
            </div>
            <div style="overflow-y:auto;padding:10px 22px 6px;display:flex;flex-direction:column;gap:6px;">
                ${modules.map(m => `
                    <label style="
                        display:flex;align-items:center;gap:12px;cursor:pointer;
                        padding:12px 14px;border-radius:14px;background:var(--primary-bg);
                        border:1.5px solid var(--border-color);
                    ">
                        <div style="
                            width:36px;height:36px;border-radius:10px;
                            background:rgba(var(--accent-color-rgb,180,140,100),0.12);
                            display:flex;align-items:center;justify-content:center;
                            color:var(--accent-color);flex-shrink:0;
                        ">${m.icon}</div>
                        <div style="flex:1;">
                            <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${m.label}</div>
                            <div style="font-size:11px;color:var(--text-secondary);">${m.data.length} 条${m.extra ? ' · 含分组结构' : ''}</div>
                        </div>
                        <div class="toggle-switch" data-id="${m.id}" style="
                            width:42px;height:24px;border-radius:12px;background:var(--accent-color);
                            position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;
                        ">
                            <div style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s;transform:translateX(18px);box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
                        </div>
                        <input type="checkbox" id="${m.id}" checked style="display:none;">
                    </label>
                `).join('')}
            </div>
            <!-- 导入方式 -->
            <div style="padding:10px 22px 6px;flex-shrink:0;">
                <div style="
                    display:flex;align-items:center;gap:8px;padding:11px 14px;
                    border-radius:14px;background:var(--primary-bg);border:1.5px solid var(--border-color);
                ">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color:var(--accent-color);flex-shrink:0;">
                        <path d="M8 1v9M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <span style="font-size:13px;color:var(--text-primary);flex:1;">导入方式</span>
                    <div style="display:flex;background:var(--secondary-bg);border-radius:8px;overflow:hidden;border:1px solid var(--border-color);">
                        <label style="display:flex;align-items:center;gap:4px;padding:5px 10px;cursor:pointer;font-size:12px;color:var(--text-primary);">
                            <input type="radio" name="_ri_mode" id="_ri_mode_merge" value="merge" checked style="accent-color:var(--accent-color);"> 追加
                        </label>
                        <label style="display:flex;align-items:center;gap:4px;padding:5px 10px;cursor:pointer;font-size:12px;color:var(--text-primary);border-left:1px solid var(--border-color);">
                            <input type="radio" name="_ri_mode" id="_ri_mode_overwrite" value="overwrite" style="accent-color:var(--accent-color);"> 覆盖
                        </label>
                    </div>
                </div>
            </div>
            <div style="padding:12px 22px 24px;display:flex;gap:10px;flex-shrink:0;">
                <button id="_ri_cancel_btn" style="flex:1;padding:13px;border:1px solid var(--border-color);border-radius:14px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button>
                <button id="_ri_confirm_btn" style="flex:2;padding:13px;border:none;border-radius:14px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;justify-content:center;gap:8px;">
                    ${_iconImport('#fff',16)} 确认导入
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.toggle-switch').forEach(sw => {
        sw.onclick = () => {
            const cb = document.getElementById(sw.dataset.id);
            cb.checked = !cb.checked;
            const knob = sw.querySelector('div');
            sw.style.background = cb.checked ? 'var(--accent-color)' : 'var(--border-color)';
            knob.style.transform = cb.checked ? 'translateX(18px)' : 'translateX(0)';
        };
    });

    const close = () => { overlay.style.animation = 'fadeOut 0.15s ease forwards'; setTimeout(() => overlay.remove(), 150); };
    overlay.querySelector('#_ri_close').onclick = close;
    overlay.querySelector('#_ri_cancel_btn').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelector('#_ri_confirm_btn').onclick = () => {
        const overwrite = document.getElementById('_ri_mode_overwrite').checked;
        const selected = modules.filter(m => document.getElementById(m.id)?.checked);
        if (selected.length === 0) { showNotification('请至少选择一项', 'error'); return; }
        close();

        try {
            let totalAdded = 0;
            if (overwrite) {
                selected.forEach(m => {
                    if (m.key === 'customReplies')       { customReplies = data.customReplies; totalAdded += data.customReplies.length; }
                    else if (m.key === 'customPokes')    { customPokes = data.customPokes; totalAdded += data.customPokes.length; }
                    else if (m.key === 'customStatuses') { customStatuses = data.customStatuses; totalAdded += data.customStatuses.length; }
                    else if (m.key === 'customMottos')   { customMottos = data.customMottos; totalAdded += data.customMottos.length; }
                    else if (m.key === 'customIntros')   { customIntros = data.customIntros; totalAdded += data.customIntros.length; }
                    else if (m.key === 'customEmojis')   { customEmojis = data.customEmojis; }
                    else if (m.key === 'customReplyGroups') { window.customReplyGroups = data.customReplyGroups; }
                });
            } else {
                selected.forEach(m => {
                    if (m.key === 'customReplies') {
                        const before = customReplies.length;
                        customReplies = deduplicateContentArray([...customReplies, ...data.customReplies], CONSTANTS.REPLY_MESSAGES).result;
                        totalAdded += customReplies.length - before;
                    } else if (m.key === 'customPokes') {
                        const before = customPokes.length;
                        customPokes = deduplicateContentArray([...customPokes, ...data.customPokes]).result;
                        totalAdded += customPokes.length - before;
                    } else if (m.key === 'customStatuses') {
                        const before = customStatuses.length;
                        customStatuses = deduplicateContentArray([...customStatuses, ...data.customStatuses]).result;
                        totalAdded += customStatuses.length - before;
                    } else if (m.key === 'customMottos') {
                        const before = customMottos.length;
                        customMottos = deduplicateContentArray([...customMottos, ...data.customMottos]).result;
                        totalAdded += customMottos.length - before;
                    } else if (m.key === 'customIntros') {
                        const before = customIntros.length;
                        customIntros = deduplicateContentArray([...customIntros, ...data.customIntros]).result;
                        totalAdded += customIntros.length - before;
                    } else if (m.key === 'customEmojis') {
                        customEmojis = [...new Set([...customEmojis, ...data.customEmojis])];
                    } else if (m.key === 'customReplyGroups') {
                        if (!window.customReplyGroups) window.customReplyGroups = [];
                        data.customReplyGroups.forEach(dg => {
                            const existing = customReplyGroups.find(g => g.name === dg.name);
                            if (!existing) customReplyGroups.push(dg);
                        });
                    }
                });
            }
            throttledSaveData();
            if (typeof renderReplyLibrary === 'function') renderReplyLibrary();
            showNotification(`导入成功（${overwrite ? '覆盖' : '追加'}）${totalAdded > 0 ? `，共 ${totalAdded} 条` : ''}`, 'success', 3000);
        } catch (err) {
            console.error('字卡导入处理失败:', err);
            showNotification('导入过程中发生错误：' + err.message, 'error');
        }
    };
}

// ────────────────────────────────────────────────
//  SVG 图标辅助
// ────────────────────────────────────────────────
function _iconComment() { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 3.5A1.5 1.5 0 013.5 2h11A1.5 1.5 0 0116 3.5v8A1.5 1.5 0 0114.5 13H10l-3 3v-3H3.5A1.5 1.5 0 012 11.5v-8z" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>`; }
function _iconHand() { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v8M6 5v5M3 8v3a6 6 0 0012 0V6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`; }
function _iconDot() { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3" fill="currentColor"/><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.3"/></svg>`; }
function _iconQuote() { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6.5C3 5.4 3.9 4.5 5 4.5h2v5H5A2 2 0 013 7.5V6.5zM10 6.5c0-1.1.9-2 2-2h2v5h-2a2 2 0 01-2-2V6.5z" fill="currentColor" opacity="0.7"/><path d="M5 9.5v2M12 9.5v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`; }
function _iconPlay() { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><path d="M7 6.5l5 2.5-5 2.5V6.5z" fill="currentColor"/></svg>`; }
function _iconSmile() { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="11.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 11.5s1 2 3 2 3-2 3-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`; }
function _iconFolder() { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5.5C2 4.4 2.9 3.5 4 3.5h3.5c.4 0 .8.2 1.1.5L10 5.5H14c1.1 0 2 .9 2 2V13c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5.5z" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>`; }
function _iconExport(color, size) { return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none"><path d="M10 3v10M6 9l4 4 4-4" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16h12" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/></svg>`; }
function _iconImport(color, size) { return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none"><path d="M10 13V3M6 7l4-4 4 4" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16h12" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/></svg>`; }

// ────────────────────────────────────────────────
//  监听器初始化
// ────────────────────────────────────────────────
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

            if (currentMajorTab === 'announcement') return;

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

            _batchModeActive = false;
            _batchSelectedIndices.clear();
            currentSubTab = LIBRARY_CONFIG[currentMajorTab].tabs[0].id;
            renderReplyLibrary();
        });
    });

    // 分组管理按钮（需要在HTML中添加 id="manage-groups-btn"）
    document.addEventListener('click', e => {
        if (e.target.closest('#manage-groups-btn')) _showGroupManager();
    });

    const searchInput = document.getElementById('reply-search-input');
    if (searchInput) searchInput.addEventListener('input', renderReplyLibrary);

    const dedupBtn = document.getElementById('dedup-replies-btn');
    if (dedupBtn) {
        dedupBtn.addEventListener('click', () => {
            let totalRemoved = 0;
            const crDedup = deduplicateContentArray(customReplies, CONSTANTS.REPLY_MESSAGES);
            customReplies = crDedup.result; totalRemoved += crDedup.removedCount;
            const cpDedup = deduplicateContentArray(customPokes);
            customPokes = cpDedup.result; totalRemoved += cpDedup.removedCount;
            const csDedup = deduplicateContentArray(customStatuses);
            customStatuses = csDedup.result; totalRemoved += csDedup.removedCount;
            const cmDedup = deduplicateContentArray(customMottos);
            customMottos = cmDedup.result; totalRemoved += cmDedup.removedCount;
            const ciDedup = deduplicateContentArray(customIntros);
            customIntros = ciDedup.result; totalRemoved += ciDedup.removedCount;
            const preEmojiCount = customEmojis.length;
            customEmojis = [...new Set(customEmojis)];
            totalRemoved += (preEmojiCount - customEmojis.length);

            if (totalRemoved > 0) {
                throttledSaveData(); renderReplyLibrary();
                showNotification(`🧹 共清理了 ${totalRemoved} 条重复内容`, 'success');
            } else {
                showNotification('✨ 没有重复内容', 'info');
            }
        });
    }

    const exportBtn = document.getElementById('export-replies-btn');
    if (exportBtn) exportBtn.addEventListener('click', _showExportUI);

    const importBtn = document.getElementById('import-replies-btn');
    const importInput = document.getElementById('import-replies-input');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            e.target.value = '';
            if (file.size > 50 * 1024 * 1024) {
                showNotification('文件过大', 'error'); return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                let data;
                try { data = JSON.parse(event.target.result); }
                catch { showNotification('文件解析失败', 'error'); return; }
                _showImportUI(data);
            };
            reader.onerror = () => showNotification('文件读取失败', 'error');
            reader.readAsText(file, 'UTF-8');
        });
    }

    const addBtn = document.getElementById('add-custom-reply');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (currentSubTab === 'stickers') {
                document.getElementById('sticker-file-input').click(); return;
            }
            if (currentSubTab === 'emojis') {
                const input = prompt('请输入要添加的 Emoji（支持组合表情）:');
                if (input && input.trim()) {
                    customEmojis.push(input.trim());
                    throttledSaveData(); renderReplyLibrary();
                    showNotification('Emoji 已添加', 'success');
                }
                return;
            }
            let input;
            if (currentSubTab === 'intros') {
                const l1 = prompt('请输入主标题 (如: 𝑳𝒐𝒗𝒆):');
                if (!l1) return;
                const l2 = prompt('请输入副标题 (如: 若要由我来谈论爱的话):');
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
                if (isDuplicate) { showNotification('该内容已存在', 'warning'); return; }
                if (currentSubTab === 'custom') customReplies.unshift(val);
                else if (currentSubTab === 'pokes') customPokes.unshift(val);
                else if (currentSubTab === 'statuses') customStatuses.unshift(val);
                else if (currentSubTab === 'mottos') customMottos.unshift(val);
                else if (currentSubTab === 'intros') customIntros.unshift(val);
                throttledSaveData(); renderReplyLibrary();
                showNotification('添加成功', 'success');
            }
        });
    }
}

function getCategoryName(tabId) {
    const map = { 'custom': '回复', 'pokes': '拍一拍', 'statuses': '状态', 'mottos': '格言', 'intros': '开场语' };
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
        '.input-btn', '.action-btn', '.modal-btn', '.settings-item', '.batch-action-btn',
        '.coin-btn-action', '.import-export-btn', '.reply-tab-btn', '.anniversary-type-btn',
        '.reply-tool-btn', '.session-action-btn', '.fav-action-btn'
    ];
    document.addEventListener('mousedown', function(e) {
        const target = e.target.closest(rippleTargets.join(','));
        if (target) createRipple(e, target);
    });
    function createRipple(event, button) {
        if (!button.classList.contains('ripple-effect')) button.classList.add('ripple-effect');
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const rect = button.getBoundingClientRect();
        const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
        const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${clientX - rect.left - radius}px`;
        circle.style.top = `${clientY - rect.top - radius}px`;
        circle.classList.add('ripple-wave');
        const ripple = button.getElementsByClassName('ripple-wave')[0];
        if (ripple) ripple.remove();
        button.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
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
        if (frameElement) frameElement.remove();
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
            if (img) avatarContent = `<img src="${img.src}" alt="preview">`;
            const frameSettings = settings[settingsKey];
            let frameHtml = '';
            if (frameSettings && frameSettings.src) {
                const size = frameSettings.size || 100;
                const offsetX = frameSettings.offsetX || 0;
                const offsetY = frameSettings.offsetY || 0;
                frameHtml = `<img src="${frameSettings.src}" class="preview-frame" style="width: ${size}%; height: ${size}%; transform: translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px));">`;
            }
            preview.innerHTML = `<div class="preview-bg-layer">${avatarContent}</div>${frameHtml}`;
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
            if (file.size > 1024 * 1024) { showNotification('头像框图片大小不能超过1MB', 'error'); return; }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (!settings[settingsKey]) settings[settingsKey] = { size: 100, offsetX: 0, offsetY: 0 };
                settings[settingsKey].src = event.target.result;
                applyAvatarFrame(avatarContainer, settings[settingsKey]);
                updateControls(); throttledSaveData();
            };
            reader.readAsDataURL(file);
        });
        removeBtn.addEventListener('click', () => {
            settings[settingsKey] = null;
            applyAvatarFrame(avatarContainer, null);
            updateControls(); throttledSaveData();
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
