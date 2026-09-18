// ===== 潘朵拉黑市：玩家掛單收購 v2 =====
(function(){
'use strict';

const CHECK_MS = 10 * 60 * 1000;
const MAX_CATCHUP = 144;

let lastDiv = null;
let hooked = false;

function esc(s){
    return String(s == null ? '' : s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
}

function fmt(n){
    return Math.max(0, Math.floor(Number(n)||0)).toLocaleString();
}

function nicePrice(n){
    n = Math.max(1, Number(n)||1);

    let step =
        n >= 10000000 ? 1000000 :
        n >= 1000000  ? 100000 :
        n >= 100000   ? 10000 :
        n >= 10000    ? 1000 :
        n >= 1000     ? 100 : 10;

    return Math.max(step, Math.round(n / step) * step);
}

function marketable(id,d){
    if(!d || !d.n) return false;
    if(id === 'gold') return false;
    if(d.relic || d.noTrade || d.questOnly) return false;

    let p = Number(d.p)||0;
    let w = Number(d.gachaWeight)||0;

    return p > 0 || w > 0 || d.eff === 'card';
}

function rangeFor(id){
    if(typeof DB === 'undefined' || !DB.items) return null;

    let d = DB.items[id];
    if(!marketable(id,d)) return null;

    let base = Math.max(0, Number(d.p)||0);

    // 沒有商店基準價的稀有物品，用掉落權重估價
    if(!base){
        let w = Math.max(
            1,
            Math.min(80, Number(d.gachaWeight)||40)
        );

        base = Math.max(
            10000,
            600000 / Math.sqrt(w)
        );
    }

    // ===== 黑市行情 v2 =====
    // 普通物品：基準價 ×1 ～ ×20
    // 稀有物品：基準價 ×5 ～ ×100
    // 卡片類：  基準價 ×10 ～ ×200
    //
    // 例：基準價 10,000 的卡片
    // → 黑市行情約 100,000 ～ 2,000,000 金幣
    let w = Math.max(0, Number(d.gachaWeight)||0);
    let isCard = d.eff === 'card';

    // 掉落權重很低，或本身沒有一般商店售價、只能靠抽取/掉落估價，
    // 視為稀有物品。卡片另外再拉高一階。
    let isRare = !isCard && (
        (w > 0 && w <= 10) ||
        ((Number(d.p)||0) <= 0 && w > 0)
    );

    let minMul = 1.00;
    let maxMul = 20.00;
    let priceClass = 'normal';

    if(isCard){
        minMul = 10.00;
        maxMul = 200.00;
        priceClass = 'card';
    }else if(isRare){
        minMul = 5.00;
        maxMul = 100.00;
        priceClass = 'rare';
    }

    let min = nicePrice(base * minMul);
    let max = nicePrice(base * maxMul);

    if(max <= min) max = nicePrice(min * 20);

    return {
        min:min,
        max:max,
        priceClass:priceClass,
        minMul:minMul,
        maxMul:maxMul
    };
}

function chanceFor(offer,min,max){
    offer = Number(offer)||0;
    min = Math.max(1,Number(min)||1);
    max = Math.max(min+1,Number(max)||min+1);

    let x = Math.max(
        0,
        Math.min(1,(offer-min)/(max-min))
    );

    // 每10分鐘：
    // 最低行情約8%
    // 最高行情約68%
    return Math.max(
        0.08,
        Math.min(0.68,0.08 + x*0.60)
    );
}

function waitText(prob){
    let mins = 10 / Math.max(0.001,prob);

    if(mins <= 20) return '約 10～20 分鐘';
    if(mins <= 45) return '約 30 分鐘';
    if(mins <= 90) return '約 1 小時';
    if(mins <= 150) return '約 2 小時';

    return '約 ' + Math.max(3,Math.round(mins/60)) + ' 小時';
}

function elapsedText(ms){
    let m = Math.max(
        0,
        Math.floor((Number(ms)||0)/60000)
    );

    if(m < 60) return m + ' 分鐘';

    let h = Math.floor(m/60);
    let mm = m % 60;

    return mm
        ? h + ' 小時 ' + mm + ' 分'
        : h + ' 小時';
}

function currentOrder(){
    if(typeof player === 'undefined' || !player)
        return null;

    let o = player.pandoraBuyOrder;

    return o && o.itemId && Number(o.offer)>0
        ? o
        : null;
}

function save(){
    try{
        if(typeof saveGame === 'function')
            saveGame();
    }catch(e){}
}

function rerender(){
    try{
        if(
            lastDiv &&
            typeof window.pandoraRenderMarket === 'function'
        ){
            window.pandoraRenderMarket(lastDiv);
        }

        if(typeof updateUI === 'function')
            updateUI();

    }catch(e){}
}

function completeOrder(o){
    if(!o) return false;

    let d =
        typeof DB !== 'undefined' &&
        DB.items
            ? DB.items[o.itemId]
            : null;

    if(!d) return false;

    try{
        if(typeof gainItem !== 'function')
            return false;

        gainItem(
            o.itemId,
            1,
            true,
            true,
            false
        );

    }catch(e){
        return false;
    }

    player.pandoraBuyOrder = null;

    try{
        if(typeof logSys === 'function'){
            logSys(
                '<span class="text-emerald-300 font-bold">' +
                '🛒 黑市收購成功：' +
                esc(d.n) +
                '</span>，成交價 <b>' +
                fmt(o.offer) +
                ' 金幣</b>。'
            );
        }
    }catch(e){}

    save();

    return true;
}

function tick(renderAfter){
    let o = currentOrder();

    if(!o) return false;

    let now = Date.now();

    if(!Number(o.nextCheckAt)){
        o.nextCheckAt =
            (Number(o.createdAt)||now) +
            CHECK_MS;
    }

    let count = 0;
    let changed = false;

    while(
        now >= o.nextCheckAt &&
        count < MAX_CATCHUP
    ){
        count++;

        o.attempts =
            Math.max(
                0,
                Math.floor(Number(o.attempts)||0)
            ) + 1;

        let p = chanceFor(
            o.offer,
            o.min,
            o.max
        );

        if(Math.random() < p){

            completeOrder(o);

            if(renderAfter !== false)
                rerender();

            return true;
        }

        o.nextCheckAt += CHECK_MS;
        changed = true;
    }

    if(changed)
        save();

    return false;
}

function findItems(q){
    q = String(q||'')
        .trim()
        .toLowerCase();

    if(
        !q ||
        typeof DB === 'undefined' ||
        !DB.items
    ){
        return [];
    }

    let list = [];

    for(let id of Object.keys(DB.items)){

        let d = DB.items[id];

        if(!marketable(id,d))
            continue;

        let name = String(d.n||'');

        if(
            name.toLowerCase().includes(q)
        ){
            list.push({
                id:id,
                name:name
            });
        }

        if(list.length >= 50)
            break;
    }

    list.sort(
        (a,b)=>
            a.name.length-b.name.length ||
            a.name.localeCompare(b.name)
    );

    return list.slice(0,8);
}

function search(value){

    let input =
        document.getElementById(
            'pandora-player-buy-name'
        );

    let box =
        document.getElementById(
            'pandora-player-buy-suggestions'
        );

    if(!input || !box) return;

    // 重新打字＝取消之前選中的物品
    input.dataset.itemId = '';

    let list = findItems(value);

    if(!list.length){

        box.innerHTML =
            value
                ? '<div class="px-3 py-2 text-sm text-slate-500">找不到可收購物品</div>'
                : '';

        preview();
        return;
    }

    box.innerHTML =
        list.map(x=>{

            let r = rangeFor(x.id);

            return `
            <button
                type="button"
                class="w-full text-left px-3 py-2 border-b border-slate-700 bg-slate-900 hover:bg-slate-800"
                onclick="pandoraPlayerBuySelect('${esc(x.id)}')"
            >
                <div class="font-bold text-slate-200">
                    ${esc(x.name)}
                </div>

                <div class="text-xs text-amber-300">
                    ${r.priceClass==='card'?'🃏 卡片行情':(r.priceClass==='rare'?'💎 稀有行情':'一般行情')}
                    ${fmt(r.min)}～${fmt(r.max)} 金幣
                </div>
            </button>`;
        }).join('');

    preview();
}

function selectItem(id){

    let input =
        document.getElementById(
            'pandora-player-buy-name'
        );

    let box =
        document.getElementById(
            'pandora-player-buy-suggestions'
        );

    let d =
        typeof DB !== 'undefined' &&
        DB.items
            ? DB.items[id]
            : null;

    if(!input || !d) return;

    input.value = d.n;
    input.dataset.itemId = id;

    if(box)
        box.innerHTML = '';

    preview();
}

function preview(){

    let input =
        document.getElementById(
            'pandora-player-buy-name'
        );

    let priceEl =
        document.getElementById(
            'pandora-player-buy-price'
        );

    let info =
        document.getElementById(
            'pandora-player-buy-info'
        );

    let btn =
        document.getElementById(
            'pandora-player-buy-submit'
        );

    if(!input || !priceEl || !info || !btn)
        return;

    let id = input.dataset.itemId || '';

    let r =
        id
            ? rangeFor(id)
            : null;

    let offer =
        Math.max(
            0,
            Math.floor(Number(priceEl.value)||0)
        );

    if(!r){

        info.innerHTML =
            '<span class="text-slate-500">' +
            '先從搜尋結果選擇物品。' +
            '</span>';

        btn.disabled = true;
        btn.classList.add('opacity-50');

        return;
    }

    let p = chanceFor(
        offer,
        r.min,
        r.max
    );

    let valid =
        offer >= r.min &&
        offer <= r.max;

    info.innerHTML = `
        <div class="text-amber-300 font-bold">
            ${r.priceClass==='card'?'🃏 卡片黑市行情':(r.priceClass==='rare'?'💎 稀有黑市行情':'黑市成交價')}
            ${fmt(r.min)}～${fmt(r.max)}
            金幣
        </div>

        ${
            offer
                ? `<div class="mt-1 ${valid?'text-slate-300':'text-rose-300'}">
                    ${
                        valid
                        ? `你的出價 ${fmt(offer)}：
                           每 10 分鐘約 ${(p*100).toFixed(0)}% 命中，
                           平均 ${waitText(p)}`
                        : '請輸入行情範圍內的價格'
                    }
                   </div>`
                : `<div class="mt-1 text-slate-500">
                     輸入你的收購價即可估算等待時間。
                   </div>`
        }

        <div class="text-xs text-slate-500 mt-1">
            掛單時會先保留金幣；
            取消收購會全額退回。
        </div>
    `;

    btn.disabled = !valid;

    btn.classList.toggle(
        'opacity-50',
        !valid
    );
}

function createOrder(){

    if(currentOrder())
        return;

    let input =
        document.getElementById(
            'pandora-player-buy-name'
        );

    let priceEl =
        document.getElementById(
            'pandora-player-buy-price'
        );

    let id =
        input
            ? input.dataset.itemId || ''
            : '';

    let r =
        id
            ? rangeFor(id)
            : null;

    let offer =
        Math.max(
            0,
            Math.floor(
                Number(
                    priceEl &&
                    priceEl.value
                ) || 0
            )
        );

    let d =
        typeof DB !== 'undefined' &&
        DB.items
            ? DB.items[id]
            : null;

    if(!r || !d)
        return;

    if(
        offer < r.min ||
        offer > r.max
    ){
        return;
    }

    let gold =
        Math.max(
            0,
            Math.floor(Number(player.gold)||0)
        );

    if(gold < offer){

        try{
            if(typeof logSys === 'function'){
                logSys(
                    '<span class="text-rose-300">' +
                    '金幣不足，無法建立黑市收購單。' +
                    '</span>'
                );
            }
        }catch(e){}

        return;
    }

    // 先扣掉掛單金幣
    player.gold = gold - offer;

    let now = Date.now();

    player.pandoraBuyOrder = {
        itemId:id,
        offer:offer,
        min:r.min,
        max:r.max,
        createdAt:now,
        nextCheckAt:now + CHECK_MS,
        attempts:0
    };

    save();

    try{
        if(typeof logSys === 'function'){
            logSys(
                '<span class="text-amber-300">' +
                '🛒 已掛黑市收購：' +
                esc(d.n) +
                '，出價 ' +
                fmt(offer) +
                ' 金幣。</span>'
            );
        }
    }catch(e){}

    rerender();
}

function cancelOrder(){

    let o = currentOrder();

    if(!o) return;

    player.gold =
        Math.max(
            0,
            Math.floor(Number(player.gold)||0)
        )
        +
        Math.max(
            0,
            Math.floor(Number(o.offer)||0)
        );

    let d =
        typeof DB !== 'undefined' &&
        DB.items
            ? DB.items[o.itemId]
            : null;

    player.pandoraBuyOrder = null;

    save();

    try{
        if(typeof logSys === 'function'){
            logSys(
                '<span class="text-slate-300">' +
                '已取消黑市收購' +
                (d ? '：'+esc(d.n) : '') +
                '，退回 ' +
                fmt(o.offer) +
                ' 金幣。</span>'
            );
        }
    }catch(e){}

    rerender();
}

function panelHTML(){

    let o = currentOrder();

    if(o){

        let d =
            typeof DB !== 'undefined' &&
            DB.items
                ? DB.items[o.itemId]
                : null;

        let p =
            chanceFor(
                o.offer,
                o.min,
                o.max
            );

        let next =
            Math.max(
                0,
                Number(o.nextCheckAt||0) -
                Date.now()
            );

        return `
        <section
            id="pandora-player-buy-panel"
            class="mb-4 rounded-xl border border-amber-800/70 bg-slate-900/80 p-4"
        >

            <div class="text-xl font-bold text-amber-200">
                🛒 黑市掛單收購
            </div>

            <div class="mt-3 rounded-lg border border-slate-700 bg-slate-800/70 p-3">

                <div class="font-bold text-slate-100">
                    ${esc(d ? d.n : o.itemId)}
                </div>

                <div class="mt-1 text-amber-300">
                    出價 ${fmt(o.offer)} 金幣
                </div>

                <div class="text-sm text-slate-400">
                    行情
                    ${fmt(o.min)}～${fmt(o.max)}
                    ／每 10 分鐘約
                    ${(p*100).toFixed(0)}%
                    命中
                </div>

                <div class="text-sm text-cyan-300 mt-1">
                    平均 ${waitText(p)}
                    ・已等待
                    ${elapsedText(
                        Date.now() -
                        Number(
                            o.createdAt ||
                            Date.now()
                        )
                    )}
                </div>

                <div class="text-xs text-slate-500 mt-1">
                    下次判定：約
                    ${Math.max(
                        1,
                        Math.ceil(next/60000)
                    )}
                    分鐘後
                </div>

            </div>

            <button
                class="btn w-full mt-3 py-3 bg-slate-700"
                onclick="pandoraPlayerBuyCancel()"
            >
                取消收購並退回
                ${fmt(o.offer)}
                金幣
            </button>

        </section>`;
    }

    return `
    <section
        id="pandora-player-buy-panel"
        class="mb-4 rounded-xl border border-amber-800/70 bg-slate-900/80 p-4"
    >

        <div class="text-xl font-bold text-amber-200">
            🛒 黑市掛單收購
        </div>

        <div class="text-xs text-slate-500 mt-1">
            每 10 分鐘判定 1 次；
            出價越高，越容易提早收到。
        </div>

        <div class="mt-3 relative">

            <input
                id="pandora-player-buy-name"
                class="w-full bg-slate-950 border border-slate-600 rounded px-3 py-2 text-slate-100"
                placeholder="搜尋想收購的物品"
                autocomplete="off"
                oninput="pandoraPlayerBuySearch(this.value)"
            >

            <div
                id="pandora-player-buy-suggestions"
                class="absolute left-0 right-0 z-30 max-h-64 overflow-y-auto rounded-b-lg shadow-xl"
            ></div>

        </div>

        <input
            id="pandora-player-buy-price"
            type="number"
            min="1"
            class="w-full mt-3 bg-slate-950 border border-slate-600 rounded px-3 py-2 text-amber-200"
            placeholder="輸入收購價"
            oninput="pandoraPlayerBuyPreview()"
        >

        <div
            id="pandora-player-buy-info"
            class="mt-3 text-sm"
        >
            <span class="text-slate-500">
                先搜尋並選擇物品。
            </span>
        </div>

        <button
            id="pandora-player-buy-submit"
            class="btn w-full mt-3 py-3 font-bold bg-amber-900 text-amber-100 opacity-50"
            disabled
            onclick="pandoraPlayerBuyCreate()"
        >
            確認收購
        </button>

    </section>`;
}

function renderPanel(div){

    if(!div || !div.insertAdjacentHTML)
        return;

    tick(false);

    let old =
        div.querySelector(
            '#pandora-player-buy-panel'
        );

    if(old)
        old.remove();

    div.insertAdjacentHTML(
        'afterbegin',
        panelHTML()
    );
}

function hook(){

    if(hooked)
        return true;

    let base =
        window.pandoraRenderMarket;

    if(typeof base !== 'function')
        return false;

    if(base.__playerBuyOrderHook){
        hooked = true;
        return true;
    }

    let wrapped = function(div){

        lastDiv = div || lastDiv;

        let out =
            base.apply(
                this,
                arguments
            );

        try{
            renderPanel(div);
        }catch(e){
            console.warn(
                '[pandora-buy-order]',
                e
            );
        }

        return out;
    };

    wrapped.__playerBuyOrderHook = true;
    wrapped.__playerBuyOrderBase = base;

    window.pandoraRenderMarket = wrapped;

    hooked = true;

    return true;
}

window.pandoraPlayerBuySearch = search;
window.pandoraPlayerBuySelect = selectItem;
window.pandoraPlayerBuyPreview = preview;
window.pandoraPlayerBuyCreate = createOrder;
window.pandoraPlayerBuyCancel = cancelOrder;
window.pandoraPlayerBuyTick = tick;

let hookTimer =
    setInterval(function(){

        if(hook())
            clearInterval(hookTimer);

    },500);

setTimeout(function(){
    hook();
    tick(false);
},1200);

setInterval(function(){
    tick(true);
},30000);

})();
