(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const settings = window.TOPREZ || {};
  const number = settings.phoneRaw || '+79137570609';
  const menuButton = $('.menu-button');
  const nav = $('#navigation');
  const closeMenu = () => { menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Открыть меню'); nav.classList.remove('open'); document.body.classList.remove('menu-open'); };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню'); nav.classList.toggle('open',open); document.body.classList.toggle('menu-open',open);
  });
  $$('a',nav).forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown', e => {if(e.key==='Escape' && nav.classList.contains('open')) {closeMenu();menuButton.focus();}});
  document.addEventListener('focusin', e => {if(nav.classList.contains('open') && !e.target.closest('.site-header')) closeMenu();});
  matchMedia('(min-width:681px)').addEventListener('change', e => {if(e.matches) closeMenu();});

  const dialog = $('#contact-dialog');
  let trigger = null;
  function showContact(mode, opener) {
    trigger = opener || document.activeElement;
    $('#dialog-title').innerHTML = mode==='max' ? 'НАПИШИТЕ<br>НАМ В MAX.' : 'ОБСУДИМ<br>ВАШИ СТЕНЫ?';
    $('#dialog-copy').textContent = mode==='max' ? 'Скопируйте номер и добавьте контакт в MAX. Если поиск недоступен, позвоните нам — обсудим ваш объект по телефону.' : 'Выберите удобный способ связи. Расскажите, какие обои вы выбрали и когда планируете начать.';
    $('#dialog-telegram').hidden = mode==='max';
    $('#dialog-max').hidden = mode==='max';
    $('#open-max').hidden = mode!=='max';
    $('#copy-status').textContent = '';
    if(mode==='max' && settings.maxProfile) { $('#open-max').href = settings.maxProfile; }
    if(!dialog.open) {dialog.showModal();document.body.classList.add('dialog-open');}
    $('.dialog-close').focus();
  }
  $$('[data-contact]').forEach(b=>b.addEventListener('click',()=>showContact('all',b)));
  $$('[data-max]').forEach(b=>b.addEventListener('click',()=>showContact('max',b)));
  $('#dialog-max').addEventListener('click',()=>showContact('max',trigger));
  $('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click', e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');trigger?.focus();});
  $('#copy-phone').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(number);$('#copy-status').textContent='Номер скопирован: '+(settings.phone||'+7 913 757 06 09');}
    catch {$('#copy-status').textContent='Выделите и скопируйте номер вручную: '+number;}
  });

  const checks = $$('[data-prep]');
  if(checks.length) {
    let saved=[]; let persistent=true;
    try { const raw=JSON.parse(localStorage.getItem('toprez-preparation-v1')||'[]'); if(Array.isArray(raw))saved=raw; } catch {persistent=false;}
    checks.forEach((c,i)=>{c.checked=saved.includes(i);});
    function update(save=true) {
      const marked=checks.filter(c=>c.checked);
      $('#completed-count').textContent=String(marked.length);
      $('#prep-progress').value=marked.length;
      $('#progress-label').textContent = marked.length===8?'Все действия отмечены':`Готово: ${marked.length} из 8 действий`;
      $('#finish-title').textContent = marked.length===8?'Все действия отмечены. Обсудим результат?':'К новым обоям — шаг за шагом.';
      if(save)try {localStorage.setItem('toprez-preparation-v1',JSON.stringify(checks.flatMap((c,i)=>c.checked?[i]:[])));}catch{persistent=false;}
      if(!persistent)$('#storage-notice').textContent='Сохранение недоступно. Отметки действуют до закрытия страницы.';
    }
    checks.forEach(c=>c.addEventListener('change',()=>update()));
    $('#reset-checklist').addEventListener('click',()=>{checks.forEach(c=>c.checked=false);update();});
    $('#print-checklist').addEventListener('click',()=>window.print());
    update(false);
  }

  const textures={
    linen:{label:'ТИШИНА<br>В ДЕТАЛЯХ.',kicker:'СПОКОЙНЫЙ РИТМ',title:'Когда хочется воздуха',description:'Мягкие оттенки и деликатная фактура оставляют пространство для мебели, света и любимых вещей. Присмотритесь к образцам при дневном и вечернем освещении.',alt:'Условный образец спокойной льняной фактуры'},
    pattern:{label:'РИТМ<br>ВАШЕГО ДОМА.',kicker:'ВЫРАЗИТЕЛЬНАЯ ГЕОМЕТРИЯ',title:'Когда важен рисунок',description:'Геометрия задаёт ритм пространству. Посмотрите на образец с расстояния и заранее уточните раппорт — шаг повторения рисунка. Он влияет на совмещение полотен и расход материала.',alt:'Условный образец геометрического рисунка на приглушённом зелёном фоне'},
    mural:{label:'СТЕНА<br>С ХАРАКТЕРОМ.',kicker:'ОДИН БОЛЬШОЙ АКЦЕНТ',title:'Когда стена становится картиной',description:'Панно или фреска могут стать центром комнаты. Перед заказом уточните размеры стены, расположение мебели и розеток. Пришлите нам выбранный сюжет, чтобы обсудить монтаж.',alt:'Стилизованное панно с мягкими природными формами'}
  };
  const tabs=$$('[data-texture]');
  function selectTexture(tab) {
    const key=tab.dataset.texture, t=textures[key];
    tabs.forEach(b=>{const selected=b===tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
    $('#texture-preview').className='texture-preview texture-'+key;
    $('#texture-preview').setAttribute('aria-label',t.alt);
    $('#texture-panel').setAttribute('aria-labelledby',tab.id);
    $('#texture-label').innerHTML=t.label;
    $('#texture-kicker').textContent=t.kicker;
    $('#texture-title').textContent=t.title;
    $('#texture-description').textContent=t.description;
    $('.sample-label>span:first-child').textContent='ПАЛИТРА / 0'+(tabs.indexOf(tab)+1);
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>selectTexture(tab));
    tab.addEventListener('keydown',e=>{let index=i;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();selectTexture(tabs[index]);tabs[index].focus();});
  });
})();
