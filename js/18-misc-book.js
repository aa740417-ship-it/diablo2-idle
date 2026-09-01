// ========== 🧰 道具收集冊（概念同裝備收集冊：獲得即登錄、依物品類型分類、只列「有獲得管道」的道具）==========
//   ・由「收藏」面板（道具欄右上角按鈕）→「道具」開啟；資料存 player.miscDex（itemId->true·永久只增不減·共用桶 MISCDEX_KEY）。
//   ・登錄點：gainItem → registerMiscObtained（js/08）。分類：藥水/卷軸/技能書/材料/其他（miscCatKey）。
//   ・排除：裝備(wpn/arm/acc·歸裝備冊)、怪物卡片(card_*/eff:card·歸怪物冊)；以及「無任何獲得管道」的道具(OBTAINABLE_MISC 過濾)。
//   ・🗑️ v3.5.87 起「收集冊本體」不再需要任何排除機制：item_card_book / item_equip_book 的 DB.items 定義已刪除，
//     不存在於 DB 即自然不進分母（原本那行冗餘排除已一併移除）。
//     ⚠️ 日後若把 item_card_book 重新加回 DB 定義（例如做成活動道具），它會跑進道具收集冊分母，需自行補排除
//     （加進 MISC_BOOK_EXCLUDED 或在 miscCatKey 回 null）。

// ---- 分類（顯示順序）----
const MISC_CATEGORIES = [
    { key: 'pot',     name: '藥水' },
    { key: 'scroll',  name: '卷軸' },
    { key: 'skillbk', name: '技能書' },
    { key: 'mat',     name: '材料' },
    { key: 'special', name: '其他' }
];

// 已停用且無獲取管道的舊道具：保留物品定義供舊存檔辨識，但永不列入收集冊、完成數或全收集加成。
const MISC_BOOK_EXCLUDED = {
    new_item_bless_wpn: true,
    new_item_bless_arm: true,
    new_item_bless_acc: true
};

// ---- 將一個道具分到類別 key（回傳 null＝不收錄：MISC_BOOK_EXCLUDED 名單／裝備／怪物卡片）----
//   ⚠️ v3.5.87 起本函式已無「收集冊本體」的排除分支：item_card_book / item_equip_book 的 DB.items 定義已刪除，
//      呼叫端遍歷 DB.items 時根本不會走到它們。日後若把 item_card_book 重新加回 DB 定義（例如做成活動道具），
//      它會跑進道具收集冊分母，需自行補排除（加進上方 MISC_BOOK_EXCLUDED 最省事）。
function miscCatKey(id, d) {
    if (!d) return null;
    if (MISC_BOOK_EXCLUDED[id]) return null;
    var t = d.type;
    if (t === 'wpn' || t === 'arm' || t === 'acc') return null;          // 裝備 → 裝備收集冊
    if (d.eff === 'card' || id.indexOf('card_') === 0) return null;       // 怪物卡片 → 怪物收集冊
    if (t === 'pot' || id.indexOf('potion_') === 0) return 'pot';
    if (t === 'scroll' || id.indexOf('scroll_') === 0 || (d.n && d.n.indexOf('卷軸') >= 0)) return 'scroll';   // 卷軸（含 賦予祝福/解除詛咒 等 type:misc/new_item_ 命名為「卷軸」者）
    if (t === 'skillbk' || id.indexOf('bk_') === 0 || id.indexOf('mem_') === 0) return 'skillbk';
    if (t === 'etc' || id.indexOf('mat_') === 0 || id.indexOf('new_item_') === 0) return 'mat';
    return 'special';                                                     // 蠟燭/萬能藥/靈魂之球/娃娃袋/任務道具…
}

// ---- 「有獲得管道」集合（建一次）：潘朵拉(gachaWeight>0)∪掉落表∪商店∪製作成品/材料∪地區加成；另由 registerMiscObtained 動態補登「曾獲得但靜態未列」者 ----
const OBTAINABLE_MISC = (function buildObtainableMisc() {
    var S = {};
    function add(id) { if (id && id !== 'gold' && DB.items[id]) S[id] = true; }
    // (a) 潘朵拉抽獎池
    for (var id in DB.items) { var d = DB.items[id]; if (d && (d.gachaWeight || 0) > 0) S[id] = true; }
    // (b) 怪物掉落表（含黑暗/龍/戰士/記憶等附加表·typeof 守衛跳過不存在者）
    function addTable(tbl) {
        if (!tbl || typeof tbl !== 'object') return;
        for (var mob in tbl) { var arr = tbl[mob]; if (!Array.isArray(arr)) continue; arr.forEach(function (e) { add(Array.isArray(e) ? e[0] : e); }); }
    }
    if (typeof MOB_DROPS !== 'undefined') addTable(MOB_DROPS);
    if (typeof DARK_WEAPON_DROPS !== 'undefined') addTable(DARK_WEAPON_DROPS);
    if (typeof DARK_CRYSTAL_DROPS !== 'undefined') addTable(DARK_CRYSTAL_DROPS);
    if (typeof DRAGON_DROPS !== 'undefined') addTable(DRAGON_DROPS);
    if (typeof WARRIOR_DROPS !== 'undefined') addTable(WARRIOR_DROPS);
    if (typeof MEM_DROPS !== 'undefined') addTable(MEM_DROPS);
    // (c) 商店清單
    try { if (typeof SHOP_LISTS === 'object' && SHOP_LISTS) for (var npc in SHOP_LISTS) { var lst = SHOP_LISTS[npc]; if (Array.isArray(lst)) lst.forEach(add); } } catch (e) {}
    // (d) 製作：成品＋所有材料（材料消耗即代表玩家曾持有→可收集；中間物也算·與遞迴製作一致）
    try {
        if (typeof CRAFT_RECIPES === 'object' && CRAFT_RECIPES) for (var cn in CRAFT_RECIPES) {
            var recs = CRAFT_RECIPES[cn]; if (!Array.isArray(recs)) continue;
            recs.forEach(function (r) { if (!r) return; add(r.result); if (Array.isArray(r.req)) r.req.forEach(function (m) { if (m) add(m.id); }); });
        }
    } catch (e) {}
    // (e) 地區獵殺加成道具（const 在 js/01 為閉包內·此處內聯）
    ['new_item_164', 'new_item_195', 'new_item_165'].forEach(add);
    // (f) 兌換/特殊取得的卷軸（gachaWeight0·掃描器漏掉·顯式補）：祝福的卷軸(伊賽馬利)、解除詛咒卷軸
    ['scroll_weapon_b', 'scroll_armor_b', 'new_item_uncurse'].forEach(add);
    // (g) v3.5.87 兌換限定道具無掉落表來源→顯式補登：魔法娃娃的袋子/高級盒子（銀卡/金卡兌換·gachaWeight0）
    //     否則只靠 registerMiscObtained 動態補登（僅在記憶體）→重載後不在靜態索引，收集冊計數靜默退回
    ['doll_bag', 'doll_box_high'].forEach(add);
    return S;
})();
function miscObtainable(id) { return !!OBTAINABLE_MISC[id]; }

// ---- 建立索引：類別 → [itemId,...]（依價格排序）、itemId → 類別。僅收「可分類 ∧ 有獲得管道」者 ----
const MISC_CAT_ITEMS = {};   // catKey -> [itemId,...]
const MISC_ITEM_CAT = {};    // itemId -> catKey
(function buildMiscIndex() {
    MISC_CATEGORIES.forEach(function (c) { MISC_CAT_ITEMS[c.key] = []; });
    for (var id in DB.items) {
        var d = DB.items[id]; if (!d) continue;
        var ck = miscCatKey(id, d); if (!ck || !MISC_CAT_ITEMS[ck]) continue;
        if (!miscObtainable(id)) continue;                               // 🚫 無獲得管道→不列
        MISC_CAT_ITEMS[ck].push(id); MISC_ITEM_CAT[id] = ck;
    }
    for (var k in MISC_CAT_ITEMS) {
        MISC_CAT_ITEMS[k].sort(function (a, b) { return ((DB.items[a].p || 0) - (DB.items[b].p || 0)) || ((DB.items[a].n || '') < (DB.items[b].n || '') ? -1 : 1); });
    }
})();

// ---- dex 助手（player.miscDex: itemId -> true）----
function miscDexHas(id) { return !!(player && player.miscDex && player.miscDex[id]); }
function miscCatCount(ck) { var arr = MISC_CAT_ITEMS[ck] || []; return { got: arr.filter(miscDexHas).length, total: arr.length }; }
function miscCatComplete(ck) { var cc = miscCatCount(ck); return cc.total > 0 && cc.got >= cc.total; }

// ---- 全收集加成（道具收藏完成能力）：藥水/卷軸→負重+10·技能書→MP自然恢復+3·材料→藥水恢復+3%·其他→藥水恢復+2% ----
const MISC_CAT_BONUS = {
    pot:     { stat: 'weight', val: 10, label: '負重 +10' },
    scroll:  { stat: 'weight', val: 10, label: '負重 +10' },
    skillbk: { stat: 'mpR',    val: 3,  label: 'MP自然恢復量 +3' },
    mat:     { stat: 'potion', val: 3,  label: '藥水恢復量 +3%' },
    special: { stat: 'potion', val: 2,  label: '藥水恢復量 +2%' }
};
// recomputeStats 鉤子（js/02 呼叫·仿 equipCollectionBonus）：weight→d._miscWeightBonus(負重段)、mpR→d.mpR、potion→p._miscPotionBonus(js/08 藥水恢復%)。傭兵換身重算時借隊長 miscDex 亦生效。
function miscCollectionBonus(p, d) {
    if (d) d._miscWeightBonus = 0;
    if (p) p._miscPotionBonus = 0;
    if (!p || !p.miscDex) return;
    for (var k in MISC_CAT_BONUS) {
        if (!miscCatComplete(k)) continue;
        var b = MISC_CAT_BONUS[k];
        if (b.stat === 'weight') d._miscWeightBonus += b.val;
        else if (b.stat === 'mpR') d.mpR += b.val;
        else if (b.stat === 'potion') p._miscPotionBonus += b.val;
    }
}

// ---- 無法獲得但仍有用途的卷軸 → 預設「圖鑑已開通」(計入收集·讓卷軸類仍可完成) ----
//   new_item_uncurse 既有持有者仍可用、無新來源所以全模式開通；祝福的施法卷軸 scroll_*_b 仍可由伊賽馬利兌換→只在經典開通。
//   已停用的三種賦予祝福卷軸由 MISC_BOOK_EXCLUDED 完全排除，不再用自動開通方式佔據收集冊格位。
//   🏛️v3.0.83 傳統模式已取消：經典+傳統的強化卷軸自動開通分支移除（施法卷軸已恢復全模式可取得）。
const MISC_SCROLL_UNCURSE = ['new_item_uncurse'];
const MISC_SCROLL_BLESSED = ['scroll_weapon_b', 'scroll_armor_b'];
function _miscModeAutoComplete() {
    if (!player) return;
    if (!player.miscDex) player.miscDex = {};
    var marks = [].concat(MISC_SCROLL_UNCURSE);                                                    // 全模式：解除詛咒卷軸（來源已移除但仍有用途）
    if (player.classicMode) marks = marks.concat(MISC_SCROLL_BLESSED);                             // 經典：祝福的施法卷軸（經典不掉施法卷軸→無從兌換）
    var changed = false;
    marks.forEach(function (id) { if (DB.items[id] && MISC_ITEM_CAT[id] && !player.miscDex[id]) { player.miscDex[id] = true; changed = true; } });
    if (changed && typeof saveMiscDex === 'function') saveMiscDex();
}

// ---- gainItem 呼叫：獲得任何「可分類道具」即登錄；曾獲得但靜態未列(任務/兌換給予)→動態補進索引，確保收集冊看得到 ----
function registerMiscObtained(id) {
    if (!player) return;
    var d = DB.items[id]; if (!d) return;
    var ck = miscCatKey(id, d); if (!ck) return;
    if (!player.miscDex) player.miscDex = {};
    if (!MISC_ITEM_CAT[id]) { if (!MISC_CAT_ITEMS[ck]) MISC_CAT_ITEMS[ck] = []; MISC_CAT_ITEMS[ck].push(id); MISC_ITEM_CAT[id] = ck; }   // 動態補登
    if (!player.miscDex[id]) { player.miscDex[id] = true; if (typeof saveMiscDex === 'function') saveMiscDex(); }
}

// ---- 創角/讀檔保底：把現有背包道具補登錄（舊存檔遷移）----
function ensureMiscDex(warehouse) {
    if (!player || !Array.isArray(player.inv)) return;
    if (!player.miscDex) player.miscDex = {};
    var changed = false;
    var reg = function (i) {
        if (!i || !i.id) return;
        var d = DB.items[i.id]; if (!d) return;
        var ck = miscCatKey(i.id, d); if (!ck) return;
        if (!MISC_ITEM_CAT[i.id]) { if (!MISC_CAT_ITEMS[ck]) MISC_CAT_ITEMS[ck] = []; MISC_CAT_ITEMS[ck].push(i.id); MISC_ITEM_CAT[i.id] = ck; }
        if (!player.miscDex[i.id]) { player.miscDex[i.id] = true; changed = true; }
    };
    player.inv.forEach(reg);
    // 🏛️ v3.0.61 倉庫庫存也補登錄（唯讀當前模式倉庫桶·同 ensureEquipBook）：收集冊上線前入倉的道具從未經 gainItem 登錄→讀檔時一併點亮
    try { var _w = warehouse || (typeof loadWarehouse === 'function' ? loadWarehouse() : null); if (_w && Array.isArray(_w.items)) _w.items.forEach(reg); } catch (e) {}
    if (changed && typeof saveMiscDex === 'function') saveMiscDex();
    _miscModeAutoComplete();   // 🔒 經典：無法獲得的卷軸預設已收集
}

// ===== 🧰 道具收集冊 全螢幕書頁 UI =====
let _miscBookOpen = false;
let _miscBookCat = MISC_CATEGORIES[0].key;
function openMiscBook() {
    if (!player) return;
    if (!player.miscDex) player.miscDex = {};
    if (typeof mergeSharedIntoPlayer === 'function' && mergeSharedIntoPlayer('misc') && typeof calcStats === 'function') calcStats();   // 🔄 多開兜底：開書前併入其他分頁的道具進度；⚠️ MISC_CAT_BONUS 有加成（負重+10／MP恢復+3／藥水恢復%），合併後要重算（比照 js/15 openCardBook）
    if (typeof closeModal === 'function') closeModal();
    _miscBookOpen = true;
    var el = document.getElementById('misc-book'); if (!el) return;
    el.classList.remove('hidden');
    renderMiscBook();
}
function closeMiscBook() { _miscBookOpen = false; var el = document.getElementById('misc-book'); if (el) el.classList.add('hidden'); }
function miscBookTab(key) { _miscBookCat = key; renderMiscBook(); }
function miscBookBackdrop(ev) { if (ev && ev.target && ev.target.id === 'misc-book') closeMiscBook(); }

