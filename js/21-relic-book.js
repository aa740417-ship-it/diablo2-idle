// ========== 🏺 遺物圖鑑 ==========
// 全遺物可查：能力／掉落怪／掉率／收集狀態／強化資料
// player.relicDex = { itemId:true }：取得過即永久登錄

const RELIC_CAT_ITEMS = {};
const RELIC_ITEM_CAT = {};

const RELIC_BOOK_CATEGORIES = (() => {
    let a = (typeof EQUIP_CATEGORIES !== 'undefined')
        ? EQUIP_CATEGORIES.slice()
        : [];

    // 特殊道具型遺物，例如四種蜥蜴蛋
    a.push({
        key: 'relic_misc',
        group: '其他',
        name: '特殊遺物'
    });

    return a;
})();

(function buildRelicIndex() {

    RELIC_BOOK_CATEGORIES.forEach(c => {
        RELIC_CAT_ITEMS[c.key] = [];
    });

    for (let id in DB.items) {

        let d = DB.items[id];

        if (!d || !(typeof isRelic === 'function' && isRelic(d))) {
            continue;
        }

        let ck = null;

        if (
            d.type === 'wpn' ||
            d.type === 'arm' ||
            d.type === 'acc'
        ) {
            try {
                ck = typeof equipCatKey === 'function'
                    ? equipCatKey(id, d)
                    : null;
            } catch(e) {}
        }

        // 無法歸類、或道具型遺物 → 特殊遺物
        if (!ck || !RELIC_CAT_ITEMS[ck]) {
            ck = 'relic_misc';
        }

        RELIC_CAT_ITEMS[ck].push(id);
        RELIC_ITEM_CAT[id] = ck;
    }

    for (let k in RELIC_CAT_ITEMS) {
        RELIC_CAT_ITEMS[k].sort((a, b) => {
            let an = (DB.items[a] && DB.items[a].n) || '';
            let bn = (DB.items[b] && DB.items[b].n) || '';
            return an.localeCompare(bn, 'zh-Hant');
        });
    }

})();


// ========================================================
// 收集資料
// ========================================================

function relicDexHas(id) {
    return !!(
        player &&
        player.relicDex &&
        player.relicDex[id]
    );
}

function relicCatCount(ck) {
    let arr = RELIC_CAT_ITEMS[ck] || [];

    return {
        got: arr.filter(relicDexHas).length,
        total: arr.length
    };
}

function registerRelicObtained(id) {

    if (!player || !RELIC_ITEM_CAT[id]) return;

    if (!player.relicDex) {
        player.relicDex = {};
    }

    if (!player.relicDex[id]) {

        player.relicDex[id] = true;

        if (typeof saveRelicDex === 'function') {
            saveRelicDex();
        }
    }
}


// 舊角色補登錄：背包＋身上＋倉庫
function ensureRelicDex(warehouse) {

    if (!player || !Array.isArray(player.inv)) return;

    let changed = false;

    if (!player.relicDex) {
        player.relicDex = {};
        changed = true;
    }

    let register = i => {

        if (
            i &&
            i.id &&
            RELIC_ITEM_CAT[i.id] &&
            !player.relicDex[i.id]
        ) {
            player.relicDex[i.id] = true;
            changed = true;
        }
    };

    player.inv.forEach(register);

    if (player.eq) {
        for (let s in player.eq) {
            register(player.eq[s]);
        }
    }

    try {

        let w = warehouse ||
            (
                typeof loadWarehouse === 'function'
                    ? loadWarehouse()
                    : null
            );

        if (w && Array.isArray(w.items)) {
            w.items.forEach(register);
        }

    } catch(e) {}

    if (
        changed &&
        typeof saveRelicDex === 'function'
    ) {
        saveRelicDex();
    }
}


// ========================================================
// UI 狀態
// ========================================================

let _relicBookOpen = false;

let _relicBookCat =
    RELIC_BOOK_CATEGORIES.length
        ? RELIC_BOOK_CATEGORIES[0].key
        : 'relic_misc';

let _relicBookFilter = 'all';   // all / got / missing
let _relicBookQuery = '';
let _relicBookDetail = null;


function collectionOpenRelic() {

    if (typeof closeCollectionPanel === 'function') {
        closeCollectionPanel();
    }

    openRelicBook();
}


