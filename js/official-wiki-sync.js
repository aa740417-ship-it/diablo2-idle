/*
 * 放置天堂－仿正服百科同步層
 * 僅由 official.html 載入；不修改戰鬥核心與存檔。
 */
(function () {
    'use strict';

    if (!window.OFFICIAL_BALANCE_MODE || window.__officialWikiSyncInstalled) return;
    window.__officialWikiSyncInstalled = true;

    function cfg() {
        return window.OFFICIAL_BALANCE || {};
    }

    function mult(n) {
        n = Number(n);
        if (!Number.isFinite(n)) return '-';
        return (Math.round(n * 1000) / 1000) + 'x';
    }

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function mapNameIndex() {
        var out = {};
        try {
            (window.MAP_REGIONS || []).forEach(function (region) {
                (region.maps || []).forEach(function (m) {
                    out[m.v] = m.t || m.v;
                });
            });
        } catch (e) {}
        return out;
    }

    function mapIdsForMobId(mobId) {
        var out = [];
        try {
            Object.keys(((typeof DB !== 'undefined' ? DB : null) && DB.maps) || {}).forEach(function (mapId) {
                if ((DB.maps[mapId] || []).indexOf(mobId) >= 0) out.push(mapId);
            });
        } catch (e) {}
        return out;
    }

    function zoneInfo(mapId) {
        var c = cfg();
        var z = c.zones && c.zones[mapId];
        if (!z) return null;

        var baseGold = Number(c.baseGoldMult);
        var baseDrop = Number(c.baseDropMult);
        if (!Number.isFinite(baseGold)) baseGold = 1;
        if (!Number.isFinite(baseDrop)) baseDrop = 1;

        return {
            name: z.name || mapId,
            exp: Number(z.exp),
            gold: baseGold * Number(z.gold == null ? 1 : z.gold),
            drop: baseDrop * Number(z.drop == null ? 1 : z.drop)
        };
    }

    function section(title, html) {
        var el = document.createElement('section');
        el.setAttribute('data-official-wiki-sync', '1');
        el.innerHTML = '<h3>' + title + '</h3>' + html;
        return el;
    }

    function insertAfterBack(body, el) {
        var back = body.querySelector('.awk-back');
        if (back && back.nextSibling) body.insertBefore(el, back.nextSibling);
        else if (back) body.appendChild(el);
        else body.insertBefore(el, body.firstChild);
    }

    function clearDecorations(body) {
        body.querySelectorAll('[data-official-wiki-sync="1"]').forEach(function (el) {
            el.remove();
        });
    }

    function officialBanner(body) {
        var c = cfg();
        var div = document.createElement('div');
        div.setAttribute('data-official-wiki-sync', '1');
        div.className = 'awk-note';
        div.style.marginBottom = '9px';
        div.innerHTML =
            '<b>🏛️ 仿正服百科</b>｜目前版本 ' +
            esc(c.version || 'official') +
            '。地圖倍率、遺物禁掉、無隨機詞綴等資料以仿正服執行中設定為準。';
        body.insertBefore(div, body.firstChild);
    }

    function decorateMap(body, mapId) {
        if (mapId === 'artifact_sanctum') {
            insertAfterBack(
                body,
                section(
                    '🏛️ 仿正服狀態',
                    '<p>神器聖域在仿正服已停用，不屬於目前可進入地圖。</p>'
                )
            );
            return;
        }

        var z = zoneInfo(mapId);
        if (!z) {
            insertAfterBack(
                body,
                section(
                    '🏛️ 仿正服倍率',
                    '<p>此地圖沒有額外區域倍率，會套用仿正服全域規則與該玩法自己的特殊規則。</p>'
                )
            );
            return;
        }

        insertAfterBack(
            body,
            section(
                '🏛️ 仿正服倍率',
                '<div class="awk-grid">' +
                    '<div>地圖經驗 ' + esc(mult(z.exp)) + '</div>' +
                    '<div>金幣 ' + esc(mult(z.gold)) + '</div>' +
                    '<div>掉寶 ' + esc(mult(z.drop)) + '</div>' +
                '</div>' +
                '<p>掉寶倍率已包含全服基礎倍率；BOSS、劇情道具與特定物品仍可能有額外規則。</p>'
            )
        );
    }

    function decorateMob(body, mobId) {
        var names = mapNameIndex();
        var ids = mapIdsForMobId(mobId);

        var rows = ids.map(function (mapId) {
            var z = zoneInfo(mapId);
            if (!z) return null;

            return (
                '<div class="awk-row"><b>' +
                esc(names[mapId] || z.name || mapId) +
                '</b><em>EXP ' +
                esc(mult(z.exp)) +
                '・金幣 ' +
                esc(mult(z.gold)) +
                '・掉寶 ' +
                esc(mult(z.drop)) +
                '</em></div>'
            );
        }).filter(Boolean);

        var mob = null;
        try {
            mob = DB.mobs && DB.mobs[mobId];
        } catch (e) {}

        var bossNote =
            mob && mob.boss
                ? '<p>此怪物為 BOSS；實際掉落還會套用仿正服 BOSS 物品分級與龍之鑽石規則。</p>'
                : '<p>實際掉落還會套用物品類別與特殊來源規則。</p>';

        insertAfterBack(
            body,
            section(
                '🏛️ 仿正服出沒倍率',
                (rows.length
                    ? rows.join('')
                    : '<p>此怪物沒有一般地圖倍率資料，依特殊事件／召喚規則處理。</p>') +
                    bossNote
            )
        );
    }

    function decorateItem(body, itemId) {
        var item = null;
        try {
            item = DB.items && DB.items[itemId];
        } catch (e) {}

        if (!item) return;

        var notes = [];

        if (item.relic) {
            notes.push('仿正服已關閉戰鬥遺物掉落；遺物改走黑市／非戰鬥取得來源。');
        }

        if (item.type === 'wpn' || item.type === 'arm' || item.type === 'acc') {
            notes.push('仿正服新取得裝備不產生舊服的 0～5 條隨機詞綴。');
        }

        if (!notes.length) {
            notes.push('此物品沿用物品本體能力；取得率與經濟規則依仿正服平衡層計算。');
        }

        insertAfterBack(
            body,
            section(
                '🏛️ 仿正服物品規則',
                '<p>' + notes.map(esc).join('<br>') + '</p>'
            )
        );
    }

    function decorateSkill(body, skillId) {
        var notes = [
            '技能基本資料沿用目前遊戲資料，實戰傷害、SP 權重與職業平衡以仿正服計算層為準。'
        ];

        if (skillId === 'sk_summon') {
            notes.push(
                '召喚術上限依仿正服規則處理；召喚控制戒指不再額外突破目前召喚上限。'
            );
        }

        insertAfterBack(
            body,
            section(
                '🏛️ 仿正服技能規則',
                '<p>' + notes.map(esc).join('<br>') + '</p>'
            )
        );
    }

    function decorateQuest(body) {
        insertAfterBack(
            body,
            section(
                '🏛️ 仿正服任務規則',
                '<p>試煉、NPC 兌換與獎勵資料以仿正服現行條件與獎勵修正為準；舊服額外收益不再列為仿正服來源。</p>'
            )
        );
    }

    function hideDisabledEntries(body) {
        body.querySelectorAll('button.awk-card').forEach(function (btn) {
            var onclick = btn.getAttribute('onclick') || '';
            if (
                onclick.indexOf("'map','artifact_sanctum'") >= 0 ||
                onclick.indexOf('"map","artifact_sanctum"') >= 0
            ) {
                btn.remove();
            }
        });
    }

    var state = {
        tab: 'home',
        detail: null
    };

    function decorate() {
        var body = document.getElementById('awk-body');
        if (!body) return;

        clearDecorations(body);
        hideDisabledEntries(body);
        officialBanner(body);

        if (!state.detail) return;

        if (state.detail.k === 'map') {
            decorateMap(body, state.detail.id);
        } else if (state.detail.k === 'mob') {
            decorateMob(body, state.detail.id);
        } else if (state.detail.k === 'item') {
            decorateItem(body, state.detail.id);
        } else if (state.detail.k === 'skill') {
            decorateSkill(body, state.detail.id);
        } else if (state.detail.k === 'quest') {
            decorateQuest(body);
        }
    }

    function afterRender() {
        setTimeout(decorate, 0);
    }

    function installWikiHooks() {
        if (!window.AFKWiki || window.AFKWiki.__officialSyncWrapped) return false;

        var api = window.AFKWiki;
        api.__officialSyncWrapped = true;

        ['open', 'back', 'backGuide'].forEach(function (name) {
            if (typeof api[name] !== 'function') return;

            var old = api[name];
            api[name] = function () {
                if (name === 'back') state.detail = null;
                var r = old.apply(this, arguments);
                afterRender();
                return r;
            };
        });

        if (typeof api.tab === 'function') {
            var oldTab = api.tab;
            api.tab = function (tab) {
                state.tab = tab;
                state.detail = null;
                var r = oldTab.apply(this, arguments);
                afterRender();
                return r;
            };
        }

        if (typeof api.detail === 'function') {
            var oldDetail = api.detail;
            api.detail = function (kind, id) {
                state.detail = {
                    k: String(kind || ''),
                    id: String(id || '')
                };
                var r = oldDetail.apply(this, arguments);
                afterRender();
                return r;
            };
        }

        if (typeof api.guideDetail === 'function') {
            var oldGuide = api.guideDetail;
            api.guideDetail = function (kind, id) {
                state.detail = {
                    k: String(kind || ''),
                    id: String(id || '')
                };
                var r = oldGuide.apply(this, arguments);
                afterRender();
                return r;
            };
        }

        return true;
    }

    // 百科／世界知識若讀 _wcBuildKnowledge，
    // 仿正服時把已封鎖的戰鬥遺物來源移除。
    function installKnowledgeFilter() {
        if (
            typeof window._wcBuildKnowledge !== 'function' ||
            window._wcBuildKnowledge.__officialFiltered
        ) {
            return;
        }

        var raw = window._wcBuildKnowledge;

        function wrapped() {
            var k = raw.apply(this, arguments) || {};

            function isRelicRow(r) {
                try {
                    var id = r && r.itemId;
                    return !!(
                        id &&
                        DB.items &&
                        DB.items[id] &&
                        DB.items[id].relic
                    );
                } catch (e) {
                    return false;
                }
            }

            function filterTable(table) {
                var out = {};
                Object.keys(table || {}).forEach(function (key) {
                    out[key] = (table[key] || []).filter(function (r) {
                        return !isRelicRow(r);
                    });
                });
                return out;
            }

            return Object.assign({}, k, {
                itemDrops: filterTable(k.itemDrops),
                mobDrops: filterTable(k.mobDrops)
            });
        }

        wrapped.__officialFiltered = true;
        window._wcBuildKnowledge = wrapped;
    }

    installKnowledgeFilter();

    if (!installWikiHooks()) {
        var tries = 0;
        var timer = setInterval(function () {
            installKnowledgeFilter();

            if (installWikiHooks() || ++tries > 40) {
                clearInterval(timer);
            }
        }, 250);
    }

    console.info(
        '[official-wiki-sync] enabled',
        cfg().version || 'official'
    );
})();


