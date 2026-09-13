/*
 * 放置天堂－仿正服平衡層 OB2
 * 僅由 official.html 載入，原版 index.html 不受影響。
 *
 * OB2：
 * 1. 保留 OB1 經驗需求曲線
 * 2. 取消隊伍掉寶/金幣直接乘人數
 * 3. 第一批區域平衡：新兵修練場→說話之島→港口→古魯丁
 * 4. 區域經驗、金幣、主要掉落逐步收緊
 */
(function () {
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialBalanceApplied) return;
    window.__officialBalanceApplied = true;

    const CFG = window.OFFICIAL_BALANCE = {
        version: 'OB2',

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
            }
        }
    };

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
                const mult = CFG.baseGoldMult * zoneGold;

                const min = Math.max(1, Math.floor((Number(r.min) || 1) * mult));
                const max = Math.max(min, Math.floor((Number(r.max) || min) * mult));
                return { min, max };
            };
        }
    } catch (e) {
        console.warn('[official-balance] gold patch failed', e);
    }

    // ===== 第一批地區：經驗＋主要掉落表 =====
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

                const originalExp = mob.exp;
                const restores = [];

                // 區域經驗：只在結算這一刻調整，不永久改 DB 怪物資料。
                if (Number.isFinite(Number(originalExp)) && Number(originalExp) > 0) {
                    mob.exp = Math.max(1, Math.floor(Number(originalExp) * z.exp));
                }

                // 區域主要掉寶：
                // 只調整目前這隻怪的各職業/一般掉落表，結算後立即恢復。
                // 任務另行強制 100% 的掉落邏輯不會被這裡破壞。
                try {
                    if (typeof MOB_DROPS !== 'undefined') {
                        scaleTable(MOB_DROPS, mob.n, z.drop, restores);
                    }
                    if (typeof DARK_WEAPON_DROPS !== 'undefined') {
                        scaleTable(DARK_WEAPON_DROPS, mob.n, z.drop, restores);
                    }
                    if (typeof DARK_CRYSTAL_DROPS !== 'undefined') {
                        scaleTable(DARK_CRYSTAL_DROPS, mob.n, z.drop, restores);
                    }
                    if (typeof DRAGON_DROPS !== 'undefined') {
                        scaleTable(DRAGON_DROPS, mob.n, z.drop, restores);
                    }
                    if (typeof WARRIOR_DROPS !== 'undefined') {
                        scaleTable(WARRIOR_DROPS, mob.n, z.drop, restores);
                    }
                    if (typeof MEM_DROPS !== 'undefined') {
                        scaleTable(MEM_DROPS, mob.n, z.drop, restores);
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

