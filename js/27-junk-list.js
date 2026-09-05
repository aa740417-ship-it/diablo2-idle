(function(){
'use strict';

function junkPrefs(){
  if(!player.junkPrefs) player.junkPrefs={};
  return player.junkPrefs;
}

function junkName(sig){
  try{
    const held=(player.inv||[]).find(i=>itemSig(i)===sig);
    if(held && typeof _autoSellPlainItemName==='function'){
      return _autoSellPlainItemName(held);
    }
    if(held && typeof getItemFullName==='function'){
      const box=document.createElement('div');
      box.innerHTML=getItemFullName(held);
      return (box.textContent||box.innerText||held.id).trim();
    }
  }catch(e){}

  const id=String(sig||'').split('|')[0];
  return DB.items?.[id]?.n || id || '未知物品';
}

function cancelJunk(sig){
  const p=junkPrefs();
  delete p[sig];

  (player.inv||[]).forEach(i=>{
    try{
      if(itemSig(i)!==sig) return;
      i.junk=false;
      delete i.junkSince;
      delete i._autoSellQty;
      delete i._ruleJunk;
    }catch(e){}
  });

  try{ saveGame(); }catch(e){}
  try{ renderTabs(true); }catch(e){}
  renderJunkList();
}

function renderJunkList(){
  const body=document.getElementById('junk-list-body');
  const count=document.getElementById('junk-list-count');
  if(!body) return;

  const q=(document.getElementById('junk-list-search')?.value||'')
    .trim().toLowerCase();

  const all=Object.keys(junkPrefs())
    .filter(k=>junkPrefs()[k])
    .map(sig=>({sig,name:junkName(sig)}))
    .sort((a,b)=>a.name.localeCompare(b.name,'zh-TW'));

  const rows=q ? all.filter(x=>x.name.toLowerCase().includes(q)) : all;

  if(count) count.textContent='目前廢品名單：'+all.length+' 種';
  body.innerHTML='';

  if(!rows.length){
    body.innerHTML=
      '<div style="padding:25px;text-align:center;color:#94a3b8">'+
      (all.length?'沒有符合搜尋的物品':'目前沒有設定任何廢品')+
      '</div>';
    return;
  }

  rows.forEach(x=>{
    const row=document.createElement('div');
    row.style.cssText=
      'display:flex;align-items:center;gap:8px;padding:10px 4px;border-bottom:1px solid #334155';

    const name=document.createElement('div');
    name.textContent=x.name;
    name.style.cssText=
      'flex:1;min-width:0;color:#f8fafc;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';

    const btn=document.createElement('button');
    btn.type='button';
    btn.textContent='取消廢品';
    btn.style.cssText=
      'flex:none;padding:7px 10px;background:#78350f;border:1px solid #f59e0b;border-radius:7px;color:#fde68a;font-weight:800';
    btn.onclick=()=>cancelJunk(x.sig);

    row.append(name,btn);
    body.appendChild(row);
  });
}

function closeJunkList(){
  document.getElementById('junk-list-modal')?.remove();
}

window.openJunkList=function(){
  closeJunkList();

  const el=document.createElement('div');
  el.id='junk-list-modal';
  el.style.cssText=
    'position:fixed;inset:0;z-index:10100;background:rgba(2,6,23,.82);display:flex;align-items:center;justify-content:center;padding:12px';

  el.innerHTML=`
    <div style="width:min(600px,96vw);max-height:85vh;background:#172033;border:2px solid #d69e2e;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;color:#e2e8f0">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:13px;border-bottom:1px solid #475569">
        <strong style="font-size:20px;color:#fde68a">🗑️ 廢品名單</strong>
        <button id="junk-list-close" style="padding:6px 10px;background:#334155;border:1px solid #64748b;border-radius:6px;color:white">Close</button>
      </div>

      <div style="padding:10px 13px;color:#cbd5e1;font-size:13px">
        選錯的物品按「取消廢品」，以後同款物品掉落時就不會再自動被標成廢品。
      </div>

      <div style="padding:0 13px 9px">
        <input id="junk-list-search" type="search" placeholder="搜尋廢品名稱"
          style="width:100%;padding:9px;background:#020617;border:1px solid #64748b;border-radius:7px;color:white">
      </div>

      <div id="junk-list-count" style="padding:0 13px 8px;color:#94a3b8;font-size:12px"></div>
      <div id="junk-list-body" style="overflow-y:auto;padding:0 10px 14px;min-height:120px"></div>
    </div>`;

  document.body.appendChild(el);

  el.onclick=e=>{
    if(e.target===el) closeJunkList();
  };

  document.getElementById('junk-list-close').onclick=closeJunkList;
  document.getElementById('junk-list-search').oninput=renderJunkList;

  renderJunkList();
};

function addButton(){
  const modal=document.getElementById('autosell-rule-modal');
  if(!modal || document.getElementById('as-junk-list-btn')) return;

  const actions=modal.querySelector('.as-actions');
  if(!actions) return;

  const btn=document.createElement('button');
  btn.id='as-junk-list-btn';
  btn.type='button';
  btn.textContent='🗑️ 廢品名單';
  btn.onclick=openJunkList;
  btn.style.cssText=
    'background:#78350f;border-color:#f59e0b;color:#fde68a;font-weight:800';

  actions.insertBefore(btn,actions.firstChild);
}

const oldOpen=window.openAutoSellRules;
if(typeof oldOpen==='function'){
  window.openAutoSellRules=function(){
    const r=oldOpen.apply(this,arguments);
    setTimeout(addButton,0);
    return r;
  };
}
})();
