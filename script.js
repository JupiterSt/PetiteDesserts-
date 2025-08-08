// Sticky header shadow & year
const header = document.querySelector('.site-header');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const onScroll = () => header?.setAttribute('data-scrolled', window.scrollY > 8);
onScroll(); window.addEventListener('scroll', onScroll);

// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

// Reveal on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
},{ threshold:.18 });
document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

// Lightbox for gallery
const gallery = document.querySelector('.lightbox');
if (gallery){
  gallery.addEventListener('click', e=>{
    const img = e.target.closest('img');
    if (!img) return;
    const full = img.getAttribute('data-full') || img.src;
    const backdrop = document.createElement('div');
    backdrop.className = 'lb-backdrop';
    const big = document.createElement('img');
    big.className = 'lb-image';
    big.alt = img.alt || '';
    big.src = full;
    backdrop.appendChild(big);
    backdrop.addEventListener('click', ()=> backdrop.remove());
    document.body.appendChild(backdrop);
  });
}

// Reviews data (replace with live feed later)
const reviews = [
  { q:'“The dessert jars vanished in 10 minutes. Gorgeous setup and right on time.”', who:'— Sarah, baby shower' },
  { q:'“Perfect mix of classic and new. They handled our nut-free request easily.”', who:'— Marcus, corporate event' },
  { q:'“That passion fruit jar… unreal. We’re booking again for the holidays.”', who:'— Alicia, family party' },
];
const rg = document.getElementById('reviewsGrid');
if (rg){
  rg.innerHTML = reviews.map(r => `
    <figure class="review" data-animate>
      <blockquote>${r.q}</blockquote>
      <figcaption>${r.who}</figcaption>
    </figure>`).join('');
  rg.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// Enhance forms (works with FormSubmit without redirect)
const enhanceForm = form => {
  if(!form || form.getAttribute('data-enhanced')) return;
  form.setAttribute('data-enhanced','1');
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
    }catch(err){
      alert('Network error. Try again or email escribanoian7@gmail.com.');
    }
  });
};
enhanceForm(document.getElementById('contactForm'));
enhanceForm(document.getElementById('requestForm'));

// Shop filters
const chips = document.querySelectorAll('.filters .chip');
const grid = document.getElementById('productGrid');
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

// Request modal controls
const reqModal = document.getElementById('requestModal');
const reqItem = document.getElementById('reqItem');
document.querySelectorAll('.request-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if (reqItem) reqItem.value = btn.dataset.name || '';
    reqModal?.showModal();
  });
});
reqModal?.querySelector('.close')?.addEventListener('click', ()=> reqModal.close());

// Open modal via #request
if (location.hash === '#request') {
  reqModal?.showModal();
}
