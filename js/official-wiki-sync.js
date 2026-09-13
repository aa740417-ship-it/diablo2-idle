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
            Object.keys((window.DB && DB.maps) || {}).forEach(function (mapId) {
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
