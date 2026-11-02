import { createClient } from '@supabase/supabase-js'
import { getSupabase } from './supabase.js'

const LOCAL_STORAGE_KEY = 'cherie_local_todos'

export const DEFAULT_TODOS = [
  {
    id: 'sample-1',
    title: 'Morning matcha & gentle reflections',
    description: '10 mindful minutes with warm matcha and gratitude journaling.',
    category: 'Self Care',
    priority: 'low',
    due_date: new Date().toISOString().split('T')[0],
    is_completed: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Curate aesthetic moodboard for new project',
    description: 'Gather soft pastel palettes, linen textures, and editorial typography.',
    category: 'Work & Study',
    priority: 'high',
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    is_completed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Fresh peonies for the ceramic vase',
    description: 'Pick up soft blush florals from the corner boutique.',
    category: 'Home & Cozy',
    priority: 'medium',
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'Evening stretch & chamomile lavender tea',
    description: 'Unwind with relaxing ambient sounds and gentle candle scent.',
    category: 'Wellness',
    priority: 'low',
    due_date: new Date().toISOString().split('T')[0],
    is_completed: false,
    created_at: new Date().toISOString(),
  },
]

function getLocalTodos() {
  if (typeof window === 'undefined') return DEFAULT_TODOS
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TODOS))
      return DEFAULT_TODOS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse local storage todos:', err)
    return DEFAULT_TODOS
  }
}

function saveLocalTodos(todos) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))
  }
}

// 1. Fetch Todos
export async function fetchTodos() {
  const supabase = getSupabase()

  if (!supabase) {
    return { data: getLocalTodos(), isSupabase: false, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetch error, using local fallback:', error.message)
      return { data: getLocalTodos(), isSupabase: false, error: error.message }
    }

    return { data: data || [], isSupabase: true, error: null }
  } catch (err) {
    return { data: getLocalTodos(), isSupabase: false, error: err.message }
  }
}

// 2. Add Todo
export async function addTodo(todoInput) {
  const supabase = getSupabase()

  const payload = {
    title: todoInput.title.trim(),
    description: (todoInput.description || '').trim(),
    category: todoInput.category || 'Personal',
    priority: todoInput.priority || 'medium',
    due_date: todoInput.due_date || null,
    is_completed: false,
  }

  if (!supabase) {
    const newTodo = {
      ...payload,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const current = getLocalTodos()
    const updated = [newTodo, ...current]
    saveLocalTodos(updated)
    return { data: newTodo, isSupabase: false, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return { data, isSupabase: true, error: null }
  } catch (err) {
    console.error('Failed to insert into Supabase:', err)
    // fallback
    const fallbackTodo = {
      ...payload,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
    }
    const current = getLocalTodos()
    saveLocalTodos([fallbackTodo, ...current])
    return { data: fallbackTodo, isSupabase: false, error: err.message }
  }
}

// 3. Toggle Status
export async function toggleTodo(id, currentStatus) {
  const newStatus = !currentStatus
  const supabase = getSupabase()

  if (!supabase || String(id).startsWith('local-') || String(id).startsWith('sample-')) {
    const current = getLocalTodos()
    const updated = current.map((t) => (t.id === id ? { ...t, is_completed: newStatus } : t))
    saveLocalTodos(updated)
    return { success: true, isSupabase: false }
  }

  try {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: newStatus })
      .eq('id', id)

    if (error) throw error
    return { success: true, isSupabase: true }
  } catch (err) {
    console.error('Error toggling todo:', err)
    return { success: false, error: err.message }
  }
}

// 4. Update Todo
export async function updateTodo(id, updates) {
  const supabase = getSupabase()

  const payload = {
    title: updates.title.trim(),
    description: (updates.description || '').trim(),
    category: updates.category || 'Personal',
    priority: updates.priority || 'medium',
    due_date: updates.due_date || null,
  }

  if (!supabase || String(id).startsWith('local-') || String(id).startsWith('sample-')) {
    const current = getLocalTodos()
    const updated = current.map((t) => (t.id === id ? { ...t, ...payload } : t))
    saveLocalTodos(updated)
    return { success: true, isSupabase: false }
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, isSupabase: true }
  } catch (err) {
    console.error('Error updating todo in Supabase:', err)
    return { success: false, error: err.message }
  }
}

// 5. Delete Todo
export async function deleteTodo(id) {
  const supabase = getSupabase()

  if (!supabase || String(id).startsWith('local-') || String(id).startsWith('sample-')) {
    const current = getLocalTodos()
    const updated = current.filter((t) => t.id !== id)
    saveLocalTodos(updated)
    return { success: true, isSupabase: false }
  }

  try {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) throw error
    return { success: true, isSupabase: true }
  } catch (err) {
    console.error('Error deleting from Supabase:', err)
    return { success: false, error: err.message }
  }
}

// 6. Test Supabase Connection
export async function testSupabaseConnection(url, key) {
  try {
    const testClient = createClient(url, key)
    const { error } = await testClient.from('todos').select('id').limit(1)

    if (error) {
      if (error.code === '42P01') {
        return {
          ok: false,
          needsSchema: true,
          message: 'Connected to Supabase, but the "todos" table is not created yet! Run the SQL schema to create it.',
        }
      }
      return { ok: false, message: error.message }
    }

    return { ok: true, message: 'Successfully connected to your Supabase database!' }
  } catch (err) {
    return { ok: false, message: err.message || 'Failed to connect. Please check your URL and anon key.' }
  }
}
