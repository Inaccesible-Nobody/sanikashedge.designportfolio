/* Small progressive enhancements for the AQI case study. */
(() => {
  const backTop = document.querySelector('.back-top');
  const updateBackTop = () => {
    backTop?.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.7);
  };
  window.addEventListener('scroll', updateBackTop, { passive: true });
  updateBackTop();

  const navLinks = document.querySelectorAll('.section-nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((item) => item.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'location');
    });
  });

  // Reveal content gently as it enters view; content remains visible if unsupported.
  const revealItems = document.querySelectorAll(
    '.content-section, .timeline-item, .viz-card, .outcome-placeholder, .brochure-block'
  );

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealItems.forEach((item) => item.classList.add('reveal-ready'));
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  }
})();
