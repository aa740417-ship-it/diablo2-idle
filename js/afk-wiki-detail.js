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
function skillDetail(id){const d=DB.skills[id];if(!d)return'找不到資料';const a=[];if(d.tier)a.push(`階級：${d.tier}`);if(d.mp!=null)a.push(`MP：${d.mp}`);if(d.hpCost!=null)a.push(`HP 消耗：${d.hpCost}`);if(d.reqEle)a.push(`屬性：${ele[d.reqEle]||d.reqEle}`);let books=[];Object.keys(DB.items||{}).forEach(i=>{const x=DB.items[i];if(x&&x.type==='skillbk'&&x.sk===id)books.push({i,x});});return `<h2>${esc(d.n)}</h2><div class="awk-tags"><span>${esc(skillReq(d))}</span>${d.tier?`<span>${d.tier}階</span>`:''}</div><section><h3>🎓 可學職業／等級</h3><p>${esc(skillReq(d))}</p></section><section><h3>📊 技能資料</h3><p>${a.map(esc).join('<br>')||'沒有額外數值欄位。'}</p></section>${d.desc||d.msg?`<section><h3>✨ 效果說明</h3><p>${esc(d.desc||d.msg)}</p></section>`:''}${books.length?`<section><h3>📘 學習書／水晶</h3>${books.map(b=>`<div class="awk-row"><b>${esc(b.x.n)}</b><em>${(knowledge().itemDrops[b.i]||[]).length} 個掉落來源</em></div>`).join('')}</section>`:''}`;}
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
            onclick="AFKWiki.detail('${kind}','${id}')"
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
  /* ---- 接進現有百科 ---- */
  list=function(){
    return S.tab==='quests'
      ? qList()
      : _baseList();
  };

  detail=function(){
    return S.detail && S.detail.k==='quest'
      ? qDetail(S.detail.id)
      : _baseDetail();
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
  };

})();    
window.AFKWiki={open(){ensure().classList.remove('hidden');render();},close(){const o=document.getElementById('awk-overlay');if(o)o.classList.add('hidden');},tab(t){S.tab=t;S.detail=null;render();},detail(k,id){S.detail={k,id};render();},back(){S.detail=null;render();}};
const start=()=>{entry();let n=0,t=setInterval(()=>{if(entry()||++n>30)clearInterval(t)},500);};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
