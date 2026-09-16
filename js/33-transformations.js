// ===== 🧙 天堂M風格變身系統 Phase 5 =====
// 全地圖怪物掉「變身卡」→ 使用後依機率抽紅／紫／金／青變。
// 收藏帳號共用；目前套用的變身跟角色存檔走 player.transformId。
// 重複卡保留數量，後續供合成使用。

(function () {
  'use strict';

  const STORE_KEY = 'lineage_transform_collection_v1';
  const TRANSFORM_CARD_ITEM_ID = 'item_transform_card';

  // ===== 可調整機率 =====
  // 每隻真正死亡並結算的地圖怪物，都有同一機率掉 1 張變身卡。
  const TRANSFORM_CARD_DROP_RATE = 0.002; // 0.2% = 約 1/500

  // 使用變身卡後的階級機率，合計必須為 1。
  const TRANSFORM_OPEN_RATES = [
    { tier:'red',    rate:0.900 }, // 90%
    { tier:'purple', rate:0.080 }, // 8%
    { tier:'gold',   rate:0.018 }, // 1.8%
    { tier:'cyan',   rate:0.002 }  // 0.2%
  ];

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

  // ===== 8 職 × 4 階 = 32 張 =====
  const TRANSFORM_CARDS = [
    // 紅變
    { id:'tr_red_royal_01',    name:'赤焰君主',     tier:'red', cls:'royal',    planned:'近傷／命中／隊伍增益' },
    { id:'tr_red_knight_01',   name:'鋼鐵守護者',   tier:'red', cls:'knight',   planned:'近傷／命中／減傷' },
    { id:'tr_red_elf_01',      name:'風痕神射手',   tier:'red', cls:'elf',      planned:'遠傷／遠命／連射強化' },
    { id:'tr_red_mage_01',     name:'星界賢者',     tier:'red', cls:'mage',     planned:'魔攻／魔命／施法速度' },
    { id:'tr_red_dark_01',     name:'夜刃追獵者',   tier:'red', cls:'dark',     planned:'近傷／暴擊／雙擊強化' },
    { id:'tr_red_dragon_01',   name:'赤鱗破軍',     tier:'red', cls:'dragon',   planned:'近傷／命中／弱點曝光強化' },
    { id:'tr_red_illusion_01', name:'夢境支配者',   tier:'red', cls:'illusion', planned:'魔攻／魔命／幻術技能強化' },
    { id:'tr_red_warrior_01',  name:'狂嵐戰王',     tier:'red', cls:'warrior',  planned:'近傷／HP／反擊強化' },

    // 紫變
    { id:'tr_purple_royal_01',    name:'黎明帝王',       tier:'purple', cls:'royal',    planned:'近傷／命中／統御強化' },
    { id:'tr_purple_knight_01',   name:'深淵劍聖',       tier:'purple', cls:'knight',   planned:'近傷／命中／減傷強化' },
    { id:'tr_purple_elf_01',      name:'蒼穹神弓',       tier:'purple', cls:'elf',      planned:'遠傷／遠命／連射增幅' },
    { id:'tr_purple_mage_01',     name:'奧術大賢者',     tier:'purple', cls:'mage',     planned:'魔攻／魔命／施法速度強化' },
    { id:'tr_purple_dark_01',     name:'月蝕暗殺者',     tier:'purple', cls:'dark',     planned:'近傷／暴擊／雙擊增幅' },
    { id:'tr_purple_dragon_01',   name:'蒼龍戰將',       tier:'purple', cls:'dragon',   planned:'近傷／命中／弱點傷害增幅' },
    { id:'tr_purple_illusion_01', name:'虛界操演者',     tier:'purple', cls:'illusion', planned:'魔攻／魔命／幻術增幅' },
    { id:'tr_purple_warrior_01',  name:'泰坦戰神',       tier:'purple', cls:'warrior',  planned:'近傷／HP／反擊增幅' },

    // 金變
    { id:'tr_gold_royal_01',    name:'神聖霸王',     tier:'gold', cls:'royal',    planned:'統御被動／近傷／命中' },
    { id:'tr_gold_knight_01',   name:'永恆聖騎',     tier:'gold', cls:'knight',   planned:'守護被動／近傷／減傷' },
    { id:'tr_gold_elf_01',      name:'天穹箭神',     tier:'gold', cls:'elf',      planned:'追加箭矢／遠傷／遠命' },
    { id:'tr_gold_mage_01',     name:'元素主宰',     tier:'gold', cls:'mage',     planned:'魔法共鳴／魔攻／魔命' },
    { id:'tr_gold_dark_01',     name:'無影冥皇',     tier:'gold', cls:'dark',     planned:'雙擊增幅／近傷／暴擊' },
    { id:'tr_gold_dragon_01',   name:'龍魂霸者',     tier:'gold', cls:'dragon',   planned:'弱點爆發／近傷／命中' },
    { id:'tr_gold_illusion_01', name:'萬象幻神',     tier:'gold', cls:'illusion', planned:'幻術共鳴／魔攻／魔命' },
    { id:'tr_gold_warrior_01',  name:'不滅泰坦',     tier:'gold', cls:'warrior',  planned:'泰坦反擊／HP／近傷' },

    // 青變
    { id:'tr_cyan_royal_01',    name:'天命君王',       tier:'cyan', cls:'royal',    planned:'終極統御效果' },
    { id:'tr_cyan_knight_01',   name:'終焉守護神',     tier:'cyan', cls:'knight',   planned:'終極守護效果' },
    { id:'tr_cyan_elf_01',      name:'星界狩神',       tier:'cyan', cls:'elf',      planned:'連射追加攻擊' },
    { id:'tr_cyan_mage_01',     name:'真理魔神',       tier:'cyan', cls:'mage',     planned:'魔法共鳴強化' },
    { id:'tr_cyan_dark_01',     name:'虛無夜皇',       tier:'cyan', cls:'dark',     planned:'雙擊進化效果' },
    { id:'tr_cyan_dragon_01',   name:'始源龍神',       tier:'cyan', cls:'dragon',   planned:'弱點爆發進化' },
    { id:'tr_cyan_illusion_01', name:'夢界神主',       tier:'cyan', cls:'illusion', planned:'幻術共鳴進化' },
    { id:'tr_cyan_warrior_01',  name:'混沌戰神',       tier:'cyan', cls:'warrior',  planned:'泰坦反擊進化' }
  ];

  // ===== Phase 3：實際變身能力 =====
  // 攻速是「間隔縮短」的百分比加成；施法速度直接縮短 castLock/supportCastLock。
  // 數值集中在此，後續要微調不用碰戰鬥核心。
  const TRANSFORM_TIER_POWER = {
    red:    { atkSpdPct:10, dmg:3,  hit:3,  sub:1, hp:50  },
    purple: { atkSpdPct:15, dmg:5,  hit:5,  sub:2, hp:100 },
    gold:   { atkSpdPct:20, dmg:8,  hit:8,  sub:3, hp:200 },
    cyan:   { atkSpdPct:25, dmg:12, hit:12, sub:5, hp:300 }
  };

  function transformAbilityData(card) {
    if (!card || !TRANSFORM_TIER_POWER[card.tier]) return null;
    const t = TRANSFORM_TIER_POWER[card.tier];
    const out = { atkSpdPct:t.atkSpdPct };

    switch (card.cls) {
      case 'royal':
        out.meleeDmg = t.dmg; out.meleeHit = t.hit; out.extraDmg = t.sub;
        break;
      case 'knight':
        out.meleeDmg = t.dmg; out.meleeHit = t.hit; out.dr = t.sub;
        break;
      case 'elf':
        out.rangedDmg = t.dmg; out.rangedHit = t.hit; out.rangedCrit = t.sub;
        break;
      case 'mage':
        out.magicDmg = t.dmg; out.magicHit = t.hit; out.extraMp = t.sub; out.castSpdPct = t.atkSpdPct;
        break;
      case 'dark':
        out.meleeDmg = t.dmg; out.meleeHit = t.hit; out.meleeCrit = t.sub;
        break;
      case 'dragon':
        out.meleeDmg = t.dmg; out.meleeHit = t.hit; out.extraDmg = t.sub;
        break;
      case 'illusion':
        out.magicDmg = t.dmg; out.magicHit = t.hit; out.extraMp = t.sub; out.castSpdPct = t.atkSpdPct;
        break;
      case 'warrior':
        out.meleeDmg = t.dmg; out.meleeHit = t.hit; out.dr = t.sub; out.mhp = t.hp;
        break;
    }
    return out;
  }

  function transformAbilityLines(card) {
    const a = transformAbilityData(card);
    if (!a) return [];
    const lines = [];
    if (a.atkSpdPct) lines.push(`攻擊速度 +${a.atkSpdPct}%`);
    if (a.castSpdPct) lines.push(`施法速度 +${a.castSpdPct}%`);
    if (a.meleeDmg) lines.push(`近距離傷害 +${a.meleeDmg}`);
    if (a.meleeHit) lines.push(`近距離命中 +${a.meleeHit}`);
    if (a.rangedDmg) lines.push(`遠距離傷害 +${a.rangedDmg}`);
    if (a.rangedHit) lines.push(`遠距離命中 +${a.rangedHit}`);
    if (a.magicDmg) lines.push(`魔法傷害 +${a.magicDmg}`);
    if (a.magicHit) lines.push(`魔法命中 +${a.magicHit}`);
    if (a.extraDmg) lines.push(`額外傷害 +${a.extraDmg}`);
    if (a.extraMp) lines.push(`額外魔法點數 +${a.extraMp}`);
    if (a.dr) lines.push(`傷害減免 +${a.dr}`);
    if (a.meleeCrit) lines.push(`近距離爆擊率 +${a.meleeCrit}%`);
    if (a.rangedCrit) lines.push(`遠距離爆擊率 +${a.rangedCrit}%`);
    if (a.mhp) lines.push(`最大 HP +${a.mhp}`);
    return lines;
  }

  // 由 js/02-stats-recompute.js 在正式 recomputeStats() 尾段呼叫。
  // 回傳 attackSpeedPct 給既有 spdMult 管線，避免直接覆蓋 d.aspd。
  function applyTransformCombatStats(p, d) {
    try {
      if (!p || !d) return null;
      if (typeof applyTransformCollectionStats === 'function') applyTransformCollectionStats(p, d);
      if (!p.transformId) return null;
      const card = cardById(p.transformId);
      if (!card || card.cls !== p.cls || ownedCount(card.id) <= 0) return null;
      const a = transformAbilityData(card);
      if (!a) return null;

      if (a.meleeDmg) d.meleeDmg += a.meleeDmg;
      if (a.meleeHit) d.meleeHit += a.meleeHit;
      if (a.rangedDmg) d.rangedDmg += a.rangedDmg;
      if (a.rangedHit) d.rangedHit += a.rangedHit;
      if (a.magicDmg) d.magicDmg += a.magicDmg;
      if (a.magicHit) d.magicHit += a.magicHit;
      if (a.extraDmg) d.extraDmg += a.extraDmg;
      if (a.extraMp) d.extraMp += a.extraMp;
      if (a.dr) d.dr += a.dr;
      if (a.meleeCrit) d.meleeCrit += a.meleeCrit;
      if (a.rangedCrit) d.rangedCrit += a.rangedCrit;
      if (a.mhp) p.mhp += a.mhp;

      if (a.castSpdPct) {
        const m = 1 + a.castSpdPct / 100;
        if (d.castLock != null) d.castLock = Math.max(1, d.castLock / m);
        if (d.supportCastLock != null) d.supportCastLock = Math.max(1, d.supportCastLock / m);
      }

      return { attackSpeedPct: a.atkSpdPct || 0, card: card, stats: a };
    } catch (e) {
      console.warn('[transform] applyTransformCombatStats failed', e);
      return null;
    }
  }

  // ===== Phase 5：變身收藏套組 =====
  // 收藏判定只看「是否曾取得並仍保留至少 1 張」。
  // Phase 4 合成只吃重複張數，因此第一張永遠保留，已完成收藏不會被拆掉。
  const TRANSFORM_COLLECTIONS = [
    {
      id:'col_all_red', name:'英雄集結', desc:'8 職紅變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'red').map(c => c.id),
      bonus:{ mhp:100, meleeHit:1, rangedHit:1, magicHit:1 }
    },
    {
      id:'col_all_purple', name:'傳說集結', desc:'8 職紫變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'purple').map(c => c.id),
      bonus:{ mhp:100, meleeDmg:1, rangedDmg:1, magicDmg:1 }
    },
    {
      id:'col_all_gold', name:'神話集結', desc:'8 職金變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'gold').map(c => c.id),
      bonus:{ meleeDmg:2, rangedDmg:2, magicDmg:2, meleeHit:2, rangedHit:2, magicHit:2, dr:1 }
    },
    {
      id:'col_all_cyan', name:'唯一集結', desc:'8 職青變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'cyan').map(c => c.id),
      bonus:{ mhp:300, meleeDmg:3, rangedDmg:3, magicDmg:3, meleeHit:3, rangedHit:3, magicHit:3, dr:2 }
    },
    {
      id:'col_royal_line', name:'王者之路', desc:'王族紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'royal').map(c => c.id),
      bonus:{ extraDmg:2, extraHit:1 }
    },
    {
      id:'col_knight_line', name:'不落之盾', desc:'騎士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'knight').map(c => c.id),
      bonus:{ meleeDmg:2, dr:1 }
    },
    {
      id:'col_elf_line', name:'蒼穹獵手', desc:'妖精紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'elf').map(c => c.id),
      bonus:{ rangedDmg:2, rangedHit:1 }
    },
    {
      id:'col_mage_line', name:'奧術真理', desc:'法師紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'mage').map(c => c.id),
      bonus:{ magicDmg:2, magicHit:1, extraMp:1 }
    },
    {
      id:'col_dark_line', name:'暗夜獵殺', desc:'黑暗妖精紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'dark').map(c => c.id),
      bonus:{ meleeDmg:2, meleeCrit:2 }
    },
    {
      id:'col_dragon_line', name:'龍魂覺醒', desc:'龍騎士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'dragon').map(c => c.id),
      bonus:{ meleeDmg:2, extraHit:1 }
    },
    {
      id:'col_illusion_line', name:'夢界共鳴', desc:'幻術士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'illusion').map(c => c.id),
      bonus:{ magicDmg:2, magicHit:1, extraMp:1 }
    },
    {
      id:'col_warrior_line', name:'泰坦之血', desc:'戰士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'warrior').map(c => c.id),
      bonus:{ mhp:150, dr:1 }
    }
  ];

  // ===== Phase 4：重複變身合成設定 =====
  // 每次只消耗「重複張數」：每一種變身的第一張永遠保留。
  // 失敗返還 1 張隨機同階卡；成功取得 1 張隨機下一階。
  const TRANSFORM_FUSION_CONFIG = {
    red:    { next:'purple', need:4, success:0.30, pity:5  },
    purple: { next:'gold',   need:4, success:0.20, pity:7  },
    gold:   { next:'cyan',   need:4, success:0.10, pity:10 }
  };

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
      version: 2,
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
      state.version = 2;
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
    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
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
    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}
    render();
    return true;
  }

  function unequip() {
    const p = ensurePlayer();
    if (!p) return false;
    p.transformId = null;
    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
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

  // ===== 掉落道具定義 =====
  function ensureTransformCardItem() {
    try {
      if (typeof DB === 'undefined' || !DB.items) return false;
      DB.items[TRANSFORM_CARD_ITEM_ID] = {
        n: '變身卡',
        type: 'etc',
        eff: 'transform_card',
        p: 0,
        gachaWeight: 0,
        noSell: true,
        c: 'text-cyan-300',
        d: '全地圖怪物都有機率掉落。使用後隨機取得紅變、紫變、金變或青變；重複變身會累積，之後可用於合成。'
      };
      return true;
    } catch(e) { return false; }
  }

  function rollOpenTier() {
    let r = Math.random();
    let acc = 0;
    for (const row of TRANSFORM_OPEN_RATES) {
      acc += row.rate;
      if (r < acc) return row.tier;
    }
    return 'red';
  }

  function randomCardOfTier(tier) {
    const pool = TRANSFORM_CARDS.filter(c => c.tier === tier);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)] || pool[0];
  }

  function useTransformCardItem(item, silent) {
    if (!item || item.id !== TRANSFORM_CARD_ITEM_ID) return false;
    if (silent) return false;

    const tier = rollOpenTier();
    const card = randomCardOfTier(tier);
    if (!card) {
      try { logSys('<span class="text-red-400">變身卡開啟失敗：此階級沒有可抽取的變身。</span>'); } catch(e) {}
      return false;
    }

    const before = ownedCount(card.id);

    item.cnt = Math.max(0, (Number(item.cnt) || 1) - 1);
    if (item.cnt <= 0) {
      try { player.inv = player.inv.filter(i => i.uid !== item.uid); } catch(e) {}
    }

    grant(card.id, 1);

    const ti = TRANSFORM_TIERS[card.tier];
    const ci = TRANSFORM_CLASSES[card.cls];
    const dup = before > 0 ? ` <span class="text-slate-400">（重複 ×${before + 1}）</span>` : ' <span class="text-emerald-300">（首次取得）</span>';

    try {
      logSys(
        `<span style="color:${ti.color};font-weight:700">🧙 開啟變身卡！【${ti.short}】${esc(card.name)}</span>` +
        ` <span class="text-slate-300">${ci.icon} ${esc(ci.name)}</span>${dup}`
      );
    } catch(e) {}

    try { if (typeof renderTabs === 'function') renderTabs(); } catch(e) {}
    try { if (typeof updateUI === 'function') updateUI(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}
    try {
      const modal = document.getElementById('item-modal');
      if (modal && !modal.classList.contains('hidden') && typeof closeModal === 'function') closeModal();
    } catch(e) {}

    return true;
  }

  // 原 useItem 之前攔截「變身卡」。
  function hookUseItem() {
    try {
      if (typeof window.useItem !== 'function') return;
      if (window.useItem.__transformCardHook) return;

      const base = window.useItem;
      const hooked = function(u, silent=false) {
        let item = null;
        try { item = player && Array.isArray(player.inv) ? player.inv.find(i => i.uid === u) : null; } catch(e) {}
        if (item && item.id === TRANSFORM_CARD_ITEM_ID) {
          if (player && player.dead) {
            if (!silent && typeof logSys === 'function') logSys('死亡狀態無法使用變身卡。');
            return;
          }
          return useTransformCardItem(item, silent);
        }
        return base.apply(this, arguments);
      };
      hooked.__transformCardHook = true;
      hooked.__transformCardBase = base;
      window.useItem = hooked;
    } catch(e) {
      console.warn('[transform] hookUseItem failed', e);
    }
  }

  // 每一隻正常結算死亡的地圖怪物，獨立擲 0.2%。
  function maybeDropTransformCard(mob) {
    if (!mob) return false;
    if (Math.random() >= TRANSFORM_CARD_DROP_RATE) return false;
    if (typeof gainItem !== 'function') return false;

    try {
      const got = gainItem(TRANSFORM_CARD_ITEM_ID, 1, true, true);
      if (!got) return false;

      if (typeof logSys === 'function') {
        logSys(`<span class="text-cyan-300 font-bold">🧙 ${esc(mob.n || '怪物')} 掉落了「變身卡」！</span>`);
      }
      return true;
    } catch(e) {
      console.warn('[transform] card drop failed', e);
      return false;
    }
  }

  // 用 killMob 包裝，不改原核心檔：
  // ・中間變身階段（transformTo）不掉
  // ・只有原 mob 最終真的被標成 _dead 才擲卡
  function hookKillMob() {
    try {
      if (typeof window.killMob !== 'function') return;
      if (window.killMob.__transformDropHook) return;

      const base = window.killMob;
      const hooked = function(idx) {
        let mob = null;
        let wasDead = true;
        let isTransformStage = false;

        try {
          mob = (typeof mapState !== 'undefined' && mapState.mobs) ? mapState.mobs[idx] : null;
          wasDead = !mob || !!mob._dead;
          isTransformStage = !!(mob && mob.transformTo && typeof DB !== 'undefined' && DB.mobs && DB.mobs[mob.transformTo]);
        } catch(e) {}

        const out = base.apply(this, arguments);

        try {
          if (mob && !wasDead && !isTransformStage && mob._dead) {
            maybeDropTransformCard(mob);
          }
        } catch(e) {
          console.warn('[transform] post-kill drop failed', e);
        }

        return out;
      };

      hooked.__transformDropHook = true;
      hooked.__transformDropBase = base;
      window.killMob = hooked;
    } catch(e) {
      console.warn('[transform] hookKillMob failed', e);
    }
  }

  // ===== Phase 5：收藏能力核心 =====
  function transformCollectionProgress(col) {
    if (!col || !Array.isArray(col.cards)) return { have:0, need:0, complete:false };
    let have = 0;
    for (const id of col.cards) if (ownedCount(id) > 0) have++;
    return { have, need:col.cards.length, complete:col.cards.length > 0 && have >= col.cards.length };
  }

  function completedTransformCollectionIds() {
    return TRANSFORM_COLLECTIONS
      .filter(col => transformCollectionProgress(col).complete)
      .map(col => col.id);
  }

  function collectionBonusText(b) {
    if (!b) return [];
    const out = [];
    if (b.mhp) out.push(`最大 HP +${b.mhp}`);
    if (b.meleeDmg) out.push(`近距離傷害 +${b.meleeDmg}`);
    if (b.rangedDmg) out.push(`遠距離傷害 +${b.rangedDmg}`);
    if (b.magicDmg) out.push(`魔法傷害 +${b.magicDmg}`);
    if (b.meleeHit) out.push(`近距離命中 +${b.meleeHit}`);
    if (b.rangedHit) out.push(`遠距離命中 +${b.rangedHit}`);
    if (b.magicHit) out.push(`魔法命中 +${b.magicHit}`);
    if (b.extraDmg) out.push(`額外傷害 +${b.extraDmg}`);
    if (b.extraHit) out.push(`額外命中 +${b.extraHit}`);
    if (b.extraMp) out.push(`額外魔法點數 +${b.extraMp}`);
    if (b.dr) out.push(`傷害減免 +${b.dr}`);
    if (b.meleeCrit) out.push(`近距離爆擊率 +${b.meleeCrit}%`);
    return out;
  }

  function applyTransformCollectionStats(p, d) {
    if (!p || !d) return;
    for (const col of TRANSFORM_COLLECTIONS) {
      if (!transformCollectionProgress(col).complete) continue;
      const b = col.bonus || {};
      if (b.mhp) p.mhp += b.mhp;
      if (b.meleeDmg) d.meleeDmg += b.meleeDmg;
      if (b.rangedDmg) d.rangedDmg += b.rangedDmg;
      if (b.magicDmg) d.magicDmg += b.magicDmg;
      if (b.meleeHit) d.meleeHit += b.meleeHit;
      if (b.rangedHit) d.rangedHit += b.rangedHit;
      if (b.magicHit) d.magicHit += b.magicHit;
      if (b.extraDmg) d.extraDmg += b.extraDmg;
      if (b.extraHit) d.extraHit += b.extraHit;
      if (b.extraMp) d.extraMp += b.extraMp;
      if (b.dr) d.dr += b.dr;
      if (b.meleeCrit) d.meleeCrit += b.meleeCrit;
    }
  }

  // ===== Phase 4：合成核心 =====
  function fusionStateFor(tier) {
    const s = loadState();
    if (!s.fusion || typeof s.fusion !== 'object') s.fusion = {};
    if (!s.fusion[tier] || typeof s.fusion[tier] !== 'object') s.fusion[tier] = { fail:0 };
    s.fusion[tier].fail = Math.max(0, Math.floor(Number(s.fusion[tier].fail) || 0));
    return s.fusion[tier];
  }

  function fusionMaterialCount(tier) {
    return TRANSFORM_CARDS
      .filter(c => c.tier === tier)
      .reduce((sum, c) => sum + Math.max(0, ownedCount(c.id) - 1), 0);
  }

  function consumeFusionMaterials(tier, need) {
    const s = loadState();
    let remain = Math.max(0, Math.floor(Number(need) || 0));
    const cards = TRANSFORM_CARDS.filter(c => c.tier === tier);

    const available = cards.reduce((sum, c) => {
      const n = Math.max(0, Math.floor(Number(s.owned[c.id] || 0)));
      return sum + Math.max(0, n - 1);
    }, 0);
    if (available < remain) return false;

    for (const c of cards) {
      if (remain <= 0) break;
      const n = Math.max(0, Math.floor(Number(s.owned[c.id] || 0)));
      const extra = Math.max(0, n - 1);
      if (!extra) continue;
      const take = Math.min(extra, remain);
      s.owned[c.id] = n - take;
      remain -= take;
    }
    return remain === 0;
  }

  function addFusionReward(card, count) {
    if (!card) return false;
    const s = loadState();
    const n = Math.max(1, Math.floor(Number(count) || 1));
    s.owned[card.id] = Math.max(0, Math.floor(Number(s.owned[card.id] || 0))) + n;
    return true;
  }

  function transformFuse(tier) {
    const cfg = TRANSFORM_FUSION_CONFIG[tier];
    if (!cfg) return false;

    const mats = fusionMaterialCount(tier);
    if (mats < cfg.need) {
      try {
        if (typeof logSys === 'function') {
          logSys(`<span class="text-amber-300">合成需要 ${cfg.need} 張${TRANSFORM_TIERS[tier].short}重複卡，目前只有 ${mats} 張。</span>`);
        }
      } catch(e) {}
      render();
      return false;
    }

    const rec = fusionStateFor(tier);
    const guaranteed = rec.fail >= (cfg.pity - 1);

    if (!consumeFusionMaterials(tier, cfg.need)) return false;

    const success = guaranteed || Math.random() < cfg.success;
    let result = null;

    if (success) {
      result = randomCardOfTier(cfg.next);
      if (!result) return false;
      addFusionReward(result, 1);
      rec.fail = 0;
    } else {
      result = randomCardOfTier(tier);
      if (result) addFusionReward(result, 1);
      rec.fail = Math.min(cfg.pity - 1, rec.fail + 1);
    }

    saveState();
    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}

    try {
      const ti = TRANSFORM_TIERS[result.tier];
      const ci = TRANSFORM_CLASSES[result.cls];
      if (typeof logSys === 'function') {
        if (success) {
          logSys(
            `<span style="color:${ti.color};font-weight:700">🔥 變身合成成功！獲得【${ti.short}】${esc(result.name)}</span>` +
            ` <span class="text-slate-300">${ci.icon} ${esc(ci.name)}</span>` +
            (guaranteed ? ' <span class="text-amber-300">（保底成功）</span>' : '')
          );
        } else {
          logSys(
            `<span class="text-slate-300">🔥 變身合成失敗，返還 1 張</span>` +
            `<span style="color:${ti.color};font-weight:700">【${ti.short}】${esc(result.name)}</span>` +
            ` <span class="text-slate-400">保底 ${rec.fail}/${cfg.pity}</span>`
          );
        }
      }
    } catch(e) {}

    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}
    render();
    return success;
  }

  // ===== UI =====
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

  function renderTabsTop() {
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
    const cards = TRANSFORM_CARDS
      .filter(c => ownedCount(c.id) > 0 && (!p || !p.cls || c.cls === p.cls || c.cls === 'all'))
      .sort((a,b) => (TRANSFORM_TIERS[b.tier].order - TRANSFORM_TIERS[a.tier].order));

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
        目前沒有此職業可使用的變身卡。<br>
        <span class="text-xs">全地圖怪物都有機率掉落「變身卡」，開啟後隨機取得變身。</span>
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
          <div class="text-xs text-amber-200 mt-3">${transformAbilityLines(c).map(x=>esc(x)).join(' ／ ')}</div>
          <button class="btn w-full mt-3 py-2 ${active?'bg-cyan-900':'bg-slate-700'}"
                  ${active?'disabled':''}
                  onclick="transformEquip('${c.id}')">${active?'目前使用中':'套用變身'}</button>
        </div>`;
    }).join('');
    html += '</div>';
    return html;
  }

  function renderFusionPage() {
    const rows = [
      { tier:'red',    title:'紅變 → 紫變' },
      { tier:'purple', title:'紫變 → 金變' },
      { tier:'gold',   title:'金變 → 青變' }
    ];

    return `
      <div class="mb-4 rounded-xl border border-purple-800/50 bg-purple-950/20 p-4">
        <div class="text-xl font-bold text-purple-300">🔥 變身合成</div>
        <div class="text-sm text-slate-300 mt-2">
          每次消耗 4 張同階「重複變身」。每種變身的第一張永久保留，不會被合成吃掉。
          合成失敗會返還 1 張隨機同階變身，並累積保底。
        </div>
      </div>
      <div class="grid grid-cols-1 gap-3">
        ${rows.map(row => {
          const cfg = TRANSFORM_FUSION_CONFIG[row.tier];
          const ti = TRANSFORM_TIERS[row.tier];
          const ni = TRANSFORM_TIERS[cfg.next];
          const mats = fusionMaterialCount(row.tier);
          const rec = fusionStateFor(row.tier);
          const can = mats >= cfg.need;
          const nextGuaranteed = rec.fail >= cfg.pity - 1;
          return `
            <div class="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-lg font-bold">
                    <span style="color:${ti.color}">${ti.short}</span>
                    <span class="text-slate-400"> → </span>
                    <span style="color:${ni.color}">${ni.short}</span>
                  </div>
                  <div class="text-sm text-slate-400 mt-1">${esc(row.title)}</div>
                </div>
                <div class="text-right text-sm">
                  <div class="${mats >= cfg.need ? 'text-emerald-300' : 'text-slate-400'}">重複素材 ${mats} / ${cfg.need}</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
                <div class="rounded-lg bg-slate-900/70 p-3">
                  <div class="text-slate-500">成功率</div>
                  <div class="font-bold text-lg">${Math.round(cfg.success * 100)}%</div>
                </div>
                <div class="rounded-lg bg-slate-900/70 p-3">
                  <div class="text-slate-500">失敗保底</div>
                  <div class="font-bold text-lg ${nextGuaranteed ? 'text-amber-300' : ''}">
                    ${rec.fail} / ${cfg.pity}${nextGuaranteed ? '（下次必成）' : ''}
                  </div>
                </div>
              </div>

              <div class="text-xs text-slate-400 mt-3">
                成功：隨機獲得 1 張${ni.short}（八職皆可能）<br>
                失敗：返還 1 張隨機${ti.short}，並累積 1 次保底。
              </div>

              <button class="btn w-full mt-4 py-3 font-bold ${can ? 'bg-purple-800 text-purple-100' : 'bg-slate-800 text-slate-500'}"
                      ${can ? '' : 'disabled'}
                      onclick="transformFuse('${row.tier}')">
                ${can ? `🔥 合成 ${row.title}` : `還缺 ${Math.max(0, cfg.need - mats)} 張重複卡`}
              </button>
            </div>`;
        }).join('')}
      </div>`;
  }

  function renderCollectionPage() {
    const effects = `
      <div class="mb-5">
        <div class="text-lg font-bold text-amber-300 mb-2">✨ 收藏效果</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${TRANSFORM_COLLECTIONS.map(col => {
            const pr = transformCollectionProgress(col);
            const done = pr.complete;
            return `
              <div class="rounded-xl border ${done ? 'border-emerald-600/70' : 'border-slate-700'} bg-slate-800/70 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="font-bold ${done ? 'text-emerald-300' : 'text-slate-200'}">
                      ${done ? '✅' : '🔒'} ${esc(col.name)}
                    </div>
                    <div class="text-xs text-slate-400 mt-1">${esc(col.desc)}</div>
                  </div>
                  <div class="text-sm font-bold ${done ? 'text-emerald-300' : 'text-slate-500'}">${pr.have}/${pr.need}</div>
                </div>
                <div class="text-xs mt-3 ${done ? 'text-amber-200' : 'text-slate-500'}">
                  ${collectionBonusText(col.bonus).map(x => esc(x)).join(' ／ ')}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;

    const cards = `<div>
      <div class="text-lg font-bold text-cyan-300 mb-2">📚 變身圖鑑</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${
        Object.keys(TRANSFORM_CLASSES).map(k => {
          const ci = TRANSFORM_CLASSES[k];
          const list = TRANSFORM_CARDS
            .filter(c => c.cls === k)
            .sort((a,b) => TRANSFORM_TIERS[a.tier].order - TRANSFORM_TIERS[b.tier].order);
          return `
            <div class="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <div class="font-bold text-lg mb-2">${ci.icon} ${esc(ci.name)}</div>
              ${list.map(c => `
                <div class="flex items-center justify-between gap-3 py-2 border-t border-slate-700">
                  <div>${badge(c)} ${esc(c.name)}</div>
                  <div class="text-sm ${ownedCount(c.id)?'text-emerald-300':'text-slate-600'}">
                    ${ownedCount(c.id)?'已取得 × '+ownedCount(c.id):'未取得'}
                  </div>
                </div>`).join('')}
            </div>`;
        }).join('')
      }</div>
    </div>`;

    return effects + cards;
  }

  function renderAbilityPage() {
    const cur = current();
    const odds = TRANSFORM_OPEN_RATES.map(r => {
      const t = TRANSFORM_TIERS[r.tier];
      return `<span style="color:${t.color};font-weight:700">${t.short} ${(r.rate*100).toFixed(r.rate < 0.01 ? 1 : 0)}%</span>`;
    }).join(' ／ ');

    return `
      <div class="rounded-xl border border-cyan-900/60 bg-cyan-950/10 p-5">
        <div class="text-xl font-bold text-cyan-300 mb-3">📊 變身能力</div>
        ${cur ? `<div class="text-lg">${badge(cur)} ${esc(cur.name)}</div><div class="text-slate-300 mt-2">${transformAbilityLines(cur).map(x=>esc(x)).join('<br>')}</div>` : '<div class="text-slate-500">目前未套用變身。</div>'}
        <div class="mt-4 p-3 rounded-lg bg-slate-800 text-sm">
          <div class="text-cyan-200 font-bold">變身卡取得</div>
          <div class="text-slate-300 mt-1">全地圖怪物：每隻 ${(TRANSFORM_CARD_DROP_RATE*100).toFixed(1)}% 機率掉落。</div>
          <div class="text-slate-300 mt-1">開卡機率：${odds}</div>
        </div>
        <div class="mt-3 p-3 rounded-lg bg-slate-800 text-sm text-amber-200">
          Phase 3 已接入正式戰鬥能力；套用／解除變身會立即重算角色能力。
        </div>
      </div>`;
  }

  function render() {
    ensureDom();
    renderTabsTop();
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
    ensureTransformCardItem();
    ensureDom();
    ensureCollectionButton();
    hookUseItem();
    hookKillMob();
    try { if (typeof calcStats === 'function' && typeof player !== 'undefined' && player && player.cls) calcStats(); } catch(e) {}
  }

  window.TRANSFORM_TIERS = TRANSFORM_TIERS;
  window.TRANSFORM_CLASSES = TRANSFORM_CLASSES;
  window.TRANSFORM_CARDS = TRANSFORM_CARDS;
  window.TRANSFORM_CARD_DROP_RATE = TRANSFORM_CARD_DROP_RATE;
  window.TRANSFORM_OPEN_RATES = TRANSFORM_OPEN_RATES;
  window.TRANSFORM_TIER_POWER = TRANSFORM_TIER_POWER;
  window.transformAbilityData = transformAbilityData;
  window.transformAbilityLines = transformAbilityLines;
  window.applyTransformCombatStats = applyTransformCombatStats;

  window.TRANSFORM_COLLECTIONS = TRANSFORM_COLLECTIONS;
  window.transformCollectionProgress = transformCollectionProgress;
  window.transformCompletedCollections = completedTransformCollectionIds;
  window.applyTransformCollectionStats = applyTransformCollectionStats;

  window.transformFuse = transformFuse;
  window.transformFusionMaterialCount = fusionMaterialCount;
  window.TRANSFORM_FUSION_CONFIG = TRANSFORM_FUSION_CONFIG;

  window.transformGrant = grant;
  window.transformOwnedCount = ownedCount;
  window.transformEquip = equip;
  window.transformUnequip = unequip;
  window.transformCurrent = current;
  window.transformOpenCard = function () {
    const item = player && Array.isArray(player.inv) ? player.inv.find(i => i.id === TRANSFORM_CARD_ITEM_ID) : null;
    return item ? useTransformCardItem(item, false) : false;
  };

  window.openTransformBook = openTransformBook;
  window.closeTransformBook = closeTransformBook;
  window.setTransformPage = setTransformPage;
  window.renderTransformBook = render;
  window.initTransformSystem = init;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

