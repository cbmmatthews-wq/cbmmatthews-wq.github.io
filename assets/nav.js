// =============================================================================
// nav.js — top navigation, defined once, rendered on every page
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

(function buildNav() {
  const mount = document.getElementById('topnav');
  if (!mount) return;

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const itemsHTML = navConfig.items.map(item => {
    if (item.dropdown) {
      const subItems = item.dropdown.map(sub => {
        const cls = sub.disabled ? 'disabled' : '';
        const isHere = sub.href.toLowerCase() === here ? ' style="color:var(--rust);border-left-color:var(--rust);"' : '';
        return `<li><a href="${sub.href}" class="${cls}"${isHere}>${sub.label}</a></li>`;
      }).join('');

      return `<li class="topnav-item">
        <a href="#" class="topnav-link has-dropdown" onclick="return false;">${item.label}</a>
        <ul class="topnav-dropdown">${subItems}</ul>
      </li>`;
    }

    const isHere = item.href.toLowerCase() === here ? ' style="color:var(--rust);"' : '';
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
