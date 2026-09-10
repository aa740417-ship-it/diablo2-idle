/* ===== 🗡️ 職業專武系統 v2（真正武器版） =====
 * - 專武是正常武器：背包→武器，可裝到武器欄
 * - 只有對應職業可裝
 * - 不套用隨機詞綴／祝福／遠古／屬性詞綴
 * - 每一把專武各自保存 1~5 階（artifactTier）
 * - 小怪掉專武升階石；神器領主隨機掉 8 職業專武之一
 * - 專武效果只有「實際裝備在武器欄」時才會觸發
 */
(function () {
'use strict';
if (window.__CLASS_WEAPON_SYSTEM_V2__) return;
window.__CLASS_WEAPON_SYSTEM_V2__ = true;

const STONE_ID = 'artifact_ascension_stone';
const MAP_ID = 'artifact_sanctum';
const BOSS_ID = 'artifact_overlord';
const UPGRADE_COST = [0, 10, 20, 40, 80];

const CLASS_ALIASES = {
  royal:'royal', knight:'knight', mage:'mage', elf:'elf', dark:'dark',
  illusion:'illusion', illusionist:'illusion',
  dragon:'dragon', Dknight:'dragon', warrior:'warrior'
};
const CLASS_NAMES = {
  royal:'王族', knight:'騎士', mage:'法師', elf:'妖精', dark:'黑暗妖精',
  illusion:'幻術士', dragon:'龍騎士', warrior:'戰士'
};

const WEAPONS = {
  artifact_royal:{
    cls:'royal', n:'王權聖劍', passive:'王者共鳴',
    desc:'王族專屬武器。命中時有機率引發王者共鳴，追加威嚴衝擊。',
    dmgS:24,dmgL:28,hit:4,dmgBonus:4,
    rate:[30,40,50,60,70], mult:[0.45,0.55,0.65,0.78,0.92],
    special:'帝王裁決', ele:'none'
  },
  artifact_knight:{
    cls:'knight', n:'不屈巨劍', passive:'重擊共振',
    desc:'騎士專屬武器。命中時有機率引發重擊共振，追加高倍率傷害。',
    dmgS:30,dmgL:36,hit:4,dmgBonus:5,
    rate:[30,40,50,60,70], mult:[0.65,0.80,0.95,1.18,1.45],
    special:'聖鋼震爆', ele:'earth'
  },
  artifact_mage:{
    cls:'mage', n:'奧術共鳴法杖', passive:'魔力共鳴',
    desc:'法師專屬武器。命中時有機率產生魔力共鳴，追加奧術傷害。',
    dmgS:14,dmgL:14,hit:2,dmgBonus:1,extraMp:6,magicDmg:5,
    rate:[30,40,50,60,70], mult:[0.40,0.50,0.62,0.76,0.92],
    special:'奧術星爆', ele:'wind'
  },
  artifact_elf:{
    cls:'elf', n:'風靈神弓', passive:'連射',
    desc:'妖精專屬武器。命中時有機率觸發連射，追加一次快速追擊。',
    dmgS:20,dmgL:20,hit:5,dmgBonus:4,isBow:true,ranged:true,
    rate:[30,40,50,60,70], mult:[0.50,0.60,0.72,0.86,1.00],
    special:'暴風箭雨', ele:'wind'
  },
  artifact_elf_fire:{
    cls:'elf', n:'烈焰精靈劍', passive:'烈焰追擊',
    desc:'妖精專屬單手劍。所有妖精皆可裝備；火屬性妖精命中時可引發烈焰追擊，追加火焰劍氣傷害。',
    dmgS:25,dmgL:28,hit:5,dmgBonus:5,meleeElf:true,fireElf:true,
    rate:[30,40,50,60,70], mult:[0.55,0.68,0.82,0.98,1.15],
    special:'鳳凰烈焰斬', ele:'fire'
  },
  artifact_dark:{
    cls:'dark', n:'暗影雙刃', passive:'雙擊',
    desc:'黑暗妖精專屬武器。命中時有機率觸發雙擊，影子化為第二段追擊。',
    dmgS:26,dmgL:23,hit:5,dmgBonus:5,
    rate:[30,40,50,60,70], mult:[0.70,0.80,0.90,1.00,1.12],
    special:'闇月裂影', ele:'none'
  },
  artifact_illusion:{
    cls:'illusion', n:'心象奇古獸', passive:'精神震盪',
    desc:'幻術士專屬武器。命中時有機率引發精神震盪，追加心靈魔法傷害。',
    dmgS:18,dmgL:18,hit:3,dmgBonus:2,qigu:true,extraMp:4,
    rate:[30,40,50,60,70], mult:[0.42,0.54,0.66,0.80,0.96],
    special:'幻界崩解', ele:'none'
  },
  artifact_dragon:{
    cls:'dragon', n:'古龍鎖鏈劍', passive:'龍之追擊',
    desc:'龍騎士專屬武器。命中時有機率喚醒龍之追擊，追加龍息型傷害。',
    dmgS:28,dmgL:32,hit:4,dmgBonus:5,
    rate:[30,40,50,60,70], mult:[0.55,0.66,0.78,0.92,1.08],
    special:'古龍滅息', ele:'fire'
  },
  artifact_warrior:{
    cls:'warrior', n:'泰坦巨斧', passive:'狂戰震擊',
    desc:'戰士專屬武器。命中時有機率引發狂戰震擊，追加沉重衝擊。',
    dmgS:32,dmgL:38,hit:3,dmgBonus:6,
    rate:[30,40,50,60,70], mult:[0.58,0.70,0.84,1.00,1.18],
    special:'泰坦隕星', ele:'earth'
  }
};
const WEAPON_IDS = Object.keys(WEAPONS);

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clsNow(){try{return CLASS_ALIASES[player&&player.cls]||(player&&player.cls)||'';}catch(e){return'';}}
function ready(){return typeof player!=='undefined'&&player&&Array.isArray(player.inv);}
function isClassWeaponId(id){return !!WEAPONS[id];}
function weaponTier(it){return Math.max(1,Math.min(5,Number(it&&it.artifactTier)||1));}
function countItem(id){
  if(!ready())return 0;
  return player.inv.reduce((s,it)=>s+((it&&it.id===id)?(Number(it.cnt)||1):0),0);
}
function consumeItem(id,amount){
  if(!ready()||amount<=0||countItem(id)<amount)return false;
  let left=amount;
  for(let i=player.inv.length-1;i>=0&&left>0;i--){
    let it=player.inv[i]; if(!it||it.id!==id)continue;
    let c=Number(it.cnt)||1;
    if(c<=left){left-=c;player.inv.splice(i,1);}
    else{it.cnt=c-left;left=0;}
  }
  try{if(typeof resetCatchupGainItemIndex==='function')resetCatchupGainItemIndex();}catch(e){}
  return left<=0;
}
function equippedWeapon(){
  try{
    let it=player&&player.eq&&player.eq.wpn;
    if(it&&isClassWeaponId(it.id))return it;
  }catch(e){}
  return null;
}
function findWeaponInstance(id){
  if(!ready())return null;
  let eq=equippedWeapon();
  if(eq&&eq.id===id)return eq;
  return player.inv.find(it=>it&&it.id===id)||null;
}
function ownsWeapon(id){return !!findWeaponInstance(id);}

function migrateWeapons(){
  if(!ready())return;
  let oldTiers=(player.classArtifact&&player.classArtifact.tiers)||{};
  let out=[];
  for(let it of player.inv){
    if(!it||!isClassWeaponId(it.id)){out.push(it);continue;}
    let cnt=Math.max(1,Number(it.cnt)||1);
    for(let k=0;k<cnt;k++){
      let w=(k===0)?it:{...it,uid:(typeof uid==='function'?uid():('cw_'+Date.now()+'_'+Math.random()))};
      w.cnt=1;
      if(!w.artifactTier)w.artifactTier=Math.max(1,Math.min(5,Number(oldTiers[w.id])||1));
      // 借用既有「不可合併實體物」旗標，確保多把同名專武不會在讀檔後合併。
      
      w.lootQ='white';w.lootAff=[];w.bless=false;w.anc=false;w.attr=false;w.seteff=false;w.junk=false;
      out.push(w);
    }
  }
  player.inv=out;
  let eq=equippedWeapon();
  if(eq){
    if(!eq.artifactTier)eq.artifactTier=Math.max(1,Math.min(5,Number(oldTiers[eq.id])||1));
    
    eq.lootQ='white';eq.lootAff=[];eq.bless=false;eq.anc=false;eq.attr=false;eq.seteff=false;eq.junk=false;
  }
}

function registerData(){
  if(typeof DB==='undefined'||!DB||!DB.items||!DB.mobs||!DB.maps)return false;

  DB.items[STONE_ID]={
    n:'專武升階石',type:'misc',p:0,gachaWeight:0,noJunk:true,noEnhance:true,
    c:'text-violet-300',d:'蘊含古老力量的結晶。用於職業專屬武器 1～5 階升階。'
  };

  WEAPON_IDS.forEach(id=>{
    let a=WEAPONS[id];
    DB.items[id]={
      n:a.n,type:'wpn',slot:'wpn',req:a.cls,safe:0,maxEn:0,noEnhance:true,maxHold:1,
      p:0,gachaWeight:0,noJunk:true,c:'text-amber-300',
      classWeapon:true,artifactWeapon:true,artifactClass:a.cls,
      dmgS:a.dmgS,dmgL:a.dmgL,hit:a.hit||0,dmgBonus:a.dmgBonus||0,
      extraMp:a.extraMp||0,magicDmg:a.magicDmg||0,
      isBow:!!a.isBow,ranged:!!a.ranged,qigu:!!a.qigu,
      d:`【${CLASS_NAMES[a.cls]}專武】${a.desc} 不產生隨機詞綴，也不能使用一般強化卷軸；可使用專武升階石升至 5 階。`
    };
  });

  DB.mobs.artifact_guard_1={n:'聖域守衛',img:'assets/anim/夢幻之島鎧甲守衛/idle_0.png',lv:78,s:'L',beh:'主動',race:'魔法生物',e:'earth',hp:80,ac:5,mr:0,exp:6200,goldMin:700,goldMax:1200,atkSpd:1.7,dmg:[1,3],db:65,hit:88};
  DB.mobs.artifact_guard_2={n:'符文守護者',img:'assets/anim/地元素守護者/idle_0.png',lv:80,s:'L',beh:'主動',race:'魔法生物',e:'wind',hp:90,ac:5,mr:0,exp:6900,goldMin:750,goldMax:1300,atkSpd:1.6,dmg:[1,3],db:70,hit:92};
  DB.mobs.artifact_guard_3={n:'星界監視者',img:'assets/anim/深淵之主/idle_0.png',lv:82,s:'L',beh:'主動',race:'元素',e:'water',hp:100,ac:5,mr:0,exp:7600,goldMin:800,goldMax:1400,atkSpd:1.5,dmg:[1,3],db:76,hit:96};
  DB.mobs.artifact_guard_4={n:'神器守護者',img:'assets/anim/魂騎士/idle_0.png',lv:84,s:'L',beh:'主動',race:'魔法生物',e:'fire',hp:110,ac:5,mr:0,exp:8400,goldMin:900,goldMax:1500,atkSpd:1.5,dmg:[1,3],db:82,hit:100};
  DB.mobs[BOSS_ID]={n:'神器領主',img:'assets/anim/真‧死亡騎士 冥皇丹特斯/idle_0.png',lv:90,s:'L',beh:'主動',race:'魔法生物',boss:true,e:'none',hp:300,ac:5,mr:0,exp:35000,goldMin:5000,goldMax:9000,atkSpd:1.4,dmg:[1,5],db:105,hit:112,noHpCurve:true};

  let pool=[];
  ['artifact_guard_1','artifact_guard_2','artifact_guard_3','artifact_guard_4'].forEach(id=>{for(let i=0;i<5;i++)pool.push(id);});
  pool.push(BOSS_ID);
  DB.maps[MAP_ID]=pool;

  try{
    if(typeof MOB_DROPS!=='undefined'){
      MOB_DROPS['聖域守衛']=[[STONE_ID,0.0035]];
      MOB_DROPS['符文守護者']=[[STONE_ID,0.004]];
      MOB_DROPS['星界監視者']=[[STONE_ID,0.0045]];
      MOB_DROPS['神器守護者']=[[STONE_ID,0.005]];
      if(!MOB_DROPS['神器領主'])MOB_DROPS['神器領主']=[];
    }
  }catch(e){}

  try{
    if(typeof MAP_CATEGORIES!=='undefined'&&MAP_CATEGORIES.special&&!MAP_CATEGORIES.special.some(x=>x.v===MAP_ID)){
      MAP_CATEGORIES.special.push({v:MAP_ID,t:'神器聖域',c:'#facc15'});
    }
    if(typeof MAP_REGIONS!=='undefined'&&Array.isArray(MAP_REGIONS)&&!MAP_REGIONS.some(r=>(r.maps||[]).some(m=>m.v===MAP_ID))){
      MAP_REGIONS.push({key:'artifact',label:'神器聖域',maps:[{v:MAP_ID,t:'神器聖域'}]});
    }
    if(typeof rebuildMapCategoryOptions==='function')rebuildMapCategoryOptions();
  }catch(e){}
  return true;
}

function toast(msg){
  try{if(typeof logSys==='function')logSys(`<span class="text-violet-300 font-bold">【專武】${esc(msg)}</span>`);}catch(e){}
  let n=document.createElement('div');
  n.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:10000;background:rgba(15,23,42,.96);border:1px solid #a78bfa;color:#fff;padding:8px 14px;border-radius:8px;font-weight:800;box-shadow:0 0 20px rgba(124,58,246,.45)';
  n.textContent=msg;document.body.appendChild(n);setTimeout(()=>n.remove(),1600);
}
function pulse(label,big){
  if(!document.body)return;
  let e=document.createElement('div');
  e.className='classweapon-fx'+(big?' big':'');
  e.innerHTML=`<span>${big?'✦ ':'✨ '}${esc(label)}</span>`;
  document.body.appendChild(e);setTimeout(()=>{try{e.remove();}catch(_){}},620);
}

function refresh(){
  try{if(typeof resetCatchupGainItemIndex==='function')resetCatchupGainItemIndex();}catch(e){}
  try{if(typeof autoSortInventory==='function')autoSortInventory();}catch(e){}
  try{if(typeof calcStats==='function')calcStats();}catch(e){}
  try{if(typeof renderTabs==='function')renderTabs();}catch(e){}
  try{if(typeof updateUI==='function')updateUI();}catch(e){}
  try{if(typeof saveGame==='function')saveGame();}catch(e){}
  renderPanel();
}

function upgradeWeapon(id){
  let a=WEAPONS[id],it=findWeaponInstance(id);
  if(!a||!it)return toast('尚未持有這把專武。');
  if(clsNow()!==a.cls)return toast(`只有${CLASS_NAMES[a.cls]}可以升階。`);
  let t=weaponTier(it);
  if(t>=5)return toast('這把專武已經是最高 5 階。');
  let need=UPGRADE_COST[t];
  if(countItem(STONE_ID)<need)return toast(`專武升階石不足，需要 ${need} 顆。`);
  if(!consumeItem(STONE_ID,need))return toast('升階石扣除失敗。');
  it.artifactTier=t+1;
  toast(`${a.n} 升至【${t+1}階】！`);
  pulse(`${a.n} ${t+1}階`,true);
  refresh();
}

function grantWeapon(id,silent){
  if(!ready()||!WEAPONS[id])return null;
  let w={
    id:id,uid:(typeof uid==='function'?uid():('cw_'+Date.now()+'_'+Math.random())),
    cnt:1,en:0,bless:false,anc:false,attr:false,seteff:false,
    lootQ:'white',lootAff:[],lock:false,junk:false,artifactTier:1
  };
  
  player.inv.push(w);
  try{if(typeof registerEquipObtained==='function')registerEquipObtained(id);}catch(e){}
  if(!silent){
    try{if(typeof logSys==='function')logSys(`<span class="sys-item-gain">獲得專武：<span class="text-amber-300 font-bold">${esc(WEAPONS[id].n)}【1階】</span></span>`);}catch(e){}
  }
  refresh();
  return w;
}

function characteristicDamage(a,t,mainDmg){
  let d=(player&&player.d)||{}, intv=Number(d.int!=null?d.int:player.int)||0, md=Number(d.magicDmg)||0;
  if(a.cls==='mage'||a.cls==='illusion'){
    return Math.max(1,Math.floor(50+t*30+intv*3+md*5+mainDmg*a.mult[t-1]));
  }
  return Math.max(1,Math.floor(mainDmg*a.mult[t-1]));
}
function stage5Damage(mainDmg,a){

  let d=(player&&player.d)||{};
  let intv=Number(d.int!=null?d.int:player.int)||0;
  let md=Number(d.magicDmg)||0;
  let lv=Number(player&&player.lv)||1;

  /* 魔法職維持原本魔法成長，避免再把法系往上推 */
  if(a && (a.cls==='mage' || a.cls==='illusion')){
    return Math.max(
      1,
      Math.floor(
        Math.max(
          mainDmg*2.25,
          320+lv*10+intv*6+md*9
        )
      )
    );
  }

  /* 物理／遠程專武：5階單體爆發補強 */
  let mult=4.0;

  if(a){
    if(a.cls==='knight') mult=5.0;
    else if(a.cls==='warrior') mult=5.2;
    else if(a.cls==='dark') mult=4.8;
    else if(a.cls==='dragon') mult=4.6;
    else if(a.cls==='elf'){
      mult=a.meleeElf ? 4.6 : 4.2;
    }
    else if(a.cls==='royal') mult=4.0;
  }

  return Math.max(
    1,
    Math.floor(mainDmg*mult)
  );
}
function addDamage(target,amount,label,ele,big){
  if(!target||target._dead||target.curHp<=0)return 0;
  let dmg=Math.max(1,Math.floor(Number(amount)||0));
  target.curHp-=dmg;target.justHit=ele||'none';target._spellHurt=true;
  try{if(typeof mobWake==='function')mobWake(target);}catch(e){}
  try{if(typeof playMobHurt==='function')playMobHurt(target);}catch(e){}
  try{if(typeof logCombat==='function')logCombat(`<span class="font-bold" style="color:${big?'#fbbf24':'#c4b5fd'};text-shadow:0 0 6px #7c3aed;">【${label}】</span> 追加造成 ${dmg} 點${big?'專武魔法':'專武'}傷害。`,'player-special');}catch(e){}
  pulse(label,!!big);
  if(target.curHp<=0){
    let idx=(typeof mapState!=='undefined'&&mapState&&Array.isArray(mapState.mobs))?mapState.mobs.indexOf(target):-1;
    if(idx>=0&&typeof killMob==='function')killMob(idx);
  }
  return dmg;
}

function installCombatHook(){
  if(typeof window.playerAttack!=='function'||window.playerAttack.__classWeaponWrapped)return;
  const original=window.playerAttack;
  function wrapped(){
    let target=null,before=0,uid0=null;
    try{target=(typeof getTarget==='function')?getTarget():null;if(target){before=Number(target.curHp)||0;uid0=target.uid;}}catch(e){}
    let out=original.apply(this,arguments);
    try{
      if(!target||target._dead||target.uid!==uid0||before<=0)return out;
      let after=Math.max(0,Number(target.curHp)||0),mainDmg=Math.max(0,before-after);
      if(mainDmg<=0||after<=0)return out;
      let it=equippedWeapon(); if(!it)return out;
      let a=WEAPONS[it.id]; if(!a||clsNow()!==a.cls)return out;

      // 🔥 烈焰精靈劍：所有妖精可裝，但只有火妖會觸發專武特效
      if(a.fireElf && (!player || player.elfEle !== 'fire')) return out;

      let t=weaponTier(it),rate=a.rate[t-1]||0;
      if(Math.random()*100<rate&&target.curHp>0)addDamage(target,characteristicDamage(a,t,mainDmg),a.passive,a.ele,false);
      if(t>=5&&target.curHp>0&&Math.random()*100<20)addDamage(target,stage5Damage(mainDmg,a),a.special,a.ele,true);
    }catch(e){console.warn('[專武] 特效錯誤',e);}
    return out;
  }
  wrapped.__classWeaponWrapped=true;window.playerAttack=wrapped;
}


/* ===== 🤝 傭兵職業專武特效 v64 ===== */

function allyClassWeaponCharacteristicDamage(ally,a,t,mainDmg){

  let d=(ally&&ally.d)||{};
  let intv=Number(d.int!=null?d.int:(ally&&ally.int))||0;
  let md=Number(d.magicDmg)||0;

  if(a.cls==='mage'||a.cls==='illusion'){
    return Math.max(
      1,
      Math.floor(
        50+t*30+intv*3+md*5+
        mainDmg*a.mult[t-1]
      )
    );
  }

  return Math.max(
    1,
    Math.floor(mainDmg*a.mult[t-1])
  );
}

function allyClassWeaponStage5Damage(ally,a,mainDmg){

  let d=(ally&&ally.d)||{};
  let intv=Number(d.int!=null?d.int:(ally&&ally.int))||0;
  let md=Number(d.magicDmg)||0;
  let lv=Number(ally&&ally.lv)||1;

  /* 法師／幻術維持法系公式 */
  if(a.cls==='mage'||a.cls==='illusion'){
    return Math.max(
      1,
      Math.floor(
        Math.max(
          mainDmg*2.25,
          320+lv*10+intv*6+md*9
        )
      )
    );
  }

  /* 與玩家 v63 五階專武倍率完全一致 */
  let mult=4.0;

  if(a.cls==='knight') mult=5.0;
  else if(a.cls==='warrior') mult=5.2;
  else if(a.cls==='dark') mult=4.8;
  else if(a.cls==='dragon') mult=4.6;
  else if(a.cls==='elf'){
    mult=a.meleeElf ? 4.6 : 4.2;
  }
  else if(a.cls==='royal') mult=4.0;

  return Math.max(
    1,
    Math.floor(mainDmg*mult)
  );
}

function allyClassWeaponDamage(ally,target,amount,label,ele,big){

  if(
    !ally ||
    !target ||
    target._dead ||
    target.curHp<=0
  ) return 0;

  let dmg=Math.max(1,Math.floor(Number(amount)||0));
  let before=Number(target.curHp)||0;
  let dealt=0;

  /*
   * 優先走正式傭兵傷害函式：
   * - 正確記錄 DPS
   * - 正確處理擊殺
   * - 正確處理各種受傷效果
   */
  if(typeof _allyDamageMob==='function'){

    _allyDamageMob(
      ally,
      target,
      dmg,
      ele||'none'
    );

    dealt=Math.max(
      0,
      before-Math.max(0,Number(target.curHp)||0)
    );

  }else{

    target.curHp-=dmg;
    target.justHit=ele||'none';
    dealt=Math.min(before,dmg);

    try{
      if(typeof mobWake==='function')
        mobWake(target);
    }catch(e){}

    if(target.curHp<=0){
      let idx=(
        typeof mapState!=='undefined' &&
        mapState &&
        Array.isArray(mapState.mobs)
      ) ? mapState.mobs.indexOf(target) : -1;

      if(idx>=0 && typeof killMob==='function')
        killMob(idx);
    }
  }

  try{
    if(typeof logCombat==='function'){
      let name=
        ally._allyName ||
        ally.name ||
        CLASS_NAMES[
          CLASS_ALIASES[ally.cls]||ally.cls
        ] ||
        '傭兵';

      logCombat(
        `<span class="font-bold" style="color:${big?'#fbbf24':'#c4b5fd'}">`+
        `【協力·${esc(name)}·${esc(label)}】</span>`+
        ` 追加造成 ${dealt||dmg} 點${big?'專武魔法':'專武'}傷害。`,
        'player-special'
      );
    }
  }catch(e){}

  return dealt||dmg;
}

function installAllyCombatHook(){

  if(
    typeof window.allyWeaponProcs!=='function' ||
    window.allyWeaponProcs.__classWeaponAllyWrapped
  ) return;

  const original=window.allyWeaponProcs;

  function wrapped(ally,target,hitInfo,instOverride){

    let out=original.apply(this,arguments);

    try{

      if(
        !ally ||
        !target ||
        target._dead ||
        target.curHp<=0 ||
        !hitInfo ||
        !hitInfo.hit
      ) return out;

      let inst=
        instOverride ||
        (ally.eq&&ally.eq.wpn);

      if(!inst) return out;

      let a=WEAPONS[inst.id];
      if(!a) return out;

      let allyCls=
        CLASS_ALIASES[ally.cls] ||
        ally.cls ||
        '';

      if(allyCls!==a.cls) return out;

      /* 火妖專武只有火屬妖精發動 */
      if(
        a.fireElf &&
        ally.elfEle!=='fire'
      ) return out;

      let mainDmg=Math.max(
        0,
        Number(hitInfo.dmg)||0
      );

      if(mainDmg<=0) return out;

      let t=weaponTier(inst);
      let rate=a.rate[t-1]||0;

      /* 70% 等職業特效 */
      if(
        Math.random()*100<rate &&
        target.curHp>0
      ){
        allyClassWeaponDamage(
          ally,
          target,
          allyClassWeaponCharacteristicDamage(
            ally,a,t,mainDmg
          ),
          a.passive,
          a.ele,
          false
        );
      }

      /* 5階 20% 專屬魔法 */
      if(
        t>=5 &&
        target.curHp>0 &&
        Math.random()*100<20
      ){
        allyClassWeaponDamage(
          ally,
          target,
          allyClassWeaponStage5Damage(
            ally,a,mainDmg
          ),
          a.special,
          a.ele,
          true
        );
      }

    }catch(e){
      console.warn(
        '[專武] 傭兵特效錯誤',
        e
      );
    }

    return out;
  }

  wrapped.__classWeaponAllyWrapped=true;
  window.allyWeaponProcs=wrapped;
}


function installBossHook(){
  if(typeof window.killMob!=='function'||window.killMob.__classWeaponWrapped)return;
  const original=window.killMob;
  function wrapped(idx){
    let mob=null,drop=false;
    try{
      mob=mapState&&mapState.mobs?mapState.mobs[idx]:null;
      drop=!!(mob&&mob.n==='神器領主'&&!mob._dead&&!mob._classWeaponDropDone);
      if(drop)mob._classWeaponDropDone=true;
    }catch(e){}
    let out=original.apply(this,arguments);
    if(drop){
      try{
        // 0.001% = 0.00001
        let roll = Math.random();

        if(roll < 0.00001){
          let id = WEAPON_IDS[
            Math.floor(Math.random() * WEAPON_IDS.length)
          ];

          let w = grantWeapon(id,true);

          if(w && typeof logSys === 'function'){
            logSys(
              `<span class="text-amber-300 font-bold">神器領主掉落了【${esc(WEAPONS[id].n)}】！</span>`
            );
          }
        }
      }catch(e){
        console.warn('[專武] 頭目掉落錯誤',e);
      }
    }
    return out;
  }
  wrapped.__classWeaponWrapped=true;window.killMob=wrapped;
}

function installNameHook(){
  if(typeof window.getItemFullName!=='function'||window.getItemFullName.__classWeaponWrapped)return;
  const original=window.getItemFullName;
  function wrapped(item){
    let html=original.apply(this,arguments);
    try{
      if(item&&isClassWeaponId(item.id)){
        html += ` <span style="color:#fde68a;font-weight:800">【${weaponTier(item)}階】</span>`;
      }
    }catch(e){}
    return html;
  }
  wrapped.__classWeaponWrapped=true;window.getItemFullName=wrapped;
}

function style(){
  if(document.getElementById('class-weapon-style'))return;
  let st=document.createElement('style');st.id='class-weapon-style';
  st.textContent=`
#artifact-open-btn{position:fixed;right:14px;bottom:112px;z-index:9997;background:linear-gradient(#7c2d12,#451a03);border:1px solid #fbbf24;color:#fff7ed;border-radius:10px;padding:9px 13px;font-weight:800;box-shadow:0 0 18px rgba(245,158,11,.35);cursor:pointer}
#artifact-panel{position:fixed;right:14px;bottom:158px;width:min(430px,calc(100vw - 28px));max-height:72vh;overflow:auto;z-index:9998;background:rgba(15,23,42,.97);border:1px solid #f59e0b;border-radius:12px;box-shadow:0 0 35px rgba(0,0,0,.75);padding:12px;color:#e2e8f0;font-family:inherit}
#artifact-panel.hidden{display:none}.art-head{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #475569;padding-bottom:8px;margin-bottom:9px}.art-head b{color:#fde68a;font-size:18px}.art-close{background:#334155;border:1px solid #64748b;color:#fff;border-radius:6px;padding:3px 8px;cursor:pointer}.art-info{font-size:13px;color:#cbd5e1;margin-bottom:8px}.art-card{border:1px solid #475569;background:rgba(30,41,59,.85);border-radius:9px;padding:9px;margin:7px 0}.art-card.active{border-color:#facc15;box-shadow:0 0 12px rgba(250,204,21,.2)}.art-title{display:flex;justify-content:space-between;gap:8px;font-weight:800;color:#f8fafc}.art-sub{font-size:12px;color:#fdba74;margin:4px 0}.art-desc{font-size:12px;color:#94a3b8;line-height:1.45}.art-actions{display:flex;gap:6px;margin-top:7px}.art-actions button{flex:1;border-radius:6px;border:1px solid #64748b;background:#334155;color:#fff;padding:6px;cursor:pointer;font-weight:700}.art-actions button.up{background:#7c2d12;border-color:#fb923c}.art-actions button:disabled{opacity:.38;cursor:not-allowed}.art-max{color:#facc15;font-weight:800}.art-wrong{color:#fca5a5}.classweapon-fx{pointer-events:none;position:fixed;inset:0;z-index:9996;display:flex;align-items:center;justify-content:center;animation:classWeaponFx .52s ease-out forwards}.classweapon-fx span{font-size:28px;font-weight:900;color:#fed7aa;text-shadow:0 0 8px #c2410c,0 0 22px #f59e0b;background:rgba(15,23,42,.48);border:1px solid rgba(251,191,36,.8);border-radius:999px;padding:12px 22px}.classweapon-fx.big span{font-size:34px;color:#fde68a;text-shadow:0 0 10px #f59e0b,0 0 28px #dc2626}@keyframes classWeaponFx{0%{opacity:0;transform:scale(.55)}30%{opacity:1;transform:scale(1.08)}100%{opacity:0;transform:scale(1.3)}}
`;
  document.head.appendChild(st);
}
function ensurePanel(){
  style();
  let b=document.getElementById('artifact-open-btn');
  if(!b){b=document.createElement('button');b.id='artifact-open-btn';b.type='button';b.onclick=toggle;document.body.appendChild(b);}
  b.textContent='🗡️ 專武';
  if(!document.getElementById('artifact-panel')){
    let p=document.createElement('section');p.id='artifact-panel';p.className='hidden';document.body.appendChild(p);
  }
  renderPanel();
}
function toggle(){let p=document.getElementById('artifact-panel');if(!p)return;p.classList.toggle('hidden');if(!p.classList.contains('hidden'))renderPanel();}
function renderPanel(){
  let p=document.getElementById('artifact-panel');if(!p||!ready())return;
  migrateWeapons();
  let cls=clsNow(),stones=countItem(STONE_ID),eq=equippedWeapon();
  let rows=WEAPON_IDS.filter(ownsWeapon).map(id=>{
    let a=WEAPONS[id],it=findWeaponInstance(id),t=weaponTier(it),allowed=cls===a.cls,isEq=!!(eq&&eq===it),need=t<5?UPGRADE_COST[t]:0;
    return `<div class="art-card${isEq?' active':''}"><div class="art-title"><span>${esc(a.n)}【${t}階】</span><span>${esc(CLASS_NAMES[a.cls])}</span></div><div class="art-sub">${esc(a.passive)}：${a.rate[t-1]}% 觸發${t>=5?'　·　<span class="art-max">5階魔法已解鎖</span>':''}</div><div class="art-desc">${esc(a.desc)}${t>=5?` 5階額外解鎖「${esc(a.special)}」。`:''}<br>${isEq?'<b style="color:#facc15">目前已裝備</b>':'目前在背包；請從背包的「武器」分類裝備。'}</div><div class="art-actions"><button disabled>${isEq?'已裝備':'背包裝備'}</button><button class="up" ${allowed&&t<5&&stones>=need?'':'disabled'} onclick="ClassWeapon.upgrade('${id}')">${t>=5?'已滿階':`升階（${need}石）`}</button></div>${allowed?'':'<div class="art-wrong" style="font-size:11px;margin-top:5px">目前職業不能裝備這把專武，可放倉庫給其他角色。</div>'}</div>`;
  }).join('');
  if(!rows)rows='<div class="art-info">目前沒有專武。前往「神器聖域」擊敗神器領主可隨機取得。</div>';
  p.innerHTML=`<div class="art-head"><b>🗡️ 職業專屬武器</b><button class="art-close" onclick="ClassWeapon.toggle()">關閉</button></div><div class="art-info">目前職業：<b>${esc(CLASS_NAMES[cls]||cls||'未載入')}</b>　｜　專武升階石：<b style="color:#fbbf24">${stones}</b><br>升階需求：10 → 20 → 40 → 80。每把專武獨立升階；只有實際裝備在武器欄時才會觸發職業特性與 5 階魔法。</div>${rows}`;
}

window.ClassWeapon={
  toggle,upgrade:upgradeWeapon,render:renderPanel,weapons:WEAPONS,stoneId:STONE_ID,mapId:MAP_ID,
  grantTest:function(){
    if(!ready())return toast('請先進入角色再發放測試物品。');
    if(typeof gainItem==='function')gainItem(STONE_ID,200,false,true);
    WEAPON_IDS.forEach(id=>grantWeapon(id,true));
    toast('已發放 8 把測試專武與 200 顆升階石。');
    refresh();
  }
};
// 舊按鈕/舊 inline handler 相容
window.ClassArtifact=window.ClassWeapon;

function boot(){
  if(!registerData()){setTimeout(boot,400);return;}
  ensurePanel();
  installCombatHook();installAllyCombatHook();installBossHook();installNameHook();
  setInterval(()=>{
    try{
      if(ready())migrateWeapons();
      installCombatHook();installAllyCombatHook();installBossHook();installNameHook();
      let p=document.getElementById('artifact-panel');
      if(p&&!p.classList.contains('hidden'))renderPanel();
    }catch(e){}
  },1800);
  console.info('[專武] 職業專武系統 v2 已載入');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));
else setTimeout(boot,0);
})();


