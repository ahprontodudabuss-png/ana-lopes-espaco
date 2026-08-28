const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwEnXR9inWTWV770Yv7E4zuZ4x30vcbCD9DVwWK9yjzcXJ8C9x06QTYunDjSztrtYKt/exec';

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-menu]');

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                menu.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const form = document.querySelector('.booking-form');
    const tabs = document.querySelectorAll('[data-form-mode]');
    const formType = document.querySelector('#form-type');
    const messageField = document.querySelector('#message-field');
    const submitLabel = document.querySelector('#submit-label');

    if (form && tabs.length && formType && messageField && submitLabel) {
        const activateMode = (mode, shouldScroll = true) => {
            const selectedTab = [...tabs].find((item) => item.dataset.formMode === mode);
            if (!selectedTab) return;
            formType.value = mode;
            tabs.forEach((item) => item.classList.toggle('active', item === selectedTab));
            if (mode === 'orcamento') {
                submitLabel.textContent = 'Solicitar orçamento';
                messageField.required = true;
                messageField.placeholder = 'Conte sobre o seu evento, data e o que você está imaginando.';
            } else {
                submitLabel.textContent = 'Enviar solicitação';
                messageField.required = false;
                messageField.placeholder = 'Conte um pouco sobre o seu momento, evento ou dúvida.';
            }
            if (shouldScroll) document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        tabs.forEach((tab) => {
            tab.addEventListener('click', (event) => {
                event.preventDefault();
                const mode = tab.dataset.formMode;
                activateMode(mode);
            });
        });

        document.querySelectorAll('a[href="#orcamento"]:not([data-form-mode])').forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                activateMode('orcamento');
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!APPS_SCRIPT_URL) {
                alert('O formulário ainda não está ligado ao sistema. Configure a URL do Apps Script em assets/js/main.js.');
                return;
            }
            const button = form.querySelector('button[type="submit"]');
            const originalLabel = submitLabel.textContent;
            const iframeName = `apps-script-submit-${Date.now()}`;
            const iframe = document.createElement('iframe');
            iframe.name = iframeName;
            iframe.title = 'Envio do formulário';
            iframe.hidden = true;
            document.body.appendChild(iframe);
            submitLabel.textContent = 'Enviando...';
            if (button) button.disabled = true;
            const originalAction = form.getAttribute('action');
            const originalMethod = form.getAttribute('method');
            const originalTarget = form.getAttribute('target');
            form.setAttribute('action', APPS_SCRIPT_URL);
            form.setAttribute('method', 'POST');
            form.setAttribute('target', iframeName);
            HTMLFormElement.prototype.submit.call(form);
            form.setAttribute('action', originalAction || '');
            if (originalMethod) form.setAttribute('method', originalMethod); else form.removeAttribute('method');
            if (originalTarget) form.setAttribute('target', originalTarget); else form.removeAttribute('target');
            window.setTimeout(() => {
                submitLabel.textContent = 'Solicitação enviada';
                form.reset();
                formType.value = 'agendamento';
                tabs.forEach((item) => item.classList.toggle('active', item.dataset.formMode === 'agendamento'));
                messageField.required = false;
                messageField.placeholder = 'Conte um pouco sobre o seu momento, evento ou dúvida.';
                const confirmation = document.createElement('p');
                confirmation.className = 'form-success';
                confirmation.textContent = 'Recebemos os seus dados. Em breve entraremos em contacto.';
                form.appendChild(confirmation);
                window.setTimeout(() => { confirmation.remove(); submitLabel.textContent = originalLabel; if (button) button.disabled = false; iframe.remove(); }, 5000);
            }, 800);
        });
    }
});
