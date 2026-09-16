// ===== 🧙 變身卡系統 Phase 1：介面／收藏／角色裝備骨架 =====
// 先建立骨架；尚未接戰鬥能力與正式合成。

(function () {
  'use strict';

  const STORE_KEY = 'lineage_transform_collection_v1';

  const TRANSFORM_TIERS = {
    red:    { name:'英雄', short:'紅變', color:'#ef4444', order:1 },
    purple: { name:'傳說', short:'紫變', color:'#a855f7', order:2 },
    gold:   { name:'神話', short:'金變', color:'#f59e0b', order:3 },
    cyan:   { name:'唯一', short:'青變', color:'#22d3ee', order:4 }
  };

  const TRANSFORM_CLASSES = {
    royal:    { name:'王族', icon:'👑' },
    knight:   { name:'騎士', icon:'🛡️' },
    elf:      { name:'妖精', icon:'🏹' },
    mage:     { name:'法師', icon:'🔮' },
    dark:     { name:'黑暗妖精', icon:'🌑' },
    dragon:   { name:'龍騎士', icon:'🐉' },
    illusion: { name:'幻術士', icon:'🌀' },
    warrior:  { name:'戰士', icon:'⚔️' }
  };

  // Phase 1：八職各一張紅變。
  const TRANSFORM_CARDS = [
    { id:'tr_red_royal_01',    name:'赤焰君主',   tier:'red', cls:'royal',    planned:'近傷／命中／隊伍增益' },
    { id:'tr_red_knight_01',   name:'鋼鐵守護者', tier:'red', cls:'knight',   planned:'近傷／命中／減傷' },
    { id:'tr_red_elf_01',      name:'風痕神射手', tier:'red', cls:'elf',      planned:'遠傷／遠命／連射強化' },
    { id:'tr_red_mage_01',     name:'星界賢者',   tier:'red', cls:'mage',     planned:'魔攻／魔命／施法速度' },
    { id:'tr_red_dark_01',     name:'夜刃追獵者', tier:'red', cls:'dark',     planned:'近傷／暴擊／雙擊強化' },
    { id:'tr_red_dragon_01',   name:'赤鱗破軍',   tier:'red', cls:'dragon',   planned:'近傷／命中／弱點曝光強化' },
    { id:'tr_red_illusion_01', name:'夢境支配者', tier:'red', cls:'illusion', planned:'魔攻／魔命／幻術技能強化' },
    { id:'tr_red_warrior_01',  name:'狂嵐戰王',   tier:'red', cls:'warrior',  planned:'近傷／HP／反擊強化' }
  ];

  let state = null;
  let page = 'transform';

  function getStore(k) {
    try {
      if (typeof _lsGet === 'function') return _lsGet(k);
      return localStorage.getItem(k);
    } catch(e) { return null; }
  }

  function setStore(k, v) {
    try {
      if (typeof _lsSet === 'function') return _lsSet(k, v);
      localStorage.setItem(k, v);
      return true;
    } catch(e) { return false; }
  }

  function defaultState() {
    return {
      version: 1,
      owned: {},
      fusion: {
        red: { fail:0 },
        purple: { fail:0 },
        gold: { fail:0 }
      }
    };
  }

  function loadState() {
    if (state) return state;
    try {
      const raw = getStore(STORE_KEY);
      state = raw ? JSON.parse(raw) : defaultState();
      if (!state || typeof state !== 'object') state = defaultState();
      if (!state.owned) state.owned = {};
      if (!state.fusion) state.fusion = defaultState().fusion;
    } catch(e) {
      state = defaultState();
    }
    return state;
  }

  function saveState() {
    return setStore(STORE_KEY, JSON.stringify(loadState()));
  }

  function ensurePlayer() {
    try {
      if (typeof player === 'undefined' || !player) return null;
      if (!Object.prototype.hasOwnProperty.call(player, 'transformId')) player.transformId = null;
      return player;
    } catch(e) { return null; }
  }

  function cardById(id) {
    return TRANSFORM_CARDS.find(c => c.id === id) || null;
  }

  function ownedCount(id) {
    return Math.max(0, Math.floor(Number(loadState().owned[id] || 0)));
  }

  function grant(id, count=1) {
    const c = cardById(id);
    if (!c) return false;
    const s = loadState();
    s.owned[id] = ownedCount(id) + Math.max(1, Math.floor(Number(count) || 1));
    saveState();
    render();
    return true;
  }

  function current() {
    const p = ensurePlayer();
    return p && p.transformId ? cardById(p.transformId) : null;
  }

  function canEquip(c) {
    const p = ensurePlayer();
    return !!(c && p && p.cls && ownedCount(c.id) > 0 && (c.cls === 'all' || c.cls === p.cls));
  }

  function equip(id) {
    const c = cardById(id);
    const p = ensurePlayer();
    if (!p || !canEquip(c)) return false;
    p.transformId = id;
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}
    render();
    return true;
  }

  function unequip() {
    const p = ensurePlayer();
    if (!p) return false;
    p.transformId = null;
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}
    render();
    return true;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
  }

  function badge(c) {
    const t = TRANSFORM_TIERS[c.tier] || TRANSFORM_TIERS.red;
    return `<span style="color:${t.color};font-weight:700">【${t.short}】</span>`;
  }

  function ensureDom() {
    let root = document.getElementById('transform-book');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'transform-book';
    root.className = 'hidden fixed inset-0 z-[48] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3';
    root.innerHTML = `
      <div class="w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900/95 rounded-2xl border-2 border-cyan-800/70 overflow-hidden"
           onclick="event.stopPropagation()">
        <div class="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-900">
          <div>
            <h2 class="text-2xl font-bold text-cyan-300">🧙 變身卡</h2>
            <div class="text-xs text-slate-400">紅變 → 紫變 → 金變 → 青變</div>
          </div>
          <button class="btn px-3 py-1.5 bg-slate-700" onclick="closeTransformBook()">✕ 關閉</button>
        </div>
        <div id="transform-book-tabs" class="grid grid-cols-4 gap-1.5 px-4 py-2.5 border-b border-slate-700"></div>
        <div id="transform-book-body" class="flex-1 overflow-y-auto p-4"></div>
      </div>`;
    root.addEventListener('click', closeTransformBook);
    document.body.appendChild(root);
    return root;
  }

  function ensureCollectionButton() {
    const panel = document.getElementById('collection-panel');
    if (!panel || document.getElementById('collection-open-transform')) return;

    const box = panel.querySelector('.flex.flex-col.gap-3.p-5');
    if (!box) return;

    const btn = document.createElement('button');
    btn.id = 'collection-open-transform';
    btn.className = 'btn py-5 text-xl font-bold';
    btn.style.cssText = 'background:linear-gradient(135deg,#0c2d38,#0e7490);color:#cffafe;border-color:#22d3ee;';
    btn.textContent = '🧙 變身';
    btn.onclick = () => {
      try { if (typeof closeCollectionPanel === 'function') closeCollectionPanel(); } catch(e) {}
      openTransformBook('transform');
    };
    box.appendChild(btn);
  }

  function renderTabs() {
    const el = document.getElementById('transform-book-tabs');
    if (!el) return;
    const tabs = [
      ['transform','🧙 變身'],
      ['fusion','🔥 合成'],
      ['collection','📚 收藏'],
      ['ability','📊 能力']
    ];
    el.innerHTML = tabs.map(([k,n]) =>
      `<button class="btn py-2 text-sm font-bold ${page===k?'bg-cyan-800 text-cyan-100':'bg-slate-800 text-slate-300'}"
               onclick="setTransformPage('${k}')">${n}</button>`
    ).join('');
  }

  function renderTransformPage() {
    const p = ensurePlayer();
    const cur = current();
    const clsInfo = p && p.cls ? TRANSFORM_CLASSES[p.cls] : null;
    const cards = TRANSFORM_CARDS.filter(c => ownedCount(c.id) > 0 && (!p || !p.cls || c.cls === p.cls || c.cls === 'all'));

    let html = `
      <div class="rounded-xl border border-slate-700 bg-slate-800/70 p-4 mb-4">
        <div class="text-sm text-slate-400">目前角色</div>
        <div class="text-lg font-bold">${clsInfo ? clsInfo.icon+' '+esc(clsInfo.name) : '尚未載入角色'}</div>
        <div class="text-sm text-slate-400 mt-3">目前變身</div>
        <div class="text-xl font-bold mt-1">${cur ? badge(cur)+' '+esc(cur.name) : '<span class="text-slate-500">未套用</span>'}</div>
        ${cur ? '<button class="btn mt-3 px-3 py-1.5 bg-slate-700" onclick="transformUnequip()">解除變身</button>' : ''}
      </div>`;

    if (!cards.length) {
      return html + `<div class="border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500">
        目前沒有此職業可使用的變身卡。
      </div>`;
    }

    html += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">';
    html += cards.map(c => {
      const active = cur && cur.id === c.id;
      return `
        <div class="rounded-xl border ${active?'border-cyan-500':'border-slate-700'} bg-slate-800/70 p-4">
          <div class="flex justify-between gap-3">
            <div>
              <div class="text-lg font-bold">${badge(c)} ${esc(c.name)}</div>
              <div class="text-sm text-slate-400">${esc(TRANSFORM_CLASSES[c.cls].icon+' '+TRANSFORM_CLASSES[c.cls].name)}</div>
            </div>
            <div class="text-xs text-slate-500">持有 × ${ownedCount(c.id)}</div>
          </div>
          <div class="text-xs text-amber-200 mt-3">預定能力：${esc(c.planned)}</div>
          <button class="btn w-full mt-3 py-2 ${active?'bg-cyan-900':'bg-slate-700'}"
                  ${active?'disabled':''}
                  onclick="transformEquip('${c.id}')">${active?'目前使用中':'套用變身'}</button>
        </div>`;
    }).join('');
    html += '</div>';
    return html;
  }

  function renderFusionPage() {
    return `
      <div class="rounded-xl border border-purple-800/50 bg-purple-950/20 p-5">
        <div class="text-xl font-bold text-purple-300 mb-2">🔥 變身合成</div>
        <div class="text-slate-300">Phase 1 暫不啟用消耗，下一階段才接「重複卡投入 → 機率升階 → 失敗累積保底」。</div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
          <div class="rounded-lg bg-slate-800 p-3"><b class="text-red-400">紅 → 紫</b></div>
          <div class="rounded-lg bg-slate-800 p-3"><b class="text-purple-400">紫 → 金</b></div>
          <div class="rounded-lg bg-slate-800 p-3"><b class="text-amber-300">金 → 青</b></div>
        </div>
      </div>`;
  }

  function renderCollectionPage() {
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${
      Object.keys(TRANSFORM_CLASSES).map(k => {
        const ci = TRANSFORM_CLASSES[k];
        const cards = TRANSFORM_CARDS.filter(c => c.cls === k);
        return `
          <div class="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
            <div class="font-bold text-lg mb-2">${ci.icon} ${esc(ci.name)}</div>
            ${cards.map(c => `
              <div class="flex items-center justify-between gap-3 py-2 border-t border-slate-700">
                <div>${badge(c)} ${esc(c.name)}</div>
                <div class="text-sm ${ownedCount(c.id)?'text-emerald-300':'text-slate-600'}">
                  ${ownedCount(c.id)?'已取得 × '+ownedCount(c.id):'未取得'}
                </div>
              </div>`).join('')}
          </div>`;
      }).join('')
    }</div>`;
  }

  function renderAbilityPage() {
    const cur = current();
    return `
      <div class="rounded-xl border border-cyan-900/60 bg-cyan-950/10 p-5">
        <div class="text-xl font-bold text-cyan-300 mb-3">📊 變身能力</div>
        ${cur ? `<div class="text-lg">${badge(cur)} ${esc(cur.name)}</div><div class="text-slate-300 mt-2">預定：${esc(cur.planned)}</div>` : '<div class="text-slate-500">目前未套用變身。</div>'}
        <div class="mt-4 p-3 rounded-lg bg-slate-800 text-sm text-amber-200">
          Phase 1 不會改角色傷害、攻速、施法速度或能力值。
        </div>
      </div>`;
  }

  function render() {
    ensureDom();
    renderTabs();
    const body = document.getElementById('transform-book-body');
    if (!body) return;
    if (page === 'fusion') body.innerHTML = renderFusionPage();
    else if (page === 'collection') body.innerHTML = renderCollectionPage();
    else if (page === 'ability') body.innerHTML = renderAbilityPage();
    else body.innerHTML = renderTransformPage();
  }

  function openTransformBook(p) {
    page = p || 'transform';
    ensurePlayer();
    const root = ensureDom();
    root.classList.remove('hidden');
    render();
  }

  function closeTransformBook() {
    const root = document.getElementById('transform-book');
    if (root) root.classList.add('hidden');
  }

  function setTransformPage(p) {
    page = ['transform','fusion','collection','ability'].includes(p) ? p : 'transform';
    render();
  }

  function init() {
    loadState();
    ensurePlayer();
    ensureDom();
    ensureCollectionButton();
  }

  window.TRANSFORM_TIERS = TRANSFORM_TIERS;
  window.TRANSFORM_CLASSES = TRANSFORM_CLASSES;
  window.TRANSFORM_CARDS = TRANSFORM_CARDS;

  window.transformGrant = grant;
  window.transformOwnedCount = ownedCount;
  window.transformEquip = equip;
  window.transformUnequip = unequip;
  window.transformCurrent = current;

  window.openTransformBook = openTransformBook;
  window.closeTransformBook = closeTransformBook;
  window.setTransformPage = setTransformPage;
  window.renderTransformBook = render;
  window.initTransformSystem = init;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