/* ===== 職業專武統一補丁 v2.6 ===== */
(function(){
'use strict';

const TIER_BONUS = {
 royal:{
   dmg:[0,10,20,35,55,80],
   hit:[0,3,6,10,14,18],
   crit:[0,3,6,9,12,15],
   critDmg:[0,10,20,32,48,65]
 },
 knight:{
   dmg:[0,15,30,50,80,130],
   hit:[0,3,6,10,15,20],
   crit:[0,4,8,13,19,25],
   critDmg:[0,15,30,50,78,115]
 },
 mage:{
   magic:[0,12,24,40,65,95],
   mp:[0,6,12,20,30,40],
   mhit:[0,3,6,10,14,18],
   crit:[0,3,6,10,14,18],
   critDmg:[0,10,22,36,55,75]
 },
 elf:{
   dmg:[0,12,24,40,65,95],
   hit:[0,3,6,10,14,18],
   crit:[0,4,8,12,16,20],
   critDmg:[0,12,25,40,60,85]
 },
 dark:{
   dmg:[0,12,24,40,65,95],
   hit:[0,3,6,10,14,18],
   crit:[0,5,10,15,20,25],
   critDmg:[0,12,25,40,60,80]
 },
 illusion:{
   magic:[0,10,20,35,55,85],
   mp:[0,6,11,18,26,36],
   mhit:[0,3,6,10,14,18],
   crit:[0,3,6,9,13,17],
   critDmg:[0,10,20,34,52,70]
 },
 dragon:{
   dmg:[0,14,28,45,70,100],
   hit:[0,3,6,10,14,18],
   crit:[0,4,8,12,16,20],
   critDmg:[0,12,25,42,65,90]
 },
 warrior:{
   dmg:[0,16,32,50,80,115],
   hit:[0,3,6,10,14,18],
   crit:[0,4,8,12,17,22],
   critDmg:[0,18,36,58,88,120]
 }
};

function defs(){
 try{
   return window.ClassWeapon &&
          window.ClassWeapon.weapons
          ? window.ClassWeapon.weapons
          : {};
 }catch(e){
   return {};
 }
}

function info(item){
 if(!item || !item.id) return null;

 let a = defs()[item.id];
 if(!a) return null;

 let t = Math.max(
   1,
   Math.min(5,Number(item.artifactTier)||1)
 );

 return {
   a:a,
   t:t,
   rate:(a.rate && a.rate[t-1]) || 0
 };
}


/* 清除舊測試欄位 */
function cleanOld(){

 if(
   typeof player === 'undefined' ||
   !player
 ) return false;

 let all = defs();
 if(!Object.keys(all).length) return false;

 let changed = false;

 function clean(it){

   if(!it || !all[it.id]) return;

   if(
     Object.prototype.hasOwnProperty.call(
       it,'gw'
     )
   ){
     delete it.gw;
     changed = true;
   }

   it.cnt = 1;
   it.lootQ = 'white';
   it.lootAff = [];
   it.bless = false;
   it.anc = false;
   it.attr = false;
   it.seteff = false;
   it.junk = false;

   if(!it.artifactTier)
     it.artifactTier = 1;
 }

 if(Array.isArray(player.inv))
   player.inv.forEach(clean);

 try{
   if(player.eq && player.eq.wpn)
     clean(player.eq.wpn);
 }catch(e){}

 if(changed){
   try{
     if(typeof saveGame === 'function')
       saveGame();
   }catch(e){}
 }

 return true;
}


/* ===== 階級實際能力 ===== */

function add(d,k,v){
 if(!v) return;
 d[k] = (Number(d[k])||0) + Number(v);
}

function equipped(){

 try{

   if(
     !player ||
     !player.eq ||
     !player.eq.wpn
   ) return null;

   let item = player.eq.wpn;
   let x = info(item);

   if(!x) return null;

   return {
     item:item,
     a:x.a,
     t:x.t
   };

 }catch(e){
   return null;
 }
}

function applyTierBonus(){

 let x = equipped();

 if(!x || !player.d) return;

 let b = TIER_BONUS[x.a.cls];
 if(!b) return;

 let d = player.d;
 let t = x.t;

 if(
   x.a.cls === 'royal' ||
   x.a.cls === 'knight' ||
   x.a.cls === 'dragon'
 ){
   add(d,'meleeDmg',b.dmg[t]);
   add(d,'meleeHit',b.hit[t]);
   add(d,'meleeCrit',b.crit[t]);
   add(d,'meleeCritDmg',b.critDmg[t]);
 }

 else if(x.a.cls === 'elf'){

   if(x.a.meleeElf){
     add(d,'meleeDmg',b.dmg[t]);
     add(d,'meleeHit',b.hit[t]);
     add(d,'meleeCrit',b.crit[t]);
     add(d,'meleeCritDmg',b.critDmg[t]);
   }else{
     add(d,'rangedDmg',b.dmg[t]);
     add(d,'rangedHit',b.hit[t]);
     add(d,'rangedCrit',b.crit[t]);
     add(d,'rangedCritDmg',b.critDmg[t]);
   }
 }

 else if(x.a.cls === 'dark'){
   add(d,'meleeDmg',b.dmg[t]);
   add(d,'meleeHit',b.hit[t]);
   add(d,'meleeCrit',b.crit[t]);
   add(d,'meleeCritDmg',b.critDmg[t]);
 }

 else if(x.a.cls === 'warrior'){
   add(d,'meleeDmg',b.dmg[t]);
   add(d,'meleeHit',b.hit[t]);
   add(d,'meleeCrit',b.crit[t]);
   add(d,'meleeCritDmg',b.critDmg[t]);
 }

 else if(
   x.a.cls === 'mage' ||
   x.a.cls === 'illusion'
 ){
   add(d,'magicDmg',b.magic[t]);
   add(d,'extraMp',b.mp[t]);
   add(d,'magicHit',b.mhit[t]);
   add(d,'magicCrit',b.crit[t]);
   add(d,'magicCritDmg',b.critDmg[t]);
 }
}

/* ===== 顯示階級能力 ===== */

function bonusRows(item){

 let x = info(item);
 if(!x) return [];

 let b = TIER_BONUS[x.a.cls];
 if(!b) return [];

 let t = x.t;
 let rows = [];

 if(
   x.a.cls === 'royal' ||
   x.a.cls === 'knight' ||
   x.a.cls === 'dragon'
 ){
   rows.push('近距離傷害 +' + b.dmg[t]);
   rows.push('近距離命中 +' + b.hit[t]);
   rows.push('近距離爆擊 +' + b.crit[t] + '%');
   rows.push('近距離爆擊傷害 +' + b.critDmg[t] + '%');
 }

 else if(x.a.cls === 'elf'){

   if(x.a.meleeElf){
     rows.push('近距離傷害 +' + b.dmg[t]);
     rows.push('近距離命中 +' + b.hit[t]);
     rows.push('近距離爆擊 +' + b.crit[t] + '%');
     rows.push('近距離爆擊傷害 +' + b.critDmg[t] + '%');
   }else{
     rows.push('遠距離傷害 +' + b.dmg[t]);
     rows.push('遠距離命中 +' + b.hit[t]);
     rows.push('遠距離爆擊 +' + b.crit[t] + '%');
     rows.push('遠距離爆擊傷害 +' + b.critDmg[t] + '%');
   }
 }

 else if(x.a.cls === 'dark'){
   rows.push('近距離傷害 +' + b.dmg[t]);
   rows.push('近距離命中 +' + b.hit[t]);
   rows.push('近距離爆擊 +' + b.crit[t] + '%');
   rows.push('近距離爆擊傷害 +' + b.critDmg[t] + '%');
 }

 else if(x.a.cls === 'warrior'){
   rows.push('近距離傷害 +' + b.dmg[t]);
   rows.push('近距離命中 +' + b.hit[t]);
   rows.push('近距離爆擊 +' + b.crit[t] + '%');
   rows.push('近距離爆擊傷害 +' + b.critDmg[t] + '%');
 }

 else if(
   x.a.cls === 'mage' ||
   x.a.cls === 'illusion'
 ){
   rows.push('魔法傷害 +' + b.magic[t]);
   rows.push('額外魔法點數 +' + b.mp[t]);
   rows.push('魔法命中 +' + b.mhit[t]);
   rows.push('魔法爆擊 +' + b.crit[t] + '%');
   rows.push('魔法爆擊傷害 +' + b.critDmg[t] + '%');
 }

 return rows;
}

/* ===== 物品詳細頁 ===== */

function installDesc(){

 if(
   typeof window.buildItemDescHTML !== 'function' ||
   window.buildItemDescHTML.__classWeapon26
 ) return false;

 const old = window.buildItemDescHTML;

 window.buildItemDescHTML = function(item){

   let html = old.apply(this,arguments);

   try{

     let x = info(item);

     if(!x) return html;

     let rows = bonusRows(item);

     html += `
<div style="
 margin-top:14px;
 padding:12px;
 border:1px solid #d97706;
 border-radius:9px;
 background:rgba(120,53,15,.15);
 line-height:1.75
">

 <div style="
   color:#fbbf24;
   font-size:17px;
   font-weight:900
 ">
   🗡️ 專武特效
 </div>

 <div style="
   color:#fdba74;
   font-weight:900
 ">
   ${x.a.passive}：
   ${x.rate}% 機率觸發
 </div>

 <div style="color:#cbd5e1">
   專武階級：
   <b style="color:#fde68a">
     ${x.t}階
   </b>
 </div>

 ${
   x.t >= 5
   ? `
   <div style="
      color:#facc15;
      font-weight:900
   ">
      ✦ 5階專屬魔法：
      ${x.a.special}（20%）
   </div>`
   : `
   <div style="color:#94a3b8">
      ✦ 5階解鎖：
      ${x.a.special}
   </div>`
 }

 <div style="
   color:#a78bfa;
   font-size:12px
 ">
   不產生隨機詞綴・使用專武升階石升階
 </div>

</div>

<div style="
 margin-top:10px;
 padding:11px 12px;
 border:1px solid #7c3aed;
 border-radius:9px;
 background:rgba(76,29,149,.12);
 line-height:1.75
">

 <div style="
   color:#c4b5fd;
   font-weight:900
 ">
   ◆ ${x.t}階能力加成
 </div>

 <div style="
   color:#ddd6fe;
   margin-top:4px
 ">
   ${rows.join('<br>')}
 </div>

</div>`;

   }catch(e){}

   return html;
 };

 window.buildItemDescHTML.__classWeapon26 = true;

 return true;
}


/* ===== calcStats 只包一次 ===== */

function installCalc(){

 if(
   typeof window.calcStats !== 'function' ||
   window.calcStats.__classWeapon26
 ) return false;

 const old = window.calcStats;

 window.calcStats = function(){

   let r = old.apply(this,arguments);

   try{
     applyTierBonus();
   }catch(e){}

   return r;
 };

 window.calcStats.__classWeapon26 = true;

 try{
   window.calcStats();
 }catch(e){}

 return true;
}


/* 只等待函式載入，不再永久重複包裝 */
let tries = 0;

let timer = setInterval(function(){

 tries++;

 cleanOld();

 let a = installDesc();
 let b = installCalc();

 if(
   (
     window.buildItemDescHTML &&
     window.buildItemDescHTML.__classWeapon26
   ) &&
   (
     window.calcStats &&
     window.calcStats.__classWeapon26
   )
 ){
   clearInterval(timer);
 }

 if(tries > 40)
   clearInterval(timer);

},250);

})();

