/* ===== OFFICIAL_WIKI_SET_TAB_V1 ===== */
(function () {
    'use strict';

    if (!window.OFFICIAL_BALANCE_MODE || window.__officialWikiSetTabV1) return;
    window.__officialWikiSetTabV1 = true;

    const META = {
        leather: {
            n: '皮套裝', need: 4,
            eff: '集齊 4 件：AC -3。'
        },
        oasis: {
            n: '歐西斯套裝', need: 4,
            eff: '集齊 4 件：AC -3。'
        },
        gnome: {
            n: '侏儒套裝', need: 3,
            eff: '集齊 3 件：AC -1、HP +5。'
        },
        silver: {
            n: '銀釘套裝', need: 4,
            eff: '集齊 4 件：AC -3。'
        },
        bone: {
            n: '骷髏套裝', need: 3,
            eff: '集齊 3 件：AC -2、HP +10。'
        },
        steel: {
            n: '鋼鐵套裝', need: 5,
            eff: '集齊 5 件：AC -2、傷害減免 +2。'
        },
        mage: {
            n: '法師套裝', need: 2,
            eff: '集齊 2 件：MP +50、MP 自然恢復量 +1。'
        },
        dk: {
            n: '死亡騎士套裝', need: 4,
            eff: '集齊 4 件：AC -4，並變身「真‧死亡騎士」；變身同時提供額外傷害、命中與專屬攻擊速度。'
        },
        kurt: {
            n: '克特套裝', need: 4,
            eff: '集齊 4 件：AC -4，並變身「真‧克特」；變身同時提供額外傷害、命中與專屬攻擊速度。'
        },
        mr: {
            n: '抗魔套裝', need: 3,
            eff: '集齊 3 件：MR +5。'
        },
        guard: {
            n: '守護套裝', need: 3,
            eff: '集齊 3 件：AC -1。'
        },
        kinglord: {
            n: '四大軍王套裝', need: 4,
            eff: '集齊 4 件：HP +30、MP +30、HP 自然恢復量 +10、MP 自然恢復量 +10、魅力 +3。'
        },
        demon: {
            n: '惡魔套裝', need: 4,
            eff: '集齊 4 件：AC -2、HP 自然恢復量 +5，並變身「惡魔」；變身另提供額外傷害、命中、魔法傷害、SP 與專屬速度。'
        },
        darkelf: {
            n: '黑暗妖精套裝', need: 3,
            eff: '集齊 3 件：力量 -2、敏捷 +2、AC -3、HP 自然恢復量 -2、MP 自然恢復量 -7，並變身「高等黑暗精靈」；變身另提供遠距離傷害／命中與專屬速度。'
        },
        orin: {
            n: '歐林西瑪套裝', need: 2,
            eff: '集齊 2 件：六項基本屬性各 +1、AC -5、HP +50。'
        },
        icequeen_charm: {
            n: '冰之女王魅力套裝', need: 3,
            eff: '集齊 3 件：力量 +2、魅力 +2、AC -5、HP +100、MP 自然恢復量 +4、水屬性抗性 +20。公主限定。'
        },
        frost: {
            n: '寒冰套裝', need: 3,
            eff: '集齊 3 件：體質 +3、AC -5、HP +100、HP 自然恢復量 +8、MP 自然恢復量 +4、MR +15、水屬性抗性 +20。'
        },
        bluepirate: {
            n: '藍海賊套裝', need: 4,
            eff: '集齊頭巾、皮盔甲、手套、長靴 4 件：智力 +1、AC -1、HP +10。藍海賊斗篷不計入套裝件數。'
        },
        emperor: {
            n: '真．冥皇套裝', need: 5,
            eff: '集齊 5 件：AC -20、HP +100、MP +20、HP 自然恢復量 +10、攻擊速度 +30%、近／遠距離傷害 +5。'
        },
        priest: {
            n: '司祭苦行套裝', need: 5,
            eff: '集齊 5 件：AC -50、MR +50、HP +300、MP 自然恢復量 +30；近／遠／魔法爆擊率各 +5%，爆擊傷害各 +50%。'
        }
    };

    const SPECIAL = [
        {
            id: 'curse_red',
            n: '淨化＋紅色詛咒耳環',
            need: 2,
            ids: ['acc_purify_earring', 'acc_curse_red'],
            eff: '同時裝備：力量 +2、體質 -2。'
        },
        {
            id: 'curse_blue',
            n: '淨化＋藍色詛咒耳環',
            need: 2,
            ids: ['acc_purify_earring', 'acc_curse_blue'],
            eff: '同時裝備：智力 +2、精神 -2。'
        },
        {
            id: 'curse_green',
            n: '淨化＋綠色詛咒耳環',
            need: 2,
            ids: ['acc_purify_earring', 'acc_curse_green'],
            eff: '同時裝備：敏捷 +2、魅力 -2。'
        }
    ];

    const CLS = {
        all: '全職業',
        royal: '王族',
        knight: '騎士',
        elf: '妖精',
        mage: '法師',
        dark: '黑暗妖精',
        illusion: '幻術士',
        dragon: '龍騎士',
        warrior: '戰士'
    };

    const SLOT = {
        helm: '頭盔',
        armor: '盔甲',
        tshirt: 'T恤',
        cloak: '斗篷',
        gloves: '手套',
        boots: '長靴',
        shield: '盾牌',
        amulet: '項鍊',
        belt: '腰帶',
        ear: '耳環',
        ring: '戒指',
        wpn: '武器'
    };

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
        });
    }

    function reqText(d) {
        if (!d || !d.req || d.req === 'all') return '全職業';
        return String(d.req).split(',').map(function (x) {
            return CLS[x] || x;
        }).join('／');
    }

    function itemSub(d) {
        if (!d) return '';
        const parts = [];
        if (d.type === 'wpn') {
            if (d.dmgS != null || d.dmgL != null) {
                parts.push('傷害 ' + (d.dmgS || 0) + '/' + (d.dmgL || 0));
            }
        } else if (d.ac != null) {
            parts.push('AC ' + (d.ac > 0 ? '-' + d.ac : String(d.ac)));
        }
        if (d.mr) parts.push('MR +' + d.mr);
        if (d.mhp) parts.push('HP +' + d.mhp);
        if (d.mmp) parts.push('MP +' + d.mmp);
        return parts.join('・');
    }

    function collectSets() {
        const groups = {};

        try {
            Object.keys(((typeof DB !== 'undefined' ? DB : null) && DB.items) || {}).forEach(function (id) {
                const d = DB.items[id];
                if (!d || !d.set) return;
                const key = String(d.set);
                if (!groups[key]) groups[key] = [];
                groups[key].push(id);
            });
        } catch (e) {}

        const out = Object.keys(groups).map(function (key) {
            const meta = META[key] || {};
            const ids = groups[key].slice();
            return {
                id: key,
                n: meta.n || key,
                need: meta.need || ids.length,
                ids: ids,
                eff: meta.eff || '此套裝已存在於目前遊戲資料，效果以角色能力實際套用結果為準。',
                special: false
            };
        });

        SPECIAL.forEach(function (s) {
            const valid = s.ids.filter(function (id) {
                return !!((typeof DB !== 'undefined' ? DB : null) && DB.items && DB.items[id]);
            });
            if (valid.length === s.ids.length) {
                out.push({
                    id: 'special:' + s.id,
                    n: s.n,
                    need: s.need,
                    ids: valid,
                    eff: s.eff,
                    special: true
                });
            }
        });

        out.sort(function (a, b) {
            return a.n.localeCompare(b.n, 'zh-Hant');
        });

        return out;
    }

    function findSet(id) {
        return collectSets().find(function (x) {
            return x.id === id;
        }) || null;
    }

    function ensureButton() {
        const tabs = document.getElementById('awk-tabs');
        if (!tabs) return null;

        let btn = tabs.querySelector('[data-awk-set-tab="1"]');
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-awk-set-tab', '1');
            btn.textContent = '套裝';
            btn.onclick = function () {
                window.AFKWiki.tab('sets');
            };
            tabs.appendChild(btn);
        }
        return btn;
    }

    let active = false;

    function markTab() {
        const tabs = document.getElementById('awk-tabs');
        if (!tabs) return;
        const btn = ensureButton();
        if (!btn) return;

        if (active) {
            Array.from(tabs.querySelectorAll('button')).forEach(function (b) {
                b.classList.remove('on');
            });
            btn.classList.add('on');
        }
    }

    function renderList() {
        active = true;
        const body = document.getElementById('awk-body');
        if (!body) return;

        const input = document.getElementById('awk-search');
        const q = (input ? input.value : '').trim().toLowerCase();

        const rows = collectSets().filter(function (s) {
            if (!q) return true;
            const itemNames = s.ids.map(function (id) {
                return (DB.items[id] && DB.items[id].n) || id;
            }).join(' ');
            return (s.n + ' ' + s.eff + ' ' + itemNames).toLowerCase().includes(q);
        });

        body.innerHTML =
            '<div class="awk-hero">' +
                '<h2>🧩 仿正服套裝百科</h2>' +
                '<p>列出目前遊戲真正有套裝標記的裝備，以及角色能力重算中實際套用的套裝效果。點套裝可查看全部部件；再點部件可接著看物品能力與掉落來源。</p>' +
            '</div>' +
            '<div class="awk-note">目前共 ' + rows.length + ' 組符合條件；可直接用上方搜尋套裝名或部件名。</div>' +
            '<div class="awk-list">' +
            (rows.length
                ? rows.map(function (s) {
                    return '<button class="awk-card" onclick="AFKWiki.detail(\'set\',\'' + esc(s.id) + '\')">' +
                        '<div><b>' + esc(s.n) + '</b>' +
                        '<span>' + esc(s.eff) + '</span></div>' +
                        '<em>' + esc(s.need + ' 件效果') + '</em><i>›</i></button>';
                }).join('')
                : '<div class="awk-empty">沒有符合的套裝資料。</div>') +
            '</div>';

        body.scrollTop = 0;
        markTab();
    }

    function renderDetail(id) {
        active = true;
        const body = document.getElementById('awk-body');
        if (!body) return;

        const s = findSet(id);
        if (!s) {
            renderList();
            return;
        }

        const pieces = s.ids.map(function (iid) {
            const d = DB.items[iid] || {};
            const slot = d.type === 'wpn' ? '武器' : (SLOT[d.slot] || d.slot || '裝備');
            const sub = [slot, reqText(d), itemSub(d)].filter(Boolean).join('・');

            return '<button class="awk-link" onclick="AFKWiki.detail(\'item\',\'' + esc(iid) + '\')">' +
                '<span><b>' + esc(d.n || iid) + '</b><small style="display:block;color:#94a3b8;margin-top:2px">' + esc(sub) + '</small></span>' +
                '<em>查看物品 ›</em></button>';
        }).join('');

        body.innerHTML =
            '<button class="awk-back" onclick="AFKWiki.tab(\'sets\')">← 返回套裝列表</button>' +
            '<h2>' + esc(s.n) + '</h2>' +
            '<div class="awk-tags">' +
                '<span>' + esc(s.ids.length + ' 個部件') + '</span>' +
                '<span>' + esc(s.need + ' 件發動') + '</span>' +
                (s.special ? '<span>特殊組合</span>' : '<span>一般套裝</span>') +
            '</div>' +
            '<section>' +
                '<h3>✨ 套裝效果</h3>' +
                '<p>' + esc(s.eff) + '</p>' +
            '</section>' +
            '<section>' +
                '<h3>🧩 套裝部件</h3>' +
                (pieces || '<p>找不到部件資料。</p>') +
            '</section>' +
            '<section>' +
                '<h3>🎁 掉落／取得方式</h3>' +
                '<p>點上方任一部件進入物品詳情，即可查看該部件目前百科登記的掉落來源與取得資料。</p>' +
            '</section>';

        body.scrollTop = 0;
        markTab();
    }

    function decorateCurrent() {
        ensureButton();
        if (active) markTab();
    }

    function install() {
        if (!window.AFKWiki || window.AFKWiki.__officialSetTabWrapped) return false;

        const api = window.AFKWiki;
        api.__officialSetTabWrapped = true;

        const oldOpen = api.open;
        if (typeof oldOpen === 'function') {
            api.open = function () {
                active = false;
                const r = oldOpen.apply(this, arguments);
                setTimeout(decorateCurrent, 0);
                return r;
            };
        }

        const oldTab = api.tab;
        api.tab = function (tab) {
            if (tab === 'sets') {
                renderList();
                return;
            }
            active = false;
            const r = oldTab.apply(this, arguments);
            setTimeout(decorateCurrent, 0);
            return r;
        };

        const oldDetail = api.detail;
        api.detail = function (kind, id) {
            if (kind === 'set') {
                renderDetail(String(id || ''));
                return;
            }

            if (active && kind === 'item') {
                active = false;
                const r = oldDetail.apply(this, arguments);
                setTimeout(decorateCurrent, 0);
                return r;
            }

            active = false;
            const r = oldDetail.apply(this, arguments);
            setTimeout(decorateCurrent, 0);
            return r;
        };

        const oldBack = api.back;
        if (typeof oldBack === 'function') {
            api.back = function () {
                active = false;
                const r = oldBack.apply(this, arguments);
                setTimeout(decorateCurrent, 0);
                return r;
            };
        }

        setTimeout(function () {
            decorateCurrent();
            const input = document.getElementById('awk-search');
            if (input && !input.__officialSetSearchBound) {
                input.__officialSetSearchBound = true;
                input.addEventListener('input', function () {
                    if (active) setTimeout(renderList, 0);
                });
            }
        }, 0);

        return true;
    }

    if (!install()) {
        let tries = 0;
        const timer = setInterval(function () {
            if (install() || ++tries > 40) clearInterval(timer);
        }, 250);
    }

    console.info('[official-wiki-set-tab] enabled');
})();
