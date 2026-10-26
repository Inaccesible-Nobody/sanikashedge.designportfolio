document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       SELECTED WORK — HOVER IMAGE
    ===================================================== */

    const workItems = document.querySelectorAll(".work-index-item");
    const hoverImage = document.querySelector(".work-hover-image");
    const image = document.getElementById("work-hover-image");

    if (
        workItems.length &&
        hoverImage &&
        image
    ) {

        workItems.forEach((item) => {

            item.addEventListener("mouseenter", () => {

                const imageSource = item.dataset.image;

                if (!imageSource) {
                    return;
                }

                image.src = imageSource;

                hoverImage.classList.add("visible");
            });


            item.addEventListener("mousemove", (event) => {

                hoverImage.style.left =
                    `${event.clientX + 24}px`;

                hoverImage.style.top =
                    `${event.clientY + 24}px`;

            });


            item.addEventListener("mouseleave", () => {

                hoverImage.classList.remove("visible");

            });

        });

    }


    /* =====================================================
       SELECTED CLIENT WORK — ACCORDION
    ===================================================== */

    const clientItems =
        document.querySelectorAll(".client-work-item");


    clientItems.forEach((item) => {

        const trigger =
            item.querySelector(".client-work-trigger");


        if (!trigger) {
            return;
        }


        trigger.addEventListener("click", () => {

            const isOpen =
                item.classList.contains("is-open");


            clientItems.forEach((otherItem) => {

                otherItem.classList.remove("is-open");

            });


            if (!isOpen) {

                item.classList.add("is-open");

            }

        });

    });

    /* =====================================================
       CLIENT WORK — TOUCH-SWIPEABLE CARD SLIDES
    ===================================================== */

    document.querySelectorAll(".client-card-carousel").forEach((carousel) => {
        const slides = carousel.querySelector(".client-card-slides");
        const dots = Array.from(
            carousel.querySelectorAll(".client-card-dots button")
        );

        if (!slides || !dots.length) {
            return;
        }

        const setCurrentDot = () => {
            const slideWidth = slides.clientWidth;
            if (!slideWidth) return;

            const currentIndex = Math.min(
                dots.length - 1,
                Math.round(slides.scrollLeft / slideWidth)
            );

            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.setAttribute("aria-current", "true");
                } else {
                    dot.removeAttribute("aria-current");
                }
            });
        };

        const scrollToIndex = (index) => {
            slides.scrollTo({
                left: index * slides.clientWidth,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth"
            });
        };

        let scrollFrame = null;
        slides.addEventListener("scroll", () => {
            if (scrollFrame !== null) {
                cancelAnimationFrame(scrollFrame);
            }
            scrollFrame = requestAnimationFrame(() => {
                setCurrentDot();
                scrollFrame = null;
            });
        }, { passive: true });

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => scrollToIndex(index));
        });

        setCurrentDot();
    });

    /* =====================================================
       CLIENT WORK — MOUSE-DRAG SCROLL AND IMAGE LIGHTBOX
    ===================================================== */

    const makeHorizontallyDraggable = (element) => {
        let startX = 0;
        let startScrollLeft = 0;
        let isDragging = false;
        let moved = false;

        element.addEventListener("mousedown", (event) => {
            if (event.button !== 0) {
                return;
            }

            event.stopPropagation();
            isDragging = true;
            startX = event.clientX;
            startScrollLeft = element.scrollLeft;
            moved = false;
        });

        window.addEventListener("mousemove", (event) => {
            if (!isDragging) {
                return;
            }

            const distance = event.clientX - startX;
            if (Math.abs(distance) > 4) {
                moved = true;
            }
            if (moved) {
                event.preventDefault();
                element.classList.add("is-dragging");
                element.scrollLeft = startScrollLeft - distance;
            }
        });

        window.addEventListener("mouseup", () => {
            if (!isDragging) {
                return;
            }

            if (moved) {
                element.dataset.dragged = "true";
                setTimeout(() => {
                    delete element.dataset.dragged;
                }, 0);
            }
            element.classList.remove("is-dragging");
            isDragging = false;
            moved = false;
        });

        element.addEventListener("dragstart", (event) => event.preventDefault());
        element.addEventListener("click", (event) => {
            if (element.dataset.dragged !== "true") {
                return;
            }
            delete element.dataset.dragged;
            event.preventDefault();
            event.stopPropagation();
        });
    };

    document.querySelectorAll(".client-gallery-track, .client-card-slides")
        .forEach(makeHorizontallyDraggable);

    const imageDialog = document.querySelector(".client-image-dialog");
    const dialogSlides = imageDialog?.querySelector(".client-image-dialog-slides");
    const dialogDots = imageDialog?.querySelector(".client-image-dialog-dots");
    const dialogCaption = imageDialog?.querySelector(".client-image-dialog-caption");
    const closeDialog = imageDialog?.querySelector(".client-image-dialog-close");
    const previousCardButton = imageDialog?.querySelector(".client-image-dialog-card-previous");
    const nextCardButton = imageDialog?.querySelector(".client-image-dialog-card-next");

    if (
        imageDialog && dialogSlides && dialogDots && dialogCaption &&
        closeDialog && previousCardButton && nextCardButton
    ) {
        makeHorizontallyDraggable(dialogSlides);
        const galleryCards = Array.from(document.querySelectorAll(".client-gallery-card"));
        const cardContents = galleryCards.map((card) => ({
            caption: card.querySelector("figcaption")?.textContent.trim() || "",
            images: Array.from(card.querySelectorAll(".client-card-slide img"))
                .concat(Array.from(card.querySelectorAll(":scope > .client-gallery-media > img")))
        }));
        let activeCardIndex = 0;
        let activeImageIndex = 0;

        const updateDialogDots = () => {
            const dots = Array.from(dialogDots.querySelectorAll("button"));
            if (!dialogSlides.clientWidth) {
                return;
            }

            activeImageIndex = Math.min(
                cardContents[activeCardIndex].images.length - 1,
                Math.round(dialogSlides.scrollLeft / dialogSlides.clientWidth)
            );
            dots.forEach((dot, index) => {
                if (index === activeImageIndex) {
                    dot.setAttribute("aria-current", "true");
                } else {
                    dot.removeAttribute("aria-current");
                }
            });
        };

        const renderExpandedCard = (cardIndex, imageIndex = 0) => {
            activeCardIndex = (cardIndex + cardContents.length) % cardContents.length;
            const { caption, images } = cardContents[activeCardIndex];
            activeImageIndex = Math.max(0, Math.min(images.length - 1, imageIndex));
            dialogSlides.replaceChildren();
            dialogDots.replaceChildren();
            dialogCaption.textContent = caption;
            imageDialog.setAttribute("aria-label", `Expanded ${caption} gallery card`);

            images.forEach((image, index) => {
                const slide = document.createElement("div");
                slide.className = "client-image-dialog-slide";
                const expandedImage = document.createElement("img");
                expandedImage.src = image.currentSrc || image.src;
                expandedImage.alt = image.alt;
                expandedImage.draggable = false;
                slide.append(expandedImage);
                dialogSlides.append(slide);

                if (images.length > 1) {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.setAttribute("aria-label", `Show ${caption} image ${index + 1}`);
                    if (index === 0) {
                        dot.setAttribute("aria-current", "true");
                    }
                    dialogDots.append(dot);
                }
            });

            dialogSlides.scrollLeft = activeImageIndex * dialogSlides.clientWidth;
            requestAnimationFrame(() => {
                dialogSlides.scrollLeft = activeImageIndex * dialogSlides.clientWidth;
                updateDialogDots();
            });
        };

        const moveExpandedImage = (direction) => {
            const images = cardContents[activeCardIndex].images;
            const nextImageIndex = activeImageIndex + direction;

            if (nextImageIndex >= 0 && nextImageIndex < images.length) {
                dialogSlides.scrollTo({
                    left: nextImageIndex * dialogSlides.clientWidth,
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth"
                });
                return;
            }

            const nextCardIndex = (activeCardIndex + direction + cardContents.length) %
                cardContents.length;
            const nextCardImages = cardContents[nextCardIndex].images;
            renderExpandedCard(
                nextCardIndex,
                direction > 0 ? 0 : nextCardImages.length - 1
            );
        };

        dialogSlides.addEventListener("scroll", updateDialogDots, { passive: true });
        dialogDots.addEventListener("click", (event) => {
            const dot = event.target.closest("button");
            if (!dot) {
                return;
            }
            const index = Array.from(dialogDots.children).indexOf(dot);
            activeImageIndex = index;
            dialogSlides.scrollTo({
                left: index * dialogSlides.clientWidth,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth"
            });
        });

        galleryCards.forEach((card, cardIndex) => {
            const { images } = cardContents[cardIndex];

            images.forEach((image) => {
                image.tabIndex = 0;
                image.setAttribute("aria-haspopup", "dialog");
                image.addEventListener("keydown", (event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                        return;
                    }
                    event.preventDefault();
                    image.click();
                });
            });

            const openDialog = (event) => {
                const selectedImage = event.target.closest("img");
                const currentSlideIndex = card.querySelector(".client-card-slides")
                    ? Math.round(card.querySelector(".client-card-slides").scrollLeft /
                        card.querySelector(".client-card-slides").clientWidth)
                    : 0;
                const imageIndex = selectedImage
                    ? images.indexOf(selectedImage)
                    : currentSlideIndex;
                renderExpandedCard(cardIndex, Math.max(0, imageIndex));
                imageDialog.showModal();
            };

            card.addEventListener("click", (event) => {
                if (event.target.closest("button")) {
                    return;
                }
                if (card.closest(".client-gallery-track")?.dataset.dragged === "true") {
                    return;
                }
                if (card.querySelector(".client-card-slides")?.dataset.dragged === "true") {
                    return;
                }
                openDialog(event);
            });
        });

        closeDialog.addEventListener("click", () => imageDialog.close());
        previousCardButton.addEventListener("click", () => {
            moveExpandedImage(-1);
        });
        nextCardButton.addEventListener("click", () => {
            moveExpandedImage(1);
        });
        imageDialog.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                imageDialog.close();
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveExpandedImage(-1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                moveExpandedImage(1);
            }
        });
        imageDialog.addEventListener("click", (event) => {
            if (event.target === imageDialog) {
                imageDialog.close();
            }
        });
    }


    /* =====================================================
       CONTACT FORM — FORMSPREE
    ===================================================== */

    const contactForm =
        document.getElementById("contact-form");

    const contactStatus =
        document.getElementById("contact-status");

    if (
        contactForm &&
        contactStatus
    ) {

        contactForm.addEventListener("submit", async (event) => {

            event.preventDefault();


            const submitButton =
                contactForm.querySelector(
                    ".contact-submit"
                );


            const formData =
                new FormData(contactForm);


            submitButton.disabled = true;

            submitButton.innerHTML =
                "SENDING <span>…</span>";

            contactStatus.textContent = "";

            contactStatus.className =
                "contact-status";


            try {

                const response =
                    await fetch(
                        contactForm.action,
                        {
                            method: "POST",

                            body: formData,

                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                if (response.ok) {

                    contactForm.reset();

                    contactStatus.textContent =
                        "Message sent. Thank you.";

                    contactStatus.classList.add(
                        "success"
                    );

                    submitButton.innerHTML =
                        "SENT <span>✓</span>";


                } else {

                    const data =
                        await response.json().catch(
                            () => null
                        );

                    throw new Error(
                        data?.errors?.[0]?.message ||
                        "Something went wrong."
                    );
                }


            } catch (error) {

                contactStatus.textContent =
                    "Something went wrong. Please try again.";

                contactStatus.classList.add(
                    "error"
                );

                submitButton.innerHTML =
                    "SEND MESSAGE <span>↗</span>";

                submitButton.disabled = false;

            }

        });

    }

});