/* ===== 神器聖域純背景版 v4.7 ===== */
(function(){
'use strict';

function artifactBg47(){

    if(!document.getElementById('artifact-bg-v47')){

        const st = document.createElement('style');
        st.id = 'artifact-bg-v47';

        st.textContent = `

        /*
         * 只修改戰鬥區最底層。
         * 不修改 mob-target，
         * 不顯示空白怪物格，
         * 不改位置、大小、寬度。
         */
        #mob-list.artifact-bg-v47{

            background-image:
                linear-gradient(
                    rgba(20,10,35,.18),
                    rgba(35,10,55,.24)
                ),
                url("assets/area/1920x1080/傲慢之塔.jpg") !important;

            background-size: cover !important;
            background-position: center center !important;
            background-repeat: no-repeat !important;

            box-shadow:
                inset 0 0 32px rgba(0,0,0,.82),
                inset 0 -22px 42px rgba(76,29,149,.18)
                !important;
        }

        `;

        document.head.appendChild(st);
    }

    const ml = document.getElementById('mob-list');
    if(!ml) return;

    try{
        if(
            typeof mapState !== 'undefined' &&
            mapState &&
            mapState.current === 'artifact_sanctum'
        ){
            ml.classList.add('artifact-bg-v47');
        }else{
            ml.classList.remove('artifact-bg-v47');
        }
    }catch(e){}
}

setInterval(artifactBg47,300);

})();


