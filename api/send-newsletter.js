// Vercel Serverless Function: /api/send-newsletter
// Sends newsletter emails via Resend API to all subscribers
// Environment variable required: RESEND_API_KEY

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        return res.status(500).json({ error: 'RESEND_API_KEY not configured in Vercel environment variables' });
    }

    try {
        const { subscribers, articles } = req.body;

        if (!subscribers || subscribers.length === 0) {
            return res.status(400).json({ error: 'No subscribers provided' });
        }
        if (!articles || articles.length === 0) {
            return res.status(400).json({ error: 'No articles provided' });
        }

        // Generate the email HTML
        const emailHtml = generateNewsletterHtml(articles);
        const emailSubject = articles.length === 1
            ? `📰 ${articles[0].title}`
            : `📰 ${articles.length} nuevos artículos de Gerard Fanals`;

        // Send to each subscriber via Resend
        const results = [];
        const errors = [];

        for (const sub of subscribers) {
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Gerard Fanals <newsletter@gerardfanals.online>',
                        to: [sub.email],
                        subject: emailSubject,
                        html: emailHtml
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    results.push({ email: sub.email, status: 'sent', id: data.id });
                } else {
                    errors.push({ email: sub.email, error: data.message || 'Unknown error' });
                }
            } catch (err) {
                errors.push({ email: sub.email, error: err.message });
            }
        }

        return res.status(200).json({
            success: true,
            sent: results.length,
            failed: errors.length,
            results,
            errors
        });

    } catch (error) {
        console.error('Newsletter send error:', error);
        return res.status(500).json({ error: error.message });
    }
}

function generateNewsletterHtml(articles) {
    const articleCards = articles.map(article => {
        const articleUrl = `https://www.gerardfanals.online/articulo.html?slug=${article.slug || ''}`;
        const imageUrl = article.image || 'https://www.gerardfanals.online/img/og-image.jpg';
        const tag = article.tag || 'IA';
        const description = article.description || '';

        return `
        <tr>
            <td style="padding: 0 0 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <tr>
                        <td style="padding: 0;">
                            <img src="${imageUrl}" alt="${article.title}" width="600" style="width: 100%; height: 200px; object-fit: cover; display: block; border-radius: 16px 16px 0 0;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px;">
                            <span style="display: inline-block; background: rgba(0,113,227,0.1); color: #0071e3; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">${tag}</span>
                            <h2 style="margin: 12px 0 8px; font-size: 20px; color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; line-height: 1.3;">${article.title}</h2>
                            <p style="margin: 0 0 16px; color: #6e6e73; font-size: 14px; line-height: 1.6;">${description}</p>
                            <a href="${articleUrl}" style="display: inline-block; background: #0071e3; color: #ffffff; padding: 10px 24px; border-radius: 22px; text-decoration: none; font-size: 14px; font-weight: 600;">Leer artículo →</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter - Gerard Fanals</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="text-align: center; padding: 0 0 32px;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
                                Gerard<span style="font-weight: 300;">Fanals</span>
                            </h1>
                            <p style="margin: 8px 0 0; color: #6e6e73; font-size: 14px;">IA & Automatización para empresas</p>
                        </td>
                    </tr>
                    
                    <!-- Intro -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0071e3, #af52de); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
                            <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 22px; font-weight: 700;">📰 Nuevos artículos</h2>
                            <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 14px;">${articles.length} artículo${articles.length > 1 ? 's' : ''} nuevo${articles.length > 1 ? 's' : ''} para ti</p>
                        </td>
                    </tr>
                    
                    <tr><td style="height: 24px;"></td></tr>
                    
                    <!-- Articles -->
                    ${articleCards}
                    
                    <!-- CTA -->
                    <tr>
                        <td style="text-align: center; padding: 16px 0 32px;">
                            <a href="https://www.gerardfanals.online/blog.html" style="display: inline-block; background: #1d1d1f; color: #ffffff; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-size: 15px; font-weight: 600;">Ver todos los artículos →</a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="text-align: center; padding: 24px 0; border-top: 1px solid #d2d2d7;">
                            <p style="margin: 0 0 8px; color: #6e6e73; font-size: 12px;">© 2026 Gerard Fanals · IA & Automatización</p>
                            <p style="margin: 0; color: #86868b; font-size: 11px;">
                                Recibes este email porque te suscribiste a nuestra newsletter.<br>
                                <a href="https://www.gerardfanals.online/newsletter.html" style="color: #0071e3; text-decoration: none;">Gestionar suscripción</a>
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
