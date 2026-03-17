document.addEventListener('DOMContentLoaded', () => {
    // --- Gestión de Temas (Dark/Light) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Aplicar tema inicial
    document.body.setAttribute('data-theme', currentTheme);
    updateToggleIcon(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            updateToggleIcon(theme);
        });
    }

    function updateToggleIcon(theme) {
        if (!themeToggleBtn) return;
        // Cambiar el icono del botón (Sol para modo claro, Luna para modo oscuro)
        if (theme === 'dark') {
            themeToggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></svg>`;
        } else {
            themeToggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }
    }

    // --- Intersection Observer para el estilo Apple (Entradas con peso) ---
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // --- Efecto Magnético Refinado (Sutil) ---
    document.addEventListener('mousemove', (e) => {
        const targets = document.querySelectorAll('.magnetic-target');
        targets.forEach(target => {
            const rect = target.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 150) {
                const tx = dx * 0.15;
                const ty = dy * 0.15;
                target.style.transform = `translate(${tx}px, ${ty}px)`;
            } else {
                target.style.transform = `translate(0, 0)`;
            }
        });
    });

    // --- Efecto de Scroll en Nav (Opacidad) ---
    const nav = document.querySelector('.apple-nav');
    window.addEventListener('scroll', () => {
        if (nav && window.scrollY > 20) {
            nav.style.backdropFilter = 'saturate(180%) blur(20px)';
            // El color de fondo se maneja por CSS variable en el nav
        }
    });

    // --- Manejo del Formulario de Contacto (Supabase Real) ---
    const contactForm = document.getElementById('apple-contact-form');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = contactForm?.querySelector('button[type="submit"]');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            const formData = new FormData(contactForm);
            const leadData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                interest: formData.get('interest'),
                message: formData.get('message'),
                gdpr_consent: formData.get('gdpr') === 'on'
            };

            try {
                if (typeof _supabase === 'undefined') {
                    throw new Error('Supabase no configurado.');
                }

                const { error } = await _supabase.from('leads').insert([leadData]);

                if (error) throw error;

                contactForm.style.transition = 'opacity 0.5s, transform 0.5s';
                contactForm.style.opacity = '0';
                contactForm.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    contactForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                    formSuccess.style.opacity = '0';
                    formSuccess.style.transform = 'translateY(10px)';
                    formSuccess.offsetHeight; 
                    formSuccess.style.transition = 'all 0.6s ease';
                    formSuccess.style.opacity = '1';
                    formSuccess.style.transform = 'translateY(0)';
                }, 500);

            } catch (error) {
                console.error(error);
                alert('Error enviando solicitud.');
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });
    }

    // --- Carga dinámica URL Calendario ---
    async function loadCalendarLink() {
        if (typeof _supabase === 'undefined') return;
        try {
            const { data, error } = await _supabase.from('site_settings').select('value').eq('key', 'calendar_url').single();
            if (data && data.value) {
                const calLinks = document.querySelectorAll('a[href="#"], a.agenda-card');
                calLinks.forEach(link => {
                    // Si el enlace tiene dentro el texto 'Videollamada' o 'Reserva'
                    if (link.innerText.includes('Videollamada') || link.innerText.includes('Reserva')) {
                        link.href = data.value;
                        link.target = '_blank'; // Abrir en pestaña nueva
                    }
                });
            }
        } catch (e) {
            console.log('Calendario no configurado.');
        }
    }
    loadCalendarLink();
});

// --- Inyección Dinámica de Códigos de Tracking ---
async function injectTrackingCodes() {
    if (typeof _supabase === 'undefined') return;
    try {
        const { data, error } = await _supabase.from('site_settings').select('key, value').in('key', [
            'tracking_google_head', 'tracking_google_body', 
            'tracking_meta_head', 'tracking_meta_body'
        ]);
        if (error) throw error;
        
        if (data) {
            data.forEach(setting => {
                if (!setting.value || setting.value.trim() === '') return;

                const template = document.createElement('template');
                template.innerHTML = setting.value.trim();

                const nodes = Array.from(template.content.childNodes);
                
                nodes.forEach(node => {
                    let targetElement = setting.key.includes('_head') ? document.head : document.body;
                    
                    if (node.tagName === 'SCRIPT') {
                        // Re-crear tag <script> para forzar su ejecución en el navegador
                        const newScript = document.createElement('script');
                        Array.from(node.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.text = node.text || node.innerHTML;
                        
                        if (setting.key.includes('_body')) {
                            targetElement.insertBefore(newScript, targetElement.firstChild);
                        } else {
                            targetElement.appendChild(newScript);
                        }
                    } else if (node.nodeType === 1) { // Elementos normales como <noscript>, <iframe>...
                        if (setting.key.includes('_body')) {
                            targetElement.insertBefore(node.cloneNode(true), targetElement.firstChild);
                        } else {
                            targetElement.appendChild(node.cloneNode(true));
                        }
                    }
                });
            });
        }
    } catch (e) {
        console.error('Error cargando tracking codes:', e);
    }
}
injectTrackingCodes();

// --- Inyección Dinámica de Metadatos SEO ---
async function injectSeoMetadata() {
    if (typeof _supabase === 'undefined') return;
    try {
        const { data, error } = await _supabase.from('site_settings').select('key, value').in('key', ['seo_title', 'seo_description']);
        if (error) throw error;
        
        if (data) {
            data.forEach(setting => {
                if (!setting.value || setting.value.trim() === '') return;

                if (setting.key === 'seo_title') {
                    document.title = setting.value;
                    // También actualizar OG:Title
                    const ogTitle = document.querySelector('meta[property="og:title"]');
                    if (ogTitle) ogTitle.setAttribute('content', setting.value);
                }
                
                if (setting.key === 'seo_description') {
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) metaDesc.setAttribute('content', setting.value);
                    
                    const ogDesc = document.querySelector('meta[property="og:description"]');
                    if (ogDesc) ogDesc.setAttribute('content', setting.value);
                }
            });
        }
    } catch (e) {
        console.error('Error cargando SEO dinámico:', e);
    }
}
injectSeoMetadata();