/* ===== 神器領主頭目樣式 v4.8 ===== */
(function(){
'use strict';

function installBossStyle(){

    if(!document.getElementById('artifact-boss-style-v48')){

        const st = document.createElement('style');
        st.id = 'artifact-boss-style-v48';

        st.textContent = `

        #mob-list .artifact-boss-v48{
            border-color:#facc15 !important;

            box-shadow:
                0 0 8px rgba(250,204,21,.55),
                0 0 18px rgba(245,158,11,.25),
                inset 0 0 14px rgba(250,204,21,.08)
                !important;
        }

        #mob-list .artifact-boss-v48::before{
            content:"★ 神器領主 ★";

            position:absolute;
            top:7px;
            left:50%;
            transform:translateX(-50%);

            white-space:nowrap;

            font-size:12px;
            font-weight:900;

            color:#fde68a;

            text-shadow:
                0 1px 2px #000,
                0 0 6px rgba(250,204,21,.8);

            z-index:20;
            pointer-events:none;
        }

        `;

        document.head.appendChild(st);
    }
}


function markArtifactBoss(){

    installBossStyle();

    const ml = document.getElementById('mob-list');
    if(!ml) return;

    /* 先清除舊標記 */
    ml.querySelectorAll('.artifact-boss-v48')
      .forEach(function(card){
          card.classList.remove('artifact-boss-v48');
      });

    try{

        if(
            typeof mapState === 'undefined' ||
            !mapState ||
            mapState.current !== 'artifact_sanctum' ||
            !Array.isArray(mapState.mobs)
        ) return;

        mapState.mobs.forEach(function(m){

            if(
                !m ||
                m.n !== '神器領主' ||
                !m.uid
            ) return;

            const card = ml.querySelector(
                '.mob-target[data-uid="' + m.uid + '"]'
            );

            if(card)
                card.classList.add('artifact-boss-v48');
        });

    }catch(e){}
}

setInterval(markArtifactBoss,250);

})();