/* ========================================
   CLIENT WORK — GALLERY POSITIONING
======================================== */

document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".client-work-trigger");
    if (!trigger) return;

    const clientItem = trigger.closest(".client-work-item");
    if (!clientItem) return;

    // Wait for the accordion to finish opening.
    setTimeout(() => {
        if (!clientItem.classList.contains("is-open")) return;

        const gallery = clientItem.querySelector(".client-gallery");
        if (!gallery) return;

        const rect = gallery.getBoundingClientRect();

        // Place the gallery centre slightly below the screen centre,
        // leaving more room for the client title above it.
        const targetScroll =
            window.scrollY +
            rect.top +
            rect.height / 2 -
            window.innerHeight * 0.58;

        window.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth"
        });
    }, 500);
});

/* ========================================
   FIRST-VISIT INTRO, KEYWORD PALETTE & WORK ENTRANCE
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    const bootScreen = document.getElementById("portfolio-boot");
    const skipBoot = document.getElementById("portfolio-boot-skip");
    const palette = document.getElementById("command-palette");
    const paletteSearch = document.getElementById("command-palette-search");
    const paletteScroll = document.getElementById("command-palette-scroll");
    const emptyMessage = document.getElementById("command-palette-empty");
    const gallery = document.querySelector(".work-gallery");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paletteHint = document.querySelector(".palette-hint");
    const homeSequence = document.querySelector(".home-intro-sequence");
    const homeStage = document.querySelector(".home-intro-stage");
    const introSection = document.getElementById("about");
    const workHeader = document.querySelector(".work-gallery-header");
    const contactSection = document.getElementById("contact");
    let homeScrollProgress = 0;
    let scrollUpdatePending = false;

    const clampProgress = (value) => Math.min(1, Math.max(0, value));

    // Map scroll position to the wordmark → intro transition. The header and
    // metadata stay in place because they live in the pinned stage, outside the
    // two animated elements.
    const updateHomeSequence = () => {
        scrollUpdatePending = false;
        if (!homeSequence || !homeStage) return;

        if (reducedMotion.matches) {
            homeScrollProgress = 1;
            homeStage.classList.add("is-intro-visible");
            homeStage.style.setProperty("--logo-opacity", "1");
            homeStage.style.setProperty("--logo-y", "0px");
            homeStage.style.setProperty("--logo-scale", "1");
            homeStage.style.setProperty("--intro-opacity", "1");
            homeStage.style.setProperty("--intro-y", "0px");
            return;
        }

        const scrollRange = Math.max(1, homeSequence.offsetHeight - window.innerHeight);
        const sequenceTop = homeSequence.getBoundingClientRect().top;
        homeScrollProgress = clampProgress(-sequenceTop / scrollRange);

        // Begin after a small scroll, finish before the midpoint, then hold the
        // intro calmly until the page releases into the Work section.
        const rawTransition = clampProgress((homeScrollProgress - 0.04) / 0.39);
        const eased = rawTransition * rawTransition * (3 - 2 * rawTransition);

        homeStage.style.setProperty("--logo-opacity", String(1 - eased));
        homeStage.style.setProperty("--logo-y", `${-44 * eased}px`);
        homeStage.style.setProperty("--logo-scale", String(1 - 0.025 * eased));
        homeStage.style.setProperty("--intro-opacity", String(eased));
        homeStage.style.setProperty("--intro-y", `${22 * (1 - eased)}px`);
        homeStage.classList.toggle("is-intro-visible", eased > 0.06);
    };

    const updatePaletteHintVisibility = () => {
        if (!paletteHint || !homeSequence || !contactSection) return;

        // Keep the hint hidden while the pinned hero/intro metadata is still
        // on screen. Reveal it only once Selected Work has clearly entered the
        // viewport, so it cannot collide with "Based in Ahmedabad".
        const workSectionReached = workHeader
            ? workHeader.getBoundingClientRect().top <= window.innerHeight * 0.78
            : homeSequence.getBoundingClientRect().bottom <= window.innerHeight * 0.88;

        const contactBottomReached =
            window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4 &&
            contactSection.getBoundingClientRect().bottom <= window.innerHeight + 8;

        paletteHint.classList.toggle(
            "is-visible",
            workSectionReached && !contactBottomReached
        );
    };

    const updateScrollDrivenElements = () => {
        if (scrollUpdatePending) return;
        scrollUpdatePending = true;
        window.requestAnimationFrame(() => {
            updateHomeSequence();
            updatePaletteHintVisibility();
        });
    };

    updateHomeSequence();
    updatePaletteHintVisibility();
    window.addEventListener("scroll", updateScrollDrivenElements, { passive: true });
    window.addEventListener("resize", updateScrollDrivenElements);
    if (typeof reducedMotion.addEventListener === "function") {
        reducedMotion.addEventListener("change", updateScrollDrivenElements);
    }

    // The intro runs once per browser tab. Reduced-motion users skip it entirely.
    if (bootScreen && document.documentElement.classList.contains("show-portfolio-boot")) {
        let bootDismissed = false;
        const dismissBoot = () => {
            if (bootDismissed) return;
            bootDismissed = true;
            bootScreen.classList.add("is-leaving");
            document.documentElement.classList.remove("show-portfolio-boot");
            window.setTimeout(() => {
                bootScreen.hidden = true;
            }, 300);
        };

        skipBoot?.addEventListener("click", dismissBoot);
        window.setTimeout(dismissBoot, 1150);
    } else if (bootScreen) {
        bootScreen.hidden = true;
    }

    // Animate the gallery only when it first enters view. Its existing margins/grid
    // remain responsible for the final positions, so this is entrance motion only.
    if (gallery) {
        if (reducedMotion.matches) {
            gallery.classList.add("is-in-view");
        } else {
            gallery.classList.add("gallery-motion-ready");
            if ("IntersectionObserver" in window) {
                const galleryObserver = new IntersectionObserver((entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        gallery.classList.add("is-in-view");
                        galleryObserver.disconnect();
                    }
                }, {
                    threshold: 0.12,
                    rootMargin: "0px 0px -8% 0px"
                });
                galleryObserver.observe(gallery);
            } else {
                gallery.classList.add("is-in-view");
            }
        }
    }

    if (!palette || !paletteSearch || !paletteScroll) return;

    const allEntries = Array.from(palette.querySelectorAll("[data-command-entry]"));
    const groups = Array.from(palette.querySelectorAll("[data-command-group]"));
    let visibleEntries = [];
    let activeEntryIndex = 0;

    const updateActiveEntry = () => {
        visibleEntries.forEach((entry, index) => {
            const isActive = index === activeEntryIndex;
            entry.classList.toggle("is-active", isActive);
            entry.setAttribute("aria-selected", String(isActive));
            if (isActive) entry.scrollIntoView({ block: "nearest" });
        });
    };

    const filterEntries = () => {
        const query = paletteSearch.value.trim().toLocaleLowerCase();
        visibleEntries = [];

        allEntries.forEach((entry) => {
            const kind = entry.dataset.kind;
            // At rest, show pages/sections and keywords. Project rows appear when
            // searching or after choosing a keyword, keeping the default panel calm.
            const searchableText = [
                entry.textContent,
                entry.dataset.search || "",
                entry.dataset.tags || "",
                entry.dataset.keyword || ""
            ].join(" ").toLocaleLowerCase();
            const defaultVisible = !query && kind !== "project";
            const matchesQuery = query && (query.length <= 2
                ? searchableText.split(/[^a-z0-9]+/).some((word) => word === query)
                : searchableText.includes(query));
            const matches = Boolean(defaultVisible || matchesQuery);

            entry.hidden = !matches;
            entry.classList.remove("is-active");
            entry.setAttribute("aria-selected", "false");
            if (matches) visibleEntries.push(entry);
        });

        groups.forEach((group) => {
            const hasVisibleEntry = group.querySelector('[data-command-entry]:not([hidden])');
            group.hidden = !hasVisibleEntry;
        });

        activeEntryIndex = 0;
        if (emptyMessage) emptyMessage.hidden = visibleEntries.length > 0 || !query;
        updateActiveEntry();
    };

    const openPalette = () => {
        if (typeof palette.showModal === "function") {
            if (!palette.open) palette.showModal();
        } else {
            palette.setAttribute("open", "");
        }
        paletteSearch.value = "";
        filterEntries();
        window.requestAnimationFrame(() => paletteSearch.focus());
    };

    const closePalette = () => {
        if (typeof palette.close === "function" && palette.open) {
            palette.close();
        } else {
            palette.removeAttribute("open");
        }
    };

    paletteSearch.addEventListener("input", filterEntries);

    palette.addEventListener("click", (event) => {
        if (event.target === palette) closePalette();
        const clickedEntry = event.target.closest("[data-command-entry]");
        if (!clickedEntry) return;

        if (clickedEntry.dataset.kind === "keyword") {
            // Selecting a keyword changes the palette to matching project results.
            event.preventDefault();
            paletteSearch.value = clickedEntry.dataset.keyword || clickedEntry.textContent.trim();
            filterEntries();
            paletteSearch.focus();
        } else {
            closePalette();
        }
    });

    paletteScroll.addEventListener("mousemove", (event) => {
        const hoveredEntry = event.target.closest("[data-command-entry]");
        if (!hoveredEntry || hoveredEntry.hidden) return;
        const index = visibleEntries.indexOf(hoveredEntry);
        if (index >= 0 && index !== activeEntryIndex) {
            activeEntryIndex = index;
            updateActiveEntry();
        }
    });

    document.addEventListener("keydown", (event) => {
        const isPaletteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
        if (isPaletteShortcut) {
            event.preventDefault();
            openPalette();
            return;
        }

        if (event.key === "Escape" && palette.open) {
            event.preventDefault();
            closePalette();
            return;
        }

        if (!palette.open || !visibleEntries.length) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            activeEntryIndex = (activeEntryIndex + 1) % visibleEntries.length;
            updateActiveEntry();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            activeEntryIndex = (activeEntryIndex - 1 + visibleEntries.length) % visibleEntries.length;
            updateActiveEntry();
        } else if (event.key === "Enter") {
            const activeEntry = visibleEntries[activeEntryIndex];
            if (activeEntry && activeEntry.dataset.kind === "keyword") {
                event.preventDefault();
                activeEntry.click();
            } else if (activeEntry && document.activeElement === paletteSearch) {
                event.preventDefault();
                activeEntry.click();
            }
        }
    });
});
