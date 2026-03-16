document.addEventListener('DOMContentLoaded', () => {
    // --- Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    // --- Magnetic Effect ---
    document.addEventListener('mousemove', (e) => {
        const targets = document.querySelectorAll('.magnetic-target');
        targets.forEach(target => {
            const rect = target.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < 150) {
                const moveX = distanceX * 0.25;
                const moveY = distanceY * 0.25;
                target.style.transform = `translate(${moveX}px, ${moveY}px)`;
            } else {
                target.style.transform = `translate(0px, 0px)`;
            }
        });
    });

    // --- Interactive Mesh Logic ---
    const mesh = document.getElementById('mesh-bg');
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        mesh.style.background = `radial-gradient(circle at ${x}% ${y}%, #1a1e4d 0%, #0a0b1e 80%)`;
    });
});
