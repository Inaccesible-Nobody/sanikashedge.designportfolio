document.addEventListener("DOMContentLoaded", () => {
    const bindToggle = ({ rootSelector, triggerSelector, panelSelector, closeSelector }) => {
        const root = document.querySelector(rootSelector);
        if (!root) return;

        const trigger = root.querySelector(triggerSelector);
        const panel = panelSelector ? root.querySelector(panelSelector) : null;
        const close = closeSelector ? root.querySelector(closeSelector) : null;
        if (!trigger) return;

        const setOpen = (open) => {
            root.classList.toggle("is-open", open);
            trigger.setAttribute("aria-expanded", String(open));
            if (panel) panel.setAttribute("aria-hidden", String(!open));
        };

        trigger.addEventListener("click", () => {
            setOpen(!root.classList.contains("is-open"));
        });
        close?.addEventListener("click", () => setOpen(false));
    };

    bindToggle({
        rootSelector: ".about-object--music",
        triggerSelector: ".music-trigger",
        panelSelector: ".music-panel",
        closeSelector: ".music-panel-close"
    });

    const musicTrigger = document.querySelector(".music-trigger");
    const playlistFrame = document.querySelector(".music-panel iframe[data-src]");
    if (musicTrigger && playlistFrame) {
        musicTrigger.addEventListener("click", () => {
            const musicObject = document.querySelector(".about-object--music");
            if (musicObject?.classList.contains("is-open") && !playlistFrame.getAttribute("src")) {
                playlistFrame.setAttribute("src", playlistFrame.dataset.src);
            }
        });
    }

    bindToggle({
        rootSelector: ".about-object--moka",
        triggerSelector: ".moka-trigger",
        panelSelector: ".moka-caption"
    });

    bindToggle({
        rootSelector: ".about-object--tech",
        triggerSelector: ".tech-folder-trigger",
        panelSelector: ".tech-sheet",
        closeSelector: ".tech-sheet-close"
    });

    bindToggle({
        rootSelector: ".about-object--books",
        triggerSelector: ".books-trigger",
        panelSelector: ".books-panel",
        closeSelector: ".books-panel-close"
    });

    const pudding = document.querySelector(".pudding-trigger");
    if (pudding) {
        pudding.addEventListener("click", () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            pudding.classList.remove("is-tilted");
            // Force a style flush so repeated clicks replay the tiny tilt.
            void pudding.offsetWidth;
            pudding.classList.add("is-tilted");
            window.setTimeout(() => pudding.classList.remove("is-tilted"), 520);
        });
    }

    // Postcard CTA: open and close independently from the collage objects.
    const postcardDialog = document.querySelector("#postcard-dialog");
    const postcardTrigger = document.querySelector(".connect-stamp");
    const postcardClose = document.querySelector(".postcard-close");
    if (postcardDialog && postcardTrigger) {
        postcardTrigger.addEventListener("click", () => {
            if (typeof postcardDialog.showModal === "function") postcardDialog.showModal();
        });
        postcardClose?.addEventListener("click", () => postcardDialog.close());
        postcardDialog.addEventListener("click", (event) => {
            if (event.target === postcardDialog) postcardDialog.close();
        });
        postcardDialog.addEventListener("close", () => postcardTrigger.focus({ preventScroll: true }));
    }

});
