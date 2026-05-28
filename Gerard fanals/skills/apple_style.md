---
name: Diseño Estilo Apple (Apple Style Design)
description: Guía de diseño, variables CSS y patrones para recrear el estilo visual tipo Apple utilizado en proyectos como IA de Barrio / IArtesana.
---

# 🍏 Diseño Estilo Apple

Este skill documenta los principios de diseño, la paleta de colores, la tipografía y los patrones de componentes para recrear una interfaz estilo Apple (similar a la usada en IA de Barrio y las propuestas de IArtesana).

## 1. Fundamentos del Diseño

- **Minimalismo y Espacio en Blanco:** Uso intensivo de márgenes y paddings considerables para dejar "respirar" el contenido.
- **Bordes Muy Redondeados:** Las tarjetas y botones utilizan radios de borde grandes (entre `20px` y `40px`).
- **Transiciones Suaves:** Las animaciones y hovers deben fluir orgánicamente aprovechando `cubic-bezier`.
- **Efecto Glassmorphism:** Uso estratégico de desenfoque (`backdrop-filter`) para barras de navegación o elementos flotantes superpuestos.
- **Soporte Nativo Dark/Light Mode:** La aplicación debe transicionar de forma amigable entre modos oscuros y claros usando variables CSS.

## 2. Tipografía

- **Fuente Principal:** `font-family: 'Inter', -apple-system, sans-serif;`
- **Suavizado:** Es esencial utilizar `-webkit-font-smoothing: antialiased;` para fuentes nítidas.
- **Títulos (Headings):** Fuente gruesa (`font-weight: 700`), tamaño muy grande en el Hero (hasta `5rem`) y un ligero ajuste en el tracking (`letter-spacing: -0.02em`).
- **Subtítulos y Texto Secundario:** Color gris contrastante (ej. `#86868b`) con un peso más ligero, ideal para explicaciones debajo de un gran título.

## 3. Variables CSS Base (Tokens)

Este es el bloque esencial a incluir dentro de `:root` y para modo oscuro con `[data-theme="dark"]`:

```css
:root {
    /* Modo Claro (Por Defecto) */
    --bg-body: #ffffff;
    --bg-secondary: #f5f5f7;
    --bg-card: #fbfbfd;
    --text-main: #1d1d1f;
    --text-grey: #86868b;
    --accent-blue: #0071e3;
    
    --border-radius-card: 28px;
    --nav-height: 48px;
    --nav-bg: rgba(255, 255, 255, 0.8);
    --border-color: rgba(0, 0, 0, 0.1);
    --card-border: rgba(0, 0, 0, 0.02);
    
    --btn-buy-bg: #1d1d1f;
    --btn-buy-text: #ffffff;
}

[data-theme="dark"] {
    /* Modo Oscuro */
    --bg-body: #000000;
    --bg-secondary: #1d1d1f;
    --bg-card: #1d1d1f;
    --text-main: #f5f5f7;
    --nav-bg: rgba(0, 0, 0, 0.8);
    --border-color: rgba(255, 255, 255, 0.1);
    --card-border: rgba(255, 255, 255, 0.05);
    
    --btn-buy-bg: #0071e3;
}
```

## 4. Componentes Clave

### A. Barra de Navegación (Apple Nav)
La barra superior clásica es estrecha, difuminada y transparente, que queda fija al hacer scroll.

```css
.apple-nav {
    position: fixed;
    top: 0;
    width: 100%;
    height: var(--nav-height);
    background: var(--nav-bg);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    z-index: 2000;
    border-bottom: 1px solid var(--border-color);
}
```

### B. Tarjetas (Cards)
El pilar de la maquetación. Dejan de lado el clásico formato cuadrado por cajas envolventes con `padding` interior amplio.

```css
.apple-card {
    background: var(--bg-secondary);
    border-radius: var(--border-radius-card); /* ej. 28px o 32px */
    padding: 30px;
    border: 1px solid var(--card-border);
    transition: transform 0.4s, background 0.5s ease;
}

.apple-card:hover { 
    transform: scale(1.02); 
    background: var(--bg-card); 
}
```

### C. Botones "Call to Action"
Cero bordes afilados. Forma en forma de cápsula (`pill-shape` o altamente redondeados).

```css
.btn-apple-primary {
    background: var(--accent-blue);
    color: white;
    padding: 14px 28px;
    border-radius: 40px;
    font-weight: 500;
    font-size: 1.1rem;
    border: none;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-apple-primary:hover {
    transform: scale(1.02);
}
```

## 5. Detalles Micro-interactivos
- Utiliza la variante de easing de Apple cuando sea apropiado: `cubic-bezier(0.28, 0.11, 0.32, 1)` para un movimiento "springy" (elástico suave).
- En el diseño oscuro, para destacar ciertas tarjetas (como el precio "Popular"), considera utilizar fondos sutiles con degradados de mínima opacidad: `linear-gradient(135deg, rgba(0,113,227,.15), rgba(175,82,222,.1))`.