function renderMiscBook() {
    var host = document.getElementById('misc-book-body'); if (!host) return;
    var tabHost = document.getElementById('misc-book-tabs');
    if (tabHost) {
        tabHost.innerHTML = MISC_CATEGORIES.filter(function (c) { return (MISC_CAT_ITEMS[c.key] || []).length > 0; }).map(function (c) {
            var cc = miscCatCount(c.key);
            var active = (c.key === _miscBookCat);
            var done = cc.total > 0 && cc.got >= cc.total;
            return '<button onclick="miscBookTab(\'' + c.key + '\')" class="btn px-2.5 py-1 text-xs font-bold whitespace-nowrap ' + (active ? 'bg-amber-800 border-amber-500 text-amber-100' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700') + '">' + c.name + '<span class="ml-1 text-[10px] ' + (done ? 'text-emerald-400' : 'text-slate-400') + '">' + cc.got + '/' + cc.total + '</span></button>';
        }).join('');
    }
    var cat = MISC_CATEGORIES.find(function (c) { return c.key === _miscBookCat; }) || MISC_CATEGORIES[0];
    var ids = MISC_CAT_ITEMS[cat.key] || [];
    var cc = miscCatCount(cat.key);
    var _b = MISC_CAT_BONUS[cat.key];
    var _done = cc.total > 0 && cc.got >= cc.total;
    var _bonusHtml = _b ? '<div class="text-sm font-bold ' + (_done ? 'text-emerald-300' : 'text-slate-500') + '">🏆 全收集加成：' + _b.label + '<span class="ml-1 text-xs font-normal">' + (_done ? '（已啟用）' : '（未完成）') + '</span></div>' : '';
    var head = '<div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">' +
        '<div class="text-xl font-bold text-amber-200">' + cat.name + '<span class="text-sm text-slate-400 font-normal ml-2">已收集 ' + cc.got + ' / ' + cc.total + '</span></div>' +
        _bonusHtml +
        '</div>';
    var cells = ids.map(function (id) {
        var d = DB.items[id]; var got = miscDexHas(id);
        var imgUrl = (typeof getIconUrl === 'function') ? getIconUrl(d) : (d.img || '');
        var silh = got ? '' : ' card-silhouette';
        var glow = (got && typeof getGlowClass === 'function') ? getGlowClass({ id: id }, d) : '';                 // 🌟 祝福(金)/詛咒(紅)卷軸對應光芒
        var nameCol = (got && typeof getItemColor === 'function') ? getItemColor({ id: id }) : (d.c || 'text-white');   // 祝福的=c-blessed金、詛咒的=c-cursed紅
        var nameHtml = got
            ? '<div class="text-xs font-bold ' + nameCol + ' truncate" title="' + (d.n || '') + '">' + (d.n || '') + '</div>'
            : '<div class="text-xs font-bold text-slate-500">？？？</div>';
        return '<div class="relative bg-slate-800/70 border ' + (got ? 'border-slate-600' : 'border-slate-700/60') + ' rounded-lg p-2 flex flex-col items-center gap-1 w-[112px]' + (got ? ' tip-host cursor-help' : '') + '"' + (got ? ' data-tip-id="' + id + '"' : '') + '>' +
            '<img src="' + imgUrl + '" alt="' + (d.n || '') + '" class="w-14 h-14 object-contain' + silh + (glow ? ' ' + glow : '') + '" onerror="this.onerror=null;this.src=\'https://placehold.co/56x56/1e293b/334155?text=%3F\';">' +
            '<div class="text-center w-full">' + nameHtml + '</div>' +
            '</div>';
    }).join('');
    host.innerHTML = head + '<div class="flex flex-wrap gap-2 justify-center">' + (cells || '<div class="text-slate-500 p-8">此類別暫無可收集的道具。</div>') + '</div>';
}

// ===== 📦 收藏面板（裝備 / 道具 / 怪物 三大入口）=====
function openCollectionPanel() { var el = document.getElementById('collection-panel'); if (el) el.classList.remove('hidden'); }
function closeCollectionPanel() { var el = document.getElementById('collection-panel'); if (el) el.classList.add('hidden'); }
function collectionPanelBackdrop(ev) { if (ev && ev.target && ev.target.id === 'collection-panel') closeCollectionPanel(); }
function collectionOpenEquip() { closeCollectionPanel(); if (typeof openEquipBook === 'function') openEquipBook(); }
function collectionOpenMisc() { closeCollectionPanel(); openMiscBook(); }
function collectionOpenCard() { closeCollectionPanel(); if (typeof openCardBook === 'function') openCardBook(); }

// ===== 📖 v3.8 addon v2：完整掉落查詢＋遊戲百科 =====
(function(){
  var _pediaMode='mob', _pediaQuery='';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function num(v){return (v==null||v==='')?'?':(typeof v==='number'?v.toLocaleString():v);}
  function dropTables(){
    var out=[]; function add(label,t){if(t&&typeof t==='object')out.push([label,t]);}
    try{add('一般掉落',MOB_DROPS);}catch(e){} try{add('黑暗武器',DARK_WEAPON_DROPS);}catch(e){}
    try{add('黑暗水晶',DARK_CRYSTAL_DROPS);}catch(e){} try{add('龍系掉落',DRAGON_DROPS);}catch(e){}
    try{add('戰士掉落',WARRIOR_DROPS);}catch(e){} try{add('記憶水晶',MEM_DROPS);}catch(e){}
    return out;
  }
  function mobDrops(name){var a=[];dropTables().forEach(function(x){var rows=x[1][name];if(!Array.isArray(rows))return;rows.forEach(function(r){if(r&&r.length)a.push({id:r[0],rate:Number(r[1]),src:x[0]});});});return a;}
  function itemName(id){var d=(typeof DB!=='undefined'&&DB.items&&DB.items[id]);return d?(d.n||id):id;}
  function itemSources(id){var a=[];dropTables().forEach(function(x){Object.keys(x[1]).forEach(function(m){(x[1][m]||[]).forEach(function(r){if(r&&r[0]===id)a.push({mob:m,rate:Number(r[1]),src:x[0]});});});});return a;}
  function fmtRate(n){if(!isFinite(n))return '?';if(n>=1)return n.toLocaleString()+'%';if(n>=0.01)return n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'%';return n.toFixed(4).replace(/0+$/,'').replace(/\.$/,'')+'%';}
  function mapNames(){var o={};try{if(typeof MAP_REGIONS!=='undefined')MAP_REGIONS.forEach(function(r){(r.maps||[]).forEach(function(m){o[m.v]=m.t;});});}catch(e){}
    ['HIDDEN_AREA_NAMES','SANCTUARY_MAP_NAMES','ANTHARAS_AREA_NAMES'].forEach(function(k){try{var x=window[k];if(x)Object.keys(x).forEach(function(id){o[id]=x[id];});}catch(e){}});
    try{if(typeof MAP_CATEGORIES!=='undefined')Object.keys(MAP_CATEGORIES).forEach(function(c){(MAP_CATEGORIES[c]||[]).forEach(function(m){o[m.v]=m.t;});});}catch(e){}
    return o;
  }
  function mobMaps(id,name){var out=[],seen={};if(!DB||!DB.maps)return out;var mn=mapNames();Object.keys(DB.maps).forEach(function(k){var rows=DB.maps[k];if(!Array.isArray(rows))return;if(rows.indexOf(id)>=0){var t=mn[k]||k;if(!seen[t]){seen[t]=1;out.push({id:k,n:t});}}});return out;}
  function mobIdByName(n){var ids=Object.keys((DB&&DB.mobs)||{});for(var i=0;i<ids.length;i++){var d=DB.mobs[ids[i]];if((d.n||ids[i])===n)return ids[i];}return null;}
  function classText(req){if(!req||req==='all')return '全職業';var m={royal:'王族',knight:'騎士',elf:'妖精',mage:'法師',dark:'黑暗妖精',dragon:'龍騎士',illusion:'幻術士',warrior:'戰士'};return String(req).split(',').map(function(x){return m[x]||x;}).join('／');}
  function itemType(d){if(!d)return '道具';if(d.type==='wpn')return d.isBow?'遠程武器':'武器';if(d.type==='armor'||d.type==='arm')return '防具';if(d.type==='helm')return '頭盔';if(d.type==='cloak')return '斗篷';if(d.type==='boots')return '靴子';if(d.type==='gloves')return '手套';if(d.type==='shield')return '盾牌';if(d.type==='ring')return '戒指';if(d.type==='amulet')return '項鍊';return d.type||'道具';}
  function itemStats(d){var a=[];if(!d)return a;if(d.dmgS!=null||d.dmgL!=null)a.push('傷害 '+num(d.dmgS)+'／'+num(d.dmgL));if(d.hit)a.push('命中 '+(d.hit>0?'+':'')+d.hit);if(d.dmgBonus)a.push('額外傷害 '+(d.dmgBonus>0?'+':'')+d.dmgBonus);if(d.ac)a.push('AC '+(d.ac>0?'+':'')+d.ac);if(d.mr)a.push('MR '+(d.mr>0?'+':'')+d.mr);['str','dex','con','int','wis','cha','sp','hp','mp'].forEach(function(k){if(d[k])a.push(k.toUpperCase()+' '+(d[k]>0?'+':'')+d[k]);});if(d.safe!=null)a.push('安全強化 +'+d.safe);if(d.req)a.push('職業 '+classText(d.req));return a;}
  function skillReq(d){var a=[],m=[['reqK','騎士'],['reqE','妖精'],['reqM','法師'],['reqD','黑妖'],['reqDk','龍騎'],['reqI','幻術'],['reqW','戰士'],['reqR','王族']];m.forEach(function(x){if(d[x[0]]!=null)a.push(x[1]+' Lv.'+d[x[0]]);});return a.length?a.join('／'):'特殊／被動技能';}
  function skillInfo(d){var a=[];if(d.mp!=null)a.push('MP '+d.mp);if(d.tier!=null)a.push('階級 '+d.tier);if(d.ele&&d.ele!=='none')a.push('屬性 '+({fire:'火',water:'水',wind:'風',earth:'地'}[d.ele]||d.ele));if(d.target==='all')a.push('範圍攻擊');if(d.dur)a.push('持續 '+d.dur+'秒');if(d.dmgDice)a.push('傷害 '+d.dmgDice[0]+'D'+d.dmgDice[1]+(d.dmgBase?' + '+d.dmgBase:''));return a;}
  function jump(mode,q){_pediaMode=mode;_pediaQuery=q||'';var s=document.getElementById('pd-search');if(s)s.value=_pediaQuery;render();var b=document.getElementById('pd-body');if(b)b.scrollTop=0;}
  function linkBtn(mode,q,label){return '<button class="pd-link" onclick="pediaJump(\''+mode+'\',\''+String(q).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')">'+esc(label)+'</button>';}
  function ensure(){if(document.getElementById('game-pedia'))return;
    var st=document.createElement('style');st.textContent='\
#game-pedia{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.82);display:flex;align-items:stretch;justify-content:center;padding:8px}#game-pedia.hidden{display:none}\
#game-pedia .pd-box{width:min(780px,100%);height:100%;background:#101827;border:1px solid #8b6a3d;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;color:#e5e7eb}\
#game-pedia .pd-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #475569;background:#1b2433}.pd-title{font-size:19px;font-weight:800;color:#fcd34d;flex:1}\
#game-pedia button{border:1px solid #64748b;border-radius:8px;padding:7px 10px;background:#1e293b;color:#e5e7eb;font-weight:700;white-space:nowrap}#game-pedia button.on{border-color:#d97706;background:#78350f;color:#fde68a}\
#game-pedia .pd-search{margin:9px 10px;padding:10px 12px;border-radius:8px;border:1px solid #64748b;background:#0f172a;color:white;font-size:16px}\
#game-pedia .pd-tabs{display:flex;gap:6px;padding:0 10px 8px;overflow-x:auto;-webkit-overflow-scrolling:touch}.pd-body{overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:0 10px 90px;flex:1}\
#game-pedia .pd-card{border:1px solid #475569;border-radius:10px;background:#111c30;margin:8px 0;padding:11px}.pd-name{font-size:17px;font-weight:800;color:#fcd34d}.pd-sub{color:#a8b3c5;font-size:13px;margin-top:4px;line-height:1.5}.pd-section{margin-top:9px;font-weight:800;color:#e2e8f0}.pd-drop{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #273449}.pd-rate{color:#86efac;font-weight:700;white-space:nowrap}.pd-empty{color:#64748b;text-align:center;padding:30px 10px}.pd-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}.pd-link{font-size:12px!important;padding:4px 7px!important;background:#172033!important;border-color:#475569!important}.pd-boss{border-color:#9a3412!important;background:#1f1720!important}\
#pedia-fab{position:fixed;right:14px;bottom:82px;z-index:9000;border:1px solid #d97706;border-radius:999px;background:#422006;color:#fde68a;padding:10px 14px;font-weight:800;box-shadow:0 3px 12px #0008}\
';document.head.appendChild(st);
    var el=document.createElement('div');el.id='game-pedia';el.className='hidden';el.innerHTML='<div class="pd-box"><div class="pd-head"><div class="pd-title">📖 天堂小百科</div><button onclick="closeGamePedia()">✕</button></div><input id="pd-search" class="pd-search" placeholder="搜尋怪物、物品、技能、地圖…" oninput="pediaSearch(this.value)"><div class="pd-tabs"><button id="pd-tab-mob" onclick="pediaTab(\'mob\')">怪物</button><button id="pd-tab-boss" onclick="pediaTab(\'boss\')">👑 Boss</button><button id="pd-tab-item" onclick="pediaTab(\'item\')">掉落</button><button id="pd-tab-equip" onclick="pediaTab(\'equip\')">裝備</button><button id="pd-tab-skill" onclick="pediaTab(\'skill\')">技能</button><button id="pd-tab-map" onclick="pediaTab(\'map\')">地圖</button></div><div id="pd-body" class="pd-body"></div></div>';document.body.appendChild(el);el.addEventListener('click',function(e){if(e.target===el)closeGamePedia();});
    var b=document.createElement('button');b.id='pedia-fab';b.textContent='📖 百科';b.onclick=openGamePedia;document.body.appendChild(b);
  }
  function mobCard(id,d){var n=d.n||id,drops=mobDrops(n),maps=mobMaps(id,n);var h='<div class="pd-card '+(d.boss?'pd-boss':'')+'"><div class="pd-name">'+esc(n)+(d.boss?' 👑':'')+'</div><div class="pd-sub">Lv.'+num(d.lv)+'　HP '+num(d.hp)+'　AC '+num(d.ac)+'　MR '+num(d.mr)+(d.race?'　種族 '+esc(d.race):'')+'</div><div class="pd-sub">攻擊 '+(Array.isArray(d.dmg)?esc(d.dmg[0]+'～'+d.dmg[1]):'?')+'　命中 '+num(d.hit)+'　EXP '+num(d.exp)+(d.dr?'　DR '+num(d.dr):'')+'</div>';
    if(maps.length)h+='<div class="pd-section">出沒地圖</div><div class="pd-tags">'+maps.map(function(m){return linkBtn('map',m.n,m.n);}).join('')+'</div>';
    h+='<div class="pd-section">掉落物</div>'+(drops.length?drops.map(function(r){return '<div class="pd-drop"><span>'+linkBtn('item',itemName(r.id),itemName(r.id))+' <small style="color:#64748b">['+esc(r.src)+']</small></span><span class="pd-rate">'+fmtRate(r.rate)+'</span></div>';}).join(''):'<div class="pd-sub">目前掉落表沒有資料</div>')+'</div>';return h;
  }
  function render(){ensure();var body=document.getElementById('pd-body'),q=_pediaQuery.trim().toLowerCase();['mob','boss','item','equip','skill','map'].forEach(function(m){var x=document.getElementById('pd-tab-'+m);if(x)x.classList.toggle('on',_pediaMode===m);});var html='';
    if(_pediaMode==='mob'||_pediaMode==='boss'){
      var arr=Object.keys((DB&&DB.mobs)||{}).map(function(id){return [id,DB.mobs[id]];}).filter(function(x){var n=(x[1].n||x[0]).toLowerCase();return (_pediaMode!=='boss'||x[1].boss)&&(!q||n.indexOf(q)>=0||x[0].toLowerCase().indexOf(q)>=0);}).sort(function(a,b){return (a[1].lv||0)-(b[1].lv||0);});arr.slice(0,500).forEach(function(x){html+=mobCard(x[0],x[1]);});
    } else if(_pediaMode==='item'){
      var ids=Object.keys((DB&&DB.items)||{}).filter(function(id){var n=itemName(id).toLowerCase();return !q||n.indexOf(q)>=0||id.toLowerCase().indexOf(q)>=0;}).sort(function(a,b){return itemName(a).localeCompare(itemName(b),'zh-Hant');});ids.slice(0,600).forEach(function(id){var d=DB.items[id],src=itemSources(id);if(q===''&&!src.length)return;html+='<div class="pd-card"><div class="pd-name">'+esc(d.n||id)+'</div><div class="pd-sub">'+esc(itemType(d))+(d.d?'　'+esc(d.d):'')+'</div><div class="pd-section">掉落來源</div>'+(src.length?src.map(function(r){return '<div class="pd-drop"><span>'+linkBtn('mob',r.mob,r.mob)+' <small style="color:#64748b">['+esc(r.src)+']</small></span><span class="pd-rate">'+fmtRate(r.rate)+'</span></div>';}).join(''):'<div class="pd-sub">沒有怪物掉落來源（可能由商店／製作／任務取得）</div>')+'</div>';});
    } else if(_pediaMode==='equip'){
      Object.keys((DB&&DB.items)||{}).filter(function(id){var d=DB.items[id],n=(d.n||id).toLowerCase();return d&&(d.type==='wpn'||d.safe!=null||d.ac!=null)&&( !q||n.indexOf(q)>=0||id.toLowerCase().indexOf(q)>=0);}).sort(function(a,b){return itemName(a).localeCompare(itemName(b),'zh-Hant');}).slice(0,600).forEach(function(id){var d=DB.items[id],src=itemSources(id);html+='<div class="pd-card"><div class="pd-name">'+esc(d.n||id)+'</div><div class="pd-sub">'+esc(itemType(d))+'</div><div class="pd-tags">'+itemStats(d).map(function(s){return '<span class="pd-link">'+esc(s)+'</span>';}).join('')+'</div>'+(src.length?'<div class="pd-section">主要掉落</div>'+src.slice(0,8).map(function(r){return '<div class="pd-drop"><span>'+linkBtn('mob',r.mob,r.mob)+'</span><span class="pd-rate">'+fmtRate(r.rate)+'</span></div>';}).join(''):'')+'</div>';});
    } else if(_pediaMode==='skill'){
      Object.keys((DB&&DB.skills)||{}).filter(function(id){var d=DB.skills[id],n=(d.n||id).toLowerCase();return !q||n.indexOf(q)>=0||id.toLowerCase().indexOf(q)>=0;}).sort(function(a,b){return (DB.skills[a].tier||99)-(DB.skills[b].tier||99);}).slice(0,700).forEach(function(id){var d=DB.skills[id];html+='<div class="pd-card"><div class="pd-name">'+esc(d.n||id)+'</div><div class="pd-sub">'+esc(skillReq(d))+'</div><div class="pd-tags">'+skillInfo(d).map(function(s){return '<span class="pd-link">'+esc(s)+'</span>';}).join('')+'</div>'+(d.msg?'<div class="pd-sub">'+esc(d.msg)+'</div>':'')+'</div>';});
    } else if(_pediaMode==='map'){
      var mn=mapNames();Object.keys((DB&&DB.maps)||{}).map(function(id){return {id:id,n:mn[id]||id,rows:DB.maps[id]||[]};}).filter(function(x){return !q||x.n.toLowerCase().indexOf(q)>=0||x.id.toLowerCase().indexOf(q)>=0;}).sort(function(a,b){return a.n.localeCompare(b.n,'zh-Hant');}).slice(0,500).forEach(function(x){var mobs=x.rows.map(function(id){var d=DB.mobs[id];return d?{id:id,n:d.n||id,boss:!!d.boss,lv:d.lv||0}:null;}).filter(Boolean);var lvs=mobs.map(function(m){return m.lv;}).filter(function(v){return v>0;});html+='<div class="pd-card"><div class="pd-name">'+esc(x.n)+'</div><div class="pd-sub">怪物 '+mobs.length+' 種'+(lvs.length?'　等級約 Lv.'+Math.min.apply(null,lvs)+'～'+Math.max.apply(null,lvs):'')+'</div><div class="pd-tags">'+mobs.slice(0,80).map(function(m){return linkBtn(m.boss?'boss':'mob',m.n,(m.boss?'👑 ':'')+m.n);}).join('')+'</div></div>';});
    }
    body.innerHTML=html||'<div class="pd-empty">找不到符合的資料</div>';
  }
  window.openGamePedia=function(){ensure();document.getElementById('game-pedia').classList.remove('hidden');render();};window.closeGamePedia=function(){var e=document.getElementById('game-pedia');if(e)e.classList.add('hidden');};window.pediaTab=function(m){_pediaMode=m;render();};window.pediaSearch=function(v){_pediaQuery=v||'';render();};window.pediaJump=jump;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else setTimeout(ensure,0);
})();


/* === complete game pedia v1 === */
(function(){

if(window.__completeGamePediaV1) return;
window.__completeGamePediaV1 = true;

var _extraMode = null;
var _extraIndex = null;

var _oldPediaOpen   = window.openGamePedia;
var _oldPediaTab    = window.pediaTab;
var _oldPediaSearch = window.pediaSearch;

function _pe(v){
    return String(v == null ? '' : v)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
}

function _pn(v){
    return String(v == null ? '' : v)
        .toLowerCase()
        .replace(/\s+/g,'')
        .replace(/[()（）【】「」『』·．。！？!?、，,：:；;／\/\\_\-+]/g,'');
}

function _typeName(d){
    if(!d) return '未知';
    var t = d.type || '';

    if(t === 'wpn') return '武器';
    if(t === 'arm') return '防具';
    if(t === 'acc') return '飾品';
    if(t === 'pot') return '藥水';
    if(t === 'scroll') return '卷軸';
    if(t === 'skillbk') return '技能書';
    if(t === 'etc') return '材料';
    if(t === 'misc') return '特殊道具';

    return t || '道具';
}

function _rate(v){
    var n = Number(v);

    if(!isFinite(n)) return '';

    if(n === 0) return '0%';

    if(n < 0.001)
        return n.toFixed(4).replace(/0+$/,'').replace(/\.$/,'') + '%';

    if(n < 0.1)
        return n.toFixed(3).replace(/0+$/,'').replace(/\.$/,'') + '%';

    if(n < 1)
        return n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'') + '%';

    if(Math.floor(n) === n)
        return n + '%';

    return n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'') + '%';
}

function _buildExtraIndex(){

    if(_extraIndex) return _extraIndex;

    var mapNames = {};
    var mobMaps = {};
    var itemDrops = {};
    var shops = {};
    var crafts = {};

    try{
        if(typeof MAP_REGIONS !== 'undefined'){
            MAP_REGIONS.forEach(function(region){
                (region.maps || []).forEach(function(m){
                    mapNames[m.v] = m.t;
                });
            });
        }
    }catch(e){}

    try{
        Object.keys((DB && DB.maps) || {}).forEach(function(mapKey){

            var mapName = mapNames[mapKey] || mapKey;
            var rows = DB.maps[mapKey];

            if(!Array.isArray(rows)) return;

            rows.forEach(function(mobId){

                var seen = {};
                var now = mobId;

                while(now && !seen[now]){

                    seen[now] = true;

                    var mob =
                        DB.mobs &&
                        DB.mobs[now];

                    if(!mob) break;

                    var nm =
                        mob.n || now;

                    if(!mobMaps[nm])
                        mobMaps[nm] = [];

                    if(
                        !mobMaps[nm].some(function(x){
                            return x.key === mapKey;
                        })
                    ){
                        mobMaps[nm].push({
                            key:mapKey,
                            name:mapName
                        });
                    }

                    now = mob.transformTo;
                }
            });
        });
    }catch(e){}

    function addDropTable(tbl){

        if(!tbl || typeof tbl !== 'object')
            return;

        Object.keys(tbl).forEach(function(mobName){

            var arr = tbl[mobName];

            if(!Array.isArray(arr))
                return;

            arr.forEach(function(entry){

                var itemId =
                    Array.isArray(entry)
                        ? entry[0]
                        : entry;

                var chance =
                    Array.isArray(entry)
                        ? Number(entry[1])
                        : NaN;

                if(
                    !itemId ||
                    !DB.items ||
                    !DB.items[itemId]
                ) return;

                if(!itemDrops[itemId])
                    itemDrops[itemId] = [];

                itemDrops[itemId].push({
                    mob:mobName,
                    rate:isFinite(chance)
                        ? chance
                        : null,
                    maps:mobMaps[mobName] || []
                });
            });
        });
    }

    try{
        if(typeof MOB_DROPS !== 'undefined')
            addDropTable(MOB_DROPS);
    }catch(e){}

    try{
        if(typeof DARK_WEAPON_DROPS !== 'undefined')
            addDropTable(DARK_WEAPON_DROPS);
    }catch(e){}

    try{
        if(typeof DARK_CRYSTAL_DROPS !== 'undefined')
            addDropTable(DARK_CRYSTAL_DROPS);
    }catch(e){}

    try{
        if(typeof DRAGON_DROPS !== 'undefined')
            addDropTable(DRAGON_DROPS);
    }catch(e){}

    try{
        if(typeof WARRIOR_DROPS !== 'undefined')
            addDropTable(WARRIOR_DROPS);
    }catch(e){}

    try{
        if(typeof MEM_DROPS !== 'undefined')
            addDropTable(MEM_DROPS);
    }catch(e){}

    var npcHome = {};

    try{
        Object.keys((DB && DB.towns) || {}).forEach(function(k){

            var town = DB.towns[k];

            (town.npcs || []).forEach(function(np){

                if(!np || !np.id) return;

                npcHome[np.id] = {
                    name:np.n || np.id,
                    town:town.n || k
                };
            });
        });
    }catch(e){}

    try{
        if(
            typeof SHOP_LISTS !== 'undefined' &&
            SHOP_LISTS
        ){
            Object.keys(SHOP_LISTS).forEach(function(npc){

                (SHOP_LISTS[npc] || []).forEach(function(id){

                    if(!DB.items[id]) return;

                    if(!shops[id])
                        shops[id] = [];

                    var h = npcHome[npc];

                    shops[id].push({
                        npc:h ? h.name : npc,
                        town:h ? h.town : ''
                    });
                });
            });
        }
    }catch(e){}

    try{
        if(
            typeof CRAFT_RECIPES !== 'undefined' &&
            CRAFT_RECIPES
        ){
            Object.keys(CRAFT_RECIPES).forEach(function(npc){

                (CRAFT_RECIPES[npc] || []).forEach(function(rc){

                    if(
                        !rc ||
                        !rc.result ||
                        !DB.items[rc.result]
                    ) return;

                    if(!crafts[rc.result])
                        crafts[rc.result] = [];

                    var h = npcHome[npc];

                    crafts[rc.result].push({
                        npc:h ? h.name : npc,
                        town:h ? h.town : '',
                        mats:(rc.req || []).map(function(m){

                            if(m.id === 'gold'){
                                return '金幣×' +
                                    Number(m.cnt || 0)
                                    .toLocaleString();
                            }

                            var md =
                                DB.items[m.id];

                            return (
                                md ? md.n : m.id
                            ) + '×' + (m.cnt || 1);
                        })
                    });
                });
            });
        }
    }catch(e){}

    _extraIndex = {
        itemDrops:itemDrops,
        shops:shops,
        crafts:crafts,
        mobMaps:mobMaps
    };

    return _extraIndex;
}

function _skillBookInfo(d){

    if(
        !d ||
        d.type !== 'skillbk' ||
        !d.sk ||
        !DB.skills
    ) return '';

    var sk = DB.skills[d.sk];

    if(!sk) return '';

    var map = {
        reqR:'王族',
        reqK:'騎士',
        reqE:'妖精',
        reqM:'法師',
        reqD:'黑暗妖精',
        reqI:'幻術師',
        reqDr:'龍騎士',
        reqW:'戰士'
    };

    var req = [];

    Object.keys(map).forEach(function(k){
        if(sk[k] !== undefined){
            req.push(
                map[k] +
                ' Lv.' +
                sk[k]
            );
        }
    });

    var txt =
        '📖 對應技能：' +
        _pe(sk.n || d.sk);

    if(req.length)
        txt +=
            '　學習：' +
            _pe(req.join('／'));

    return txt;
}

function _sourceHtml(id){

    var idx = _buildExtraIndex();
    var out = [];

    var drops =
        idx.itemDrops[id] || [];

    drops.slice(0,30).forEach(function(r){

        var maps =
            (r.maps || [])
            .map(function(x){ return x.name; })
            .filter(function(v,i,a){
                return a.indexOf(v) === i;
            });

        out.push(
            '<div class="pd-source-line">' +
            '👹 <b>' + _pe(r.mob) + '</b>' +
            (maps.length
                ? '　🗺️ ' + _pe(maps.join('／'))
                : '') +
            (r.rate != null
                ? '　<span class="pd-rate">' +
                  _rate(r.rate) +
                  '</span>'
                : '') +
            '</div>'
        );
    });

    (idx.shops[id] || []).forEach(function(r){

        out.push(
            '<div class="pd-source-line">' +
            '🏪 商店：<b>' +
            _pe(r.npc) +
            '</b>' +
            (r.town
                ? '　' + _pe(r.town)
                : '') +
            '</div>'
        );
    });

    (idx.crafts[id] || []).forEach(function(r){

        out.push(
            '<div class="pd-source-line">' +
            '🔨 製作：<b>' +
            _pe(r.npc) +
            '</b>' +
            (r.town
                ? '　' + _pe(r.town)
                : '') +
            '</div>' +

            (
                r.mats.length
                    ? '<div class="pd-source-mats">材料：' +
                      _pe(r.mats.join('、')) +
                      '</div>'
                    : ''
            )
        );
    });

    try{
        var d = DB.items[id];

        if(
            d &&
            Number(d.gachaWeight || 0) > 0
        ){
            out.push(
                '<div class="pd-source-line">' +
                '🎁 潘朵拉可取得' +
                '</div>'
            );
        }
    }catch(e){}

    if(!out.length){
        out.push(
            '<div class="pd-source-none">' +
            '目前沒有在靜態掉落／商店／製作資料找到來源。' +
            '</div>'
        );
    }

    return out.join('');
}

function _itemCard(id, d, showSource){

    var skillInfo =
        _skillBookInfo(d);

    var desc =
        d.msg ||
        d.desc ||
        d.note ||
        '';

    return (
        '<div class="pd-card pd-extra-card">' +

            '<div class="pd-name">' +
                _pe(d.n || id) +
            '</div>' +

            '<div class="pd-sub">' +
                _pe(_typeName(d)) +
                (d.p != null
                    ? '　價格 ' +
                      Number(d.p || 0).toLocaleString()
                    : '') +
            '</div>' +

            (
                skillInfo
                    ? '<div class="pd-sub">' +
                      skillInfo +
                      '</div>'
                    : ''
            ) +

            (
                desc
                    ? '<div class="pd-extra-desc">' +
                      _pe(desc) +
                      '</div>'
                    : ''
            ) +

            (
                showSource
                    ? '<div class="pd-source-box">' +
                      _sourceHtml(id) +
                      '</div>'
                    : ''
            ) +

        '</div>'
    );
}

function _allItems(){

    var arr = [];

    try{
        Object.keys(DB.items || {}).forEach(function(id){

            var d = DB.items[id];

            if(!d || !d.n)
                return;

            arr.push({
                id:id,
                d:d,
                n:d.n
            });
        });
    }catch(e){}

    return arr;
}

function _renderMisc(){

    var body =
        document.getElementById('pd-body');

    if(!body) return;

    var input =
        document.getElementById('pd-search');

    var q =
        _pn(input ? input.value : '');

    var rows =
        _allItems()
        .filter(function(x){

            var t =
                x.d.type || '';

            if(
                t === 'wpn' ||
                t === 'arm' ||
                t === 'acc'
            ) return false;

            if(
                x.d.eff === 'card' ||
                x.id.indexOf('card_') === 0
            ) return false;

            if(!q) return true;

            return (
                _pn(x.n).indexOf(q) >= 0 ||
                _pn(x.id).indexOf(q) >= 0
            );
        })
        .sort(function(a,b){
            return a.n.localeCompare(
                b.n,
                'zh-Hant'
            );
        })
        .slice(0,500);

    body.innerHTML =
        rows.map(function(x){
            return _itemCard(
                x.id,
                x.d,
                false
            );
        }).join('') ||
        '<div class="pd-empty">找不到符合的道具</div>';
}

function _renderSource(){

    var body =
        document.getElementById('pd-body');

    if(!body) return;

    var input =
        document.getElementById('pd-search');

    var raw =
        input ? input.value : '';

    var q = _pn(raw);

    if(!q){
        body.innerHTML =
            '<div class="pd-extra-help">' +
            '<b>📍 取得來源查詢</b><br>' +
            '在上方輸入物品、裝備、魔法書名稱，' +
            '即可查詢怪物、地圖、掉落率、商店與製作來源。' +
            '</div>';
        return;
    }

    var rows =
        _allItems()
        .filter(function(x){
            return (
                _pn(x.n).indexOf(q) >= 0 ||
                _pn(x.id).indexOf(q) >= 0
            );
        })
        .sort(function(a,b){

            var ae =
                _pn(a.n) === q
                    ? 0 : 1;

            var be =
                _pn(b.n) === q
                    ? 0 : 1;

            return ae - be ||
                a.n.localeCompare(
                    b.n,
                    'zh-Hant'
                );
        })
        .slice(0,80);

    body.innerHTML =
        rows.map(function(x){
            return _itemCard(
                x.id,
                x.d,
                true
            );
        }).join('') ||
        '<div class="pd-empty">找不到這個物品的資料</div>';
}

function _renderGuide(){

    var body =
        document.getElementById('pd-body');

    if(!body) return;

    var input =
        document.getElementById('pd-search');

    var q =
        _pn(input ? input.value : '');

    var guides = [

        {
            t:'🎒 背包與裝備',
            b:'點擊物品可查看詳細資料；裝備頁可查看目前穿戴中的裝備。裝備與背包都有獨立捲動區。'
        },

        {
            t:'📖 魔法書',
            b:'魔法書必須符合職業、學習等級與屬性需求。已學習的技能不需要再次使用同一本魔法書。'
        },

        {
            t:'✨ 裝備強化',
            b:'武器、防具與部分飾品可使用對應強化卷軸。強化前可先從物品詳細資料確認裝備。'
        },

        {
            t:'🏷️ 裝備詞綴',
            b:'掉落裝備可能帶有隨機詞綴。詞綴越多越稀有，可利用背包搜尋名稱或詞綴。'
        },

        {
            t:'💰 自動販賣',
            b:'可依條件自動處理不需要的裝備。高價值或想保留的裝備建議先鎖定。'
        },

        {
            t:'⏩ 掛機補跑',
            b:'離線回來後會快速結算尚未完成的戰鬥時間，最後一次更新經驗、金幣、掉落與背包。'
        },

        {
            t:'📦 倉庫',
            b:'倉庫可保存暫時不用的物品與裝備。手機與電腦版都可以在倉庫內容區上下捲動。'
        },

        {
            t:'🏆 收藏',
            b:'裝備、道具與怪物收藏各自記錄取得進度。部分收藏完成後會提供額外加成。'
        },

        {
            t:'📍 查掉落來源',
            b:'切換到「來源」，輸入物品名稱，可以直接看到哪隻怪掉落、所在位置、掉落率，以及商店或製作來源。'
        },

        {
            t:'👑 Boss',
            b:'Boss 可直接在原百科的 Boss 分頁查詢；怪物頁則可以查看一般怪物資料。'
        },

        {
            t:'🗺️ 地圖',
            b:'地圖頁會列出該地區出現的怪物與大致等級範圍，也可以點怪物名稱繼續查詢。'
        }
    ];

    if(q){
        guides = guides.filter(function(g){
            return (
                _pn(g.t).indexOf(q) >= 0 ||
                _pn(g.b).indexOf(q) >= 0
            );
        });
    }

    body.innerHTML =
        guides.map(function(g){

            return (
                '<div class="pd-card pd-guide-card">' +
                    '<div class="pd-name">' +
                        _pe(g.t) +
                    '</div>' +
                    '<div class="pd-extra-desc">' +
                        _pe(g.b) +
                    '</div>' +
                '</div>'
            );

        }).join('') ||
        '<div class="pd-empty">找不到符合的攻略</div>';
}

function _setExtraActive(mode){

    var box =
        document.querySelector(
            '#game-pedia .pd-tabs'
        );

    if(!box) return;

    Array.from(
        box.querySelectorAll('button')
    ).forEach(function(btn){

        btn.classList.toggle(
            'on',
            btn.getAttribute('data-pd-extra') === mode
        );
    });
}

function _renderExtra(){

    if(_extraMode === 'misc2')
        _renderMisc();

    else if(_extraMode === 'source')
        _renderSource();

    else if(_extraMode === 'guide')
        _renderGuide();

    _setExtraActive(_extraMode);
}

function _addExtraButton(box, mode, label){

    if(
        box.querySelector(
            '[data-pd-extra="' + mode + '"]'
        )
    ) return;

    var b =
        document.createElement('button');

    b.type = 'button';

    b.setAttribute(
        'data-pd-extra',
        mode
    );

    b.textContent = label;

    b.onclick = function(){

        _extraMode = mode;

        _renderExtra();
    };

    box.appendChild(b);
}

function _enhancePedia(){

    var p =
        document.getElementById('game-pedia');

    if(!p) return;

    var tabs =
        p.querySelector('.pd-tabs');

    if(!tabs) return;

    _addExtraButton(
        tabs,
        'misc2',
        '🎒 道具'
    );

    _addExtraButton(
        tabs,
        'source',
        '📍 來源'
    );

    _addExtraButton(
        tabs,
        'guide',
        '📘 攻略'
    );
}

window.openGamePedia = function(){

    _extraMode = null;

    if(typeof _oldPediaOpen === 'function')
        _oldPediaOpen.apply(
            this,
            arguments
        );

    setTimeout(
        _enhancePedia,
        0
    );
};

window.pediaTab = function(mode){

    if(
        mode === 'misc2' ||
        mode === 'source' ||
        mode === 'guide'
    ){
        _extraMode = mode;
        _enhancePedia();
        _renderExtra();
        return;
    }

    _extraMode = null;

    if(typeof _oldPediaTab === 'function'){
        _oldPediaTab.apply(
            this,
            arguments
        );
    }

    var input =
        document.getElementById('pd-search');

    if(
        input &&
        typeof _oldPediaSearch === 'function'
    ){
        _oldPediaSearch(
            input.value || ''
        );
    }

    setTimeout(
        _enhancePedia,
        0
    );
};

window.pediaSearch = function(v){

    if(_extraMode){
        _renderExtra();
        return;
    }

    if(typeof _oldPediaSearch === 'function'){
        _oldPediaSearch.apply(
            this,
            arguments
        );
    }

    setTimeout(
        _enhancePedia,
        0
    );
};

var st =
    document.createElement('style');

st.id =
    'complete-game-pedia-v1-style';

st.textContent = `

#game-pedia .pd-tabs{
    display:flex !important;
    flex-wrap:nowrap !important;
    overflow-x:auto !important;
    overflow-y:hidden !important;
    gap:4px !important;
    -webkit-overflow-scrolling:touch;
}

#game-pedia .pd-tabs > button{
    flex:0 0 auto !important;
    white-space:nowrap !important;
}

#game-pedia .pd-extra-card{
    padding:10px !important;
}

#game-pedia .pd-extra-desc{
    margin-top:6px;
    color:#cbd5e1;
    font-size:13px;
    line-height:1.45;
}

#game-pedia .pd-source-box{
    margin-top:8px;
    border-top:1px solid rgba(148,163,184,.25);
    padding-top:7px;
}

#game-pedia .pd-source-line{
    margin:4px 0;
    font-size:13px;
    line-height:1.4;
    color:#e2e8f0;
}

#game-pedia .pd-source-mats{
    margin:2px 0 6px 20px;
    color:#fbbf24;
    font-size:12px;
    line-height:1.4;
}

#game-pedia .pd-rate{
    color:#67e8f9;
    font-weight:700;
}

#game-pedia .pd-source-none{
    color:#94a3b8;
    font-size:12px;
}

#game-pedia .pd-extra-help{
    margin:12px;
    padding:14px;
    border:1px solid #475569;
    border-radius:8px;
    background:rgba(15,23,42,.75);
    color:#e2e8f0;
    line-height:1.7;
}

#game-pedia .pd-guide-card{
    padding:11px !important;
}

@media (max-width:768px){

    #game-pedia .pd-tabs{
        padding-bottom:3px !important;
    }

    #game-pedia .pd-tabs > button{
        min-height:34px !important;
        padding:5px 9px !important;
        font-size:12px !important;
    }

    #game-pedia .pd-extra-desc,
    #game-pedia .pd-source-line{
        font-size:12px;
    }
}

`;

document.head.appendChild(st);

function _bootExtraPedia(){

    _enhancePedia();

    setTimeout(
        _enhancePedia,
        300
    );

    setTimeout(
        _enhancePedia,
        1000
    );
}

if(document.readyState === 'loading'){
    document.addEventListener(
        'DOMContentLoaded',
        _bootExtraPedia
    );
}else{
    _bootExtraPedia();
}

var ob =
    new MutationObserver(function(){
        _enhancePedia();
    });

ob.observe(
    document.documentElement,
    {
        childList:true,
        subtree:true
    }
);

})();


