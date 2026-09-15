// 仿正服：四種屬性卷軸商店 + 五階屬性發動效果
(function () {
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialAttrScrollProcV1) return;
    window.__officialAttrScrollProcV1 = true;

    const IDS = [
        'scroll_attr_fire',
        'scroll_attr_water',
        'scroll_attr_wind',
        'scroll_attr_earth'
    ];

    const PRICE = 50000;

    // 1~5階發動率
    const PROC_RATE = [0, 2, 4, 6, 8, 10];

    // 火屬性傷害倍率
    const FIRE_MULT = [
        1,
        0.8,
        1.1,
        1.5,
        1.7,
        2.0
    ];

    // 地屬性暈眩秒數
    const EARTH_STUN_SEC = [
        0,
        1,
        1,
        1,
        1.5,
        1.5
    ];

    // 水屬性吸魔
    const WATER_MP = [
        null,
        [10, 15],
        [20, 25],
        [30, 35],
        [40, 45],
        [50, 55]
    ];


    // ================================
    // 商店價格 + 說明
    // ================================
    if (typeof DB !== 'undefined' && DB && DB.items) {

        for (const id of IDS) {
            if (DB.items[id]) DB.items[id].p = PRICE;
        }

        if (DB.items.scroll_attr_wind) {
            DB.items.scroll_attr_wind.d =
                '可以賦予武器風屬性傷害。'
                + '1階2%、2階4%、3階6%、4階8%、5階10%機率發動；'
                + '發動時本次傷害變成範圍攻擊，最多同時攻擊3隻敵人。';
        }

        if (DB.items.scroll_attr_earth) {
            DB.items.scroll_attr_earth.d =
                '可以賦予武器地屬性傷害。'
                + '1階2%、2階4%、3階6%、4階8%、5階10%機率發動；'
                + '1~3階暈眩1秒，4~5階暈眩1.5秒。';
        }

        if (DB.items.scroll_attr_water) {
            DB.items.scroll_attr_water.d =
                '可以賦予武器水屬性傷害。'
                + '1階2%吸取10~15MP；'
                + '2階4%吸取20~25MP；'
                + '3階6%吸取30~35MP；'
                + '4階8%吸取40~45MP；'
                + '5階10%吸取50~55MP。';
        }

        if (DB.items.scroll_attr_fire) {
            DB.items.scroll_attr_fire.d =
                '可以賦予武器火屬性傷害。'
                + '1階2%造成0.8倍傷害；'
                + '2階4%造成1.1倍傷害；'
                + '3階6%造成1.5倍傷害；'
                + '4階8%造成1.7倍傷害；'
                + '5階10%造成2.0倍傷害。';
        }
    }


    // ================================
    // 商店加入四張卷軸
    // ================================
    if (typeof SHOP_LISTS !== 'undefined' && SHOP_LISTS) {

        function addToShop(key) {

            const list = SHOP_LISTS[key];

            if (!Array.isArray(list)) return;

            for (const id of IDS) {

                if (!list.includes(id)) {
                    list.push(id);
                }

            }
        }

        addToShop('default');
        addToShop('npc_boni');
        addToShop('npc_skvati');
    }


    // ================================
    // 將發動資料掛入屬性資料
    // ================================
    if (typeof ATTR_AFFIX !== 'undefined') {

        Object.keys(ATTR_AFFIX).forEach(function (key) {

            const a = ATTR_AFFIX[key];

            if (!a || !a.ele || !a.tier) return;

            a.procRate = PROC_RATE[a.tier] || 0;

            if (a.ele === 'fire') {
                a.procDamageMult = FIRE_MULT[a.tier];
            }

            if (a.ele === 'earth') {
                a.procStunSec = EARTH_STUN_SEC[a.tier];
            }

            if (a.ele === 'water') {
                a.procMpDrain = WATER_MP[a.tier];
            }

            if (a.ele === 'wind') {
                a.procTargets = 3;
            }

        });
    }


    // ================================
    // 戰鬥效果
    // ================================
    if (
        typeof playerAttack !== 'function' ||
        typeof getPhysicalDmg !== 'function'
    ) {
        console.warn('[official-attr] 找不到戰鬥函式');
        return;
    }


    let attrAttackCtx = null;

    const baseGetPhysicalDmg = getPhysicalDmg;
    const basePlayerAttack = playerAttack;


    // 攔截這一次一般攻擊
    getPhysicalDmg = function () {

        const result =
            baseGetPhysicalDmg.apply(this, arguments);

        if (
            !attrAttackCtx ||
            attrAttackCtx.rolled ||
            !result ||
            !result.hit
        ) {
            return result;
        }


        // 一次攻擊只判定一次屬性
        attrAttackCtx.rolled = true;


        const wpnInst =
            arguments[8] ||
            (
                typeof player !== 'undefined' &&
                player.eq
                    ? player.eq.wpn
                    : null
            );


        const aff =
            (
                wpnInst &&
                typeof getAttrAffix === 'function'
            )
                ? getAttrAffix(wpnInst.attr)
                : null;


        if (!aff || !aff.tier || !aff.ele) {
            return result;
        }


        const rate =
            PROC_RATE[aff.tier] || 0;


        if (
            rate <= 0 ||
            Math.random() * 100 >= rate
        ) {
            return result;
        }


        attrAttackCtx.proc = {
            ele: aff.ele,
            tier: aff.tier,
            aff: aff,
            target: arguments[1],
            result: result
        };


        // ================================
        // 火：直接修改本次傷害
        // ================================
        if (aff.ele === 'fire') {

            const mult =
                FIRE_MULT[aff.tier] || 1;

            result.dmg =
                Math.max(
                    1,
                    Math.floor(
                        (result.dmg || 0) * mult
                    )
                );

            attrAttackCtx.proc.fireMult = mult;
        }


        return result;
    };


    function aliveMob(m) {

        return !!(
            m &&
            !m._dead &&
            (m.curHp || 0) > 0
        );
    }


    function finishAttrProc(proc) {

        if (!proc || !proc.aff) return;

        const aff = proc.aff;
        const tier = proc.tier;
        const target = proc.target;

        // 這個物件會被原本戰鬥程式繼續修改，
        // 所以這裡取得的是最終本次攻擊傷害。
        const finalDmg =
            Math.max(
                1,
                Math.floor(
                    (proc.result &&
                     proc.result.dmg) || 1
                )
            );


        // ================================
        // 火
        // ================================
        if (proc.ele === 'fire') {

            logCombat(
                `<span class="font-bold text-red-400">【${aff.n}】</span>`
                + `火屬性發動！本次傷害 ×${proc.fireMult.toFixed(1)}。`,
                'player-special'
            );

            return;
        }


        // ================================
        // 水：恢復自己的 MP
        // ================================
        if (proc.ele === 'water') {

            const range =
                WATER_MP[tier] || [0, 0];

            const amount =
                range[0] +
                Math.floor(
                    Math.random() *
                    (range[1] - range[0] + 1)
                );


            const before =
                player.mp || 0;


            player.mp =
                Math.min(
                    player.mmp || before,
                    before + amount
                );


            const gained =
                Math.max(
                    0,
                    player.mp - before
                );


            updateUI();


            logCombat(
                `<span class="font-bold text-cyan-300">【${aff.n}】</span>`
                + `水屬性發動！吸取 ${amount} MP`
                + (
                    gained !== amount
                        ? `（實際恢復 ${gained}）`
                        : ''
                )
                + '。',
                'player-special'
            );

            return;
        }


        // ================================
        // 地：暈眩
        // ================================
        if (proc.ele === 'earth') {

            if (!aliveMob(target)) return;

            const sec =
                EARTH_STUN_SEC[tier] || 1;


            if (typeof applyMobStatus === 'function') {

                applyMobStatus(
                    target,
                    {
                        kind: 'stun',
                        dur: sec,
                        force: true
                    },
                    aff.n
                );

            } else {

                if (!target.st) target.st = {};

                target.st.stun =
                    Math.max(
                        target.st.stun || 0,
                        Math.round(sec * 10)
                    );
            }


            mobWake(target);


            logCombat(
                `<span class="font-bold text-yellow-300">【${aff.n}】</span>`
                + `地屬性發動！`
                + `<span class="${getMobColor(target.lv)}">${target.n}</span>`
                + ` 暈眩 ${sec} 秒。`,
                'player-special'
            );

            return;
        }


        // ================================
        // 風：本次傷害擴散
        // 主目標 + 另外兩隻 = 最多3隻
        // ================================
        if (proc.ele === 'wind') {

            if (
                typeof mapState === 'undefined' ||
                !mapState ||
                !Array.isArray(mapState.mobs)
            ) {
                return;
            }


            const extras =
                mapState.mobs
                    .filter(function (m) {

                        return (
                            aliveMob(m) &&
                            m !== target
                        );

                    })
                    .slice(0, 2);


            let hitCount = 1;


            for (const mob of extras) {

                mob.curHp -= finalDmg;

                mob.justHit = 'wind';

                mobWake(mob);

                hitCount++;


                if (mob.curHp <= 0) {

                    const idx =
                        mapState.mobs.findIndex(
                            x =>
                                x &&
                                x.uid === mob.uid
                        );


                    if (idx !== -1) {
                        killMob(idx);
                    }

                }
            }


            if (
                !state.ff &&
                typeof renderMobs === 'function'
            ) {
                renderMobs();
            }


            logCombat(
                `<span class="font-bold text-emerald-300">【${aff.n}】</span>`
                + `風屬性發動！本次 ${finalDmg} 點傷害擴散，`
                + `攻擊 ${hitCount} 隻敵人。`,
                'player-special'
            );
        }
    }


    // 每一次玩家一般攻擊建立一次判定
    playerAttack = function () {

        const prev =
            attrAttackCtx;

        const ctx = {
            rolled: false,
            proc: null
        };


        attrAttackCtx = ctx;


        try {

            return basePlayerAttack.apply(
                this,
                arguments
            );

        } finally {

            attrAttackCtx = prev;

            if (ctx.proc) {
                finishAttrProc(ctx.proc);
            }

        }
    };


    console.info(
        '[official-attr] 五階屬性效果已啟用'
    );

})();
