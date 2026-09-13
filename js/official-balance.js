/*
 * 放置天堂－仿正服平衡層 OB10
 * 僅由 official.html 載入，原版 index.html 不受影響。
 *
 * OB10：
 * 1. 保留 OB9 全部平衡
 * 2. 降低賣店回收金幣，避免自動販賣成為主要金幣來源
 * 3. 一般 NPC 商店售價小幅提高，增加金幣消耗
 * 4. 潘朵拉／特殊市場留到下一版獨立調整
 */
(function () {
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialBalanceApplied) return;
    window.__officialBalanceApplied = true;

    const CFG = window.OFFICIAL_BALANCE = {
        version: 'OB10',

        // 全服基礎倍率
        baseDropMult: 0.55,
        baseGoldMult: 0.70,

        // 升級需求倍率（Lv1~29 不額外拉長）
        expReqMult: {
            '1-29': 1.00,
            '30-39': 1.10,
            '40-49': 1.25,
            '50-59': 1.50,
            '60-69': 1.80,
            '70-79': 2.20,
            '80-89': 2.80,
            '90-99': 3.50
        },

        // 第一批地區：mult 是在全服基礎倍率之外再乘
        zones: {
            training: {
                name: '新兵修練場',
                exp: 1.00,
                gold: 0.90,
                drop: 1.00
            },
            talking_island: {
                name: '說話之島周邊',
                exp: 0.90,
                gold: 0.85,
                drop: 0.90
            },
            talking_island_port: {
                name: '說話之島港口',
                exp: 0.85,
                gold: 0.80,
                drop: 0.85
            },
            gludio: {
                name: '古魯丁',
                exp: 0.80,
                gold: 0.75,
                drop: 0.80
            },
            zone_13: {
                name: '說話之島地監1樓',
                exp: 0.90,
                gold: 0.78,
                drop: 0.80
            },
            zone_14: {
                name: '說話之島地監2樓',
                exp: 0.88,
                gold: 0.76,
                drop: 0.78
            },
            zone_06: {
                name: '古魯丁地監1樓',
                exp: 0.86,
                gold: 0.74,
                drop: 0.76
            },
            zone_07: {
                name: '古魯丁地監2樓',
                exp: 0.84,
                gold: 0.72,
                drop: 0.74
            },
            zone_08: {
                name: '古魯丁地監3樓',
                exp: 0.83,
                gold: 0.70,
                drop: 0.72
            },
            zone_09: {
                name: '古魯丁地監4樓',
                exp: 0.82,
                gold: 0.69,
                drop: 0.70
            },
            zone_10: {
                name: '古魯丁地監5樓',
                exp: 0.84,
                gold: 0.70,
                drop: 0.69
            },
            zone_11: {
                name: '古魯丁地監6樓',
                exp: 0.86,
                gold: 0.72,
                drop: 0.68
            },
            zone_12: {
                name: '古魯丁地監7樓',
                exp: 0.89,
                gold: 0.75,
                drop: 0.67
            }
        }
    };

    // ===== OB7：怪物／菁英／頭目個別收益 =====
    // 只在 CFG.zones 已納入的仿正服地圖生效。
    // 這些倍率會再乘上各地圖的 exp/gold/drop 倍率。
    const MONSTER_BALANCE = {
        '骷髏':       { exp: 0.95, gold: 0.90, drop: 0.90 },
        '骷髏弓箭手': { exp: 1.02, gold: 0.95, drop: 0.95 },
        '骷髏斧手':   { exp: 1.05, gold: 1.00, drop: 1.02 },
        '骷髏槍兵':   { exp: 1.00, gold: 0.97, drop: 1.00 },

        '食屍鬼':     { exp: 1.08, gold: 1.00, drop: 1.03 },
        '史巴托':     { exp: 1.10, gold: 1.05, drop: 1.08 },
        '萊肯':       { exp: 1.12, gold: 1.08, drop: 1.05 },

        '楊果里恩':   { exp: 1.12, gold: 1.08, drop: 1.08 },
        '歐熊':       { exp: 1.08, gold: 1.05, drop: 1.02 },
        '地獄犬':     { exp: 1.15, gold: 1.10, drop: 1.12 },
        '食人妖精':    { exp: 1.10, gold: 1.08, drop: 1.05 },
        '長老':      { exp: 1.12, gold: 1.10, drop: 1.08 },
        '食人妖精王':   { exp: 1.20, gold: 1.18, drop: 1.15 },
        '巫師':      { exp: 1.25, gold: 1.20, drop: 1.18 },
        '西瑪':      { exp: 1.35, gold: 1.25, drop: 1.30 },
        '巴土瑟':     { exp: 1.35, gold: 1.25, drop: 1.30 },
        '卡士柏':     { exp: 1.35, gold: 1.25, drop: 1.30 },
        '馬庫爾':     { exp: 1.40, gold: 1.30, drop: 1.35 },
        '死亡騎士':    { exp: 1.50, gold: 1.35, drop: 1.45 },
        '巴風特':      { exp: 1.45, gold: 1.30, drop: 1.35 }
    };

    // ===== OB8：頭目掉落分層 =====
    // rate 是原始掉率（百分比）。先依原始掉率分層，再對王專屬寶物額外降低。
    const BOSS_DROP_REBALANCE = {
        '西瑪': {
            special: {
                'arm_57': 0.22,
                'acc_sima_ring': 0.35,
                'acc_orin_amulet': 0.35
            }
        },
        '巴土瑟': {
            special: {
                'arm_54': 0.22
            }
        },
        '卡士柏': {
            special: {
                'arm_55': 0.22,
                'wpn_mana_orb': 0.40
            }
        },
        '馬庫爾': {
            special: {
                'arm_56': 0.22
            }
        },
        '死亡騎士': {
            special: {
                'hlm_dk': 0.18,
                'amr_dk': 0.18,
                'glv_dk': 0.18,
                'bot_dk': 0.18,
                'wpn_dk_flameblade': 0.20,
                'bk_counter_barrier': 0.35
            }
        },
        '巴風特': {
            special: {
                'amr_baphomet': 0.18,
                'wpn_powerless_baphomet': 0.25,
                'bk_elf_flamesoul': 0.35
            }
        }
    };

    // ===== OB9：全服物品類型掉落分級 =====
    // 此倍率作用於 MOB_DROPS 與各職業技能掉落表。
    // 任務強制掉落／程式另行給予的物品不會被這裡處理。
    function globalDropItemFactor(itemId, rate) {
        itemId = String(itemId || '');
        rate = Number(rate) || 0;

        // 一般武卷／防卷保留，避免基本強化節奏過度卡住。
        if (itemId === 'scroll_weapon' || itemId === 'scroll_armor') return 1.00;

        // 祝武／祝防：真正稀有。
        if (itemId === 'scroll_weapon_b' || itemId === 'scroll_armor_b') return 0.35;

        // 飾品強化卷：比一般武防卷稀有。
        if (itemId === 'scroll_acc') return 0.55;

        let item = null;
        try { item = (typeof DB !== 'undefined' && DB.items) ? DB.items[itemId] : null; } catch (e) {}
        if (!item) return 1.00;

        // 遺物已有自己的極低掉率，OB9 暫不重複壓低。
        if (item.relic) return 1.00;

        // 魔法書／技能書：依原始掉率分層。
        if (item.type === 'skillbk') {
            if (rate <= 0.01) return 0.40;
            if (rate <= 0.10) return 0.50;
            if (rate <= 1.00) return 0.65;
            if (rate <= 5.00) return 0.80;
            return 0.90;
        }

        // 傳說裝備：不論原始表給多少，再壓一層。
        if (item.legend) return 0.35;

        // 一般武器／防具／飾品：依原始掉率分層。
        if (item.type === 'wpn' || item.type === 'arm' || item.type === 'acc') {
            if (rate <= 0.01) return 0.60;
            if (rate <= 0.10) return 0.70;
            if (rate <= 1.00) return 0.80;
            if (rate <= 5.00) return 0.90;
            return 0.95;
        }

        return 1.00;
    }

    function bossDropItemFactor(monsterName, itemId, rate) {
        const cfg = BOSS_DROP_REBALANCE[monsterName];
        if (!cfg) return 1;

        rate = Number(rate) || 0;
        let tier = 1;
        if (rate <= 0.001) tier = 0.50;
        else if (rate <= 0.01) tier = 0.55;
        else if (rate <= 0.10) tier = 0.45;
        else if (rate <= 1.00) tier = 0.65;

        const special = cfg.special && cfg.special[itemId];
        if (Number.isFinite(Number(special))) tier *= Number(special);
        return tier;
    }

    function monsterCfg(mob) {
        try {
            return mob && mob.n ? (MONSTER_BALANCE[mob.n] || null) : null;
        } catch (e) {
            return null;
        }
    }

    function zoneCfg() {
        try {
            return (typeof mapState !== 'undefined' && mapState)
                ? (CFG.zones[mapState.current] || null)
                : null;
        } catch (e) {
            return null;
        }
    }

    function expReqFactor(lv) {
        lv = Number(lv) || 1;
        if (lv < 30) return 1.00;
        if (lv < 40) return 1.10;
        if (lv < 50) return 1.25;
        if (lv < 60) return 1.50;
        if (lv < 70) return 1.80;
        if (lv < 80) return 2.20;
        if (lv < 90) return 2.80;
        return 3.50;
    }

    // ===== 經驗需求 =====
    try {
        if (typeof EXP_REQ_CLASSIC !== 'undefined' && Array.isArray(EXP_REQ_CLASSIC)) {
            for (let lv = 1; lv < Math.min(100, EXP_REQ_CLASSIC.length); lv++) {
                const req = Number(EXP_REQ_CLASSIC[lv]);
                if (Number.isFinite(req) && req > 0) {
                    EXP_REQ_CLASSIC[lv] = Math.max(1, Math.round(req * expReqFactor(lv)));
                }
            }
        }
    } catch (e) {
        console.warn('[official-balance] EXP requirement patch failed', e);
    }

    // ===== 組隊收益 =====
    // 仿正服版：隊伍人數不再直接把金幣/掉寶 x2~x8。
    try {
        if (typeof partyRewardMult === 'function') {
            partyRewardMult = function () { return 1; };
        }

        // 全服掉寶先收斂至 55%。
        // 區域額外倍率由 killMob 暫時縮放各掉落表處理，避免把任務強制掉落一起砍掉。
        if (typeof partyDropRate === 'function') {
            partyDropRate = function (rate) {
                return Math.min(1, Math.max(0, Number(rate) || 0) * CFG.baseDropMult);
            };
        }

        if (typeof classicDropMult === 'function') {
            classicDropMult = function () { return CFG.baseDropMult; };
        }
    } catch (e) {
        console.warn('[official-balance] party/drop patch failed', e);
    }

    // 組隊經驗加成大幅收斂。
    try {
        if (typeof partyExpBonusPct === 'function') {
            partyExpBonusPct = function () {
                const mates = (player && player.allies ? player.allies : [])
                    .filter(a => a && !a._downed).length;
                if (mates <= 0) return 0;
                const each = (player && player.cls === 'royal') ? 2 : 1;
                return Math.min(10, mates * each);
            };
        }
    } catch (e) {
        console.warn('[official-balance] party EXP patch failed', e);
    }

    // ===== 金幣 =====
    // 全服基礎 70%，第一批地區再依區域倍率調整。
    try {
        if (typeof monsterGoldRange === 'function') {
            const _baseMonsterGoldRange = monsterGoldRange;
            monsterGoldRange = function (mob) {
                const r = _baseMonsterGoldRange(mob) || { min: 1, max: 1 };
                const z = zoneCfg();
                const zoneGold = z ? z.gold : 1;
                const m = z ? monsterCfg(mob) : null;
                const monsterGold = m ? m.gold : 1;
                const mult = CFG.baseGoldMult * zoneGold * monsterGold;

                const min = Math.max(1, Math.floor((Number(r.min) || 1) * mult));
                const max = Math.max(min, Math.floor((Number(r.max) || min) * mult));
                return { min, max };
            };
        }
    } catch (e) {
        console.warn('[official-balance] gold patch failed', e);
    }

    // ===== 已納入仿正服平衡的地區：經驗＋主要掉落表 =====
    try {
        if (typeof killMob === 'function') {
            const _baseKillMob = killMob;

            function scaleTable(table, key, mult, restoreList) {
                if (!table || !key || mult === 1) return;
                const original = table[key];
                if (!Array.isArray(original)) return;

                table[key] = original.map(entry => {
                    if (!Array.isArray(entry) || entry.length < 2) return entry;
                    const copy = entry.slice();
                    const rate = Number(copy[1]);
                    if (Number.isFinite(rate)) {
                        const itemId = String(copy[0] || '');
                        const bossFactor = bossDropItemFactor(key, itemId, rate);
                        const globalFactor = globalDropItemFactor(itemId, rate);
                        copy[1] = rate * mult * bossFactor * globalFactor;
                    }
                    return copy;
                });

                restoreList.push([table, key, original]);
            }

            killMob = function (idx) {
                const mob = (typeof mapState !== 'undefined' && mapState && mapState.mobs)
                    ? mapState.mobs[idx]
                    : null;
                const z = zoneCfg();

                if (!mob) return _baseKillMob(idx);

                // 怪物個別收益仍只在已納入仿正服平衡的地圖生效；
                // OB9 的物品類型掉率則全服生效。
                const m = z ? monsterCfg(mob) : null;
                const originalExp = mob.exp;
                const restores = [];

                // 區域經驗：只在結算這一刻調整，不永久改 DB 怪物資料。
                if (z && Number.isFinite(Number(originalExp)) && Number(originalExp) > 0) {
                    const monsterExp = m ? m.exp : 1;
                    mob.exp = Math.max(1, Math.floor(Number(originalExp) * z.exp * monsterExp));
                }

                const effectiveDrop = (z ? z.drop : 1) * (m ? m.drop : 1);

                // 區域主要掉寶：
                // 只調整目前這隻怪的各職業/一般掉落表，結算後立即恢復。
                // 任務另行強制 100% 的掉落邏輯不會被這裡破壞。
                try {
                    if (typeof MOB_DROPS !== 'undefined') {
                        scaleTable(MOB_DROPS, mob.n, effectiveDrop, restores);
                    }
                    if (typeof DARK_WEAPON_DROPS !== 'undefined') {
                        scaleTable(DARK_WEAPON_DROPS, mob.n, effectiveDrop, restores);
                    }
                    if (typeof DARK_CRYSTAL_DROPS !== 'undefined') {
                        scaleTable(DARK_CRYSTAL_DROPS, mob.n, effectiveDrop, restores);
                    }
                    if (typeof DRAGON_DROPS !== 'undefined') {
                        scaleTable(DRAGON_DROPS, mob.n, effectiveDrop, restores);
                    }
                    if (typeof WARRIOR_DROPS !== 'undefined') {
                        scaleTable(WARRIOR_DROPS, mob.n, effectiveDrop, restores);
                    }
                    if (typeof MEM_DROPS !== 'undefined') {
                        scaleTable(MEM_DROPS, mob.n, effectiveDrop, restores);
                    }

                    return _baseKillMob(idx);
                } finally {
                    restores.forEach(r => {
                        try { r[0][r[1]] = r[2]; } catch (e) {}
                    });

                    // 同一物件仍存在時才復原，避免變身/換怪時污染新物件。
                    try {
                        if (mapState && mapState.mobs && mapState.mobs[idx] === mob) {
                            mob.exp = originalExp;
                        }
                    } catch (e) {}
                }
            };
        }
    } catch (e) {
        console.warn('[official-balance] zone balance patch failed', e);
    }

    // ===== 登入頁標記 =====
    function markOfficialMode() {
        try {
            document.title = '放置天堂 - 仿正服版';

            const h1 = document.querySelector('#login-title-layer h1');
            if (h1) h1.textContent = '放置天堂 - 仿正服版';

            const v = document.getElementById('login-version');
            if (v) {
                let base = String(v.textContent || '').replace(/\s*·\s*仿正服\s+OB\d+/g, '');
                v.textContent = base + ' · 仿正服 ' + CFG.version;
            }
        } catch (e) {}
    }

    markOfficialMode();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', markOfficialMode, { once: true });
    }
    window.addEventListener('load', function () {
        setTimeout(markOfficialMode, 50);
    }, { once: true });

    console.info('[official-balance] enabled', CFG);
})();

