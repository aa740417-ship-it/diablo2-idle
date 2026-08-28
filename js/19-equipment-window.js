// ===== 嵌入式雙頁角色裝備面板 =====
// 🗑️ v3.5.87 整區刪除浮動視窗殘骸（用戶拍板）：本面板自 v3.5.x 起恆為嵌入模式（init 無條件加
//    equipment-window-embedded、全專案無 remove/toggle），原「可拖曳浮動視窗」的拖曳三件套、關閉鈕、
//    側欄清單（renderSidePanel/openEquipmentSidePanel/closeEquipmentSidePanel/plainItemName）、
//    closeEquipmentWindow、fitEquipmentWindowToViewport 非嵌入分支——共約 150 行永不可達死碼全數移除。
// 🗑️ 變身立繪引擎（_startMorphPortrait 三層 8fps 循環）一併移除：css/floating-ui.css 以
//    `.equipment-morph-snapshot{display:none!important}` 無條件隱藏（現行 183×408 純裝備格底圖無立繪區），
//    引擎只是在 display:none 子樹裡空轉探測圖檔＋跑 125ms interval（#17 計時器洩漏）。
//    素材 assets/morphanim/ 仍供戰鬥區變身動畫（js/09 MORPH_ANIM_3DIR）使用，未動；
//    日後若新底圖恢復立繪區，從 git 前版或 v3.5.86 的 js/19 找回 _startMorphPortrait 整組即可。
// 本面板保留：雙頁裝備格(renderSlots·第 2 頁＝席琳遺骸欄) ＋ 負重%(renderStats)。
(function () {
    const PAGE_SLOTS = [
        [
            { k: 'helm',    x: 50.0, y: 15.81, w: 19.67, h: 8.82 },
            { k: 'ear1',    x: 19.4, y: 18.01, w: 19.67, h: 8.82 },
            { k: 'ear2',    x: 80.1, y: 18.01, w: 19.67, h: 8.82 },
            { k: 'amulet',  x: 50.0, y: 33.46, w: 19.67, h: 8.82 },
            { k: 'gloves',  x: 19.4, y: 31.50, w: 19.67, h: 8.82 },
            { k: 'cloak',   x: 80.1, y: 31.50, w: 19.67, h: 8.82 },
            { k: 'tshirt',  x: 50.0, y: 42.77, w: 19.67, h: 8.82 },
            { k: 'wpn',     x: 19.4, y: 44.98, w: 19.67, h: 8.82 },
            { k: 'shield', alt: 'offwpn', x: 80.1, y: 44.98, w: 19.67, h: 8.82 },
            { k: 'armor',   x: 50.0, y: 52.08, w: 19.67, h: 8.82 },
            { k: 'ring1',   x: 19.4, y: 58.46, w: 19.67, h: 8.82 },
            { k: 'ring2',   x: 80.1, y: 58.46, w: 19.67, h: 8.82 },
            { k: 'belt',    x: 50.0, y: 63.36, w: 19.67, h: 8.82 },
            { k: 'ring3',   x: 19.4, y: 67.77, w: 19.67, h: 8.82 },
            { k: 'ring4',   x: 80.1, y: 67.77, w: 19.67, h: 8.82 },
            { k: 'shin',    x: 50.0, y: 72.67, w: 19.67, h: 8.82 },
            { k: 'boots',   x: 50.0, y: 81.99, w: 19.67, h: 8.82 },
            { k: 'doll',    x: 19.4, y: 80.76, w: 19.67, h: 8.82 },
            { k: 'arrow',   x: 80.1, y: 80.76, w: 19.67, h: 8.82 }
        ],
        [
            { k: 'eye',       x: 19.4, y: 15.81, w: 19.67, h: 8.82 },   // 🐉 v3.7.57 魔眼欄（第二頁空白處·限 1·地龍之魔眼）
            { k: 'rem_eye',   x: 50.0, y: 15.81, w: 19.67, h: 8.82 },
            { k: 'rem_blood', x: 80.1, y: 31.50, w: 19.67, h: 8.82 },
            { k: 'rem_scale', x: 50.0, y: 52.08, w: 19.67, h: 8.82 },
            { k: 'rem_bone',  x: 19.4, y: 31.50, w: 19.67, h: 8.82 },
            { k: 'rem_fang',  x: 80.1, y: 44.98, w: 19.67, h: 8.82 },
            { k: 'rem_heart', x: 50.0, y: 63.36, w: 19.67, h: 8.82 },
            { k: 'rem_flesh', x: 50.0, y: 81.99, w: 19.67, h: 8.82 },
            { k: 'rem_claw',  x: 19.4, y: 44.98, w: 19.67, h: 8.82 }
        ]
    ];

    let page = 0;

    function el(id) { return document.getElementById(id); }

    const EQUIPMENT_TEMPLATE_CLASS = {
        royal: '王族', knight: '騎士', mage: '法師', elf: '妖精',
        dark: '黑妖', illusion: '幻術', dragon: '龍騎', warrior: '戰士'
    };
    function equipmentTemplateUrl() {
        const cls = typeof player !== 'undefined' && player ? EQUIPMENT_TEMPLATE_CLASS[player.cls] : '';
        if (!cls) return 'public/assets/login/EQ%20UI/' + encodeURIComponent('原圖.png') + '?v=20260713';
        const avatar = String(player.avatar || '');
        const female = avatar.startsWith('女') || avatar === '公主';   // 👑 v3.6.01 王族性別直接看 avatar：舊制以 bloodPledge 推斷，血盟改版後創角不再自動入盟、陣營又隨盟主而非自己 → 公主未入盟/入王子盟會誤判為男
        return 'public/assets/login/EQ%20UI/' + encodeURIComponent((female ? '女' : '男') + cls + '.png') + '?v=20260713';
    }
    function syncEquipmentBackground() {
        const background = el('equipment-window-frame')?.querySelector('.equipment-window-bg');
        if (!background) return;
        const src = equipmentTemplateUrl();
        if (background.getAttribute('src') !== src) background.src = src;
    }

    // 🗑️ v3.5.84 移除 18 欄數值（等級/經驗/HP/MP/AC/萬能藥/PK/六維/四屬性抗/ER）：
    //    那批座標是「上一版角色卡版型」留下的百分比，現行底圖（public/assets/login/EQ UI/<性別><職業>.png）
    //    已改成純裝備格版型、上面沒有任何欄位標籤。這些數值在「能力」分頁本來就有完整顯示；
    //    PVP 的真實指標是性向值 alignmentValue，單一顯示點在 js/10 的 PVP 面板，勿在此重複。
    function renderStats() {
        if (typeof player === 'undefined' || !player || !player.d) return;
        const d = player.d;
        const weight = el('equipment-window-weight');
        if (weight) {
            const weightPct = Math.max(0, Math.round(Number(d.weightPct) || 0));
            const loadTier = Math.max(0, Math.min(3, Number(d.loadTier) || 0));
            weight.textContent = `負重 ${weightPct} %`;
            weight.dataset.loadTier = String(loadTier);
            weight.setAttribute('aria-label', `目前負重 ${weightPct}%`);
        }
    }

    const SLOT_LABELS = {
        helm:'頭盔', ear1:'耳環 1', ear2:'耳環 2', amulet:'項鍊', gloves:'手套', cloak:'斗篷',
        tshirt:'內衣', wpn:'武器', shield:'盾牌 / 副手', offwpn:'副武器', armor:'盔甲',
        ring1:'戒指 1', ring2:'戒指 2', ring3:'戒指 3', ring4:'戒指 4', belt:'腰帶',
        shin:'脛甲', boots:'長靴', doll:'娃娃', arrow:'箭矢', eye:'魔眼',
        rem_eye:'遺骸・眼', rem_blood:'遺骸・血', rem_scale:'遺骸・鱗', rem_bone:'遺骸・骨',
        rem_fang:'遺骸・牙', rem_heart:'遺骸・心', rem_flesh:'遺骸・肉', rem_claw:'遺骸・爪'
    };

    function ensureListStyle() {
        if (el('equipment-list-style')) return;
        const style = document.createElement('style');
        style.id = 'equipment-list-style';
        style.textContent = `
        #equipment-window-frame{width:min(100%,520px)!important;max-width:520px!important;height:auto!important;min-height:0!important;background:#111b22!important;border:1px solid #52616b!important;overflow:hidden!important;}
        #equipment-window-frame .equipment-window-bg{display:none!important;}
        #equipment-window-slots{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;padding:8px!important;box-sizing:border-box!important;display:flex!important;flex-direction:column!important;gap:4px!important;}
        #equipment-window-slots .equipment-visual-slot{position:relative!important;left:auto!important;top:auto!important;width:100%!important;height:48px!important;min-height:48px!important;transform:none!important;display:grid!important;grid-template-columns:88px 38px minmax(0,1fr) auto!important;align-items:center!important;gap:8px!important;padding:4px 8px!important;box-sizing:border-box!important;border:1px solid #394a54!important;border-radius:3px!important;background:linear-gradient(180deg,#17242c,#10191f)!important;color:#dce7ec!important;text-align:left!important;}
        #equipment-window-slots .equipment-visual-slot:active{background:#22333d!important;}
        .equipment-list-label{font-size:13px;color:#9fb0ba;white-space:nowrap;}
        .equipment-list-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;position:relative;}
        .equipment-list-icon img{position:static!important;width:34px!important;height:34px!important;max-width:34px!important;max-height:34px!important;object-fit:contain!important;}
        .equipment-list-name{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f0f4f6;}
        .equipment-list-empty{color:#667780;}
        .equipment-list-extra{font-size:12px;color:#e8c96a;white-space:nowrap;}
        #equipment-window-slots .equipment-slot-equipped{position:absolute!important;left:0!important;top:0!important;font-size:10px!important;}
        #equipment-window-slots .equipment-slot-enhance,#equipment-window-slots .equipment-slot-count{position:static!important;font-size:12px!important;}
        @media(max-width:480px){#equipment-window-slots .equipment-visual-slot{grid-template-columns:72px 36px minmax(0,1fr) auto!important;padding:4px 6px!important;gap:5px!important}.equipment-list-label{font-size:12px}.equipment-list-name{font-size:13px}}
        `;
        document.head.appendChild(style);
    }

    function renderSlots() {
        if (typeof player === 'undefined' || !player || !player.eq) return;
        ensureListStyle();
        const host = el('equipment-window-slots');
        host.innerHTML = '';
        PAGE_SLOTS[page].forEach(pos => {
            const actualKey = pos.alt && player.eq[pos.alt] ? pos.alt : pos.k;
            const item = player.eq[actualKey];
            const data = item && typeof DB !== 'undefined' && DB.items[item.id];
            const slot = document.createElement('button');
            slot.type = 'button';
            slot.className = 'equipment-visual-slot' + (item ? ' is-filled' : ' is-empty');

            const label = document.createElement('span');
            label.className = 'equipment-list-label';
            label.textContent = SLOT_LABELS[actualKey] || SLOT_LABELS[pos.k] || pos.k;
            slot.appendChild(label);

            const icon = document.createElement('span');
            icon.className = 'equipment-list-icon';
            slot.appendChild(icon);

            const name = document.createElement('span');
            name.className = 'equipment-list-name';
            slot.appendChild(name);

            const extra = document.createElement('span');
            extra.className = 'equipment-list-extra';
            slot.appendChild(extra);

            if (item && data) {
                const img = document.createElement('img');
                img.src = getIconUrl(data);
                img.alt = data.n || pos.k;
                img.draggable = false;
                img.onerror = function () { this.style.display = 'none'; };
                if (typeof getGlowClass === 'function') {
                    const glowClass = getGlowClass(item, data);
                    if (glowClass) img.classList.add(...glowClass.split(/\s+/).filter(Boolean));
                }
                icon.appendChild(img);
                name.textContent = data.n || item.id;
                if ((Number(item.en) || 0) > 0) extra.textContent = '+' + capEn(item.en, data);
                else if ((item.cnt || 1) > 1) extra.textContent = '×' + (item.cnt || 1).toLocaleString();
                slot.classList.add('tip-host');
                slot.setAttribute('data-tip-uid', item.uid); slot.setAttribute('data-tip-src', 'eq');
                slot.onclick = function () { if (typeof openModal === 'function') openModal(item, true, actualKey); };
                slot.ondblclick = function (event) { event.preventDefault(); event.stopPropagation(); unequipItem(actualKey); };
            } else {
                name.textContent = '尚未裝備';
                name.classList.add('equipment-list-empty');
                slot.title = '尚未裝備';
            }
            host.appendChild(slot);
        });
        const pageOne = el('equipment-window-prev');
        const pageTwo = el('equipment-window-next');
        pageOne.disabled = false; pageTwo.disabled = false;
        pageOne.classList.toggle('active', page === 0); pageTwo.classList.toggle('active', page === 1);
        pageOne.setAttribute('aria-pressed', page === 0 ? 'true' : 'false');
        pageTwo.setAttribute('aria-pressed', page === 1 ? 'true' : 'false');
    }

    function fitEquipmentWindowToViewport() {
        const frame = el('equipment-window-frame');
        const win = el('equipment-window');
        if (!frame || !win || win.classList.contains('hidden')) return;
        const host = el('tab-content-panel');
        if (!host) return;
        const hostRect = host.getBoundingClientRect();
        win.style.left = hostRect.left + 'px';
        win.style.top = hostRect.top + 'px';
        win.style.right = 'auto'; win.style.bottom = 'auto';
        win.style.width = hostRect.width + 'px';
        win.style.height = hostRect.height + 'px';
        frame.style.left = '50%'; frame.style.top = '0';
        frame.style.setProperty('width', Math.min(hostRect.width, 520) + 'px', 'important');
        frame.style.setProperty('height', 'auto', 'important');
        frame.style.transform = 'translateX(-50%)';
    }

    window.refreshEquipmentWindow = function () {
        const win = el('equipment-window');
        if (!win || win.classList.contains('hidden')) return;
        syncEquipmentBackground();
        renderStats();
        renderSlots();
    };

    window.setEquipmentPanelEmbedded = function (visible) {
        const win = el('equipment-window');
        if (!win) return;
        const host = el('tab-content-panel');
        if (host) {
            host.classList.toggle('equipment-panel-host', visible);
            if (!visible || innerWidth > 768) host.style.removeProperty('--equipment-panel-height');
            else host.style.setProperty('--equipment-panel-height', (page === 0 ? 980 : 500) + 'px');
        }
        win.classList.add('equipment-window-embedded');
        win.classList.toggle('hidden', !visible);
        win.setAttribute('aria-hidden', visible ? 'false' : 'true');
        if (!visible) return;
        if (innerWidth <= 768) {
            const scroller = el('game-screen');
            if (scroller && host) {
                const scrollerRect = scroller.getBoundingClientRect();
                const hostRect = host.getBoundingClientRect();
                if (hostRect.bottom > scrollerRect.bottom) scroller.scrollTop += hostRect.bottom - scrollerRect.bottom + 8;
                if (hostRect.top < scrollerRect.top) scroller.scrollTop -= scrollerRect.top - hostRect.top + 8;
            }
        }
        refreshEquipmentWindow();
        requestAnimationFrame(fitEquipmentWindowToViewport);
    };

    // 🗑️ 移除 window.openEquipmentWindow／window.toggleEquipmentWindow：
    //   v3.5.87 砍掉整組浮動視窗開關流程後兩者已零呼叫點（js/*.js、index.html/test.html 的 inline onclick、css/ 全域 Grep 皆無）。
    //   目前唯一活著的入口＝js/10-ui-tabs.js 直接呼叫 window.setEquipmentPanelEmbedded(布林)。

    function init() {
        const frame = el('equipment-window-frame');
        if (!frame) return;
        const win = el('equipment-window');
        if (win) win.classList.add('equipment-window-embedded');
        const background = frame.querySelector('.equipment-window-bg');
        if (background) {
            background.onerror = function () {
                this.onerror = null;
                this.src = 'public/assets/login/EQ%20UI/' + encodeURIComponent('原圖.png') + '?v=20260713';
            };
            syncEquipmentBackground();
        }
        el('equipment-window-prev').setAttribute('aria-label', '裝備第 1 頁');
        el('equipment-window-next').setAttribute('aria-label', '裝備第 2 頁');
        el('equipment-window-prev').onclick = function () { page = 0; refreshEquipmentWindow(); };
        el('equipment-window-next').onclick = function () { page = 1; refreshEquipmentWindow(); };
        window.addEventListener('resize', fitEquipmentWindowToViewport);
        const gameScroller = el('game-screen');
        if (gameScroller) gameScroller.addEventListener('scroll', fitEquipmentWindowToViewport, { passive: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