/* === detailed quest pedia v1 === */
(function(){

if(window.__detailedQuestPediaV1) return;
window.__detailedQuestPediaV1 = true;

var questPediaMode = false;
var questSourceIndex = null;

var oldQuestPediaSearch = window.pediaSearch;
var oldQuestPediaTab = window.pediaTab;
var oldQuestPediaOpen = window.openGamePedia;

function qEsc(v){
    return String(v == null ? '' : v)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
}

function qAttr(v){
    return qEsc(v);
}

function qNorm(v){
    return String(v == null ? '' : v)
        .toLowerCase()
        .replace(/\s+/g,'')
        .replace(/[()（）【】「」『』·．。！？!?、，,：:；;／\/\\_\-+]/g,'');
}

function qClassName(cls){
    return ({
        royal:'王族',
        knight:'騎士',
        elf:'妖精',
        mage:'法師',
        dark:'黑暗妖精',
        illusion:'幻術士',
        dragon:'龍騎士',
        warrior:'戰士'
    })[cls] || cls || '未知';
}

function buildQuestSourceIndex(){

    if(questSourceIndex)
        return questSourceIndex;

    var mapNames = {};
    var mobMaps = {};
    var itemDrops = {};

    try{
        if(typeof MAP_REGIONS !== 'undefined'){
            MAP_REGIONS.forEach(function(region){
                (region.maps || []).forEach(function(m){
                    mapNames[m.v] = m.t;
                });
            });
        }
    }catch(e){}

    try{
        Object.keys((DB && DB.maps) || {}).forEach(function(mapKey){

            var mapName = mapNames[mapKey] || mapKey;
            var rows = DB.maps[mapKey];

            if(!Array.isArray(rows)) return;

            rows.forEach(function(mobId){

                var now = mobId;
                var seen = {};

                while(now && !seen[now]){

                    seen[now] = true;

                    var mob =
                        DB.mobs &&
                        DB.mobs[now];

                    if(!mob) break;

                    var nm =
                        mob.n || now;

                    if(!mobMaps[nm])
                        mobMaps[nm] = [];

                    if(
                        mobMaps[nm].indexOf(mapName) < 0
                    ){
                        mobMaps[nm].push(mapName);
                    }

                    now = mob.transformTo;
                }
            });
        });
    }catch(e){}

    function addTable(tbl){

        if(!tbl || typeof tbl !== 'object')
            return;

        Object.keys(tbl).forEach(function(mobName){

            var arr = tbl[mobName];

            if(!Array.isArray(arr))
                return;

            arr.forEach(function(entry){

                var itemId =
                    Array.isArray(entry)
                        ? entry[0]
                        : entry;

                if(
                    !itemId ||
                    !DB.items ||
                    !DB.items[itemId]
                ) return;

                if(!itemDrops[itemId])
                    itemDrops[itemId] = [];

                itemDrops[itemId].push({
                    mob:mobName,
                    maps:mobMaps[mobName] || []
                });
            });
        });
    }

    try{
        if(typeof MOB_DROPS !== 'undefined')
            addTable(MOB_DROPS);
    }catch(e){}

    try{
        if(typeof DARK_WEAPON_DROPS !== 'undefined')
            addTable(DARK_WEAPON_DROPS);
    }catch(e){}

    try{
        if(typeof DARK_CRYSTAL_DROPS !== 'undefined')
            addTable(DARK_CRYSTAL_DROPS);
    }catch(e){}

    try{
        if(typeof DRAGON_DROPS !== 'undefined')
            addTable(DRAGON_DROPS);
    }catch(e){}

    try{
        if(typeof WARRIOR_DROPS !== 'undefined')
            addTable(WARRIOR_DROPS);
    }catch(e){}

    try{
        if(typeof MEM_DROPS !== 'undefined')
            addTable(MEM_DROPS);
    }catch(e){}

    questSourceIndex = {
        itemDrops:itemDrops
    };

    return questSourceIndex;
}

function questItemName(id){

    var d =
        DB.items &&
        DB.items[id];

    return d
        ? d.n || id
        : id;
}

function questRewardNames(arr){

    return (arr || [])
        .map(function(id){

            var d =
                DB.items &&
                DB.items[id];

            return d
                ? d.n || id
                : id;

        })
        .join('＋');
}

function questItemSource(id){

    var idx =
        buildQuestSourceIndex();

    var rows =
        idx.itemDrops[id] || [];

    if(!rows.length){

        var d =
            DB.items &&
            DB.items[id];

        if(d && d.d)
            return d.d;

        return '請依任務說明取得';
    }

    var out = [];

    rows.forEach(function(r){

        var txt = r.mob;

        if(r.maps && r.maps.length){
            txt +=
                '（' +
                r.maps.slice(0,2).join('／') +
                '）';
        }

        if(out.indexOf(txt) < 0)
            out.push(txt);
    });

    return out.slice(0,4).join('、');
}

function questSourceButton(id, count){

    var name =
        questItemName(id);

    var jsName =
        String(name)
        .replace(/\\/g,'\\\\')
        .replace(/'/g,"\\'");

    return (
        '<button class="pd-q-item" ' +
        'onclick="' +
        "var i=document.getElementById('pd-search');" +
        "if(i)i.value='" + jsName + "';" +
        "var b=document.querySelector('[data-pd-extra=source]');" +
        "if(b)b.click();" +
        '">' +
        qEsc(name) +
        ' × ' + Number(count || 1) +
        '</button>'
    );
}

function currentQuestState(key, cfg){

    if(
        !player ||
        player.cls !== cfg.cls
    ){
        return {
            cls:'pd-q-other',
            text:'其他職業'
        };
    }

    var st =
        player.trialQ &&
        player.trialQ[key];

    if(st === 2){
        return {
            cls:'pd-q-done',
            text:'✅ 已完成'
        };
    }

    if(st === 1){
        return {
            cls:'pd-q-running',
            text:'▶ 進行中'
        };
    }

    if(
        Number(player.lv || 1) <
        Number(cfg.lv || 1)
    ){
        return {
            cls:'pd-q-lock',
            text:'🔒 需要 Lv.' + cfg.lv
        };
    }

    return {
        cls:'pd-q-ready',
        text:'📜 可接取'
    };
}

function regularQuestCard(key, cfg){

    var state =
        currentQuestState(
            key,
            cfg
        );

    var reqRows =
        (cfg.reqs || [])
        .map(function(r){

            var id = r[0];
            var cnt = r[1] || 1;

            return (
                '<div class="pd-q-row">' +
                    '<div>' +
                        questSourceButton(id,cnt) +
                    '</div>' +

                    '<div class="pd-q-source">' +
                        '📍 ' +
                        qEsc(
                            questItemSource(id)
                        ) +
                    '</div>' +
                '</div>'
            );

        }).join('');

    var reward =
        questRewardNames(
            cfg.rewards
        );

    var searchText = [
        qClassName(cfg.cls),
        cfg.lv,
        cfg.npc,
        (cfg.reqs || []).map(function(x){
            return questItemName(x[0]);
        }).join(' '),
        reward
    ].join(' ');

    return (
        '<div class="pd-card pd-q-card" ' +
        'data-q-search="' +
        qAttr(qNorm(searchText)) +
        '">' +

            '<div class="pd-q-title-row">' +

                '<div class="pd-name">' +
                    '⚔️ ' +
                    qEsc(qClassName(cfg.cls)) +
                    ' ' +
                    qEsc(cfg.lv) +
                    '級試煉' +
                '</div>' +

                '<span class="pd-q-state ' +
                    state.cls +
                    '">' +
                    state.text +
                '</span>' +

            '</div>' +

            '<div class="pd-q-npc">' +
                '👤 接取 NPC：' +
                '<b>' +
                qEsc(cfg.npc) +
                '</b>' +
            '</div>' +

            '<div class="pd-q-label">' +
                '📦 任務需求' +
            '</div>' +

            reqRows +

            '<div class="pd-q-label">' +
                '🎁 完成獎勵' +
            '</div>' +

            '<div class="pd-q-reward">' +
                qEsc(reward || '無資料') +
            '</div>' +

            '<div class="pd-q-note">' +
                '※ 必須先向 NPC 接取試煉；' +
                '接取後指定試煉品才會開始掉落，' +
                '備齊後回 NPC 一次領取全部獎勵。' +
            '</div>' +

        '</div>'
    );
}

function fiftyQuestState(cls,cfg){

    if(
        !player ||
        player.cls !== cls
    ){
        return {
            cls:'pd-q-other',
            text:'其他職業'
        };
    }

    if(
        Number(player.lv || 1) < 50
    ){
        return {
            cls:'pd-q-lock',
            text:'🔒 需要 Lv.50'
        };
    }

    var st =
        Number(player.trialStage || 0);

    var doneAt =
        (cfg.stages || []).length + 2;

    if(st >= doneAt){
        return {
            cls:'pd-q-done',
            text:'✅ 已完成'
        };
    }

    if(st > 0){
        return {
            cls:'pd-q-running',
            text:'▶ 進行中'
        };
    }

    return {
        cls:'pd-q-ready',
        text:'📜 可接取'
    };
}

function fiftyQuestCard(cls,cfg){

    var state =
        fiftyQuestState(
            cls,
            cfg
        );

    var stages =
        (cfg.stages || [])
        .map(function(stage,index){

            return (
                '<div class="pd-q-stage">' +

                    '<div class="pd-q-stage-title">' +
                        '第 ' +
                        (index + 1) +
                        ' 階段' +
                    '</div>' +

                    '<div>' +
                        questSourceButton(
                            stage.id,
                            stage.cnt || 1
                        ) +
                    '</div>' +

                    '<div class="pd-q-source">' +
                        '📍 ' +
                        qEsc(
                            stage.hint ||
                            questItemSource(stage.id)
                        ) +
                    '</div>' +

                '</div>'
            );

        }).join('');

    var finalCnt =
        cfg.exMatCnt || 1;

    var finalStage =
        '<div class="pd-q-stage pd-q-final">' +

            '<div class="pd-q-stage-title">' +
                '🔥 最終階段' +
            '</div>' +

            '<div>' +
                questSourceButton(
                    cfg.exMat,
                    finalCnt
                ) +
            '</div>' +

            '<div class="pd-q-source">' +
                '進入最終試煉區域後完成指定戰鬥取得。' +
            '</div>' +

        '</div>';

    var rewards =
        (cfg.rewards || [])
        .map(function(r){
            return r.nm ||
                questItemName(r.id);
        })
        .join('＋');

    var searchText = [
        qClassName(cls),
        50,
        cfg.npc,
        (cfg.stages || []).map(function(x){
            return x.nm;
        }).join(' '),
        cfg.exMatNm,
        rewards
    ].join(' ');

    return (
        '<div class="pd-card pd-q-card pd-q-50" ' +
        'data-q-search="' +
        qAttr(qNorm(searchText)) +
        '">' +

            '<div class="pd-q-title-row">' +

                '<div class="pd-name">' +
                    '🔥 ' +
                    qEsc(qClassName(cls)) +
                    ' 50級試煉' +
                '</div>' +

                '<span class="pd-q-state ' +
                    state.cls +
                    '">' +
                    state.text +
                '</span>' +

            '</div>' +

            '<div class="pd-q-npc">' +
                '👤 接取 NPC：' +
                '<b>' +
                qEsc(cfg.npc) +
                '</b>' +
            '</div>' +

            '<div class="pd-q-label">' +
                '🧭 任務流程' +
            '</div>' +

            stages +

            finalStage +

            '<div class="pd-q-label">' +
                '🎁 最終獎勵' +
            '</div>' +

            '<div class="pd-q-reward">' +
                qEsc(rewards || '無資料') +
            '</div>' +

            '<div class="pd-q-note">' +
                '※ 50級試煉採多階段進行。' +
                '每一階段交付完成後才會開啟下一階段；' +
                '完成前段後進入最終試煉，' +
                '最後一次領取全部獎勵。' +
            '</div>' +

        '</div>'
    );
}

function renderQuestPedia(){

    var body =
        document.getElementById(
            'pd-body'
        );

    if(!body) return;

    var input =
        document.getElementById(
            'pd-search'
        );

    var query =
        qNorm(
            input ? input.value : ''
        );

    var html = '';

    html +=
        '<div class="pd-q-help">' +

            '<b>📜 任務百科</b><br>' +

            '完整列出職業試煉的接取等級、NPC、' +
            '任務道具、取得位置、任務流程與獎勵。<br>' +

            '<span>💡 點任務道具名稱可直接跳到「📍來源」查詢。</span>' +

        '</div>';

    var cards = [];

    try{
        if(typeof TRIAL_Q !== 'undefined'){

            Object.keys(TRIAL_Q)
                .sort(function(a,b){

                    var A = TRIAL_Q[a];
                    var B = TRIAL_Q[b];

                    var ac =
                        A.cls === player.cls
                            ? 0 : 1;

                    var bc =
                        B.cls === player.cls
                            ? 0 : 1;

                    return (
                        ac - bc ||
                        A.cls.localeCompare(B.cls) ||
                        A.lv - B.lv
                    );
                })
                .forEach(function(key){

                    cards.push(
                        regularQuestCard(
                            key,
                            TRIAL_Q[key]
                        )
                    );

                });
        }
    }catch(e){}

    try{
        if(typeof TRIAL_50_CFG !== 'undefined'){

            Object.keys(TRIAL_50_CFG)
                .sort(function(a,b){

                    if(a === player.cls)
                        return -1;

                    if(b === player.cls)
                        return 1;

                    return (
                        qClassName(a)
                        .localeCompare(
                            qClassName(b),
                            'zh-Hant'
                        )
                    );
                })
                .forEach(function(cls){

                    cards.push(
                        fiftyQuestCard(
                            cls,
                            TRIAL_50_CFG[cls]
                        )
                    );

                });
        }
    }catch(e){}

    if(query){

        cards = cards.filter(function(card){

            var m =
                card.match(
                    /data-q-search="([^"]*)"/
                );

            return (
                m &&
                m[1].indexOf(query) >= 0
            );
        });
    }

    html +=
        cards.join('') ||
        '<div class="pd-empty">' +
        '找不到符合的任務資料' +
        '</div>';

    body.innerHTML = html;

    var tabs =
        document.querySelectorAll(
            '#game-pedia .pd-tabs button'
        );

    Array.from(tabs).forEach(function(b){

        b.classList.toggle(
            'on',
            b.getAttribute(
                'data-pd-quest'
            ) === '1'
        );
    });
}

function addQuestTab(){

    var p =
        document.getElementById(
            'game-pedia'
        );

    if(!p) return;

    var tabs =
        p.querySelector(
            '.pd-tabs'
        );

    if(!tabs) return;

    if(
        tabs.querySelector(
            '[data-pd-quest="1"]'
        )
    ) return;

    var b =
        document.createElement(
            'button'
        );

    b.type = 'button';

    b.setAttribute(
        'data-pd-quest',
        '1'
    );

    b.textContent =
        '📜 任務';

    b.onclick = function(){

        questPediaMode = true;

        renderQuestPedia();
    };

    tabs.appendChild(b);
}

window.pediaSearch = function(v){

    if(questPediaMode){

        renderQuestPedia();
        return;
    }

    if(
        typeof oldQuestPediaSearch ===
        'function'
    ){
        return oldQuestPediaSearch
            .apply(
                this,
                arguments
            );
    }
};

window.pediaTab = function(mode){

    questPediaMode = false;

    if(
        typeof oldQuestPediaTab ===
        'function'
    ){
        var r =
            oldQuestPediaTab
            .apply(
                this,
                arguments
            );

        setTimeout(
            addQuestTab,
            0
        );

        return r;
    }
};

window.openGamePedia = function(){

    questPediaMode = false;

    var r;

    if(
        typeof oldQuestPediaOpen ===
        'function'
    ){
        r =
            oldQuestPediaOpen
            .apply(
                this,
                arguments
            );
    }

    setTimeout(
        addQuestTab,
        0
    );

    setTimeout(
        addQuestTab,
        150
    );

    return r;
};

var style =
    document.createElement(
        'style'
    );

style.id =
    'detailed-quest-pedia-v1-style';

style.textContent = `

#game-pedia .pd-q-help{
    margin:0 0 10px;
    padding:10px 12px;
    border:1px solid #475569;
    border-radius:8px;
    background:rgba(15,23,42,.72);
    color:#cbd5e1;
    font-size:13px;
    line-height:1.6;
}

#game-pedia .pd-q-help b{
    color:#fcd34d;
    font-size:16px;
}

#game-pedia .pd-q-help span{
    color:#7dd3fc;
}

#game-pedia .pd-q-card{
    padding:11px !important;
}

#game-pedia .pd-q-title-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:8px;
}

#game-pedia .pd-q-state{
    flex:0 0 auto;
    border-radius:999px;
    padding:3px 7px;
    font-size:11px;
    font-weight:700;
}

#game-pedia .pd-q-done{
    color:#86efac;
    background:#14532d;
}

#game-pedia .pd-q-running{
    color:#7dd3fc;
    background:#164e63;
}

#game-pedia .pd-q-ready{
    color:#fde68a;
    background:#78350f;
}

#game-pedia .pd-q-lock,
#game-pedia .pd-q-other{
    color:#94a3b8;
    background:#1e293b;
}

#game-pedia .pd-q-npc{
    color:#e2e8f0;
    margin:7px 0;
    font-size:13px;
}

#game-pedia .pd-q-label{
    margin-top:8px;
    margin-bottom:4px;
    color:#fbbf24;
    font-size:12px;
    font-weight:700;
}

#game-pedia .pd-q-row,
#game-pedia .pd-q-stage{
    border-left:2px solid #475569;
    padding:5px 8px;
    margin:4px 0;
    background:rgba(15,23,42,.42);
}

#game-pedia .pd-q-stage-title{
    color:#cbd5e1;
    font-size:11px;
    font-weight:700;
    margin-bottom:3px;
}

#game-pedia .pd-q-final{
    border-left-color:#ef4444;
}

#game-pedia .pd-q-item{
    border:0;
    padding:0;
    background:none;
    color:#67e8f9;
    font-size:13px;
    font-weight:700;
    text-align:left;
    cursor:pointer;
}

#game-pedia .pd-q-item:hover{
    text-decoration:underline;
}

#game-pedia .pd-q-source{
    color:#94a3b8;
    font-size:11px;
    line-height:1.45;
    margin-top:2px;
}

#game-pedia .pd-q-reward{
    color:#86efac;
    font-size:13px;
    font-weight:700;
}

#game-pedia .pd-q-note{
    color:#64748b;
    font-size:11px;
    line-height:1.5;
    margin-top:8px;
}

#game-pedia .pd-q-50{
    border-color:#92400e !important;
}

@media(max-width:768px){

    #game-pedia .pd-q-card{
        padding:9px !important;
    }

    #game-pedia .pd-q-title-row{
        align-items:flex-start;
    }

    #game-pedia .pd-q-item,
    #game-pedia .pd-q-npc,
    #game-pedia .pd-q-reward{
        font-size:12px;
    }

}

`;

document.head.appendChild(style);

function questPediaBoot(){

    addQuestTab();

    setTimeout(
        addQuestTab,
        300
    );

    setTimeout(
        addQuestTab,
        900
    );
}

if(
    document.readyState ===
    'loading'
){
    document.addEventListener(
        'DOMContentLoaded',
        questPediaBoot
    );
}else{
    questPediaBoot();
}


/* === quest pedia observer performance fix v1 === */
/*
 * openGamePedia 已會補上「任務」分頁，
 * 不再監聽整個遊戲 DOM。
 */
var obs = null;


})();


