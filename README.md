# ☕ Cozy To-Do List (For Beginners)

A warm, aesthetic, and cozy To-Do list & daily planner application designed for beginners. Built with **Svelte 5**, powered by **Supabase** (cloud PostgreSQL with Realtime sync), and deployed to **Vercel**.

Designed with a soothing, serene aesthetic: warm linen & almond background, soft pastel badges (peach, sage, lavender, buttercream), clean rounded cards, editorial typography, and minimalist vector icons.

🌐 **Live Demo:** [https://cherie-todo.vercel.app](https://cherie-todo.vercel.app)

---

## 🌟 Highlights

- **Beginner Friendly**: Clean, readable codebase built with modern Svelte 5 runes (`$state`, `$derived`, `$effect`).
- **Full CRUD Capabilities**:
  - **Create**: Add new tasks with optional notes, collections, pacing/priority, and due dates.
  - **Read**: Live real-time sync with Supabase PostgreSQL (with automatic local storage fallback for offline support).
  - **Update**: Edit tasks anytime with an elegant edit dialog.
  - **Delete**: Soft animated task removal.
  - **Toggle**: Custom circular checkmark toggle with celebratory pastel confetti.
- **Cozy Collections**:
  - `Self Care` (Soft Rose)
  - `Work & Study` (Warm Peach)
  - `Home & Cozy` (Buttercream)
  - `Wellness` (Fresh Sage)
  - `Personal` (Lavender Mist)
- **Live Search & Filter**:
  - Status tabs: **All**, **Active**, **Completed** with instant counters.
  - Search bar to filter tasks by title, note, or collection.
  - Sort by *Newest First*, *Oldest First*, *Due Date*, or *Priority*.
- **Supabase Cloud Database**:
  - PostgreSQL database table with Row-Level Security (RLS) enabled.
  - Realtime publication for multi-tab and multi-device instant sync.
- **Vercel Ready**:
  - Single-page application with pre-configured `vercel.json` routing rewrites.

---

## 🚀 Quick Start Guide (For Beginners)

### 1. Clone the Repository

```bash
git clone https://github.com/MarkieTechviber/TO-DO-LIST-FOR-BEGGINER.git
cd TO-DO-LIST-FOR-BEGGINER
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Connect Supabase

You can connect in either of two ways:

#### Option A: In the Running App (Instant)
Run the app, click the **"Connect Supabase"** badge in the top right corner, paste your Supabase Project URL and Anon Key, and click **"Save & Connect"**.

#### Option B: Via `.env`
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App Locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser!

---

## 🗄️ Supabase Database Schema

Run this SQL query once in your Supabase SQL Editor (`Dashboard -> SQL Editor -> New Query`):

```sql
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

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON public.todos (is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_category ON public.todos (category);

-- 3. Automatic updated_at trigger
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

-- 5. Open policy for anon & authenticated users
DROP POLICY IF EXISTS "Public access for all todos" ON public.todos;
CREATE POLICY "Public access for all todos"
    ON public.todos
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
```

---

## 📦 Project Structure

```
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Header.svelte         # Header with daily harmony progress bar
│   │   │   ├── StatsBanner.svelte    # Quick overview counters
│   │   │   ├── TodoForm.svelte       # Add intention / task form
│   │   │   ├── TodoItem.svelte       # Individual task card with checkbox
│   │   │   ├── TodoFilter.svelte     # Search, filter chips, and sorting
│   │   │   ├── EditTodoModal.svelte  # Modal to edit task details
│   │   │   ├── SupabaseModal.svelte  # In-app database setup drawer
│   │   │   └── Icon.svelte           # Minimalist SVG icons
│   │   ├── supabase.js               # Supabase client wrapper
│   │   └── todoService.js            # Full CRUD database methods
│   ├── App.svelte                    # Main application state & layout
│   ├── app.css                       # Warm cozy color system & styling
│   └── main.js                       # Svelte 5 application entrypoint
├── index.html                        # HTML template with Google Fonts
├── package.json                      # Project dependencies & scripts
├── svelte.config.js                  # Svelte compiler configuration
├── vite.config.js                    # Vite bundler configuration
└── vercel.json                       # Vercel SPA routing rules
```

---

## ☁️ Deployment

This project is optimized for 1-click deployment on **Vercel**:
1. Import this repository into [Vercel](https://vercel.com).
2. Set Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click **Deploy**.

---

## 📄 License

MIT License. Free to use, adapt, and build upon.
