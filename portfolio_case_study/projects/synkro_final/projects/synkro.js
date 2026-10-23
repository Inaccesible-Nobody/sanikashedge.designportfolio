document.addEventListener("DOMContentLoaded", () => {
  const indexLinks = [...document.querySelectorAll(".section-nav a")];
  const indexTargets = [...document.querySelectorAll("main section[id]")].filter(section => indexLinks.some(link => link.hash === `#${section.id}`));
  const backTop = document.querySelector(".back-top");
  const hero = document.querySelector(".hero-scroll");
  const leftPhone = document.querySelector(".hero-phone-left");
  const rightPhone = document.querySelector(".hero-phone-right");
  let frameRequested = false;

  const activateIndex = id => {
    indexLinks.forEach(link => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  if ("IntersectionObserver" in window && indexTargets.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) activateIndex(visible[0].target.id);
    }, { rootMargin: "-30% 0px -58% 0px", threshold: [0.01, 0.15, 0.35, 0.6] });
    indexTargets.forEach(section => sectionObserver.observe(section));
  }
  indexLinks.forEach(link => link.addEventListener("click", () => activateIndex(link.hash.slice(1))));

  // Scroll-linked parallax for the two original mobile mockups. The hero section itself provides the travel range.
  const updateScrollEffects = () => {
    frameRequested = false;
    const y = window.scrollY;
    if (hero && leftPhone && rightPhone && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const start = hero.getBoundingClientRect().top + y;
      const range = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, (y - start) / range));
      const eased = progress * progress * (3 - 2 * progress);
      leftPhone.style.transform = `rotate(${-7 - eased * 2}deg) translate3d(${-18 - eased * 54}px, ${58 - eased * 72}px, 0) scale(${.90 + eased * .08})`;
      rightPhone.style.transform = `rotate(${7 + eased * 2}deg) translate3d(${28 + eased * 66}px, ${58 - eased * 88}px, 0) scale(${.90 + eased * .08})`;
    }
    if (backTop) backTop.classList.toggle("is-visible", y > window.innerHeight * .72);
  };
  const queueScrollUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScrollEffects);
  };
  window.addEventListener("scroll", queueScrollUpdate, { passive: true });
  window.addEventListener("resize", queueScrollUpdate);
  updateScrollEffects();
  backTop?.addEventListener("click", event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  // Reveal sections after they enter the viewport, with a no-API fallback.
  const revealItems = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && revealItems.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else revealItems.forEach(item => item.classList.add("is-visible"));

  // Accessible two-tab persona switcher. Each tab carries its own research-scope note.
  const personaTabs = [...document.querySelectorAll(".persona-tab")];
  const personaPanels = [...document.querySelectorAll(".persona-panel")];
  const setPersona = tab => {
    const key = tab.dataset.persona;
    personaTabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    personaPanels.forEach(panel => {
      const active = panel.dataset.personaPanel === key;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };
  personaTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setPersona(tab));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowLeft") next = (index - 1 + personaTabs.length) % personaTabs.length;
      if (event.key === "ArrowRight") next = (index + 1) % personaTabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = personaTabs.length - 1;
      setPersona(personaTabs[next]);
      personaTabs[next].focus();
    });
  });
  if (personaTabs.length) setPersona(personaTabs[0]);

  // User-journey steps update the evidence copy in place.
  const journeyCopy = {
    discover: ["STEP 01", "Discover events through a more structured, comparable listing rather than relying on scattered sources alone."],
    evaluate: ["STEP 02", "Compare audience, location, cost and event details before deciding whether the opportunity fits."],
    register: ["STEP 03", "Move from an event decision to registration with key participation information kept close to the task."],
    select: ["STEP 04", "Inspect the site plan and select a preferred available stall before confirming participation."],
    participate: ["STEP 05", "Keep the practical details of participation and follow-up connected to the event."]
  };
  const journeySteps = [...document.querySelectorAll(".journey-step")];
  const journeyDetail = document.querySelector("#journey-detail");
  const setJourney = step => {
    const data = journeyCopy[step.dataset.flow];
    if (!data || !journeyDetail) return;
    journeySteps.forEach(item => {
      const active = item === step;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    journeyDetail.innerHTML = `<span>${data[0]}</span><p>${data[1]}</p>`;
  };
  journeySteps.forEach(step => {
    step.addEventListener("click", () => setJourney(step));
    step.addEventListener("focus", () => setJourney(step));
  });

  // Interactive stall-plan prototype: available stalls select a preference; booked stalls remain unavailable.
  const stallCells = [...document.querySelectorAll(".plan-stall")];
  const availableCells = stallCells.filter(cell => cell.classList.contains("available"));
  const stallDetail = document.querySelector("#stall-demo-detail");
  const stallConfirm = document.querySelector(".stall-confirm");
  const selectedStall = () => document.querySelector(".plan-stall.is-selected");
  const announceStall = cell => {
    if (!cell || !stallDetail) return;
    if (cell.classList.contains("booked")) stallDetail.textContent = `Stall ${cell.dataset.stall} is already booked. Choose another available stall.`;
    else if (cell.classList.contains("is-selected")) stallDetail.textContent = `Stall ${cell.dataset.stall} is selected as your preferred location.`;
    else stallDetail.textContent = `Stall ${cell.dataset.stall} is available. Select it to set it as your preference.`;
  };
  const chooseStall = cell => {
    if (cell.classList.contains("booked")) { announceStall(cell); return; }
    availableCells.forEach(item => item.classList.remove("is-selected"));
    cell.classList.add("is-selected");
    stallCells.forEach(item => item.setAttribute("aria-pressed", String(item === cell)));
    if (stallConfirm) stallConfirm.disabled = false;
    announceStall(cell);
  };
  stallCells.forEach(cell => {
    cell.setAttribute("aria-pressed", String(cell.classList.contains("is-selected")));
    cell.addEventListener("mouseenter", () => announceStall(cell));
    cell.addEventListener("focus", () => announceStall(cell));
    cell.addEventListener("click", () => chooseStall(cell));
  });
  if (selectedStall()) {
    if (stallConfirm) stallConfirm.disabled = false;
    announceStall(selectedStall());
  }
  stallConfirm?.addEventListener("click", () => {
    const chosen = selectedStall();
    if (!chosen || chosen.classList.contains("booked") || !stallDetail) return;
    stallDetail.textContent = `Stall ${chosen.dataset.stall} is saved as your preferred choice in this demo. No reservation has been created.`;
  });

  // IA click-to-zoom modal, with native dialog support and an accessible fallback.
  const iaDialog = document.querySelector("#ia-dialog");
  const iaOpener = document.querySelector('[data-lightbox-target="ia-dialog"]');
  const iaClose = document.querySelector(".artifact-dialog-close");
  if (iaDialog && iaOpener) {
    iaOpener.addEventListener("click", () => {
      if (typeof iaDialog.showModal === "function") iaDialog.showModal();
      else iaDialog.setAttribute("open", "");
    });
    iaClose?.addEventListener("click", () => {
      if (typeof iaDialog.close === "function") iaDialog.close();
      else iaDialog.removeAttribute("open");
    });
    iaDialog.addEventListener("click", event => {
      if (event.target === iaDialog && typeof iaDialog.close === "function") iaDialog.close();
    });
  }
});