/* === quest my class filter safe v1 === */
(function(){

if(window.__questMyClassFilterSafeV1) return;
window.__questMyClassFilterSafeV1 = true;

var onlyMine = false;

function clsName(){

    if(
        typeof player === 'undefined' ||
        !player
    ){
        return '';
    }

    var map = {
        royal:'王族',
        knight:'騎士',
        elf:'妖精',
        mage:'法師',
        dark:'黑暗妖精',
        illusion:'幻術士',
        dragon:'龍騎士',
        warrior:'戰士'
    };

    return map[player.cls] || '';
}

function questPageOpen(){

    var p =
        document.getElementById('game-pedia');

    if(!p || p.classList.contains('hidden'))
        return false;

    var q =
        p.querySelector(
            '[data-pd-quest="1"]'
        );

    return !!(
        q &&
        q.classList.contains('on')
    );
}

function applyMyClassFilter(){

    if(!questPageOpen())
        return;

    var help =
        document.querySelector(
            '#game-pedia .pd-q-help'
        );

    if(!help)
        return;

    var btn =
        document.getElementById(
            'pd-q-myclass-safe'
        );

    if(!btn){

        var bar =
            document.createElement('div');

        bar.className =
            'pd-q-myclass-safe-bar';

        btn =
            document.createElement('button');

        btn.id =
            'pd-q-myclass-safe';

        btn.type =
            'button';

        btn.onclick = function(){

            onlyMine = !onlyMine;

            applyMyClassFilter();
        };

        bar.appendChild(btn);
        help.appendChild(bar);
    }

    btn.textContent =
        onlyMine
            ? '✅ 只看我的職業'
            : '👤 只看我的職業';

    btn.classList.toggle(
        'on',
        onlyMine
    );

    var mine =
        clsName();

    var cards =
        document.querySelectorAll(
            '#game-pedia .pd-q-card'
        );

    Array.from(cards).forEach(function(card){

        if(!onlyMine || !mine){

            card.style.removeProperty(
                'display'
            );

            return;
        }

        var txt =
            String(
                card.textContent || ''
            );

        if(txt.indexOf(mine) >= 0){

            card.style.removeProperty(
                'display'
            );

        }else{

            card.style.setProperty(
                'display',
                'none',
                'important'
            );
        }
    });
}

/*
 * 點任務分頁後才執行，
 * 不監聽整個遊戲。
 */
document.addEventListener(
    'click',
    function(e){

        var el = e.target;

        if(
            el &&
            el.closest &&
            el.closest(
                '[data-pd-quest="1"]'
            )
        ){
            setTimeout(
                applyMyClassFilter,
                20
            );

            setTimeout(
                applyMyClassFilter,
                120
            );
        }
    },
    true
);

/*
 * 搜尋任務重新繪製後，
 * 再套一次職業篩選。
 */
document.addEventListener(
    'input',
    function(e){

        if(
            e.target &&
            e.target.id === 'pd-search'
        ){
            setTimeout(
                applyMyClassFilter,
                20
            );
        }
    },
    true
);

var st =
    document.createElement('style');

st.id =
    'quest-myclass-safe-v1-style';

st.textContent = `

#game-pedia .pd-q-myclass-safe-bar{
    margin-top:9px;
    padding-top:8px;
    border-top:1px solid rgba(148,163,184,.22);
}

#game-pedia #pd-q-myclass-safe{
    min-height:32px;
    padding:5px 10px;
    border:1px solid #475569;
    border-radius:7px;
    background:#172033;
    color:#cbd5e1;
    font-size:12px;
    font-weight:700;
}

#game-pedia #pd-q-myclass-safe.on{
    border-color:#d97706;
    background:#78350f;
    color:#fde68a;
}

`;

document.head.appendChild(st);

})();


