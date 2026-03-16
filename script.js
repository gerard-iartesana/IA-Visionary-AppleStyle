const components = {
    bento: {
        title: "Bento Grid Layout",
        desc: "Estructura moderna inspirada en interfaces de alto rendimiento.",
        tpl: `
            <div class="bento-grid">
                <div class="bento-item tall"><h3>Analytics</h3></div>
                <div class="bento-item wide"><h3>Quick Actions</h3></div>
                <div class="bento-item"><h3>Status</h3></div>
                <div class="bento-item"><h3>Users</h3></div>
                <div class="bento-item"><h3>Reports</h3></div>
            </div>
        `
    },
    'glow-card': {
        title: "Glow Cards",
        desc: "Tarjetas con efectos de iluminación dinámica que siguen el cursor.",
        tpl: `
            <div class="glow-card-demo">
                <div class="glow-card" style="display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem;">
                    <h3>Crystal Card</h3>
                    <p style="color: grey; font-size: 0.9rem;">Interactúa conmigo</p>
                </div>
                <div class="glow-card" style="display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem; border-color: var(--accent-cyan);">
                    <h3>Neon Flare</h3>
                    <p style="color: grey; font-size: 0.9rem;">Efecto de luz activa</p>
                </div>
            </div>
        `
    },
    'gradient-text': {
        title: "Animated Gradient Text",
        desc: "Tipografía con degradados vivos y suaves transiciones de color.",
        tpl: `
            <div style="height: 300px; display: flex; align-items: center; justify-content: center;">
                <h1 style="font-size: 5rem; background: linear-gradient(90deg, #00f2ff, #7000ff, #00f2ff); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradMove 3s linear infinite;">
                    Tachyon Star
                </h1>
            </div>
            <style>
                @keyframes gradMove { to { background-position: 200% center; } }
            </style>
        `
    },
    'floating-nav': {
        title: "Floating Glass Navigation",
        desc: "Menú persistente con desenfoque de fondo y bordes de cristal.",
        tpl: `
            <div style="height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80'); background-size: cover; border-radius: 24px; position: relative; overflow: hidden;">
                <nav style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem 2rem; border-radius: 50px; display: flex; gap: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <span style="cursor: pointer; font-weight: 500;">Inico</span>
                    <span style="cursor: pointer; font-weight: 500; color: var(--accent-cyan);">Explorar</span>
                    <span style="cursor: pointer; font-weight: 500;">Nosotros</span>
                    <span style="cursor: pointer; font-weight: 500;">Contacto</span>
                </nav>
                <p style="margin-top: 2rem; color: white; text-shadow: 0 2px 10px black;">Vista previa sobre fondo complejo</p>
            </div>
        `
    },
    'starfield': {
        title: "Magic Starfield",
        desc: "Fondo de partículas interactivas que otorga profundidad espacial.",
        tpl: `
            <div id="starfield-preview" style="height: 400px; background: #000; border-radius: 24px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <h3 style="position: relative; z-index: 2; font-size: 2rem;">Experiencia Inmersiva</h3>
                <canvas id="preview-stars" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1;"></canvas>
            </div>
        `
    },
    'magnetic': {
        title: "Magnetic Action",
        desc: "Botones que atraen al cursor, mejorando la sensación táctil digital.",
        tpl: `
            <div style="height: 300px; display: flex; gap: 4rem; align-items: center; justify-content: center;">
                <div class="magnetic-wrap">
                    <button class="btn-premium magnetic-target" style="padding: 30px 60px; font-size: 1.2rem;">Únete ahora</button>
                </div>
                <div class="magnetic-wrap">
                    <button class="btn-premium magnetic-target" style="padding: 30px 60px; font-size: 1.2rem; background: transparent; border: 1px solid white; color: white;">Explorar</button>
                </div>
            </div>
        `
    },
    'scroll-reveal': {
        title: "Scroll Reveal Animations",
        desc: "Elementos que aparecen con fluidez al entrar en el campo de visión.",
        tpl: `
            <div id="scroll-demo" style="height: 500px; overflow-y: scroll; padding: 2rem; background: rgba(0,0,0,0.2); border-radius: 20px;">
                <p style="margin-bottom: 300px; color: grey;">Haz scroll hacia abajo...</p>
                <div class="reveal-item" style="padding: 3rem; background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border-glass); text-align: center; transform: translateY(50px); opacity: 0; transition: all 1s ease-out;">
                    <h3 style="color: var(--accent-cyan); font-size: 2rem;">¡Sorpresa!</h3>
                    <p>Aparezco suavemente gracias a IntersectionObserver.</p>
                </div>
                <div style="height: 200px;"></div>
            </div>
        `
    },
    'parallax': {
        title: "3D Parallax Depth",
        desc: "Capas que se mueven a diferentes velocidades para crear profundidad.",
        tpl: `
            <div id="parallax-area" style="height: 400px; background: #080808; border-radius: 24px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: move;">
                <div class="parallax-layer" data-speed="2" style="position: absolute; width: 120%; height: 120%; background: radial-gradient(circle, rgba(112,0,255,0.1) 0%, transparent 70%);"></div>
                <div class="parallax-layer" data-speed="5" style="position: absolute; width: 100%; height: 100%; border: 2px dashed rgba(0,242,255,0.05); border-radius: 50%;"></div>
                <h2 class="parallax-layer" data-speed="10" style="position: relative; font-size: 4rem; text-shadow: 0 10px 30px rgba(0,0,0,0.5);">PROFUNDIDAD</h2>
            </div>
        `
    },
    'loader': {
        title: "Brand Loader Transitions",
        desc: "Secuencia de entrada elegante que mejora la percepción de marca.",
        tpl: `
            <div style="height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;">
                <button class="btn-premium" onclick="triggerLoaderDemo()">Ejecutar Animación de Carga</button>
                <div id="loader-preview-container" style="display: none; align-items: center; justify-content: center; flex-direction: column;">
                    <div class="loader-ring" style="width: 60px; height: 60px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent-cyan); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="margin-top: 1rem; font-family: 'Outfit'; letter-spacing: 4px; overflow: hidden; white-space: nowrap; border-right: 2px solid var(--accent-cyan); animation: typing 2.5s steps(10, end), blink-caret .75s step-end infinite;">TACHYON...</p>
                </div>
            </div>
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes typing { from { width: 0 } to { width: 100% } }
                @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: var(--accent-cyan) } }
            </style>
        `
    },
    'fluid-type': {
        title: "Fluid Typography",
        desc: "Tipografía que se adapta perfectamente a cualquier tamaño de pantalla sin saltos.",
        tpl: `
            <div style="padding: 2rem; background: var(--bg-card); border-radius: 24px;">
                <h1 style="font-size: clamp(2rem, 8vw, 6rem); line-height: 1; margin-bottom: 2rem;">Responsividad Dinámica</h1>
                <p style="font-size: clamp(1rem, 2vw, 1.5rem); color: var(--text-dim);">
                    Esta tipografía utiliza la función CSS <code>clamp()</code> para escalar entre un mínimo y un máximo basado en el viewport. 
                    Redimensiona el contenedor para ver el efecto.
                </p>
            </div>
        `
    }
};

