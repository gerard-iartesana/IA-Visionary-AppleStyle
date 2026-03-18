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

    // --- Carga dinámica URL Calendario y WhatsApp ---
    async function loadDynamicLinks() {
        if (typeof _supabase === 'undefined') return;
        
        try {
            // 1. Cargar Calendario de Supabase
            const { data, error } = await _supabase.from('site_settings').select('value').eq('key', 'calendar_url').single();
            const calendarUrl = (data && data.value) ? data.value : 'https://calendar.app.google/QMiJY3UbKChYgEcu6';

            const forceLink = (el, url) => {
                if (!el) return;
                el.href = url;
                el.target = '_blank';
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Detener el "bucle" o scroll suave
                    window.open(url, '_blank');
                });
            };

            // Botón HERO
            forceLink(document.getElementById('btn-hero-audit'), calendarUrl);

            // Botón Videollamada
            forceLink(document.getElementById('btn-contact-video'), calendarUrl);

            // 2. Configurar WhatsApp (Número: 629494167)
            const waBtn = document.getElementById('btn-contact-whatsapp');
            if (waBtn) {
                const waUrl = 'https://wa.me/34629494167?text=Hola!%20Me%20gustaría%20saber%20más%20sobre%20IA%20de%20Barrio';
                waBtn.href = waUrl;
                waBtn.target = '_blank';
            }

            // 3. Cargar Links de Pago de Stripe
            const { data: payData, error: payError } = await _supabase.from('site_settings').select('key, value').in('key', [
                'stripe_link_puntual', 'stripe_link_auditoria', 'stripe_link_mensual'
            ]);

            if (payData) {
                payData.forEach(setting => {
                    let btnId = '', planName = '', price = '';
                    if (setting.key === 'stripe_link_puntual') { btnId = 'btn-buy-puntual'; planName = 'Sesión Puntual'; price = '159€'; }
                    if (setting.key === 'stripe_link_auditoria') { btnId = 'btn-buy-auditoria'; planName = 'Auditoría IA'; price = '359€'; }
                    if (setting.key === 'stripe_link_mensual') { btnId = 'btn-buy-mensual'; planName = 'Plan Mensual'; price = '250€'; }

                    const btn = document.getElementById(btnId);
                    if (btn && setting.value) {
                        btn.onclick = (e) => {
                            e.preventDefault();
                            // Ahora el botón principal abre el Checkout Visualmente Brutal (API Prototype)
                            // Y le pasamos el link real de Stripe como "fallback"
                            openPremiumCheckout(planName, price, setting.value);
                        };
                    }
                });
            }

            // 4. Cargar Link de Revolut
            const { data: revData } = await _supabase.from('site_settings').select('value').eq('key', 'revolut_link').single();
            if (revData && revData.value) {
                const revolutLinks = document.querySelectorAll('.revolut-alt-link');
                revolutLinks.forEach(link => {
                    link.classList.remove('hidden');
                    link.href = revData.value;
                    link.target = '_blank';
                });
            }

        } catch (e) {
            console.log('Error configurando enlaces dinámicos:', e);
        }
    }
    loadDynamicLinks();
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

// --- REAL STRIPE INTEGRATION (CLASE 8) ---
let stripe = null;
let elements;
let cardElement;
let currentCheckoutUrl = ''; 
let currentPlanAmount = 0;
let currentPlanName = '';
let expressCheckoutElement;

