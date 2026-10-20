/* =========================================================
   Mis XV · Luz María
   Editá CONFIG para cambiar hora, datos del regalo, etc.
   ========================================================= */
const CONFIG = {
  name: 'Luz María',
  // Fecha y hora del evento (hora de Argentina, -03:00)
  start: '2026-11-07T18:30:00-03:00',
  durationHours: 6,
  address: 'Mariano Moreno 121, Deán Funes, Córdoba',
  mapsUrl: 'https://maps.app.goo.gl/J4i8ASJ68L4ftbmx7',

  // URL de la "Aplicación web" de Google Apps Script (ver CONFIGURAR-PLANILLA.md).
  // Recibe las confirmaciones (van a la planilla) y las fotos de la fiesta (van a Drive).
  scriptUrl: 'https://script.google.com/macros/s/AKfycbycH_C116NlSpfozdRxBM97L7ev1fSTtJXok3X3-wDapo2qmxDC51xP6Bi0PzFd6oAUuA/exec',

  // Datos para el regalo. Si alias y cvu quedan vacíos, la sección no se muestra.
  gift: {
    entity: 'Mercado Pago',
    alias: 'Luz.M.Molins.mp',
    cvu: '-',
    holder: 'Luz Maria Molins',
  },

  // Ventana en la que se habilita subir fotos (hora de Argentina).
  // Para probarlo antes, abrí la web con ?probar=fotos al final del link.
  photoUpload: {
    from: '2026-11-07T00:00:00-03:00',
    until: '2026-11-09T23:59:59-03:00',
  },

  // Galería en mosaico: el ORDEN define el lugar de cada foto (son exactamente 8):
  // 1 grande · 2 vertical · 3-6 chicas · 7 vertical · 8 grande
  photos: [
    { id: '1564', alt: 'Luz María con sombrero bajo un cielo nublado' },        // grande
    { id: '1574', alt: 'Luz María a caballo en el campo, con un potrillo' },    // vertical
    { id: '1570', alt: 'Luz María montando a caballo' },                        // chica
    { id: '1595', alt: 'Luz María junto a su caballo' },                        // chica
    { id: '1608', alt: 'Luz María con su caballo y un potrillo' },              // chica
    { id: '1598', alt: 'Luz María acariciando la cara del caballo' },           // chica
    { id: '1580', alt: 'Luz María sentada sobre el caballo' },                  // vertical
    { id: '1645', alt: 'Retrato de Luz María con sombrero entre naranjos' },    // grande
  ],
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const eventStart = new Date(CONFIG.start);
const eventEnd = new Date(eventStart.getTime() + CONFIG.durationHours * 3600e3);

/* ---------- Invitado personalizado: ?para=Familia%20Pérez ---------- */
const guest = (new URLSearchParams(location.search).get('para') || '').trim().slice(0, 60);
if (guest) {
  const g = $('#envelope-guest');
  g.textContent = `Para ${guest}`;
  g.hidden = false;
  $('#guest-line').innerHTML =
    `<strong>${escapeHTML(guest)}</strong>, quiero que estés conmigo en una de las noches más especiales de mi vida: <strong>mis 15 años</strong>.`;
}

/* ---------- Sobre de apertura ---------- */
const envelope = $('#envelope');
document.body.classList.add('locked');
$('#open-invite').addEventListener('click', () => {
  envelope.classList.add('is-open');
  document.body.classList.remove('locked');
  burstConfetti();
  setTimeout(() => {
    envelope.classList.add('is-gone');
    $('#contenido').setAttribute('tabindex', '-1');
  }, reduceMotion ? 0 : 1100);
});

/* ---------- Cuenta regresiva ---------- */
const units = Object.fromEntries($$('.timer__num').map((el) => [el.dataset.unit, el]));
let timerId;
function updateTimer() {
  const diff = eventStart - Date.now();
  if (diff <= 0) {
    Object.values(units).forEach((el) => (el.textContent = '00'));
    $('#timer-done').hidden = false;
    clearInterval(timerId);
    if (diff > -CONFIG.durationHours * 3600e3 && !updateTimer.celebrated) {
      updateTimer.celebrated = true;
      burstConfetti();
    }
    return;
  }
  const s = Math.floor(diff / 1000);
  const vals = {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
  for (const [k, v] of Object.entries(vals)) {
    const txt = String(v).padStart(2, '0');
    const el = units[k];
    if (el.textContent !== txt) {
      el.textContent = txt;
      if (!reduceMotion) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
    }
  }
}
updateTimer();
timerId = setInterval(updateTimer, 1000);

$('#event-time').textContent =
  eventStart.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Cordoba' }) + ' h';

/* ---------- Agendar ---------- */
const toICSDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const title = `Mis XV · ${CONFIG.name}`;
const details = `¡Te espero para celebrar mis 15 años!\n${CONFIG.mapsUrl}`;

$('#gcal').href = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
  action: 'TEMPLATE',
  text: title,
  dates: `${toICSDate(eventStart)}/${toICSDate(eventEnd)}`,
  details,
  location: CONFIG.address,
});