/* === quest held count safe v1 === */
(function(){

if(window.__questHeldCountSafeV1) return;
window.__questHeldCountSafeV1 = true;

function cleanQuestItemName(txt){

    return String(txt || '')
        .replace(/持有\s*\d+\s*\/\s*\d+/g,'')
        .replace(/×\s*\d+/g,'')
        .replace(/\s+/g,' ')
        .trim();
}

function findQuestItemId(name){

    if(
        typeof DB === 'undefined' ||
        !DB ||
        !DB.items
    ){
        return null;
    }

    var ids = Object.keys(DB.items);

    for(var i=0;i<ids.length;i++){

        var id = ids[i];
        var d = DB.items[id];

        if(!d) continue;

        var n = String(
            d.n ||
            d.name ||
            ''
        ).trim();

        if(n === name)
            return id;
    }

    return null;
}

function heldCountById(id){

    if(
        typeof player === 'undefined' ||
        !player ||
        !Array.isArray(player.inv)
    ){
        return 0;
    }

    var total = 0;

    player.inv.forEach(function(item){

        if(!item || item.id !== id)
            return;

        var cnt = Number(item.cnt);

        if(!isFinite(cnt) || cnt <= 0)
            cnt = 1;

        total += cnt;
    });

    return total;
}

function decorateQuestHeldCounts(){

    var pedia =
        document.getElementById(
            'game-pedia'
        );

    if(
        !pedia ||
        pedia.classList.contains('hidden')
    ){
        return;
    }

    var buttons =
        pedia.querySelectorAll(
            '.pd-q-item'
        );

    Array.from(buttons).forEach(function(btn){

        var raw =
            String(btn.textContent || '');

        var m =
            raw.match(/×\s*(\d+)/);

        var need =
            m
                ? Math.max(1, Number(m[1]) || 1)
                : 1;

        var name =
            cleanQuestItemName(raw);

        if(!name)
            return;

        var id =
            findQuestItemId(name);

        if(!id)
            return;

        var held =
            heldCountById(id);

        var badge =
            btn.parentElement
                ? btn.parentElement.querySelector(
                    '.pd-q-held-safe'
                )
                : null;

        if(!badge){

            badge =
                document.createElement('span');

            badge.className =
                'pd-q-held-safe';

            btn.insertAdjacentElement(
                'afterend',
                badge
            );
        }

        badge.textContent =
            '持有 ' +
            held +
            '/' +
            need;

        badge.classList.toggle(
            'ok',
            held >= need
        );
    });
}

function scheduleHeldCount(){

    setTimeout(
        decorateQuestHeldCounts,
        20
    );

    setTimeout(
        decorateQuestHeldCounts,
        120
    );
}

/* 打開百科 / 切任務時更新 */
document.addEventListener(
    'click',
    function(e){

        var t = e.target;

        if(!t)
            return;

        if(
            t.closest &&
            (
                t.closest('[data-pd-quest="1"]') ||
                t.closest('#pedia-fab') ||
                t.closest('.pd-q-item') ||
                t.closest('#pd-q-myclass-safe')
            )
        ){
            scheduleHeldCount();
        }
    },
    true
);

/* 搜尋重新繪製後更新 */
document.addEventListener(
    'input',
    function(e){

        if(
            e.target &&
            e.target.id === 'pd-search'
        ){
            scheduleHeldCount();
        }
    },
    true
);

var st =
    document.createElement('style');

st.id =
    'quest-held-count-safe-v1-style';

st.textContent = `

#game-pedia .pd-q-held-safe{
    display:inline-block;
    margin-left:7px;
    padding:2px 7px;
    border-radius:999px;

    background:#3f1d23;
    border:1px solid #7f1d1d;

    color:#fca5a5;
    font-size:10px;
    font-weight:800;

    white-space:nowrap;
    vertical-align:middle;
}

#game-pedia .pd-q-held-safe.ok{
    background:#14532d;
    border-color:#16a34a;
    color:#86efac;
}

`;

document.head.appendChild(st);

})();


