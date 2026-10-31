// Menu mobile : ouverture / fermeture accessible (Échap, clic sur un lien, retour au format large).
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('menu-principal');
const label = toggle?.querySelector('.visually-hidden');
const wide = window.matchMedia('(min-width: 1001px)');

function setOpen(open) {
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
  toggle.querySelector('use')?.setAttribute('href', open ? '#i-close' : '#i-menu');
}

toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

nav?.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    toggle.focus();
  }
});

wide.addEventListener('change', (event) => {
  if (event.matches) setOpen(false);
});