$('#ics').addEventListener('click', () => {
  const esc = (t) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => '\\' + m);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//XV Luz Maria//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:xv-luz-maria-${toICSDate(eventStart)}@invitacion`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(eventStart)}`,
    `DTEND:${toICSDate(eventEnd)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(details)}`,
    `LOCATION:${esc(CONFIG.address)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc('Mañana son los XV de ' + CONFIG.name)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'XV-Luz-Maria.ics' });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Evento descargado');
});

/* ---------- Ubicación / compartir ---------- */
$('#share-location').addEventListener('click', () =>
  share({
    title: `Ubicación · ${title}`,
    text: `XV de ${CONFIG.name} — ${CONFIG.address}`,
    url: CONFIG.mapsUrl,
  }),
);
$('#copy-address').addEventListener('click', () => copy(CONFIG.address, 'Dirección copiada'));

async function share(data) {
  if (navigator.share) {
    try { await navigator.share(data); } catch { /* el usuario canceló */ }
    return;
  }
  // Escritorio sin Web Share: abrimos WhatsApp Web con el texto
  const text = `${data.text}\n${data.url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

async function copy(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = Object.assign(document.createElement('textarea'), { value: text });
    t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
  }
  toast(msg);
}

/* ---------- Envío a Google Apps Script ---------- */
async function sendToScript(data) {
  if (!CONFIG.scriptUrl) throw new Error('no-config');
  // x-www-form-urlencoded es una petición "simple": no dispara preflight CORS
  const res = await fetch(CONFIG.scriptUrl, { method: 'POST', body: new URLSearchParams(data) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.error || 'server');
  return json;
}
const errorText = (err) =>
  err.message === 'no-config'
    ? 'Todavía no está configurada la planilla (falta scriptUrl en js/main.js).'
    : err.message === 'cerrado'
      ? 'La carga de fotos no está habilitada en este momento.'
      : 'No se pudo enviar. Revisá tu conexión e intentá de nuevo.';

/* ---------- Confirmar asistencia (va a la planilla) ---------- */
const form = $('#rsvp-form');
const personas = $('#f-personas');
const RSVP_KEY = 'xv-luz-rsvp';

form.addEventListener('change', (e) => {
  if (e.target.name === 'asiste') $('#field-personas').hidden = e.target.value === 'No';
});
$$('.stepper__btn').forEach((b) =>
  b.addEventListener('click', () => {
    personas.value = Math.min(10, Math.max(1, (+personas.value || 1) + +b.dataset.step));
  }),
);

const rules = {
  nombre: (v) => (v.length >= 2 ? '' : 'Escribí tu nombre.'),
  apellido: (v) => (v.length >= 2 ? '' : 'Escribí tu apellido.'),
  telefono: (v) => (v.replace(/\D/g, '').length >= 8 ? '' : 'Escribí un teléfono válido (con característica).'),
};
const errId = { nombre: 'e-nombre', apellido: 'e-apellido', telefono: 'e-tel' };
function validateField(input) {
  const msg = rules[input.name]?.(input.value.trim()) ?? '';
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  $('#' + errId[input.name]).textContent = msg;
  return !msg;
}
Object.keys(rules).forEach((n) => {
  const input = form.elements[n];
  input.addEventListener('blur', () => input.value && validateField(input));
  input.addEventListener('input', () => input.getAttribute('aria-invalid') === 'true' && validateField(input));
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const invalid = Object.keys(rules).map((n) => form.elements[n]).filter((i) => !validateField(i));
  if (invalid.length) { invalid[0].focus(); return; }

  const fd = new FormData(form);
  const data = {
    type: 'rsvp',
    nombre: fd.get('nombre').trim(),
    apellido: fd.get('apellido').trim(),
    telefono: fd.get('telefono').trim(),
    asiste: fd.get('asiste'),
    personas: fd.get('asiste') === 'No' ? '0' : String(Math.min(10, Math.max(1, +fd.get('personas') || 1))),
    mensaje: fd.get('mensaje').trim(),
    invitacion: guest,
  };
  const btn = $('#rsvp-submit');
  const status = $('#rsvp-status');
  status.textContent = '';
  btn.classList.add('is-loading');
  btn.disabled = true;
  $('.btn__text', btn).textContent = 'Enviando…';
  try {
    await sendToScript(data);
    try { localStorage.setItem(RSVP_KEY, JSON.stringify({ nombre: data.nombre, asiste: data.asiste })); } catch {}
    showRsvpDone(data.nombre, data.asiste, true);
    if (!$('#f-autor').value) $('#f-autor').value = `${data.nombre} ${data.apellido}`;
  } catch (err) {
    status.textContent = errorText(err);
  } finally {
    btn.classList.remove('is-loading');
    btn.disabled = false;
    $('.btn__text', btn).textContent = 'Enviar confirmación';
  }
});

function showRsvpDone(nombre, asiste, celebrate) {
  form.hidden = true;
  const done = $('#rsvp-done');
  done.hidden = false;
  $('#rsvp-done-title').textContent = `¡Gracias, ${nombre}!`;
  $('#rsvp-done-text').textContent = asiste === 'No'
    ? 'Qué pena que no puedas venir. ¡Gracias por avisarme!'
    : 'Ya tengo tu confirmación. ¡Te espero!';
  if (celebrate) { done.focus(); if (asiste !== 'No') burstConfetti(); }
}
$('#rsvp-again').addEventListener('click', () => {
  form.reset();
  $('#field-personas').hidden = false;
  $('#rsvp-done').hidden = true;
  form.hidden = false;
  form.elements.nombre.focus();
});
try {
  const saved = JSON.parse(localStorage.getItem(RSVP_KEY) || 'null');
  if (saved?.nombre) showRsvpDone(saved.nombre, saved.asiste, false);
} catch {}

/* ---------- Regalo ---------- */
const giftRows = [
  ['Alias', CONFIG.gift.alias, true],
  ['CVU', CONFIG.gift.cvu, true],
  ['Titular', CONFIG.gift.holder, false],
  ['Entidad', CONFIG.gift.entity, false],
].filter(([, v]) => v);
const isLocal = location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname);
if (!CONFIG.gift.alias && !CONFIG.gift.cvu) {
  if (isLocal) $('#gift-card').innerHTML = '<div>Completá alias/CVU en <code>CONFIG.gift</code> (js/main.js). Esta nota solo se ve en tu compu; publicada, la sección se oculta hasta que la completes.</div>';
  else $('#regalo').hidden = true;
} else {
  $('#gift-card').innerHTML = giftRows.map(([label, value, copyable]) => `
    <div class="gift__row">
      <dt>${label}</dt><dd>${escapeHTML(value)}</dd>
      ${copyable ? `<button class="copy-btn" type="button" data-copy="${escapeHTML(value)}" aria-label="Copiar ${label}">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>Copiar</button>` : ''}
    </div>`).join('');
  $('#gift-card').addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (b) copy(b.dataset.copy, `${b.getAttribute('aria-label').replace('Copiar ', '')} copiado`);
  });
}

