-- ===================================================
-- Tabla de artículos para Newsletter / Blog
-- Ejecutar en Supabase SQL Editor
-- ===================================================

CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    category TEXT NOT NULL DEFAULT 'ia',
    status TEXT NOT NULL DEFAULT 'borrador',
    image_url TEXT,
    alt_text TEXT,
    author TEXT DEFAULT 'Gerard · IA de Barrio',
    read_time TEXT DEFAULT '5 min',
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- RLS (Row Level Security)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (solo artículos publicados)
CREATE POLICY "Artículos publicados son visibles públicamente"
    ON articles FOR SELECT
    USING (status = 'publicado');

-- Política de escritura para usuarios autenticados
CREATE POLICY "Usuarios auth pueden insertar artículos"
    ON articles FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios auth pueden actualizar artículos"
    ON articles FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios auth pueden eliminar artículos"
    ON articles FOR DELETE
    TO authenticated
    USING (true);

-- Política para que auth pueda leer TODOS los artículos (incl. borradores)
CREATE POLICY "Usuarios auth pueden ver todos los artículos"
    ON articles FOR SELECT
    TO authenticated
    USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- Insertar los 6 artículos existentes (hardcodeados)
-- ===================================================
INSERT INTO articles (title, subtitle, slug, category, status, image_url, author, read_time, meta_title, meta_description, published_at, content) VALUES
(
    'GPT-5: Lo que sabemos y cómo afectará a tu negocio',
    'OpenAI prepara su modelo más avanzado. Analizamos qué cambiará para las empresas que ya usan IA y las que aún no han empezado.',
    'gpt5-futuro-negocio',
    'ia',
    'publicado',
    'img/newsletter/gpt5-futuro-ia.png',
    'Gerard · IA de Barrio',
    '5 min',
    'GPT-5: Lo que sabemos y cómo afectará a tu negocio | IA de Barrio',
    'Análisis completo sobre GPT-5 y su impacto en los negocios.',
    '2026-03-28T10:00:00Z',
    NULL
),
(
    '5 automatizaciones que toda PYME debería tener en 2026',
    'Las empresas que automatizan procesos crecen un 40% más rápido. Descubre las 5 automatizaciones esenciales para cualquier negocio.',
    'automatizaciones-pyme-2026',
    'negocio',
    'publicado',
    'img/newsletter/automatizaciones-pyme.png',
    'Gerard · IA de Barrio',
    '7 min',
    '5 automatizaciones que toda PYME debería tener en 2026 | IA de Barrio',
    'Las 5 automatizaciones esenciales para PYMEs en 2026.',
    '2026-03-25T10:00:00Z',
    NULL
),
(
    'Cómo crear tu primer flujo de trabajo en n8n paso a paso',
    'Una guía completa para principiantes: conecta Gmail, OpenAI y Slack en menos de 30 minutos con n8n.',
    'tutorial-n8n-paso-a-paso',
    'tutorial',
    'publicado',
    'img/newsletter/tutorial-n8n.png',
    'Gerard · IA de Barrio',
    '10 min',
    'Tutorial n8n: crea tu primer flujo de automatización | IA de Barrio',
    'Guía paso a paso para crear flujos de trabajo con n8n.',
    '2026-03-22T10:00:00Z',
    NULL
),
(
    'La UE aprueba nuevas normas de IA: qué implica para tu empresa',
    'El AI Act europeo entra en vigor. Te explicamos qué requisitos deberás cumplir y cómo prepararte antes de la fecha límite.',
    'ue-normas-ia-empresa',
    'noticia',
    'publicado',
    'img/newsletter/eu-ai-act.png',
    'Gerard · IA de Barrio',
    '6 min',
    'AI Act UE: nuevas normas de IA para empresas | IA de Barrio',
    'Todo sobre el AI Act europeo y sus implicaciones empresariales.',
    '2026-03-20T10:00:00Z',
    NULL
),
(
    'Agentes autónomos: la próxima revolución en productividad empresarial',
    'Los agentes de IA ya no solo responden preguntas — ejecutan tareas complejas de forma autónoma. Así los estamos implementando.',
    'agentes-autonomos-productividad',
    'ia',
    'publicado',
    'img/newsletter/agentes-autonomos.png',
    'Gerard · IA de Barrio',
    '8 min',
    'Agentes autónomos de IA: la revolución empresarial | IA de Barrio',
    'Cómo los agentes autónomos están transformando la productividad.',
    '2026-03-18T10:00:00Z',
    NULL
),
(
    'Cómo medir el ROI de la IA en tu negocio: métricas que importan',
    'No basta con implementar IA — hay que medir su impacto. Te mostramos las 7 métricas clave que usamos con nuestros clientes.',
    'roi-ia-metricas-negocio',
    'negocio',
    'publicado',
    'img/newsletter/roi-ia-metricas.png',
    'Gerard · IA de Barrio',
    '6 min',
    'Cómo medir el ROI de la IA: 7 métricas clave | IA de Barrio',
    'Las 7 métricas esenciales para medir el retorno de la IA.',
    '2026-03-15T10:00:00Z',
    NULL
)
ON CONFLICT (slug) DO NOTHING;