function openRelicBook() {

    if (!player.relicDex) {
        player.relicDex = {};
    }

    try {
        if (typeof mergeSharedIntoPlayer === 'function') {
            mergeSharedIntoPlayer('relic');
        }
    } catch(e) {}

    if (typeof closeModal === 'function') {
        closeModal();
    }

    _relicBookOpen = true;
    _relicBookDetail = null;

    let firstCat = RELIC_BOOK_CATEGORIES.find(
        c => (RELIC_CAT_ITEMS[c.key] || []).length > 0
    );

    if (
        firstCat &&
        !((RELIC_CAT_ITEMS[_relicBookCat] || []).length > 0)
    ) {
        _relicBookCat = firstCat.key;
    }

    let el = document.getElementById('relic-book');

    if (!el) return;

    el.classList.remove('hidden');

    renderRelicBook();
}


function closeRelicBook() {

    _relicBookOpen = false;
    _relicBookDetail = null;

    let el = document.getElementById('relic-book');

    if (el) {
        el.classList.add('hidden');
    }
}


function relicBookBackdrop(ev) {

    if (
        ev &&
        ev.target &&
        ev.target.id === 'relic-book'
    ) {
        closeRelicBook();
    }
}


function relicBookTab(key) {

    _relicBookCat = key;
    _relicBookDetail = null;
    _relicBookQuery = '';

    renderRelicBook();
}


function relicBookSetFilter(v) {

    _relicBookFilter = v || 'all';
    _relicBookDetail = null;

    renderRelicBook();
}


function relicBookDoSearch() {

    let el = document.getElementById('relic-book-search');

    _relicBookQuery = el
        ? String(el.value || '').trim()
        : '';

    _relicBookDetail = null;

    renderRelicBook();
}


function relicBookClearSearch() {

    _relicBookQuery = '';
    _relicBookDetail = null;

    renderRelicBook();
}


function openRelicDexDetail(id) {

    if (!DB.items[id] || !RELIC_ITEM_CAT[id]) return;

    _relicBookDetail = id;

    renderRelicBook();
}


function closeRelicDexDetail() {

    _relicBookDetail = null;

    renderRelicBook();
}


// ========================================================
// 小工具
// ========================================================

