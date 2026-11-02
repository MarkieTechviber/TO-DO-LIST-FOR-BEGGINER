import { createClient } from '@supabase/supabase-js'

const STORAGE_KEY_URL = 'cherie_supabase_url'
const STORAGE_KEY_ANON = 'cherie_supabase_anon_key'

// Helper to get active credentials from env or localStorage
export function getCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null

  const url = (localUrl && localUrl.trim()) || (envUrl && envUrl.trim()) || ''
  const anonKey = (localKey && localKey.trim()) || (envKey && envKey.trim()) || ''

  const isValid = Boolean(url && anonKey && url.startsWith('http'))

  return { url, anonKey, isValid, isFromEnv: Boolean(envUrl && envKey) }
}

let clientInstance = null
let currentUrl = ''
let currentKey = ''

export function getSupabase() {
  const { url, anonKey, isValid } = getCredentials()

  if (!isValid) {
    clientInstance = null
    return null
  }

  // Reuse instance if credentials haven't changed
  if (clientInstance && currentUrl === url && currentKey === anonKey) {
    return clientInstance
  }

  try {
    currentUrl = url
    currentKey = anonKey
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
    return clientInstance
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err)
    clientInstance = null
    return null
  }
}

export function saveCustomCredentials(url, anonKey) {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem(STORAGE_KEY_URL, url.trim())
      localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim())
    } else {
      localStorage.removeItem(STORAGE_KEY_URL)
      localStorage.removeItem(STORAGE_KEY_ANON)
    }
    clientInstance = null // Force re-init on next call
  }
}

export function clearCustomCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL)
    localStorage.removeItem(STORAGE_KEY_ANON)
    clientInstance = null
  }
}
