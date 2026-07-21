/* ============================================
   Ecklet Engineering — app.js
   Shared JS for all pages
   ============================================ */

/* --- Nav scroll + burger + mobile nav --- */
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>navbar.classList.toggle('scrolled',window.scrollY>68),{passive:true});
document.getElementById('burgerBtn').addEventListener('click',()=>{document.getElementById('mobileNav').classList.add('open');document.body.style.overflow='hidden';});
document.getElementById('closeNav').addEventListener('click',closeMobileNav);
function closeMobileNav(){document.getElementById('mobileNav').classList.remove('open');document.body.style.overflow='';}

/* --- Mobile accordion --- */
document.querySelectorAll('.mob-acc-toggle').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.closest('.mob-acc');
    const wasOpen=item.classList.contains('open');
    document.querySelectorAll('.mob-acc.open').forEach(i=>i.classList.remove('open'));
    if(!wasOpen)item.classList.add('open');
  });
});

/* --- Subnav scroll + active highlight --- */
function scrollToId(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'});}
(function(){
  const snavBtns=document.querySelectorAll('.snav-btn');
  if(!snavBtns.length)return;
  const sections=[];
  snavBtns.forEach(b=>{const m=b.getAttribute('onclick')?.match(/scrollToId\('(.+?)'\)/);if(m)sections.push(m[1]);});
  const snavObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const idx=sections.indexOf(e.target.id);if(idx>=0){snavBtns.forEach(b=>b.classList.remove('active'));if(snavBtns[idx])snavBtns[idx].classList.add('active');}}});},{rootMargin:'-30% 0px -65% 0px'});
  sections.forEach(id=>{const el=document.getElementById(id);if(el)snavObs.observe(el);});
})();

/* --- Reveal (Intersection Observer) --- */
const obs=new IntersectionObserver(entries=>{entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*80);obs.unobserve(e.target);}});},{threshold:.06,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

/* --- Smooth scroll for anchor links --- */
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}});});

/* --- Mega-nav --- */
(function(){
  const ITEMS = [
    {itemId:'ni-services', btnId:'nt-services'},
    {itemId:'ni-industries', btnId:'nt-industries'},
    {itemId:'ni-about',    btnId:'nt-about'},
  ];
  const overlay = document.getElementById('navOverlay');

  function openMega(itemId, btnId) {
    ITEMS.forEach(({itemId:id, btnId:bid}) => {
      if (id !== itemId) {
        document.getElementById(id)?.classList.remove('open');
        const b = document.getElementById(bid);
        if (b) b.setAttribute('aria-expanded','false');
      }
    });
    const item = document.getElementById(itemId);
    const btn  = document.getElementById(btnId);
    item?.classList.add('open');
    if (btn) btn.setAttribute('aria-expanded','true');
    if (overlay) overlay.classList.add('visible');
  }

  function closeAll() {
    ITEMS.forEach(({itemId, btnId}) => {
      document.getElementById(itemId)?.classList.remove('open');
      const b = document.getElementById(btnId);
      if (b) b.setAttribute('aria-expanded','false');
    });
    if (overlay) overlay.classList.remove('visible');
  }

  ITEMS.forEach(({itemId, btnId}) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const item = document.getElementById(itemId);
      const isOpen = item?.classList.contains('open');
      if (isOpen) closeAll();
      else openMega(itemId, btnId);
    });
  });

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeAll(); });
  if (overlay) overlay.addEventListener('click', closeAll);
  document.querySelectorAll('.nav-mega').forEach(m => {
    m.addEventListener('click', e => e.stopPropagation());
  });
})();

/* --- Telegram form handler --- */
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID   = 'YOUR_CHAT_ID';

async function sendToTelegram(data) {
  const lines = [];
  lines.push('\u{1f4cb} *Новая заявка с сайта Эклет Инжиниринг*');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const [key, val] of Object.entries(data)) {
    if (!val || key === 'bot-field' || key === 'form-name') continue;
    const label = {
      name:    '\u{1f464} Имя',
      phone:   '\u{1f4de} Телефон',
      email:   '\u{1f4e7} Email',
      message: '\u{1f4ac} Сообщение',
      service: '\u{1f527} Услуга',
      industry:'\u{1f3ed} Отрасль',
      object:  '\u{1f3d7} Объект',
    }[key] || key;
    lines.push(`${label}: ${val}`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`\u{1f310} Источник: ${window.location.href}`);
  lines.push(`⏰ ${new Date().toLocaleString('ru-RU', {timeZone:'Asia/Novosibirsk'})}`);
  const text = lines.join('\n');
  if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
    console.log('[TG MOCK] Отправка в Telegram:\n', text);
    await new Promise(r => setTimeout(r, 800));
    return { ok: true, mock: true };
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    TELEGRAM_CHAT_ID,
      text:       text,
      parse_mode: 'Markdown',
    }),
  });
  return response.json();
}

