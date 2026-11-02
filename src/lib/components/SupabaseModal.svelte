<script>
  import Icon from './Icon.svelte'
  import { getCredentials, saveCustomCredentials, clearCustomCredentials } from '../supabase.js'
  import { testSupabaseConnection } from '../todoService.js'

  let { isOpen, onClose, onConnectionChanged } = $props()

  const creds = getCredentials()
  let url = $state(creds.url || '')
  let anonKey = $state(creds.anonKey || '')
  let statusMessage = $state('')
  let statusType = $state('') // 'success' | 'error' | 'info'
  let isTesting = $state(false)
  let copiedSchema = $state(false)

  const sqlSchema = `-- ====================================================================
-- SUPABASE TO-DO LIST SCHEMA (Cozy Daily Planner)
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

-- 6. Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;`

  async function handleSaveAndTest(e) {
    e?.preventDefault()
    if (!url.trim() || !anonKey.trim()) {
      statusType = 'error'
      statusMessage = 'Please enter both your Supabase URL and Anon Key.'
      return
    }

    isTesting = true
    statusType = 'info'
    statusMessage = 'Connecting to Supabase...'

    const res = await testSupabaseConnection(url.trim(), anonKey.trim())
    isTesting = false

    if (res.ok) {
      statusType = 'success'
      statusMessage = res.message
      saveCustomCredentials(url.trim(), anonKey.trim())
      onConnectionChanged?.(true)
    } else {
      statusType = 'error'
      statusMessage = res.message
      if (res.needsSchema) {
        saveCustomCredentials(url.trim(), anonKey.trim())
      }
    }
  }

  function handleReset() {
    clearCustomCredentials()
    url = ''
    anonKey = ''
    statusType = 'info'
    statusMessage = 'Reset to local browser storage.'
    onConnectionChanged?.(false)
  }

  function copySql() {
    navigator.clipboard.writeText(sqlSchema)
    copiedSchema = true
    setTimeout(() => {
      copiedSchema = false
    }, 2500)
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" onclick={handleBackdrop} role="presentation">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="supabase-title">
      <div class="modal-header">
        <div class="modal-title-group">
          <div class="db-icon-box">
            <Icon name="database" size={18} />
          </div>
          <div>
            <h2 id="supabase-title" class="modal-title">Supabase Database Setup</h2>
            <p class="modal-subtitle">Connect your cloud database for real-time sync</p>
          </div>
        </div>
        <button type="button" class="close-btn" onclick={onClose} aria-label="Close modal">
          <Icon name="x" size={18} />
        </button>
      </div>

      <div class="modal-body">
        <!-- Status Notification -->
        {#if statusMessage}
          <div class="status-banner {statusType}">
            {#if statusType === 'success'}
              <Icon name="check-circle" size={16} />
            {:else}
              <Icon name="alert-circle" size={16} />
            {/if}
            <span>{statusMessage}</span>
          </div>
        {/if}

        <!-- Connection Form -->
        <form onsubmit={handleSaveAndTest} class="db-form">
          <div class="form-group">
            <label for="sb-url" class="field-label">Supabase Project URL</label>
            <input
              id="sb-url"
              type="url"
              bind:value={url}
              placeholder="https://xyzcompany.supabase.co"
              class="text-input"
              required
            />
            <span class="field-hint">Found in Supabase: Project Settings &rarr; API &rarr; Project URL</span>
          </div>

          <div class="form-group">
            <label for="sb-anon" class="field-label">Project Anon API Key (Public)</label>
            <input
              id="sb-anon"
              type="password"
              bind:value={anonKey}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="text-input"
              required
            />
            <span class="field-hint">Found in Supabase: Project Settings &rarr; API &rarr; Project API keys (anon / public)</span>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              disabled={isTesting}
            >
              <Icon name="refresh" size={14} class={isTesting ? 'spinning' : ''} />
              <span>{isTesting ? 'Testing...' : 'Save & Connect'}</span>
            </button>

            {#if creds.isValid}
              <button
                type="button"
                class="btn-secondary"
                onclick={handleReset}
              >
                Disconnect
              </button>
            {/if}
          </div>
        </form>

        <!-- SQL Schema Helper Section -->
        <div class="schema-section">
          <div class="schema-header">
            <div>
              <h3 class="schema-title">Database SQL Migration</h3>
              <p class="schema-desc">Paste this once into your Supabase SQL Editor:</p>
            </div>
            <button
              type="button"
              class="copy-btn {copiedSchema ? 'copied' : ''}"
              onclick={copySql}
            >
              <Icon name={copiedSchema ? 'check' : 'copy'} size={14} />
              <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <div class="code-preview">
            <pre><code>{sqlSchema}</code></pre>
          </div>
        </div>

        <!-- Deployment to Vercel instructions -->
        <div class="deploy-note">
          <h4 class="deploy-title">
            <Icon name="sparkles" size={14} />
            <span>Ready for Vercel Deployment</span>
          </h4>
          <p>
            When deploying on Vercel, simply add these Environment Variables in your Vercel Project Settings:
          </p>
          <ul>
            <li><code>VITE_SUPABASE_URL</code>: your project URL</li>
            <li><code>VITE_SUPABASE_ANON_KEY</code>: your anon public key</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(68, 52, 57, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-card {
    background: #ffffff;
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 580px;
    max-height: 90vh;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-floating);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px;
    border-bottom: 1px solid var(--border-light);
    background: var(--bg-surface-tint);
  }

  .modal-title-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .db-icon-box {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--rose-light);
    color: var(--rose-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--rose-border);
  }

  .modal-title {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
  }

  .modal-subtitle {
    font-size: 13px;
    color: var(--text-muted);
  }

  .close-btn {
    color: var(--text-subtle);
    display: flex;
    padding: 6px;
    border-radius: var(--radius-sm);
  }

  .close-btn:hover {
    color: var(--text-main);
    background: var(--bg-surface-muted);
  }

  .modal-body {
    padding: 24px 28px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .status-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
  }

  .status-banner.success {
    background: var(--sage-bg);
    color: var(--sage-text);
    border: 1px solid var(--sage-border);
  }

  .status-banner.error {
    background: #FDECEC;
    color: #9E3737;
    border: 1px solid #F8BDBD;
  }

  .status-banner.info {
    background: var(--peach-bg);
    color: var(--peach-text);
    border: 1px solid var(--peach-border);
  }

  .db-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .field-hint {
    font-size: 11px;
    color: var(--text-subtle);
  }

  .text-input {
    width: 100%;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    font-size: 14px;
    color: var(--text-main);
    background: var(--bg-surface-tint);
    transition: var(--transition-smooth);
  }

  .text-input:focus {
    border-color: var(--border-focus);
    background: #ffffff;
  }

  .form-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: var(--radius-full);
    background: var(--rose-primary);
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(217, 119, 132, 0.28);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--rose-hover);
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 10px 18px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
  }

  .btn-secondary:hover {
    background: var(--bg-surface-muted);
    color: var(--text-main);
  }

  .schema-section {
    background: var(--bg-surface-muted);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
  }

  .schema-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    gap: 10px;
  }

  .schema-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
  }

  .schema-desc {
    font-size: 12px;
    color: var(--text-muted);
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    background: #ffffff;
    border: 1px solid var(--border-light);
    font-size: 12px;
    font-weight: 600;
    color: var(--rose-text);
    box-shadow: var(--shadow-sm);
  }

  .copy-btn:hover {
    border-color: var(--rose-border);
    background: var(--rose-light);
  }

  .copy-btn.copied {
    background: var(--sage-bg);
    border-color: var(--sage-border);
    color: var(--sage-text);
  }

  .code-preview {
    max-height: 140px;
    overflow-y: auto;
    background: #FAF5F0;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-family: monospace;
    font-size: 11px;
    color: #4A3E44;
  }

  .code-preview code {
    white-space: pre;
  }

  .deploy-note {
    background: var(--bg-surface-tint);
    border: 1px dashed var(--border-light);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .deploy-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 6px;
  }

  .deploy-note ul {
    margin: 6px 0 0 20px;
  }

  .deploy-note code {
    background: #ffffff;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 12px;
    color: var(--rose-text);
  }

  :global(.spinning) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
