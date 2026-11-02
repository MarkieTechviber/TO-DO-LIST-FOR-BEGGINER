-- ====================================================================
-- SUPABASE TO-DO LIST SCHEMA (Cozy Daily Planner)
-- ====================================================================
-- Run this in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- This script creates the `todos` table, performance indexes,
-- Row Level Security (RLS) policies, and Realtime sync.
-- ====================================================================

-- 1. Create the todos table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    description TEXT DEFAULT '',
    is_completed BOOLEAN DEFAULT false NOT NULL,
    category TEXT DEFAULT 'Personal' NOT NULL,
    priority TEXT DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE NULL
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON public.todos (is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_category ON public.todos (category);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_todos_updated ON public.todos;
CREATE TRIGGER on_todos_updated
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 5. Open access policy for quick start (supports anon and authenticated users)
DROP POLICY IF EXISTS "Public access for all todos" ON public.todos;
CREATE POLICY "Public access for all todos"
    ON public.todos
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime updates on the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;

-- 7. Insert warm sample tasks to get started
INSERT INTO public.todos (title, description, category, priority, is_completed, due_date)
VALUES 
    ('Morning matcha & journal reflections', 'Take 10 mindful minutes with warm matcha and gratitude journaling.', 'Self Care', 'low', true, CURRENT_DATE),
    ('Curate moodboard for summer project', 'Collect gentle color swatches, soft textures, and typography references.', 'Work & Study', 'high', false, CURRENT_DATE + INTERVAL '1 day'),
    ('Fresh peonies for the ceramic vase', 'Stop by the local flower market on the walk home.', 'Home & Cozy', 'medium', false, CURRENT_DATE + INTERVAL '2 days'),
    ('Evening yoga & chamomile tea', 'Gentle 20-minute stretching flow followed by reading in bed.', 'Wellness', 'low', false, CURRENT_DATE)
ON CONFLICT DO NOTHING;
