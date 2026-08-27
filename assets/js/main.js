const APPS_SCRIPT_URL = '';

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
            const data = new FormData(form);
            const mode = data.get('form_type') === 'orcamento' ? 'orçamento' : 'agendamento';
            const name = data.get('name') || '';
            const phone = data.get('phone') || '';
            const service = data.get('service') || 'Ainda não sei';
            const date = data.get('date') || 'a combinar';
            const message = data.get('message') || 'Sem observações';
            const text = `Olá! Gostaria de solicitar ${mode} no Ana Lopes Espaço.\n\nNome: ${name}\nTelefone: ${phone}\nServiço: ${service}\nMelhor data: ${date}\nObservações: ${message}`;
            if (APPS_SCRIPT_URL) {
                fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(Object.fromEntries(data.entries()))
                }).catch(() => {});
            }
            window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        });
    }
});
