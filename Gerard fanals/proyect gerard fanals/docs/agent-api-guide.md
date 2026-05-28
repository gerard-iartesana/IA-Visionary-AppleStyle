# 🤖 Guía para el Agente de IA — Publicación Automática de Artículos

## Resumen

Este documento contiene toda la información necesaria para configurar un agente de IA 
(Relevance AI, n8n, Make, o cualquier otro) que publique artículos automáticamente en 
la web gerardfanals.online.

Los artículos se almacenan en Supabase y la web los carga dinámicamente.

---

## Endpoint de la API

```
POST https://uidilhuybmtuokunutgz.supabase.co/rest/v1/articles
```

---

## Headers necesarios

```http
apikey: [SERVICE_ROLE_KEY]
Authorization: Bearer [SERVICE_ROLE_KEY]
Content-Type: application/json
Prefer: return=representation
```

> ⚠️ **IMPORTANTE:** Usar la `service_role` key (NO la anon key).
> La service_role key bypasa las políticas RLS y permite insertar sin autenticación.
> Obtenerla en: Supabase → Settings → API → service_role (secret)

---

## Body del Request (JSON)

```json
{
    "title": "Título del artículo",
    "slug": "titulo-del-articulo",
    "tag": "Agentes IA",
    "excerpt": "Resumen corto para SEO y vista previa (máx 160 caracteres)",
    "body": "<p>Contenido HTML completo del artículo...</p>",
    "image": "img/blog-1.png",
    "read_time": "5 min lectura",
    "published": true
}
```

### Campos obligatorios
- `title` — Título del artículo
- `slug` — URL amigable (sin acentos, en minúsculas, separado por guiones)
- `body` — Contenido en HTML

### Campos opcionales (tienen valores por defecto)
- `tag` → Default: "General"
- `excerpt` → Recomendado para SEO
- `image` → Default: sin imagen. Usar rutas como "img/blog-1.png" a "img/blog-6.png"
- `read_time` → Default: "5 min lectura"
- `published` → Default: `false` (borrador). Poner `true` para publicar inmediatamente

---

## Cómo generar el Slug

El slug se genera a partir del título eliminando:
- Acentos y caracteres especiales
- Espacios (reemplazados por `-`)
- Mayúsculas (todo en minúsculas)

**Ejemplo:**
- Título: "Cómo la IA está transformando las PYMEs en 2026"
- Slug: `como-la-ia-esta-transformando-las-pymes-en-2026`

---

## Ejemplo completo con cURL

```bash
curl -X POST "https://uidilhuybmtuokunutgz.supabase.co/rest/v1/articles" \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "5 formas en que la IA está revolucionando el sector inmobiliario",
    "slug": "5-formas-ia-sector-inmobiliario",
    "tag": "Inmobiliario",
    "excerpt": "Descubre cómo la inteligencia artificial está cambiando la compra-venta de propiedades.",
    "body": "<p>La inteligencia artificial está transformando el sector inmobiliario...</p><h2>1. Valoraciones automáticas</h2><p>Los modelos de IA pueden analizar...</p>",
    "image": "img/blog-1.png",
    "read_time": "6 min lectura",
    "published": true
  }'
```

---

## Otras operaciones de la API

### Listar todos los artículos publicados
```
GET https://uidilhuybmtuokunutgz.supabase.co/rest/v1/articles?published=eq.true&order=created_at.desc
Headers: apikey, Authorization
```

### Actualizar un artículo
```
PATCH https://uidilhuybmtuokunutgz.supabase.co/rest/v1/articles?id=eq.[UUID]
Headers: apikey, Authorization, Content-Type
Body: { "title": "Nuevo título", "published": false }
```

### Eliminar un artículo
```
DELETE https://uidilhuybmtuokunutgz.supabase.co/rest/v1/articles?id=eq.[UUID]
Headers: apikey, Authorization
```

---

## Imágenes disponibles para artículos

Las siguientes imágenes están disponibles en el servidor:

| Ruta | Tema |
|------|------|
| `img/blog-1.png` | Agentes de IA |
| `img/blog-2.png` | Automatización / n8n |
| `img/blog-3.png` | Marketing IA |
| `img/blog-4.png` | Voice AI |
| `img/blog-5.png` | MCP Protocol |
| `img/blog-6.png` | Vibe Coding |

> Si el agente genera artículos de otros temas, puede reutilizar cualquiera de estas imágenes
> o dejar el campo `image` vacío (no se mostrará imagen de cabecera).

---

## Configuración en Relevance AI

### Como Tool (API Call)
1. Crear un nuevo Tool de tipo "API Request"
2. Method: POST
3. URL: `https://uidilhuybmtuokunutgz.supabase.co/rest/v1/articles`
4. Headers: Configurar apikey y Authorization con la service_role key
5. Body: Template JSON con variables para title, slug, tag, excerpt, body, etc.

### Prompt sugerido para el agente
```
Eres un redactor experto en tecnología e inteligencia artificial.
Tu trabajo es crear artículos de blog optimizados para SEO sobre IA, 
automatización, y transformación digital.

Al crear un artículo debes:
1. Escribir un título atractivo y optimizado para SEO
2. Generar un slug a partir del título (sin acentos, en minúsculas, separado por guiones)
3. Elegir una categoría relevante (tag)
4. Escribir un extracto de máximo 160 caracteres para SEO
5. Crear el contenido completo en HTML con etiquetas <p>, <h2>, <h3>, <ul>, <li>, <strong>
6. Estimar el tiempo de lectura
7. Publicar usando la herramienta de API

El tono debe ser profesional pero accesible, dirigido a empresarios y profesionales
que quieren entender cómo la IA puede mejorar sus negocios.
```

---

## Notas importantes

- El `slug` debe ser único. Si se intenta insertar un slug duplicado, dará error.
- Los artículos con `published: false` NO aparecen en la web pero sí en el Dashboard.
- La web tiene fallback a datos locales si Supabase no está disponible.
- El Dashboard (admin.html) permite gestionar artículos manualmente además del agente.