// Función para cerrar el modal (DISPONIBLE GLOBALMENTE)
window.closeCheckout = function() {
    const modal = document.getElementById('checkout-premium');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

function initStripe() {
    if (stripe) return true; // Ya inicializado
    if (typeof Stripe !== 'undefined') {
        stripe = Stripe('pk_test_51TCMDoKthauSWpyv2Ngs3LZGkjOvrJYpXGneocuANnmmsog22oJnv1UaKZuHqs1L8jIph3eppRWD0PUJfvct0s4c005lPPk8Ps');
        
        // Crear elementos con opciones refinadas
        elements = stripe.elements({
            appearance: {
                theme: 'flat', // Tema claro para fondo blanco
                variables: { 
                    colorPrimary: '#0071e3', 
                    colorBackground: '#ffffff', 
                    colorText: '#1d1d1f' 
                }
            }
        });

        // Crear el elemento de tarjeta
        cardElement = elements.create('card', {
            hidePostalCode: true,
            style: {
                base: {
                    fontSize: '16px',
                    color: '#1d1d1f',
                    '::placeholder': { color: '#86868b' },
                }
            }
        });

        // Crear elemento de pago rápido (Google/Apple Pay y Link)
        expressCheckoutElement = elements.create('expressCheckout', {
            buttonType: { applePay: 'buy', googlePay: 'buy' }
        });
        return true;
    }
    return false;
}

function openPremiumCheckout(planName, price, fallbackUrl) {
    const modal = document.getElementById('checkout-premium');
    if (!modal) return;

    // Intentar inicializar Stripe si no lo estaba
    const isReady = initStripe();
    if (!isReady) {
        console.error('Stripe SDK not loaded yet.');
    }

    currentCheckoutUrl = fallbackUrl;
    currentPlanName = planName;
    
    // Calcular el precio base y el IVA (21%)
    const baseAmount = parseInt(price.replace(/[^0-9]/g, ''));
    const totalAmount = (baseAmount * 1.21).toFixed(2); // Total con IVA
    currentPlanAmount = Math.round(baseAmount * 100); // Monto base en céntimos para el backend

    document.getElementById('checkout-plan-name').innerText = planName;
    document.getElementById('checkout-plan-price').innerHTML = `${totalAmount}€ <br><span style="font-size: 0.65rem; font-weight: 400; opacity: 0.6;">(IVA incl.)</span>`;
    
    const fallbackLink = document.getElementById('checkout-fallback-link');
    if (fallbackLink) fallbackLink.href = fallbackUrl;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Montar el campo de tarjeta real de Stripe
    setTimeout(() => {
        if (cardElement) {
            document.getElementById('card-element').innerHTML = '';
            cardElement.mount('#card-element');
        }
        
        // Montar el Botón de Pago Rápido al final
        if (expressCheckoutElement) {
            const container = document.getElementById('stripe-link-container');
            if (container) {
                container.style.display = 'block';
                document.getElementById('stripe-link-container').innerHTML = '';
                expressCheckoutElement.mount('#stripe-link-container');
            }
        }
    }, 200);
}

async function processMockPayment() {
    const btn = document.querySelector('.checkout-btn-primary');
    const errorDiv = document.getElementById('card-errors');
    const box = document.querySelector('.checkout-box');
    
    // Limpiar errores previos
    if (errorDiv) errorDiv.textContent = '';
    
    btn.innerText = 'Procesando pago seguro...';
    btn.disabled = true;

    try {
        // 1. Llamada Real a tu Backend en Supabase para crear el Intento de Pago
        // Esto le dice a Stripe de forma segura: "Prepárame el cobro de X plan"
        const { data, error } = await _supabase.functions.invoke('create-payment-intent', {
            body: { amount: currentPlanAmount, plan: currentPlanName }
        });

        if (error) {
            console.error('Error en Supabase Function:', error);
            throw new Error('No se pudo iniciar el pago. Revisa la configuración de tu Edge Function.');
        }

        const clientSecret = data.clientSecret;

        // 2. Confirmación del Pago con los datos de la tarjeta (Stripe Elements)
        // Esta parte es ultra-segura: los datos nunca tocan tu servidor directamente
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: 'Cliente IA de Barrio', // Opcional: podrías pedir el nombre en el modal
                }
            }
        });

        if (result.error) {
            // Mostrar error al cliente (ej: tarjeta rechazada)
            throw new Error(result.error.message);
        } else {
            // 3. ¡ÉXITO TOTAL! El pago ha sido procesado por Stripe
            if (result.paymentIntent.status === 'succeeded') {
                box.innerHTML = `
                    <div style="text-align: center; padding: 40px 0; animation: fadeIn 0.8s ease-out;">
                        <div style="width: 80px; height: 80px; background: #34c759; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 10px 30px rgba(52, 199, 89, 0.4);">
                            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #1d1d1f;">¡Pago Confirmado!</h2>
                        <p style="color: #86868b; line-height: 1.6; margin-bottom: 30px;">
                            Se ha procesado tu suscripción a <b>${currentPlanName}</b> correctamente.<br>
                            Recibirás el recibo de Stripe en tu email en unos segundos.
                        </p>
                        <button class="checkout-btn-primary" onclick="window.location.reload();" style="background: #0071e3; color: white;">
                            Finalizar y volver
                        </button>
                    </div>
                `;
            }
        }

    } catch (e) {
        console.error('Error en el proceso de pago:', e);
        if (errorDiv) errorDiv.textContent = e.message;
        btn.innerText = 'Reintentar pago';
        btn.disabled = false;
    }
}

// Vinculación opcional de los botones actuales al prototipo premium (Demo Mode)
// Para activar el modo premium por defecto en los botones de compra:
/* 
document.getElementById('btn-buy-puntual').onclick = (e) => { e.preventDefault(); openPremiumCheckout('Sesión Puntual', '159€'); };
document.getElementById('btn-buy-auditoria').onclick = (e) => { e.preventDefault(); openPremiumCheckout('Auditoría IA', '359€'); };
document.getElementById('btn-buy-mensual').onclick = (e) => { e.preventDefault(); openPremiumCheckout('Plan Mensual', '250€'); };
*/
