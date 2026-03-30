-- ===================================================
-- Fix: Add anon policies for articles table
-- The admin panel uses the anon key (no auth),
-- so we need policies that allow anon role access.
-- Run this in Supabase SQL Editor.
-- ===================================================

-- Allow anon to read ALL articles (including drafts)
CREATE POLICY "anon_select_all_articles"
    ON articles FOR SELECT
    TO anon
    USING (true);

-- Allow anon to insert articles
CREATE POLICY "anon_insert_articles"
    ON articles FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anon to update articles
CREATE POLICY "anon_update_articles"
    ON articles FOR UPDATE
    TO anon
    USING (true);

-- Allow anon to delete articles
CREATE POLICY "anon_delete_articles"
    ON articles FOR DELETE
    TO anon
    USING (true);
