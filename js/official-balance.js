/*
 * 放置天堂－仿正服平衡層 OB5
 * 僅由 official.html 載入，原版 index.html 不受影響。
 *
 * OB5：
 * 1. 保留 OB4 全部平衡
 * 2. 新增常見怪物個別收益差異
 * 3. 骷髏偏低收益；食屍鬼／史巴托／萊肯依危險度提高回報
 * 4. 個別倍率只套用在已納入仿正服平衡的地圖
 */
(function () {
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialBalanceApplied) return;
    window.__officialBalanceApplied = true;

    const CFG = window.OFFICIAL_BALANCE = {
        version: 'OB5',

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

    // ===== OB5：常見怪物個別收益 =====
    // 只在 CFG.zones 已納入的仿正服地圖生效。
    // 這些倍率會再乘上各地圖的 exp/gold/drop 倍率。
    const MONSTER_BALANCE = {
        '骷髏':   { exp: 0.95, gold: 0.90, drop: 0.90 },
        '食屍鬼': { exp: 1.08, gold: 1.00, drop: 1.03 },
        '史巴托': { exp: 1.10, gold: 1.05, drop: 1.08 },
        '萊肯':   { exp: 1.12, gold: 1.08, drop: 1.05 }
    };

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
                    if (Number.isFinite(rate)) copy[1] = rate * mult;
                    return copy;
                });

                restoreList.push([table, key, original]);
            }

            killMob = function (idx) {
                const mob = (typeof mapState !== 'undefined' && mapState && mapState.mobs)
                    ? mapState.mobs[idx]
                    : null;
                const z = zoneCfg();

                if (!mob || !z) return _baseKillMob(idx);

                const m = monsterCfg(mob);
                const originalExp = mob.exp;
                const restores = [];

                // 區域經驗：只在結算這一刻調整，不永久改 DB 怪物資料。
                if (Number.isFinite(Number(originalExp)) && Number(originalExp) > 0) {
                    const monsterExp = m ? m.exp : 1;
                    mob.exp = Math.max(1, Math.floor(Number(originalExp) * z.exp * monsterExp));
                }

                const effectiveDrop = z.drop * (m ? m.drop : 1);

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