function relicEsc(v) {

    return String(v == null ? '' : v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


function relicAllIds() {

    let out = [];
    let seen = new Set();

    for (let k in RELIC_CAT_ITEMS) {

        (RELIC_CAT_ITEMS[k] || []).forEach(id => {

            if (!seen.has(id)) {
                seen.add(id);
                out.push(id);
            }
        });
    }

    return out;
}


function relicRateText(rate) {

    let n = Number(rate);

    if (!Number.isFinite(n)) return '';

    if (n >= 1) {
        return n.toFixed(2)
            .replace(/\.00$/, '')
            .replace(/0$/, '') + '%';
    }

    if (n >= 0.01) {
        return n.toFixed(4)
            .replace(/0+$/, '')
            .replace(/\.$/, '') + '%';
    }

    return n.toFixed(6)
        .replace(/0+$/, '')
        .replace(/\.$/, '') + '%';
}


// 找出某件遺物在哪些怪物掉落
function relicDropSources(itemId) {

    let result = [];
    let seen = new Set();

    let tables = [];

    if (typeof MOB_DROPS !== 'undefined') {
        tables.push(MOB_DROPS);
    }

    if (typeof DARK_WEAPON_DROPS !== 'undefined') {
        tables.push(DARK_WEAPON_DROPS);
    }

    if (typeof DARK_CRYSTAL_DROPS !== 'undefined') {
        tables.push(DARK_CRYSTAL_DROPS);
    }

    if (typeof DRAGON_DROPS !== 'undefined') {
        tables.push(DRAGON_DROPS);
    }

    if (typeof WARRIOR_DROPS !== 'undefined') {
        tables.push(WARRIOR_DROPS);
    }

    if (typeof MEM_DROPS !== 'undefined') {
        tables.push(MEM_DROPS);
    }

    tables.forEach(tbl => {

        if (!tbl) return;

        Object.keys(tbl).forEach(mobName => {

            let arr = tbl[mobName];

            if (!Array.isArray(arr)) return;

            arr.forEach(row => {

                if (!Array.isArray(row)) return;
                if (row[0] !== itemId) return;

                let rate = Number(row[1]);

                let key =
                    mobName + '|' +
                    (Number.isFinite(rate) ? rate : '');

                if (seen.has(key)) return;

                seen.add(key);

                result.push({
                    mob: mobName,
                    rate: rate
                });
            });
        });
    });

    result.sort((a, b) => {

        let ar = Number.isFinite(a.rate) ? a.rate : 0;
        let br = Number.isFinite(b.rate) ? b.rate : 0;

        if (br !== ar) return br - ar;

        return a.mob.localeCompare(b.mob, 'zh-Hant');
    });

    return result;
}


// ========================================================
// 詳細頁
// ========================================================

function renderRelicBookDetail(id) {

    let d = DB.items[id];

    if (!d) return '';

    let got = relicDexHas(id);

    let imgUrl =
        typeof getIconUrl === 'function'
            ? getIconUrl(d)
            : (d.img || '');

    let desc = '';

    try {

        if (typeof buildItemDescHTML === 'function') {

            desc = buildItemDescHTML({
                id: id,
                uid: 'relicdex_' + id,
                en: 0,
                cnt: 1
            });
        }

    } catch(e) {}

    if (!desc) {
        desc = `<div class="text-slate-300">${relicEsc(d.d || '無額外說明')}</div>`;
    }

    let drops = relicDropSources(id);

    let dropHtml = drops.length
        ? drops.map(x => `
            <div class="flex items-center justify-between gap-3
                        border-b border-slate-700/60 py-2">
                <span class="text-slate-200 font-bold">
                    ${relicEsc(x.mob)}
                </span>
                <span class="text-amber-300 font-bold whitespace-nowrap">
                    ${relicRateText(x.rate)}
                </span>
            </div>
        `).join('')
        : `<div class="text-slate-500 py-3">
              無一般怪物掉落資料，可能來自潘朵拉遺物布告或特殊取得方式。
           </div>`;

    let enhanceHtml = '';

    if (
        d.type === 'wpn' ||
        d.type === 'arm' ||
        d.type === 'acc'
    ) {

        let cap = 0;

        try {
            cap =
                typeof enhanceCap === 'function'
                    ? enhanceCap(d)
                    : (
                        d.type === 'acc'
                            ? 5
                            : 15
                    );
        } catch(e) {
            cap = d.type === 'acc' ? 5 : 15;
        }

        enhanceHtml = `
            <div class="grid grid-cols-2 gap-2 mt-3">
                <div class="bg-slate-900/70 rounded-lg border border-slate-700 p-3 text-center">
                    <div class="text-xs text-slate-500">安定值</div>
                    <div class="text-lg text-emerald-300 font-bold">
                        +${Number(d.safe) || 0}
                    </div>
                </div>

                <div class="bg-slate-900/70 rounded-lg border border-slate-700 p-3 text-center">
                    <div class="text-xs text-slate-500">強化上限</div>
                    <div class="text-lg text-cyan-300 font-bold">
                        +${cap}
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <button
            class="btn border-slate-600 bg-slate-800 hover:bg-slate-700
                   px-4 py-2 mb-4 font-bold"
            onclick="closeRelicDexDetail()">
            ← 返回遺物圖鑑
        </button>

        <div class="max-w-3xl mx-auto">

            <div class="flex items-center gap-4
                        bg-slate-900/80 border border-sky-800/60
                        rounded-xl p-4">

                <div class="relic-glow-wrap flex-shrink-0">
                    <img
                        src="${imgUrl}"
                        class="w-20 h-20 object-contain relic-glow"
                        onerror="this.onerror=null;this.src='https://placehold.co/80x80/1e293b/334155?text=%3F';">
                </div>

                <div class="min-w-0">

                    <div class="text-2xl font-bold c-relic">
                        ${relicEsc(d.n)}
                    </div>

                    <div class="mt-2">
                        ${
                            got
                            ? `<span class="text-emerald-300 font-bold">✅ 已收集</span>`
                            : `<span class="text-slate-400 font-bold">◇ 尚未收集</span>`
                        }
                    </div>

                </div>

            </div>

            ${enhanceHtml}

            <div class="mt-4 bg-slate-900/70
                        border border-slate-700 rounded-xl p-4">

                <div class="text-lg text-cyan-300 font-bold mb-3">
                    📋 遺物能力
                </div>

                <div class="text-sm leading-relaxed">
                    ${desc}
                </div>

            </div>

            <div class="mt-4 bg-slate-900/70
                        border border-slate-700 rounded-xl p-4">

                <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="text-lg text-amber-300 font-bold">
                        🎯 掉落來源
                    </div>

                    <div class="text-xs text-slate-500">
                        顯示遊戲目前掉落表原始機率
                    </div>
                </div>

                ${dropHtml}

            </div>

        </div>
    `;
}


// ========================================================
// 圖鑑主頁
// ========================================================

function renderRelicBook() {

    let host = document.getElementById('relic-book-body');

    if (!host) return;

    let tabHost = document.getElementById('relic-book-tabs');

    if (_relicBookDetail) {

        if (tabHost) {
            tabHost.innerHTML = '';
        }

        host.innerHTML =
            renderRelicBookDetail(_relicBookDetail);

        host.scrollTop = 0;

        return;
    }


    // 分類頁籤
    if (tabHost) {

        let lastGroup = '';

        tabHost.innerHTML =
            RELIC_BOOK_CATEGORIES
                .filter(
                    c =>
                        (RELIC_CAT_ITEMS[c.key] || []).length > 0
                )
                .map(c => {

                    let cc = relicCatCount(c.key);

                    let active =
                        c.key === _relicBookCat;

                    let done =
                        cc.total > 0 &&
                        cc.got >= cc.total;

                    let sep =
                        c.group !== lastGroup
                            ? `<span class="text-slate-500 text-[11px]
                                           font-bold px-1 self-center">
                                   ${relicEsc(c.group)}
                               </span>`
                            : '';

                    lastGroup = c.group;

                    return sep + `
                        <button
                            onclick="relicBookTab('${c.key}')"
                            class="btn px-2.5 py-1 text-xs font-bold
                                   whitespace-nowrap
                                   ${
                                       active
                                       ? 'bg-sky-800 border-sky-500 text-sky-100'
                                       : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                                   }">

                            ${relicEsc(c.name)}

                            <span class="ml-1 text-[10px]
                                         ${
                                             done
                                             ? 'text-emerald-400'
                                             : 'text-slate-400'
                                         }">
                                ${cc.got}/${cc.total}
                            </span>

                        </button>
                    `;
                })
                .join('');
    }


    let cat =
        RELIC_BOOK_CATEGORIES.find(
            c => c.key === _relicBookCat
        ) ||
        RELIC_BOOK_CATEGORIES[0];


    let catIds =
        RELIC_CAT_ITEMS[cat.key] || [];


    // 全部進度
    let allIds = relicAllIds();

    let totalGot =
        allIds.filter(relicDexHas).length;

    let totalAll =
        allIds.length;


    // 搜尋時跨全部分類
    let ids =
        _relicBookQuery
            ? allIds.slice()
            : catIds.slice();


    // 搜尋
    if (_relicBookQuery) {

        let q =
            _relicBookQuery.toLowerCase();

        ids = ids.filter(id => {

            let d = DB.items[id];

            if (!d) return false;

            return (
                String(d.n || '')
                    .toLowerCase()
                    .includes(q) ||
                String(id)
                    .toLowerCase()
                    .includes(q)
            );
        });
    }


    // 已收集 / 未收集
    if (_relicBookFilter === 'got') {

        ids = ids.filter(relicDexHas);

    } else if (_relicBookFilter === 'missing') {

        ids = ids.filter(
            id => !relicDexHas(id)
        );
    }


    let cc = relicCatCount(cat.key);


    let head = `
        <div class="flex flex-wrap
                    items-baseline justify-between
                    gap-2 mb-3">

            <div class="text-xl font-bold c-relic">

                ${
                    _relicBookQuery
                    ? `搜尋結果`
                    : `${relicEsc(cat.group)}・${relicEsc(cat.name)}`
                }

                <span class="text-sm text-slate-400
                             font-normal ml-2">
                    ${
                        _relicBookQuery
                        ? `${ids.length} 件`
                        : `已收集 ${cc.got} / ${cc.total}`
                    }
                </span>

            </div>

            <div class="text-sm text-slate-400">
                🏺 總收集
                <span class="c-relic font-bold">
                    ${totalGot} / ${totalAll}
                </span>
            </div>

        </div>


        <div class="flex flex-wrap gap-2 mb-4">

            <input
                id="relic-book-search"
                value="${relicEsc(_relicBookQuery)}"
                placeholder="搜尋遺物名稱"
                class="flex-1 min-w-[150px]
                       bg-slate-950 border border-slate-600
                       rounded px-3 py-2 text-sm text-white">

            <button
                class="btn bg-sky-900 border-sky-700
                       text-sky-200 px-3 py-2 font-bold"
                onclick="relicBookDoSearch()">
                搜尋
            </button>

            ${
                _relicBookQuery
                ? `
                    <button
                        class="btn bg-slate-800 border-slate-600
                               px-3 py-2"
                        onclick="relicBookClearSearch()">
                        清除
                    </button>
                  `
                : ''
            }

        </div>


        <div class="flex gap-2 mb-4">

            <button
                onclick="relicBookSetFilter('all')"
                class="btn flex-1 py-2 text-sm font-bold
                       ${
                           _relicBookFilter === 'all'
                           ? 'bg-sky-800 border-sky-500 text-white'
                           : 'bg-slate-800 border-slate-600 text-slate-300'
                       }">
                全部
            </button>

            <button
                onclick="relicBookSetFilter('got')"
                class="btn flex-1 py-2 text-sm font-bold
                       ${
                           _relicBookFilter === 'got'
                           ? 'bg-emerald-900 border-emerald-600 text-emerald-200'
                           : 'bg-slate-800 border-slate-600 text-slate-300'
                       }">
                已收集
            </button>

            <button
                onclick="relicBookSetFilter('missing')"
                class="btn flex-1 py-2 text-sm font-bold
                       ${
                           _relicBookFilter === 'missing'
                           ? 'bg-amber-950 border-amber-700 text-amber-200'
                           : 'bg-slate-800 border-slate-600 text-slate-300'
                       }">
                未收集
            </button>

        </div>
    `;


    let cells = ids.map(id => {

        let d = DB.items[id];

        if (!d) return '';

        let got = relicDexHas(id);

        let imgUrl =
            typeof getIconUrl === 'function'
                ? getIconUrl(d)
                : (d.img || '');

        return `
            <button
                type="button"
                onclick="openRelicDexDetail('${id}')"
                class="relative bg-slate-800/70
                       border ${
                           got
                           ? 'border-sky-600/80'
                           : 'border-slate-700/70'
                       }
                       rounded-lg p-2
                       flex flex-col items-center gap-1
                       w-[116px]
                       hover:bg-slate-700/80">

                <span class="absolute top-1 right-1
                             text-[9px] px-1 rounded
                             ${
                                 got
                                 ? 'text-emerald-300'
                                 : 'text-slate-500'
                             }
                             bg-black/60 font-bold">

                    ${
                        got
                        ? '已收集'
                        : '未收集'
                    }

                </span>

                <span class="${
                    got
                    ? 'relic-glow-wrap'
                    : ''
                }">

                    <img
                        src="${imgUrl}"
                        alt="${relicEsc(d.n)}"
                        class="w-14 h-14 object-contain
                               ${
                                   got
                                   ? 'relic-glow'
                                   : 'opacity-45 grayscale'
                               }"
                        onerror="this.onerror=null;this.src='https://placehold.co/56x56/1e293b/334155?text=%3F';">

                </span>

                <div class="text-center w-full
                            text-xs font-bold
                            ${
                                got
                                ? 'c-relic'
                                : 'text-slate-400'
                            }
                            leading-tight mt-1">

                    ${relicEsc(d.n)}

                </div>

            </button>
        `;
    }).join('');


    host.innerHTML =
        head +
        `<div class="flex flex-wrap gap-2 justify-center">
            ${
                cells ||
                '<div class="text-slate-500 p-8">沒有符合條件的遺物。</div>'
            }
        </div>`;
}
