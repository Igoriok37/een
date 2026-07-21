/* ════════════════════════════════════════════════════
   Эклет Инжиниринг — app.js
   ════════════════════════════════════════════════════ */

/* ── NAV + MEGA-MENU + MOBILE NAV ── */
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>navbar.classList.toggle('scrolled',window.scrollY>60),{passive:true});
document.getElementById('burgerBtn').addEventListener('click',()=>{document.getElementById('mobileNav').classList.add('open');document.body.style.overflow='hidden';});
document.getElementById('closeNav').addEventListener('click',closeMobileNav);
function closeMobileNav(){document.getElementById('mobileNav').classList.remove('open');document.body.style.overflow='';}
(function(){
  const ITEMS=[{itemId:'ni-services',btnId:'nt-services'},{itemId:'ni-industries',btnId:'nt-industries'},{itemId:'ni-about',btnId:'nt-about'}];
  const overlay=document.getElementById('navOverlay');
  function openMega(iid,bid){ITEMS.forEach(({itemId:id,btnId:b})=>{if(id!==iid){document.getElementById(id)?.classList.remove('open');document.getElementById(b)?.setAttribute('aria-expanded','false');}});document.getElementById(iid)?.classList.add('open');document.getElementById(bid)?.setAttribute('aria-expanded','true');overlay?.classList.add('visible');}
  function closeAll(){ITEMS.forEach(({itemId:i,btnId:b})=>{document.getElementById(i)?.classList.remove('open');document.getElementById(b)?.setAttribute('aria-expanded','false');});overlay?.classList.remove('visible');}
  ITEMS.forEach(({itemId:iid,btnId:bid})=>{const btn=document.getElementById(bid);if(!btn)return;btn.addEventListener('click',e=>{e.stopPropagation();document.getElementById(iid)?.classList.contains('open')?closeAll():openMega(iid,bid);});});
  document.addEventListener('click',closeAll);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
  overlay?.addEventListener('click',closeAll);
  document.querySelectorAll('.nav-mega').forEach(m=>m.addEventListener('click',e=>e.stopPropagation()));
})();
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:.07});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

/* ── TELEGRAM FORM HANDLER ── */
/* ═══════════════════════════════════════════════════════════
   Ecklet Engineering — Telegram Form Handler
   Заменить значения:
     TELEGRAM_BOT_TOKEN → токен от @BotFather
     TELEGRAM_CHAT_ID   → chat id куда слать заявки
   ═══════════════════════════════════════════════════════════ */

const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID   = 'YOUR_CHAT_ID';

async function sendToTelegram(data) {
  const lines = [];
  lines.push('📋 *Новая заявка с сайта Эклет Инжиниринг*');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const [key, val] of Object.entries(data)) {
    if (!val || key === 'bot-field' || key === 'form-name') continue;
    const label = {
      name:    '👤 Имя',
      phone:   '📞 Телефон',
      email:   '📧 Email',
      message: '💬 Сообщение',
      service: '🔧 Услуга',
      industry:'🏭 Отрасль',
      object:  '🏗 Объект',
    }[key] || key;
    lines.push(`${label}: ${val}`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`🌐 Источник: ${window.location.href}`);
  lines.push(`⏰ ${new Date().toLocaleString('ru-RU', {timeZone:'Asia/Novosibirsk'})}`);

  const text = lines.join('\n');

  // РЕЖИМ ИМИТАЦИИ — если токен не задан
  if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
    console.log('[TG MOCK] Отправка в Telegram:\n', text);
    await new Promise(r => setTimeout(r, 800)); // имитация задержки сети
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

/* ── Универсальный обработчик форм ── */
async function handleEckletForm(e, formEl) {
  e.preventDefault();
  const btn = formEl.querySelector('[type=submit]');
  const successEl = formEl.closest('section')?.querySelector('.form-success');

  // Состояние загрузки
  if (btn) {
    btn.disabled = true;
    btn.dataset.origText = btn.textContent;
    btn.textContent = 'Отправляем…';
  }

  // Собираем данные
  const data = {};
  new FormData(formEl).forEach((val, key) => { data[key] = val.trim(); });

  try {
    const result = await sendToTelegram(data);
    if (result.ok) {
      // Успех
      formEl.style.display = 'none';
      if (successEl) {
        successEl.style.display = 'flex';
      } else {
        // Fallback inline
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
    // Показываем ошибку
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

/* ── CSS для inline success ── */
(function injectFormCSS() {
  const s = document.createElement('style');
  s.textContent = `
    .form-success-inline{
      display:flex;flex-direction:column;align-items:center;
      text-align:center;padding:32px 24px;
      background:var(--surface,#F4F7FA);
      border:1px solid rgba(13,28,46,.08);
      border-radius:2px;margin-top:8px;
    }
    .fsi-icon{
      width:48px;height:48px;border-radius:50%;
      background:var(--accent,#0F2741);color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:22px;margin-bottom:12px;
    }
    .fsi-title{font-size:18px;font-weight:700;color:var(--accent,#0F2741);margin-bottom:6px;}
    .fsi-text{font-size:15px;color:rgba(13,28,46,.6);line-height:1.55;}
    .form-success{
      display:none;flex-direction:column;align-items:center;
      text-align:center;padding:32px 24px;
    }
  `;
  document.head.appendChild(s);
})();

/* ── ACTIVE NAV HIGHLIGHT ── */
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
