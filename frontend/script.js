// Shared behaviour across all pages: mobile nav + language toggle stub

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Language toggle is a visual stub here — wire this up to your
  // i18n solution (e.g. i18next / next-intl) when you plug this
  // markup into a framework.
  const langButtons = document.querySelectorAll('.lang-toggle button');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      langButtons.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      // TODO: trigger real translation swap here
    });
  });
});
