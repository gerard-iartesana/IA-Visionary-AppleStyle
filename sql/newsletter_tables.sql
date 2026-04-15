-- =====================================================
-- Newsletter System Tables & RLS Policies
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Newsletter Config Table (single row for schedule settings)
CREATE TABLE IF NOT EXISTS newsletter_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    send_day INTEGER DEFAULT 1,          -- 0=Sunday, 1=Monday, ..., 6=Saturday
    send_time TEXT DEFAULT '10:00',       -- HH:MM format
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Newsletter Sends Table (history log)
CREATE TABLE IF NOT EXISTS newsletter_sends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    articles_count INTEGER DEFAULT 0,
    subscribers_count INTEGER DEFAULT 0,
    article_ids TEXT[],
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RLS Policies - Allow anon access (admin uses anon key)
-- =====================================================

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- newsletter_subscribers policies
CREATE POLICY "Allow anon select newsletter_subscribers"
    ON newsletter_subscribers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert newsletter_subscribers"
    ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon delete newsletter_subscribers"
    ON newsletter_subscribers FOR DELETE TO anon USING (true);
CREATE POLICY "Allow anon update newsletter_subscribers"
    ON newsletter_subscribers FOR UPDATE TO anon USING (true);

-- newsletter_config policies
CREATE POLICY "Allow anon select newsletter_config"
    ON newsletter_config FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert newsletter_config"
    ON newsletter_config FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update newsletter_config"
    ON newsletter_config FOR UPDATE TO anon USING (true);

-- newsletter_sends policies
CREATE POLICY "Allow anon select newsletter_sends"
    ON newsletter_sends FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert newsletter_sends"
    ON newsletter_sends FOR INSERT TO anon WITH CHECK (true);

-- Insert default config if empty
INSERT INTO newsletter_config (send_day, send_time)
SELECT 1, '10:00'
WHERE NOT EXISTS (SELECT 1 FROM newsletter_config);
