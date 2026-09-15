// 仿正服：四種屬性武器強化卷軸加入雜貨商店，每張 50,000 金幣
(function () {
    const IDS = [
        'scroll_attr_fire',
        'scroll_attr_water',
        'scroll_attr_wind',
        'scroll_attr_earth'
    ];

    const PRICE = 50000;

    // 單價改成 5 萬
    for (const id of IDS) {
        if (DB.items[id]) DB.items[id].p = PRICE;
    }

    // 一般雜貨商
    function addShop(key) {
        if (!Array.isArray(SHOP_LISTS[key])) return;
        for (const id of IDS) {
            if (!SHOP_LISTS[key].includes(id)) {
                SHOP_LISTS[key].push(id);
            }
        }
    }

    addShop('default');
    addShop('npc_boni');
    addShop('npc_skvati');

    console.log('[SHOP] 四種屬性卷軸已加入，每張 50,000');
})();
