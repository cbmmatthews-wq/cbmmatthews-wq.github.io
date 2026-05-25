// =============================================================================
// nike-strip.js — horizontal auto-advancing image slideshow with lightbox
// Required HTML (anywhere on the page):
//   <div class="strip-container">
//     <div class="strip-track" id="track"></div>
//     <button class="strip-arrow prev" id="stripPrev">‹</button>
//     <button class="strip-arrow next" id="stripNext">›</button>
//   </div>
//   <div class="strip-controls">
//     <div>34 images · auto-advances every <span id="speedLabel">2.0s</span></div>
//     <button id="pauseBtn">Pause</button>
//   </div>
//   <div class="lightbox" id="lightbox" aria-hidden="true">
//     <button class="close" id="lbClose">×</button>
//     <button class="nav prev" id="lbPrev">‹</button>
//     <button class="nav next" id="lbNext">›</button>
//     <img id="lbImg" src="" alt="">
//     <div class="meta" id="lbMeta"></div>
//   </div>
// Exits silently if no #track element is present, so this is safe to include
// on any page.
// =============================================================================

(function() {
  const track = document.getElementById('track');
  if (!track) return; // Page doesn't have a strip — nothing to do.

  // ---- CONFIG -----------------------------------------------------------------
  const BASE_URL = 'assets/images/nike/';   // relative — works locally and on Pages
  const STRIP_HEIGHT = 220;                  // matches .strip-container height in CSS
  const GAP = 14;                            // matches .strip-track gap
  const SLIDE_INTERVAL_MS = 2000;            // auto-advance cadence
  const SLIDE_DURATION_MS = 700;             // easing animation length
  const PAUSE_ON_HOVER = true;

  // All 34 images, in numeric order. The leading digit maps to a campaign.
  const images = [
    "10.jpg","11.png","12.png","13.jpg","14.jpg","15.jpg","16.png","17.jpg","18.png",
    "20.png","21.png","23.png","24.png","25.png","26.png",
    "30.png","31.png","32.png","33.jpg","34.png",
    "41.png","42.png","43.png",
    "50.jpg","51.jpg","55.jpg","56.jpg","57.jpg","59.jpg",
    "60.png","62.jpg","63.jpg","64.jpg","65.jpg"
  ];

  // Filename-prefix → campaign metadata (used in the lightbox caption)
  const campaignByPrefix = {
    '1': { name: "Find Your Greatness", year: "2012" },
    '2': { name: "Dream Crazy / Dream Crazier", year: "2018 & 2019" },
    '3': { name: "You Can't Stop Us", year: "2020" },
    '4': { name: "Play New", year: "2021" },
    '5': { name: "Better For It", year: "2015" },
    '6': { name: "Why Do It?", year: "recent" }
  };
  function getCampaign(filename) {
    return campaignByPrefix[filename[0]] || { name: "Nike", year: "" };
  }

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
  let metas = [];          // images with measured aspect ratios
  let widths = [];         // pixel width of each figure at strip height
  let totalSetWidth = 0;   // width of one full copy (incl. gaps)
  let currentIndex = 0;    // which image is leftmost in view
  let offset = 0;          // current translateX (negative as we scroll left)
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

    // Append TWO copies of every image so the marquee loops seamlessly:
    // when the first copy scrolls off the left, we silently reset to position 0
    // and the second copy is already in view at the same spot.
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
    // If we're at the very start, jump to the end of the first copy (no
    // animation) so the back-step animates into the previous image.
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
  // Clicking either arrow pauses auto-scroll and steps manually, so the user
  // can browse at their own pace without auto-advance racing ahead.
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
    const c = getCampaign(m.filename);
    lbImg.src = m.src;
    lbImg.alt = `${c.name} — ${m.filename}`;
    lbMeta.innerHTML = `${c.name} <em style="color: rgba(245,240,232,0.55); margin-left:0.5rem;">${c.year ? '(' + c.year + ')' : ''} · ${lbIndex + 1} / ${metas.length}</em>`;
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
