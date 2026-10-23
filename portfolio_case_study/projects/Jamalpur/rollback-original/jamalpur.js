document.addEventListener("DOMContentLoaded", () => {
    const sectionLinks = [...document.querySelectorAll(".section-index a")];
    const sections = [...document.querySelectorAll("main .case-section[id]")];
    const revealItems = [...document.querySelectorAll(".reveal, .reveal-image")];

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    revealItems.forEach((item) => revealObserver.observe(item));

    const activateIndex = (id) => {
        sectionLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) activateIndex(visible[0].target.id);
    }, { rootMargin: "-34% 0px -54% 0px", threshold: [0.01, 0.15, 0.35, 0.6] });

    sections.forEach((section) => sectionObserver.observe(section));

    // TIMELINE
    const timelineData = {
        morning: {
            label: "MORNING VENDORS · 3 AM — 10 AM",
            title: "Bulk selling, speed and early footfall.",
            body: "They arrive before dawn, collect flowers, set up, make garlands and sell through the morning before packing up."
        },
        afternoon: {
            label: "AFTERNOON VENDORS · 10 AM — 10 PM",
            title: "More flexible, adaptive and relationship-driven.",
            body: "They adapt to changing customer flow, sell through the afternoon and evening, and manage whatever stock remains toward closing."
        },
        shop: {
            label: "SHOP OWNERS · 3 AM — 11:30 AM",
            title: "Steady supply, display and wholesale movement.",
            body: "They receive bulk deliveries early, prepare stock for wholesale buyers and settle finances before leaving."
        }
    };

    const timelineDetail = document.querySelector("#timeline-detail");
    const timelineTabs = [...document.querySelectorAll(".timeline-tab")];
    const timelineFills = [...document.querySelectorAll(".timeline-fill")];

    const setTimeline = (key) => {
        const data = timelineData[key];
        timelineTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.timeline === key));
        timelineFills.forEach((fill) => fill.classList.toggle("is-active", fill.dataset.for === key));
        timelineDetail.innerHTML = `<span class="timeline-detail-label">${data.label}</span><h3>${data.title}</h3><p>${data.body}</p>`;
    };

    timelineTabs.forEach((tab) => {
        tab.addEventListener("mouseenter", () => setTimeline(tab.dataset.timeline));
        tab.addEventListener("focus", () => setTimeline(tab.dataset.timeline));
        tab.addEventListener("click", () => setTimeline(tab.dataset.timeline));
    });

    // SUPPLY CHAIN
    const supplyCopy = {
        farmer: "Farmers and producers sit upstream, supplying the flowers that enter the Jamalpur market.",
        formal: "The formal market receives, checks and sells flowers through wholesale and retail activity.",
        informal: "Outside vendors buy from the formal market and redistribute flowers through roadside selling.",
        buyer: "Everyday buyers encounter the market through both inside shops and quick roadside purchases."
    };
    const supplyNodes = [...document.querySelectorAll(".supply-node")];
    const supplyDetail = document.querySelector("#supply-detail");
    supplyNodes.forEach((node) => {
        const activate = () => {
            supplyNodes.forEach((n) => n.classList.toggle("is-active", n === node));
            supplyDetail.textContent = supplyCopy[node.dataset.node];
        };
        node.addEventListener("mouseenter", activate);
        node.addEventListener("focus", activate);
        node.addEventListener("click", activate);
    });

// EXPENSES
    const expenseData = {
        stock: "The main purchase cost: flowers must be bought before they can be resold.",
        commute: "Getting to the market is a recurring cost, especially for vendors travelling from outside the immediate area.",
        ice: "Ice helps preserve freshness and becomes part of the everyday operating cost of selling flowers.",
        light: "Light rentals extend the working day and are especially visible during the earliest hours.",
        thread: "Garland thread is a small but necessary input in the making and sale of garlands."
    };
    const expenseButtons = [...document.querySelectorAll(".expense-widget button")];
    const expenseDetail = document.querySelector("#expense-detail");
    expenseButtons.forEach((button) => {
        const activate = () => {
            expenseButtons.forEach((b) => b.classList.toggle("is-active", b === button));
            expenseDetail.textContent = expenseData[button.dataset.expense];
        };
        button.addEventListener("mouseenter", activate);
        button.addEventListener("focus", activate);
        button.addEventListener("click", activate);
    });

    // STAKEHOLDER MAPPING
    const stakeholderItems = [...document.querySelectorAll('.stakeholder-map-component .stakeholder')];
    const stakeholderLegends = [...document.querySelectorAll('.stakeholder-map-component .stakeholder-legend-item')];

    const setStakeholderTier = (tier) => {
        stakeholderItems.forEach((item) => {
            const sameTier = item.dataset.tier === tier;
            item.classList.toggle('is-dimmed', !sameTier);
        });
        stakeholderLegends.forEach((legend) => {
            legend.classList.toggle('active', legend.dataset.tier === tier);
        });
    };

    const clearStakeholderTier = () => {
        stakeholderItems.forEach((item) => item.classList.remove('is-dimmed'));
        stakeholderLegends.forEach((legend) => legend.classList.remove('active'));
    };

    stakeholderLegends.forEach((legend) => {
        legend.addEventListener('mouseenter', () => setStakeholderTier(legend.dataset.tier));
        legend.addEventListener('mouseleave', clearStakeholderTier);
        legend.addEventListener('focus', () => setStakeholderTier(legend.dataset.tier));
        legend.addEventListener('blur', clearStakeholderTier);
        legend.addEventListener('click', () => setStakeholderTier(legend.dataset.tier));
    });

    stakeholderItems.forEach((item) => {
        item.addEventListener('mouseenter', () => setStakeholderTier(item.dataset.tier));
        item.addEventListener('mouseleave', clearStakeholderTier);
        item.addEventListener('focus', () => setStakeholderTier(item.dataset.tier));
        item.addEventListener('blur', clearStakeholderTier);
        item.addEventListener('click', () => setStakeholderTier(item.dataset.tier));
    });

    if (sections[0]) activateIndex(sections[0].id);
});
