// ===== 🧙 天堂M風格變身系統 Phase 15 =====
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

  // 使用變身卡後的階級權重。
  // 顯示：紅95%／紫4%／金1%／青0.01%。
  // 因四項合計 100.01，抽選時會以總權重正規化，避免機率判定超過 100%。
  const TRANSFORM_OPEN_RATES = [
    { tier:'red',    rate:95.00 },
    { tier:'purple', rate:4.00  },
    { tier:'gold',   rate:1.00  },
    { tier:'cyan',   rate:0.01  }
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

  // ===== 8 職：紅2＋紫2＋金2＋青1 = 56 張 =====
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

    // 紅變・第二系列
    { id:'tr_red_royal_02',    name:'烈陽皇胄',     tier:'red', cls:'royal',    planned:'近傷／命中／隊伍增益' },
    { id:'tr_red_knight_02',   name:'鐵壁劍皇',     tier:'red', cls:'knight',   planned:'近傷／命中／減傷' },
    { id:'tr_red_elf_02',      name:'月影神射',     tier:'red', cls:'elf',      planned:'遠傷／遠命／連射強化' },
    { id:'tr_red_mage_02',     name:'秘法賢者',     tier:'red', cls:'mage',     planned:'魔攻／魔命／施法速度' },
    { id:'tr_red_dark_02',     name:'血月夜刃',     tier:'red', cls:'dark',     planned:'近傷／暴擊／雙擊強化' },
    { id:'tr_red_dragon_02',   name:'龍牙戰將',     tier:'red', cls:'dragon',   planned:'近傷／命中／弱點曝光強化' },
    { id:'tr_red_illusion_02', name:'幻夢支配者',   tier:'red', cls:'illusion', planned:'魔攻／魔命／幻術技能強化' },
    { id:'tr_red_warrior_02',  name:'泰坦狂戰',     tier:'red', cls:'warrior',  planned:'近傷／HP／反擊強化' },

    // 紫變
    { id:'tr_purple_royal_01',    name:'黎明帝王',       tier:'purple', cls:'royal',    planned:'近傷／命中／統御強化' },
    { id:'tr_purple_knight_01',   name:'深淵劍聖',       tier:'purple', cls:'knight',   planned:'近傷／命中／減傷強化' },
    { id:'tr_purple_elf_01',      name:'蒼穹神弓',       tier:'purple', cls:'elf',      planned:'遠傷／遠命／連射增幅' },
    { id:'tr_purple_mage_01',     name:'奧術大賢者',     tier:'purple', cls:'mage',     planned:'魔攻／魔命／施法速度強化' },
    { id:'tr_purple_dark_01',     name:'月蝕暗殺者',     tier:'purple', cls:'dark',     planned:'近傷／暴擊／雙擊增幅' },
    { id:'tr_purple_dragon_01',   name:'蒼龍戰將',       tier:'purple', cls:'dragon',   planned:'近傷／命中／弱點傷害增幅' },
    { id:'tr_purple_illusion_01', name:'虛界操演者',     tier:'purple', cls:'illusion', planned:'魔攻／魔命／幻術增幅' },
    { id:'tr_purple_warrior_01',  name:'泰坦戰神',       tier:'purple', cls:'warrior',  planned:'近傷／HP／反擊增幅' },

    // 紫變・第二系列
    { id:'tr_purple_royal_02',    name:'紫電霸主',       tier:'purple', cls:'royal',    planned:'近傷／命中／統御強化' },
    { id:'tr_purple_knight_02',   name:'神鋼守護',       tier:'purple', cls:'knight',   planned:'近傷／命中／減傷強化' },
    { id:'tr_purple_elf_02',      name:'翡翠風使',       tier:'purple', cls:'elf',      planned:'遠傷／遠命／連射增幅' },
    { id:'tr_purple_mage_02',     name:'次元大法師',     tier:'purple', cls:'mage',     planned:'魔攻／魔命／施法速度強化' },
    { id:'tr_purple_dark_02',     name:'幽冥夜刃',       tier:'purple', cls:'dark',     planned:'近傷／暴擊／雙擊增幅' },
    { id:'tr_purple_dragon_02',   name:'真龍鬥將',       tier:'purple', cls:'dragon',   planned:'近傷／命中／弱點傷害增幅' },
    { id:'tr_purple_illusion_02', name:'星夢幻主',       tier:'purple', cls:'illusion', planned:'魔攻／魔命／幻術增幅' },
    { id:'tr_purple_warrior_02',  name:'破軍泰坦',       tier:'purple', cls:'warrior',  planned:'近傷／HP／反擊增幅' },

    // 金變
    { id:'tr_gold_royal_01',    name:'神聖霸王',     tier:'gold', cls:'royal',    planned:'統御被動／近傷／命中' },
    { id:'tr_gold_knight_01',   name:'永恆聖騎',     tier:'gold', cls:'knight',   planned:'守護被動／近傷／減傷' },
    { id:'tr_gold_elf_01',      name:'天穹箭神',     tier:'gold', cls:'elf',      planned:'追加箭矢／遠傷／遠命' },
    { id:'tr_gold_mage_01',     name:'元素主宰',     tier:'gold', cls:'mage',     planned:'魔法共鳴／魔攻／魔命' },
    { id:'tr_gold_dark_01',     name:'無影冥皇',     tier:'gold', cls:'dark',     planned:'雙擊增幅／近傷／暴擊' },
    { id:'tr_gold_dragon_01',   name:'龍魂霸者',     tier:'gold', cls:'dragon',   planned:'弱點爆發／近傷／命中' },
    { id:'tr_gold_illusion_01', name:'萬象幻神',     tier:'gold', cls:'illusion', planned:'幻術共鳴／魔攻／魔命' },
    { id:'tr_gold_warrior_01',  name:'不滅泰坦',     tier:'gold', cls:'warrior',  planned:'泰坦反擊／HP／近傷' },

    // 金變・第二系列
    { id:'tr_gold_royal_02',    name:'黃金聖王',     tier:'gold', cls:'royal',    planned:'統御被動／近傷／命中' },
    { id:'tr_gold_knight_02',   name:'日耀聖騎',     tier:'gold', cls:'knight',   planned:'守護被動／近傷／減傷' },
    { id:'tr_gold_elf_02',      name:'光翼箭神',     tier:'gold', cls:'elf',      planned:'追加箭矢／遠傷／遠命' },
    { id:'tr_gold_mage_02',     name:'星辰法皇',     tier:'gold', cls:'mage',     planned:'魔法共鳴／魔攻／魔命' },
    { id:'tr_gold_dark_02',     name:'日蝕冥王',     tier:'gold', cls:'dark',     planned:'雙擊增幅／近傷／暴擊' },
    { id:'tr_gold_dragon_02',   name:'天龍霸主',     tier:'gold', cls:'dragon',   planned:'弱點爆發／近傷／命中' },
    { id:'tr_gold_illusion_02', name:'虛空幻神',     tier:'gold', cls:'illusion', planned:'幻術共鳴／魔攻／魔命' },
    { id:'tr_gold_warrior_02',  name:'神力泰坦',     tier:'gold', cls:'warrior',  planned:'泰坦反擊／HP／近傷' },

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
    if (card.tier === 'cyan' && CYAN_TRANSFORM_SPECIALS[card.cls]) {
      const sp = CYAN_TRANSFORM_SPECIALS[card.cls];
      lines.push(`專屬【${sp.name}】：${sp.text}`);
    }
    return lines;
  }

  // 由 js/02-stats-recompute.js 在正式 recomputeStats() 尾段呼叫。
  // 回傳 attackSpeedPct 給既有 spdMult 管線，避免直接覆蓋 d.aspd。
  function applyTransformCombatStats(p, d) {
    try {
      if (!p || !d) return null;
      d._cyanTransform = '';
      if (typeof applyTransformCollectionStats === 'function') applyTransformCollectionStats(p, d);
      if (!p.transformId) return null;
      const card = cardById(p.transformId);
      if (!card || card.cls !== p.cls || ownedCount(card.id) <= 0) return null;
      const a = transformAbilityData(card);
      if (!a) return null;

      d._cyanTransform = card.tier === 'cyan' ? card.cls : '';

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

  // ===== Phase 6：青變專屬能力 =====
  const CYAN_TRANSFORM_SPECIALS = {
    royal: { name:'天命統御', text:'傭兵／召喚傷害 +10%；近戰 10% 機率追加 50% 傷害' },
    knight:{ name:'終焉守護', text:'受到一般物理傷害 -15%' },
    elf:   { name:'星界連射', text:'遠距離一般攻擊 15% 機率追加 50% 傷害' },
    mage:  { name:'真理共鳴', text:'最終魔法傷害 +20%' },
    dark:  { name:'虛無追擊', text:'近距離一般攻擊 12% 機率追加 100% 傷害' },
    dragon:{ name:'龍魂破綻', text:'近距離一般攻擊 15% 機率追加 50% 傷害，並追加 2 層弱點' },
    illusion:{ name:'夢界共鳴', text:'奇古獸／魔法最終傷害 +20%' },
    warrior:{ name:'泰坦反擊', text:'受到一般攻擊 15% 機率反射同額傷害，並免疫該次攻擊' }
  };

  function isCyanTransformActive(cls) {
    try {
      if (typeof player === 'undefined' || !player || player.cls !== cls || !player.transformId) return false;
      const c = cardById(player.transformId);
      return !!(c && c.tier === 'cyan' && c.cls === cls && ownedCount(c.id) > 0);
    } catch(e) { return false; }
  }

  function cyanTransformMagicMult(dStats) {
    try {
      if (typeof player === 'undefined' || !player || !player.d || dStats !== player.d) return 1;
      if (isCyanTransformActive('mage') || isCyanTransformActive('illusion')) return 1.20;
    } catch(e) {}
    return 1;
  }

  function cyanTransformIncomingPhysicalMult() {
    return isCyanTransformActive('knight') ? 0.85 : 1;
  }

  function applyCyanTransformPhysicalProc(p, target, result) {
    if (!p || !target || !result || !result.hit || !p.transformId) return;
    const c = cardById(p.transformId);
    if (!c || c.tier !== 'cyan' || c.cls !== p.cls || ownedCount(c.id) <= 0) return;

    let extra = 0;
    let msg = '';

    if (p.cls === 'royal' && !result.ranged && Math.random() < 0.10) {
      extra = Math.max(1, Math.floor(result.dmg * 0.50));
      result.dmg += extra;
      msg = `【天命統御】王者威壓爆發，追加 ${extra} 點傷害！`;
    } else if (p.cls === 'elf' && result.ranged && Math.random() < 0.15) {
      extra = Math.max(1, Math.floor(result.dmg * 0.50));
      result.dmg += extra;
      msg = `【星界連射】追加一箭，額外造成 ${extra} 點傷害！`;
    } else if (p.cls === 'dark' && !result.ranged && Math.random() < 0.12) {
      extra = Math.max(1, Math.floor(result.dmg));
      result.dmg += extra;
      msg = `【虛無追擊】影刃再次斬擊，追加 ${extra} 點傷害！`;
    } else if (p.cls === 'dragon' && !result.ranged && Math.random() < 0.15) {
      extra = Math.max(1, Math.floor(result.dmg * 0.50));
      result.dmg += extra;
      target.weakExpose = Math.min(5, Math.max(0, Number(target.weakExpose) || 0) + 2);
      msg = `【龍魂破綻】龍魂撕裂弱點，追加 ${extra} 點傷害並增加 2 層弱點！`;
    }

    if (msg && typeof logCombat === 'function') {
      logCombat(`<span class="font-bold" style="color:#22d3ee;text-shadow:0 0 6px #0891b2;">${msg}</span>`, 'player-special');
    }
  }

  function cyanTransformTryWarriorReflect(p, mob, totalDmg, idx) {
    if (!p || !mob || !(totalDmg > 0) || !isCyanTransformActive('warrior')) return false;
    if (Math.random() >= 0.15) return false;

    let mult = 1;
    try { if (typeof fragileMult === 'function') mult = fragileMult(mob); } catch(e) {}
    const reflect = Math.max(1, Math.floor(totalDmg * mult));
    mob.curHp -= reflect;
    mob.justHit = 'normal';
    try { if (typeof mobWake === 'function') mobWake(mob); } catch(e) {}

    if (typeof logCombat === 'function') {
      logCombat(
        `<span class="font-bold" style="color:#22d3ee;text-shadow:0 0 6px #0891b2;">【泰坦反擊】</span>` +
        `<span class="${typeof getMobColor === 'function' ? getMobColor(mob.lv) : ''}">${mob.n}</span>` +
        ` 承受 ${reflect} 點反擊傷害，你免疫了此次攻擊！`,
        'player-special'
      );
    }

    if (mob.curHp <= 0 && typeof killMob === 'function') {
      try { killMob(idx); } catch(e) {}
    }
    return true;
  }

  // ===== Phase 5：變身收藏套組 =====
  // 收藏判定只看「是否曾取得並仍保留至少 1 張」。
  // Phase 4 合成只吃重複張數，因此第一張永遠保留，已完成收藏不會被拆掉。
  const TRANSFORM_COLLECTIONS = [
    {
      id:'col_all_red', name:'英雄集結', desc:'8 職紅變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'red' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ mhp:100, meleeHit:1, rangedHit:1, magicHit:1 }
    },
    {
      id:'col_all_purple', name:'傳說集結', desc:'8 職紫變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'purple' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ mhp:100, meleeDmg:1, rangedDmg:1, magicDmg:1 }
    },
    {
      id:'col_all_gold', name:'神話集結', desc:'8 職金變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'gold' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ meleeDmg:2, rangedDmg:2, magicDmg:2, meleeHit:2, rangedHit:2, magicHit:2, dr:1 }
    },
    {
      id:'col_all_cyan', name:'唯一集結', desc:'8 職青變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'cyan' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ mhp:300, meleeDmg:3, rangedDmg:3, magicDmg:3, meleeHit:3, rangedHit:3, magicHit:3, dr:2 }
    },
    {
      id:'col_royal_line', name:'王者之路', desc:'王族紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'royal' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ extraDmg:2, extraHit:1 }
    },
    {
      id:'col_knight_line', name:'不落之盾', desc:'騎士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'knight' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ meleeDmg:2, dr:1 }
    },
    {
      id:'col_elf_line', name:'蒼穹獵手', desc:'妖精紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'elf' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ rangedDmg:2, rangedHit:1 }
    },
    {
      id:'col_mage_line', name:'奧術真理', desc:'法師紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'mage' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ magicDmg:2, magicHit:1, extraMp:1 }
    },
    {
      id:'col_dark_line', name:'暗夜獵殺', desc:'黑暗妖精紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'dark' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ meleeDmg:2, meleeCrit:2 }
    },
    {
      id:'col_dragon_line', name:'龍魂覺醒', desc:'龍騎士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'dragon' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ meleeDmg:2, extraHit:1 }
    },
    {
      id:'col_illusion_line', name:'夢界共鳴', desc:'幻術士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'illusion' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ magicDmg:2, magicHit:1, extraMp:1 }
    },
    {
      id:'col_warrior_line', name:'泰坦之血', desc:'戰士紅／紫／金／青全收集',
      cards: TRANSFORM_CARDS.filter(c => c.cls === 'warrior' && c.id.endsWith('_01')).map(c => c.id),
      bonus:{ mhp:150, dr:1 }
    },
    {
      id:'col_series2_red', name:'英雄新星', desc:'第二系列 8 職紅變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'red' && c.id.endsWith('_02')).map(c => c.id),
      bonus:{ mhp:50, meleeHit:1, rangedHit:1, magicHit:1 }
    },
    {
      id:'col_series2_purple', name:'傳說新星', desc:'第二系列 8 職紫變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'purple' && c.id.endsWith('_02')).map(c => c.id),
      bonus:{ mhp:50, meleeDmg:1, rangedDmg:1, magicDmg:1 }
    },
    {
      id:'col_series2_gold', name:'神話新星', desc:'第二系列 8 職金變全部收集',
      cards: TRANSFORM_CARDS.filter(c => c.tier === 'gold' && c.id.endsWith('_02')).map(c => c.id),
      bonus:{ meleeDmg:1, rangedDmg:1, magicDmg:1, meleeHit:1, rangedHit:1, magicHit:1, dr:1 }
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

  // ===== Phase 9：最佳變身與自動換裝 =====
  const AUTO_BEST_TRANSFORM_KEY = 'lineage_transform_auto_best_v1';

  function autoBestTransformEnabled() {
    try { return getStore(AUTO_BEST_TRANSFORM_KEY) === '1'; }
    catch(e) { return false; }
  }

  function setAutoBestTransformEnabled(on) {
    setStore(AUTO_BEST_TRANSFORM_KEY, on ? '1' : '0');
    render();
    return !!on;
  }

  function bestOwnedTransformForClass(cls) {
    if (!cls) return null;
    const list = TRANSFORM_CARDS
      .filter(c => c.cls === cls && ownedCount(c.id) > 0)
      .sort((a,b) => {
        const ao = TRANSFORM_TIERS[a.tier] ? TRANSFORM_TIERS[a.tier].order : 0;
        const bo = TRANSFORM_TIERS[b.tier] ? TRANSFORM_TIERS[b.tier].order : 0;
        if (bo !== ao) return bo - ao;
        return String(a.id).localeCompare(String(b.id));
      });
    return list[0] || null;
  }

  function equipBestTransform(silent=false) {
    const p = ensurePlayer();
    if (!p || !p.cls) return false;

    const best = bestOwnedTransformForClass(p.cls);
    if (!best) {
      if (!silent) {
        try { if (typeof logSys === 'function') logSys('<span class="text-slate-400">目前沒有本職可套用的變身。</span>'); } catch(e) {}
      }
      return false;
    }

    const cur = current();
    if (cur && cur.id === best.id) {
      if (!silent) {
        try {
          if (typeof logSys === 'function') {
            logSys(`<span class="text-cyan-300">目前已經套用本職最高階變身【${TRANSFORM_TIERS[best.tier].short}】${esc(best.name)}。</span>`);
          }
        } catch(e) {}
      }
      return true;
    }

    p.transformId = best.id;
    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}

    if (!silent) {
      try {
        if (typeof logSys === 'function') {
          logSys(`<span class="text-cyan-300 font-bold">⭐ 已套用本職最佳變身：【${TRANSFORM_TIERS[best.tier].short}】${esc(best.name)}</span>`);
        }
      } catch(e) {}
    }

    render();
    return true;
  }

  function maybeAutoEquipHigherTransform(card) {
    try {
      const p = ensurePlayer();
      if (!p || !card || card.cls !== p.cls || !autoBestTransformEnabled()) return false;

      const cur = current();
      const newOrder = TRANSFORM_TIERS[card.tier] ? TRANSFORM_TIERS[card.tier].order : 0;
      const curOrder = cur && TRANSFORM_TIERS[cur.tier] ? TRANSFORM_TIERS[cur.tier].order : 0;

      if (!cur || newOrder > curOrder) {
        p.transformId = card.id;
        try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
        try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}
        try {
          if (typeof logSys === 'function') {
            logSys(`<span class="text-cyan-300 font-bold">⭐ 自動換上更高階變身：【${TRANSFORM_TIERS[card.tier].short}】${esc(card.name)}</span>`);
          }
        } catch(e) {}
        return true;
      }
    } catch(e) {}
    return false;
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
    const total = TRANSFORM_OPEN_RATES.reduce((sum, row) => sum + Math.max(0, Number(row.rate) || 0), 0);
    if (total <= 0) return 'red';
    let r = Math.random() * total;
    let acc = 0;
    for (const row of TRANSFORM_OPEN_RATES) {
      acc += Math.max(0, Number(row.rate) || 0);
      if (r < acc) return row.tier;
    }
    return TRANSFORM_OPEN_RATES[TRANSFORM_OPEN_RATES.length - 1].tier;
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
    maybeAutoEquipHigherTransform(card);
    const autoCyanConverted = convertCyanDuplicatesToSouls(true);
    if (autoCyanConverted > 0) saveState();

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

  // ===== Phase 7：變身卡全部使用 =====
  // 一次處理整疊，避免 40 張、100 張時逐張重算 UI／存檔造成手機卡頓。
  function useAllTransformCards(uid) {
    let item = null;
    try {
      item = player && Array.isArray(player.inv) ? player.inv.find(i => i.uid === uid) : null;
    } catch(e) {}
    if (!item || item.id !== TRANSFORM_CARD_ITEM_ID) return false;

    if (player && player.dead) {
      try { if (typeof logSys === 'function') logSys('死亡狀態無法使用變身卡。'); } catch(e) {}
      return false;
    }
    try {
      if (typeof inAbsBarrier === 'function' && inAbsBarrier()) {
        if (typeof logSys === 'function') logSys('絕對屏障期間無法使用變身卡。');
        return false;
      }
    } catch(e) {}

    const total = Math.max(0, Math.floor(Number(item.cnt) || 1));
    if (total <= 0) return false;

    const st = loadState();
    const tierCount = { red:0, purple:0, gold:0, cyan:0 };
    const rareCount = {};
    let firstCount = 0;
    let opened = 0;
    let bestNewForCurrentClass = null;

    for (let i = 0; i < total; i++) {
      const tier = rollOpenTier();
      const card = randomCardOfTier(tier);
      if (!card) continue;

      const before = Math.max(0, Math.floor(Number(st.owned[card.id] || 0)));
      st.owned[card.id] = before + 1;
      if (before === 0) firstCount++;

      if (player && card.cls === player.cls) {
        const curBestOrder = bestNewForCurrentClass && TRANSFORM_TIERS[bestNewForCurrentClass.tier]
          ? TRANSFORM_TIERS[bestNewForCurrentClass.tier].order : 0;
        const newCardOrder = TRANSFORM_TIERS[card.tier] ? TRANSFORM_TIERS[card.tier].order : 0;
        if (!bestNewForCurrentClass || newCardOrder > curBestOrder) bestNewForCurrentClass = card;
      }

      tierCount[tier] = (tierCount[tier] || 0) + 1;
      if (tier !== 'red') rareCount[card.id] = (rareCount[card.id] || 0) + 1;
      opened++;
    }

    if (opened <= 0) return false;

    item.cnt = Math.max(0, total - opened);
    if (item.cnt <= 0) {
      try { player.inv = player.inv.filter(i => i.uid !== uid); } catch(e) {}
    }

    const autoCyanConverted = convertCyanDuplicatesToSouls(false);
    saveState();

    if (autoCyanConverted > 0) {
      try {
        if (typeof logSys === 'function') {
          logSys(`<span class="text-cyan-300 font-bold">🩵 自動拆解重複青變 ×${autoCyanConverted}</span>，獲得同數量青魂。`);
        }
      } catch(e) {}
    }

    if (bestNewForCurrentClass) maybeAutoEquipHigherTransform(bestNewForCurrentClass);

    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
    try { render(); } catch(e) {}
    try { if (typeof renderTabs === 'function') renderTabs(true); } catch(e) {}
    try { if (typeof updateUI === 'function') updateUI(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}

    const tc = (tier, n) => {
      const ti = TRANSFORM_TIERS[tier];
      return `<span style="color:${ti.color};font-weight:700">${ti.short} ${n}</span>`;
    };

    try {
      if (typeof logSys === 'function') {
        logSys(
          `<span class="text-cyan-300 font-bold">🧙 一次開啟變身卡 ×${opened}</span>：` +
          `${tc('red',tierCount.red)} ／ ${tc('purple',tierCount.purple)} ／ ` +
          `${tc('gold',tierCount.gold)} ／ ${tc('cyan',tierCount.cyan)}` +
          ` <span class="text-emerald-300">首次取得 ${firstCount} 張</span>`
        );

        const rares = Object.entries(rareCount)
          .map(([id, n]) => ({ card:cardById(id), n }))
          .filter(x => x.card)
          .sort((a,b) => TRANSFORM_TIERS[b.card.tier].order - TRANSFORM_TIERS[a.card.tier].order);

        if (rares.length) {
          const txt = rares.map(x => {
            const ti = TRANSFORM_TIERS[x.card.tier];
            return `<span style="color:${ti.color};font-weight:700">【${ti.short}】${esc(x.card.name)}×${x.n}</span>`;
          }).join('、');
          logSys(`✨ 稀有結果：${txt}`);
        }
      }
    } catch(e) {}

    try {
      const modal = document.getElementById('item-modal');
      if (modal && !modal.classList.contains('hidden') && typeof closeModal === 'function') closeModal();
    } catch(e) {}

    return true;
  }

  function ensureTransformUseAllButton(item) {
    try {
      const actions = document.getElementById('modal-actions');
      if (!actions) return;

      const old = document.getElementById('transform-use-all-btn');
      if (old) old.remove();

      if (!item || item.id !== TRANSFORM_CARD_ITEM_ID) return;
      const count = Math.max(0, Math.floor(Number(item.cnt) || 1));
      if (count <= 1) return;

      const btn = document.createElement('button');
      btn.id = 'transform-use-all-btn';
      btn.type = 'button';
      btn.className = 'col-span-2 w-full btn py-3 text-lg font-bold mt-2 bg-cyan-900 hover:bg-cyan-800 border-cyan-600 text-cyan-100';
      btn.textContent = `🧙 全部使用（${count} 張）`;
      btn.onclick = function () { useAllTransformCards(item.uid); };

      const close = document.getElementById('item-modal-bottom-close');
      if (close && close.parentNode === actions) actions.insertBefore(btn, close);
      else actions.appendChild(btn);
    } catch(e) {
      console.warn('[transform] ensure use-all button failed', e);
    }
  }

  function hookTransformCardModal() {
    try {
      if (typeof window.openModal !== 'function') return;
      if (window.openModal.__transformUseAllHook) return;

      const base = window.openModal;
      const hooked = function(item, isEq, slot) {
        const out = base.apply(this, arguments);
        if (!isEq && item && item.id === TRANSFORM_CARD_ITEM_ID) {
          requestAnimationFrame(() => ensureTransformUseAllButton(item));
          setTimeout(() => ensureTransformUseAllButton(item), 40);
        }
        return out;
      };
      hooked.__transformUseAllHook = true;
      hooked.__transformUseAllBase = base;
      window.openModal = hooked;
    } catch(e) {
      console.warn('[transform] hookTransformCardModal failed', e);
    }
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

  // ===== Phase 13：青變重複兌換 =====
  const CYAN_SOUL_KEY = 'lineage_transform_cyan_soul_v1';
  const CYAN_SOUL_EXCHANGE_COST = 2;
  const AUTO_CYAN_DISMANTLE_KEY = 'lineage_transform_auto_cyan_dismantle_v1';

  function autoCyanDismantleEnabled() {
    try { return getStore(AUTO_CYAN_DISMANTLE_KEY) === '1'; }
    catch(e) { return false; }
  }

  function setAutoCyanDismantleEnabled(on) {
    setStore(AUTO_CYAN_DISMANTLE_KEY, on ? '1' : '0');
    render();
    return !!on;
  }


  function getCyanSoulCount() {
    try {
      return Math.max(0, Math.floor(Number(getStore(CYAN_SOUL_KEY) || 0)));
    } catch(e) { return 0; }
  }

  function setCyanSoulCount(n) {
    const v = Math.max(0, Math.floor(Number(n) || 0));
    setStore(CYAN_SOUL_KEY, String(v));
    return v;
  }

  function addCyanSoul(n=1) {
    return setCyanSoulCount(getCyanSoulCount() + Math.max(0, Math.floor(Number(n) || 0)));
  }

  function cyanDuplicateCount() {
    return TRANSFORM_CARDS
      .filter(c => c.tier === 'cyan')
      .reduce((sum, c) => sum + Math.max(0, ownedCount(c.id) - 1), 0);
  }

  function missingCyanCount() {
    return TRANSFORM_CARDS
      .filter(c => c.tier === 'cyan' && ownedCount(c.id) <= 0)
      .length;
  }

  function convertCyanDuplicatesToSouls(logIt=false) {
    if (!autoCyanDismantleEnabled()) return 0;

    const st = loadState();
    let converted = 0;

    for (const c of TRANSFORM_CARDS.filter(x => x.tier === 'cyan')) {
      const n = Math.max(0, Math.floor(Number(st.owned[c.id] || 0)));
      const extra = Math.max(0, n - 1);
      if (!extra) continue;
      st.owned[c.id] = 1;
      converted += extra;
    }

    if (converted > 0) {
      addCyanSoul(converted);
      if (logIt) {
        try {
          if (typeof logSys === 'function') {
            logSys(
              `<span class="text-cyan-300 font-bold">🩵 自動拆解重複青變 ×${converted}</span>` +
              `，獲得青魂 ×${converted}。`
            );
          }
        } catch(e) {}
      }
    }
    return converted;
  }

  function dismantleAllDuplicateCyan() {
    const st = loadState();
    let converted = 0;

    for (const c of TRANSFORM_CARDS.filter(x => x.tier === 'cyan')) {
      const n = Math.max(0, Math.floor(Number(st.owned[c.id] || 0)));
      const extra = Math.max(0, n - 1);
      if (!extra) continue;
      st.owned[c.id] = 1;
      converted += extra;
    }

    if (converted <= 0) {
      try {
        if (typeof logSys === 'function') {
          logSys('<span class="text-slate-400">目前沒有可拆解的重複青變。</span>');
        }
      } catch(e) {}
      render();
      return 0;
    }

    addCyanSoul(converted);
    saveState();

    try {
      if (typeof logSys === 'function') {
        logSys(
          `<span class="text-cyan-300 font-bold">🩵 已拆解重複青變 ×${converted}</span>` +
          `，獲得青魂 ×${converted}，目前青魂 ${getCyanSoulCount()}。`
        );
      }
    } catch(e) {}

    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}
    render();
    return converted;
  }

  function exchangeCyanSoul() {
    const souls = getCyanSoulCount();
    if (souls < CYAN_SOUL_EXCHANGE_COST) {
      try {
        if (typeof logSys === 'function') {
          logSys(`<span class="text-amber-300">青魂不足，需要 ${CYAN_SOUL_EXCHANGE_COST} 個。</span>`);
        }
      } catch(e) {}
      render();
      return false;
    }

    const cyanCards = TRANSFORM_CARDS.filter(c => c.tier === 'cyan');
    const missing = cyanCards.filter(c => ownedCount(c.id) <= 0);
    const pool = missing.length ? missing : cyanCards;
    if (!pool.length) return false;

    const card = pool[Math.floor(Math.random() * pool.length)];
    const st = loadState();

    st.owned[card.id] = Math.max(0, Math.floor(Number(st.owned[card.id] || 0))) + 1;
    setCyanSoulCount(souls - CYAN_SOUL_EXCHANGE_COST);
    const autoCyanConverted = convertCyanDuplicatesToSouls(false);
    saveState();

    maybeAutoEquipHigherTransform(card);

    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}

    try {
      if (typeof logSys === 'function') {
        const ci = TRANSFORM_CLASSES[card.cls];
        logSys(
          `<span class="text-cyan-300 font-bold">🩵 青魂兌換成功：【青變】${esc(card.name)}</span>` +
          ` <span class="text-slate-300">${ci.icon} ${esc(ci.name)}</span>` +
          (missing.length ? ' <span class="text-emerald-300">（優先補未取得）</span>' : '')
        );
      }
    } catch(e) {}

    render();
    return true;
  }

  function exchangeAllCyanSoulsForMissing() {
    let souls = getCyanSoulCount();
    let exchanged = 0;
    const got = [];

    while (souls >= CYAN_SOUL_EXCHANGE_COST) {
      const missing = TRANSFORM_CARDS.filter(c => c.tier === 'cyan' && ownedCount(c.id) <= 0);
      if (!missing.length) break;

      const card = missing[Math.floor(Math.random() * missing.length)];
      const st = loadState();
      st.owned[card.id] = Math.max(0, Math.floor(Number(st.owned[card.id] || 0))) + 1;

      souls -= CYAN_SOUL_EXCHANGE_COST;
      setCyanSoulCount(souls);
      got.push(card);
      exchanged++;
    }

    if (exchanged <= 0) {
      try {
        if (typeof logSys === 'function') {
          const msg = missingCyanCount() <= 0
            ? '青變圖鑑已收齊，不需要批次補圖鑑。'
            : `青魂不足，需要至少 ${CYAN_SOUL_EXCHANGE_COST} 個。`;
          logSys(`<span class="text-slate-400">${msg}</span>`);
        }
      } catch(e) {}
      render();
      return 0;
    }

    saveState();

    // 只在真正取得本職更高階時自動套用。
    for (const card of got) maybeAutoEquipHigherTransform(card);

    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}

    try {
      if (typeof logSys === 'function') {
        const txt = got.map(card => {
          const ci = TRANSFORM_CLASSES[card.cls];
          return `【青變】${esc(card.name)} ${ci.icon}${esc(ci.name)}`;
        }).join('、');
        logSys(
          `<span class="text-cyan-300 font-bold">🩵 一鍵補圖鑑完成，共兌換 ${exchanged} 張青變</span>：${txt}`
        );
      }
    } catch(e) {}

    render();
    return exchanged;
  }

  // ===== Phase 12：收藏總能力統計 =====
  function totalTransformCollectionBonus() {
    const total = {
      mhp:0, meleeDmg:0, rangedDmg:0, magicDmg:0,
      meleeHit:0, rangedHit:0, magicHit:0,
      extraDmg:0, extraHit:0, extraMp:0, dr:0, meleeCrit:0
    };

    for (const col of TRANSFORM_COLLECTIONS) {
      if (!transformCollectionProgress(col).complete) continue;
      const b = col.bonus || {};
      for (const k of Object.keys(total)) {
        total[k] += Number(b[k] || 0);
      }
    }
    return total;
  }

  function completedTransformCollectionCount() {
    return TRANSFORM_COLLECTIONS.reduce(
      (n, col) => n + (transformCollectionProgress(col).complete ? 1 : 0), 0
    );
  }

  function totalTransformCollectionBonusLines() {
    return collectionBonusText(totalTransformCollectionBonus());
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
      maybeAutoEquipHigherTransform(result);
    } else {
      result = randomCardOfTier(tier);
      if (result) addFusionReward(result, 1);
      rec.fail = Math.min(cfg.pity - 1, rec.fail + 1);
    }

    const autoCyanConverted = convertCyanDuplicatesToSouls(false);
    saveState();

    if (autoCyanConverted > 0) {
      try {
        if (typeof logSys === 'function') {
          logSys(`<span class="text-cyan-300 font-bold">🩵 自動拆解重複青變 ×${autoCyanConverted}</span>，獲得同數量青魂。`);
        }
      } catch(e) {}
    }

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

  // ===== Phase 8：一鍵合成全部 =====
  // 對指定階級持續合成，直到「重複素材」不足 4 張才停止。
  // 整批只 save / calc / render 一次，避免手機連續重繪造成卡頓。
  function transformFuseAll(tier) {
    const cfg = TRANSFORM_FUSION_CONFIG[tier];
    if (!cfg) return false;

    let mats = fusionMaterialCount(tier);
    if (mats < cfg.need) {
      try {
        if (typeof logSys === 'function') {
          logSys(`<span class="text-amber-300">${TRANSFORM_TIERS[tier].short}重複素材不足 ${cfg.need} 張，無法一鍵合成。</span>`);
        }
      } catch(e) {}
      render();
      return false;
    }

    const rec = fusionStateFor(tier);
    const rewardCount = {};
    let attempts = 0;
    let successes = 0;
    let failures = 0;
    let pitySuccesses = 0;

    // 正常情況一定會收斂：成功淨消耗4張，失敗返1張＝淨消耗3張。
    // 2000 次上限只是防止異常資料造成無限迴圈。
    while (fusionMaterialCount(tier) >= cfg.need && attempts < 2000) {
      const guaranteed = rec.fail >= (cfg.pity - 1);

      if (!consumeFusionMaterials(tier, cfg.need)) break;

      const success = guaranteed || Math.random() < cfg.success;
      attempts++;

      if (success) {
        const result = randomCardOfTier(cfg.next);
        if (!result) break;
        addFusionReward(result, 1);
        maybeAutoEquipHigherTransform(result);
        rewardCount[result.id] = (rewardCount[result.id] || 0) + 1;
        successes++;
        if (guaranteed) pitySuccesses++;
        rec.fail = 0;
      } else {
        const result = randomCardOfTier(tier);
        if (result) addFusionReward(result, 1);
        failures++;
        rec.fail = Math.min(cfg.pity - 1, rec.fail + 1);
      }
    }

    const autoCyanConverted = convertCyanDuplicatesToSouls(false);
    saveState();

    if (autoCyanConverted > 0) {
      try {
        if (typeof logSys === 'function') {
          logSys(`<span class="text-cyan-300 font-bold">🩵 自動拆解重複青變 ×${autoCyanConverted}</span>，獲得同數量青魂。`);
        }
      } catch(e) {}
    }

    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}

    try {
      if (typeof logSys === 'function') {
        const ti = TRANSFORM_TIERS[tier];
        const ni = TRANSFORM_TIERS[cfg.next];

        logSys(
          `<span class="font-bold" style="color:${ti.color}">⚡ ${ti.short}一鍵合成完成</span>：` +
          `共 ${attempts} 次，` +
          `<span class="text-emerald-300">成功 ${successes}</span>／` +
          `<span class="text-slate-300">失敗 ${failures}</span>` +
          (pitySuccesses ? `／<span class="text-amber-300">保底成功 ${pitySuccesses}</span>` : '') +
          `，剩餘重複素材 ${fusionMaterialCount(tier)} 張。`
        );

        const rewards = Object.entries(rewardCount)
          .map(([id, n]) => ({ card:cardById(id), n }))
          .filter(x => x.card)
          .sort((a,b) => (b.n - a.n) || a.card.name.localeCompare(b.card.name));

        if (rewards.length) {
          const txt = rewards.map(x =>
            `<span style="color:${ni.color};font-weight:700">【${ni.short}】${esc(x.card.name)}×${x.n}</span>`
          ).join('、');
          logSys(`🎁 合成成果：${txt}`);
        }
      }
    } catch(e) {}

    render();
    return attempts > 0;
  }

  // ===== Phase 15：一鍵整理全部變身素材 =====
  function transformFuseAllTiers() {
    const tiers = ['red','purple','gold'];
    const summary = {};
    let totalAttempts = 0;
    let totalSuccess = 0;
    let totalFail = 0;
    let totalPity = 0;
    let bestNewForCurrentClass = null;

    for (const tier of tiers) {
      const cfg = TRANSFORM_FUSION_CONFIG[tier];
      const rec = fusionStateFor(tier);
      let attempts = 0;
      let successes = 0;
      let failures = 0;
      let pitySuccesses = 0;

      while (fusionMaterialCount(tier) >= cfg.need && attempts < 2000) {
        const guaranteed = rec.fail >= (cfg.pity - 1);
        if (!consumeFusionMaterials(tier, cfg.need)) break;

        const success = guaranteed || Math.random() < cfg.success;
        attempts++;

        if (success) {
          const result = randomCardOfTier(cfg.next);
          if (!result) break;

          addFusionReward(result, 1);
          successes++;
          if (guaranteed) pitySuccesses++;
          rec.fail = 0;

          if (typeof player !== 'undefined' && player && result.cls === player.cls) {
            const oldOrder = bestNewForCurrentClass && TRANSFORM_TIERS[bestNewForCurrentClass.tier]
              ? TRANSFORM_TIERS[bestNewForCurrentClass.tier].order : 0;
            const newOrder = TRANSFORM_TIERS[result.tier]
              ? TRANSFORM_TIERS[result.tier].order : 0;
            if (!bestNewForCurrentClass || newOrder > oldOrder) bestNewForCurrentClass = result;
          }
        } else {
          const result = randomCardOfTier(tier);
          if (result) addFusionReward(result, 1);
          failures++;
          rec.fail = Math.min(cfg.pity - 1, rec.fail + 1);
        }
      }

      summary[tier] = { attempts, successes, failures, pitySuccesses };
      totalAttempts += attempts;
      totalSuccess += successes;
      totalFail += failures;
      totalPity += pitySuccesses;
    }

    if (totalAttempts <= 0) {
      try {
        if (typeof logSys === 'function') {
          logSys('<span class="text-slate-400">目前紅／紫／金變都沒有足夠的重複素材可合成。</span>');
        }
      } catch(e) {}
      render();
      return false;
    }

    const autoCyanConverted = convertCyanDuplicatesToSouls(false);
    saveState();

    if (bestNewForCurrentClass) {
      try { maybeAutoEquipHigherTransform(bestNewForCurrentClass); } catch(e) {}
    }

    try { if (typeof calcStats === 'function') calcStats(); } catch(e) {}
    try { if (typeof saveGame === 'function') saveGame(); } catch(e) {}

    try {
      if (typeof logSys === 'function') {
        const row = (tier) => {
          const r = summary[tier];
          const ti = TRANSFORM_TIERS[tier];
          return `<span style="color:${ti.color};font-weight:700">${ti.short}</span>` +
                 ` ${r.attempts} 次／成功 ${r.successes}／失敗 ${r.failures}` +
                 (r.pitySuccesses ? `／保底 ${r.pitySuccesses}` : '');
        };

        logSys(
          `<span class="text-amber-300 font-bold">🔥 一鍵全階合成完成</span>：` +
          `總計 ${totalAttempts} 次，成功 ${totalSuccess}／失敗 ${totalFail}` +
          (totalPity ? `／保底成功 ${totalPity}` : '')
        );
        logSys(`${row('red')} ｜ ${row('purple')} ｜ ${row('gold')}`);

        if (autoCyanConverted > 0) {
          logSys(
            `<span class="text-cyan-300 font-bold">🩵 依自動拆解設定，重複青變 ×${autoCyanConverted} 已轉成青魂。</span>`
          );
        }
      }
    } catch(e) {}

    render();
    return true;
  }

  // ===== UI =====
  function ensureDom() {
    let root = document.getElementById('transform-book');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'transform-book';
    root.className = 'hidden fixed inset-0 z-[48] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3';
    root.style.paddingBottom = 'calc(112px + env(safe-area-inset-bottom, 0px))';
    root.style.paddingTop = '12px';
    root.innerHTML = `
      <div class="w-full max-w-5xl h-full max-h-full flex flex-col bg-slate-900/95 rounded-2xl border-2 border-cyan-800/70 overflow-hidden"
           onclick="event.stopPropagation()">
        <div class="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-900">
          <div>
            <h2 class="text-2xl font-bold text-cyan-300">🧙 變身卡</h2>
            <div class="text-xs text-slate-400">紅變 → 紫變 → 金變 → 青變</div>
          </div>
          <button class="btn px-3 py-1.5 bg-slate-700" onclick="closeTransformBook()">✕ 關閉</button>
        </div>
        <div id="transform-book-tabs" class="grid grid-cols-4 gap-1.5 px-4 py-2.5 border-b border-slate-700"></div>
        <div id="transform-book-body" class="flex-1 min-h-0 overflow-y-auto p-4" style="padding-bottom:140px;overscroll-behavior:contain;"></div>
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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          <button class="btn px-3 py-2 bg-cyan-900 border-cyan-700 text-cyan-100 font-bold"
                  onclick="equipBestTransform()">
            ⭐ 一鍵套用本職最高階
          </button>
          ${cur ? '<button class="btn px-3 py-2 bg-slate-700" onclick="transformUnequip()">解除變身</button>' : '<div></div>'}
        </div>

        <label class="mt-3 flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 cursor-pointer">
          <div>
            <div class="font-bold text-sm text-slate-200">自動換上更高階變身</div>
            <div class="text-xs text-slate-500">開卡或合成取得本職更高階時自動套用；同階不會亂換。</div>
          </div>
          <input type="checkbox" class="w-5 h-5 accent-cyan-600"
                 ${autoBestTransformEnabled() ? 'checked' : ''}
                 onchange="setAutoBestTransformEnabled(this.checked)">
        </label>
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
          合成失敗會返還 1 張隨機同階變身，並累積保底。<br>
          「一鍵合成全部」會持續合到該階重複素材不足 4 張為止。
        </div>

        <button class="btn w-full mt-4 py-3 font-bold
                       ${['red','purple','gold'].some(t => fusionMaterialCount(t) >= TRANSFORM_FUSION_CONFIG[t].need)
                         ? 'bg-amber-800 text-amber-100 border-amber-600'
                         : 'bg-slate-800 text-slate-500'}"
                ${['red','purple','gold'].some(t => fusionMaterialCount(t) >= TRANSFORM_FUSION_CONFIG[t].need)
                  ? ''
                  : 'disabled'}
                onclick="transformFuseAllTiers()">
          🔥 一鍵全階合成（紅 → 紫 → 金 → 青）
        </button>

        <div class="text-xs text-slate-500 mt-2">
          會依序把紅變重複卡合到紫變，再把新取得的紫變繼續往金變合成，最後處理金變 → 青變。
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
                ${can ? `🔥 合成 1 次 ${row.title}` : `還缺 ${Math.max(0, cfg.need - mats)} 張重複卡`}
              </button>

              <button class="btn w-full mt-2 py-3 font-bold ${can ? 'bg-cyan-900 text-cyan-100 border-cyan-700' : 'bg-slate-800 text-slate-500'}"
                      ${can ? '' : 'disabled'}
                      onclick="transformFuseAll('${row.tier}')">
                ${can ? `⚡ 一鍵合成全部重複卡` : `⚡ 暫無可批次合成素材`}
              </button>
            </div>`;
        }).join('')}
      </div>

      <div class="mt-4 rounded-xl border border-cyan-800/60 bg-cyan-950/10 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-lg font-bold text-cyan-300">🩵 青變重複兌換</div>
            <div class="text-xs text-slate-400 mt-1">
              每種青變第一張永久保留；重複青變可拆成青魂。
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500">目前青魂</div>
            <div class="text-2xl font-bold text-cyan-300">${getCyanSoulCount()}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div class="rounded-lg bg-slate-900/70 p-3">
            <div class="text-slate-500">重複青變</div>
            <div class="text-xl font-bold">${cyanDuplicateCount()}</div>
          </div>
          <div class="rounded-lg bg-slate-900/70 p-3">
            <div class="text-slate-500">兌換消耗</div>
            <div class="text-xl font-bold">${CYAN_SOUL_EXCHANGE_COST} 青魂</div>
          </div>
        </div>

        <button class="btn w-full mt-3 py-3 ${cyanDuplicateCount()>0?'bg-slate-700':'bg-slate-800 text-slate-500'}"
                ${cyanDuplicateCount()>0?'':'disabled'}
                onclick="dismantleAllDuplicateCyan()">
          🧩 拆解全部重複青變
        </button>

        <button class="btn w-full mt-2 py-3 font-bold ${getCyanSoulCount()>=CYAN_SOUL_EXCHANGE_COST?'bg-cyan-900 text-cyan-100 border-cyan-700':'bg-slate-800 text-slate-500'}"
                ${getCyanSoulCount()>=CYAN_SOUL_EXCHANGE_COST?'':'disabled'}
                onclick="exchangeCyanSoul()">
          🩵 ${CYAN_SOUL_EXCHANGE_COST} 青魂兌換 1 張青變
        </button>

        <label class="mt-3 flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2">
          <div>
            <div class="text-sm font-bold text-slate-200">自動拆解之後取得的重複青變</div>
            <div class="text-xs text-slate-500">第一張永遠保留；只有第 2 張以上才自動轉成青魂。</div>
          </div>
          <input type="checkbox" class="w-5 h-5 accent-cyan-600"
                 ${autoCyanDismantleEnabled() ? 'checked' : ''}
                 onchange="setAutoCyanDismantleEnabled(this.checked)">
        </label>

        <button class="btn w-full mt-2 py-3 font-bold ${getCyanSoulCount()>=CYAN_SOUL_EXCHANGE_COST && missingCyanCount()>0?'bg-cyan-800 text-cyan-100':'bg-slate-800 text-slate-500'}"
                ${getCyanSoulCount()>=CYAN_SOUL_EXCHANGE_COST && missingCyanCount()>0?'':'disabled'}
                onclick="exchangeAllCyanSoulsForMissing()">
          ⚡ 一鍵兌換補圖鑑（缺 ${missingCyanCount()} 張）
        </button>

        <div class="text-xs text-slate-500 mt-3">
          兌換時會優先抽你尚未取得的青變；若 8 職青變都已收齊，則改為隨機青變。
        </div>
      </div>`;
  }

  // ===== Phase 10：圖鑑篩選與完成度 =====
  let collectionTierFilter = 'all';
  let collectionClassMode = 'all';
  let collectionMissingFirst = false;
  let collectionSearchText = '';
  let collectionSearchTimer = null;

  function setTransformCollectionTierFilter(tier) {
    collectionTierFilter = ['all','red','purple','gold','cyan'].includes(tier) ? tier : 'all';
    render();
  }

  function setTransformCollectionClassMode(mode) {
    collectionClassMode = (mode === 'mine') ? 'mine' : 'all';
    render();
  }

  function setTransformCollectionMissingFirst(on) {
    collectionMissingFirst = !!on;
    render();
  }

  function setTransformCollectionSearch(value) {
    collectionSearchText = String(value || '').trim();
    render();
  }

  function queueTransformCollectionSearch(value) {
    collectionSearchText = String(value || '');
    if (collectionSearchTimer) clearTimeout(collectionSearchTimer);
    collectionSearchTimer = setTimeout(() => {
      render();
      requestAnimationFrame(() => {
        const input = document.getElementById('transform-collection-search');
        if (input) {
          input.focus();
          try { input.setSelectionRange(input.value.length, input.value.length); } catch(e) {}
        }
      });
    }, 250);
  }

  function clearTransformCollectionSearch() {
    collectionSearchText = '';
    render();
  }

  function transformUniqueOwnedCount(cards) {
    return (cards || TRANSFORM_CARDS).reduce((n, c) => n + (ownedCount(c.id) > 0 ? 1 : 0), 0);
  }

  // ===== Phase 11：變身詳細資料 =====
  function ensureTransformCardDetailDom() {
    let root = document.getElementById('transform-card-detail');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'transform-card-detail';
    root.className = 'hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3';
    root.style.paddingBottom = 'calc(112px + env(safe-area-inset-bottom, 0px))';
    root.innerHTML = `
      <div class="w-full max-w-lg max-h-full overflow-y-auto rounded-2xl border-2 border-cyan-800/70 bg-slate-900 p-5"
           onclick="event.stopPropagation()">
        <div id="transform-card-detail-body"></div>
      </div>`;
    root.addEventListener('click', closeTransformCardDetail);
    document.body.appendChild(root);
    return root;
  }

  function openTransformCardDetail(id) {
    const card = cardById(id);
    if (!card) return;

    const root = ensureTransformCardDetailDom();
    const body = document.getElementById('transform-card-detail-body');
    if (!body) return;

    const ti = TRANSFORM_TIERS[card.tier];
    const ci = TRANSFORM_CLASSES[card.cls];
    const count = ownedCount(card.id);
    const p = ensurePlayer();
    const usable = !!(count > 0 && p && p.cls === card.cls);
    const active = !!(current() && current().id === card.id);
    const lines = transformAbilityLines(card);

    body.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-2xl font-bold" style="color:${ti.color}">【${ti.short}】${esc(card.name)}</div>
          <div class="text-sm text-slate-400 mt-1">${ci.icon} ${esc(ci.name)} ／ ${esc(ti.name)}</div>
        </div>
        <button class="btn px-3 py-1.5 bg-slate-700" onclick="closeTransformCardDetail()">✕</button>
      </div>

      <div class="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
        <div class="flex justify-between gap-3">
          <span class="text-slate-400">持有數量</span>
          <b class="${count > 0 ? 'text-emerald-300' : 'text-slate-500'}">${count > 0 ? '× ' + count : '未取得'}</b>
        </div>
      </div>

      <div class="mt-3 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
        <div class="font-bold text-cyan-300 mb-2">能力</div>
        ${lines.map(x => `<div class="py-1 text-slate-200">${esc(x)}</div>`).join('')}
      </div>

      <div class="mt-3 rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-sm">
        <div class="font-bold text-slate-300 mb-1">取得方式</div>
        <div class="text-slate-400">全地圖怪物掉落「變身卡」，開啟後隨機取得；也可由合成獲得。</div>
      </div>

      ${usable ? `
        <button class="btn w-full mt-4 py-3 font-bold ${active ? 'bg-cyan-950 text-cyan-300' : 'bg-cyan-900 text-cyan-100 border-cyan-700'}"
                ${active ? 'disabled' : ''}
                onclick="transformEquip('${card.id}'); closeTransformCardDetail();">
          ${active ? '目前使用中' : '套用這張變身'}
        </button>` : ''}

      <button class="btn w-full mt-2 py-3 bg-slate-700" onclick="closeTransformCardDetail()">關閉</button>
    `;

    root.classList.remove('hidden');
  }

  function closeTransformCardDetail() {
    const root = document.getElementById('transform-card-detail');
    if (root) root.classList.add('hidden');
  }

  function renderCollectionPage() {
    const p = ensurePlayer();
    const allHave = transformUniqueOwnedCount(TRANSFORM_CARDS);
    const allNeed = TRANSFORM_CARDS.length;
    const allPct = allNeed ? Math.floor((allHave / allNeed) * 100) : 0;

    let filtered = TRANSFORM_CARDS.slice();

    if (collectionTierFilter !== 'all') {
      filtered = filtered.filter(c => c.tier === collectionTierFilter);
    }

    if (collectionClassMode === 'mine' && p && p.cls) {
      filtered = filtered.filter(c => c.cls === p.cls);
    }

    const q = collectionSearchText.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(c => {
        const ti = TRANSFORM_TIERS[c.tier];
        const ci = TRANSFORM_CLASSES[c.cls];
        const hay = [c.name, c.id, ti && ti.short, ti && ti.name, ci && ci.name]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    const filteredHave = transformUniqueOwnedCount(filtered);
    const filteredNeed = filtered.length;

    const tierBtns = [
      ['all','全部'],
      ['red','紅'],
      ['purple','紫'],
      ['gold','金'],
      ['cyan','青']
    ].map(([k,n]) => `
      <button class="btn py-2 text-sm font-bold ${collectionTierFilter===k?'bg-cyan-800 text-cyan-100':'bg-slate-800 text-slate-300'}"
              onclick="setTransformCollectionTierFilter('${k}')">${n}</button>
    `).join('');

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

    const controls = `
      <div class="mb-4 rounded-xl border border-cyan-900/60 bg-slate-800/70 p-4">
        <div class="flex items-end justify-between gap-3">
          <div>
            <div class="text-lg font-bold text-cyan-300">📚 變身圖鑑</div>
            <div class="text-sm text-slate-300 mt-1">
              總完成度 <b class="text-emerald-300">${allHave} / ${allNeed}</b>（${allPct}%）
            </div>
          </div>
          <div class="text-right text-xs text-slate-400">
            目前篩選 ${filteredHave} / ${filteredNeed}
          </div>
        </div>

        <div class="mt-3 h-2 rounded-full bg-slate-900 overflow-hidden">
          <div class="h-full bg-emerald-600" style="width:${Math.max(0,Math.min(100,allPct))}%"></div>
        </div>

        <div class="grid grid-cols-[1fr_auto] gap-2 mt-4">
          <input id="transform-collection-search"
                 class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none"
                 placeholder="搜尋變身名稱、職業或階級..."
                 value="${esc(collectionSearchText)}"
                 oninput="queueTransformCollectionSearch(this.value)">
          <button class="btn px-3 py-2 bg-slate-700" onclick="clearTransformCollectionSearch()">清除</button>
        </div>

        <div class="grid grid-cols-5 gap-1.5 mt-3">
          ${tierBtns}
        </div>

        <div class="grid grid-cols-2 gap-2 mt-3">
          <button class="btn py-2 text-sm font-bold ${collectionClassMode==='all'?'bg-cyan-800 text-cyan-100':'bg-slate-800 text-slate-300'}"
                  onclick="setTransformCollectionClassMode('all')">全部職業</button>
          <button class="btn py-2 text-sm font-bold ${collectionClassMode==='mine'?'bg-cyan-800 text-cyan-100':'bg-slate-800 text-slate-300'}"
                  onclick="setTransformCollectionClassMode('mine')">只看本職</button>
        </div>

        <label class="mt-3 flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2">
          <div>
            <div class="text-sm font-bold text-slate-200">未取得優先</div>
            <div class="text-xs text-slate-500">開啟後，每個職業會把缺少的變身排在前面。</div>
          </div>
          <input type="checkbox" class="w-5 h-5 accent-cyan-600"
                 ${collectionMissingFirst ? 'checked' : ''}
                 onchange="setTransformCollectionMissingFirst(this.checked)">
        </label>
      </div>`;

    const classes = Object.keys(TRANSFORM_CLASSES).filter(k => filtered.some(c => c.cls === k));

    const cards = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${classes.map(k => {
          const ci = TRANSFORM_CLASSES[k];
          const list = filtered
            .filter(c => c.cls === k)
            .sort((a,b) => {
              if (collectionMissingFirst) {
                const ah = ownedCount(a.id) > 0 ? 1 : 0;
                const bh = ownedCount(b.id) > 0 ? 1 : 0;
                if (ah !== bh) return ah - bh;
              }
              const tierDiff = TRANSFORM_TIERS[a.tier].order - TRANSFORM_TIERS[b.tier].order;
              if (tierDiff) return tierDiff;
              return String(a.id).localeCompare(String(b.id));
            });

          const have = transformUniqueOwnedCount(list);

          return `
            <div class="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="font-bold text-lg">${ci.icon} ${esc(ci.name)}</div>
                <div class="text-xs text-slate-400">${have}/${list.length}</div>
              </div>
              ${list.map(c => `
                <button class="w-full flex items-center justify-between gap-3 py-2 border-t border-slate-700 text-left"
                        onclick="openTransformCardDetail('${c.id}')">
                  <div>${badge(c)} ${esc(c.name)}</div>
                  <div class="text-sm ${ownedCount(c.id)?'text-emerald-300':'text-slate-600'}">
                    ${ownedCount(c.id)?'已取得 × '+ownedCount(c.id):'未取得'}
                  </div>
                </button>`).join('')}
            </div>`;
        }).join('')}
      </div>`;

    const empty = filteredNeed === 0
      ? `<div class="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">目前篩選條件沒有變身資料。</div>`
      : '';

    return effects + controls + (empty || cards);
  }

  function renderAbilityPage() {
    const cur = current();
    const collectionLines = totalTransformCollectionBonusLines();
    const completed = completedTransformCollectionCount();
    const totalSets = TRANSFORM_COLLECTIONS.length;

    const odds = TRANSFORM_OPEN_RATES.map(r => {
      const t = TRANSFORM_TIERS[r.tier];
      const pct = Number(r.rate) || 0;
      const txt = pct < 0.1 ? pct.toFixed(2) : (Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(1));
      return `<span style="color:${t.color};font-weight:700">${t.short} ${txt}%</span>`;
    }).join(' ／ ');

    return `
      <div class="space-y-3">

        <div class="rounded-xl border border-cyan-900/60 bg-cyan-950/10 p-5">
          <div class="text-xl font-bold text-cyan-300 mb-3">📊 目前變身能力</div>

          ${cur ? `
            <div class="text-lg">${badge(cur)} ${esc(cur.name)}</div>
            <div class="text-sm text-slate-400 mt-1">
              ${TRANSFORM_CLASSES[cur.cls].icon} ${esc(TRANSFORM_CLASSES[cur.cls].name)}
            </div>
            <div class="text-slate-300 mt-3">
              ${transformAbilityLines(cur).map(x => `<div class="py-0.5">${esc(x)}</div>`).join('')}
            </div>
          ` : `
            <div class="text-slate-500">目前未套用變身。</div>
          `}
        </div>

        <div class="rounded-xl border border-amber-800/60 bg-amber-950/10 p-5">
          <div class="flex items-center justify-between gap-3">
            <div class="text-xl font-bold text-amber-300">✨ 收藏永久能力</div>
            <div class="text-sm font-bold ${completed > 0 ? 'text-emerald-300' : 'text-slate-500'}">
              ${completed} / ${totalSets} 組
            </div>
          </div>

          <div class="text-xs text-slate-400 mt-1">
            帳號共用，所有角色永久生效；不需要套用特定變身。
          </div>

          ${collectionLines.length ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              ${collectionLines.map(x => `
                <div class="rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-slate-200">
                  ${esc(x)}
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="mt-4 rounded-lg bg-slate-900/70 border border-slate-700 p-4 text-slate-500">
              尚未完成任何變身收藏組合。
            </div>
          `}

          <button class="btn w-full mt-4 py-2 bg-slate-800"
                  onclick="setTransformPage('collection')">
            📚 前往收藏查看進度
          </button>
        </div>

        <div class="rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-sm">
          <div class="text-cyan-200 font-bold">變身卡取得</div>
          <div class="text-slate-300 mt-1">
            全地圖怪物：每隻 ${(TRANSFORM_CARD_DROP_RATE*100).toFixed(1)}% 機率掉落。
          </div>
          <div class="text-slate-300 mt-1">
            開卡機率：${odds}
          </div>
        </div>

        <div class="rounded-xl bg-slate-800/70 border border-slate-700 p-3 text-sm text-amber-200">
          套用／解除變身會立即重算角色能力；收藏能力則會自動永久套用。
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
    hookTransformCardModal();
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

  window.CYAN_TRANSFORM_SPECIALS = CYAN_TRANSFORM_SPECIALS;
  window.isCyanTransformActive = isCyanTransformActive;
  window.cyanTransformMagicMult = cyanTransformMagicMult;
  window.cyanTransformIncomingPhysicalMult = cyanTransformIncomingPhysicalMult;
  window.applyCyanTransformPhysicalProc = applyCyanTransformPhysicalProc;
  window.cyanTransformTryWarriorReflect = cyanTransformTryWarriorReflect;

  window.TRANSFORM_COLLECTIONS = TRANSFORM_COLLECTIONS;
  window.transformCollectionProgress = transformCollectionProgress;
  window.transformCompletedCollections = completedTransformCollectionIds;
  window.applyTransformCollectionStats = applyTransformCollectionStats;

  window.transformFuseAllTiers = transformFuseAllTiers;
  window.transformFuseAll = transformFuseAll;
  window.transformFuse = transformFuse;
  window.transformFusionMaterialCount = fusionMaterialCount;
  window.TRANSFORM_FUSION_CONFIG = TRANSFORM_FUSION_CONFIG;

  window.transformUseAllCards = useAllTransformCards;

  window.equipBestTransform = equipBestTransform;
  window.bestOwnedTransformForClass = bestOwnedTransformForClass;
  window.setAutoBestTransformEnabled = setAutoBestTransformEnabled;
  window.autoBestTransformEnabled = autoBestTransformEnabled;

  window.setTransformCollectionTierFilter = setTransformCollectionTierFilter;
  window.setTransformCollectionClassMode = setTransformCollectionClassMode;
  window.setTransformCollectionMissingFirst = setTransformCollectionMissingFirst;

  window.setTransformCollectionSearch = setTransformCollectionSearch;
  window.queueTransformCollectionSearch = queueTransformCollectionSearch;
  window.clearTransformCollectionSearch = clearTransformCollectionSearch;
  window.openTransformCardDetail = openTransformCardDetail;
  window.closeTransformCardDetail = closeTransformCardDetail;

  window.totalTransformCollectionBonus = totalTransformCollectionBonus;
  window.totalTransformCollectionBonusLines = totalTransformCollectionBonusLines;
  window.completedTransformCollectionCount = completedTransformCollectionCount;

  window.autoCyanDismantleEnabled = autoCyanDismantleEnabled;
  window.setAutoCyanDismantleEnabled = setAutoCyanDismantleEnabled;
  window.missingCyanCount = missingCyanCount;
  window.exchangeAllCyanSoulsForMissing = exchangeAllCyanSoulsForMissing;

  window.getCyanSoulCount = getCyanSoulCount;
  window.cyanDuplicateCount = cyanDuplicateCount;
  window.dismantleAllDuplicateCyan = dismantleAllDuplicateCyan;
  window.exchangeCyanSoul = exchangeCyanSoul;

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

