// -----------------------------
// Utilities
// -----------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const trapFocus = (container) => {
  const focusables = $$('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])', container)
    .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  if (!focusables.length) return () => {};
  const first = focusables[0], last = focusables[focusables.length - 1];
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
};
const noScroll = (on) => document.body.style.overflow = on ? 'hidden' : '';

// -----------------------------
// Header shadow + year
// -----------------------------
const header = $('.site-header');
const year = $('#year');
if (year) year.textContent = new Date().getFullYear();

const onScroll = () => header?.setAttribute('data-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// -----------------------------
// Mobile nav
// -----------------------------
const toggle = $('.nav-toggle');
const menu = $('.nav-menu');
toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
menu?.addEventListener('click', (e) => {
  if (e.target.closest('a')) { menu.classList.remove('open'); toggle?.setAttribute('aria-expanded','false'); }
});

// Highlight active nav link
$$('.nav-menu a').forEach(a => {
  const here = location.pathname.split('/').pop() || 'index.html';
  const target = a.getAttribute('href');
  if (target === here) a.setAttribute('aria-current', 'page');
});

// -----------------------------
// Reveal-on-scroll (respect reduced motion)
// -----------------------------
const enableReveal = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (enableReveal) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
  }, { threshold: 0.18 });
  $$('[data-animate]').forEach(el => observer.observe(el));
} else {
  $$('[data-animate]').forEach(el => el.classList.add('visible'));
}

// -----------------------------
// Lightbox (gallery)
// -----------------------------
const gallery = $('.lightbox');
let removeTrap = () => {};
if (gallery){
  const closeLB = () => { $('.lb-backdrop')?.remove(); noScroll(false); removeTrap(); };
  gallery.addEventListener('click', e=>{
    const img = e.target.closest('img');
    if (!img) return;
    const full = img.getAttribute('data-full') || img.src;
    const backdrop = document.createElement('div');
    backdrop.className = 'lb-backdrop';
    backdrop.innerHTML = `<img class="lb-image" alt="${img.alt || ''}">`;
    document.body.appendChild(backdrop);
    const big = $('.lb-image', backdrop);
    big.src = full;
    noScroll(true);
    removeTrap = trapFocus(backdrop);
    big.tabIndex = 0;
    big.focus();

    const onKey = (ev) => { if (ev.key === 'Escape') closeLB(); };
    window.addEventListener('keydown', onKey, { once: true });
    backdrop.addEventListener('click', closeLB);
  });
}

// -----------------------------
// Reviews (static sample; replace with live feed later)
// -----------------------------
const reviews = [
  { q:'“The dessert jars vanished in 10 minutes. Gorgeous setup and right on time.”', who:'— Sarah, baby shower' },
  { q:'“Perfect mix of classic and new. They handled our nut-free request easily.”', who:'— Marcus, corporate event' },
  { q:'“That passion fruit jar… unreal. We’re booking again for the holidays.”', who:'— Alicia, family party' },
];
const rg = $('#reviewsGrid');
if (rg){
  rg.innerHTML = reviews.map(r => `
    <figure class="review" data-animate>
      <blockquote>${r.q}</blockquote>
      <figcaption>${r.who}</figcaption>
    </figure>`).join('');
  // apply reveal to injected items
  $$('[data-animate]', rg).forEach(el => el.classList.add('visible'));
}

// -----------------------------
// Forms (FormSubmit-friendly, no redirect)
// -----------------------------
const enhanceForm = (form) => {
  if(!form || form.dataset.enhanced) return;
  form.dataset.enhanced = '1';
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    try{
      const res = await fetch(form.action, { method:'POST', body:data });
      if (res.ok){
        alert('Thanks! We’ll reply within 24 hours.');
        form.reset();
      } else {
        alert('Sorry—something went wrong. Please email escribanoian7@gmail.com or call (605) 350-6478.');
      }
    }catch{
      alert('Network error. Try again or email escribanoian7@gmail.com.');
    }
  });
};
enhanceForm($('#contactForm'));
enhanceForm($('#requestForm'));

// -----------------------------
// Shop filters
// -----------------------------
const chips = $$('.filters .chip');
const grid = $('#productGrid');
chips.forEach(chip=>{
  chip.addEventListener('click', ()=>{
    chips.forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    grid?.querySelectorAll('.product').forEach(card=>{
      card.style.display = (f==='all' || card.dataset.cat.includes(f)) ? '' : 'none';
    });
  });
});

// -----------------------------
// Request modal
// -----------------------------
const reqModal = $('#requestModal');
const reqItem = $('#reqItem');
let removeTrapModal = () => {};

const openModal = () => {
  reqModal?.showModal();
  noScroll(true);
  removeTrapModal = trapFocus(reqModal);
  // focus first input if present
  reqModal?.querySelector('input, textarea, button')?.focus();
};
const closeModal = () => { reqModal?.close(); noScroll(false); removeTrapModal(); };

$$('.request-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if (reqItem) reqItem.value = btn.dataset.name || '';
    openModal();
  });
});
reqModal?.querySelector('.close')?.addEventListener('click', closeModal);
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && reqModal?.open) closeModal(); });

// Open modal via #request on load or when hash changes
const checkHash = () => { if (location.hash === '#request') openModal(); };
checkHash();
window.addEventListener('hashchange', checkHash);