/* ===== 神器領主金紅血條 v5.0 ===== */
(function(){
'use strict';

if(!document.getElementById('artifact-boss-hp-v50')){

    const st = document.createElement('style');
    st.id = 'artifact-boss-hp-v50';

    st.textContent = `

    /* 神器領主血條底槽 */
    #mob-list .artifact-boss-v48
    .mob-hp-bar > div{
        background:
            linear-gradient(
                90deg,
                #3f2a0a,
                #574012
            ) !important;

        box-shadow:
            0 0 4px rgba(250,204,21,.45),
            inset 0 0 2px rgba(0,0,0,.8)
            !important;
    }


    /* 神器領主目前 HP */
    #mob-list .artifact-boss-v48
    .mob-hp-bar > div > div{
        background:
            linear-gradient(
                90deg,
                #b91c1c 0%,
                #ef4444 48%,
                #f59e0b 100%
            ) !important;

        box-shadow:
            0 0 5px rgba(245,158,11,.75)
            !important;
    }

    `;

    document.head.appendChild(st);
}

})();


/* ===== 神器聖域上下邊界裁切 v5.1 ===== */
(function(){
'use strict';

if(!document.getElementById('artifact-sanctum-clip-v51')){

    const st = document.createElement('style');
    st.id = 'artifact-sanctum-clip-v51';

    st.textContent = `

    /*
     * 只裁掉神器聖域戰鬥框外的內容
     * 不改怪物位置、大小、間距
     */
    #mob-list.artifact-bg-v47{
        position:relative !important;

        overflow:hidden !important;
        contain:paint !important;

        /* 避免特效/卡片穿出圓角區 */
        clip-path:inset(0 round 8px);
    }

    `;

    document.head.appendChild(st);
}

})();