/* === quest npc town safe v1 === */
(function(){

if(window.__questNpcTownSafeV1) return;
window.__questNpcTownSafeV1 = true;


/* 找 NPC 所在村莊 */
function questNpcTownSafe(name){

    name = String(name || '').trim();

    if(
        !name ||
        typeof DB === 'undefined' ||
        !DB ||
        !DB.towns
    ){
        return '';
    }

    var found = [];

    try{

        Object.keys(DB.towns).forEach(function(townId){

            var town = DB.towns[townId];

            if(
                !town ||
                !Array.isArray(town.npcs)
            ){
                return;
            }

            town.npcs.forEach(function(npc){

                if(!npc) return;

                var npcName =
                    String(
                        npc.n ||
                        npc.name ||
                        ''
                    ).trim();

                if(npcName !== name)
                    return;

                var townName =
                    String(
                        town.n ||
                        town.name ||
                        townId
                    ).trim();

                if(
                    townName &&
                    found.indexOf(townName) < 0
                ){
                    found.push(townName);
                }

            });

        });

    }catch(e){}

    return found.join('／');
}


/* 從任務卡抓 NPC 名稱 */
function questNpcNameFromRow(row){

    if(!row) return '';

    /* 原本任務百科 NPC 名稱有包 b 的話優先用 */
    var b = row.querySelector('b');

    if(b){
        var bn =
            String(b.textContent || '').trim();

        if(bn)
            return bn;
    }

    var txt =
        String(row.textContent || '');

    txt = txt
        .replace(/📍.*$/,'')
        .replace(/所在村莊.*$/,'')
        .replace(/👤/g,'')
        .replace(/接取\s*NPC\s*[：:]/g,'')
        .trim();

    return txt;
}


/* 在任務卡補村莊 */
function decorateQuestNpcTownSafe(){

    var pedia =
        document.getElementById('game-pedia');

    if(
        !pedia ||
        pedia.classList.contains('hidden')
    ){
        return;
    }

    var rows =
        pedia.querySelectorAll('.pd-q-npc');

    Array.from(rows).forEach(function(row){

        /* 避免重複產生 */
        var old =
            row.querySelector('.pd-q-town-safe');

        if(old)
            old.remove();

        var npcName =
            questNpcNameFromRow(row);

        if(!npcName)
            return;

        var town =
            questNpcTownSafe(npcName);

        if(!town)
            return;

        var tag =
            document.createElement('span');

        tag.className =
            'pd-q-town-safe';

        tag.textContent =
            '📍 ' + town;

        row.appendChild(tag);
    });
}


function scheduleQuestNpcTownSafe(){

    setTimeout(
        decorateQuestNpcTownSafe,
        20
    );

    setTimeout(
        decorateQuestNpcTownSafe,
        120
    );
}


/*
 * 只有操作百科時才更新
 * 不監聽整個遊戲畫面
 */
document.addEventListener(
    'click',
    function(e){

        var t = e.target;

        if(!t) return;

        if(
            t.closest &&
            (
                t.closest('[data-pd-quest="1"]') ||
                t.closest('#pedia-fab') ||
                t.closest('#pd-q-myclass-safe')
            )
        ){
            scheduleQuestNpcTownSafe();
        }

    },
    true
);


/* 搜尋導致百科重新繪製時補一次 */
document.addEventListener(
    'input',
    function(e){

        if(
            e.target &&
            e.target.id === 'pd-search'
        ){
            scheduleQuestNpcTownSafe();
        }

    },
    true
);


/* 樣式 */
var st =
    document.createElement('style');

st.id =
    'quest-npc-town-safe-v1-style';

st.textContent = `

#game-pedia .pd-q-town-safe{
    display:inline-block;

    margin-left:10px;
    padding:2px 7px;

    border-radius:999px;

    background:#172033;
    border:1px solid #475569;

    color:#93c5fd;

    font-size:10px;
    font-weight:700;

    white-space:nowrap;
}

@media(max-width:768px){

    #game-pedia .pd-q-town-safe{
        display:block;

        width:max-content;

        margin-left:25px;
        margin-top:5px;

        font-size:10px;
    }

}

`;

document.head.appendChild(st);

})();


