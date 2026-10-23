/* Small progressive enhancements for the AQI case study. */
(() => {
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