/* ===== 仿正服模式：暫停專武系統 =====
 * 原版 class-artifact-system.js 完整保留。
 * official.html 載入此平衡層時：
 * - 隱藏右下「專武」按鈕與面板
 * - 移除「神器聖域」地圖入口
 * - 停用 artifact_sanctum 地圖資料
 */
(function officialDisableArtifactSystem(){
    if (!window.OFFICIAL_BALANCE_MODE) return;

    const ARTIFACT_MAP_ID = 'artifact_sanctum';

    function disableArtifactUIAndMap() {
        try {
            let st = document.getElementById('official-disable-artifact-style');
            if (!st) {
                st = document.createElement('style');
                st.id = 'official-disable-artifact-style';
                st.textContent = `
                    #artifact-open-btn,
                    #artifact-panel {
                        display: none !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                    }
                `;
                document.head.appendChild(st);
            }

            const btn = document.getElementById('artifact-open-btn');
            if (btn) btn.remove();

            const panel = document.getElementById('artifact-panel');
            if (panel) panel.remove();
        } catch (e) {
            console.warn('[official] hide artifact UI failed', e);
        }

        try {
            if (typeof MAP_CATEGORIES !== 'undefined' &&
                MAP_CATEGORIES &&
                Array.isArray(MAP_CATEGORIES.special)) {
                MAP_CATEGORIES.special = MAP_CATEGORIES.special.filter(
                    x => x && x.v !== ARTIFACT_MAP_ID
                );
            }
        } catch (e) {
            console.warn('[official] remove artifact category failed', e);
        }

        try {
            if (typeof MAP_REGIONS !== 'undefined' && Array.isArray(MAP_REGIONS)) {
                for (let i = MAP_REGIONS.length - 1; i >= 0; i--) {
                    const r = MAP_REGIONS[i];
                    if (!r) continue;

                    if (r.key === 'artifact') {
                        MAP_REGIONS.splice(i, 1);
                        continue;
                    }

                    if (Array.isArray(r.maps)) {
                        r.maps = r.maps.filter(m => m && m.v !== ARTIFACT_MAP_ID);
                    }
                }
            }
        } catch (e) {
            console.warn('[official] remove artifact region failed', e);
        }

        try {
            if (typeof DB !== 'undefined' && DB && DB.maps && DB.maps[ARTIFACT_MAP_ID]) {
                delete DB.maps[ARTIFACT_MAP_ID];
            }
        } catch (e) {
            console.warn('[official] disable artifact map failed', e);
        }

        try {
            if (typeof rebuildMapCategoryOptions === 'function') {
                rebuildMapCategoryOptions();
            }
        } catch (e) {}

        try {
            if (typeof mapState !== 'undefined' &&
                mapState &&
                mapState.current === ARTIFACT_MAP_ID) {
                if (typeof setMapSelectors === 'function') {
                    setMapSelectors('town_talking');
                }
                if (typeof changeMap === 'function') {
                    changeMap(true);
                } else {
                    mapState.current = 'town_talking';
                }
            }
        } catch (e) {
            console.warn('[official] artifact map fallback failed', e);
        }
    }

    disableArtifactUIAndMap();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', disableArtifactUIAndMap, { once:true });
    }

    setTimeout(disableArtifactUIAndMap, 500);
    setTimeout(disableArtifactUIAndMap, 1500);
})();

