// ===== 可拖曳共用倉庫視窗（資料操作沿用 js/12-npc-quests.js）=====
(function () {
    let drag = null;
    function el(id) { return document.getElementById(id); }

    window.warehouseWindowIsOpen = function () {
        const win = el('warehouse-window');
        return !!win && !win.classList.contains('hidden');
    };

    window.openWarehouseWindow = function () {
        const win = el('warehouse-window');
        const content = el('warehouse-window-content');
        if (!win || !content) return;
        win.classList.remove('hidden');
        win.setAttribute('aria-hidden', 'false');
        if (typeof renderWarehouseNPC === 'function') renderWarehouseNPC(content);
    };

    window.closeWarehouseWindow = function () {
        const win = el('warehouse-window');
        if (!win) return;
        win.classList.add('hidden');
        win.setAttribute('aria-hidden', 'true');
    };

    function init() {
        const frame = el('warehouse-window-frame');
        const handle = el('warehouse-window-drag');
        const close = el('warehouse-window-close');
        if (!frame || !handle || !close) return;
        close.onclick = closeWarehouseWindow;

        handle.addEventListener('pointerdown', function (event) {
            if (event.target.closest('button, input, select')) return;
            const rect = frame.getBoundingClientRect();
            drag = { id: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
            handle.setPointerCapture(event.pointerId);
            // 🗑️ 移除 classList.add('is-dragging')：三份樣式表(style/floating-ui/tailwind-built)皆無此選擇器、亦無任何 JS 讀取 → 純無效果的狀態標記。
            event.preventDefault();
        });
        handle.addEventListener('pointermove', function (event) {
            if (!drag || drag.id !== event.pointerId) return;
            const maxX = Math.max(0, innerWidth - frame.offsetWidth);
            const maxY = Math.max(0, innerHeight - frame.offsetHeight);
            frame.style.left = Math.max(0, Math.min(maxX, event.clientX - drag.dx)) + 'px';
            frame.style.top = Math.max(0, Math.min(maxY, event.clientY - drag.dy)) + 'px';
            frame.style.transform = 'none';
        });
        function stop(event) {
            if (!drag || drag.id !== event.pointerId) return;
            drag = null;   // 🗑️ 同上：原 classList.remove('is-dragging') 一併移除
        }
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();


/* === mobile warehouse full scroll v1 === */
(function(){

function findBottomShortcut(){
    /* 先找我們常用的 id / class */
    var el =
        document.getElementById('mobile-bottom-nav') ||
        document.getElementById('mobile-shortcut-nav') ||
        document.querySelector('.mobile-bottom-nav') ||
        document.querySelector('.mobile-shortcut-nav');

    if(el) return el;

    /*
     * 如果名稱不同，就找底部 fixed 區塊：
     * 同時含 戰鬥 / 隊伍 / 背包 / 日誌 / 登出。
     */
    var nodes = document.querySelectorAll('nav,div');

    for(var i=0;i<nodes.length;i++){
        var n = nodes[i];
        var t = (n.textContent || '').replace(/\s+/g,'');

        if(
            t.indexOf('戰鬥') >= 0 &&
            t.indexOf('隊伍') >= 0 &&
            t.indexOf('背包') >= 0 &&
            t.indexOf('日誌') >= 0 &&
            t.indexOf('登出') >= 0
        ){
            var cs = getComputedStyle(n);

            if(cs.position === 'fixed')
                return n;
        }
    }

    return null;
}


function fitWarehouseMobile(){

    if(window.innerWidth > 768) return;

    var win = document.getElementById('warehouse-window');
    var frame = document.getElementById('warehouse-window-frame');
    var content = document.getElementById('warehouse-window-content');

    if(!win || !frame || !content) return;

    var nav = findBottomShortcut();

    /* 沒找到時用目前手機快捷列約 104px 作保底 */
    var navH = nav
        ? Math.ceil(nav.getBoundingClientRect().height)
        : 104;

    /*
     * 上面仍沿用原本公告高度，
     * 下面多留快捷列高度 + 8px。
     */
    frame.style.setProperty(
        'bottom',
        'calc(' + navH + 'px + env(safe-area-inset-bottom, 0px) + 8px)',
        'important'
    );

    frame.style.setProperty(
        'max-height',
        'calc(100dvh - var(--orig-pbar-h, 0px) - ' +
        navH +
        'px - env(safe-area-inset-bottom, 0px) - 16px)',
        'important'
    );

    frame.style.setProperty(
        'display',
        'flex',
        'important'
    );

    frame.style.setProperty(
        'flex-direction',
        'column',
        'important'
    );

    /*
     * 標題留在上面，
     * 真正倉庫內容自己滑。
     */
    content.style.setProperty(
        'flex',
        '1 1 auto',
        'important'
    );

    content.style.setProperty(
        'min-height',
        '0',
        'important'
    );

    content.style.setProperty(
        'height',
        'auto',
        'important'
    );

    content.style.setProperty(
        'overflow-y',
        'auto',
        'important'
    );

    content.style.setProperty(
        'overflow-x',
        'hidden',
        'important'
    );

    content.style.setProperty(
        '-webkit-overflow-scrolling',
        'touch',
        'important'
    );

    content.style.setProperty(
        'overscroll-behavior',
        'contain',
        'important'
    );

    content.style.setProperty(
        'touch-action',
        'pan-y',
        'important'
    );

    content.style.setProperty(
        'padding-bottom',
        '18px',
        'important'
    );
}


function installWarehouseMobileScroll(){

    fitWarehouseMobile();

    window.addEventListener(
        'resize',
        fitWarehouseMobile
    );

    window.addEventListener(
        'orientationchange',
        function(){
            setTimeout(fitWarehouseMobile,100);
        }
    );

    /*
     * 開倉庫後再重新量一次，
     * 確保底部快捷列高度已經正確。
     */
    if(typeof window.openWarehouseWindow === 'function' &&
       !window.openWarehouseWindow.__mobileScrollWrapped){

        var oldOpen = window.openWarehouseWindow;

        window.openWarehouseWindow = function(){
            var r = oldOpen.apply(this, arguments);

            requestAnimationFrame(fitWarehouseMobile);
            setTimeout(fitWarehouseMobile,100);

            return r;
        };

        window.openWarehouseWindow.__mobileScrollWrapped = true;
    }
}


if(document.readyState === 'loading'){
    document.addEventListener(
        'DOMContentLoaded',
        installWarehouseMobileScroll
    );
}else{
    installWarehouseMobileScroll();
}

})();
