<script>
  import Icon from './Icon.svelte'

  let { todo, onSave, onClose } = $props()

  let title = $state('')
  let description = $state('')
  let category = $state('Personal')
  let priority = $state('medium')
  let dueDate = $state('')
  let isSaving = $state(false)

  // Sync initial values when todo changes
  $effect(() => {
    if (todo) {
      title = todo.title || ''
      description = todo.description || ''
      category = todo.category || 'Personal'
      priority = todo.priority || 'medium'
      dueDate = todo.due_date || ''
    }
  })

  const categories = [
    'Self Care',
    'Work & Study',
    'Home & Cozy',
    'Wellness',
    'Personal',
  ]

  const priorities = [
    { value: 'low', label: 'Gentle' },
    { value: 'medium', label: 'Balanced' },
    { value: 'high', label: 'Priority' },
  ]

  async function handleSave(e) {
    e?.preventDefault()
    if (!title.trim() || isSaving) return

    isSaving = true
    try {
      await onSave(todo.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        due_date: dueDate || null,
      })
      onClose()
    } catch (err) {
      console.error('Failed to save edits:', err)
    } finally {
      isSaving = false
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
</script>

<div class="modal-backdrop" onclick={handleBackdrop} role="presentation">
  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-header">
      <div class="modal-title-group">
        <Icon name="pencil" size={16} class="header-icon" />
        <h2 id="modal-title" class="modal-title">Edit Task</h2>
      </div>
      <button type="button" class="close-btn" onclick={onClose} aria-label="Close modal">
        <Icon name="x" size={18} />
      </button>
    </div>

    <form onsubmit={handleSave} class="modal-form">
      <!-- Title -->
      <div class="form-group">
        <label for="edit-title" class="field-label">Task Name</label>
        <input
          id="edit-title"
          type="text"
          bind:value={title}
          class="text-input"
          required
        />
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="edit-desc" class="field-label">Notes (Optional)</label>
        <textarea
          id="edit-desc"
          bind:value={description}
          rows="3"
          class="textarea-input"
          placeholder="Add any gentle notes or reminders..."
        ></textarea>
      </div>

      <!-- Category -->
      <div class="form-group">
        <span class="field-label">Collection</span>
        <div class="pills-row">
          {#each categories as cat}
            <button
              type="button"
              class="choice-pill {category === cat ? 'active' : ''}"
              onclick={() => (category = cat)}
            >
              {cat}
            </button>
          {/each}
        </div>
      </div>

      <!-- Priority & Due Date -->
      <div class="split-row">
        <div class="form-group flex-1">
          <span class="field-label">Pacing</span>
          <div class="pills-row">
            {#each priorities as p}
              <button
                type="button"
                class="choice-pill {priority === p.value ? 'active' : ''}"
                onclick={() => (priority = p.value)}
              >
                {p.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="form-group flex-1">
          <label for="edit-due" class="field-label">Due Date</label>
          <input
            id="edit-due"
            type="date"
            bind:value={dueDate}
            class="text-input"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="modal-actions">
        <button type="button" class="btn-cancel" onclick={onClose}>
          Cancel
        </button>
        <button type="submit" class="btn-save" disabled={!title.trim() || isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(68, 52, 57, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-card {
    background: #ffffff;
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 480px;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-floating);
    overflow: hidden;
    animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-light);
    background: var(--bg-surface-tint);
  }

  .modal-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--rose-primary);
  }

  .modal-title {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
  }

  .close-btn {
    color: var(--text-subtle);
    display: flex;
    padding: 4px;
    border-radius: var(--radius-sm);
  }

  .close-btn:hover {
    color: var(--text-main);
    background: var(--bg-surface-muted);
  }

  .modal-form {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .split-row {
    display: flex;
    gap: 16px;
  }

  .flex-1 {
    flex: 1;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .text-input,
  .textarea-input {
    width: 100%;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    font-size: 14px;
    color: var(--text-main);
    background: var(--bg-surface-tint);
    transition: var(--transition-smooth);
  }

  .text-input:focus,
  .textarea-input:focus {
    border-color: var(--border-focus);
    background: #ffffff;
  }

  .pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .choice-pill {
    font-size: 12px;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-light);
    background: var(--bg-surface-muted);
    color: var(--text-muted);
    transition: var(--transition-smooth);
  }

  .choice-pill:hover {
    border-color: var(--border-hover);
    color: var(--text-main);
  }

  .choice-pill.active {
    background: var(--rose-light);
    border-color: var(--rose-border);
    color: var(--rose-text);
    font-weight: 600;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
    padding-top: 16px;
    border-top: 1px solid var(--border-light);
  }

  .btn-cancel {
    padding: 8px 16px;
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
  }

  .btn-cancel:hover {
    background: var(--bg-surface-muted);
    color: var(--text-main);
  }

  .btn-save {
    padding: 8px 20px;
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 600;
    background: var(--rose-primary);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(217, 119, 132, 0.25);
  }

  .btn-save:hover:not(:disabled) {
    background: var(--rose-hover);
    transform: translateY(-1px);
  }

  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
