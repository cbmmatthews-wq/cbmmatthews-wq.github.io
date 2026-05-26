// =============================================================================
// quote-slider.js — text-quote slideshow with prev/next arrows, dots, counter.
// Auto-rotates every 3 seconds. Pauses on hover. Manual nav (arrows/dots/keys)
// resets the timer so the next auto-advance happens 3s after the manual step,
// not immediately.
//
// Required HTML (anywhere on the page):
//   <div class="quote-slider">
//     <div class="quote-slider-label">Voices on the Question</div>
//     <div class="quote-slider-track">
//       <div class="quote-slide active">
//         <div class="quote-slide-text">…</div>
//         <div class="quote-slide-attr">…</div>
//       </div>
//       <div class="quote-slide">…</div>
//       <!-- as many as needed -->
//     </div>
//     <div class="quote-slider-controls">
//       <div class="quote-slider-dots"></div>
//       <div class="quote-slider-nav">
//         <span class="quote-slider-counter"></span>
//         <button class="quote-slider-arrow prev" aria-label="Previous">‹</button>
//         <button class="quote-slider-arrow next" aria-label="Next">›</button>
//       </div>
//     </div>
//   </div>
// Dots are auto-generated from the slide count. Keyboard arrows work when the
// slider is focused. Exits silently if no .quote-slider element is present.
// =============================================================================

(function() {
  const slider = document.querySelector('.quote-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.quote-slide'));
  if (slides.length === 0) return;

  // ---- CONFIG ---------------------------------------------------------------
  const ROTATE_INTERVAL_MS = 3000;   // pause between slides
  const PAUSE_ON_HOVER = true;

  const total = slides.length;
  let current = 0;
  let timer = null;
  let isHoverPaused = false;

  // ---- Auto-build dots from slide count -------------------------------------
  const dotsContainer = slider.querySelector('.quote-slider-dots');
  const dots = [];
  if (dotsContainer) {
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'quote-slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Quote ${i + 1}`);
      dot.addEventListener('click', () => { show(i); resetTimer(); });
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }
  }

  const prevBtn  = slider.querySelector('.quote-slider-arrow.prev');
  const nextBtn  = slider.querySelector('.quote-slider-arrow.next');
  const counter  = slider.querySelector('.quote-slider-counter');

  function show(i) {
    current = (i + total) % total;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  // ---- Auto-advance ---------------------------------------------------------
  function startTimer() {
    clearInterval(timer);
    if (isHoverPaused) return;
    timer = setInterval(() => show(current + 1), ROTATE_INTERVAL_MS);
  }
  function stopTimer() { clearInterval(timer); }
  // Reset = stop + restart, so a manual step gives a fresh full interval before
  // the next auto-advance (rather than firing immediately).
  function resetTimer() { stopTimer(); startTimer(); }

  if (prevBtn) prevBtn.addEventListener('click', () => { show(current - 1); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { show(current + 1); resetTimer(); });

  // ---- Pause on hover -------------------------------------------------------
  if (PAUSE_ON_HOVER) {
    slider.addEventListener('mouseenter', () => { isHoverPaused = true;  stopTimer(); });
    slider.addEventListener('mouseleave', () => { isHoverPaused = false; startTimer(); });
  }

  // ---- Keyboard navigation (when slider is focused) -------------------------
  slider.tabIndex = 0;
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(current - 1); resetTimer(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); resetTimer(); }
  });

  // ---- Go -------------------------------------------------------------------
  show(0);
  startTimer();
})();
