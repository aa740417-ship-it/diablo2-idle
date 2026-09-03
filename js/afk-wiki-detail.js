(function(){
'use strict';
if(window.__AFK_WIKI_DETAIL__)return;window.__AFK_WIKI_DETAIL__=1;
const S={tab:'home',q:'',detail:null};
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=v=>String(v==null?'':v).replace(/<[^>]*>/g,'').trim();
const cls={royal:'王族',knight:'騎士',elf:'妖精',mage:'法師',dark:'黑暗妖精',illusion:'幻術士',dragon:'龍騎士',warrior:'戰士',all:'全職業'};
const ele={none:'無',fire:'火',water:'水',wind:'風',earth:'地'};
const type={wpn:'武器',arm:'防具',acc:'飾品',skillbk:'技能書',scroll:'卷軸',pot:'藥水',etc:'道具',misc:'道具'};
let cache=null;
function mapNames(){const o={};try{(MAP_REGIONS||[]).forEach(r=>(r.maps||[]).forEach(m=>o[m.v]=m.t||m.v));}catch(e){}return o;}
function knowledge(){if(cache)return cache;const names=mapNames(),mobMaps={},itemDrops={},mobDrops={};try{if(typeof _wcBuildKnowledge==='function'){const k=_wcBuildKnowledge();Object.keys(k.mobMaps||{}).forEach(mn=>mobMaps[mn]=(k.mobMaps[mn]||[]).map(x=>x&&x.name?x.name:String(x)));Object.keys(k.itemDrops||{}).forEach(id=>itemDrops[id]=(k.itemDrops[id]||[]).map(r=>({id:r.itemId,mob:r.mob,rate:r.rate})));Object.keys(k.mobDrops||{}).forEach(mn=>mobDrops[mn]=(k.mobDrops[mn]||[]).map(r=>({id:r.itemId,mob:r.mob,rate:r.rate})));return cache={names,mobMaps,itemDrops,mobDrops};}}catch(e){}try{Object.keys(DB.maps||{}).forEach(k=>{(DB.maps[k]||[]).forEach(id=>{const m=DB.mobs[id];if(!m||!m.n)return;(mobMaps[m.n]||(mobMaps[m.n]=[])).push(names[k]||k);});});const add=t=>{if(!t)return;Object.keys(t).forEach(mn=>(t[mn]||[]).forEach(x=>{const id=Array.isArray(x)?x[0]:x,rate=Array.isArray(x)?Number(x[1]):null;if(!DB.items[id])return;const r={id,mob:mn,rate:Number.isFinite(rate)?rate:null};(itemDrops[id]||(itemDrops[id]=[])).push(r);(mobDrops[mn]||(mobDrops[mn]=[])).push(r);}));};try{if(typeof MOB_DROPS!=='undefined')add(MOB_DROPS)}catch(e){}try{if(typeof DARK_WEAPON_DROPS!=='undefined')add(DARK_WEAPON_DROPS)}catch(e){}try{if(typeof DRAGON_DROPS!=='undefined')add(DRAGON_DROPS)}catch(e){}try{if(typeof WARRIOR_DROPS!=='undefined')add(WARRIOR_DROPS)}catch(e){}try{if(typeof MEM_DROPS!=='undefined')add(MEM_DROPS)}catch(e){}try{if(typeof DARK_CRYSTAL_DROPS!=='undefined')add(DARK_CRYSTAL_DROPS)}catch(e){}}catch(e){}return cache={names,mobMaps,itemDrops,mobDrops};}
function match(...a){const q=S.q.trim().toLowerCase();return !q||a.some(v=>String(v==null?'':v).toLowerCase().includes(q));}
function req(d){if(!d.req||d.req==='all')return'全職業';return String(d.req).split(',').map(x=>cls[x]||x).join('／');}
function itemSummary(d){const a=[];if(d.type==='wpn'){if(d.dmgS!=null||d.dmgL!=null)a.push(`傷害 ${d.dmgS||0}/${d.dmgL||0}`);if(d.hit)a.push(`命中 ${d.hit>0?'+':''}${d.hit}`);if(d.dmgBonus)a.push(`額傷 ${d.dmgBonus>0?'+':''}${d.dmgBonus}`);}else{if(d.ac)a.push(`AC ${d.ac>0?'-':'+'}${Math.abs(d.ac)}`);if(d.mr)a.push(`MR +${d.mr}`);if(d.dr)a.push(`減傷 +${d.dr}`);}['str','dex','con','int','wis','cha'].forEach(k=>{if(d[k])a.push(`${k.toUpperCase()} ${d[k]>0?'+':''}${d[k]}`)});return a.slice(0,5).join('・')||txt(d.d).slice(0,55);}
function skillReq(sk){const a=[];[['reqM','mage'],['reqE','elf'],['reqK','knight'],['reqD','dark'],['reqI','illusion'],['reqDk','dragon'],['reqW','warrior'],['reqRoy','royal']].forEach(([k,c])=>{if(sk[k]!=null)a.push(`${cls[c]} Lv.${sk[k]}`)});return a.join('／')||'特殊取得';}
function maps(){const out=[],seen=new Set();try{(MAP_REGIONS||[]).forEach(r=>(r.maps||[]).forEach(m=>{if(seen.has(m.v))return;seen.add(m.v);out.push({id:m.v,n:m.t||m.v,r:r.label||r.name||''});}));Object.keys(DB.maps||{}).forEach(k=>{if(!seen.has(k))out.push({id:k,n:k,r:'特殊區域'});});}catch(e){}return out;}
function items(){return Object.keys(DB.items||{}).map(id=>({id,d:DB.items[id]})).filter(x=>x.d&&x.d.n&&match(x.d.n,x.id,x.d.d,x.d.type,x.d.req)).sort((a,b)=>a.d.n.localeCompare(b.d.n,'zh-Hant'));}
function skills(){return Object.keys(DB.skills||{}).map(id=>({id,d:DB.skills[id]})).filter(x=>x.d&&x.d.n&&match(x.d.n,x.id,x.d.desc,x.d.msg,skillReq(x.d))).sort((a,b)=>(a.d.tier||99)-(b.d.tier||99)||a.d.n.localeCompare(b.d.n,'zh-Hant'));}
function mobs(){return Object.keys(DB.mobs||{}).map(id=>({id,d:DB.mobs[id]})).filter(x=>x.d&&x.d.n&&match(x.d.n,x.id,x.d.race,x.d.lv,x.d.beh)).sort((a,b)=>(a.d.lv||0)-(b.d.lv||0)||a.d.n.localeCompare(b.d.n,'zh-Hant'));}
function card(kind,id,title,sub,badge){return `<button class="awk-card" onclick="AFKWiki.detail('${kind}','${esc(id)}')"><div><b>${esc(title)}</b><span>${esc(sub||'')}</span></div>${badge?`<em>${esc(badge)}</em>`:''}<i>›</i></button>`;}
function list(){let rows=[];if(S.tab==='items')rows=items().slice(0,180).map(x=>card('item',x.id,x.d.n,itemSummary(x.d),type[x.d.type]||x.d.type));if(S.tab==='skills')rows=skills().slice(0,180).map(x=>card('skill',x.id,x.d.n,skillReq(x.d),x.d.tier?`${x.d.tier}階`:'技能'));if(S.tab==='mobs')rows=mobs().slice(0,180).map(x=>card('mob',x.id,x.d.n,`${x.d.race||'-'}・${x.d.beh||'-'}`,`Lv.${x.d.lv||0}`));if(S.tab==='maps')rows=maps().filter(x=>match(x.n,x.id,x.r)).slice(0,180).map(x=>card('map',x.id,x.n,x.r,`${(DB.maps&&DB.maps[x.id]||[]).length}怪`));return `<div class="awk-note">顯示前 180 筆；直接用上方搜尋可以快速縮小範圍。</div><div class="awk-list">${rows.join('')||'<div class="awk-empty">沒有符合的資料。</div>'}</div>`;}
function drops(id){const a=knowledge().itemDrops[id]||[];return a.length?`<section><h3>🎁 掉落來源</h3>${a.sort((x,y)=>(y.rate||0)-(x.rate||0)).slice(0,60).map(r=>`<div class="awk-row"><b>${esc(r.mob)}</b><em>${r.rate!=null?esc(r.rate+'%'):'特殊'}</em></div>`).join('')}</section>`:'';}
function itemDetail(id){const d=DB.items[id];if(!d)return'找不到資料';let desc='';try{if(typeof buildItemDescHTML==='function')desc=buildItemDescHTML({id,uid:'wiki_'+id,en:0,cnt:1});}catch(e){}if(!desc)desc=`<p>${esc(d.d||'無額外說明')}</p><p>適用職業：${esc(req(d))}</p><p>安定值：${d.noEnhance?'無法強化':esc(d.safe||0)}</p>`;let p=[];try{if(typeof weaponPurposeLabels==='function')p=p.concat(weaponPurposeLabels(d)||[])}catch(e){}try{if(typeof relicPurposeLabels==='function')p=p.concat(relicPurposeLabels(d)||[])}catch(e){}return `<h2>${esc(d.n)}</h2><div class="awk-tags"><span>${esc(type[d.type]||d.type||'物品')}</span><span>${esc(req(d))}</span>${d.legend?'<span>傳說</span>':''}${d.relic?'<span>遺物</span>':''}</div>${p.length?`<section><h3>⭐ 核心特色</h3><p>${p.map(esc).join('<br>')}</p></section>`:''}<section><h3>📋 完整能力</h3><div class="awk-desc">${desc}</div></section>${drops(id)}`;}

function skillPct(v){
    let n=Number(v);
    if(!Number.isFinite(n)) return String(v);
    if(n<=1) n*=100;
    return (Math.round(n*100)/100)+'%';
}

function skillDur(v){
    let n=Number(v);
    if(!Number.isFinite(n)) return String(v);

    if(n>=60 && n%60===0){
        return n+' 秒（'+(n/60)+' 分鐘）';
    }

    return n+' 秒';
}

function skillDice(v){
    if(Array.isArray(v)){
        if(
            v.length===2 &&
            !Array.isArray(v[0]) &&
            !Array.isArray(v[1])
        ){
            return v[0]+'D'+v[1];
        }

        return v.map(function(x){
            if(Array.isArray(x) && x.length===2){
                return x[0]+'D'+x[1];
            }
            return String(x);
        }).join('、');
    }

    return String(v);
}

function skillDeepInfo(id,d){
    const effect=[];
    const formula=[];
    const condition=[];
    const note=[];

    const statNames={
        str:'力量 STR',
        dex:'敏捷 DEX',
        con:'體質 CON',
        int:'智力 INT',
        wis:'精神 WIS',
        cha:'魅力 CHA',

        mr:'魔法防禦 MR',
        er:'遠距離迴避 ER',

        meleeHit:'近距離命中',
        rangedHit:'遠距離命中',
        meleeDmg:'近距離傷害',
        rangedDmg:'遠距離傷害',
        extraHit:'額外命中',
        extraDmg:'額外傷害',
        dr:'傷害減免',

        resFire:'火屬性抗性',
        resWater:'水屬性抗性',
        resEarth:'地屬性抗性',
        resWind:'風屬性抗性'
    };

    if(d.d && typeof d.d==='object'){
        Object.keys(d.d).forEach(function(k){
            const v=Number(d.d[k]);

            if(!Number.isFinite(v)) return;

            if(k==='ac'){
                effect.push(
                    v>=0
                    ? 'AC 改善 '+v
                    : 'AC 惡化 '+Math.abs(v)
                );
                return;
            }

            if(statNames[k]){
                effect.push(
                    statNames[k]+' '+(v>=0?'+':'')+v
                );
            }
        });
    }

    if(d.dmgDice){
        formula.push('基礎傷害骰：'+skillDice(d.dmgDice));
    }

    if(d.dmgBase!=null){
        formula.push('固定基礎傷害：+'+d.dmgBase);
    }

    if(d.multiDmg){
        formula.push('多段傷害：'+skillDice(d.multiDmg));
    }

    if(d.healDice){
        formula.push('治癒骰：'+skillDice(d.healDice));
    }

    if(d.hits!=null){
        formula.push('攻擊次數：'+d.hits+' 次');
    }

    if(d.skillAddDmg!=null){
        formula.push('技能額外物理傷害：+'+d.skillAddDmg);
    }

    if(d.stunChance!=null){
        formula.push(
            '暈眩基礎機率：'+skillPct(d.stunChance)
        );
    }

    if(
        d.fixedStatus &&
        d.fixedStatus.chance!=null
    ){
        formula.push(
            '狀態成功基礎機率：'+
            skillPct(d.fixedStatus.chance)
        );
    }

    if(d.hpCost!=null && d.mpGain!=null){
        formula.push(
            '轉換：消耗 '+d.hpCost+
            ' HP → 恢復 '+d.mpGain+' MP'
        );
    }

    if(d.reqShield){
        condition.push('必須裝備盾牌。');
    }

    if(d.reqWpn){
        const names={
            bow:'弓',
            w2h:'雙手武器',
            sword:'劍'
        };

        condition.push(
            '武器限制：'+(names[d.reqWpn]||d.reqWpn)
        );
    }

    if(d.reqEle){
        condition.push(
            '屬性限制：'+(ele[d.reqEle]||d.reqEle)
        );
    }

    if(d.reqEleAny){
        condition.push('必須先選擇妖精屬性。');
    }

    if(d.ranged){
        condition.push('屬於遠距離攻擊技能。');
    }

    if(d.target==='all'){
        condition.push('作用目標：全體。');
    }

    if(d.noRefresh){
        note.push(
            '效果存在期間不重複刷新，結束後才會再次施放。'
        );
    }

    if(d.loadFreeRegen){
        effect.push(
            '負重狀態下仍可以自然恢復 HP／MP。'
        );
    }

    /* ===== 特殊技能實際公式 ===== */

    if(id==='sk_dark_str'){
        formula.push(
            '實際效果固定為 STR +3；並不是直接「傷害 +3」。STR 提升後會再由角色能力公式重新計算相關戰鬥能力。'
        );
    }

    if(id==='sk_dark_dex'){
        formula.push(
            '實際效果固定為 DEX +3；DEX 提升後會再由角色能力公式重新計算相關戰鬥能力。'
        );
    }

    if(id==='sk_counter_barrier'){
        effect.push(
            '反擊屏障期間，雙手武器也能進入反擊判定。'
        );

        formula.push(
            '普通反擊：以一次實際物理攻擊傷害為基礎 ×50%，必定命中，而且不會觸發重擊。'
        );

        formula.push(
            '反擊精通：反擊倍率由 50% 提升為 65%，並且必定爆擊。'
        );

        formula.push(
            '單手劍＋反擊屏障：反擊計算完成後再 ×2；倍率上約等於普通反擊 100%，有反擊精通時約 130%。'
        );

        formula.push(
            '少數帶 counterBarrierX2 特性的雙手武器，反擊屏障期間也會得到 ×2。'
        );

        condition.push(
            '受到敵人一般攻擊命中時，普通情況有 50% 機率發動反擊。'
        );

        condition.push(
            '如果本次成功盾牌格檔，反擊發動率為 100%。'
        );

        condition.push(
            '擁有「反擊精通」時，反擊發動率為 100%。'
        );

        note.push(
            '反擊屏障不是把敵人打你的傷害直接反射回去；反擊傷害是重新用你自己的武器與物理攻擊能力計算。'
        );

        note.push(
            '武士刀在特定裝備條件下走「居合」規則；反擊屏障期間原生居合最終傷害也會 ×2。'
        );
    }

    if(id==='sk_elf_mirror'){
        formula.push(
            '受到魔法傷害時，以最終 WIS 作為反射機率：1 點 WIS＝1% 發動率。'
        );

        formula.push(
            '成功反射時，對施法者造成與該次魔法傷害等量的必中固定傷害。'
        );
    }


    /* ===== 技能百科公式批次2 ===== */

    if(id==='sk_dark_burn'){
        formula.push(
            '一般攻擊每次有 30% 機率觸發燃燒鬥志；成功時該次最終傷害 ×1.5。'
        );

        note.push(
            '燃燒鬥志可以和雙重破壞同一擊一起觸發；若兩者同時成功，會依序套用各自的傷害倍率。'
        );
    }

    if(id==='sk_dark_double'){
        condition.push(
            '只有裝備「雙刀」或「鋼爪」時才會進行雙重破壞判定。'
        );

        formula.push(
            '發動率＝10%＋FLOOR((角色等級－45) ÷5)%。'
        );

        formula.push(
            '例如：Lv.45＝10%、Lv.50＝11%、Lv.60＝13%、Lv.80＝17%。'
        );

        formula.push(
            '成功發動時，該次一般攻擊傷害 ×2。'
        );

        note.push(
            '可以與燃燒鬥志同時觸發。'
        );
    }

    if(id==='sk_elf_triple'){
        condition.push(
            '必須裝備弓並具有可使用的箭矢。'
        );

        formula.push(
            '施放後立即進行 3 次獨立的遠距離物理攻擊。'
        );

        formula.push(
            '三箭各自獨立計算命中、武器／箭矢傷害、重擊、爆擊與目標防禦，因此可能出現部分命中、部分未命中的情況。'
        );

        note.push(
            '三重矢不是把一次攻擊傷害直接 ×3，而是真正進行三次攻擊判定。'
        );
    }

    if(id==='sk_reduction_armor'){
        effect.push(
            '提高固定傷害減免（DR）。'
        );

        formula.push(
            '固定 DR 增加量＝FLOOR(角色等級 ÷10)。'
        );

        formula.push(
            '例如：Lv.30＝DR +3、Lv.50＝DR +5、Lv.80＝DR +8。'
        );

        note.push(
            '這是固定減免，不是百分比減傷。'
        );
    }

    if(id==='sk_spike_armor'){
        formula.push(
            '持續期間近距離命中 +5。'
        );

        note.push(
            '目前本遊戲的「尖刺盔甲」沒有反射傷害效果；實際效果是近距離命中提升。'
        );
    }

    if(id==='sk_elf_preciseshot'){
        formula.push(
            '正常物理命中判定中，1D20 擲出 1 原本屬於必定未命中；精準射擊期間，骰出 1 改為必定命中。'
        );

        formula.push(
            '因此命中率上限可以由通常的 95% 提高到 100%。'
        );

        note.push(
            '精準射擊不是直接增加固定命中數值，而是修改命中骰的特殊規則。'
        );
    }

    if(id==='sk_elf_attrfire'){
        formula.push(
            '一般攻擊每次有 30% 機率觸發；成功時該次傷害 ×1.5。'
        );

        note.push(
            '效果與燃燒鬥志使用獨立判定；若兩個效果同時存在並同時發動，兩個 ×1.5 會依序套用。'
        );
    }

    if(id==='sk_elf_muddywater'){
        effect.push(
            '使頭目的自然 HP 回復量減半。'
        );

        condition.push(
            '只能對 BOSS／頭目施放。'
        );

        formula.push(
            '此技能屬於必中異常效果，不進行一般魔法命中判定。'
        );

        formula.push(
            '持續 32 秒；期間頭目原本的自然 HP 回復量 ×0.5。'
        );

        note.push(
            '污濁之水本身不造成直接傷害。'
        );
    }

    if(id==='sk_dragon_slaughter'){
        condition.push(
            '必須使用近距離武器；弓與其他遠距離武器不能施放。'
        );

        formula.push(
            '基本效果：立即進行 3 次獨立的近距離一般物理攻擊，每一擊各自判定命中與傷害。'
        );

        formula.push(
            '目標每有 1 層「弱點曝光」，屠宰者每一擊命中額外 +10 固定傷害。'
        );

        formula.push(
            '例如目標有 3 層弱點曝光，三次命中的每一擊都會各自 +30 傷害。'
        );

        note.push(
            '一般情況下，只要屠宰者成功利用到弱點曝光，施放結束後會消耗弱點曝光層數。'
        );

        note.push(
            '具有「弱點精通」時，屠宰者不會消耗弱點曝光。'
        );

        note.push(
            '具有「鎖刃精通」時，每層弱點曝光另外使最終傷害 +10%，而且弱點曝光上限由 3 層提高到 5 層。'
        );

        note.push(
            '龍血精通會使技能 HP 消耗減半，因此屠宰者基本 HP16 會降為 HP8。'
        );
    }


    /* ===== 技能百科公式批次3 ===== */

    if(id==='sk_elf_triple'){
        formula.push(
            '三重矢的 3 箭結算完成後，每次施放只會額外進行 1 次「連射」發動判定。'
        );

        note.push(
            '這裡的「連射」是弓／十字弓的 rapidfire 系統，不是黑暗妖精雙刀／鋼爪的 combo「連擊」。'
        );

        note.push(
            '不是每一箭各判一次連射；一整次三重矢只判定一次。'
        );
    }

    if(id==='sk_elf_flamesoul'){
        effect.push(
            '持續期間，近距離一般攻擊的武器傷害骰固定取最大值。'
        );

        formula.push(
            '例如武器對目標的傷害骰是 1～20，烈焰之魂期間一般近戰攻擊的武器骰直接視為 20。'
        );

        note.push(
            '固定最大的是「武器擲骰」本身，不代表整次最終傷害固定為最大值；其他能力加成、爆擊、減傷與倍率仍照正常公式計算。'
        );

        note.push(
            '只影響近距離一般攻擊，不會把所有主動技能的傷害骰固定最大。'
        );
    }

    if(id==='sk_elf_stormshot'){
        effect.push(
            '遠距離傷害 +6。'
        );

        effect.push(
            '遠距離命中 +3。'
        );

        note.push(
            '這兩個數值直接加入角色的遠距離戰鬥能力，之後再進入正常遠距離攻擊公式。'
        );
    }

    if(id==='sk_elf_steelguard'){
        effect.push(
            '自身 AC 改善 10。'
        );

        note.push(
            '目前版本只強化施法者自身的 AC，不提供全隊百分比減傷。'
        );
    }

    if(id==='sk_elf_watervital'){
        formula.push(
            '當自己持有水之元氣，而且觸發冷卻為 0 時，下一次受到的「瞬間治癒」恢復量 ×2。'
        );

        formula.push(
            '成功觸發後進入 7 秒觸發冷卻；水之元氣本身仍可繼續存在。'
        );

        note.push(
            '持續恢復型效果（HoT）不會觸發水之元氣。'
        );

        note.push(
            '只看被治癒者自己是否持有水之元氣，不是全隊共用效果。'
        );
    }

    if(id==='sk_dark_poison'){
        condition.push(
            '一般攻擊成功命中後才會進行附加劇毒判定。'
        );

        formula.push(
            '一般情況：命中後 50% 機率使目標中毒。'
        );

        formula.push(
            '中毒傷害＝觸發這次攻擊實際傷害 ×60%，每秒造成一次，持續 5 秒。'
        );

        formula.push(
            '劇毒精通：上毒機率提高為 100%，每秒中毒傷害提高為觸發攻擊傷害 ×200%。'
        );

        note.push(
            '中毒最多 1 層。'
        );

        note.push(
            '目標已中毒時，只有新的每秒毒傷「高於」目前毒傷才會取代並刷新 5 秒；較低或相同的毒不會刷新。'
        );

        note.push(
            '部分特殊武器可能另外放大附加劇毒傷害。'
        );
    }

    if(id==='sk_dark_dodge'){
        formula.push(
            '受到具有「必中」特性的傷害魔法時，有 50% 機率完全閃避該次魔法傷害。'
        );

        formula.push(
            '成功閃避後，暗影閃避效果立即消耗，並進入 5 秒觸發冷卻。'
        );

        condition.push(
            '只對會造成傷害、而且本來屬於必定命中的魔法進行這個 50% 閃避判定。'
        );

        note.push(
            '角色處於沉睡狀態時無法靠暗影閃避躲過該次魔法。'
        );

        note.push(
            '不是單純增加 ER，也不是對所有物理／魔法攻擊都提供 50% 閃避。'
        );
    }

    if(id==='sk_dark_erup'){
        effect.push(
            '遠距離迴避 ER +12。'
        );

        note.push(
            'ER 主要作用於遠距離物理攻擊的迴避判定，不等於所有傷害直接減少 12%。'
        );
    }

    if(id==='sk_dark_crit'){
        condition.push(
            '施放時必須至少剩有 1 MP，而且目前 HP 必須高於最大 HP 的 50%。'
        );

        formula.push(
            '施放代價：扣除「最大 HP 的 50%」，並消耗施放前剩餘的全部 MP。'
        );

        formula.push(
            'MP 傷害倍率＝（施放前目前 MP ÷ 最大 MP）×10。'
        );

        formula.push(
            '例如：滿 MP＝×10；50% MP＝×5；20% MP＝×2。'
        );

        formula.push(
            '基礎攻擊會以目前武器進行一次「必中＋必定重擊＋必定爆擊」的物理傷害計算，再乘上 MP 傷害倍率。'
        );

        formula.push(
            '會心一擊會把敵人的硬皮額外減傷加回，因此等同無視硬皮造成的額外物理減傷。'
        );

        formula.push(
            '對「血盟」種族敵人，最後傷害再 ×2。'
        );

        note.push(
            '傷害倍率使用的是「消耗前」的 MP 比例；計算完比例後才把 MP 清空。'
        );
    }


    /* ===== 技能百科公式批次4 ===== */

    if(id==='sk_dark_armorbreak'){
        effect.push(
            '成功後使目標進入「破壞盔甲」狀態 8 秒。'
        );

        formula.push(
            '破壞盔甲期間，目標受到的傷害 ×1.58，也就是受到傷害提高 58%。'
        );

        formula.push(
            '若目標同時有「脆弱」(+10%受傷)，兩者採乘算：1.58 ×1.10＝1.738，合計約提高 73.8%。'
        );

        condition.push(
            '破壞盔甲屬於魔法型異常狀態，成功與否走目前遊戲的異常魔法命中判定，不是固定必中。'
        );

        note.push(
            '這個 ×1.58 是共用的受傷倍率，因此不只強化黑暗妖精自己的攻擊，其他有效傷害來源打同一目標時也會受益。'
        );
    }

    if(id==='sk_dark_fang'){
        effect.push(
            '持續期間額外傷害 +5。'
        );

        note.push(
            '這是固定額外傷害數值，不是傷害 ×5% 或 ×1.5。'
        );
    }

    if(id==='sk_illu_crush'){
        effect.push(
            '粉碎能量為必中型武器傷害技能。'
        );

        formula.push(
            '基礎值＝武器對目前目標體型的 1 次傷害骰 ＋角色近距離／遠距離傷害 ＋武器強化傷害。'
        );

        formula.push(
            '之後再套用幻術魔法傷害方向係數、技能階級與武器屬性相關倍率。'
        );

        formula.push(
            '粉碎能量不進行一般物理命中骰，因此必定命中；同時不扣目標的物理 DR 與硬皮減傷。'
        );

        note.push(
            '技能使用武器本身的傷害骰與強化值，但不會把一般攻擊的所有武器特殊觸發效果一起帶進來。'
        );

        note.push(
            '目前版本已取消幻術士「依角色等級額外增加傷害」的舊倍率，因此不會再額外乘上 1＋等級/50。'
        );
    }

    if(id==='sk_illu_mindbreak'){
        formula.push(
            '每次施放實際消耗 MP＝MAX(1，FLOOR(最大 MP ×5%))。'
        );

        formula.push(
            '例如最大 MP 500 → 消耗 25 MP；最大 MP 1000 → 消耗 50 MP。'
        );

        formula.push(
            '技能的基礎傷害就等於這次實際消耗的 MP，之後再套用魔法傷害公式與目標 MR 減免。'
        );

        condition.push(
            '目前 MP 不足以支付「最大 MP 的 5%」時不會施放。'
        );

        note.push(
            '心靈破壞是無屬性魔法傷害，會受到目標 MR 影響。'
        );

        note.push(
            '混亂或恐慌中的目標，心靈破壞計算 MR 時會額外視為 MR -10。'
        );

        note.push(
            '目前版本已取消幻術士「依角色等級額外增加傷害」的舊倍率。'
        );
    }

    if(id==='sk_illu_mirror'){
        effect.push(
            '遠距離迴避 ER +25。'
        );

        note.push(
            '這裡的鏡像是提高 ER，和妖精的「鏡反射」是完全不同的技能。'
        );
    }

    if(id==='sk_illu_focus'){
        effect.push(
            'MP 自然恢復量 +4。'
        );

        note.push(
            '增加的是每次自然回魔的恢復量，不是最大 MP +4。'
        );
    }

    if(id==='sk_illu_avatar'){
        effect.push(
            '全隊額外傷害 +10。'
        );

        effect.push(
            '全隊受到的傷害減少 3%。'
        );

        formula.push(
            '受到傷害減免倍率＝原傷害 ×0.97。'
        );

        note.push(
            '目前版本已由早期的 10% 減傷調整為 3%。'
        );

        note.push(
            '額外傷害 +10 與 3% 受傷減免都屬於團隊效果，不只作用於施法者本人。'
        );
    }

    if(id==='sk_illu_insight'){
        effect.push(
            'STR +1、DEX +1、CON +1、INT +1、WIS +1。'
        );

        note.push(
            '各能力值提升後，相關衍生能力會依角色能力公式重新計算。'
        );
    }

    if(id==='sk_illu_cube_harmony'){
        effect.push(
            '展開立方：和諧 20 秒。'
        );

        formula.push(
            '立方每 1 秒作用一次：對目前目標造成 1D25 火屬性傷害，同時自身恢復 5 MP。'
        );

        formula.push(
            '20 秒完整維持期間，理論上最多可進行約 20 次週期作用。'
        );

        condition.push(
            '施放本身不消耗 MP，但消耗 25 HP。'
        );

        note.push(
            '立方的攻擊與回魔是週期效果，不是施放瞬間一次全部結算。'
        );
    }

    if(id==='sk_illu_pain'){
        effect.push(
            '受到直接傷害時，將實際承受的傷害轉化為反射傷害。'
        );

        formula.push(
            '反射基礎傷害＝本次實際承受的 HP 傷害，反射率為 100%。'
        );

        formula.push(
            '若攻擊者本身處於脆弱／破壞盔甲等受傷增加狀態，反射傷害還會再乘上對方目前的受傷倍率。'
        );

        condition.push(
            '近距離、遠距離或直接魔法傷害都可以觸發。'
        );

        note.push(
            '中毒、灼燒、出血等持續傷害不會觸發疼痛的歡愉。'
        );

        note.push(
            '反射看的是你這次「實際損失的 HP」，不是敵人攻擊在減傷前的原始數字。'
        );
    }

    if(id==='sk_royal_precise'){
        effect.push(
            '使場上所有敵人受到的傷害增加。'
        );

        formula.push(
            '一般公式：受傷增加％＝1＋角色等級÷15。'
        );

        formula.push(
            '例如 Lv.60：1＋60÷15＝5%，因此敵人受到傷害 ×1.05。'
        );

        formula.push(
            '具有「血盟精通」時，公式改成 1＋角色等級÷10；例如 Lv.60＝7%。'
        );

        note.push(
            '同時存在多個精準目標來源時不會彼此疊加，系統只取一個有效來源。'
        );
    }


    /* ===== 技能百科公式批次5 ===== */

    if(id==='sk_warrior_dualaxe'){
        effect.push(
            '學會後，戰士可以使用符合條件的副手鈍器進行追擊。'
        );

        formula.push(
            '主手一般攻擊後，副手會再進行 1 次完整、獨立的普通攻擊。'
        );

        formula.push(
            '副手有自己的命中判定、武器傷害骰、爆擊／重擊與強化倍率，因此副手也可能單獨未命中。'
        );

        condition.push(
            '一般情況主手必須是可雙持的單手鈍器。'
        );

        note.push(
            '具有「巨斧精通」時，雙手鈍器也可以視為可雙持武器。'
        );

        note.push(
            '副手追擊可以觸發「狂暴」，但不會把主手的出血／弱點等效果再重複觸發一次。'
        );
    }

    if(id==='sk_warrior_crush'){
        effect.push(
            '被動提高近距離傷害。'
        );

        formula.push(
            '近距離傷害增加＝2＋MAX(0，角色等級－44)。'
        );

        formula.push(
            '例如：Lv.30＝+2、Lv.45＝+3、Lv.50＝+8、Lv.60＝+18、Lv.80＝+38。'
        );

        note.push(
            'Lv.45 開始，每升 1 級再增加 1 點近距離傷害。'
        );
    }

    if(id==='sk_warrior_armorbody'){
        effect.push(
            '依照最終 AC 額外增加固定傷害減免 DR。'
        );

        formula.push(
            '一般公式：DR增加＝FLOOR((10－最終AC) ÷10)。'
        );

        formula.push(
            '例如最終 AC＝-20：FLOOR((10－(-20))÷10)＝DR +3。'
        );

        formula.push(
            '具有「堅韌精通」時，公式改為 FLOOR((10－最終AC) ÷5)；同樣 AC -20 時變成 DR +6。'
        );

        note.push(
            '這是固定 DR，不是百分比減傷；AC 越好，護甲身軀提供的固定減傷通常越高。'
        );
    }

    if(id==='sk_warrior_berserk'){
        formula.push(
            '近距離一般攻擊每次有 5% 機率發動狂暴。'
        );

        formula.push(
            '成功發動時，該次傷害 ×2。'
        );

        condition.push(
            '只作用於近距離一般攻擊。'
        );

        note.push(
            '迅猛雙斧的副手追擊也屬於一般攻擊，因此副手也能獨立觸發狂暴。'
        );
    }

    if(id==='sk_warrior_titan_rock'){
        condition.push(
            '一般情況必須低於最大 HP 的 40% 才會啟動。'
        );

        condition.push(
            '具有「反彈精通」時，啟動門檻提高為最大 HP 的 80% 以下。'
        );

        formula.push(
            '受到敵人的一般物理攻擊後，反射基礎傷害＝本次實際承受的 HP 傷害。'
        );

        formula.push(
            '若攻擊者身上有脆弱／破壞盔甲等受傷增加效果，反射傷害還會再乘上攻擊者目前的受傷倍率。'
        );

        note.push(
            '條件成立時為 100% 發動，不需要另外再擲反射機率。'
        );

        note.push(
            '反彈精通觸發泰坦效果後，還會追加一次普通攻擊。'
        );
    }

    if(id==='sk_warrior_titan_magic'){
        condition.push(
            '一般情況必須低於最大 HP 的 40% 才會啟動。'
        );

        condition.push(
            '具有「反彈精通」時，啟動門檻提高為最大 HP 的 80% 以下。'
        );

        formula.push(
            '受到直接魔法／技能傷害時，反射基礎傷害＝本次實際承受的 HP 傷害。'
        );

        formula.push(
            '攻擊者若有脆弱／破壞盔甲等受傷增加效果，反射出去的傷害會再乘上攻擊者的受傷倍率。'
        );

        note.push(
            '條件成立時為 100% 發動。'
        );

        note.push(
            '反彈精通觸發泰坦效果後，還會追加一次普通攻擊。'
        );
    }

    if(id==='sk_warrior_titan_bullet'){
        condition.push(
            '一般情況必須低於最大 HP 的 40% 才會啟動。'
        );

        condition.push(
            '具有「反彈精通」時，啟動門檻提高為最大 HP 的 80% 以下。'
        );

        formula.push(
            '啟動期間，在遠距離迴避判定中額外獲得 ER +50。'
        );

        note.push(
            'ER +50 是加入迴避判定的能力值，不等於固定多 50% 最終迴避率。'
        );
    }

    if(id==='sk_warrior_throwaxe'){
        condition.push(
            '必須使用符合條件的鈍器才能施放。'
        );

        formula.push(
            '持續 64 秒；期間每次近距離一般攻擊命中，都會對目標附加 1 層出血。'
        );

        formula.push(
            '一般最多累積 5 層出血。'
        );

        note.push(
            '效果不會在第一次命中後消失，而是整個 64 秒期間持續生效。'
        );

        note.push(
            '具有「雙斧精通」時，每層出血的傷害再提高 10%，而且施放戰斧投擲不消耗 MP。'
        );
    }

    if(id==='sk_warrior_roar'){
        formula.push(
            '對全體敵人的基礎固定傷害＝50＋MAX(0，角色等級－30)。'
        );

        formula.push(
            '例如：Lv.30＝50、Lv.50＝70、Lv.60＝80、Lv.80＝100。'
        );

        formula.push(
            '咆哮不計算目標 MR、物理 DR 與元素抗性。'
        );

        note.push(
            '目標若有脆弱／破壞盔甲等「受到傷害增加」狀態，最後仍可被這類受傷倍率放大。'
        );
    }

    if(id==='sk_warrior_endurance'){
        effect.push(
            '提高最大 HP。'
        );

        formula.push(
            '最大 HP 倍率＝1＋角色等級÷200。'
        );

        formula.push(
            '也就是最大 HP 增加「角色等級÷2」%。'
        );

        formula.push(
            '例如：Lv.50＝+25%、Lv.60＝+30%、Lv.80＝+40%。'
        );
    }

    if(id==='sk_warrior_outlaw'){
        formula.push(
            '持續期間，把一般攻擊的最低命中率提高到 50%。'
        );

        formula.push(
            '原本命中能力再低，命中判定的最低門檻也會被拉到 50%。'
        );

        note.push(
            '它不是直接變成必中；當原本命中率已高於 50% 時，也不會因此額外增加到更高。'
        );
    }

    if(id==='sk_royal_callally'){
        effect.push(
            '施放後，所有目前存活的傭兵立即各進行 1 次額外普通攻擊。'
        );

        formula.push(
            '每名傭兵的這次追加攻擊仍使用自己的武器、能力與一般攻擊傷害公式。'
        );

        note.push(
            '這次追加攻擊是純普通攻擊，不會再次觸發「呼喚盟友」造成遞迴。'
        );

        note.push(
            '具有「血盟精通」時，呼喚盟友的技能 MP 成本再減半。'
        );
    }

    if(id==='sk_royal_burnweapon'){
        effect.push(
            '全隊額外傷害 +5、額外命中 +5。'
        );

        note.push(
            '屬於全隊光環；同一種灼熱武器效果不會因多人施放而重複疊加。'
        );
    }

    if(id==='sk_royal_bravewill'){
        formula.push(
            '一般攻擊每次有 10% 機率發動，成功時該次傷害 ×1.5。'
        );

        formula.push(
            '具有「劍術精通」時，發動率由 10% 提高為 20%。'
        );

        note.push(
            '提高的是觸發機率；成功後的傷害倍率仍為 ×1.5。'
        );
    }

    if(id==='sk_royal_shield'){
        effect.push(
            '全隊 AC 改善 8。'
        );

        note.push(
            '屬於全隊光環；同一種閃亮之盾效果不會因多人施放而重複疊加。'
        );
    }

    if(id==='sk_royal_kingguard'){
        effect.push(
            '魔法防禦 MR +10。'
        );

        effect.push(
            '暈眩抵抗 +20%。'
        );

        formula.push(
            '暈眩抵抗會和裝備的暈眩抵抗、通用異常抵抗相加，最後最高以 100% 計算。'
        );

        note.push(
            '王者加護的 +20% 是額外暈眩抵抗，不代表直接免疫暈眩。'
        );
    }


    /* ===== 技能百科公式批次6 ===== */

    /* ===== 騎士 ===== */

    if(id==='sk_solid_shield'){
        effect.push(
            '遠距離迴避 ER +15。'
        );

        condition.push(
            '必須裝備盾牌才能施放。'
        );

        note.push(
            'ER 會進入遠距離物理攻擊的迴避判定，不等於直接固定增加 15% 最終迴避率。'
        );
    }

    if(id==='sk_shock_stun'){
        condition.push(
            '必須裝備雙手、而且不是弓的武器。'
        );

        formula.push(
            '首先進行 1 次正常的近距離物理攻擊判定；這次攻擊本身必須先命中。'
        );

        formula.push(
            '命中後，該次物理傷害額外固定 +10。'
        );

        formula.push(
            '接著有 10% 機率進入「暈眩判定」。'
        );

        formula.push(
            '通過 10% 發動門檻後，還要再進行一次異常魔法命中判定；成功才真正暈眩 6 秒。'
        );

        formula.push(
            '因此實際暈眩率＝物理命中成功 ×10% ×異常魔法命中成功率。'
        );

        note.push(
            '頭目免疫暈眩，所以即使前面的判定成功，也不會被衝擊之暈控制。'
        );

        note.push(
            '部分特殊武器可以額外提高衝擊之暈的異常命中值。'
        );
    }

    /* ===== 龍騎士 ===== */

    if(id==='sk_dragon_armor'){
        effect.push(
            '固定傷害減免 DR +5。'
        );

        note.push(
            '這是固定減傷，不是受到傷害 -5%。'
        );
    }

    if(id==='sk_dragon_flameslash'){
        condition.push(
            '必須裝備近距離武器才能施放。'
        );

        formula.push(
            '效果存在時，下一次近距離一般攻擊的最終傷害額外固定 +7。'
        );

        formula.push(
            '同一擊會被標記為火屬性攻擊。'
        );

        note.push(
            '效果只強化下一次近距離一般攻擊；成功觸發後立即消耗，不會持續強化後續每一擊。'
        );

        note.push(
            '遠距離攻擊不會消耗燃燒擊砍。'
        );
    }

    if(id==='sk_dragon_guardbreak'){
        formula.push(
            '每次施放固定有 10% 機率成功，不進行一般 MR／異常魔法命中計算。'
        );

        formula.push(
            '成功後持續 32 秒，使目標的有效 AC +10，也就是防禦惡化、物理攻擊更容易命中。'
        );

        note.push(
            '目標已經處於護衛毀滅時，不會重複施放，因此不會再次消耗 HP 或攻擊技能冷卻。'
        );

        note.push(
            '目前這個固定狀態分支沒有套用一般頭目控制免疫，因此頭目也能受到護衛毀滅。'
        );
    }

    if(id==='sk_dragon_lavaspit'){
        formula.push(
            '對場上所有敵人造成 5D7 火屬性魔法基礎傷害。'
        );

        formula.push(
            '之後仍會套用目前的魔法傷害係數、火屬性抗性與 MR 等魔法傷害計算。'
        );

        note.push(
            '屬於全體傷害技能。'
        );
    }

    if(id==='sk_dragon_awaken_antares'){
        effect.push(
            'AC 改善 8。'
        );

        effect.push(
            '最大 HP +（角色等級 ×2）。'
        );

        effect.push(
            '免疫中毒、猛毒與麻痺。'
        );

        formula.push(
            '例如 Lv.50：最大 HP 額外 +100；Lv.80：最大 HP 額外 +160。'
        );

        formula.push(
            '任何一種覺醒生效時，攻擊速度提高 20%。'
        );

        formula.push(
            '具有「覺醒精通」時，覺醒的攻擊速度提升改為 50%。'
        );

        note.push(
            '沒有覺醒精通時，安塔瑞斯、法利昂、巴拉卡斯三種覺醒互斥，同時間只能維持一種。'
        );

        note.push(
            '具有覺醒精通時三種覺醒可以同時存在，但攻速效果只算一次，不會三重相乘。'
        );
    }

    if(id==='sk_dragon_bloodlust'){
        formula.push(
            '持續期間攻擊速度提高 15%。'
        );

        formula.push(
            '血之渴望會與加速、覺醒、變身等攻速來源乘算疊加。'
        );

        note.push(
            '提高的是攻擊速度，不是直接增加 15% 傷害。'
        );
    }

    if(id==='sk_dragon_terror'){
        formula.push(
            '每次施放固定有 10% 機率成功，不讀取目標 MR。'
        );

        formula.push(
            '成功後持續 16 秒；恐懼中的敵人每次進行一般攻擊時，有 90% 機率直接攻擊落空。'
        );

        note.push(
            '這個 90% 判定發生在正常物理命中骰之前。'
        );

        note.push(
            '目標已經處於恐懼無助時，不會再次施放或重複消耗 HP。'
        );
    }

    if(id==='sk_dragon_lavabolt'){
        formula.push(
            '對單一目標造成 10D8 火屬性魔法基礎傷害。'
        );

        formula.push(
            '之後再套用魔法傷害係數、火屬性抗性與 MR 等正常魔法傷害公式。'
        );
    }

    if(id==='sk_dragon_awaken_falion'){
        effect.push(
            '火、水、地、風四屬性抗性各 +15。'
        );

        formula.push(
            '最終 MR 再 ×1.15，結果向下取整。'
        );

        formula.push(
            '任何一種覺醒生效時，攻擊速度提高 20%；具有覺醒精通時改為 50%。'
        );

        note.push(
            '沒有覺醒精通時三種覺醒互斥；具有覺醒精通時可以三種同時維持。'
        );

        note.push(
            '即使三種覺醒同時存在，覺醒帶來的攻速提升仍只計算一次。'
        );
    }

    if(id==='sk_dragon_deadlybody'){
        formula.push(
            '受到直接物理或直接魔法傷害時，每次有 23% 機率觸發反射。'
        );

        formula.push(
            '反射基礎傷害＝本次實際承受的傷害。'
        );

        formula.push(
            '如果攻擊者身上有脆弱、破壞盔甲等受傷增加狀態，反射傷害還會再乘上攻擊者目前的受傷倍率。'
        );

        note.push(
            '致命身軀不是固定每次都反射，而是每次受擊各自進行 23% 判定。'
        );
    }

    if(id==='sk_dragon_deathlightning'){
        formula.push(
            '對場上所有敵人造成 8D8 風屬性魔法基礎傷害。'
        );

        formula.push(
            '傷害結算後，對存活目標嘗試施加 6 秒暈眩。'
        );

        formula.push(
            '暈眩使用一般異常魔法命中公式，因此成功率會受到角色等級、魔法命中、怪物等級與怪物 MR 影響。'
        );

        note.push(
            '頭目免疫暈眩，但仍會受到奪命之雷本身的風屬性魔法傷害。'
        );
    }

    if(id==='sk_dragon_reaper'){
        formula.push(
            '每次施放固定有 50% 機率成功，不讀取目標 MR。'
        );

        formula.push(
            '成功後持續 32 秒。'
        );

        formula.push(
            '死神狀態會使敵人的一般攻擊傷害計算固定 -20。'
        );

        formula.push(
            '敵人的一般傷害技能也會固定 -20，最後仍保留至少 1 點傷害。'
        );

        note.push(
            '這是固定減少 20 點，不是敵人傷害 -20%。'
        );

        note.push(
            '目標已經處於驚悚死神狀態時，不會重複施放。'
        );
    }

    if(id==='sk_dragon_awaken_baraka'){
        effect.push(
            'STR +3、CON +3、DEX +3、INT +3、WIS +3。'
        );

        effect.push(
            '額外命中 +5。'
        );

        formula.push(
            '五項能力提升後，會重新計算其相關的攻擊、命中、防禦、HP／MP 等衍生能力。'
        );

        formula.push(
            '任何一種覺醒生效時，攻擊速度提高 20%；具有覺醒精通時改為 50%。'
        );

        note.push(
            '沒有覺醒精通時三種覺醒互斥；具有覺醒精通時可以三種同時維持。'
        );

        note.push(
            '多種覺醒同時存在時，覺醒攻速效果仍只計算一次。'
        );
    }


    /* ===== 技能百科公式批次7 ===== */

    /* ===== 法師特殊技能 ===== */

    if(id==='sk_magic_shield'){
        effect.push(
            '持續 16 秒；期間可以完全吸收 1 次敵方的魔法傷害技能。'
        );

        formula.push(
            '成功吸收後，該次魔法傷害直接變成 0，魔法屏障立即消失。'
        );

        formula.push(
            '屏障成功吸收一次攻擊後，進入 3 秒重施冷卻。'
        );

        condition.push(
            '只會吸收「會造成魔法傷害」的敵方技能。'
        );

        note.push(
            '純異常狀態魔法、一般物理攻擊、衝擊之暈等不會被魔法屏障吸收。'
        );

        note.push(
            '魔法卷軸與魔法屏障法術使用同一個屏障狀態，不能互相疊加。'
        );
    }

    if(id==='sk_mana_drain'){
        condition.push(
            '必須有存活的怪物目標才能施放。'
        );

        formula.push(
            '每次施放消耗 50 HP；HP 最低保留 1，不會因魔力奪取直接死亡。'
        );

        formula.push(
            '成功率使用異常魔法命中判定，因此會受到施法者魔法命中、等級差與目標 MR 影響。'
        );

        formula.push(
            '成功吸取量＝1D FLOOR(目標等級 ÷2) MP；骰子面數最低為 1。'
        );

        formula.push(
            '例如 Lv.40 怪物：吸取 1D20 MP；Lv.80 怪物：吸取 1D40 MP。'
        );

        note.push(
            'HP 是在命中判定前先消耗，因此施法失敗仍會消耗 50 HP。'
        );

        note.push(
            '恢復後的 MP 不會超過自己的最大 MP。'
        );
    }

    if(id==='sk_undead_bane'){
        condition.push(
            '只有「不死族」而且不是 BOSS 的敵人才符合即死條件。'
        );

        formula.push(
            '成功率使用異常魔法命中公式，會受到施法者魔法命中、等級差與目標 MR 影響。'
        );

        formula.push(
            '起死回生術的即死成功率最高限制為 60%。'
        );

        note.push(
            '對非不死族或 BOSS 不會觸發即死。'
        );

        note.push(
            '此技能本身是純即死判定；即死失敗不會另外造成一般傷害。'
        );
    }

    if(id==='sk_weaken'){
        formula.push(
            '成功後持續 30 秒，使目標的一般攻擊命中 -2。'
        );

        formula.push(
            '同時使目標的一般攻擊固定傷害加值 -4。'
        );

        condition.push(
            '成功與否使用異常魔法命中判定。'
        );

        note.push(
            '弱化術主要削弱敵人的一般物理攻擊，不是讓敵人受到的傷害增加。'
        );
    }

    if(id==='sk_disease'){
        formula.push(
            '成功後持續 30 秒，使目標的一般攻擊命中 -4。'
        );

        formula.push(
            '同時使目標有效 AC +8，也就是防禦惡化，讓我方物理攻擊更容易命中。'
        );

        condition.push(
            '成功與否使用異常魔法命中判定。'
        );

        note.push(
            '疾病術的 AC +8 是對敵人不利的效果，不是幫敵人增加防禦。'
        );
    }

    if(id==='sk_break'){
        formula.push(
            '成功後持續 25 秒，使目標的一般攻擊固定傷害加值 -2。'
        );

        condition.push(
            '成功與否使用異常魔法命中判定。'
        );

        note.push(
            '這裡是對怪物施放的壞物術效果；和部分裝備造成玩家自身「一般攻擊傷害 -20%」的損壞狀態不是同一套數值。'
        );
    }

    if(id==='sk_seal'){
        formula.push(
            '成功後使目標進入真空／魔法封印狀態 16 秒。'
        );

        formula.push(
            '狀態期間，怪物無法施放自己的技能。'
        );

        condition.push(
            '成功與否使用異常魔法命中判定。'
        );

        note.push(
            '這不是沉默玩家自己的效果，而是封鎖目標怪物的技能施放。'
        );
    }

    if(id==='sk_sleep_mist'){
        effect.push(
            '對場上所有敵人嘗試施加沉睡。'
        );

        formula.push(
            '沉睡成功後持續 8 秒；沉睡中的敵人無法行動。'
        );

        formula.push(
            '敵人只要受到任何傷害，就會立即從沉睡中醒來。'
        );

        condition.push(
            '每個目標各自進行異常魔法命中判定。'
        );

        note.push(
            '沉睡之霧較適合暫時控場；持續範圍傷害可能會立刻把敵人打醒。'
        );
    }

    if(id==='sk_blizzard_storm'){
        effect.push(
            '展開冰雪颶風 32 秒。'
        );

        formula.push(
            '每 4 秒對場上所有敵人造成一次 2D10 水屬性魔法基礎傷害。'
        );

        formula.push(
            '每次週期傷害都會正常計算魔法傷害、魔法爆擊、目標 MR、水屬性抗性與屬性剋制。'
        );

        formula.push(
            '造成週期傷害時還會嘗試附加冰凍，冰凍判定的魔法命中額外 -3。'
        );

        note.push(
            '32 秒完整維持時，理論上約可觸發 8 次週期傷害。'
        );

        note.push(
            '效果存在期間不可重新刷新，要等結束後才能再次施放。'
        );
    }

    if(id==='sk_fire_prison'){
        effect.push(
            '展開火牢 10 秒。'
        );

        formula.push(
            '每 2 秒對場上所有敵人造成一次 2D15 火屬性魔法基礎傷害。'
        );

        formula.push(
            '每次週期傷害會正常計算魔法傷害、魔法爆擊、目標 MR、火屬性抗性與屬性剋制。'
        );

        note.push(
            '火牢本身沒有附帶異常狀態。'
        );

        note.push(
            '10 秒完整維持時，理論上約可觸發 5 次週期傷害。'
        );

        note.push(
            '效果存在期間不可重新刷新。'
        );
    }

    if(id==='sk_heal_energy_storm'){
        effect.push(
            '持續 320 秒，大幅縮短 HP 自然恢復的等待時間。'
        );

        formula.push(
            'HP 自然恢復間隔最多縮短到每 3 秒一次。'
        );

        formula.push(
            '實際公式會取「目前 HP 自然恢復間隔」與 3 秒之中較快的一個，因此如果原本已經快於 3 秒，不會反而變慢。'
        );

        note.push(
            '只改變 HP 自然恢復間隔，不會加快 MP 自然恢復。'
        );

        note.push(
            '效果結束前不可重新刷新。'
        );
    }

    if(id==='sk_holy_barrier'){
        effect.push(
            '持續期間受到的敵方物理與魔法傷害減少 30%。'
        );

        formula.push(
            '最終傷害倍率＝原傷害 ×0.70。'
        );

        formula.push(
            '例如原本受到 1000 傷害，聖結界單獨生效時變成約 700。'
        );

        formula.push(
            '若同時存在其他百分比減傷，採乘算而不是直接相加。'
        );

        formula.push(
            '例如聖結界 -30% 再搭配另一個 -20%：0.70 ×0.80＝0.56，也就是總共約減少 44%。'
        );

        note.push(
            '聖結界不是固定 DR，而是百分比最終受傷減免。'
        );
    }

    if(id==='sk_soul_up'){
        effect.push(
            '最大 HP +20%，最大 MP +20%。'
        );

        formula.push(
            '最大 HP＝原最大 HP ×1.20，結果向下取整。'
        );

        formula.push(
            '最大 MP＝原最大 MP ×1.20，結果向下取整。'
        );

        note.push(
            '提升的是上限，不是施放瞬間直接恢復 20% HP／MP。'
        );
    }

    if(id==='sk_abs_barrier'){
        effect.push(
            '進入與世界隔絕的完全防護狀態 7 秒。'
        );

        formula.push(
            '期間敵人的一般物理攻擊、技能物理攻擊、魔法傷害與異常狀態全部無效。'
        );

        condition.push(
            '絕對屏障期間自己無法進行一般攻擊、施法或自動行動。'
        );

        condition.push(
            '期間也無法使用藥水、卷軸與其他道具。'
        );

        note.push(
            '絕對屏障期間 HP／MP 自然恢復也會暫停。'
        );

        note.push(
            '手動技能冷卻設定為「屏障持續時間 +12 秒」，因此從施放開始計算共 19 秒。'
        );

        note.push(
            '它和魔法屏障不同：魔法屏障只擋一次魔法傷害；絕對屏障是短時間完全隔絕，但自己也不能行動。'
        );
    }

    if(id==='sk_resurrection'){
        effect.push(
            '目前版本用於立即原地復活倒地的協力傭兵。'
        );

        formula.push(
            '復活後 HP＝最大 HP 的 50%。'
        );

        formula.push(
            '復活後 MP 直接恢復至最大值。'
        );

        formula.push(
            '復活時會清除傭兵身上的全部異常狀態。'
        );

        condition.push(
            '施法者本人必須存活，而且必須已學會返生術。'
        );

        condition.push(
            '需要支付返生術實際 MP 消耗；基礎 MP 為 50，仍會受到正常 MP 消耗修正影響。'
        );

        note.push(
            '返生術沒有「死亡後等待 15 秒」的限制，可以在傭兵倒地後立即使用。'
        );

        note.push(
            '復活卷軸則需要等待傭兵倒地 15 秒；兩者復活後的 HP／MP 效果相同。'
        );
    }


    /* ===== 技能百科公式批次8 ===== */

    /* ===== 妖精特殊技能補完 ===== */

    if(id==='sk_elf_worldtree'){
        effect.push(
            '提高妖精森林周邊與眠龍洞穴 1～3 樓的特定區域素材掉落率。'
        );

        formula.push(
            '粗糙的米索莉塊：2% → 3%。'
        );

        formula.push(
            '元素石：2% → 3%。'
        );

        formula.push(
            '精靈玉：20% → 30%。'
        );

        note.push(
            '只作用於指定區域的額外素材掉落，不是所有怪物的全域掉寶率提升。'
        );
    }

    if(id==='sk_elf_mind'){
        formula.push(
            '固定轉換：消耗 8 HP → 恢復 2 MP。'
        );

        note.push(
            '這是固定數值轉換，不會因 INT、WIS 或魔法傷害提高而增加回魔量。'
        );
    }

    if(id==='sk_elf_soul'){
        formula.push(
            '固定轉換：消耗 50 HP → 恢復 15 MP。'
        );

        note.push(
            '這是固定數值轉換，不會因 INT、WIS 或魔法傷害提高而增加回魔量。'
        );
    }

    if(id==='sk_elf_release'){
        condition.push(
            '只有具有「元素」標籤的非 BOSS 敵人才符合即死條件。'
        );

        formula.push(
            '成功率使用異常魔法命中公式，會受到施法者等級、魔法命中、目標等級與 MR 影響。'
        );

        formula.push(
            '此技能的即死成功率最高限制為 60%。'
        );

        note.push(
            '如果目標不是元素系，或目標是 BOSS，就不會觸發即死。'
        );

        note.push(
            '即死失敗時不會另外補上一段普通魔法傷害。'
        );
    }

    if(id==='sk_elf_singleres'){
        effect.push(
            '目前選擇的妖精屬性抗性 +50。'
        );

        formula.push(
            '火妖精 → 火抗 +50；水妖精 → 水抗 +50；地妖精 → 地抗 +50；風妖精 → 風抗 +50。'
        );

        condition.push(
            '必須先選擇妖精屬性。'
        );

        note.push(
            '只提高目前選擇的單一屬性，不是四屬性全部 +50。'
        );
    }

    if(id==='sk_elf_winddash'){
        effect.push(
            '移動速度提高 33%。'
        );

        formula.push(
            '移動速度倍率＝×1.33。'
        );

        note.push(
            '風之疾走存在時，精靈餅乾的移動速度 +15% 不再額外疊加；餅乾的攻擊速度效果仍保留。'
        );

        note.push(
            '若舊狀態同時殘留神聖疾走與風之疾走，系統以風之疾走為優先，不會把兩個 +33% 疊在一起。'
        );
    }

    if(id==='sk_elf_groundtrap'){
        effect.push(
            '對場上所有敵人嘗試施加緩速。'
        );

        formula.push(
            '每個敵人各自進行一次異常魔法命中判定。'
        );

        formula.push(
            '成功後緩速持續 30 秒。'
        );

        note.push(
            '地面障礙本身沒有直接傷害骰，主要用途是全體控場。'
        );
    }

    if(id==='sk_elf_magicerase'){
        effect.push(
            '成功後使目標進入「魔法消除」狀態，最長持續 16 秒。'
        );

        formula.push(
            '下一次魔法直擊進行 MR 傷害計算時，有效 MR＝原本 MR ÷2。'
        );

        formula.push(
            '該次魔法傷害結算完成後，魔法消除狀態立即消失。'
        );

        condition.push(
            '成功與否使用異常魔法命中判定。'
        );

        note.push(
            '不是 16 秒內所有魔法都吃半 MR；正常情況只強化下一次會消耗此狀態的魔法攻擊。'
        );
    }

    if(id==='sk_elf_dancefire'){
        effect.push(
            '全隊近距離傷害 +3。'
        );

        note.push(
            '目前屬於真正的團隊光環：任一來源維持即可惠及玩家、傭兵、寵物、召喚物與城堡護衛。'
        );

        note.push(
            '同一個舞躍之火不會因多人同時維持而重複疊加。'
        );
    }

    if(id==='sk_elf_stormeye'){
        effect.push(
            '遠距離傷害 +2、遠距離命中 +2。'
        );

        note.push(
            '目前採「單體共享」方式：施法者維持後，可替缺少效果的玩家／傭兵補上各自的暴風之眼。'
        );

        note.push(
            '這不是涵蓋寵物與召喚物的真正全隊遠距離光環。'
        );
    }

    if(id==='sk_elf_earthshield'){
        effect.push(
            '持續 8 秒，完全抵擋敵人的一般物理攻擊傷害。'
        );

        formula.push(
            '敵人的一般攻擊即使命中，只要大地屏障仍存在，該次傷害直接變成 0。'
        );

        note.push(
            '目前程式攔截的是「一般物理攻擊」；不要把它當成絕對屏障，魔法與其他特殊技能並非全部免疫。'
        );
    }

    if(id==='sk_elf_lifespring'){
        effect.push(
            '正常狀態下直接補滿目標所有缺少的 HP。'
        );

        formula.push(
            '恢復量＝目標最大 HP－目前 HP。'
        );

        formula.push(
            '如果目標處於污濁之水，恢復量再 ×0.5，因此只會補回一半缺失 HP。'
        );

        note.push(
            '生命之泉不觸發、也不消耗水之元氣的下一次治癒 ×2 效果。'
        );

        note.push(
            '技能資料的 200 tick 治癒冷卻相當於 20 秒。'
        );
    }

    if(id==='sk_elf_earthbless'){
        effect.push(
            '全隊 AC 改善 7。'
        );

        note.push(
            '屬於真正的團隊光環：任一隊員維持即可使全隊受益。'
        );

        note.push(
            '同一個大地的祝福不會因多人施放而重複疊加。'
        );
    }

    if(id==='sk_elf_lifebless'){
        effect.push(
            '立即治癒全隊，每個受益者分別計算一次恢復量。'
        );

        formula.push(
            '目前治癒核心以經典方向公式計算：基礎骰數＝12＋INT治癒加成，骰面為 D12。'
        );

        formula.push(
            '基礎恢復量＝(12＋INT治癒加成)D12 ×1.6，再套用群體治癒武器倍率、正義值倍率與污濁之水倍率。'
        );

        formula.push(
            '滿正義時，因本技能具有正義治癒屬性，最終恢復量可再提高 20%。'
        );

        formula.push(
            '技能資料的 60 tick 治癒冷卻相當於 6 秒。'
        );

        note.push(
            '污濁之水會讓受到的治癒效果 ×0.5。'
        );
    }

    if(id==='sk_elf_seal'){
        effect.push(
            '成功後使目標進入魔法封印 8 秒。'
        );

        formula.push(
            '封印期間，目標怪物無法施放自己的技能。'
        );

        condition.push(
            '成功與否使用異常魔法命中判定。'
        );

        condition.push(
            '必須先選擇妖精屬性，但四種屬性妖精皆可使用。'
        );
    }


    /* ===== 技能百科公式批次9 ===== */

    /* ===== 妖精屬性精靈完整公式 ===== */

    if(id==='sk_elf_summon'){
        effect.push(
            '召喚 1 隻與目前妖精屬性相同的精靈，持續 3600 秒（60 分鐘）。'
        );

        effect.push(
            '精靈具有自己的 HP、攻擊速度、命中與傷害公式，會實際參與戰鬥。'
        );

        formula.push(
            '【水之精靈】Lv40／HP 400／攻擊間隔 1.8 秒／傷害骰 2D38／魅力成長除數 11。'
        );

        formula.push(
            '【風之精靈】Lv40／HP 400／攻擊間隔 1.8 秒／傷害骰 2D38／魅力成長除數 11。'
        );

        formula.push(
            '【火之精靈】Lv40／HP 400／攻擊間隔 1.6 秒／傷害骰 2D33／魅力成長除數 12.5。'
        );

        formula.push(
            '【地之精靈】Lv40／HP 400／攻擊間隔 1.6 秒／傷害骰 2D33／魅力成長除數 12.5。'
        );

        formula.push(
            '魅力固定傷害＝floor(召喚者魅力 × 召喚者等級 ÷ 該屬性成長除數)。'
        );

        formula.push(
            '基礎魔抗穿透＝10＋floor(召喚者魅力 ÷10)。'
        );

        formula.push(
            '基礎傷害倍率＝×1.00。'
        );

        formula.push(
            '精靈等級 40 → 基礎 AC 0、固定 DR 4。'
        );

        note.push(
            '水／風攻擊較慢但單擊骰較高；火／地攻擊較快。'
        );

        note.push(
            '精靈屬性會跟隨目前妖精屬性；更換屬性時，在場精靈會先消失，再以新屬性重新召喚。'
        );

        note.push(
            '精靈精通不會把普通「召喚屬性精靈」升級成精靈王；精靈王只由「召喚強力屬性精靈」搭配精靈精通產生。'
        );
    }

    if(id==='sk_elf_summon2'){
        effect.push(
            '召喚 1 隻與目前妖精屬性相同的強力精靈，持續 3600 秒（60 分鐘）。'
        );

        formula.push(
            '【強力水之精靈】Lv50／HP 600／攻擊間隔 1.8 秒／傷害骰 3D48／魅力成長除數 5.5。'
        );

        formula.push(
            '【強力火之精靈】Lv50／HP 600／攻擊間隔 1.6 秒／傷害骰 3D43／魅力成長除數 6.2。'
        );

        formula.push(
            '【強力地之精靈】Lv50／HP 650／攻擊間隔 1.6 秒／傷害骰 3D40／魅力成長除數 6.6。'
        );

        formula.push(
            '【強力風之精靈】Lv50／HP 720／攻擊間隔 1.8 秒／傷害骰 3D42／魅力成長除數 6.3。'
        );

        formula.push(
            '魅力固定傷害＝floor(召喚者魅力 × 召喚者等級 ÷ 該屬性成長除數)。'
        );

        formula.push(
            '基礎魔抗穿透＝20＋floor(召喚者魅力 ÷10)。'
        );

        formula.push(
            '基礎傷害倍率＝×1.18。'
        );

        formula.push(
            '精靈等級 50 → 基礎 AC -2、固定 DR 5。'
        );

        condition.push(
            '如果召喚者選擇「精靈精通」，此技能不再召喚強力精靈，而是直接召喚對應屬性的精靈王。'
        );

        note.push(
            '強力風精靈 HP 最高，但設計上單擊傷害相對較輕；水、火偏向較高輸出。'
        );

        note.push(
            '精靈精通不增加召喚數量；不論普通、強力或精靈王，都維持 1 隻。'
        );

        note.push(
            '以下精靈王數值只有選擇「精靈精通」時才套用。'
        );

        formula.push(
            '【水之精靈王】Lv60／HP 1200／攻擊間隔 1.8 秒／傷害骰 4D54／魅力成長除數 3.9。'
        );

        formula.push(
            '【火之精靈王】Lv60／HP 1200／攻擊間隔 1.6 秒／傷害骰 4D48／魅力成長除數 4.4。'
        );

        formula.push(
            '【地之精靈王】Lv60／HP 1300／攻擊間隔 1.6 秒／傷害骰 4D45／魅力成長除數 4.6。'
        );

        formula.push(
            '【風之精靈王】Lv60／HP 1440／攻擊間隔 1.8 秒／傷害骰 4D48／魅力成長除數 4.4。'
        );

        formula.push(
            '精靈王基礎魔抗穿透＝30＋floor(召喚者魅力 ÷10)。'
        );

        formula.push(
            '精靈王基礎傷害倍率＝×1.30。'
        );

        formula.push(
            '精靈王等級 60 → 基礎 AC -5、固定 DR 6。'
        );

        effect.push(
            '精靈王每次一般攻擊成功命中後，有 15% 機率追加同屬性的全體法術。'
        );

        formula.push(
            '水之精靈王 → 冰雪暴；火之精靈王 → 火風暴；風之精靈王 → 龍捲風；地之精靈王 → 震裂術。'
        );

        formula.push(
            '精靈王全體技能骰＝2D(該精靈王一般攻擊骰面)。'
        );

        formula.push(
            '因此水王＝2D54、火王＝2D48、風王＝2D48、地王＝2D45。'
        );

        formula.push(
            '全體技能的魅力固定傷害＝一般攻擊魅力固定傷害 ÷2（向下取整）。'
        );

        note.push(
            '15% 是「一般攻擊成功命中後」才擲骰；一般攻擊未命中時不會觸發全體法術。'
        );

        note.push(
            '精靈王全體法術會攻擊場上所有存活敵人，每個目標分別計算魔抗與屬性剋制。'
        );
    }

    if(id==='sk_elf_summon' || id==='sk_elf_summon2'){
        formula.push(
            '【完整一般攻擊核心】傷害基底＝傷害骰＋floor(魅力×召喚者等級÷成長除數)＋召喚裝備／團隊額外傷害。'
        );

        formula.push(
            '魔法傷害倍率＝精靈基礎倍率 × [1＋min(12,召喚者魔法傷害)÷40]。'
        );

        formula.push(
            '有效 MR＝max(0，目標 MR－魔抗穿透)；若目標已有魔法消除，先把目標 MR 減半再扣穿透。'
        );

        formula.push(
            '最終傷害＝傷害基底 × 魔法傷害倍率 × MR倍率 × 脆弱倍率 × 屬性剋制倍率。'
        );

        note.push(
            '屬性精靈的攻擊雖然會吃 MR 與屬性剋制，但不會被敵人的物理固定 DR 扣傷。'
        );

        note.push(
            '屬性剋制仍使用目前戰鬥系統倍率：剋制時 ×1.4，被剋時 ×0.6，其他 ×1。'
        );

        formula.push(
            '命中基值＝召喚者等級＋精靈命中加值＋floor(召喚者等級×0.75＋魅力×0.35)－目標等級＋目標有效 AC＋召喚裝備／團隊命中。'
        );

        formula.push(
            '普通精靈命中加值 +10；強力精靈 +20；精靈王 +25。'
        );

        formula.push(
            '命中最後使用 D20 判定：自然骰 20 必中、自然骰 1 必定未命中。'
        );

        note.push(
            '灼熱武器等團隊額外傷害與部分幻覺光環也能加到精靈攻擊；舞躍之火目前同樣會讓精靈取得近距離傷害加成。'
        );
    }


    /* ===== 技能百科公式批次10 ===== */

    /* ===== 法師召喚系統 ===== */

    if(id==='sk_summon'){
        effect.push(
            '召喚術會依角色等級、魅力與召喚控制戒指，召喚 1～6 隻真正具有 HP 的戰鬥召喚物。'
        );

        formula.push(
            '召喚數量＝FLOOR((魅力＋6) ÷該階除數)，再套用該階召喚上限。'
        );

        formula.push(
            'Lv28～48 階：除數 8，正常上限 5；有召喚控制戒指時上限 6。'
        );

        formula.push(
            'Lv52 階：除數 8，上限 5。'
        );

        formula.push(
            'Lv56 階：除數 10，上限 4。'
        );

        formula.push(
            'Lv60 階：除數 12，上限 4。'
        );

        formula.push(
            'Lv64 階：除數 20，上限 2。'
        );

        formula.push(
            'Lv68／Lv72 高階召喚固定為 1 隻，並另外要求指定魅力。'
        );

        note.push(
            '例如低階召喚 CHA 34：FLOOR((34＋6)÷8)＝5 隻；如果有召喚控制戒指，CHA 42 時可達 6 隻。'
        );

        condition.push(
            '沒有召喚控制戒指時，只能使用各階的預設召喚物，而且自動選擇最高只到 Lv52 魔熊階。'
        );

        condition.push(
            'Lv56 以上召喚物都需要召喚控制戒指才能選擇。'
        );

        formula.push(
            '召喚物整隊基準 DPS＝(39＋0.09×魅力×角色等級) × (1＋召喚階級索引×6%)。'
        );

        formula.push(
            '同階召喚物會依 HP 套用生存／輸出交換倍率：(該階中位HP ÷召喚物HP)^0.35。'
        );

        formula.push(
            '單隻基準 DPS＝整隊基準 DPS ÷該階「正常召喚上限」。'
        );

        note.push(
            '每一隻召喚物都是獨立完整傷害，不會因實際召喚隻數增加而把單隻傷害稀釋。'
        );

        note.push(
            '因此有戒指多出的第 6 隻也是完整一隻的傷害，不是把原本 5 隻的傷害重新分配。'
        );

        formula.push(
            '單擊平均傷害會依該召喚物攻擊間隔換算，再拆成約 55% 固定傷害＋45% 隨機骰傷。'
        );

        formula.push(
            '實際普攻＝(固定傷害＋1D傷害骰＋召喚裝備傷害) ×召喚傷害倍率＋團隊額外傷害，最後扣除目標固定 DR。'
        );

        formula.push(
            'D20 命中：自然 20 必中且該次傷害骰直接取最大值；自然 1 必定未命中。'
        );

        note.push(
            '目前新版召喚物普攻會扣敵人的固定 DR，但不另外扣「硬皮」額外物理減傷。'
        );

        effect.push(
            '部分召喚物具有 10%～20% 機率的特殊攻擊，例如中毒、範圍中毒、屬性魔法或全體魔法。'
        );

        formula.push(
            '特殊魔法技能威力基礎＝2D CEIL(召喚物等級×0.6)＋技能力量。'
        );

        formula.push(
            '技能力量＝召喚物等級＋FLOOR(角色等級×0.35)＋階級×2＋FLOOR(魅力×0.5)。'
        );

        note.push(
            '召喚物的屬性魔法技能會正常受到目標 MR 與屬性剋制影響。'
        );
    }

    if(id==='sk_zombie'){
        effect.push(
            '召喚 1 隻人形殭屍；法師會隨角色等級提升殭屍階級。'
        );

        formula.push(
            'Lv24～31：殭屍 Lv10／HP100。'
        );

        formula.push(
            'Lv32～39：殭屍 Lv12／HP200。'
        );

        formula.push(
            'Lv40～43：殭屍 Lv14／HP400。'
        );

        formula.push(
            'Lv44～47：殭屍 Lv16／HP500。'
        );

        formula.push(
            'Lv48～51：殭屍 Lv18／HP600。'
        );

        formula.push(
            'Lv52以上：殭屍 Lv20／HP800。'
        );

        formula.push(
            '妖精若學會造屍術，Lv48以上固定召喚 Lv10／HP100 的最低階殭屍。'
        );

        formula.push(
            '殭屍攻擊間隔＝12 ticks＝1.2 秒。'
        );

        formula.push(
            '殭屍基準 DPS＝22＋角色等級×0.45＋殭屍階級索引×5。'
        );

        formula.push(
            '單擊平均值＝基準 DPS ×1.2，再拆成約 55% 固定傷害＋45%骰傷。'
        );

        formula.push(
            '普攻實際結算和召喚術相同：固定值＋1D骰傷 → 召喚倍率 → 扣目標固定 DR。'
        );

        note.push(
            '人形殭屍本身沒有召喚術怪物的特殊 proc，因此不會自行放水泡、毒液等技能。'
        );

        note.push(
            '如果裝備具有「死靈之書」效果，造屍術會改成另一套擊殺觸發的骷髏復生系統，不再使用普通人形殭屍。'
        );
    }

    if(id==='sk_charm'){
        condition.push(
            '不能迷魅 BOSS，也不能迷魅具有 noCharm「不可迷魅」標記的怪物。'
        );

        formula.push(
            '一般成功率使用異常魔法命中公式，迷魅術成功率最高限制為 60%。'
        );

        formula.push(
            '具有「召喚精通」時，只要目標等級低於自己、不是 BOSS、也沒有不可迷魅標記，就會必定成功。'
        );

        effect.push(
            '成功後，原本的敵人會從敵方隊伍移除並成為你的僕人，最長持續 3600 秒（60 分鐘）。'
        );

        formula.push(
            '迷魅僕人保留原怪物自己的傷害骰、攻擊速度與命中加值。'
        );

        formula.push(
            '迷魅僕人的命中基值＝角色等級＋怪物原命中＋魅力－目標等級＋目標有效AC＋召喚裝備／團隊命中。'
        );

        formula.push(
            '迷魅僕人傷害＝原怪物傷害骰＋角色魅力＋召喚裝備／團隊額外傷害－目標固定 DR。'
        );

        note.push(
            '所以迷魅術的魅力不只影響成功相關配置，成功後魅力也直接加入僕人的命中與傷害。'
        );

        note.push(
            '迷魅僕人目前走舊式抽象召喚管線，不會像新版召喚術怪物一樣在戰場上顯示獨立 HP 實體。'
        );
    }

    if(id==='sk_summon' || id==='sk_zombie' || id==='sk_charm'){
        note.push(
            '【召喚精通】對召喚術／造屍術：召喚物傷害 ×1.20、命中額外 +5。'
        );

        note.push(
            '召喚物的魔法傷害屬性也會提高召喚傷害；目前計入的魔法傷害最多取 12 點。'
        );

        formula.push(
            '召喚術／造屍術的魔傷倍率＝1＋MIN(12，召喚者魔法傷害＋召喚專用魔傷)÷80。'
        );

        note.push(
            '因此在沒有其他倍率時，12 點召喚魔傷相當於這一層最高約 ×1.15。'
        );

        note.push(
            '若再有召喚精通，倍率會再 ×1.20。'
        );
    }

function uniq(a){
        return a.filter(function(x,i){
            return x && a.indexOf(x)===i;
        });
    }

    return {
        effect:uniq(effect),
        formula:uniq(formula),
        condition:uniq(condition),
        note:uniq(note)
    };
}

function skillDetail(id){
    const d=DB.skills[id];

    if(!d){
        return '找不到資料';
    }

    const stats=[];

    if(d.tier){
        stats.push('階級：'+d.tier);
    }

    if(d.mp!=null){
        stats.push('MP 消耗：'+d.mp);
    }

    if(d.hpCost!=null){
        stats.push('HP 消耗：'+d.hpCost);
    }else if(d.hp!=null){
        stats.push('HP 消耗：'+d.hp);
    }

    if(d.mpGain!=null){
        stats.push('MP 恢復：'+d.mpGain);
    }

    if(d.dur!=null){
        stats.push('持續時間：'+skillDur(d.dur));
    }

    if(d.hits!=null){
        stats.push('攻擊次數：'+d.hits+' 次');
    }

    if(d.dmgDice){
        stats.push('傷害骰：'+skillDice(d.dmgDice));
    }

    if(d.multiDmg){
        stats.push('多段傷害：'+skillDice(d.multiDmg));
    }

    if(d.healDice){
        stats.push('治癒骰：'+skillDice(d.healDice));
    }

    if(d.reqEle){
        stats.push(
            '限定屬性：'+(ele[d.reqEle]||d.reqEle)
        );
    }

    const deep=skillDeepInfo(id,d);

    let desc=[];

    if(d.desc){
        desc.push(d.desc);
    }

    if(d.msg && d.msg!==d.desc){
        desc.push(d.msg);
    }

    deep.effect.forEach(function(x){
        if(desc.indexOf(x)<0){
            desc.push(x);
        }
    });

    let books=[];

    Object.keys(DB.items||{}).forEach(function(i){
        const x=DB.items[i];

        if(
            x &&
            x.type==='skillbk' &&
            x.sk===id
        ){
            books.push({i:i,x:x});
        }
    });

    function sec(title,arr){
        if(!arr || !arr.length) return '';

        return `
            <section>
                <h3>${title}</h3>
                <p>
                    ${arr.map(function(x){
                        return '• '+esc(x);
                    }).join('<br>')}
                </p>
            </section>
        `;
    }

    return `
        <h2>${esc(d.n)}</h2>

        <div class="awk-tags">
            <span>${esc(skillReq(d))}</span>
            ${d.tier?`<span>${d.tier}階</span>`:''}
        </div>

        <section>
            <h3>🎓 可學職業／等級</h3>
            <p>${esc(skillReq(d))}</p>
        </section>

        <section>
            <h3>📊 技能資料</h3>
            <p>
                ${
                    stats.length
                    ? stats.map(esc).join('<br>')
                    : '沒有額外數值欄位。'
                }
            </p>
        </section>

        ${sec('✨ 實際效果',desc)}
        ${sec('🧮 計算方式',deep.formula)}
        ${sec('⚙️ 發動條件',deep.condition)}
        ${sec('💡 特殊說明',deep.note)}

        ${
            books.length
            ? `
                <section>
                    <h3>📘 學習書／水晶</h3>

                    ${
                        books.map(function(b){
                            return `
                                <div class="awk-row">
                                    <b>${esc(b.x.n)}</b>
                                    <em>
                                        ${
                                            (knowledge().itemDrops[b.i]||[]).length
                                        } 個掉落來源
                                    </em>
                                </div>
                            `;
                        }).join('')
                    }
                </section>
              `
            : ''
        }
    `;
}

function mobDetail(id){const d=DB.mobs[id];if(!d)return'找不到資料';const k=knowledge(),ms=[...new Set(k.mobMaps[d.n]||[])],ds=(k.mobDrops[d.n]||[]).sort((a,b)=>(b.rate||0)-(a.rate||0));return `<h2>${esc(d.n)}</h2><div class="awk-tags"><span>Lv.${esc(d.lv||0)}</span>${d.boss?'<span>BOSS</span>':''}<span>${esc(d.race||'-')}</span></div><section><h3>📊 怪物能力</h3><div class="awk-grid"><div>HP ${esc(d.hp||0)}</div><div>AC ${esc(d.ac==null?'-':d.ac)}</div><div>MR ${esc(d.mr||0)}</div><div>EXP ${esc(d.exp||0)}</div><div>屬性 ${esc(ele[d.e]||d.e||'無')}</div><div>行為 ${esc(d.beh||'-')}</div></div></section><section><h3>🗺️ 出沒地圖</h3><p>${ms.map(esc).join('、')||'特殊事件／召喚／階段型怪物'}</p></section><section><h3>🎁 專屬掉落</h3>${ds.length?ds.slice(0,80).map(r=>`<div class="awk-row"><b>${esc((DB.items[r.id]||{}).n||r.id)}</b><em>${r.rate!=null?esc(r.rate+'%'):'特殊'}</em></div>`).join(''):'<p>沒有登記專屬掉落。</p>'}</section>`;}
function mapDetail(id){const n=knowledge().names[id]||id,ids=(DB.maps&&DB.maps[id])||[],mm=ids.map(x=>({id:x,d:DB.mobs[x]})).filter(x=>x.d);return `<h2>${esc(n)}</h2><div class="awk-tags"><span>${mm.length} 種怪物</span></div><section><h3>👾 怪物池</h3>${mm.length?mm.map(x=>`<button class="awk-link" onclick="AFKWiki.detail('mob','${esc(x.id)}')"><span>${x.d.boss?'👑 ':''}${esc(x.d.n)}</span><em>Lv.${esc(x.d.lv||0)}</em></button>`).join(''):'<p>安全區或沒有固定怪物。</p>'}</section>`;}
function system(){return `<div class="awk-hero"><h2>📖 詳細百科</h2><p>收藏是收集進度；百科是攻略查詢。裝備、技能、怪物和地圖都直接讀目前遊戲資料。</p></div><section><h3>⚒️ 強化規則</h3><p>安定值內為安全強化；超過安定值後有失敗風險。武器、防具、飾品依各自規則判定，實際可強化上限與成功率以遊戲目前版本為準。</p></section><section><h3>🎲 裝備詞綴</h3><p>一般裝備可依來源產生祝福、屬性、遠古等特殊能力；遺物不走一般隨機詞綴。百科的「完整能力」直接使用遊戲現行物品資料。</p></section><section><h3>📚 百科用途</h3><p>可查裝備能力與掉落怪、技能學習等級與技能書、怪物能力與掉落、地圖怪物池。之後新增資料也會自動跟著出現。</p></section>`;}
function home(){return `<div class="awk-hero"><h2>📖 放置天堂・詳細百科</h2><p>輸入裝備、技能、怪物或地圖名稱即可搜尋。</p></div><div class="awk-count"><button onclick="AFKWiki.tab('items')"><b>${Object.keys(DB.items||{}).length}</b><span>裝備／道具</span></button><button onclick="AFKWiki.tab('skills')"><b>${Object.keys(DB.skills||{}).length}</b><span>技能</span></button><button onclick="AFKWiki.tab('mobs')"><b>${Object.keys(DB.mobs||{}).length}</b><span>怪物</span></button><button onclick="AFKWiki.tab('maps')"><b>${Object.keys(DB.maps||{}).length}</b><span>地圖</span></button></div><section><h3>🔎 搜尋提示</h3><p>例如：死亡騎士、沙哈之弓、衝擊之暈、象牙塔。點結果可看更完整資料。</p></section>`;}
function detail(){const d=S.detail;if(!d)return'';return `<button class="awk-back" onclick="AFKWiki.back()">← 返回列表</button>${d.k==='item'?itemDetail(d.id):d.k==='skill'?skillDetail(d.id):d.k==='mob'?mobDetail(d.id):mapDetail(d.id)}`;}
function render(){ensure();const body=document.getElementById('awk-body'),tabs=document.getElementById('awk-tabs'),inp=document.getElementById('awk-search');if(inp&&inp.value!==S.q)inp.value=S.q;tabs.innerHTML=[['home','首頁'],['items','裝備／道具'],['skills','技能'],['mobs','怪物'],['maps','地圖'],['system','系統規則']].map(x=>`<button class="${S.tab===x[0]?'on':''}" onclick="AFKWiki.tab('${x[0]}')">${x[1]}</button>`).join('');body.innerHTML=S.detail?detail():S.tab==='home'?home():S.tab==='system'?system():list();body.scrollTop=0;}
function ensure(){let o=document.getElementById('awk-overlay');if(o)return o;const st=document.createElement('style');st.textContent=`#awk-overlay{position:fixed;inset:0;z-index:99999;background:#020617ee;color:#e2e8f0;font-family:system-ui,sans-serif}#awk-overlay.hidden{display:none}.awk-shell{max-width:1050px;height:100%;margin:auto;background:#0f172a;display:flex;flex-direction:column}.awk-head{padding:9px;background:#111827;border-bottom:1px solid #334155}.awk-top{display:flex;gap:7px;align-items:center}.awk-top b{color:#fde68a;white-space:nowrap}.awk-top input{flex:1;min-width:80px;background:#020617;border:1px solid #475569;border-radius:6px;color:#fff;padding:7px}.awk-top button,.awk-back{background:#1e293b;border:1px solid #64748b;border-radius:6px;color:#fff;padding:6px 9px}.awk-tabs{display:flex;gap:5px;overflow:auto;margin-top:7px}.awk-tabs button{white-space:nowrap;background:#1e293b;border:1px solid #475569;color:#cbd5e1;border-radius:6px;padding:5px 8px}.awk-tabs .on{background:#78350f;border-color:#f59e0b;color:#fef3c7}.awk-body{flex:1;overflow:auto;padding:10px}.awk-hero,section{background:#111827;border:1px solid #334155;border-radius:9px;padding:11px;margin-bottom:9px}.awk-hero h2,h2{color:#fde68a;margin:0 0 7px}.awk-hero p,section p{color:#cbd5e1;line-height:1.65;margin:4px 0}section h3{color:#fcd34d;margin:0 0 7px;font-size:14px}.awk-count{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:9px}.awk-count button{background:#172033;border:1px solid #334155;border-radius:8px;color:#fff;padding:8px}.awk-count b{display:block;color:#fbbf24;font-size:18px}.awk-count span{font-size:11px;color:#94a3b8}.awk-list{display:flex;flex-direction:column;gap:5px}.awk-card{width:100%;display:flex;align-items:center;gap:7px;text-align:left;background:#111827;border:1px solid #334155;border-radius:8px;padding:8px;color:#e2e8f0}.awk-card>div{flex:1;min-width:0}.awk-card b{display:block}.awk-card span{display:block;color:#94a3b8;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.awk-card em{font-style:normal;color:#fbbf24;font-size:11px}.awk-card i{font-style:normal;font-size:20px}.awk-note{font-size:11px;color:#fde68a;background:#422006;border:1px solid #854d0e;border-radius:6px;padding:6px;margin-bottom:7px}.awk-empty{text-align:center;padding:30px;color:#94a3b8}.awk-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}.awk-tags span{border:1px solid #475569;background:#1e293b;border-radius:999px;padding:2px 6px;font-size:10px}.awk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.awk-grid div{background:#0b1220;border:1px solid #26364c;border-radius:5px;padding:6px;font-size:12px}.awk-row,.awk-link{display:flex;width:100%;justify-content:space-between;gap:8px;padding:6px 2px;border:0;border-bottom:1px solid #26364c;background:none;color:#e2e8f0;text-align:left}.awk-row em,.awk-link em{color:#fbbf24;font-style:normal}.awk-desc{line-height:1.6;color:#cbd5e1}.awk-back{margin-bottom:8px;color:#bae6fd}@media(max-width:600px){.awk-count{grid-template-columns:repeat(2,1fr)}.awk-grid{grid-template-columns:repeat(2,1fr)}.awk-top b{font-size:0}.awk-top b:after{content:'📖';font-size:18px}}`;
document.head.appendChild(st);o=document.createElement('div');o.id='awk-overlay';o.className='hidden';o.innerHTML=`<div class="awk-shell"><div class="awk-head"><div class="awk-top"><b>📖 詳細百科</b><input id="awk-search" placeholder="搜尋裝備、技能、怪物、地圖…"><button onclick="AFKWiki.close()">✕</button></div><div id="awk-tabs" class="awk-tabs"></div></div><main id="awk-body" class="awk-body"></main></div>`;document.body.appendChild(o);document.getElementById('awk-search').addEventListener('input',e=>{S.q=e.target.value;S.detail=null;render();});return o;}
function entry(){if(document.querySelector('.awk-entry'))return true;const a=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes('openCollectionPanel'))||[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='收藏');if(!a)return false;const b=document.createElement('button');b.className=(a.className||'')+' awk-entry';b.textContent='百科';b.onclick=()=>AFKWiki.open();a.insertAdjacentElement('afterend',b);return true;}
entry=function(){
    document.querySelectorAll('.awk-entry').forEach(function(el){
        if(!el.closest('#collection-panel')) el.remove();
    });

    if(document.querySelector('#collection-panel .awk-entry')) return true;

    const host=document.querySelector('#collection-panel .flex.flex-col.gap-3.p-5');
    if(!host) return false;

    const b=document.createElement('button');
    b.className='btn py-5 text-xl font-bold awk-entry';
    b.style.cssText='background:linear-gradient(135deg,#4a2f0c,#b3850e);color:#fde68a;border-color:#d4a017;';
    b.textContent='📖 詳細百科';

    b.onclick=function(){
        if(typeof closeCollectionPanel==='function') closeCollectionPanel();
        AFKWiki.open();
    };

    host.appendChild(b);
    return true;
};
/* ===== 📜 詳細百科：任務資料＋移除舊百科入口 ===== */
(function(){

  /* ---- 隱藏右下角舊百科 ---- */
  const _qStyle=document.createElement('style');
  _qStyle.textContent='.game-wiki-entry{display:none!important}';
  document.head.appendChild(_qStyle);

  function hideLegacyWiki(){
    document.querySelectorAll('.game-wiki-entry').forEach(function(e){
      e.style.setProperty('display','none','important');
    });

    document.querySelectorAll('button').forEach(function(b){
      if(
        String(b.textContent||'').trim()==='百科' &&
        !b.closest('#collection-panel')
      ){
        b.style.setProperty('display','none','important');
      }
    });
  }

  hideLegacyWiki();
  setInterval(hideLegacyWiki,1000);
/* 強制移除右下角舊百科浮動按鈕 */
function removeOldWikiFab(){

    document.querySelectorAll('body *').forEach(function(el){

        if(el.closest('#awk-overlay')) return;
        if(el.closest('#collection-panel')) return;

        let t=String(el.textContent||'')
            .replace(/\s+/g,'')
            .trim();

        let oc='';
        try{
            oc=String(el.getAttribute('onclick')||'');
        }catch(e){}

        let oldWiki =
            t==='百科' ||
            t==='📖百科' ||
            el.classList.contains('game-wiki-entry') ||
            /openGameWiki|openWiki|openEncyclopedia/i.test(oc);

        if(!oldWiki) return;

        /* 詳細百科內自己的文字不能刪 */
        if(t==='詳細百科' || t==='📖詳細百科') return;

        el.style.setProperty('display','none','important');
        el.style.setProperty('visibility','hidden','important');
        el.style.setProperty('pointer-events','none','important');
    });
}

removeOldWikiFab();

new MutationObserver(function(){
    removeOldWikiFab();
}).observe(document.body,{
    childList:true,
    subtree:true
});

  /* ---- 保留原百科函式 ---- */
  const _baseList=list;
  const _baseDetail=detail;
  const _baseRender=render;


  function qItemName(id){
    return (DB.items && DB.items[id] && DB.items[id].n) || id;
  }

  function qHave(id){
    try{
      return typeof questCountId==='function'
        ? questCountId(id)
        : 0;
    }catch(e){
      return 0;
    }
  }

  function qSource(id){
    try{
      if(typeof _wcItemSourceAnswers==='function'){
        const a=_wcItemSourceAnswers(id);
        if(Array.isArray(a) && a.length){
          return a.slice(0,2).join(' ');
        }
      }
    }catch(e){}

    try{
      const a=(knowledge().itemDrops[id]||[]).slice(0,4);
      if(a.length){
        return a.map(function(r){
          return r.mob+(r.rate!=null ? ' '+r.rate+'%' : '');
        }).join('、');
      }
    }catch(e){}

    return '接取任務後依任務指定怪物／區域取得。';
  }


  /* ---- 建立全部試煉清單 ---- */
  function qRows(){
    const out=[];

    /* 15 / 30 / 45 級 */
    try{
      if(typeof TRIAL_Q!=='undefined'){
        Object.keys(TRIAL_Q).forEach(function(k){
          const c=TRIAL_Q[k];
          if(!c) return;

          const req=(c.reqs||[]).map(function(p){
            return qItemName(p[0])+'×'+p[1];
          });

          const rew=(c.rewards||[]).map(qItemName);

          const hay=[
            cls[c.cls]||c.cls,
            c.lv,
            c.npc
          ].concat(req,rew).join(' ');

          if(match(hay)){
            out.push({
              id:'normal:'+k,
              kind:'normal',
              key:k,
              cls:c.cls,
              lv:c.lv,
              npc:c.npc,
              req:req,
              rew:rew
            });
          }
        });
      }
    }catch(e){}


    /* 50 級 */
    try{
      if(typeof TRIAL_50_CFG!=='undefined'){
        Object.keys(TRIAL_50_CFG).forEach(function(k){
          const c=TRIAL_50_CFG[k];
          if(!c) return;

          const req=(c.stages||[]).map(function(x){
            return x.nm+'×'+(x.cnt||1);
          }).concat([
            c.exMatNm+'×'+(c.exMatCnt||1)
          ]);

          const rew=(c.rewards||[]).map(function(x){
            return x.nm||qItemName(x.id);
          });

          const hay=[
            cls[k]||k,
            50,
            c.npc
          ].concat(req,rew).join(' ');

          if(match(hay)){
            out.push({
              id:'lv50:'+k,
              kind:'lv50',
              key:k,
              cls:k,
              lv:50,
              npc:c.npc,
              req:req,
              rew:rew
            });
          }
        });
      }
    }catch(e){}

    return out.sort(function(a,b){
      return (a.cls||'').localeCompare(b.cls||'') ||
             a.lv-b.lv;
    });
  }


  /* ---- 顯示目前角色任務狀態 ---- */
  function qStatus(r){
    if(!player || player.cls!==r.cls){
      return cls[r.cls]||r.cls;
    }

    if(r.kind==='normal'){
      const st=(player.trialQ && player.trialQ[r.key]) || 0;

      if(st===2) return '✅ 已完成';
      if(st===1) return '🟡 進行中';

      return (player.lv||1)>=r.lv
        ? '可接取'
        : 'Lv.'+r.lv+' 開放';
    }

    const c=TRIAL_50_CFG[r.key];
    const st=Number(player.trialStage||0);
    const n=(c.stages||[]).length;

    if(st>=n+2) return '✅ 已完成';

    if(st===0){
      return (player.lv||1)>=50
        ? '可接取'
        : 'Lv.50 開放';
    }

    if(st<=n){
      return '🟡 第 '+st+'/'+n+' 階段';
    }

    return '🟠 最終兌換';
  }


  /* ---- 任務列表 ---- */
  function qList(){
    const rows=qRows();

    return `
      <div class="awk-note">
        職業試煉完整收錄：
        15／30／45 級與 50 級多階段試煉。
        可搜尋 NPC、任務道具或獎勵名稱。
      </div>

      <div class="awk-list">
        ${
          rows.map(function(r){
            return card(
              'quest',
              r.id,
              (cls[r.cls]||r.cls)+' '+r.lv+'級試煉',
              r.npc+
              '・需求 '+r.req.join('、')+
              '・獎勵 '+r.rew.join('＋'),
              qStatus(r)
            );
          }).join('')
          ||
          '<div class="awk-empty">沒有符合的任務。</div>'
        }
      </div>
    `;
  }


  function qItemRow(id,need,hint,showHave){
    const have=showHave ? qHave(id) : 0;

    const prog=showHave
      ? '持有 '+Math.min(have,need)+'/'+need
      : '需要 ×'+need;

    return `
      <div class="awk-row">

        <button
          class="awk-link"
          style="border:0;padding:0"
          onclick="AFKWiki.detail('item','${esc(id)}')">

          <span>
            <b>${esc(qItemName(id))}</b><br>
            <small style="color:#94a3b8">
              ${esc(hint||qSource(id))}
            </small>
          </span>

        </button>

        <em>${esc(prog)}</em>

      </div>
    `;
  }


  /* ---- 任務詳細資料 ---- */
  function qDetail(id){

    /* 15 / 30 / 45 級 */
    if(id.indexOf('normal:')===0){

      const key=id.slice(7);
      const c=TRIAL_Q[key];

      if(!c) return '找不到任務資料';

      const same=player && player.cls===c.cls;

      const st=same
        ? ((player.trialQ && player.trialQ[key]) || 0)
        : 0;

      let status='';

      if(!same){
        status='其他職業';
      }else if(st===2){
        status='✅ 已完成';
      }else if(st===1){
        status='🟡 進行中';
      }else if((player.lv||1)>=c.lv){
        status='尚未接取（可接）';
      }else{
        status='尚未開放';
      }

      return `

        <h2>
          ⚔️ ${esc(cls[c.cls]||c.cls)}
          ${c.lv}級試煉
        </h2>

        <div class="awk-tags">
          <span>NPC ${esc(c.npc)}</span>
          <span>${esc(status)}</span>
        </div>

        <section>
          <h3>📌 接取條件</h3>

          <p>
            ${esc(cls[c.cls]||c.cls)}
            ・等級 ${c.lv} 以上
            ・找 ${esc(c.npc)} 接取。
            接取後指定試煉道具才開始掉落，
            達需求數量即停止。
          </p>
        </section>

        <section>
          <h3>🎯 任務需求</h3>

          ${
            (c.reqs||[]).map(function(p){
              return qItemRow(
                p[0],
                p[1],
                '接取後擊殺指定怪物 100% 掉落；點物品可繼續查來源。',
                same && st===1
              );
            }).join('')
          }

        </section>

        <section>
          <h3>🎁 完成獎勵</h3>

          ${
            (c.rewards||[]).map(function(x){
              return `
                <button
                  class="awk-link"
                  onclick="AFKWiki.detail('item','${esc(x)}')">

                  <span>${esc(qItemName(x))}</span>
                  <em>查看</em>

                </button>
              `;
            }).join('')
          }

        </section>
      `;
    }


    /* 50 級 */
    const key=id.slice(5);
    const c=TRIAL_50_CFG[key];

    if(!c) return '找不到任務資料';

    const same=player && player.cls===key;
    const st=same ? Number(player.trialStage||0) : 0;
    const n=(c.stages||[]).length;

    let status='';

    if(!same){
      status='其他職業';
    }else if(st===0){
      status=(player.lv||1)>=50
        ? '尚未接取（可接）'
        : '尚未開放';
    }else if(st<=n){
      status='第 '+st+'/'+n+' 階段';
    }else if(st===n+1){
      status='最終兌換';
    }else{
      status='✅ 已完成';
    }


    let stages=(c.stages||[]).map(function(x,i){

      return `

        <div>

          <div class="awk-note">
            階段 ${i+1}
            ${same && st===i+1 ? '・目前進行中' : ''}
          </div>

          ${
            qItemRow(
              x.id,
              x.cnt||1,
              x.hint,
              same && st===i+1
            )
          }

        </div>
      `;

    }).join('');


    stages+=`

      <div>

        <div class="awk-note">
          最終試煉
          ${same && st===n+1 ? '・目前進行中' : ''}
        </div>

        ${
          qItemRow(
            c.exMat,
            c.exMatCnt||1,
            '完成前置階段、開放魔族神殿後取得。',
            same && st===n+1
          )
        }

      </div>
    `;


    return `

      <h2>
        ⚔️ ${esc(cls[key]||key)} 50級試煉
      </h2>

      <div class="awk-tags">
        <span>NPC ${esc(c.npc)}</span>
        <span>${esc(status)}</span>
      </div>

      <section>
        <h3>📌 任務流程</h3>

        <p>
          50級後找 ${esc(c.npc)} 接取。
          依序完成各收集階段，
          完成後開放魔族神殿，
          再完成最終材料兌換。
          每個角色只能完成一次。
        </p>
      </section>

      <section>
        <h3>🧭 分階段需求</h3>
        ${stages}
      </section>

      <section>
        <h3>🎁 最終獎勵（全部獲得）</h3>

        ${
          (c.rewards||[]).map(function(x){
            return `

              <button
                class="awk-link"
                onclick="AFKWiki.detail('item','${esc(x.id)}')">

                <span>
                  ${esc(x.nm||qItemName(x.id))}
                </span>

                <em>查看</em>

              </button>
            `;
          }).join('')
        }

      </section>
    `;
  }

/* ===== 🧭 特殊任務／副本百科 ===== */

const SPECIAL_QUEST_GUIDES = [
  {
    key:'rift',
    icon:'🌀',
    title:'時空裂痕',
    npc:'時空裂痕入口／巴特爾',
    place:'時空裂痕入口、希培利亞村莊',
    req:'龜裂之核 ×1',
    reward:'停留時間排名＋離場獎勵',
    search:'時空裂痕 裂痕 龜裂之核 時空裂痕碎片 巴特爾 四大龍',
    html:`
      <section>
        <h3>📍 怎麼進去</h3>
        <p>
          進入時空裂痕需要 <b>龜裂之核 ×1</b>。
          龜裂之核可以到 <b>希培利亞村莊</b> 找
          <b>巴特爾</b>，使用
          <b>時空裂痕碎片 ×100</b> 製作。
        </p>
      </section>

      <section>
        <h3>⚔️ 副本規則</h3>
        <p>
          進入後禁止傳送。<br>
          進場約 <b>5 分鐘</b>後會出現第一隻強制頭目。<br>
          停留時間越久，會逐漸進入更後段的怪物池。
        </p>
      </section>

      <section>
        <h3>🐲 四大龍</h3>
        <p>
          在時空裂痕中撐過約 <b>30 分鐘</b>後，
          四大龍才會開始加入可出現的怪物池。
        </p>
      </section>

      <section>
        <h3>🎁 獎勵流程</h3>
        <p>
          離開裂痕時依停留時間記錄排名並產生待領獎勵。
          回到 <b>時空裂痕入口</b>領取獎勵後，
          才能開始下一次挑戰。
        </p>
      </section>
    `
  },

  {
    key:'antharas',
    icon:'🐉',
    title:'侵蝕的安塔瑞斯巢穴',
    npc:'多魯嘉貝爾',
    place:'威頓村',
    req:'每日角色通關限制',
    reward:'安塔瑞斯素材／積分／製作材料',
    search:'安塔瑞斯 多魯嘉貝爾 威頓 萊利 輔佐官 地龍 魔眼 副本',
    html:`
      <section>
        <h3>📍 入口</h3>
        <p>
          到 <b>威頓村</b>找
          <b>多魯嘉貝爾</b>進入
          「侵蝕的安塔瑞斯巢穴」。
        </p>
      </section>

      <section>
        <h3>👥 隊伍／助戰</h3>
        <p>
          可設定最多 <b>4 位助戰者</b>提供增益。
          角色也可以用主戰或傭兵身分參與。
        </p>
      </section>

      <section>
        <h3>⏰ 每日限制</h3>
        <p>
          每個角色每日只能以主戰或傭兵身分
          <b>成功通關 1 次</b>。<br>
          通關成功時，所有實際出戰角色都會消耗當日次數。
          每日依 UTC+8 凌晨重置。
        </p>
      </section>

      <section>
        <h3>🚫 副本限制</h3>
        <p>
          安塔瑞斯副本內禁止傳送，
          必須依正常副本流程推進。
        </p>
      </section>

      <section>
        <h3>🎁 安塔瑞斯素材</h3>
        <p>
          龍鱗、龍骨、龍爪、龍血、龍肉、龍牙、龍眼等素材，
          可拿到威頓村找
          <b>萊利的輔佐官</b>兌換積分。
        </p>
        <p>
          同一模式角色共用積分，
          每滿 <b>10 積分</b>可開啟一次
          「多魯嘉7世傳家之寶」。
        </p>
      </section>

      <section>
        <h3>❤️ 安塔瑞斯之心</h3>
        <p>
          安塔瑞斯之心不是積分兌換素材，
          主要用於後續安塔瑞斯系列裝備製作。
        </p>
      </section>
    `
  },

  {
    key:'sherine',
    icon:'🔮',
    title:'席琳的世界／席琳遺骸',
    npc:'席琳／伊奧',
    place:'席琳神殿',
    req:'Lv.40 以上可開啟席琳的世界',
    reward:'席琳結晶／席琳遺骸',
    search:'席琳 席琳世界 席琳的世界 席琳結晶 遺骸 伊奧 席琳神殿',
    html:`
      <section>
        <h3>📍 席琳神殿</h3>
        <p>
          到 <b>席琳神殿</b>可以找到
          <b>席琳</b>與<b>伊奧</b>。
        </p>
      </section>

      <section>
        <h3>🔮 席琳的世界</h3>
        <p>
          角色達到 <b>Lv.40</b>後，
          可以向席琳祈禱，
          開啟或關閉「席琳的世界」。
        </p>
      </section>

      <section>
        <h3>💎 席琳結晶</h3>
        <p>
          席琳世界中的怪物可取得席琳結晶。
          怪物等級、是否為頭目等條件會影響取得機制。
        </p>
      </section>

      <section>
        <h3>🦴 伊奧遺骸兌換</h3>
        <p>
          找 <b>伊奧</b>可以使用
          <b>席琳結晶 ×1</b>
          兌換一件指定部位的席琳遺骸。
        </p>
        <p>
          可選：
          之爪、之眼、之血、之肉、
          之心、之骨、之牙、之鱗。
        </p>
      </section>

      <section>
        <h3>⭐ 遺骸效果</h3>
        <p>
          兌換出的遺骸會隨機附帶一種席琳套裝詞綴。
          將相同套裝名稱的遺骸裝入專屬遺骸欄，
          達到指定件數即可啟動套裝效果。
        </p>
      </section>
    `
  },

  {
    key:'pride',
    icon:'🗼',
    title:'傲慢之塔攻略',
    npc:'巴姆特',
    place:'傲慢之塔入口',
    req:'逐層攀登',
    reward:'支配符／製作素材／塔內掉落',
    search:'傲慢之塔 傲塔 巴姆特 支配符 潔尼斯女王 四屬性斗篷',
    html:`
      <section>
        <h3>🗼 基本流程</h3>
        <p>
          傲慢之塔不是選樓層後直接空降，
          初期需要從入口開始逐層往上攻略。
        </p>
      </section>

      <section>
        <h3>👑 10樓解鎖</h3>
        <p>
          首次擊敗 <b>10樓 潔尼斯女王</b>後，
          傲慢之塔入口會開放較低樓層的快速挑戰功能。
        </p>
      </section>

      <section>
        <h3>⬆️ 11樓以上</h3>
        <p>
          11樓以上主要依靠正常攀登、
          移動卷軸或對應樓層的支配符前進。
        </p>
      </section>

      <section>
        <h3>📜 支配符</h3>
        <p>
          持有對應樓層的支配符，
          可以提升該樓層行動與傳送便利性。
          排名挑戰期間則會封鎖傳送功能。
        </p>
      </section>

      <section>
        <h3>🔨 巴姆特</h3>
        <p>
          傲慢之塔入口的 <b>巴姆特</b>
          可以利用奇美拉之皮製作詛咒的皮革，
          並進一步打造
          地、水、風、火四種屬性斗篷。
        </p>
      </section>
    `
  }
];

/* ===== 📚 特殊攻略第二批 ===== */

SPECIAL_QUEST_GUIDES.push(

  {
    key:'thebes',
    icon:'🏛️',
    title:'底比斯／歐西里斯祭壇',
    npc:'巴特爾',
    place:'底比斯沙漠／金字塔內部／歐西里斯祭壇',
    req:'祭壇需底比斯歐西里斯祭壇鑰匙 ×1',
    reward:'寶箱碎片／祭壇雙王／底比斯寶物',
    search:'底比斯 歐西里斯 賀洛斯 阿努比斯 金字塔 祭壇 鑰匙 寶箱 巴特爾 龜裂之核',
    html:`
      <section>
        <h3>🗺️ 攻略順序</h3>
        <p>
          底比斯共有：
          <b>底比斯沙漠</b> →
          <b>底比斯金字塔內部</b> →
          <b>底比斯歐西里斯祭壇</b>。
        </p>
      </section>

      <section>
        <h3>🧩 寶箱碎片</h3>
        <p>
          一般底比斯怪物會掉落
          <b>歐西里斯初級寶箱碎片（上／下）</b>。
          深層怪物則可取得
          <b>高級寶箱碎片（上／下）</b>。
        </p>
        <p>
          到希培利亞找 <b>巴特爾</b>，
          上、下碎片各 1 個即可合成對應的
          「上鎖的歐西里斯寶箱」。
        </p>
      </section>

      <section>
        <h3>🔐 開啟寶箱</h3>
        <p>
          每開啟 <b>1 個</b>上鎖的歐西里斯寶箱，
          都會消耗 <b>龜裂之核 ×1</b>。
          高級寶箱的獎勵池會比初級寶箱更好。
        </p>
      </section>

      <section>
        <h3>🗝️ 祭壇鑰匙</h3>
        <p>
          底比斯深層的
          <b>尼荷斯、阿努斯、巴斯</b>
          及其變種怪物，
          有機會掉落
          <b>底比斯歐西里斯祭壇鑰匙</b>。
        </p>
      </section>

      <section>
        <h3>👑 歐西里斯祭壇</h3>
        <p>
          進入祭壇會消耗
          <b>祭壇鑰匙 ×1</b>。
        </p>
        <p>
          祭壇中同時面對
          <b>底比斯賀洛斯</b>與
          <b>底比斯阿努比斯</b>。
          兩隻都擊倒後會進入再次降臨流程；
          再次降臨也需要再消耗
          <b>祭壇鑰匙 ×1</b>。
        </p>
      </section>

      <section>
        <h3>🎁 雙王主要獎勵</h3>
        <p>
          賀洛斯與阿努比斯都會固定掉落
          <b>龜裂之核</b>與
          <b>上鎖的歐西里斯高級寶箱</b>，
          並有各自的底比斯飾品與其他高階掉落。
        </p>
      </section>
    `
  },


  {
    key:'tikal',
    icon:'🐍',
    title:'提卡爾／庫庫爾坎祭壇',
    npc:'巴特爾',
    place:'提卡爾神廟地區／深處／庫庫爾坎祭壇',
    req:'祭壇需提卡爾庫庫爾坎祭壇鑰匙 ×1',
    reward:'庫庫爾坎寶箱／雙杰弗雷庫／蛇神寶物',
    search:'提卡爾 庫庫爾坎 杰弗雷庫 祭壇 鑰匙 寶箱 巴特爾 龜裂之核',
    html:`
      <section>
        <h3>🗺️ 攻略順序</h3>
        <p>
          提卡爾區域分為：
          <b>提卡爾神廟地區</b> →
          <b>提卡爾神廟地區深處</b> →
          <b>庫庫爾坎祭壇</b>。
        </p>
      </section>

      <section>
        <h3>🧩 庫庫爾坎寶箱</h3>
        <p>
          提卡爾怪物會掉落
          <b>庫庫爾坎初級／高級寶箱碎片</b>，
          分為上、下兩半。
        </p>
        <p>
          上、下碎片各 1 個，
          可以到希培利亞找
          <b>巴特爾</b>合成對應的
          上鎖庫庫爾坎寶箱。
        </p>
      </section>

      <section>
        <h3>🔐 開啟寶箱</h3>
        <p>
          每開 1 個庫庫爾坎寶箱
          都需要 <b>龜裂之核 ×1</b>。
          高級寶箱可以取得更高階的提卡爾寶物。
        </p>
      </section>

      <section>
        <h3>🗝️ 祭壇鑰匙</h3>
        <p>
          提卡爾深處的
          <b>薩德泥偶、薩德司卡、薩德提歐</b>
          等高階怪物有機會掉落
          <b>提卡爾庫庫爾坎祭壇鑰匙</b>。
        </p>
      </section>

      <section>
        <h3>👑 庫庫爾坎祭壇</h3>
        <p>
          進入祭壇會消耗
          <b>祭壇鑰匙 ×1</b>。
        </p>
        <p>
          裡面會同時出現
          <b>提卡爾杰弗雷庫（雄）</b>與
          <b>提卡爾杰弗雷庫（雌）</b>。
          雙王擊倒後再次降臨時，
          還會再消耗 1 把祭壇鑰匙。
        </p>
      </section>

      <section>
        <h3>🎁 雙王主要獎勵</h3>
        <p>
          雙王都會固定掉落
          <b>上鎖的庫庫爾坎高級寶箱</b>
          與 <b>龜裂之核</b>。
        </p>
        <p>
          另外還能取得
          <b>提卡爾杰弗雷庫尖牙</b>、
          <b>提卡爾杰弗雷庫之眼</b>
          與各自的稀有遺物。
        </p>
      </section>
    `
  },


  {
    key:'sunrise',
    icon:'🌅',
    title:'日出之國攻略',
    npc:'巴特爾',
    place:'城墎／東之地／西之地／北之地',
    req:'直接由時空裂痕地區選擇',
    reward:'封印的妖怪之魂／傳說裝備／遺物',
    search:'日出之國 妖怪之魂 巨大骷髏 九尾狐 牛鬼 天狗 巴特爾 妖魂',
    html:`
      <section>
        <h3>🗺️ 四個區域</h3>
        <p>
          日出之國目前分成：
          <b>城墎</b>、
          <b>東之地</b>、
          <b>西之地</b>、
          <b>北之地</b>。
        </p>
      </section>

      <section>
        <h3>👹 妖怪</h3>
        <p>
          區域中會出現嗚釜、鎌鼬、
          轆轤首、唐傘小僧、河童、
          赤鬼、青鬼、鵺、天狗等妖怪。
        </p>
      </section>

      <section>
        <h3>💠 封印的妖怪之魂</h3>
        <p>
          日出之國多數妖怪都有機會掉落
          <b>封印的妖怪之魂</b>。
          頭目級妖怪的取得率通常更高。
        </p>
      </section>

      <section>
        <h3>🔮 妖魂凝鍊</h3>
        <p>
          收集
          <b>封印的妖怪之魂 ×100</b>，
          到希培利亞找
          <b>巴特爾</b>，
          可以凝鍊成
          <b>巨大骷髏的妖魂 ×1</b>。
        </p>
      </section>

      <section>
        <h3>✨ 巨大骷髏的妖魂</h3>
        <p>
          巨大骷髏的妖魂可以直接使用，
          每顆獲得
          <b>1,000,000 經驗值</b>，
          而且支援批量使用。
        </p>
      </section>

      <section>
        <h3>👑 高階目標</h3>
        <p>
          日出之國還有
          <b>白面金毛九尾狐・殺生石</b>、
          <b>牛鬼</b>、
          <b>巨大骷髏</b>
          等高階目標。
        </p>
        <p>
          這些怪物除了妖怪之魂外，
          還有大量高階技能書、裝備，
          以及極低機率的專屬遺物。
        </p>
      </section>
    `
  },


  {
    key:'demonTemple',
    icon:'🔥',
    title:'魔族神殿／炎魔謁見所',
    npc:'50級試煉 NPC／炎魔勢力',
    place:'拉斯塔巴德',
    req:'完成50級試煉前置階段',
    reward:'50級最終材料／炎魔友好度／炎魔製作',
    search:'魔族神殿 炎魔謁見所 炎魔 友好度 1000 50級 試煉 墮落',
    html:`
      <section>
        <h3>🔓 魔族神殿怎麼開</h3>
        <p>
          角色必須先接取自己的
          <b>50級職業試煉</b>，
          並完成前置收集階段。
        </p>
        <p>
          前置階段交付完成後，
          <b>魔族神殿會永久對該角色開放</b>。
          不需要先把最後獎勵兌換完才進去。
        </p>
      </section>

      <section>
        <h3>⚔️ 魔族神殿用途</h3>
        <p>
          魔族神殿是50級試煉的後半段區域。
          各職業需要在這裡取得自己的
          <b>最終試煉材料</b>，
          回任務 NPC 一次性兌換最終獎勵。
        </p>
      </section>

      <section>
        <h3>🔥 炎魔友好度</h3>
        <p>
          在 <b>魔族神殿</b>中，
          每擊殺任意一隻敵人，
          都會增加 <b>1 點炎魔友好度</b>。
        </p>
        <p>
          這個數值屬於隱藏進度，
          主要用來解鎖炎魔謁見所。
        </p>
      </section>

      <section>
        <h3>🏰 炎魔謁見所</h3>
        <p>
          必須同時符合：
        </p>
        <p>
          ① 已取得魔族神殿進入資格<br>
          ② 炎魔友好度達到 <b>1000</b>
        </p>
        <p>
          達成後，地圖中的
          <b>炎魔謁見所</b>才會開放。
        </p>
      </section>

      <section>
        <h3>🔨 炎魔謁見所 NPC</h3>
        <p>
          <b>炎魔之影：</b>製作炎魔血光斗篷。<br>
          <b>小惡魔：</b>製作惡魔系列武器。<br>
          <b>炎魔鐵匠：</b>製作各種高階金屬板。<br>
          <b>炎魔的輔佐官：</b>使用靈魂石碎片製作禁忌耳環。
        </p>
      </section>
    `
  }

);
/* 保存原本職業試煉函式 */
const _trialRowsOnly=qRows;
const _trialDetailOnly=qDetail;


/* 職業試煉 + 特殊攻略 */
qRows=function(){

  const out=_trialRowsOnly();

  SPECIAL_QUEST_GUIDES.forEach(function(g){

    if(!match(
      g.title,
      g.npc,
      g.place,
      g.req,
      g.reward,
      g.search
    )) return;

    out.push({
      id:'guide:'+g.key,
      kind:'guide',
      guide:g
    });

  });

  return out;
};


/* 任務列表加入特殊攻略 */
qList=function(){

  const rows=qRows();

  return `
    <div class="awk-note">
      完整收錄職業 15／30／45／50 級試煉，
      並加入特殊任務、兌換與副本攻略。
      可搜尋 NPC、材料、獎勵或副本名稱。
    </div>

    <div class="awk-list">

      ${
        rows.map(function(r){

          if(r.kind==='guide'){

            const g=r.guide;

            return card(
              'quest',
              r.id,
              g.icon+' '+g.title,
              g.place+'・'+g.npc+'・'+g.req,
              '特殊攻略'
            );
          }

          return card(
            'quest',
            r.id,
            (cls[r.cls]||r.cls)+' '+r.lv+'級試煉',
            r.npc+
            '・需求 '+r.req.join('、')+
            '・獎勵 '+r.rew.join('＋'),
            qStatus(r)
          );

        }).join('')
        ||
        '<div class="awk-empty">沒有符合的任務。</div>'
      }

    </div>
  `;
};


/* 特殊攻略詳細內容 */
    /* ===== 🔗 攻略內物品／怪物可直接點擊 ===== */

let _qGuideLinkIndex=null;

function qGuideNormName(s){
    return String(s||'')
        .replace(/（/g,'(')
        .replace(/）/g,')')
        .trim();
}

function qGuideLinkIndex(){

    if(_qGuideLinkIndex) return _qGuideLinkIndex;

    const out=[];

    /* 物品名稱 */
    try{
        Object.keys(DB.items||{}).forEach(function(id){

            const d=DB.items[id];

            if(!d || !d.n) return;

            out.push({
                kind:'item',
                id:id,
                name:String(d.n),
                norm:qGuideNormName(d.n)
            });
        });
    }catch(e){}

    /* 怪物名稱 */
    try{
        Object.keys(DB.mobs||{}).forEach(function(id){

            const d=DB.mobs[id];

            if(!d || !d.n) return;

            out.push({
                kind:'mob',
                id:id,
                name:String(d.n),
                norm:qGuideNormName(d.n)
            });
        });
    }catch(e){}

    /* 長名稱優先，避免短名稱搶先配對 */
    out.sort(function(a,b){
        return b.norm.length-a.norm.length;
    });

    _qGuideLinkIndex=out;

    return out;
}


function qGuideLinkButton(kind,id,label){

    const color=
        kind==='mob'
        ? '#fbbf24'
        : '#7dd3fc';

const haveText=
    kind==='item'
    ? ` <small style="color:#94a3b8;font-weight:600;">（持有 ${qHave(id)}）</small>`
    : '';
    return `
        <button
            type="button"
            style="
                display:inline;
                padding:0;
                border:0;
                background:none;
                color:${color};
                font:inherit;
                font-weight:800;
                text-decoration:underline;
                text-decoration-style:dotted;
                text-underline-offset:3px;
                cursor:pointer;
            "
            onclick="AFKWiki.guideDetail('${kind}','${id}')"
        >${esc(label)}${haveText}</button>
    `;
}


function qGuideLinkify(html){

    const box=document.createElement('div');

    box.innerHTML=String(html||'');

    const names=qGuideLinkIndex();

    box.querySelectorAll('b').forEach(function(b){

        if(b.querySelector('button')) return;

        const raw=String(b.textContent||'').trim();

        if(!raw) return;

        const norm=qGuideNormName(raw);

        let hit=null;
        let pos=-1;

        for(let i=0;i<names.length;i++){

            const x=names[i];

            const p=norm.indexOf(x.norm);

            if(p<0) continue;

            /*
             * 短名稱如「炎魔」只有整段文字完全相同才連結，
             * 避免把「炎魔友好度」錯當成怪物。
             */
            if(
                x.norm.length<4 &&
                norm!==x.norm
            ){
                continue;
            }

            hit=x;
            pos=p;
            break;
        }

        if(!hit) return;

        const before=raw.slice(0,pos);

        const label=raw.slice(
            pos,
            pos+hit.norm.length
        );

        const after=raw.slice(
            pos+hit.norm.length
        );

        b.innerHTML=
            esc(before)+
            qGuideLinkButton(
                hit.kind,
                hit.id,
                label
            )+
            esc(after);
    });

    return box.innerHTML;
}
qDetail=function(id){

  if(id.indexOf('guide:')===0){

    const key=id.slice(6);

    const g=SPECIAL_QUEST_GUIDES.find(function(x){
      return x.key===key;
    });

    if(!g) return '找不到攻略資料';

    return `
      <h2>${g.icon} ${esc(g.title)}</h2>

      <div class="awk-tags">
        <span>${esc(g.place)}</span>
        <span>${esc(g.npc)}</span>
      </div>

      <section>
        <h3>📌 重點</h3>

        <div class="awk-grid">
          <div>
            條件<br>
            <b>${esc(g.req)}</b>
          </div>

          <div>
            主要內容<br>
            <b>${esc(g.reward)}</b>
          </div>
        </div>
      </section>

      ${qGuideLinkify(g.html)}
    `;
  }

  return _trialDetailOnly(id);
};

/* ===== 🔨 NPC／製作百科 ===== */

function qCraftNpcs(){
    const homes={};
    const out=[];

    try{
        Object.keys(DB.towns||{}).forEach(function(tid){
            const tw=DB.towns[tid]||{};

            (tw.npcs||[]).forEach(function(np){
                if(!np || !np.id || homes[np.id]) return;

                homes[np.id]={
                    id:np.id,
                    n:np.n||np.id,
                    town:tw.n||tid,
                    d:np.d||''
                };
            });
        });

        Object.keys(CRAFT_RECIPES||{}).forEach(function(id){
            const recipes=CRAFT_RECIPES[id];

            if(!Array.isArray(recipes) || !recipes.length) return;

            const h=homes[id]||{
                id:id,
                n:id,
                town:'未知地點',
                d:''
            };

            out.push({
                id:id,
                n:h.n,
                town:h.town,
                d:h.d,
                recipes:recipes
            });
        });
    }catch(e){}

    out.sort(function(a,b){
        return String(a.town).localeCompare(String(b.town)) ||
               String(a.n).localeCompare(String(b.n));
    });

    return out;
}

function qCraftItemName(id){
    if(id==='gold') return '金幣';

    try{
        const d=DB.items&&DB.items[id];
        return d&&d.n ? d.n : id;
    }catch(e){
        return id;
    }
}

function qCraftHave(id){
    if(id==='gold'){
        try{
            return Math.max(0,Number(player.gold||0));
        }catch(e){
            return 0;
        }
    }

    try{
        return Number(qHave(id)||0);
    }catch(e){
        return 0;
    }
}

function qCraftItemLink(id,label){
    const have=qCraftHave(id);

    if(id==='gold'){
        return `
            <span style="font-weight:800;color:#fbbf24;">
                💰 ${esc(label)}
                <small style="color:#94a3b8;font-weight:600;">
                    （持有 ${have.toLocaleString()}）
                </small>
            </span>
        `;
    }

    return `
        <button
            type="button"
            onclick="AFKWiki.detail('item','${id}')"
            style="
                padding:0;
                border:0;
                background:none;
                color:#7dd3fc;
                font:inherit;
                font-weight:800;
                text-align:left;
                text-decoration:underline;
                text-decoration-style:dotted;
                text-underline-offset:3px;
                cursor:pointer;
            "
        >
            ${esc(label)}
            <small style="color:#94a3b8;font-weight:600;">
                （持有 ${have.toLocaleString()}）
            </small>
        </button>
    `;
}

function qCraftList(){
    const rows=qCraftNpcs().filter(function(n){
        const keys=[n.n,n.town,n.d];

        n.recipes.forEach(function(r){
            keys.push(qCraftItemName(r.result));

            (r.req||[]).forEach(function(m){
                keys.push(qCraftItemName(m.id));
            });
        });

        return match.apply(null,keys);
    });

    if(!rows.length){
        return `
            <section style="
                border:1px solid #334155;
                border-radius:12px;
                padding:16px;
                color:#94a3b8;
            ">
                找不到符合的製作 NPC 或配方。
            </section>
        `;
    }

    return rows.map(function(n){
        const products=n.recipes
            .slice(0,3)
            .map(function(r){
                return qCraftItemName(r.result);
            })
            .join('、');

        const more=n.recipes.length>3
            ? ` 等 ${n.recipes.length} 項`
            : '';

        return card(
            'craftnpc',
            n.id,
            '🔨 '+n.n,
            `${n.town} · ${products}${more}`,
            '製作'
        );
    }).join('');
}

function qCraftDetail(id){
    const n=qCraftNpcs().find(function(x){
        return x.id===id;
    });

    if(!n){
        return `
            <button class="awk-back" onclick="AFKWiki.back()">
                ← 返回列表
            </button>
            <p>找不到這名製作 NPC。</p>
        `;
    }

    const recipes=n.recipes.map(function(r,idx){
        const resultName=qCraftItemName(r.result);
        const outCnt=Math.max(1,Number(r.yield||1));

        const req=(r.req||[]).map(function(m){
            const need=Math.max(0,Number(m.cnt||1));
            const have=qCraftHave(m.id);
            const enough=have>=need;

            return `
                <div style="
                    padding:9px 0;
                    border-bottom:1px solid #243247;
                    line-height:1.55;
                ">
                    ${qCraftItemLink(
                        m.id,
                        qCraftItemName(m.id)
                    )}

                    <span style="
                        color:${enough?'#86efac':'#fca5a5'};
                        font-weight:800;
                        margin-left:6px;
                    ">
                        ×${need.toLocaleString()}
                    </span>
                </div>
            `;
        }).join('');

        return `
            <section style="
                margin-top:14px;
                border:1px solid #334155;
                border-radius:12px;
                padding:14px;
                background:#111c30;
            ">
                <div style="
                    color:#fbbf24;
                    font-weight:800;
                    margin-bottom:10px;
                ">
                    配方 ${idx+1}
                </div>

                <div style="
                    font-size:18px;
                    margin-bottom:12px;
                ">
                    ${qCraftItemLink(r.result,resultName)}

                    ${outCnt>1
                        ? `<span style="color:#facc15;font-weight:800;"> ×${outCnt}</span>`
                        : ''
                    }
                </div>

                <div style="
                    color:#94a3b8;
                    font-size:14px;
                    margin-bottom:4px;
                ">
                    🧰 所需材料
                </div>

                ${req || '<div style="color:#94a3b8;">無材料資料</div>'}
            </section>
        `;
    }).join('');

    return `
        <button class="awk-back" onclick="AFKWiki.back()">
            ← 返回列表
        </button>

        <h2>🔨 ${esc(n.n)}</h2>

        <div class="awk-tags">
            <span>${esc(n.town)}</span>
            <span>製作 NPC</span>
            <span>${n.recipes.length} 項配方</span>
        </div>

        ${n.d
            ? `<section style="
                    margin-top:14px;
                    border:1px solid #334155;
                    border-radius:12px;
                    padding:14px;
                    line-height:1.7;
                ">
                    📜 ${esc(n.d)}
               </section>`
            : ''
        }

        <h3 style="margin-top:18px;">⚒️ 製作清單</h3>

        ${recipes}
    `;
}



/* ===== 🗡️ 裝備圖鑑 ===== */

function qEquipDexCatLabel(c){
    if(!c) return '';

    const alias={
        sword1:'單手劍',
        sword2:'雙手劍',
        katana:'武士刀',
        blunt1:'單手鈍器／斧',
        blunt2:'雙手鈍器／巨斧',
        spear:'矛',
        bow:'弓',
        xbow:'十字弓',
        wand:'魔杖／法杖',
        dagger:'匕首',
        claw:'鋼爪',
        dual:'雙刀',
        chainsword:'鎖鏈劍',
        qigu:'奇古獸'
    };

    return alias[c.key]||c.name||c.key;
}

function qEquipDexCats(group){
    try{
        return (EQUIP_CATEGORIES||[]).filter(function(c){
            return c &&
                   c.group===group &&
                   Array.isArray(EQUIP_CAT_ITEMS[c.key]) &&
                   EQUIP_CAT_ITEMS[c.key].length>0;
        });
    }catch(e){
        return [];
    }
}

function qEquipDexHave(id){
    try{
        return Number(qHave(id)||0);
    }catch(e){
        return 0;
    }
}

function qEquipDexTotal(){
    let n=0;

    try{
        (EQUIP_CATEGORIES||[]).forEach(function(c){
            n+=(EQUIP_CAT_ITEMS[c.key]||[]).length;
        });
    }catch(e){}

    return n;
}

window.AFKEqDexGroup=function(group){
    S.equipGroup=group;
    S.equipCat=null;
    S.detail=null;
    render();
};

window.AFKEqDexCat=function(key){
    S.equipCat=key;

    try{
        const c=(EQUIP_CATEGORIES||[]).find(function(x){
            return x.key===key;
        });

        if(c) S.equipGroup=c.group;
    }catch(e){}

    S.detail=null;
    render();
};


window.AFKEqDexFilterClass=function(v){
    S.equipCls=v||'all';
    S.detail=null;
    render();
};

window.AFKEqDexSort=function(v){
    S.equipSort=v||'default';
    S.detail=null;
    render();
};


function qEquipDexCatCount(c){
    if(!c) return 0;

    let ids=[];

    try{
        ids=(EQUIP_CAT_ITEMS[c.key]||[]).slice();
    }catch(e){
        return 0;
    }

    const selectedCls=S.equipCls||'all';

    if(selectedCls==='all'){
        return ids.length;
    }

    let clsKey=selectedCls;

    if(selectedCls==='mine'){
        clsKey=
            typeof player!=='undefined' &&
            player &&
            player.cls
                ? player.cls
                : '';
    }

    if(!clsKey){
        return ids.length;
    }

    return ids.filter(function(id){
        const d=DB.items&&DB.items[id];

        if(!d) return false;

        try{
            return typeof reqAllowsClass!=='function'
                ? true
                : !!reqAllowsClass(d,clsKey);
        }catch(e){
            return true;
        }
    }).length;
}

function qEquipDexList(){

    const groups=['武器','防具','飾品'];

    let group=groups.indexOf(S.equipGroup)>=0
        ? S.equipGroup
        : '武器';

    S.equipGroup=group;

    const cats=qEquipDexCats(group);

    let cat=cats.find(function(c){
        return c.key===S.equipCat;
    });

    if(!cat) cat=cats[0]||null;

    if(cat) S.equipCat=cat.key;

    const groupButtons=groups.map(function(g){

        const on=g===group;

        return `
            <button
                type="button"
                onclick="AFKEqDexGroup('${g}')"
                style="
                    flex:0 0 auto;
                    padding:10px 16px;
                    border:1px solid ${on?'#d97706':'#475569'};
                    border-radius:10px;
                    background:${on?'#78350f':'#172033'};
                    color:${on?'#fbbf24':'#cbd5e1'};
                    font-size:16px;
                    font-weight:800;
                "
            >
                ${g}
            </button>
        `;
    }).join('');

    const catButtons=cats.map(function(c){

        const on=cat && c.key===cat.key;

        return `
            <button
                type="button"
                onclick="AFKEqDexCat('${c.key}')"
                style="
                    flex:0 0 auto;
                    padding:8px 13px;
                    border:1px solid ${on?'#d97706':'#475569'};
                    border-radius:9px;
                    background:${on?'#78350f':'#172033'};
                    color:${on?'#fbbf24':'#cbd5e1'};
                    font-size:14px;
                    font-weight:700;
                "
            >
                ${esc(qEquipDexCatLabel(c))}
                <small style="opacity:.75;">
                    ${qEquipDexCatCount(c)}
                </small>
            </button>
        `;
    }).join('');

    let ids=cat
        ? (EQUIP_CAT_ITEMS[cat.key]||[]).slice()
        : [];

    ids=ids.filter(function(id){

        const d=DB.items&&DB.items[id];

        if(!d) return false;

        let summary='';

        try{
            summary=itemSummary(d);
        }catch(e){}

        return match(
            d.n,
            summary,
            cat ? qEquipDexCatLabel(cat) : '',
            group
        );
    });


    /* ===== 職業篩選 ===== */
    const equipClsList=[
        ['royal','王族'],
        ['knight','騎士'],
        ['elf','妖精'],
        ['mage','法師'],
        ['dark','黑暗妖精'],
        ['dragon','龍騎士'],
        ['illusion','幻術士'],
        ['warrior','戰士']
    ];

    const selectedCls=S.equipCls||'all';
    const selectedSort=S.equipSort||'default';

    if(selectedCls!=='all'){
        const clsKey=
            selectedCls==='mine'
                ? (
                    typeof player!=='undefined' &&
                    player &&
                    player.cls
                        ? player.cls
                        : ''
                  )
                : selectedCls;

        if(clsKey){
            ids=ids.filter(function(id){
                const d=DB.items&&DB.items[id];
                if(!d) return false;

                try{
                    return typeof reqAllowsClass!=='function'
                        ? true
                        : !!reqAllowsClass(d,clsKey);
                }catch(e){
                    return true;
                }
            });
        }
    }

    /* ===== 排序 ===== */
    if(selectedSort==='damage' && group==='武器'){
        ids.sort(function(a,b){
            const da=DB.items[a]||{};
            const db=DB.items[b]||{};

            const va=
                (Number(da.dmgS)||0)+
                (Number(da.dmgL)||0);

            const vb=
                (Number(db.dmgS)||0)+
                (Number(db.dmgL)||0);

            return vb-va ||
                   String(da.n||a).localeCompare(
                       String(db.n||b)
                   );
        });
    }

    if(selectedSort==='name'){
        ids.sort(function(a,b){
            const da=DB.items[a]||{};
            const db=DB.items[b]||{};

            return String(da.n||a).localeCompare(
                String(db.n||b)
            );
        });
    }

    if(selectedSort==='owned'){
        ids.sort(function(a,b){
            const ha=qEquipDexHave(a);
            const hb=qEquipDexHave(b);

            if((hb>0)!==(ha>0)){
                return hb>0 ? 1 : -1;
            }

            if(hb!==ha) return hb-ha;

            const da=DB.items[a]||{};
            const db=DB.items[b]||{};

            return String(da.n||a).localeCompare(
                String(db.n||b)
            );
        });
    }

    const myCls=
        typeof player!=='undefined' &&
        player &&
        player.cls
            ? player.cls
            : '';

    const myClsName=
        equipClsList.find(function(x){
            return x[0]===myCls;
        });

    const classOptions=
        [
            ['all','全部職業'],
            [
                'mine',
                '目前職業'+
                (
                    myClsName
                        ? '（'+myClsName[1]+'）'
                        : ''
                )
            ]
        ]
        .concat(equipClsList)
        .map(function(x){
            return `
                <option
                    value="${x[0]}"
                    ${selectedCls===x[0]?'selected':''}
                >
                    ${x[1]}
                </option>
            `;
        })
        .join('');

    const sortList=[
        ['default','預設'],
        ...(group==='武器'
            ? [['damage','傷害高→低']]
            : []
        ),
        ['name','名稱'],
        ['owned','已持有優先']
    ];

    const sortOptions=
        sortList.map(function(x){
            return `
                <option
                    value="${x[0]}"
                    ${selectedSort===x[0]?'selected':''}
                >
                    ${x[1]}
                </option>
            `;
        }).join('');

    const filterControls=`
        <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:8px;
            margin:4px 0 14px 0;
        ">
            <label style="
                min-width:0;
                color:#94a3b8;
                font-size:13px;
            ">
                職業
                <select
                    onchange="AFKEqDexFilterClass(this.value)"
                    style="
                        width:100%;
                        margin-top:5px;
                        padding:9px 7px;
                        border:1px solid #475569;
                        border-radius:9px;
                        background:#172033;
                        color:#e2e8f0;
                        font-size:14px;
                        font-weight:700;
                    "
                >
                    ${classOptions}
                </select>
            </label>

            <label style="
                min-width:0;
                color:#94a3b8;
                font-size:13px;
            ">
                排序
                <select
                    onchange="AFKEqDexSort(this.value)"
                    style="
                        width:100%;
                        margin-top:5px;
                        padding:9px 7px;
                        border:1px solid #475569;
                        border-radius:9px;
                        background:#172033;
                        color:#e2e8f0;
                        font-size:14px;
                        font-weight:700;
                    "
                >
                    ${sortOptions}
                </select>
            </label>
        </div>
    `;


    const rows=ids.map(function(id){

        const d=DB.items[id];

        let summary='';

        try{
            summary=itemSummary(d);
        }catch(e){}

        const have=qEquipDexHave(id);

        const sub=[
            summary,
            have>0
                ? `持有 ${have}`
                : '未持有'
        ].filter(Boolean).join(' · ');

        return card(
            'item',
            id,
            d.n||id,
            sub||'點擊查看完整素質',
            cat ? qEquipDexCatLabel(cat) : group
        );
    }).join('');

    return `
        <section style="
            border:1px solid #334155;
            border-radius:12px;
            padding:14px;
            margin-bottom:14px;
            background:#111c30;
        ">
            <div style="
                color:#fbbf24;
                font-size:19px;
                font-weight:900;
                margin-bottom:6px;
            ">
                🗡️ 裝備圖鑑
            </div>

            <div style="
                color:#94a3b8;
                line-height:1.6;
            ">
                共 ${qEquipDexTotal()} 件裝備。
                未取得過的裝備也可以查詢基本能力、完整素質與掉落來源。
            </div>
        </section>

        <div style="
            display:flex;
            gap:8px;
            overflow-x:auto;
            padding-bottom:9px;
            margin-bottom:6px;
        ">
            ${groupButtons}
        </div>

        <div style="
            display:flex;
            gap:7px;
            overflow-x:auto;
            padding:4px 0 12px 0;
            margin-bottom:6px;
        ">
            ${catButtons}
        </div>

        ${filterControls}

        ${cat
            ? `
                <div style="
                    color:#fbbf24;
                    font-weight:800;
                    font-size:17px;
                    margin:8px 0 12px 2px;
                ">
                    ${esc(qEquipDexCatLabel(cat))}
                    <span style="
                        color:#94a3b8;
                        font-size:14px;
                        font-weight:600;
                    ">
                        · ${ids.length} 件
                    </span>
                </div>
              `
            : ''
        }

        ${rows || `
            <section style="
                border:1px solid #334155;
                border-radius:12px;
                padding:16px;
                color:#94a3b8;
            ">
                找不到符合的裝備。
            </section>
        `}
    `;
}


/* ---- 接進現有百科 ---- */
  list=function(){
    if(S.tab==='quests') return qList();
    if(S.tab==='craftnpc') return qCraftList();
    if(S.tab==='equipdex') return qEquipDexList();
    return _baseList();
};

  detail=function(){
    if(S.detail && S.detail.k==='quest'){
      return qDetail(S.detail.id);
    }

    if(S.detail && S.detail.k==='craftnpc'){
        return qCraftDetail(S.detail.id);
    }

    const html=_baseDetail();

    if(S.guideBack && S.detail){
      return `
        <button
          type="button"
          onclick="AFKWiki.backGuide()"
          style="
            margin:0 0 14px 0;
            padding:10px 14px;
            border:1px solid #475569;
            border-radius:10px;
            background:#172033;
            color:#bfdbfe;
            font-weight:800;
            font-size:15px;
          "
        >← 返回攻略</button>
        ${html}
      `;
    }

    return html;
  };


  render=function(){

    _baseRender();

    hideLegacyWiki();

    const tabs=document.getElementById('awk-tabs');
    if(!tabs) return;

    let b=tabs.querySelector('[data-awk-quests]');

    if(!b){

      b=document.createElement('button');

      b.setAttribute(
        'data-awk-quests',
        '1'
      );

      b.textContent='任務';

      b.onclick=function(){
        AFKWiki.tab('quests');
      };

      const sys=[...tabs.children].find(function(x){
        return x.textContent==='系統規則';
      });

      tabs.insertBefore(
        b,
        sys||null
      );
    }

    b.classList.toggle(
      'on',
      S.tab==='quests'
    );

        let cb=[...tabs.children].find(function(x){
            return x.textContent==='NPC／製作';
        });

        if(!cb){
            cb=document.createElement('button');
            cb.className=b.className;
            cb.classList.remove('on');
            cb.textContent='NPC／製作';

            cb.onclick=function(){
                AFKWiki.tab('craftnpc');
            };

            const craftSys=[...tabs.children].find(function(x){
                return x.textContent==='系統規則';
            });

            tabs.insertBefore(
                cb,
                craftSys||null
            );
        }

        cb.classList.toggle(
            'on',
            S.tab==='craftnpc'
        );

        let eb=[...tabs.children].find(function(x){
            return x.textContent==='裝備圖鑑';
        });

        if(!eb){
            eb=document.createElement('button');
            eb.className=b.className;
            eb.classList.remove('on');
            eb.textContent='裝備圖鑑';

            eb.onclick=function(){
                AFKWiki.tab('equipdex');
            };

            tabs.insertBefore(
                eb,
                cb||null
            );
        }

        eb.classList.toggle(
            'on',
            S.tab==='equipdex'
        );
  };

})();
window.AFKWiki={open(){ensure().classList.remove('hidden');render();},close(){const o=document.getElementById('awk-overlay');if(o)o.classList.add('hidden');},tab(t){S.tab=t;S.detail=null;S.guideBack=null;render();},detail(k,id){S.detail={k,id};render();},guideDetail(k,id){if(S.detail&&S.detail.k==='quest'&&String(S.detail.id||'').indexOf('guide:')===0){S.guideBack=S.detail.id;const body=document.getElementById('awk-body');S.guideScroll=body?body.scrollTop:0;}S.detail={k,id};render();},backGuide(){if(!S.guideBack)return;const id=S.guideBack;const y=Number(S.guideScroll||0);S.guideBack=null;S.guideScroll=0;S.tab='quests';S.detail={k:'quest',id};render();requestAnimationFrame(()=>{const body=document.getElementById('awk-body');if(body)body.scrollTop=y;});},back(){S.detail=null;S.guideBack=null;render();}};
const start=()=>{entry();let n=0,t=setInterval(()=>{if(entry()||++n>30)clearInterval(t)},500);};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
