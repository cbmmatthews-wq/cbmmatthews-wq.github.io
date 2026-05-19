// =============================================================================
// scrollspy.js — drives the sticky secondary nav
// Any page that has a .subnav with anchor links to .section IDs gets:
//   • active-link highlighting as the user scrolls
//   • a rust progress bar under the subnav showing scroll position
// =============================================================================

(function() {
  const subnav = document.querySelector('.subnav');
  if (!subnav) return;

  const progress = subnav.querySelector('.subnav-progress');
  const navLinks = Array.from(subnav.querySelectorAll('.subnav-inner a[href^="#"]'));
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function update() {
    // Progress bar: how far down the page have we scrolled?
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    if (progress) progress.style.width = Math.min(pct, 100) + '%';

    // Active section: the last section whose top is above the scroll offset
    const offset = window.scrollY + 140;
    let current = sections[0];
    for (const sec of sections) {
      if (sec.offsetTop <= offset) current = sec;
    }

    if (current) {
      const activeHref = '#' + current.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === activeHref);
      });
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
