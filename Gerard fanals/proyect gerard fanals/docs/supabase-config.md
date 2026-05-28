# 🗄️ Supabase — Configuración del Proyecto

## Datos del Proyecto

| Campo | Valor |
|-------|-------|
| **Proyecto** | `gerard-fanals-web` |
| **Project ID** | `uidilhuybmtuokunutgz` |
| **URL** | `https://uidilhuybmtuokunutgz.supabase.co` |
| **Región** | EU West (Ireland) |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZGlsaHV5Ym10dW9rdW51dGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDU0NTAsImV4cCI6MjA5MTQyMTQ1MH0.ir9FnuHhW_1i4OslE_SNbOCIgLUEWakScP71WYqnfJM` |
| **Service Role Key** | ⚠️ PENDIENTE — Necesaria para el agente de IA |

---

## Autenticación

| Campo | Valor |
|-------|-------|
| **Email admin** | `gerard@iartesana.es` |
| **Password** | `admin2026` |
| **Método** | Supabase Auth (email/password) |

---

## Base de Datos — Tabla `articles`

### Estructura

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid (PK) | Auto-generado |
| `title` | text | Título del artículo |
| `slug` | text (unique) | URL amigable para SEO |
| `tag` | text | Categoría (ej: "Agentes IA") |
| `excerpt` | text | Resumen para SEO y tarjetas |
| `body` | text | Contenido HTML completo |
| `image` | text | Ruta de la imagen de cabecera |
| `read_time` | text | Ej: "5 min lectura" |
| `published` | boolean | `true` = visible en la web |
| `created_at` | timestamptz | Fecha de creación |
| `updated_at` | timestamptz | Última modificación |

### Políticas RLS

- **Lectura pública:** Cualquiera puede leer artículos con `published = true`
- **Escritura autenticada:** Solo usuarios autenticados pueden crear/editar/borrar

### SQL para recrear la tabla (si fuera necesario)

```sql
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tag TEXT DEFAULT 'General',
    excerpt TEXT,
    body TEXT,
    image TEXT,
    read_time TEXT DEFAULT '5 min lectura',
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can manage articles" ON articles
    FOR ALL USING (auth.role() = 'authenticated');
```

---

## Tablas futuras (preparadas)

- `projects` — Proyectos en marcha
- `leads` — Formulario de contacto
- `site_settings` — Configuraciones dinámicas
- `media` — Galería de imágenes
