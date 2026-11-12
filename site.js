(()=>{
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const menu=$('.menu-toggle'),nav=$('#primary-nav');
  const closeMenu=()=>{menu?.setAttribute('aria-expanded','false');nav?.classList.remove('open');};
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
  nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=$('.motion-toggle');let manualPause=false;
  const updateMotion=()=>{
    const paused=reduced.matches||manualPause;
    document.documentElement.classList.toggle('reduced-motion',reduced.matches);
    document.documentElement.classList.toggle('motion-paused',paused);
    motion?.setAttribute('aria-pressed',String(paused));motion?.setAttribute('aria-label',reduced.matches?'已依系統設定減少動效':paused?'繼續背景動效':'暫停背景動效');
    if(motion){motion.querySelector('.motion-label').textContent=reduced.matches?'已減少動效':paused?'繼續動效':'暫停動效';motion.querySelector('span').textContent=paused?'▷':'Ⅱ';motion.disabled=reduced.matches;}
    window.dispatchEvent(new CustomEvent('dse:motion',{detail:{paused}}));
  };
  motion?.addEventListener('click',()=>{manualPause=!manualPause;updateMotion();});reduced.addEventListener('change',updateMotion);updateMotion();
  const items=$$('.faq-item'),search=$('.faq-search input'),filters=$$('[data-faq-filter]');let selected='all';
  const filter=()=>{
    const query=(search?.value??'').trim().toLocaleLowerCase();let count=0;
    for(const item of items){const visible=(selected==='all'||item.dataset.category===selected)&&item.textContent.toLocaleLowerCase().includes(query);item.hidden=!visible;if(visible)count++;}
    if($('.faq-empty'))$('.faq-empty').hidden=count>0;if($('.faq-count'))$('.faq-count').textContent=`顯示 ${count} 個常見問題`;
  };
  for(const button of filters)button.addEventListener('click',()=>{selected=button.dataset.faqFilter;for(const b of filters)b.setAttribute('aria-pressed',String(b===button));filter();});
  search?.addEventListener('input',filter);
  const mapContent={
    learning:{title:'作答與分析，在手機完成。',body:'年級、作答、用時、提示及學習進度保存在本機，不會傳給 RevenueCat 或 Apple 的購買服務。',destination:'本機分析',route:'留在本機'},
    cloud:{title:'由你開啟，備份到自己的 iCloud。',body:'支援備份的版本會在你啟用後，將學習紀錄及設定存到私人 iCloud，佔用你的儲存空間。沒有開啟就不會自動上傳；容量不足時仍保留本機紀錄。',destination:'私人 iCloud',route:'自行啟用後'},
    purchase:{title:'購買驗證，與答題紀錄分開。',body:'Apple 處理付款；RevenueCat 處理交易、匿名識別碼及完整版權限。我們不接收付款卡資料，也不會將答題紀錄交給購買服務。',destination:'Apple／RevenueCat',route:'購買狀態及識別碼'}
  };
  const tabs=$$('[data-data-tab]');
  const selectData=tab=>{
    for(const b of tabs){b.setAttribute('aria-selected',String(b===tab));b.tabIndex=b===tab?0:-1;}
    const id=tab.dataset.dataTab,data=mapContent[id],panel=$('#data-panel');
    $('.data-explorer').dataset.active=id;panel.setAttribute('aria-labelledby',tab.id);panel.querySelector('h3').textContent=data.title;panel.querySelector('p').textContent=data.body;$('.node-destination strong').textContent=data.destination;$('.map-link b').textContent=data.route;
  };
  for(const tab of tabs){tab.addEventListener('click',()=>selectData(tab));tab.addEventListener('keydown',e=>{let index=tabs.indexOf(tab);if(e.key==='ArrowRight')index=(index+1)%tabs.length;else if(e.key==='ArrowLeft')index=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();selectData(tabs[index]);tabs[index].focus();});}
  if(tabs.length)selectData(tabs[0]);
  $$('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
  $$('[data-email]').forEach(b=>b.addEventListener('click',async()=>{const status=$('.copy-status');try{await navigator.clipboard.writeText(b.dataset.email);status.textContent='電郵地址已複製。';}catch{status.textContent='請長按或選取上方電郵地址複製。';}}));
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}},{threshold:.04});
    const targets=$$('.intro-grid,.learning-path,.world-links>a,.section-top,.plan-banner,.contact-inner');
    targets.forEach(el=>{el.classList.add('reveal');observer.observe(el);});document.documentElement.classList.add('js');
  }
  const policy=$('.policy-body'),contents=$('.contents');let frame=0;
  const updateReading=()=>{frame=0;if(!policy)return;const box=policy.getBoundingClientRect(),range=Math.max(1,policy.offsetHeight-innerHeight*.65),progress=Math.max(0,Math.min(1,-box.top/range));$('.reading-label').textContent=`${Math.round(progress*100)}%`;$('.reading-track>span').style.width=`${progress*100}%`;let current=$$('.policy-section')[0];for(const s of $$('.policy-section'))if(s.getBoundingClientRect().top<innerHeight*.4)current=s;for(const a of contents.querySelectorAll('nav a')){if(a.hash==='#'+current.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}};
  window.addEventListener('scroll',()=>{if(policy&&!frame)frame=requestAnimationFrame(updateReading);},{passive:true});window.addEventListener('resize',updateReading,{passive:true});updateReading();
})();
