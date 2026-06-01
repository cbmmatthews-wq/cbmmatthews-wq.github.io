// =============================================================================
// gucci-alpine-strip.js — horizontal auto-advancing image slideshow + lightbox
// Adapted from nike-strip.js for the single Gucci/Alpine F1 announcement carousel.
// Differences from nike-strip.js:
//   - Slides 1.png through 9.png from assets/images/alpine/
//   - 400px strip height (overridden in the page's inline CSS)
//   - Single-campaign metadata (no per-image prefix lookup)
// Required HTML (anywhere on the page):
//   <div class="strip-container">
//     <div class="strip-track" id="track"></div>
//     <button class="strip-arrow prev" id="stripPrev">‹</button>
//     <button class="strip-arrow next" id="stripNext">›</button>
//   </div>
//   <div class="strip-controls">
//     <div>9 images · auto-advances every <span id="speedLabel">3.0s</span></div>
//     <button id="pauseBtn">Pause</button>
//   </div>
//   <div class="lightbox" id="lightbox" aria-hidden="true">
//     <button class="close" id="lbClose">×</button>
//     <button class="nav prev" id="lbPrev">‹</button>
//     <button class="nav next" id="lbNext">›</button>
//     <img id="lbImg" src="" alt="">
//     <div class="meta" id="lbMeta"></div>
//   </div>
// Exits silently if no #track element is present, so safe to include on any page.
// =============================================================================

