/* Viral Siyappa case study interactions: section navigation, gameplay tabs and back-to-top. */
(() => {
  const navLinks = [...document.querySelectorAll('.section-nav a')];
  const targets = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const activateNav = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window && targets.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) activateNav(visible[0].target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.01, 0.15, 0.35, 0.6] });
    targets.forEach((target) => navObserver.observe(target));
  }
  navLinks.forEach((link) => link.addEventListener('click', () => {
    const target = link.getAttribute('href');
    if (target?.startsWith('#')) activateNav(target.slice(1));
  }));

  const tabs = [...document.querySelectorAll('.phase-tab')];
  const panels = [...document.querySelectorAll('[data-phase-panel]')];
  const setPhase = (phase, shouldFocus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.phase === phase;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && shouldFocus) tab.focus();
    });
    panels.forEach((panel) => {
      const active = panel.dataset.phasePanel === phase;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setPhase(tab.dataset.phase));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      setPhase(tabs[nextIndex].dataset.phase, true);
    });
  });
  if (tabs.length) setPhase(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.phase || tabs[0].dataset.phase);

  const rulebookTrigger = document.querySelector('.rulebook-trigger');
  const rulebookDialog = document.querySelector('.rulebook-dialog');
  const rulebookClose = document.querySelector('.rulebook-close');
  if (rulebookTrigger instanceof HTMLButtonElement && rulebookDialog instanceof HTMLDialogElement && rulebookClose instanceof HTMLButtonElement) {
    rulebookTrigger.addEventListener('click', () => rulebookDialog.showModal());
    rulebookClose.addEventListener('click', () => rulebookDialog.close());
    rulebookDialog.addEventListener('click', (event) => {
      if (event.target === rulebookDialog) rulebookDialog.close();
    });
  }

  const revealItems = document.querySelectorAll('.content-section, .system-section, .component-gallery figure, .process-timeline article, .process-evidence-grid figure, .final-asset-grid figure, .impact-grid article');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealItems.forEach((item) => item.classList.add('reveal-ready'));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const topButton = document.querySelector('.back-to-top');
  if (topButton) {
    const updateTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', updateTopButton, { passive: true });
    updateTopButton();
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  }
})();
