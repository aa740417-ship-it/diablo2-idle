// 仿正服：防爆卷軸加入雜貨商店，每張 200,000 金幣
(function () {
    if (!window.OFFICIAL_BALANCE_MODE) return;

    const ID = 'scroll_protect';
    const PRICE = 200000;

    // 固定售價 20 萬
    if (typeof DB !== 'undefined' && DB.items && DB.items[ID]) {
        DB.items[ID].p = PRICE;
    }

    // 加入主要雜貨商
    if (typeof SHOP_LISTS !== 'undefined') {
        ['default', 'npc_boni', 'npc_skvati'].forEach(function (key) {
            const list = SHOP_LISTS[key];
            if (Array.isArray(list) && !list.includes(ID)) {
                list.push(ID);
            }
        });
    }

    console.info('[official-shop] 防爆卷軸已加入商店：200,000');
})();