(function() {
  const track = document.getElementById('track');
  if (!track) return; // Page doesn't have a strip — nothing to do.

  // ---- CONFIG ----------------------------------------------------------------
  const BASE_URL         = 'assets/images/alpine/';   // relative — works locally and on Pages
  const STRIP_HEIGHT     = 400;                        // matches the 400px override in the page CSS
  const GAP              = 14;                         // matches .strip-track gap
  const SLIDE_INTERVAL_MS = 3000;                      // slightly slower than Nike strip (larger images)
  const SLIDE_DURATION_MS = 700;
  const PAUSE_ON_HOVER    = true;

  // Nine carousel slides from the announcement post, in published order.
  const images = ["1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png"];

  // One campaign — used for the lightbox caption.
  const CAMPAIGN = {
    name: "Gucci Racing Alpine Formula One Team",
    year: "Announced May 27, 2026 · Live 2027"
  };

  // ---- Preload to learn natural aspect ratios --------------------------------
  function loadMeta(filename) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => resolve({ filename, src: BASE_URL + filename, ratio: img.naturalWidth / img.naturalHeight, ok: true });
      img.onerror = () => resolve({ filename, src: BASE_URL + filename, ratio: 1.5, ok: false });
      img.src = BASE_URL + filename;
    });
  }

  // ---- State -----------------------------------------------------------------
  let metas = [];
  let widths = [];
  let totalSetWidth = 0;
  let currentIndex = 0;
  let offset = 0;
  let timer = null;
  let isPaused = false;

  function buildFigure(meta, indexInList) {
    const fig = document.createElement('figure');
    fig.style.width = (STRIP_HEIGHT * meta.ratio) + 'px';
    fig.dataset.index = indexInList;
    fig.dataset.src = meta.src;
    fig.dataset.filename = meta.filename;

    const img = document.createElement('img');
    img.src = meta.src;
    img.alt = meta.filename;
    img.loading = 'lazy';
    fig.appendChild(img);

    fig.addEventListener('click', () => openLightbox(indexInList));
    return fig;
  }

  async function buildStrip() {
    metas = await Promise.all(images.map(loadMeta));
    widths = metas.map(m => STRIP_HEIGHT * m.ratio);
    totalSetWidth = widths.reduce((a, b) => a + b, 0) + widths.length * GAP;

    // Two copies so the marquee loops seamlessly.
    metas.forEach((m, i) => track.appendChild(buildFigure(m, i)));
    metas.forEach((m, i) => track.appendChild(buildFigure(m, i)));

    startScrolling();
  }

  // ---- Stepping & auto-scroll ------------------------------------------------
  function stepForward() {
    const w = widths[currentIndex] + GAP;
    offset -= w;
    track.style.transition = `transform ${SLIDE_DURATION_MS}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
    track.style.transform  = `translateX(${offset}px)`;

    currentIndex++;
    if (currentIndex >= metas.length) {
      setTimeout(() => {
        track.style.transition = 'none';
        offset = 0;
        currentIndex = 0;
        track.style.transform = 'translateX(0px)';
        void track.offsetWidth;
      }, SLIDE_DURATION_MS + 20);
    }
  }

  function stepBackward() {
    if (currentIndex === 0) {
      track.style.transition = 'none';
      offset = -totalSetWidth;
      currentIndex = metas.length;
      track.style.transform = `translateX(${offset}px)`;
      void track.offsetWidth;
    }
    currentIndex--;
    const w = widths[currentIndex] + GAP;
    offset += w;
    track.style.transition = `transform ${SLIDE_DURATION_MS}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
    track.style.transform  = `translateX(${offset}px)`;
  }

  function advance() { if (!isPaused) stepForward(); }
  function startScrolling() { clearInterval(timer); timer = setInterval(advance, SLIDE_INTERVAL_MS); }
  function stopScrolling()  { clearInterval(timer); }

  // ---- Pause/play button -----------------------------------------------------
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? 'Play' : 'Pause';
      if (isPaused) stopScrolling();
      else startScrolling();
    });
  }

  // ---- Strip arrows ----------------------------------------------------------
  function manualStep(direction) {
    if (!isPaused) {
      isPaused = true;
      if (pauseBtn) pauseBtn.textContent = 'Play';
      stopScrolling();
    }
    if (direction === 'next') stepForward();
    else stepBackward();
  }
  const nextBtn = document.getElementById('stripNext');
  const prevBtn = document.getElementById('stripPrev');
  if (nextBtn) nextBtn.addEventListener('click', () => manualStep('next'));
  if (prevBtn) prevBtn.addEventListener('click', () => manualStep('prev'));

  // ---- Pause on hover --------------------------------------------------------
  if (PAUSE_ON_HOVER) {
    const stripContainer = document.querySelector('.strip-container');
    if (stripContainer) {
      stripContainer.addEventListener('mouseenter', () => { if (!isPaused) stopScrolling(); });
      stripContainer.addEventListener('mouseleave', () => { if (!isPaused) startScrolling(); });
    }
  }

  // ---- Lightbox --------------------------------------------------------------
  const lb     = document.getElementById('lightbox');
  const lbImg  = document.getElementById('lbImg');
  const lbMeta = document.getElementById('lbMeta');
  let lbIndex = 0;

  function openLightbox(i) {
    if (!lb) return;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    stopScrolling();
    showLightbox(i);
  }
  function showLightbox(i) {
    lbIndex = (i + metas.length) % metas.length;
    const m = metas[lbIndex];
    lbImg.src = m.src;
    lbImg.alt = `${CAMPAIGN.name} — slide ${lbIndex + 1}`;
    lbMeta.innerHTML = `${CAMPAIGN.name} <em style="color: rgba(245,240,232,0.55); margin-left:0.5rem;">${CAMPAIGN.year} · ${lbIndex + 1} / ${metas.length}</em>`;
  }
  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (!isPaused) startScrolling();
  }

  if (lb) {
    document.getElementById('lbClose').addEventListener('click', closeLightbox);
    document.getElementById('lbPrev').addEventListener('click', e => { e.stopPropagation(); showLightbox(lbIndex - 1); });
    document.getElementById('lbNext').addEventListener('click', e => { e.stopPropagation(); showLightbox(lbIndex + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
      else if (e.key === 'ArrowLeft')  showLightbox(lbIndex - 1);
    });
  }

  // ---- Go --------------------------------------------------------------------
  buildStrip();
})();
