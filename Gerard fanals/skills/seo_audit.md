# SEO Audit Skill — Gerard Fanals Web

## Objetivo
Realizar una auditoría SEO completa del sitio gerardfanals.online analizando todos los archivos del proyecto y aplicando fixes directamente.

## Repositorio
`/Users/gerard/Documents/GitHub/trabajos-antigravity-2026/gerard-fanals-web/`

## Instrucciones

### 1. Análisis de archivos
Lee TODOS los archivos HTML del proyecto:
- `index.html` (Homepage)
- `blog.html` (Blog / Noticias)
- `articulo.html` (Plantilla de artículo individual)
- `privacidad.html`, `cookies.html`, `terminos.html` (Legal)
- NO auditar `admin.html` (no es público)

También verifica la existencia de:
- `robots.txt`
- `sitemap.xml`

### 2. Checklist SEO a verificar

Para cada página pública:

#### Meta Tags
- [ ] `<title>` presente y único (máx 60 chars)
- [ ] `<meta name="description">` presente (150-160 chars)
- [ ] `<meta name="viewport">` presente
- [ ] `<link rel="canonical">` presente
- [ ] NO hay tags duplicados (especialmente OG — el sistema de auto-fix anterior los duplicaba)

#### Open Graph & Social
- [ ] `og:title`, `og:description`, `og:image`, `og:url`, `og:type` presentes
- [ ] Twitter Card tags (card, title, description, image)
- [ ] Sin duplicados

#### Estructura de Encabezados
- [ ] Solo 1 `<h1>` por página
- [ ] Jerarquía correcta (h1 → h2 → h3, sin saltos)
- [ ] Contenido descriptivo en los encabezados

#### Rendimiento
- [ ] Imágenes con `alt` descriptivo
- [ ] Imágenes con `loading="lazy"` (EXCEPTO above the fold / hero)
- [ ] CSS/JS minificado o optimizado
- [ ] Fuentes con `display=swap`

#### SEO Técnico
- [ ] `robots.txt` existe y bloquea admin.html
- [ ] `sitemap.xml` existe y lista todas las páginas públicas
- [ ] Enlaces internos entre páginas
- [ ] No hay enlaces rotos (href="#" vacíos)
- [ ] Semantic HTML (header, nav, main, footer, section, article)
- [ ] `lang="es"` en `<html>`

#### Datos Estructurados
- [ ] JSON-LD schema en index.html (Person)
- [ ] JSON-LD schema en articulo.html (Article — dinámico)

#### Contenido
- [ ] Texto suficiente en cada página
- [ ] Palabras clave naturales
- [ ] Sin contenido duplicado entre páginas

### 3. Formato de salida
Genera un artifact con:
1. **Puntuación** por categoría (0-100)
2. **Problemas encontrados** con prioridad (🔴 Alta / 🟡 Media / 🟢 Baja)
3. **Para cada problema**: archivo, línea, código actual, código corregido
4. **Pregunta al usuario** qué fixes quiere aplicar

### 4. Aplicar fixes
- Editar los archivos DIRECTAMENTE con las herramientas de edición
- Hacer git commit y push al finalizar
- NO usar Supabase, GitHub API, ni procesos intermedios
- NO duplicar tags existentes — siempre verificar primero

### 5. Errores conocidos a evitar
- ⚠️ El sistema de auto-fix del dashboard duplicó tags OG en el pasado
- ⚠️ No poner `loading="lazy"` en imágenes del hero (above the fold)
- ⚠️ No quitar CSS/JS/GA al reorganizar el `<head>`
