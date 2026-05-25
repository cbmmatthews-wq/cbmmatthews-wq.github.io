// =============================================================================
// nav.js — top navigation + back-to-top button, defined once,
//          rendered on every page automatically.
// To add a new note: add an entry to the M544 Notes dropdown below.
// To add a resource: add an entry to the Resources dropdown below.
// =============================================================================

const navConfig = {
  brand: { label: 'cbmatthe', href: 'index.html' },
  items: [
    { label: 'Home', href: 'index.html' },
    {
      label: 'M544 Notes',
      dropdown: [
        { label: 'Intro: A Course Built Against the Current', href: 'intro.html' },
        { label: 'Unit 1 — IMC', href: 'unit-1-imc.html' }
        // Add more units here as they're built
      ]
    },
    {
      label: 'Resources',
      dropdown: [
        { label: 'Coming soon', href: '#', disabled: true }
        // Replace with real resource links as they're added
      ]
    }
  ]
};

// -------- Build top nav -------------------------------------------------------
(function buildNav() {
  const mount = document.getElementById('topnav');
  if (!mount) return;

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const itemsHTML = navConfig.items.map(item => {
    if (item.dropdown) {
      const subItems = item.dropdown.map(sub => {
        const cls = sub.disabled ? 'disabled' : '';
        const isHere = sub.href.toLowerCase() === here ? ' style="color:var(--red);border-left-color:var(--red);"' : '';
        return `<li><a href="${sub.href}" class="${cls}"${isHere}>${sub.label}</a></li>`;
      }).join('');

      return `<li class="topnav-item">
        <a href="#" class="topnav-link has-dropdown" onclick="return false;">${item.label}</a>
        <ul class="topnav-dropdown">${subItems}</ul>
      </li>`;
    }

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

  // Append after DOM is parsed enough to have a body
  if (document.body) {
    document.body.appendChild(btn);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