// --- Sistema de Parallax ---
function initParallax() {
    const area = document.getElementById('parallax-area');
    if (!area) return;
    area.addEventListener('mousemove', (e) => {
        const layers = area.querySelectorAll('.parallax-layer');
        const rect = area.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        layers.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            const xOffset = x / speed;
            const yOffset = y / speed;
            layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
}

// --- Sistema de Scroll Reveal ---
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
}

// --- Trigger Loader Demo ---
window.triggerLoaderDemo = () => {
    const container = document.getElementById('loader-preview-container');
    container.style.display = 'flex';
    setTimeout(() => {
        container.style.display = 'none';
        alert('Carga completada. El contenido aparecería aquí con un fundido a negro suave.');
    }, 3000);
};

// --- Sistema de Partículas ---
function initStarfield(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random();
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

document.addEventListener('DOMContentLoaded', () => {
    const componentItems = document.querySelectorAll('.nav-menu li');
    const demoArea = document.getElementById('demo-area');
    const demoTitle = document.getElementById('demo-title');
    const demoDesc = document.getElementById('demo-desc');

    componentItems.forEach(item => {
        item.addEventListener('click', () => {
            const componentKey = item.getAttribute('data-component');
            const data = components[componentKey];

            if (data) {
                // Actualizar UI
                componentItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Cambiar contenido con una pequeña transición
                demoArea.style.opacity = '0';
                setTimeout(() => {
                    demoTitle.innerText = data.title;
                    demoDesc.innerText = data.desc;
                    demoArea.innerHTML = data.tpl;
                    demoArea.style.opacity = '1';

                    // Inicializar efectos específicos si se cargan
                    if (componentKey === 'starfield') initStarfield('preview-stars');
                    if (componentKey === 'parallax') initParallax();
                    if (componentKey === 'scroll-reveal') initScrollReveal();
                }, 200);
            } else {
                alert('Este componente se implementará a continuación en la Clase 2.');
            }
        });
    });

    // --- Lógica Magnética ---
    document.addEventListener('mousemove', (e) => {
        const magneticTargets = document.querySelectorAll('.magnetic-target');
        magneticTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < 100) {
                const moveX = distanceX * 0.3;
                const moveY = distanceY * 0.3;
                target.style.transform = `translate(${moveX}px, ${moveY}px)`;
            } else {
                target.style.transform = `translate(0px, 0px)`;
            }
        });

        // Glow cards logic
        const cards = document.querySelectorAll('.glow-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
