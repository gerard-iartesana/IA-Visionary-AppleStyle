document.addEventListener('DOMContentLoaded', () => {
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
        if (window.scrollY > 20) {
            nav.style.background = 'rgba(0,0,0,0.85)';
        } else {
            nav.style.background = 'rgba(0,0,0,0.8)';
        }
    });

    // --- Manejo del Formulario de Contacto ---
    const contactForm = document.getElementById('apple-contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular animación de envío
            contactForm.style.transition = '0.4s';
            contactForm.style.opacity = '0';
            contactForm.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                contactForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
            }, 400);
        });
    }
});
