/*
 * 仿正服平衡層 OB1
 * 只由 official.html 載入；原 index.html 完全不受影響。
 * 目標不是 1:1 複刻某一個正服版本，而是把成長速度、掉寶與金幣產出拉回較接近正服的節奏。
 */
(function () {
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialBalanceApplied) return;
    window.__officialBalanceApplied = true;

    const CFG = window.OFFICIAL_BALANCE = {
        version: 'OB1',
        dropMult: 0.55,
        goldMult: 0.70,
        expReqMult: {
            '1-29': 1.00,
            '30-39': 1.10,
            '40-49': 1.25,
            '50-59': 1.50,
            '60-69': 1.80,
            '70-79': 2.20,
            '80-89': 2.80,
            '90-99': 3.50
        }
    };

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

    // 經驗：保留低等級原本節奏，30 級後逐段拉長。
    try {
        if (typeof EXP_REQ_CLASSIC !== 'undefined' && Array.isArray(EXP_REQ_CLASSIC)) {
            for (let lv = 1; lv < Math.min(100, EXP_REQ_CLASSIC.length); lv++) {
                let req = Number(EXP_REQ_CLASSIC[lv]);
                if (Number.isFinite(req) && req > 0) {
                    EXP_REQ_CLASSIC[lv] = Math.max(1, Math.round(req * expReqFactor(lv)));
                }
            }
        }
    } catch (e) {
        console.warn('[official-balance] EXP patch failed', e);
    }

    // 組隊：取消原版「有效隊伍人數直接乘掉寶/金幣，最高 x8」。
    try {
        if (typeof partyRewardMult === 'function') {
            partyRewardMult = function () { return 1; };
        }
        if (typeof partyDropRate === 'function') {
            partyDropRate = function (rate) {
                return Math.min(1, Math.max(0, Number(rate) || 0) * CFG.dropMult);
            };
        }
    } catch (e) {
        console.warn('[official-balance] party reward patch failed', e);
    }

    // 掉寶：主要掉落管線整體下修。
    try {
        if (typeof classicDropMult === 'function') {
            classicDropMult = function () { return CFG.dropMult; };
        }
    } catch (e) {
        console.warn('[official-balance] drop patch failed', e);
    }

    // 組隊經驗加成：王族每隊友 +2%、其他 +1%，最高 +10%。
    try {
        if (typeof partyExpBonusPct === 'function') {
            partyExpBonusPct = function () {
                let mates = (player && player.allies ? player.allies : [])
                    .filter(a => a && !a._downed).length;
                if (mates <= 0) return 0;
                let each = (player && player.cls === 'royal') ? 2 : 1;
                return Math.min(10, mates * each);
            };
        }
    } catch (e) {
        console.warn('[official-balance] party EXP patch failed', e);
    }

    // 金幣：保留原本等級曲線與頭目設定，單次金額改為 70%。
    try {
        if (typeof monsterGoldRange === 'function') {
            const _baseMonsterGoldRange = monsterGoldRange;
            monsterGoldRange = function (mob) {
                let r = _baseMonsterGoldRange(mob) || { min: 1, max: 1 };
                let min = Math.max(1, Math.floor((Number(r.min) || 1) * CFG.goldMult));
                let max = Math.max(min, Math.floor((Number(r.max) || min) * CFG.goldMult));
                return { min, max };
            };
        }
    } catch (e) {
        console.warn('[official-balance] gold patch failed', e);
    }

    function markOfficialMode() {
        try {
            document.title = '放置天堂 - 仿正服版';
            const h1 = document.querySelector('#login-title-layer h1');
            if (h1) h1.textContent = '放置天堂 - 仿正服版';

            const v = document.getElementById('login-version');
            if (v && !v.textContent.includes('仿正服')) {
                v.textContent = v.textContent + ' · 仿正服 ' + CFG.version;
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

