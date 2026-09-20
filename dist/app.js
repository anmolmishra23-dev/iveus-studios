(() => {
  'use strict';
  const config = window.IVEUS;
  if (!config) return;
  const $ = (selector) => document.querySelector(selector);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let filteredPhotos = [...config.photos];
  let activePhoto = 0;
  let currentSlide = 0;
  let lastFocus = null;
  let enquiryText = '';
  let scene = null;
  let paused = reduced.matches;
  const gallery = $('#gallery');
  const lightbox = $('#lightbox');
  const menu = $('#mobile-menu');
  const make = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };
  const safeUrl = (url) => {
    try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : ''; } catch { return ''; }
  };
  function openDialog(dialog) {
    lastFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function closeDialog(dialog) { dialog.close(); }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (dialog === menu) $('#menu-toggle').setAttribute('aria-expanded', 'false');
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));
  $('#menu-toggle').addEventListener('click', () => { openDialog(menu); $('#menu-toggle').setAttribute('aria-expanded', 'true'); });
  $('[data-close-menu]').addEventListener('click', () => closeDialog(menu));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeDialog(menu)));
  window.matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches && menu.open) menu.close(); });
  $('#year').textContent = new Date().getFullYear();
  $('#demo-note').hidden = !config.demoMode;
  $('[data-filter="all"] span').textContent = String(config.photos.length).padStart(2, '0');

  function renderGallery() {
    gallery.replaceChildren();
    filteredPhotos.forEach((photo, index) => {
      const card = make('article', `photo-card ${photo.shape || 'tall'}`);
      const button = make('button', 'photo-button');
      button.type = 'button';
      button.setAttribute('aria-label', `Open ${photo.title}`);
      const image = make('img');
      image.src = photo.src; image.alt = photo.alt; image.loading = 'lazy'; image.decoding = 'async';
      image.width = 1000; image.height = photo.shape === 'short' ? 800 : 1250;
      image.style.objectPosition = photo.position || '50% 50%';
      const zoom = make('span', 'photo-open', '↗'); zoom.setAttribute('aria-hidden', 'true');
      const number = make('span', 'photo-index', String(index + 1).padStart(2, '0')); number.setAttribute('aria-hidden', 'true');
      button.append(image, number, zoom); button.addEventListener('click', () => showPhoto(index));
      const caption = make('div', 'photo-caption'); const text = make('div');
      text.append(make('h3', '', photo.title), make('p', '', photo.subtitle));
      caption.append(text, make('span', 'caption-number', `0${index + 1}`));
      card.append(button, caption); gallery.append(card);
    });
    $('#collection-count').textContent = `${filteredPhotos.length} photograph${filteredPhotos.length === 1 ? '' : 's'}`;
  }
  $('#filters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]'); if (!button) return;
    document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
    filteredPhotos = config.photos.filter(photo => button.dataset.filter === 'all' || photo.category === button.dataset.filter);
    renderGallery();
  });
  function updatePhoto() {
    const photo = filteredPhotos[activePhoto];
    $('#lightbox-image').src = photo.src; $('#lightbox-image').alt = photo.alt;
    $('#lightbox-title').textContent = photo.title;
    $('#lightbox-subtitle').textContent = `${photo.subtitle}${config.demoMode ? ' · Sample photograph' : ''}`;
    $('#lightbox-count').textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(filteredPhotos.length).padStart(2, '0')}`;
    const credit = $('#lightbox-credit');
    credit.hidden = !safeUrl(photo.source);
    credit.href = safeUrl(photo.source);
    credit.textContent = `${photo.photographer || 'Photographer'} ↗`;
    $('#photo-prev').hidden = $('#photo-next').hidden = filteredPhotos.length < 2;
  }
  function showPhoto(index) { activePhoto = index; updatePhoto(); openDialog(lightbox); }
  function nextPhoto(delta) { activePhoto = (activePhoto + delta + filteredPhotos.length) % filteredPhotos.length; updatePhoto(); }
  $('#photo-prev').addEventListener('click', () => nextPhoto(-1));
  $('#photo-next').addEventListener('click', () => nextPhoto(1));
  lightbox.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') {event.preventDefault();nextPhoto(-1);} if (event.key === 'ArrowRight') {event.preventDefault();nextPhoto(1);} });
  let touchX = 0;
  $('#lightbox-image').addEventListener('touchstart', event => { touchX = event.changedTouches[0].screenX; }, { passive: true });
  $('#lightbox-image').addEventListener('touchend', event => { const distance = event.changedTouches[0].screenX - touchX; if (Math.abs(distance) > 60) nextPhoto(distance < 0 ? 1 : -1); }, { passive: true });
  renderGallery();

  function setHero(index) {
    currentSlide = index;
    const slide = config.heroSlides[index];
    const image = $('#hero-image');
    image.src = slide.src; image.alt = slide.alt; image.style.objectPosition = slide.position || '50% 50%';
    $('#slide-number').textContent = `${String(index + 1).padStart(2, '0')} / ${String(config.heroSlides.length).padStart(2, '0')}`;
    document.querySelectorAll('[data-slide]').forEach(dot => { const active = Number(dot.dataset.slide) === index; dot.classList.toggle('is-active', active); dot.setAttribute('aria-pressed', String(active)); });
    if (scene) scene.setImage(slide.src, slide.position);
  }
  document.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => setHero(Number(button.dataset.slide))));
  setHero(0);
  async function initScene() {
    if (reduced.matches || scene) return;
    try {
      const module = await import('./scene.js');
      scene = await module.createPhotoScene($('#hero-canvas'), config.heroSlides[currentSlide].src, config.heroSlides[currentSlide].position);
      if (scene) { scene.setPaused(paused); $('#motion-toggle').hidden = false; }
      else $('#motion-toggle').hidden = true;
    } catch { $('#motion-toggle').hidden = true; /* The photograph remains fully visible without WebGL. */ }
  }
  $('#motion-toggle').addEventListener('click', () => {
    paused = !paused;
    $('#motion-toggle').textContent = paused ? 'Resume motion' : 'Pause motion';
    $('#motion-toggle').setAttribute('aria-pressed', String(paused));
    $('#motion-toggle').setAttribute('aria-label', paused ? 'Resume ambient motion' : 'Pause ambient motion');
    if (scene) scene.setPaused(paused);
  });
  reduced.addEventListener('change', event => {
    paused = event.matches;
    if (scene) scene.setPaused(paused);
    else if (!event.matches) initScene();
    $('#motion-toggle').textContent = paused ? 'Resume motion' : 'Pause motion';
    $('#motion-toggle').setAttribute('aria-pressed', String(paused));
    $('#motion-toggle').setAttribute('aria-label', paused ? 'Resume ambient motion' : 'Pause ambient motion');
    if (paused) document.querySelectorAll('.pending').forEach(el => el.classList.remove('pending'));
  });
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('motion-enabled');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending'); observer.observe(el); });
  }
  void initScene();
  window.addEventListener('pagehide', event => { if (scene) { if (event.persisted) scene.setPaused(true); else scene.dispose(); } });
  window.addEventListener('pageshow', event => { if (event.persisted && scene) scene.setPaused(paused); });

  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email) ? config.email : '';
  const phone = /^\d{8,15}$/.test(config.whatsapp) ? config.whatsapp : '';
  function addContact(label, href, external = false) { const a = make('a', '', label); a.href = href; if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } $('#direct-contact').append(a); }
  if (email) addContact(email, `mailto:${email}`);
  if (phone) {
    addContact(config.phoneDisplay || `+${phone}`, `tel:+${phone}`);
    addContact('Chat on WhatsApp ↗', `https://wa.me/${phone}`, true);
  }
  if (safeUrl(config.instagram)) addContact('Follow on Instagram ↗', safeUrl(config.instagram), true);
  const date = new Date(); const localDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  $('input[name="date"]').min = localDate;
  $('#enquiry-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    enquiryText = `Hello ${config.brand},\n\nI’d love to talk about a shoot.\n\nName: ${data.name.trim()}\nEmail: ${data.email.trim()}\nSession: ${data.session}\nDate: ${data.date || 'Flexible / to be decided'}\nLocation: ${data.location.trim() || 'To be decided'}\n\n${data.message.trim() || 'Please share your availability and shoot details.'}`;
    $('#enquiry-summary').textContent = enquiryText;
    $('#enquiry-status').textContent = email || phone ? 'Your enquiry is ready. Choose an option below to open your email or WhatsApp and send it. Nothing has been sent yet.' : 'Your enquiry is ready but has not been sent. This preview has no studio contact connected. You can copy or download your enquiry.';
    $('#enquiry-feedback').textContent = '';
    $('#email-enquiry').hidden = !email;
    $('#email-enquiry').href = email ? `mailto:${email}?subject=${encodeURIComponent(`Shoot enquiry — ${data.name}`)}&body=${encodeURIComponent(enquiryText)}` : '';
    $('#whatsapp-enquiry').hidden = !phone;
    $('#whatsapp-enquiry').href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(enquiryText)}` : '';
    openDialog($('#enquiry-dialog'));
  });
  $('#copy-enquiry').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(enquiryText); $('#enquiry-feedback').textContent = 'Enquiry copied.'; }
    catch { const range = document.createRange(); range.selectNodeContents($('#enquiry-summary')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('#enquiry-feedback').textContent = 'The enquiry is selected. Use your device’s Copy command or download it.'; }
  });
  $('#download-enquiry').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([enquiryText], { type: 'text/plain;charset=utf-8' }));
    const a = make('a'); a.href = url; a.download = 'iveus-studios-enquiry.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#enquiry-feedback').textContent = 'Your enquiry download is ready. It has not been sent to the studio.';
  });
  $('#open-credits').addEventListener('click', () => {
    $('#info-title').textContent = 'The artists behind the images.';
    const content = $('#info-content'); content.replaceChildren();
    content.append(make('p', '', 'These photographs demonstrate the visual direction of this website. They are not presented as Iveus client work. Replace them with your own portfolio before publishing your final site.'));
    const list = make('ul', 'credit-list');
    const sources = config.photoCredits || config.photos;
    const unique = new Set();
    sources.forEach(photo => {
      const url = safeUrl(photo.source || photo.source_url); if (!url || unique.has(url)) return; unique.add(url);
      const li = make('li'); li.append(make('strong', '', photo.title));
      const a = make('a', '', `${photo.photographer} · View on Unsplash ↗`); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a); list.append(li);
    });
    content.append(list); openDialog($('#info-dialog'));
  });
  $('#privacy-open').addEventListener('click', () => {
    $('#info-title').textContent = 'A little privacy.';
    const content = $('#info-content'); content.replaceChildren();
    ['This site does not use analytics, advertising cookies, or browser storage. Your enquiry stays in this page until you choose to copy, download, or share it.', 'Preparing an enquiry does not send it. If contact options are available, opening email or WhatsApp passes the enquiry to that app so you can review and send it. Those services apply their own privacy policies.', 'Images, fonts, and site scripts are served with this website. Your hosting provider may maintain standard access logs. Closing or reloading the page clears the enquiry from this interface.'].forEach(text => content.append(make('p', '', text)));
    openDialog($('#info-dialog'));
  });
})();