/* ---------- Fotos de la fiesta ---------- */
const upFrom = new Date(CONFIG.photoUpload.from);
const upUntil = new Date(CONFIG.photoUpload.until);
const forceUpload = new URLSearchParams(location.search).get('probar') === 'fotos';
const fmtDay = (d) => d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Argentina/Cordoba' });
$('#party-open-date').textContent = `el ${fmtDay(upFrom)}`;

function updatePartyState() {
  const now = Date.now();
  const open = forceUpload || (now >= upFrom && now <= upUntil);
  $('#party-open').hidden = !open;
  $('#party-locked').hidden = open;
  if (now > upUntil && !forceUpload) {
    $('#party-locked p').textContent = '¡Gracias a todos por compartir sus fotos! La carga ya está cerrada.';
  }
  if (open) renderQR();
}
updatePartyState();
setInterval(updatePartyState, 60e3);

function renderQR() {
  if (renderQR.done) return;
  renderQR.done = true;
  const target = location.origin + location.pathname + '#subir';
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
  s.onload = () => {
    const qr = window.qrcode(0, 'M');
    qr.addData(target);
    qr.make();
    $('#qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  };
  document.head.append(s);
}

try { $('#f-autor').value = JSON.parse(localStorage.getItem(RSVP_KEY) || 'null')?.nombre || ''; } catch {}

$('#f-fotos').addEventListener('change', async (e) => {
  const files = [...e.target.files].filter((f) => f.type.startsWith('image/'));
  e.target.value = '';
  const list = $('#uploads');
  const items = files.map((file) => {
    const li = document.createElement('li');
    li.className = 'upload';
    const url = URL.createObjectURL(file);
    li.innerHTML = `<img src="${url}" alt=""><span class="upload__state">En espera</span>`;
    list.prepend(li);
    return { file, li };
  });
  // De a una para no saturar el celular ni la conexión
  for (const { file, li } of items) {
    const state = $('.upload__state', li);
    try {
      state.textContent = 'Preparando…';
      const { base64, mime } = await compressImage(file);
      state.textContent = 'Subiendo…';
      await sendToScript({ type: 'photo', autor: $('#f-autor').value.trim(), mime, data: base64 });
      li.classList.add('is-done');
      state.textContent = 'Subida ✓';
    } catch (err) {
      li.classList.add('is-error');
      state.textContent = 'Error';
      toast(errorText(err));
    }
  }
  const ok = items.filter((i) => i.li.classList.contains('is-done')).length;
  if (ok) toast(ok === 1 ? '¡Foto subida! Gracias' : `¡${ok} fotos subidas! Gracias`);
});

// Achica la foto a ~2000px en JPEG antes de subirla (más rápido y liviano)
async function compressImage(file, max = 2000, quality = 0.85) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  if (!bmp) return { base64: await toBase64(file), mime: file.type };
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
  return { base64: await toBase64(blob), mime: 'image/jpeg' };
}
function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/* ---------- Galería + visor ---------- */
const gallery = $('#gallery');
gallery.innerHTML = CONFIG.photos.map((p, i) => `
  <li class="reveal">
    <button class="gallery__item" type="button" data-index="${i}" aria-label="Ver foto ${i + 1}: ${p.alt}">
      <img src="img/luz-${p.id}-sm.webp" alt="${p.alt}" width="640" height="960" loading="lazy" decoding="async">
    </button>
  </li>`).join('');

const lb = $('#lightbox');
const lbImg = $('#lightbox-img');
let current = 0;
let lastTrigger = null;

function showPhoto(i) {
  current = (i + CONFIG.photos.length) % CONFIG.photos.length;
  const p = CONFIG.photos[current];
  lbImg.src = `img/luz-${p.id}.webp`;
  lbImg.alt = p.alt;
  $('#lightbox-count').textContent = `${current + 1} / ${CONFIG.photos.length}`;
  if (!reduceMotion) { lbImg.classList.remove('swap'); void lbImg.offsetWidth; lbImg.classList.add('swap'); }
  // precarga la siguiente
  new Image().src = `img/luz-${CONFIG.photos[(current + 1) % CONFIG.photos.length].id}.webp`;
}
gallery.addEventListener('click', (e) => {
  const btn = e.target.closest('.gallery__item');
  if (!btn) return;
  lastTrigger = btn;
  showPhoto(+btn.dataset.index);
  lb.showModal();
});
$('#lb-close').addEventListener('click', () => lb.close());
$('#lb-prev').addEventListener('click', () => showPhoto(current - 1));
$('#lb-next').addEventListener('click', () => showPhoto(current + 1));
lb.addEventListener('close', () => lastTrigger?.focus());
let swiped = false;
lb.addEventListener('click', (e) => {
  if (swiped) { swiped = false; return; }
  if (e.target === lb) lb.close();
});
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});
// Deslizar con el dedo
let startX = null;
lb.addEventListener('pointerdown', (e) => { startX = e.clientX; });
lb.addEventListener('pointerup', (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  swiped = Math.abs(dx) > 50;
  if (swiped) showPhoto(current + (dx < 0 ? 1 : -1));
  startX = null;
});

