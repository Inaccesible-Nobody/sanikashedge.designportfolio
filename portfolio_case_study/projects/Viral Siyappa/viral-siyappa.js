/* Viral Siyappa case study interactions: section navigation, interactive game loop, rulebook and back-to-top. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navLinks = [...document.querySelectorAll('.section-nav a')];
  const targets = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  const activateNav = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window && targets.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) activateNav(visible[0].target.id);
    }, { rootMargin: '-22% 0px -62% 0px', threshold: [0.01, 0.15, 0.35, 0.6] });
    targets.forEach((target) => navObserver.observe(target));
  }
  navLinks.forEach((link) => link.addEventListener('click', () => {
    const target = link.getAttribute('href');
    if (target?.startsWith('#')) activateNav(target.slice(1));
  }));

  /* Select a phase in the circular diagram; keep the explanation and flow animation in sync. */
  const orbit = document.querySelector('.loop-orbit');
  const phaseTabs = [...document.querySelectorAll('[data-loop-phase]')];
  const phasePanels = [...document.querySelectorAll('[data-loop-panel]')];
  const flowCard = document.querySelector('.loop-flow-card');
  const setLoopPhase = (phase, shouldFocus = false, animate = true) => {
    const activeTab = phaseTabs.find((tab) => tab.dataset.loopPhase === phase);
    if (!activeTab) return;
    phaseTabs.forEach((tab) => {
      const active = tab.dataset.loopPhase === phase;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && shouldFocus) tab.focus();
    });
    phasePanels.forEach((panel) => {
      const active = panel.dataset.loopPanel === phase;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (orbit) orbit.dataset.activePhase = phase;
    if (flowCard) {
      flowCard.className = 'loop-flow-card';
      if (animate && !reducedMotion) {
        void flowCard.offsetWidth;
        flowCard.classList.add('is-moving', `from-${phase}`);
      }
    }
  };
  phaseTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setLoopPhase(tab.dataset.loopPhase));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % phaseTabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + phaseTabs.length) % phaseTabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = phaseTabs.length - 1;
      else return;
      event.preventDefault();
      setLoopPhase(phaseTabs[next].dataset.loopPhase, true);
    });
  });
  if (phaseTabs.length) setLoopPhase(phaseTabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.loopPhase || phaseTabs[0].dataset.loopPhase, false, false);

  const rulebookTrigger = document.querySelector('.rulebook-trigger');
  const rulebookDialog = document.querySelector('.rulebook-dialog');
  const rulebookClose = document.querySelector('.rulebook-close');
  if (rulebookTrigger instanceof HTMLButtonElement && rulebookDialog instanceof HTMLDialogElement && rulebookClose instanceof HTMLButtonElement) {
    rulebookTrigger.addEventListener('click', () => rulebookDialog.showModal());
    rulebookClose.addEventListener('click', () => rulebookDialog.close());
    rulebookDialog.addEventListener('click', (event) => {
      if (event.target === rulebookDialog) rulebookDialog.close();
    });
    rulebookDialog.addEventListener('close', () => rulebookTrigger.focus());
  }

  const revealItems = document.querySelectorAll('.content-section, .integrated-loop, .rulebook-exhibit, .component-gallery figure, .process-timeline article, .process-evidence-grid figure, .final-asset-grid figure, .impact-grid article');
  if ('IntersectionObserver' in window && !reducedMotion) {
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
    const floatingNav = topButton.closest('.case-study-float-nav');

    const updateTopButton = () => {
        const visible = window.scrollY > 500;

        topButton.classList.toggle('is-visible', visible);

        if (floatingNav) {
            floatingNav.classList.toggle('is-visible', visible);
        }
    };

    window.addEventListener('scroll', updateTopButton, {
        passive: true
    });

    updateTopButton();

    topButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    });
}
})();