async function handleEckletForm(e, formEl) {
  e.preventDefault();
  const btn = formEl.querySelector('[type=submit]');
  const successEl = formEl.closest('section')?.querySelector('.form-success');
  if (btn) {
    btn.disabled = true;
    btn.dataset.origText = btn.textContent;
    btn.textContent = 'Отправляем…';
  }
  const data = {};
  new FormData(formEl).forEach((val, key) => { data[key] = val.trim(); });
  try {
    const result = await sendToTelegram(data);
    if (result.ok) {
      formEl.style.display = 'none';
      if (successEl) {
        successEl.style.display = 'flex';
      } else {
        const msg = document.createElement('div');
        msg.className = 'form-success-inline';
        msg.innerHTML = `
          <div class="fsi-icon">✓</div>
          <div class="fsi-title">Заявка принята${result.mock ? ' (тест)' : ''}</div>
          <div class="fsi-text">Свяжемся с вами в течение 1 рабочего дня.</div>`;
        formEl.parentNode.insertBefore(msg, formEl.nextSibling);
      }
    } else {
      throw new Error(result.description || 'Ошибка API');
    }
  } catch (err) {
    console.error('[TG]', err);
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.origText;
    }
    const errEl = formEl.querySelector('.form-error') || (() => {
      const el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'color:#e53e3e;font-size:14px;margin-top:8px;';
      formEl.appendChild(el);
      return el;
    })();
    errEl.textContent = 'Не удалось отправить. Позвоните нам: +7 (383) 375-01-30';
  }
}

/* --- Inline form success CSS injection --- */
(function injectFormCSS() {
  const s = document.createElement('style');
  s.textContent = `
    .form-success-inline{display:flex;flex-direction:column;align-items:center;text-align:center;padding:32px 24px;background:var(--surface,#F4F7FA);border:1px solid rgba(13,28,46,.08);border-radius:2px;margin-top:8px;}
    .fsi-icon{width:48px;height:48px;border-radius:50%;background:var(--accent,#0F2741);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;}
    .fsi-title{font-size:18px;font-weight:700;color:var(--accent,#0F2741);margin-bottom:6px;}
    .fsi-text{font-size:15px;color:rgba(13,28,46,.6);line-height:1.55;}
    .form-success{display:none;flex-direction:column;align-items:center;text-align:center;padding:32px 24px;}
  `;
  document.head.appendChild(s);
})();

/* --- Active nav highlight --- */
(function(){
  var map={
    'services.html':'ni-services','service-complex.html':'ni-services',
    'service-design.html':'ni-services','service-supply.html':'ni-services',
    'service-construction.html':'ni-services',
    'service-construction-engineering.html':'ni-services','bim.html':'ni-services',
    'industry-apk.html':'ni-industries','industry-commercial.html':'ni-industries',
    'industry-hotels.html':'ni-industries','industry-production.html':'ni-industries',
    'industry-residential.html':'ni-industries','industry-warehouses.html':'ni-industries',
    'industries.html':'ni-industries',
    'projects.html':'ni-projects',
    'blog.html':'ni-blog','blog-bim-for-client.html':'ni-blog',
    'blog-capex-warehouse.html':'ni-blog','blog-expertise.html':'ni-blog',
    'blog-industrial-floors.html':'ni-blog','blog-scan-to-bim.html':'ni-blog',
    'process.html':'ni-about','about.html':'ni-about',
    'geography.html':'ni-about','certs.html':'ni-about'
  };
  var page=window.location.pathname.split('/').pop()||'index.html';
  var navId=map[page];
  if(!navId)return;
  var li=document.getElementById(navId);
  if(!li)return;
  var trigger=li.querySelector('a, button');
  if(trigger)trigger.classList.add('nav-active');
})();