/* ===== 神器聖域真正移除怪物卡片 v5.3 ===== */
(function(){
'use strict';

function installArtifactNoCard53(){

    if(document.getElementById('artifact-no-card-v53'))
        return;

    const st = document.createElement('style');
    st.id = 'artifact-no-card-v53';

    st.textContent = `

    /*
     * 只作用於神器聖域。
     * 直接抓 #mob-list 底下真正有 data-uid 的怪物卡。
     */
    html body #mob-list.artifact-bg-v47
    .mob-target[data-uid]{

        background:transparent !important;
        background-image:none !important;

        border-color:transparent !important;
        border-width:0 !important;

        outline:none !important;

        box-shadow:none !important;

        backdrop-filter:none !important;
        -webkit-backdrop-filter:none !important;
    }


    html body #mob-list.artifact-bg-v47
    .mob-target[data-uid] .mob-img-wrap,

    html body #mob-list.artifact-bg-v47
    .mob-target[data-uid] .mob-img-inner{

        background:transparent !important;
        background-image:none !important;

        border:none !important;
        outline:none !important;
        box-shadow:none !important;
    }


    /*
     * 清掉一般怪物卡可能使用的選中遮罩，
     * 但不碰 ::before，
     * 因為神器領主 ★名稱目前用 ::before。
     */
    html body #mob-list.artifact-bg-v47
    .mob-target[data-uid]::after{

        background:transparent !important;
        background-image:none !important;
        border:none !important;
        box-shadow:none !important;
    }


    /*
     * 神器領主也取消整張金框，
     * 改保留名稱金色發光，不再像卡片。
     */
    html body #mob-list.artifact-bg-v47
    .artifact-boss-v48{

        border:none !important;

        box-shadow:none !important;

        background:transparent !important;
    }


    /* 保留神器領主標題 */
    html body #mob-list.artifact-bg-v47
    .artifact-boss-v48::before{

        display:block !important;
        color:#fde68a !important;

        text-shadow:
            0 2px 3px #000,
            0 0 7px #f59e0b,
            0 0 12px rgba(250,204,21,.75)
            !important;
    }

    `;

    document.head.appendChild(st);
}


/*
 * 再用 inline !important 保險，
 * 防止遊戲每次重繪怪物時重新補回紅/藍背景。
 */
function forceArtifactNoCard53(){

    installArtifactNoCard53();

    const ml = document.getElementById('mob-list');

    if(
        !ml ||
        !ml.classList.contains('artifact-bg-v47')
    ) return;

    ml.querySelectorAll(
        '.mob-target[data-uid]'
    ).forEach(function(card){

        card.style.setProperty(
            'background',
            'transparent',
            'important'
        );

        card.style.setProperty(
            'background-image',
            'none',
            'important'
        );

        card.style.setProperty(
            'border-color',
            'transparent',
            'important'
        );

        card.style.setProperty(
            'border-width',
            '0',
            'important'
        );

        card.style.setProperty(
            'box-shadow',
            'none',
            'important'
        );

        card.style.setProperty(
            'outline',
            'none',
            'important'
        );
    });
}

setInterval(forceArtifactNoCard53,250);

})();


/* ===== 公開版停用專武測試發放 ===== */
(function(){
    function disableGrantTest(){
        try{
            if(
                typeof ClassWeapon !== 'undefined' &&
                ClassWeapon
            ){
                ClassWeapon.grantTest = function(){
                    if(typeof toast === 'function')
                        toast('公開版已停用測試發放功能。');
                    return false;
                };
            }
        }catch(e){}
    }

    disableGrantTest();
    setTimeout(disableGrantTest, 500);
})();






