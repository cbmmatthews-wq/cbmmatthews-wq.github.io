// =============================================================================
// nav.js — top navigation + back-to-top button, defined once,
//          rendered on every page automatically.
// To add a note: add to the M544 Notes dropdown.
// To add a Core/Quick Hit/Example: add to the relevant column in the Resources
// mega menu.
// =============================================================================

const navConfig = {
  brand: {
    label: '<span style="color:var(--blue);">/</span><span style="color:var(--red);">/</span>cbmatthe',
    href: 'index.html'
  },
  items: [
    { label: 'Home', href: 'index.html' },
    {
      label: 'M544 Notes',
      dropdown: [
        { label: 'Intro: A Course Built Against the Current', href: 'intro.html' },
        { label: 'Unit 1 — IMC',                href: 'unit-1-imc.html' },
        { label: 'Unit 2A — Brand Foundations', href: 'unit-2a-brand-foundations.html' },
        { label: 'Unit 2B — Brand Mechanics',   href: 'unit-2b-brand-mechanics.html' },
        { label: 'Unit 2C — Blanding',          href: 'unit-2c-blanding.html' },
        { label: 'Unit 3 — STP',                href: 'unit-3-stp.html' }
        // Add more units here as they're built
      ]
    },
    {
      label: 'Resources',
      megaMenu: {
        columns: [
          {
            title: 'Core',
            items: [
              { label: 'What is IMC',       href: 'imc.html' },
              { label: 'PESO',              href: 'peso.html' },
              { label: 'The Funnel',        href: 'funnel.html' },
              { label: 'Promotional Mix',   href: 'promotional-mix.html' },
              { label: 'Touch Points',      href: 'touch-points.html' },
              { label: 'Repetition',        href: 'repetition.html' },
              { label: 'Brand vs. Perf',    href: 'brand-vs-performance.html' },
              { label: '2024 Ad Spend',     href: 'ad-spend.html' }
            ]
          },
          {
            title: 'Quick Hits',
            items: [
              { label: 'Does Advertising Raise Prices?', href: 'advertising-and-prices.html' },
              { label: 'Cause Marketing',                href: 'cause-marketing.html' },
              { label: 'Zone of Indifference',           href: 'zone-of-indifference.html' }
            ]
          },
          {
            title: 'Examples',
            items: [
              { label: 'Nike: Same Soul, Different Words',  href: 'nike-same-soul.html' },
              { label: 'Off the Swoosh Path: Hoka & On',    href: 'off-the-swoosh-path.html' },
              { label: 'Gucci: From Logomania to Luxury Sport', href: 'gucci-luxury-sport.html' }
              // Add more examples here as they're built
            ]
          }
        ]
      }
    }
  ]
};

// -------- Build top nav -------------------------------------------------------
(function buildNav() {
  const mount = document.getElementById('topnav');
  if (!mount) return;

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const activeStyle = ' style="color:var(--red);border-left-color:var(--red);"';

  const itemsHTML = navConfig.items.map(item => {
    // Mega menu (3-column dropdown)
    if (item.megaMenu) {
      const colsHTML = item.megaMenu.columns.map(col => {
        const body = col.items.length === 0
          ? '<div class="topnav-megamenu-empty">Coming soon</div>'
          : `<ul class="topnav-megamenu-list">${
              col.items.map(sub => {
                const isHere = sub.href.toLowerCase() === here ? activeStyle : '';
                return `<li><a href="${sub.href}"${isHere}>${sub.label}</a></li>`;
              }).join('')
            }</ul>`;
        return `<div class="topnav-megamenu-col">
          <div class="topnav-megamenu-title">${col.title}</div>
          ${body}
        </div>`;
      }).join('');

      return `<li class="topnav-item">
        <a href="#" class="topnav-link has-dropdown" onclick="return false;">${item.label}</a>
        <div class="topnav-megamenu">${colsHTML}</div>
      </li>`;
    }

    // Simple flat dropdown
    if (item.dropdown) {
      const subItems = item.dropdown.map(sub => {
        const cls = sub.disabled ? 'disabled' : '';
        const isHere = sub.href.toLowerCase() === here ? activeStyle : '';
        return `<li><a href="${sub.href}" class="${cls}"${isHere}>${sub.label}</a></li>`;
      }).join('');

      return `<li class="topnav-item">
        <a href="#" class="topnav-link has-dropdown" onclick="return false;">${item.label}</a>
        <ul class="topnav-dropdown">${subItems}</ul>
      </li>`;
    }

    // Plain link
    const isHere = item.href.toLowerCase() === here ? ' style="color:var(--red);"' : '';
    return `<li class="topnav-item">
      <a href="${item.href}" class="topnav-link"${isHere}>${item.label}</a>
    </li>`;
  }).join('');

  mount.outerHTML = `
    <nav class="topnav" id="topnav">
      <div class="topnav-inner">
        <a href="${navConfig.brand.href}" class="topnav-brand">${navConfig.brand.label}</a>
        <ul class="topnav-menu">${itemsHTML}</ul>
      </div>
    </nav>
  `;
})();

// -------- Build back-to-top button -------------------------------------------
// Injects a circular button into every page. Appears after the user scrolls
// down ~400px; smooth-scrolls to top on click.
(function buildBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function update() {
    if (window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }

  if (document.body) {
    document.body.appendChild(btn);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