/* === quest town jump safe v1 === */
(function(){

if(window.__questTownJumpSafeV1) return;
window.__questTownJumpSafeV1 = true;


/* 點任務 NPC 的村莊 → 直接跳百科地圖搜尋 */
document.addEventListener(
    'click',
    function(e){

        var tag =
            e.target &&
            e.target.closest
                ? e.target.closest('.pd-q-town-safe')
                : null;

        if(!tag)
            return;

        e.preventDefault();
        e.stopPropagation();

        var town =
            String(
                tag.dataset.town ||
                tag.textContent ||
                ''
            )
            .replace(/📍/g,'')
            .trim();

        if(!town)
            return;


        /* 先切到地圖頁 */
        try{

            if(typeof window.pediaTab === 'function')
                window.pediaTab('map');

        }catch(err){}


        /* 再把村莊名稱送進百科搜尋 */
        setTimeout(function(){

            var input =
                document.getElementById('pd-search');

            if(input)
                input.value = town;

            try{

                if(typeof window.pediaSearch === 'function')
                    window.pediaSearch(town);

            }catch(err){}

        }, 20);

    },
    true
);


/* 把村莊標籤做成明顯可點 */
var st =
    document.createElement('style');

st.id =
    'quest-town-jump-safe-v1-style';

st.textContent = `

#game-pedia .pd-q-town-safe{
    cursor:pointer !important;

    background:#172554 !important;
    border-color:#3b82f6 !important;

    color:#93c5fd !important;

    transition:
        filter .12s ease,
        transform .12s ease;
}

#game-pedia .pd-q-town-safe:active{
    transform:scale(.96);
    filter:brightness(1.25);
}

#game-pedia .pd-q-town-safe::after{
    content:' ›';
    color:#60a5fa;
    font-weight:900;
}

`;

document.head.appendChild(st);

})();


/* === quest source jump safe v1 === */
(function(){

if(window.__questSourceJumpSafeV1) return;
window.__questSourceJumpSafeV1 = true;


/* 取得任務需求道具名稱 */
function questSourceItemName(card){

    if(!card) return '';

    var item =
        card.querySelector('.pd-q-item');

    if(!item) return '';

    var clone =
        item.cloneNode(true);

    Array.from(
        clone.querySelectorAll('.pd-q-held-safe')
    ).forEach(function(x){
        x.remove();
    });

    return String(
        clone.textContent || ''
    )
    .replace(/持有\s*\d+\s*\/\s*\d+/g,'')
    .replace(/×\s*\d+/g,'')
    .replace(/\s+/g,' ')
    .trim();
}


/* 找出任務卡裡的 📍 掉落來源 */
function decorateQuestSourceJump(){

    var pedia =
        document.getElementById('game-pedia');

    if(
        !pedia ||
        pedia.classList.contains('hidden')
    ){
        return;
    }

    var cards =
        pedia.querySelectorAll('.pd-q-card');

    Array.from(cards).forEach(function(card){

        var itemName =
            questSourceItemName(card);

        if(!itemName)
            return;

        var nodes =
            card.querySelectorAll(
                'div,span,p'
            );

        Array.from(nodes).forEach(function(el){

            /* NPC 村莊按鈕另外處理，不碰 */
            if(
                el.classList.contains(
                    'pd-q-town-safe'
                ) ||
                el.closest('.pd-q-town-safe')
            ){
                return;
            }

            var txt =
                String(el.textContent || '')
                .replace(/\s+/g,' ')
                .trim();

            if(!/^📍/.test(txt))
                return;

            /*
             * 避免抓到包含來源文字的外層容器，
             * 只抓真正最裡面的那一行。
             */
            var childHasPin =
                Array.from(el.children || [])
                .some(function(ch){

                    return /^📍/.test(
                        String(
                            ch.textContent || ''
                        )
                        .replace(/\s+/g,' ')
                        .trim()
                    );

                });

            if(childHasPin)
                return;

            el.classList.add(
                'pd-q-source-jump-safe'
            );

            el.dataset.questItem =
                itemName;

            el.title =
                '點擊查詢「' +
                itemName +
                '」來源';
        });
    });
}


function scheduleQuestSourceJump(){

    setTimeout(
        decorateQuestSourceJump,
        20
    );

    setTimeout(
        decorateQuestSourceJump,
        120
    );
}


/* 點來源 → 跳「來源」百科並搜尋任務道具 */
document.addEventListener(
    'click',
    function(e){

        var source =
            e.target &&
            e.target.closest
                ? e.target.closest(
                    '.pd-q-source-jump-safe'
                )
                : null;

        if(source){

            e.preventDefault();
            e.stopPropagation();

            var itemName =
                String(
                    source.dataset.questItem || ''
                ).trim();

            if(!itemName)
                return;


            /* 切換到來源頁 */
            try{

                if(
                    typeof window.pediaTab ===
                    'function'
                ){
                    window.pediaTab('source');
                }

            }catch(err){}


            /* 自動搜尋任務道具 */
            setTimeout(function(){

                var input =
                    document.getElementById(
                        'pd-search'
                    );

                if(input)
                    input.value = itemName;

                try{

                    if(
                        typeof window.pediaSearch ===
                        'function'
                    ){
                        window.pediaSearch(
                            itemName
                        );
                    }

                }catch(err){}

            },30);

            return;
        }


        /*
         * 百科內重新切頁後補可點來源。
         * 不使用 MutationObserver。
         */
        var t = e.target;

        if(
            t &&
            t.closest &&
            (
                t.closest('#game-pedia') ||
                t.closest('#pedia-fab')
            )
        ){
            scheduleQuestSourceJump();
        }

    },
    true
);


/* 搜尋造成任務重新繪製時再補一次 */
document.addEventListener(
    'input',
    function(e){

        if(
            e.target &&
            e.target.id === 'pd-search'
        ){
            scheduleQuestSourceJump();
        }

    },
    true
);


/* 第一次載入 */
if(document.readyState === 'loading'){

    document.addEventListener(
        'DOMContentLoaded',
        scheduleQuestSourceJump
    );

}else{

    scheduleQuestSourceJump();
}


/* 樣式 */
var st =
    document.createElement('style');

st.id =
    'quest-source-jump-safe-v1-style';

st.textContent = `

#game-pedia .pd-q-source-jump-safe{
    cursor:pointer !important;
    color:#93c5fd !important;

    width:max-content;
    max-width:100%;

    padding:3px 7px;
    margin-top:3px;

    border-radius:7px;

    transition:
        background .12s ease,
        transform .12s ease;
}

#game-pedia .pd-q-source-jump-safe::after{
    content:' ›';
    color:#60a5fa;
    font-weight:900;
}

#game-pedia .pd-q-source-jump-safe:active{
    background:rgba(37,99,235,.22);
    transform:scale(.98);
}

`;

document.head.appendChild(st);

})();


/* === quest reward jump safe v1 === */
(function(){

if(window.__questRewardJumpSafeV1)
    return;

window.__questRewardJumpSafeV1 = true;


/* ------------------------------
 * 名稱整理
 * ------------------------------ */
function qRewardClean(s){

    return String(s || '')
        .replace(/\s+/g,'')
        .replace(/[（）]/g,function(x){
            return x === '（' ? '(' : ')';
        })
        .trim();
}


/* ------------------------------
 * 從文字找 DB 道具
 * ------------------------------ */
function qRewardFindItem(name){

    if(
        typeof DB === 'undefined' ||
        !DB.items
    ){
        return null;
    }

    var target = qRewardClean(name);
    var found = null;

    Object.keys(DB.items).some(function(id){

        var d = DB.items[id];

        if(!d || !d.n)
            return false;

        if(qRewardClean(d.n) === target){

            found = {
                id:id,
                data:d
            };

            return true;
        }

        return false;
    });

    return found;
}


/* ------------------------------
 * 從名稱找技能
 * ------------------------------ */
function qRewardFindSkill(name){

    if(
        typeof DB === 'undefined' ||
        !DB.skills
    ){
        return null;
    }

    var target = qRewardClean(name);
    var found = null;

    Object.keys(DB.skills).some(function(id){

        var d = DB.skills[id];

        if(!d || !d.n)
            return false;

        if(qRewardClean(d.n) === target){

            found = {
                id:id,
                data:d
            };

            return true;
        }

        return false;
    });

    return found;
}


/* ------------------------------
 * 分析一個獎勵名稱
 * ------------------------------ */
function qRewardResolve(raw){

    var text = String(raw || '')
        .replace(/^[🎁🔎\s]+/,'')
        .trim();

    if(!text)
        return null;


    /* 先直接找道具 */
    var item = qRewardFindItem(text);

    if(item){

        var d = item.data;

        /* 技能書 */
        if(
            d.type === 'skillbk' &&
            d.sk &&
            DB.skills &&
            DB.skills[d.sk]
        ){
            return {
                label:text,
                tab:'skill',
                search:DB.skills[d.sk].n
            };
        }


        /* 裝備 */
        if(
            d.type === 'wpn' ||
            d.type === 'arm' ||
            d.type === 'acc'
        ){
            return {
                label:text,
                tab:'equip',
                search:d.n
            };
        }


        /* 一般道具 */
        return {
            label:text,
            tab:'item',
            search:d.n
        };
    }


    /*
     * 魔法書（技能名）
     * 魔法書(技能名)
     */
    var m = text.match(
        /(?:魔法書|技能書)\s*[\(（]\s*([^\)）]+)\s*[\)）]/
    );

    if(m){

        var skillName =
            String(m[1] || '').trim();

        var skill =
            qRewardFindSkill(skillName);

        return {
            label:text,
            tab:'skill',
            search:
                skill && skill.data
                    ? skill.data.n
                    : skillName
        };
    }


    /* 本身就是技能名 */
    var skill2 = qRewardFindSkill(text);

    if(skill2){

        return {
            label:text,
            tab:'skill',
            search:skill2.data.n
        };
    }


    /* 找不到就當一般道具搜尋 */
    return {
        label:text,
        tab:'item',
        search:text
    };
}


/* ------------------------------
 * 點獎勵後切百科
 * ------------------------------ */
function qRewardJump(info){

    if(!info)
        return;

    try{

        if(
            typeof window.pediaTab ===
            'function'
        ){
            window.pediaTab(info.tab);
        }

    }catch(e){}


    setTimeout(function(){

        var input =
            document.getElementById(
                'pd-search'
            );

        if(input)
            input.value = info.search;

        try{

            if(
                typeof window.pediaSearch ===
                'function'
            ){
                window.pediaSearch(
                    info.search
                );
            }

        }catch(e){}

    },30);
}


/* ------------------------------
 * 找任務卡中的完成獎勵
 * ------------------------------ */
function decorateQuestRewards(){

    var pedia =
        document.getElementById(
            'game-pedia'
        );

    if(
        !pedia ||
        pedia.classList.contains('hidden')
    ){
        return;
    }


    var all =
        Array.from(
            pedia.querySelectorAll(
                'div,span,p,b,strong'
            )
        );


    all.forEach(function(head){

        var ht =
            String(
                head.textContent || ''
            )
            .replace(/\s+/g,'')
            .trim();

        if(
            ht !== '🎁完成獎勵' &&
            ht !== '完成獎勵'
        ){
            return;
        }


        var card =
            head.closest('.pd-card');

        if(!card)
            card = head.parentElement;

        if(!card)
            return;


        /* 已經做過就跳過 */
        if(
            card.querySelector(
                '.pd-q-reward-jump-row'
            )
        ){
            return;
        }


        /*
         * 找「完成獎勵」後面的綠色文字
         */
        var nodes =
            Array.from(
                card.querySelectorAll(
                    'div,span,p'
                )
            );

        var rewardLine = null;

        nodes.forEach(function(el){

            if(rewardLine)
                return;

            if(
                head.compareDocumentPosition(el) &
                Node.DOCUMENT_POSITION_FOLLOWING
            ){

                var txt =
                    String(
                        el.textContent || ''
                    ).trim();

                if(
                    !txt ||
                    txt.indexOf('完成獎勵') >= 0
                ){
                    return;
                }

                /*
                 * 任務說明那一行不要抓
                 */
                if(
                    txt.indexOf('必須先向') >= 0 ||
                    txt.indexOf('接取試煉') >= 0
                ){
                    return;
                }


                /*
                 * 優先抓綠色獎勵文字
                 */
                var cls =
                    String(el.className || '');

                if(
                    cls.indexOf('emerald') >= 0 ||
                    cls.indexOf('green') >= 0
                ){
                    rewardLine = el;
                }
            }
        });


        /*
         * 如果樣式沒帶 green，
         * 再找標題後第一個較短文字。
         */
        if(!rewardLine){

            var started = false;

            nodes.some(function(el){

                if(el === head){
                    started = true;
                    return false;
                }

                if(!started)
                    return false;

                var txt =
                    String(
                        el.textContent || ''
                    )
                    .replace(/\s+/g,' ')
                    .trim();

                if(
                    txt &&
                    txt.length <= 80 &&
                    txt.indexOf('必須先向') < 0 &&
                    txt.indexOf('完成獎勵') < 0
                ){
                    rewardLine = el;
                    return true;
                }

                return false;
            });
        }


        if(!rewardLine)
            return;


        var rewardText =
            String(
                rewardLine.textContent || ''
            )
            .replace(/\s+/g,' ')
            .trim();

        if(!rewardText)
            return;


        /*
         * 紅色斗篷 + 魔法書(精準目標)
         * 拆成兩顆按鈕
         */
        var pieces =
            rewardText
            .split(/\s*(?:\+|＋|、)\s*/)
            .map(function(x){
                return x.trim();
            })
            .filter(Boolean);

        if(!pieces.length)
            return;


        var row =
            document.createElement('div');

        row.className =
            'pd-q-reward-jump-row';


        var title =
            document.createElement('span');

        title.className =
            'pd-q-reward-jump-title';

        title.textContent =
            '🔎 查看獎勵';

        row.appendChild(title);


        pieces.forEach(function(piece){

            var info =
                qRewardResolve(piece);

            if(!info)
                return;

            var btn =
                document.createElement(
                    'button'
                );

            btn.type = 'button';

            btn.className =
                'pd-q-reward-jump-btn';

            btn.textContent =
                info.label + ' ›';

            btn.addEventListener(
                'click',
                function(e){

                    e.preventDefault();
                    e.stopPropagation();

                    qRewardJump(info);
                }
            );

            row.appendChild(btn);
        });


        rewardLine.insertAdjacentElement(
            'afterend',
            row
        );

    });
}


/* ------------------------------
 * 重畫後補一次
 * ------------------------------ */
function scheduleQuestRewardJump(){

    setTimeout(
        decorateQuestRewards,
        30
    );

    setTimeout(
        decorateQuestRewards,
        150
    );

    setTimeout(
        decorateQuestRewards,
        400
    );
}


/* 百科點擊後重掃 */
document.addEventListener(
    'click',
    function(e){

        if(
            e.target &&
            e.target.closest &&
            (
                e.target.closest('#game-pedia') ||
                e.target.closest('#pedia-fab')
            )
        ){
            scheduleQuestRewardJump();
        }

    },
    true
);


/* 百科搜尋後重掃 */
document.addEventListener(
    'input',
    function(e){

        if(
            e.target &&
            e.target.id === 'pd-search'
        ){
            scheduleQuestRewardJump();
        }

    },
    true
);


/* 初始 */
if(document.readyState === 'loading'){

    document.addEventListener(
        'DOMContentLoaded',
        scheduleQuestRewardJump
    );

}else{

    scheduleQuestRewardJump();
}


/* ------------------------------
 * 樣式
 * ------------------------------ */
var st =
    document.createElement('style');

st.id =
    'quest-reward-jump-safe-v1-style';

st.textContent = `

#game-pedia .pd-q-reward-jump-row{
    display:flex;
    flex-wrap:wrap;
    align-items:center;
    gap:6px;

    margin-top:7px;
}

#game-pedia .pd-q-reward-jump-title{
    color:#94a3b8;
    font-size:12px;
    font-weight:700;
}

#game-pedia .pd-q-reward-jump-btn{
    appearance:none;
    border:1px solid #16a34a;

    background:
        rgba(6,78,59,.35);

    color:#86efac;

    padding:5px 9px;

    border-radius:9px;

    font-size:12px;
    font-weight:800;

    cursor:pointer;

    line-height:1.2;
}

#game-pedia .pd-q-reward-jump-btn:active{
    transform:scale(.97);
    background:
        rgba(5,150,105,.28);
}

`;

document.head.appendChild(st);

})();


