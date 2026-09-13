/*
 * 放置天堂－仿正服平衡層 OB25
 * 僅由 official.html 載入，原版 index.html 不受影響。
 *
 * OB25：
 * 1. 保留 OB1~OB24 全部仿正服設定
 * 2. 新增格蘭肯神殿・長老之室與四軍王房
 * 3. 長老之室定位為高風險高經驗區，金幣與掉寶進一步收斂
 * 4. 四軍王依實際等級與技能分別設定回報
 * 5. 8位長老＋4位軍王納入既有頭目稀有掉落分層
 */
(function () {
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialBalanceApplied) return;
    window.__officialBalanceApplied = true;

    const CFG = window.OFFICIAL_BALANCE = {
        version: 'OB25',

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
            },
            windwood: {
                name: '風木',
                exp: 0.84,
                gold: 0.72,
                drop: 0.72
            },
            desert: {
                name: '沙漠',
                exp: 0.88,
                gold: 0.74,
                drop: 0.70
            },
            zone_15: {
                name: '眠龍洞穴1樓',
                exp: 0.86,
                gold: 0.71,
                drop: 0.70
            },
            zone_16: {
                name: '眠龍洞穴2樓',
                exp: 0.88,
                gold: 0.72,
                drop: 0.69
            },
            zone_17: {
                name: '眠龍洞穴3樓',
                exp: 0.91,
                gold: 0.74,
                drop: 0.68
            },
            crystal_cave1: {
                name: '水晶洞穴1樓',
                exp: 0.89,
                gold: 0.72,
                drop: 0.69
            },
            crystal_cave2: {
                name: '水晶洞穴2樓',
                exp: 0.92,
                gold: 0.74,
                drop: 0.67
            },
            crystal_cave3: {
                name: '水晶洞穴3樓',
                exp: 0.95,
                gold: 0.76,
                drop: 0.65
            },

            // OB14：奇岩地監
            zone_18: {
                name: '奇岩地監1樓',
                exp: 0.88,
                gold: 0.71,
                drop: 0.70
            },
            zone_19: {
                name: '奇岩地監2樓',
                exp: 0.90,
                gold: 0.72,
                drop: 0.69
            },
            zone_20: {
                name: '奇岩地監3樓',
                exp: 0.92,
                gold: 0.73,
                drop: 0.68
            },
            zone_21: {
                name: '奇岩地監4樓',
                exp: 0.95,
                gold: 0.75,
                drop: 0.67
            },

            // OB14：沙漠地監
            zone_22: {
                name: '沙漠地監1樓',
                exp: 0.86,
                gold: 0.70,
                drop: 0.70
            },
            zone_23: {
                name: '沙漠地監2樓',
                exp: 0.89,
                gold: 0.72,
                drop: 0.69
            },
            zone_24: {
                name: '沙漠地監3樓',
                exp: 0.92,
                gold: 0.74,
                drop: 0.68
            },
            zone_25: {
                name: '沙漠地監4樓',
                exp: 0.96,
                gold: 0.76,
                drop: 0.66
            },

            // OB15：龍之谷地監
            zone_26: {
                name: '龍之谷地監1樓',
                exp: 0.94,
                gold: 0.74,
                drop: 0.68
            },
            zone_27: {
                name: '龍之谷地監2樓',
                exp: 0.96,
                gold: 0.75,
                drop: 0.67
            },
            zone_28: {
                name: '龍之谷地監3樓',
                exp: 0.98,
                gold: 0.76,
                drop: 0.66
            },
            zone_29: {
                name: '龍之谷地監4樓',
                exp: 1.00,
                gold: 0.77,
                drop: 0.65
            },
            zone_30: {
                name: '龍之谷地監5樓',
                exp: 1.03,
                gold: 0.79,
                drop: 0.64
            },
            zone_31: {
                name: '龍之谷地監6樓',
                exp: 1.06,
                gold: 0.81,
                drop: 0.63
            },

            // OB16：螞蟻洞窟
            zone_32: {
                name: '螞蟻洞窟1樓',
                exp: 0.96,
                gold: 0.74,
                drop: 0.67
            },
            zone_33: {
                name: '螞蟻洞窟2樓',
                exp: 1.00,
                gold: 0.77,
                drop: 0.65
            },

            // OB16：地下通道
            zone_34: {
                name: '地下通道1樓',
                exp: 0.92,
                gold: 0.72,
                drop: 0.68
            },
            zone_35: {
                name: '地下通道2樓',
                exp: 0.95,
                gold: 0.74,
                drop: 0.67
            },
            zone_36: {
                name: '地下通道3樓',
                exp: 0.98,
                gold: 0.76,
                drop: 0.66
            },

            // OB16：海音野外
            heine: {
                name: '海音',
                exp: 0.91,
                gold: 0.73,
                drop: 0.69
            },

            // OB17：伊娃王國
            eva_kingdom: {
                name: '伊娃王國',
                exp: 0.98,
                gold: 0.75,
                drop: 0.67
            },

            // OB17：象牙塔
            zone_37: {
                name: '象牙塔4樓',
                exp: 1.00,
                gold: 0.76,
                drop: 0.66
            },
            zone_38: {
                name: '象牙塔5樓',
                exp: 1.03,
                gold: 0.78,
                drop: 0.65
            },
            zone_39: {
                name: '象牙塔6樓',
                exp: 1.06,
                gold: 0.80,
                drop: 0.64
            },
            zone_40: {
                name: '象牙塔7樓',
                exp: 1.09,
                gold: 0.82,
                drop: 0.63
            },
            zone_41: {
                name: '象牙塔8樓',
                exp: 1.12,
                gold: 0.84,
                drop: 0.62
            },

            // OB18：中後期野外
            dragon_valley: {
                name: '龍之谷野外',
                exp: 1.04,
                gold: 0.78,
                drop: 0.65
            },
            fire_dragon: {
                name: '火龍窟',
                exp: 1.10,
                gold: 0.82,
                drop: 0.61
            },
            giran: {
                name: '奇岩周邊',
                exp: 0.96,
                gold: 0.75,
                drop: 0.67
            },

            // OB19：主要野外區
            silver_knight: {
                name: '銀騎士村周邊',
                exp: 0.84,
                gold: 0.70,
                drop: 0.72
            },
            kent: {
                name: '肯特周邊',
                exp: 0.88,
                gold: 0.72,
                drop: 0.70
            },
            mirror_forest: {
                name: '鏡子森林',
                exp: 1.01,
                gold: 0.77,
                drop: 0.65
            },
            twilight_mt: {
                name: '黃昏山脈',
                exp: 1.08,
                gold: 0.80,
                drop: 0.63
            },

            // OB20：前中期世界區域
            zone_01: {
                name: '妖精森林周邊',
                exp: 0.86,
                gold: 0.71,
                drop: 0.72
            },
            elf_forest: {
                name: '妖魔森林',
                exp: 0.92,
                gold: 0.74,
                drop: 0.69
            },
            windwood_dungeon: {
                name: '風木地監',
                exp: 0.96,
                gold: 0.76,
                drop: 0.66
            },

            // OB21：歐瑞／艾爾摩
            zone_02: {
                name: '歐瑞',
                exp: 0.92,
                gold: 0.73,
                drop: 0.69
            },
            zone_03: {
                name: '歐瑞雪原',
                exp: 0.97,
                gold: 0.75,
                drop: 0.67
            },
            zone_04: {
                name: '艾爾摩激戰地',
                exp: 1.00,
                gold: 0.77,
                drop: 0.65
            },
            zone_05: {
                name: '國境要塞',
                exp: 1.02,
                gold: 0.78,
                drop: 0.64
            },

            // OB21：夢幻之島（偏經驗型特殊區）
            dream_island: {
                name: '夢幻之島',
                exp: 1.08,
                gold: 0.78,
                drop: 0.60
            },

            // OB22：沉默洞穴／精靈墓穴／大洞穴
            silent_outer: {
                name: '沉默洞穴周邊',
                exp: 0.90,
                gold: 0.72,
                drop: 0.70
            },
            hidden_cave: {
                name: '大洞穴隱遁者村莊地區',
                exp: 1.03,
                gold: 0.77,
                drop: 0.64
            },
            elf_grave: {
                name: '精靈墓穴',
                exp: 1.12,
                gold: 0.82,
                drop: 0.60
            },

            // OB23：拉斯塔巴德地下洞穴
            rastabad_cave1: {
                name: '拉斯塔巴德地下洞穴1樓',
                exp: 0.90,
                gold: 0.72,
                drop: 0.70
            },
            rastabad_cave2: {
                name: '拉斯塔巴德地下洞穴2樓',
                exp: 0.96,
                gold: 0.74,
                drop: 0.67
            },
            rastabad_cave3: {
                name: '拉斯塔巴德地下洞穴3樓',
                exp: 1.04,
                gold: 0.78,
                drop: 0.63
            },
            rastabad_gate: {
                name: '拉斯塔巴德正門',
                exp: 1.08,
                gold: 0.80,
                drop: 0.61
            },

            // OB23：古代巨人之墓
            giant_tomb: {
                name: '古代巨人之墓',
                exp: 1.15,
                gold: 0.84,
                drop: 0.58
            },

            // OB24：拉斯塔巴德後段訓練區
            rastabad_beast: {
                name: '魔獸訓練場',
                exp: 1.10,
                gold: 0.80,
                drop: 0.60
            },
            dark_magic_lab: {
                name: '黑魔法研究室',
                exp: 1.13,
                gold: 0.82,
                drop: 0.59
            },
            necro_training: {
                name: '冥法軍訓練場',
                exp: 1.18,
                gold: 0.85,
                drop: 0.57
            },

            // OB25：格蘭肯神殿・長老之室
            elder_room: {
                name: '格蘭肯神殿・長老之室',
                exp: 1.24,
                gold: 0.86,
                drop: 0.54
            },

            // OB25：四軍王房
            assassin_king_room: {
                name: '暗殺軍王之室',
                exp: 1.17,
                gold: 0.85,
                drop: 0.55
            },
            king_baranka_room: {
                name: '魔獸軍王之室',
                exp: 1.18,
                gold: 0.86,
                drop: 0.55
            },
            law_king_room: {
                name: '法令軍王之室',
                exp: 1.20,
                gold: 0.86,
                drop: 0.54
            },
            necro_king_room: {
                name: '冥法軍王之室',
                exp: 1.23,
                gold: 0.88,
                drop: 0.53
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
        '巴風特':      { exp: 1.45, gold: 1.30, drop: 1.35 },

        // OB13 中期代表怪物
        '邪惡蜥蜴':    { exp: 1.12, gold: 1.05, drop: 1.05 },
        '冰人':        { exp: 1.05, gold: 1.00, drop: 1.03 },
        '冰魔':        { exp: 1.35, gold: 1.15, drop: 1.30 },
        '冰之女王':    { exp: 1.45, gold: 1.20, drop: 1.35 },

        // OB14：奇岩／沙漠地監代表怪物
        '妖魔殭屍':    { exp: 1.05, gold: 1.00, drop: 1.02 },
        '卡司特':      { exp: 1.10, gold: 1.04, drop: 1.05 },
        '黑暗精靈':    { exp: 1.15, gold: 1.08, drop: 1.08 },

        // OB15：龍之谷地監代表怪物
        '骷髏神射手':  { exp: 1.10, gold: 1.04, drop: 1.05 },
        '骷髏警衛':    { exp: 1.08, gold: 1.03, drop: 1.04 },
        '多羅':        { exp: 1.10, gold: 1.05, drop: 1.05 },
        '骷髏鬥士':    { exp: 1.12, gold: 1.06, drop: 1.06 },
        '莫妮亞':      { exp: 1.15, gold: 1.08, drop: 1.08 },
        '阿魯巴':      { exp: 1.18, gold: 1.10, drop: 1.10 },

        // OB16：螞蟻洞窟代表怪物
        '白螞蟻群':        { exp: 1.05, gold: 1.00, drop: 1.03 },
        '巨大白螞蟻':      { exp: 1.08, gold: 1.03, drop: 1.05 },
        '強化巨蟻':        { exp: 1.10, gold: 1.05, drop: 1.06 },
        '強化白螞蟻群':    { exp: 1.12, gold: 1.06, drop: 1.07 },
        '巨大突擊螞蟻':    { exp: 1.15, gold: 1.08, drop: 1.08 },
        '巨大強化白螞蟻':  { exp: 1.18, gold: 1.10, drop: 1.10 },

        // OB16：地下通道／海音代表怪物
        '蟑螂人':      { exp: 1.08, gold: 1.02, drop: 1.04 },
        '蟹人':        { exp: 1.05, gold: 1.02, drop: 1.03 },
        '蛇女':        { exp: 1.08, gold: 1.04, drop: 1.05 },
        '多眼怪':      { exp: 1.15, gold: 1.08, drop: 1.08 },

        // OB17：伊娃王國
        '海星':        { exp: 1.08, gold: 1.03, drop: 1.04 },
        '希爾黛斯':    { exp: 1.10, gold: 1.05, drop: 1.06 },
        '伊萊克頓':    { exp: 1.15, gold: 1.08, drop: 1.08 },
        '奎斯坦修':    { exp: 1.18, gold: 1.10, drop: 1.10 },

        // OB17：象牙塔4~5樓
        '紙人':        { exp: 1.08, gold: 1.03, drop: 1.04 },
        '密密':        { exp: 1.12, gold: 1.05, drop: 1.06 },
        '活鎧甲':      { exp: 1.14, gold: 1.06, drop: 1.07 },
        '鋼鐵高崙':    { exp: 1.18, gold: 1.08, drop: 1.08 },

        // OB17：象牙塔6~8樓
        '影魔':        { exp: 1.16, gold: 1.08, drop: 1.08 },
        '鬼魂':        { exp: 1.14, gold: 1.06, drop: 1.07 },
        '紅鬼魂':      { exp: 1.18, gold: 1.08, drop: 1.09 },
        '死神':        { exp: 1.20, gold: 1.10, drop: 1.10 },

        // OB18：龍之谷野外
        '亞力安':      { exp: 1.15, gold: 1.06, drop: 1.07 },
        '飛龍':        { exp: 1.40, gold: 1.20, drop: 1.30 },
        '黑長者':      { exp: 1.45, gold: 1.22, drop: 1.32 },

        // OB18：火龍窟
        '火焰弓箭手':  { exp: 1.08, gold: 1.03, drop: 1.04 },
        '龍蠅':        { exp: 1.10, gold: 1.04, drop: 1.05 },
        '火焰戰士':    { exp: 1.10, gold: 1.04, drop: 1.05 },
        '火蜥蜴':      { exp: 1.12, gold: 1.05, drop: 1.06 },
        '火炎蛋':      { exp: 1.14, gold: 1.06, drop: 1.07 },
        '熔岩高崙':    { exp: 1.18, gold: 1.08, drop: 1.08 },
        '阿西塔基奧':  { exp: 1.20, gold: 1.10, drop: 1.10 },
        '伊弗利特':    { exp: 1.42, gold: 1.22, drop: 1.32 },
        '烈炎獸':      { exp: 1.22, gold: 1.10, drop: 1.12 },
        '不死鳥':      { exp: 1.55, gold: 1.30, drop: 1.42 },

        // OB18：奇岩周邊
        '強盜':        { exp: 1.08, gold: 1.04, drop: 1.04 },
        '強盜頭目':    { exp: 1.15, gold: 1.08, drop: 1.08 },
        '格利芬':      { exp: 1.10, gold: 1.05, drop: 1.05 },
        '卡司特王':    { exp: 1.15, gold: 1.08, drop: 1.08 },
        '獨眼巨人':    { exp: 1.18, gold: 1.10, drop: 1.10 },

        // OB19：銀騎士村／肯特
        '黑騎士':      { exp: 1.05, gold: 1.02, drop: 1.03 },
        '龍龜':        { exp: 1.12, gold: 1.05, drop: 1.06 },
        '哈維':        { exp: 1.12, gold: 1.06, drop: 1.06 },
        '歐吉':        { exp: 1.15, gold: 1.08, drop: 1.08 },

        // OB19：鏡子森林
        '變形怪':      { exp: 1.10, gold: 1.05, drop: 1.06 },
        '變形怪首領':  { exp: 1.45, gold: 1.22, drop: 1.32 },

        // OB19：黃昏山脈
        '巨人':        { exp: 1.10, gold: 1.05, drop: 1.05 },
        '巨人戰士':    { exp: 1.14, gold: 1.07, drop: 1.07 },
        '巨人長老':    { exp: 1.18, gold: 1.09, drop: 1.09 },
        '古代巨人':    { exp: 1.50, gold: 1.28, drop: 1.38 },

        // OB20：妖魔森林／妖精森林
        '甘地妖魔':    { exp: 1.03, gold: 1.00, drop: 1.02 },
        '妖魔法師':    { exp: 1.08, gold: 1.03, drop: 1.04 },
        '羅孚妖魔':    { exp: 1.05, gold: 1.02, drop: 1.03 },
        '妖魔巡守':    { exp: 1.08, gold: 1.04, drop: 1.04 },
        '那魯加妖魔':  { exp: 1.10, gold: 1.05, drop: 1.05 },

        // OB20：風木地監
        '怪手':        { exp: 1.05, gold: 1.02, drop: 1.03 },
        '巴列斯':      { exp: 1.48, gold: 1.25, drop: 1.36 },

        // OB21：歐瑞／艾爾摩
        '雪人':        { exp: 1.08, gold: 1.03, drop: 1.04 },
        '艾爾摩士兵':  { exp: 1.10, gold: 1.05, drop: 1.05 },
        '艾爾摩法師':  { exp: 1.15, gold: 1.08, drop: 1.08 },
        '冰石高崙':    { exp: 1.12, gold: 1.05, drop: 1.06 },
        '冰原老虎':    { exp: 1.10, gold: 1.05, drop: 1.05 },
        '雪怪':        { exp: 1.12, gold: 1.06, drop: 1.06 },
        '艾爾摩將軍':  { exp: 1.20, gold: 1.10, drop: 1.10 },

        // OB21：夢幻之島一般怪
        '夢幻之島蘑菇':      { exp: 1.10, gold: 1.03, drop: 1.03 },
        '夢幻之島鬼火':      { exp: 1.10, gold: 1.03, drop: 1.03 },
        '夢幻之島火蜥蜴':    { exp: 1.12, gold: 1.04, drop: 1.04 },
        '夢幻之島殺人蜂':    { exp: 1.15, gold: 1.05, drop: 1.05 },
        '夢幻之島暴走兔':    { exp: 1.15, gold: 1.05, drop: 1.05 },
        '夢幻之島火炎蛋':    { exp: 1.16, gold: 1.06, drop: 1.06 },
        '夢幻之島冰石高崙':  { exp: 1.16, gold: 1.06, drop: 1.06 },
        '夢幻之島閃電球':    { exp: 1.16, gold: 1.06, drop: 1.06 },
        '夢幻之島鎧甲守衛':  { exp: 1.18, gold: 1.08, drop: 1.07 },
        '夢幻之島大鬼火':    { exp: 1.18, gold: 1.08, drop: 1.07 },

        // OB21：夢幻之島頭目
        '夢幻之島火精靈王':  { exp: 1.40, gold: 1.18, drop: 1.28 },
        '夢幻之島水精靈王':  { exp: 1.40, gold: 1.18, drop: 1.28 },
        '夢幻之島風精靈王':  { exp: 1.40, gold: 1.18, drop: 1.28 },
        '夢幻之島地精靈王':  { exp: 1.40, gold: 1.18, drop: 1.28 },
        '獨角獸':            { exp: 1.45, gold: 1.20, drop: 1.30 },
        '夢魘':              { exp: 1.42, gold: 1.18, drop: 1.28 },

        // OB22：大洞穴隱遁者村莊地區
        '黑暗妖精盜賊':          { exp: 1.08, gold: 1.03, drop: 1.04 },
        '闇之精靈':              { exp: 1.06, gold: 1.02, drop: 1.03 },
        '闇精靈王':              { exp: 1.10, gold: 1.05, drop: 1.05 },
        '金屬蜈蚣':              { exp: 1.12, gold: 1.06, drop: 1.06 },
        '黑法師':                { exp: 1.15, gold: 1.08, drop: 1.08 },
        '黑暗妖精警衛(十字弓)':  { exp: 1.08, gold: 1.04, drop: 1.04 },
        '黑暗妖精警衛(矛)':      { exp: 1.10, gold: 1.05, drop: 1.05 },
        '黑暗妖精巡守':          { exp: 1.10, gold: 1.05, drop: 1.05 },
        '黑暗妖精士兵':          { exp: 1.12, gold: 1.06, drop: 1.06 },
        '黑暗妖精將軍':          { exp: 1.18, gold: 1.10, drop: 1.10 },

        // 原始資料 Lv26 卻給 2026 EXP，仿正服版特別校正避免形成低等刷經驗點。
        '黑暗妖精魔法學徒':      { exp: 0.50, gold: 1.05, drop: 1.05 },

        // OB22：精靈墓穴
        '地之牙':        { exp: 1.08, gold: 1.03, drop: 1.04 },
        '風之牙':        { exp: 1.08, gold: 1.03, drop: 1.04 },
        '水之牙':        { exp: 1.08, gold: 1.03, drop: 1.04 },
        '火之牙':        { exp: 1.08, gold: 1.03, drop: 1.04 },
        '深淵食屍鬼':    { exp: 1.12, gold: 1.05, drop: 1.05 },
        '深淵弓箭手':    { exp: 1.15, gold: 1.06, drop: 1.06 },
        '地靈之主':      { exp: 1.15, gold: 1.07, drop: 1.07 },
        '風靈之主':      { exp: 1.15, gold: 1.07, drop: 1.07 },
        '水靈之主':      { exp: 1.15, gold: 1.07, drop: 1.07 },
        '火靈之主':      { exp: 1.15, gold: 1.07, drop: 1.07 },
        '西斯':          { exp: 1.20, gold: 1.10, drop: 1.10 },
        '深淵水靈':      { exp: 1.22, gold: 1.10, drop: 1.10 },
        '深淵地靈':      { exp: 1.22, gold: 1.10, drop: 1.10 },
        '深淵風靈':      { exp: 1.22, gold: 1.10, drop: 1.10 },
        '深淵火靈':      { exp: 1.22, gold: 1.10, drop: 1.10 },
        '曼波兔':        { exp: 1.25, gold: 1.12, drop: 1.12 },
        '深淵之主':      { exp: 1.50, gold: 1.25, drop: 1.38 },

        // OB23：拉斯塔巴德地下洞穴1樓
        '歐姆':              { exp: 1.00, gold: 0.98, drop: 1.00 },
        '狂暴的歐姆':        { exp: 1.04, gold: 1.00, drop: 1.02 },
        '歐姆裝甲兵':        { exp: 1.06, gold: 1.02, drop: 1.03 },
        '狂暴的歐姆裝甲兵':  { exp: 1.08, gold: 1.03, drop: 1.04 },

        // OB23：拉斯塔巴德地下洞穴2~3樓
        '黑暗妖精殘兵(弓)':      { exp: 1.05, gold: 1.02, drop: 1.03 },
        '黑暗妖精殘兵(劍)':      { exp: 1.06, gold: 1.03, drop: 1.04 },
        '黑暗妖精殘兵(十字弓)':  { exp: 1.07, gold: 1.03, drop: 1.04 },
        '黑暗妖精殘兵(法師)':    { exp: 1.12, gold: 1.05, drop: 1.06 },
        '黑暗妖精殘兵(雙手劍)':  { exp: 1.12, gold: 1.06, drop: 1.06 },
        '黑暗精靈使':            { exp: 1.25, gold: 1.10, drop: 1.12 },

        // OB23：古代巨人之墓
        '墳墓守護者':        { exp: 1.10, gold: 1.05, drop: 1.04 },
        '墳墓守護者法師':    { exp: 1.16, gold: 1.07, drop: 1.06 },
        '墳墓守護者騎士':    { exp: 1.18, gold: 1.08, drop: 1.07 },
        '巨大墳墓守護者':    { exp: 1.28, gold: 1.12, drop: 1.10 },

        // OB24：魔獸訓練場
        '黑虎':                { exp: 1.08, gold: 1.03, drop: 1.04 },
        '拉斯塔巴德馴獸師':    { exp: 1.12, gold: 1.05, drop: 1.06 },
        '受詛咒的馴獸師':      { exp: 1.15, gold: 1.07, drop: 1.07 },
        '地獄束縛犬':          { exp: 1.14, gold: 1.06, drop: 1.07 },
        '魂騎士':              { exp: 1.18, gold: 1.08, drop: 1.08 },
        '喚獸師':              { exp: 1.10, gold: 1.04, drop: 1.05 },
        '拉斯塔巴德守門人':    { exp: 1.12, gold: 1.06, drop: 1.06 },

        // OB24：黑魔法研究室
        '地元素守護者':        { exp: 1.12, gold: 1.05, drop: 1.05 },
        '水元素守護者':        { exp: 1.12, gold: 1.05, drop: 1.05 },
        '風元素守護者':        { exp: 1.12, gold: 1.05, drop: 1.05 },
        '火元素守護者':        { exp: 1.12, gold: 1.05, drop: 1.05 },
        '黑暗妖精法師':        { exp: 1.18, gold: 1.08, drop: 1.08 },

        // 黑法師已在 OB22 設為 exp 1.15 / gold 1.08 / drop 1.08，這裡不重複。

        // OB24：冥法軍訓練場
        '黑暗復仇者':          { exp: 1.15, gold: 1.07, drop: 1.06 },
        '血色術士':            { exp: 1.20, gold: 1.10, drop: 1.09 },
        '歐姆戰士':            { exp: 1.15, gold: 1.07, drop: 1.06 },
        '闇黑君王':            { exp: 1.22, gold: 1.10, drop: 1.10 },
        '血騎士':              { exp: 1.20, gold: 1.10, drop: 1.09 },
        '重裝歐姆戰士':        { exp: 1.18, gold: 1.08, drop: 1.08 },

        // OB25：格蘭肯神殿一般怪
        '拉斯塔巴德近衛隊':      { exp: 1.15, gold: 1.07, drop: 1.06 },
        '拉斯塔巴德近衛隊隊長':  { exp: 1.22, gold: 1.10, drop: 1.09 },
        '長老隨從':              { exp: 1.20, gold: 1.09, drop: 1.08 },

        // OB25：8位長老
        '長老．琪娜':    { exp: 1.35, gold: 1.00, drop: 1.20 },
        '長老．艾迪爾':  { exp: 1.38, gold: 1.00, drop: 1.21 },
        '長老．巴塔斯':  { exp: 1.42, gold: 1.00, drop: 1.23 },
        '長老．巴洛斯':  { exp: 1.45, gold: 1.00, drop: 1.24 },
        '長老．泰瑪斯':  { exp: 1.47, gold: 1.00, drop: 1.25 },
        '長老．安迪斯':  { exp: 1.48, gold: 1.00, drop: 1.26 },
        '長老．拉曼斯':  { exp: 1.50, gold: 1.00, drop: 1.27 },
        '長老．巴陸德':  { exp: 1.52, gold: 1.00, drop: 1.28 },

        // OB25：四軍王
        '暗殺軍王史雷佛':  { exp: 1.33, gold: 1.17, drop: 1.20 },
        '魔獸軍王巴蘭卡':  { exp: 1.35, gold: 1.18, drop: 1.22 },
        '法令軍王蕾雅':    { exp: 1.38, gold: 1.18, drop: 1.23 },
        '冥法軍王海露拜':  { exp: 1.42, gold: 1.20, drop: 1.25 }
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
        },

        // OB25：長老之室／四軍王房
        // special 留空：仍套用既有的通用 BOSS 稀有掉落分層。
        '長老．琪娜': { special: {} },
        '長老．艾迪爾': { special: {} },
        '長老．巴塔斯': { special: {} },
        '長老．巴洛斯': { special: {} },
        '長老．泰瑪斯': { special: {} },
        '長老．安迪斯': { special: {} },
        '長老．拉曼斯': { special: {} },
        '長老．巴陸德': { special: {} },
        '暗殺軍王史雷佛': { special: {} },
        '魔獸軍王巴蘭卡': { special: {} },
        '法令軍王蕾雅': { special: {} },
        '冥法軍王海露拜': { special: {} }
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

/* ===== 仿正服 OB11：移除隨機詞綴 START ===== */
(function officialNoRandomAffixOB11(){
    if (!window.OFFICIAL_BALANCE_MODE || window.__officialNoRandomAffixOB11) return;
    window.__officialNoRandomAffixOB11 = true;

    // 1) 未來所有新取得裝備：不再抽 0~5 條隨機詞綴。
    try {
        if (typeof rollLootQuality === 'function') {
            rollLootQuality = function() {
                return { q: 'white', aff: [] };
            };
        }

        // 縱深保險：仿正服模式完全不計算隨機詞綴能力。
        if (typeof applyLootAffixAttributes === 'function') {
            applyLootAffixAttributes = function(){};
        }
        if (typeof applyLootAffixCombat === 'function') {
            applyLootAffixCombat = function(){};
        }
    } catch (e) {
        console.warn('[official-affix] disable random affix failed', e);
    }

    // 2) 清除既有仿正服存檔中的 lootAff / lootQ。
    //    只移除「0~5 條隨機數值詞綴」，不動祝福/詛咒、屬性、古代、套裝等原本系統。
    function stripRandomAffixFields(root) {
        if (!root || typeof root !== 'object') return 0;

        const seen = new Set();
        let changed = 0;

        function walk(v) {
            if (!v || typeof v !== 'object' || seen.has(v)) return;
            seen.add(v);

            // 只對看起來像物品的物件處理。
            if (Object.prototype.hasOwnProperty.call(v, 'id')) {
                let touched = false;

                if (Object.prototype.hasOwnProperty.call(v, 'lootAff')) {
                    delete v.lootAff;
                    touched = true;
                }
                if (Object.prototype.hasOwnProperty.call(v, 'lootQ')) {
                    delete v.lootQ;
                    touched = true;
                }

                if (touched) changed++;
            }

            if (Array.isArray(v)) {
                for (const x of v) walk(x);
            } else {
                for (const k of Object.keys(v)) {
                    const x = v[k];
                    if (x && typeof x === 'object') walk(x);
                }
            }
        }

        walk(root);
        return changed;
    }

    function cleanOfficialAffixesNow(saveAfter) {
        let changed = 0;

        try {
            if (typeof player !== 'undefined' && player && player.cls) {
                changed += stripRandomAffixFields(player);

                // 現有自動販賣規則也關掉詞綴條數判定。
                if (player.autoSellRules && typeof player.autoSellRules === 'object') {
                    player.autoSellRules.affixSellMax = -1;
                    if (player.autoSellRules.quality) {
                        player.autoSellRules.quality.white = false;
                        player.autoSellRules.quality.blue = false;
                    }
                }

                // 移除詞綴後立刻重算能力，避免舊詞綴數值暫留在畫面。
                try {
                    if (typeof recomputeStats === 'function') recomputeStats();
                } catch (e) {}

                try {
                    if (typeof renderTabs === 'function') renderTabs(true);
                } catch (e) {}

                try {
                    if (typeof updateUI === 'function') updateUI();
                } catch (e) {}

                if (saveAfter && changed > 0) {
                    try {
                        if (typeof saveGame === 'function') saveGame();
                    } catch (e) {
                        console.warn('[official-affix] save cleaned character failed', e);
                    }
                }
            }
        } catch (e) {
            console.warn('[official-affix] clean player failed', e);
        }

        // 仿正服共用倉庫也清掉舊隨機詞綴。
        try {
            if (typeof player !== 'undefined' && player && player.cls &&
                typeof loadWarehouse === 'function' &&
                typeof saveWarehouse === 'function') {

                const w = loadWarehouse();
                if (w && Array.isArray(w.items)) {
                    const wc = stripRandomAffixFields(w.items);
                    if (wc > 0) {
                        saveWarehouse(w);
                        changed += wc;
                    }
                }
            }
        } catch (e) {
            console.warn('[official-affix] clean warehouse failed', e);
        }

        return changed;
    }

    // 3) 每次切換/讀取角色後自動清理一次。
    try {
        if (typeof loadGame === 'function' && !window.__officialLoadGameAffixWrapped) {
            window.__officialLoadGameAffixWrapped = true;
            const _officialBaseLoadGame = loadGame;

            loadGame = function() {
                const result = _officialBaseLoadGame.apply(this, arguments);

                const after = function() {
                    setTimeout(function() {
                        const n = cleanOfficialAffixesNow(true);
                        if (n > 0 && typeof logSys === 'function') {
                            logSys('<span class="text-amber-300">仿正服：已移除舊的隨機詞綴裝備資料。</span>');
                        }
                    }, 0);
                };

                if (result && typeof result.then === 'function') {
                    result.then(after, function(){});
                } else {
                    after();
                }

                return result;
            };
        }
    } catch (e) {
        console.warn('[official-affix] loadGame wrapper failed', e);
    }

    // 若更新時角色已在遊戲內，直接清一次。
    setTimeout(function() {
        cleanOfficialAffixesNow(true);
    }, 100);

    // 4) 自動賣出：永久關閉詞綴條數規則。
    try {
        if (typeof getAutoSellRules === 'function' && !window.__officialAutoSellAffixRulesWrapped) {
            window.__officialAutoSellAffixRulesWrapped = true;
            const _officialBaseGetAutoSellRules = getAutoSellRules;

            getAutoSellRules = function() {
                const r = _officialBaseGetAutoSellRules.apply(this, arguments);
                if (r && typeof r === 'object') {
                    r.affixSellMax = -1;
                    if (!r.quality) r.quality = {};
                    r.quality.white = false;
                    r.quality.blue = false;
                }
                return r;
            };
        }
    } catch (e) {
        console.warn('[official-affix] autosell rules wrapper failed', e);
    }

    function removeAutoSellAffixSection() {
        try {
            const sel = document.getElementById('as-affix-max');
            if (!sel) return;

            // 整段「隨機詞綴快捷販賣」區塊直接移除。
            const sec = sel.closest('.as-sec');
            if (sec) sec.remove();
            else {
                const row = sel.closest('.as-row');
                if (row) row.remove();
                else sel.remove();
            }
        } catch (e) {}
    }

    try {
        if (typeof openAutoSellRules === 'function' && !window.__officialAutoSellAffixUIWrapped) {
            window.__officialAutoSellAffixUIWrapped = true;
            const _officialBaseOpenAutoSellRules = openAutoSellRules;

            openAutoSellRules = function() {
                const result = _officialBaseOpenAutoSellRules.apply(this, arguments);
                removeAutoSellAffixSection();
                setTimeout(removeAutoSellAffixSection, 0);
                return result;
            };
        }
    } catch (e) {
        console.warn('[official-affix] autosell UI wrapper failed', e);
    }

    console.info('[official-affix] OB11 random affixes disabled');
})();
/* ===== 仿正服 OB11：移除隨機詞綴 END ===== */