/* ---------- Aparición al hacer scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el, i) => {
  el.style.transitionDelay = el.closest('.gallery__grid') ? `${(i % 4) * 60}ms` : '';
  io.observe(el);
});

/* ---------- Dock: mostrar tras el hero y marcar sección activa ---------- */
const dock = $('.dock');
const hero = $('#inicio');
dock.classList.add('is-hidden');
new IntersectionObserver(([en]) => dock.classList.toggle('is-hidden', en.intersectionRatio > 0.35), {
  threshold: [0, 0.35, 1],
}).observe(hero);

const links = $$('.dock__item');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((l) => {
      const on = l.getAttribute('href') === `#${en.target.id}`;
      l.classList.toggle('is-active', on);
      on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['inicio', 'cuenta', 'lugar', 'fotos', 'confirmar'].forEach((id) => sectionObs.observe(document.getElementById(id)));

// Easter egg: tocar la firma tira confeti
$('.signature').addEventListener('click', burstConfetti);

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ---------- Confeti ---------- */
function burstConfetti() {
  if (reduceMotion) return;
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = (canvas.width = innerWidth * dpr);
  const H = (canvas.height = innerHeight * dpr);
  const colors = ['#B9844F', '#C89B8C', '#E7D8C6', '#5E6B3A', '#8A5A2E', '#F3EADF'];
  const pieces = Array.from({ length: innerWidth < 600 ? 110 : 180 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.3,
    y: H * 0.55,
    vx: (Math.random() - 0.5) * 22 * dpr,
    vy: (-Math.random() * 22 - 10) * dpr,
    w: (6 + Math.random() * 6) * dpr,
    h: (8 + Math.random() * 10) * dpr,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0],
    round: Math.random() < 0.3,
  }));
  const t0 = performance.now();
  (function frame(t) {
    const elapsed = t - t0;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, elapsed - 2600) / 900);
    for (const p of pieces) {
      p.vy += 0.55 * dpr; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      ctx.restore();
    }
    if (elapsed < 3500) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  })(t0);
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
