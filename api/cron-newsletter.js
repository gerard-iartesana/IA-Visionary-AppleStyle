// Vercel Cron Job: /api/cron-newsletter
// Triggered weekly by Vercel Cron (see vercel.json)
// Checks newsletter_config for the scheduled day/time and sends if it matches

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uidilhuybmtuokunutgz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req, res) {
    // Verify this is from Vercel Cron
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // In development/testing, allow without auth
        if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY || !SUPABASE_KEY) {
        return res.status(500).json({ error: 'Missing environment variables' });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // Check config
        const { data: config } = await supabase
            .from('newsletter_config')
            .select('*')
            .limit(1)
            .single();

        if (!config) {
            return res.status(200).json({ message: 'No newsletter config found, skipping' });
        }

        // Check if today is the scheduled day
        const now = new Date();
        const currentDay = now.getUTCDay(); // 0=Sunday, 1=Monday...
        
        if (currentDay !== config.send_day) {
            return res.status(200).json({ message: `Today is day ${currentDay}, scheduled for day ${config.send_day}. Skipping.` });
        }

        // Get pending articles (published since last send)
        let query = supabase
            .from('articles')
            .select('id, title, tag, description, slug, image')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (config.last_sent_at) {
            query = query.gt('created_at', config.last_sent_at);
        }

        const { data: articles, error: artError } = await query;
        if (artError) throw artError;

        if (!articles || articles.length === 0) {
            return res.status(200).json({ message: 'No pending articles to send' });
        }

        // Get subscribers
        const { data: subscribers, error: subError } = await supabase
            .from('newsletter_subscribers')
            .select('email, name');
        
        if (subError) throw subError;
        if (!subscribers || subscribers.length === 0) {
            return res.status(200).json({ message: 'No subscribers to send to' });
        }

        // Call the send-newsletter endpoint
        const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}`
            : 'https://www.gerardfanals.online';

        const sendResponse = await fetch(`${baseUrl}/api/send-newsletter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscribers, articles })
        });

        const result = await sendResponse.json();

        if (sendResponse.ok) {
            // Record the send
            await supabase.from('newsletter_sends').insert({
                articles_count: articles.length,
                subscribers_count: subscribers.length,
                article_ids: articles.map(a => a.id),
                sent_at: new Date().toISOString()
            });

            // Update last_sent_at
            await supabase
                .from('newsletter_config')
                .update({ last_sent_at: new Date().toISOString() })
                .eq('id', config.id);
        }

        return res.status(200).json({
            message: 'Cron newsletter executed',
            articles: articles.length,
            subscribers: subscribers.length,
            result
        });

    } catch (error) {
        console.error('Cron newsletter error:', error);
        return res.status(500).json({ error: error.message });
    }
}
