/* Postcard V11: background submission to FormSubmit, in-page confirmation, and slide-away animation. */
(() => {
    'use strict';

    const form = document.querySelector('.postcard-form');
    const dialog = document.getElementById('postcard-dialog');
    if (!form || !dialog) return;

    const card = dialog.querySelector('.postcard-card');
    const sendButton = form.querySelector('button[type="submit"]');
    const note = form.querySelector('.postcard-form-note');
    const originalButtonText = sendButton ? sendButton.textContent : 'Send postcard ↗';
    const originalNoteText = note ? note.textContent : '';

    // A quiet honeypot helps catch basic spam bots without showing a CAPTCHA.
    if (!form.querySelector('input[name="_honey"]')) {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = '_honey';
        honeypot.className = 'postcard-honey';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        honeypot.setAttribute('aria-hidden', 'true');
        form.appendChild(honeypot);
    }

    // Use FormSubmit's background endpoint, derived from the recipient already configured in about.html.
    function getAjaxEndpoint() {
        const actionValue = form.getAttribute('action') || '';
        if (!actionValue || actionValue.includes('REPLACE_WITH_YOUR_EMAIL')) {
            throw new Error('Set the receiving email address in the postcard form before sending.');
        }
        const endpoint = new URL(actionValue, window.location.href);
        if (!/formsubmit\.co$/i.test(endpoint.hostname)) {
            throw new Error('The postcard form is not configured for FormSubmit.');
        }
        endpoint.pathname = endpoint.pathname.replace(/\/$/, '');
        if (!endpoint.pathname.startsWith('/ajax/')) {
            endpoint.pathname = '/ajax' + (endpoint.pathname.startsWith('/') ? '' : '/') + endpoint.pathname;
        }
        return endpoint.toString();
    }

    function setNote(message, kind) {
        if (!note) return;
        note.textContent = message;
        note.classList.toggle('is-error', kind === 'error');
        note.classList.toggle('is-success', kind === 'success');
        note.setAttribute('role', 'status');
        note.setAttribute('aria-live', 'polite');
    }

    function showToast(message) {
        let toast = document.querySelector('.postcard-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'postcard-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(showToast.timeoutId);
        showToast.timeoutId = window.setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 4200);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (form.dataset.submitting === 'true') return;

        if (!form.reportValidity()) return;

        let endpoint;
        try {
            endpoint = getAjaxEndpoint();
        } catch (error) {
            setNote(error.message, 'error');
            return;
        }

        form.dataset.submitting = 'true';
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.textContent = 'Sending…';
        }
        setNote('Sending your postcard…', '');

        try {
            const payload = Object.fromEntries(new FormData(form).entries());
            // User requested no visible CAPTCHA. Keep a honeypot as lightweight spam protection.
            payload._captcha = 'false';
            payload._subject = payload._subject || 'A postcard from your portfolio';
            payload._replyto = payload.email || '';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();
            let result;
            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch {
                throw new Error('The email service returned an unexpected response. Please try again.');
            }

            const successFlag = String(result.success ?? result.ok ?? result.status ?? '').toLowerCase();
            const success = response.ok && (
                successFlag === 'true' ||
                successFlag === 'success' ||
                successFlag === '1' ||
                (successFlag === '' && /success/i.test(String(result.message || '')))
            );

            if (!success) {
                throw new Error(result.message || result.error || 'Your postcard could not be sent. Please try again.');
            }

            setNote('Sent! Your postcard is on its way.', 'success');
            if (card) {
                card.classList.remove('postcard-card--sending-away');
                // Force restart if the user submits again in the same open dialog.
                void card.offsetWidth;
                card.classList.add('postcard-card--sending-away');
            }

            window.setTimeout(() => {
                if (dialog.open) dialog.close();
                if (card) card.classList.remove('postcard-card--sending-away');
                form.reset();
                setNote(originalNoteText, '');
                if (sendButton) {
                    sendButton.disabled = false;
                    sendButton.textContent = originalButtonText;
                }
                form.dataset.submitting = 'false';
                showToast('Postcard sent. Thanks for writing!');
            }, 680);
        } catch (error) {
            setNote(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error');
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.textContent = originalButtonText;
            }
            form.dataset.submitting = 'false';
        }
    });
})();
