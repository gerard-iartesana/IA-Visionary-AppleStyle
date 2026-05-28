# 🌐 Arquitectura del Proyecto — gerardfanals.online

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Frontend** | HTML, CSS, JavaScript (vanilla) |
| **Hosting** | Vercel (GitHub auto-deploy) |
| **Base de datos** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth |
| **Dominio** | gerardfanals.online |
| **Repositorio** | github.com/gerard-iartesana/gerard-fanals-web |
| **Diseño** | Apple-style minimalista |

---

## Estructura de archivos

```
gerard-fanals-web/
├── index.html          → Página principal (hero, historial, conocimientos, noticias)
├── blog.html           → Listado de todos los artículos
├── articulo.html       → Plantilla dinámica para artículo individual
├── admin.html          → Dashboard de administración
├── privacidad.html     → Política de privacidad
├── cookies.html        → Política de cookies
├── terminos.html       → Términos y condiciones
├── style.css           → Estilos globales (temas light/dark)
├── script.js           → Lógica compartida (tema, menú, noticias)
├── supabase-client.js  → Configuración del cliente Supabase
├── articles-data.js    → Fallback local de artículos
├── img/                → Imágenes (perfil, blog headers)
└── docs/               → Documentación del proyecto
    ├── supabase-config.md    → Configuración de Supabase
    ├── agent-api-guide.md    → Guía para el agente de IA
    └── architecture.md       → Este archivo
```

---

## Flujo de datos

```
                    ┌──────────────┐
                    │   Supabase   │
                    │  (articles)  │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼────┐  ┌──────▼──────┐
     │  index.html │ │blog.html│  │articulo.html│
     │ (3 últimas) │ │ (todas) │  │ (por slug)  │
     └─────────────┘ └─────────┘  └─────────────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    (si falla Supabase)
                           │
                  ┌────────▼────────┐
                  │articles-data.js │
                  │   (fallback)    │
                  └─────────────────┘
```

---

## Flujo del agente de IA

```
  ┌──────────────┐     POST /rest/v1/articles      ┌──────────────┐
  │ Agente de IA │ ──────────────────────────────▶  │   Supabase   │
  │ (Relevance)  │  (service_role key bypass RLS)   │  (articles)  │
  └──────────────┘                                  └──────┬───────┘
                                                           │
                                                    Auto-visible en
                                                           │
                                              ┌────────────┼────────────┐
                                              │            │            │
                                        gerardfanals.online/blog
                                        gerardfanals.online (preview)
                                        gerardfanals.online/articulo?slug=...
```

---

## Credenciales y accesos

| Recurso | Acceso |
|---------|--------|
| **Dashboard web** | gerardfanals.online/admin.html |
| **Login** | gerard@iartesana.es / admin2026 |
| **Supabase Dashboard** | app.supabase.com → proyecto gerard-fanals-web |
| **GitHub** | github.com/gerard-iartesana/gerard-fanals-web |
| **Vercel** | Auto-deploy desde GitHub (rama main) |

---

## Roadmap

- [x] Landing page Apple-style
- [x] Blog con artículos dinámicos
- [x] Dashboard de administración
- [x] Integración Supabase (auth + articles)
- [x] Menú hamburguesa móvil
- [x] Tarjeta de perfil invertida (light/dark)
- [ ] Service Role Key para agente de IA
- [ ] Agente de IA (Relevance) para publicación automática
- [ ] SEO dinámico (meta tags por artículo)
- [ ] Google Analytics 4
- [ ] Meta Pixel
- [ ] Formulario de contacto → Supabase leads
- [ ] Storage de Supabase para imágenes del blog