/* ===== 仿正服 OB10：經濟平衡 START ===== */
(function officialEconomyOB10(){
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialEconomyOB10) return;
    window.__officialEconomyOB10 = true;

    const ECON = {
        // 原版 getSellPrice 為定價約 30% 起跳；再乘 50% => 基礎約 15%。
        sellReturnMult: 0.50,

        // NPC 一般商店只小幅提高，避免前期補給太痛苦。
        shopPriceMult: 1.10
    };

    window.OFFICIAL_ECONOMY = Object.assign(
        {},
        window.OFFICIAL_ECONOMY || {},
        ECON
    );

    // ===== 賣店回收 =====
    try {
        if (typeof getSellPrice === 'function') {
            const _officialBaseGetSellPrice = getSellPrice;

            getSellPrice = function(item) {
                const raw = Number(_officialBaseGetSellPrice(item)) || 0;
                if (raw <= 0) return 0;
                return Math.max(1, Math.floor(raw * ECON.sellReturnMult));
            };
        } else {
            console.warn('[official-economy] getSellPrice not found');
        }
    } catch (e) {
        console.warn('[official-economy] sell price patch failed', e);
    }

    // ===== 一般 NPC 商店 =====
    // 包在既有 shopPrice 外面，保留原本所有折扣／特殊價格邏輯，
    // 最後才加仿正服 10% 經濟倍率。
    try {
        if (typeof shopPrice === 'function') {
            const _officialBaseShopPrice = shopPrice;

            shopPrice = function() {
                const raw = Number(_officialBaseShopPrice.apply(this, arguments)) || 0;
                if (raw <= 0) return 0;
                return Math.max(1, Math.ceil(raw * ECON.shopPriceMult));
            };
        } else {
            console.warn('[official-economy] shopPrice not found');
        }
    } catch (e) {
        console.warn('[official-economy] shop price patch failed', e);
    }

    console.info('[official-economy] OB10 enabled', ECON);
})();
/* ===== 仿正服 OB10：經濟平衡 END ===== */