/* === quest status filter safe v1 === */
(function(){

if(window.__questStatusFilterSafeV1) return;
window.__questStatusFilterSafeV1 = true;

var _questStatusMode = 'all';


function qsfStatus(card){

    var txt = String(
        card && card.textContent || ''
    ).replace(/\s+/g,' ');

    if(
        txt.indexOf('進行中') >= 0
    ){
        return 'active';
    }

    if(
        txt.indexOf('可接取') >= 0
    ){
        return 'available';
    }

    if(
        txt.indexOf('已完成') >= 0 ||
        txt.indexOf('完成') >= 0 &&
        txt.indexOf('完成獎勵') < 0
    ){
        return 'done';
    }

    if(
        txt.indexOf('需要 Lv.') >= 0 ||
        txt.indexOf('需要Lv.') >= 0 ||
        txt.indexOf('無法接取') >= 0
    ){
        return 'locked';
    }

    return 'other';
}


function qsfApply(){

    var pedia =
        document.getElementById('game-pedia');

    if(!pedia) return;

    var cards =
        Array.from(
            pedia.querySelectorAll('.pd-q-card')
        );

    cards.forEach(function(card){

        var st = qsfStatus(card);

        var show =
            _questStatusMode === 'all' ||
            st === _questStatusMode;

        card.style.setProperty(
            'display',
            show ? '' : 'none',
            'important'
        );
    });


    var buttons =
        pedia.querySelectorAll(
            '.pd-q-status-filter-btn'
        );

    buttons.forEach(function(btn){

        btn.classList.toggle(
            'active',
            btn.dataset.mode === _questStatusMode
        );
    });
}


function qsfEnsure(){

    var pedia =
        document.getElementById('game-pedia');

    if(
        !pedia ||
        pedia.classList.contains('hidden')
    ){
        return;
    }

    /*
     * 只在任務頁出現。
     * 任務頁有 .pd-q-card 才建立。
     */
    var card =
        pedia.querySelector('.pd-q-card');

    if(!card)
        return;


    if(
        pedia.querySelector(
            '#pd-q-status-filter-safe'
        )
    ){
        qsfApply();
        return;
    }


    /*
     * 優先放在「只看我的職業」附近。
     */
    var myClass =
        pedia.querySelector(
            '#pd-q-myclass-safe'
        );

    var host =
        myClass
            ? myClass.parentElement
            : card.parentElement;

    if(!host)
        return;


    var box =
        document.createElement('div');

    box.id =
        'pd-q-status-filter-safe';

    box.innerHTML = `
        <div class="pd-q-status-filter-title">
            🔎 任務狀態
        </div>

        <div class="pd-q-status-filter-buttons">
            <button data-mode="all">
                全部
            </button>

            <button data-mode="active">
                ▶ 進行中
            </button>

            <button data-mode="available">
                📜 可接取
            </button>

            <button data-mode="done">
                ✅ 已完成
            </button>

            <button data-mode="locked">
                🔒 未達條件
            </button>
        </div>
    `;


    if(myClass){

        myClass.parentElement.insertAdjacentElement(
            'afterend',
            box
        );

    }else{

        host.insertBefore(
            box,
            host.firstChild
        );
    }


    box.querySelectorAll('button')
        .forEach(function(btn){

            btn.className =
                'pd-q-status-filter-btn';

            btn.addEventListener(
                'click',
                function(e){

                    e.preventDefault();
                    e.stopPropagation();

                    _questStatusMode =
                        btn.dataset.mode || 'all';

                    qsfApply();
                }
            );
        });


    qsfApply();
}


function qsfSchedule(){

    setTimeout(qsfEnsure,30);
    setTimeout(qsfEnsure,150);
    setTimeout(qsfEnsure,400);
}


/*
 * 百科切頁、任務操作後重新確認
 */
document.addEventListener(
    'click',
    function(e){

        if(
            e.target &&
            e.target.closest &&
            (
                e.target.closest('#game-pedia') ||
                e.target.closest('#pedia-fab')
            )
        ){
            qsfSchedule();
        }

    },
    true
);


/* 搜尋重新繪製時 */
document.addEventListener(
    'input',
    function(e){

        if(
            e.target &&
            e.target.id === 'pd-search'
        ){
            qsfSchedule();
        }

    },
    true
);


if(document.readyState === 'loading'){

    document.addEventListener(
        'DOMContentLoaded',
        qsfSchedule
    );

}else{

    qsfSchedule();
}


/* 樣式 */
var st =
    document.createElement('style');

st.id =
    'quest-status-filter-safe-v1-style';

st.textContent = `

#game-pedia #pd-q-status-filter-safe{
    margin:8px 0 12px;
    padding:9px;

    border:1px solid #334155;
    border-radius:12px;

    background:rgba(15,23,42,.55);
}

#game-pedia .pd-q-status-filter-title{
    margin-bottom:7px;

    color:#cbd5e1;
    font-size:12px;
    font-weight:800;
}

#game-pedia .pd-q-status-filter-buttons{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
}

#game-pedia .pd-q-status-filter-btn{
    appearance:none;

    padding:6px 9px;

    border:1px solid #475569;
    border-radius:9px;

    background:#172033;
    color:#cbd5e1;

    font-size:11px;
    font-weight:800;

    cursor:pointer;
}

#game-pedia .pd-q-status-filter-btn.active{
    border-color:#f59e0b;

    background:#78350f;
    color:#fde68a;
}

#game-pedia .pd-q-status-filter-btn:active{
    transform:scale(.97);
}

@media(max-width:768px){

    #game-pedia .pd-q-status-filter-btn{
        padding:6px 8px;
        font-size:10px;
    }

}

`;

document.head.appendChild(st);

})();


/* === quest progress bar safe v1 === */
(function(){

if(window.__questProgressBarSafeV1) return;
window.__questProgressBarSafeV1 = true;


/* 讀取「持有 0/1」 */
function qpbRead(card){

    var badges =
        card.querySelectorAll(
            '.pd-q-held-safe'
        );

    var have = 0;
    var need = 0;

    Array.from(badges).forEach(function(b){

        var txt =
            String(
                b.textContent || ''
            );

        var m =
            txt.match(
                /持有\s*(\d+)\s*\/\s*(\d+)/
            );

        if(!m) return;

        var h =
            Number(m[1]) || 0;

        var n =
            Number(m[2]) || 0;

        if(n <= 0) return;

        have += Math.min(h,n);
        need += n;
    });

    if(need <= 0)
        return null;

    var pct =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    have / need * 100
                )
            )
        );

    return {
        have:have,
        need:need,
        pct:pct
    };
}


/* 找完成獎勵標題 */
function qpbRewardHead(card){

    var nodes =
        card.querySelectorAll(
            'div,span,p,b,strong'
        );

    for(var i=0;i<nodes.length;i++){

        var t =
            String(
                nodes[i].textContent || ''
            )
            .replace(/\s+/g,'')
            .trim();

        if(
            t === '🎁完成獎勵' ||
            t === '完成獎勵'
        ){
            return nodes[i];
        }
    }

    return null;
}


/* 建立 / 更新進度條 */
function qpbUpdateCard(card){

    var data =
        qpbRead(card);

    var old =
        card.querySelector(
            '.pd-q-progress-safe'
        );

    if(!data){

        if(old)
            old.remove();

        return;
    }


    var box = old;

    if(!box){

        box =
            document.createElement('div');

        box.className =
            'pd-q-progress-safe';

        box.innerHTML = `
            <div class="pd-q-progress-top">
                <span class="pd-q-progress-title">
                    📊 任務進度
                </span>

                <span class="pd-q-progress-num"></span>
            </div>

            <div class="pd-q-progress-track">
                <div class="pd-q-progress-fill"></div>
            </div>
        `;


        var reward =
            qpbRewardHead(card);

        if(reward){

            reward.insertAdjacentElement(
                'beforebegin',
                box
            );

        }else{

            card.appendChild(box);
        }
    }


    var num =
        box.querySelector(
            '.pd-q-progress-num'
        );

    var fill =
        box.querySelector(
            '.pd-q-progress-fill'
        );


    if(num){

        num.textContent =
            data.have +
            '/' +
            data.need +
            '　' +
            data.pct +
            '%';
    }


    if(fill){

        fill.style.width =
            data.pct + '%';
    }


    box.classList.toggle(
        'done',
        data.pct >= 100
    );

    box.classList.toggle(
        'started',
        data.pct > 0 &&
        data.pct < 100
    );
}


/* 全部任務更新 */
function qpbUpdate(){

    var pedia =
        document.getElementById(
            'game-pedia'
        );

    if(
        !pedia ||
        pedia.classList.contains('hidden')
    ){
        return;
    }

    var cards =
        pedia.querySelectorAll(
            '.pd-q-card'
        );

    Array.from(cards).forEach(
        qpbUpdateCard
    );
}


function qpbSchedule(){

    setTimeout(qpbUpdate,30);
    setTimeout(qpbUpdate,150);
    setTimeout(qpbUpdate,400);
}


/* 百科內操作後更新 */
document.addEventListener(
    'click',
    function(e){

        if(
            e.target &&
            e.target.closest &&
            (
                e.target.closest('#game-pedia') ||
                e.target.closest('#pedia-fab')
            )
        ){
            qpbSchedule();
        }

    },
    true
);


/* 搜尋重新繪製後更新 */
document.addEventListener(
    'input',
    function(e){

        if(
            e.target &&
            e.target.id === 'pd-search'
        ){
            qpbSchedule();
        }

    },
    true
);


if(document.readyState === 'loading'){

    document.addEventListener(
        'DOMContentLoaded',
        qpbSchedule
    );

}else{

    qpbSchedule();
}


/* 樣式 */
var st =
    document.createElement('style');

st.id =
    'quest-progress-bar-safe-v1-style';

st.textContent = `

#game-pedia .pd-q-progress-safe{
    margin:10px 0 12px;

    padding:8px 10px;

    border:1px solid #334155;
    border-radius:9px;

    background:
        rgba(15,23,42,.55);
}

#game-pedia .pd-q-progress-top{
    display:flex;
    align-items:center;
    justify-content:space-between;

    gap:8px;

    margin-bottom:6px;
}

#game-pedia .pd-q-progress-title{
    color:#cbd5e1;
    font-size:11px;
    font-weight:800;
}

#game-pedia .pd-q-progress-num{
    color:#fca5a5;
    font-size:11px;
    font-weight:900;
}

#game-pedia .pd-q-progress-track{
    width:100%;
    height:8px;

    overflow:hidden;

    border-radius:999px;

    background:#1e293b;

    border:1px solid #334155;
}

#game-pedia .pd-q-progress-fill{
    width:0;
    height:100%;

    border-radius:999px;

    background:
        linear-gradient(
            90deg,
            #991b1b,
            #ef4444
        );

    transition:width .25s ease;
}


/* 有部分進度 */
#game-pedia .pd-q-progress-safe.started
.pd-q-progress-fill{

    background:
        linear-gradient(
            90deg,
            #92400e,
            #f59e0b
        );
}

#game-pedia .pd-q-progress-safe.started
.pd-q-progress-num{

    color:#fcd34d;
}


/* 完成 */
#game-pedia .pd-q-progress-safe.done
.pd-q-progress-fill{

    background:
        linear-gradient(
            90deg,
            #166534,
            #22c55e
        );
}

#game-pedia .pd-q-progress-safe.done
.pd-q-progress-num{

    color:#86efac;
}

`;

document.head.appendChild(st);

})();
