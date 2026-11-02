<script>
  import Icon from './Icon.svelte'

  let { onAddTodo } = $props()

  let title = $state('')
  let description = $state('')
  let category = $state('Personal')
  let priority = $state('medium')
  let dueDate = $state('')
  let isExpanded = $state(false)
  let isSubmitting = $state(false)

  const categories = [
    { name: 'Self Care', color: 'rose' },
    { name: 'Work & Study', color: 'peach' },
    { name: 'Home & Cozy', color: 'butter' },
    { name: 'Wellness', color: 'sage' },
    { name: 'Personal', color: 'lavender' },
  ]

  const priorities = [
    { value: 'low', label: 'Gentle', color: 'sage' },
    { value: 'medium', label: 'Balanced', color: 'peach' },
    { value: 'high', label: 'Priority', color: 'rose' },
  ]

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!title.trim() || isSubmitting) return

    isSubmitting = true
    try {
      await onAddTodo({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        due_date: dueDate || null,
      })

      // Reset
      title = ''
      description = ''
      dueDate = ''
      isExpanded = false
    } catch (err) {
      console.error('Error submitting todo:', err)
    } finally {
      isSubmitting = false
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !isExpanded) {
      e.preventDefault()
      handleSubmit()
    }
  }
</script>

<div class="todo-form-card">
  <form onsubmit={handleSubmit}>
    <div class="main-input-row">
      <div class="input-icon">
        <Icon name="sparkles" size={18} />
      </div>
      <input
        type="text"
        bind:value={title}
        onfocus={() => (isExpanded = true)}
        onkeydown={handleKeydown}
        placeholder="Add a gentle task or intention..."
        class="title-input"
        required
      />
      <button
        type="submit"
        class="add-btn"
        disabled={!title.trim() || isSubmitting}
        aria-label="Add task"
      >
        <Icon name="plus" size={18} />
        <span>Add</span>
      </button>
    </div>

    {#if isExpanded}
      <div class="expanded-options">
        <!-- Optional Description / Notes -->
        <div class="form-group">
          <textarea
            bind:value={description}
            placeholder="Add gentle details or thoughtful notes (optional)..."
            rows="2"
            class="description-textarea"
          ></textarea>
        </div>

        <!-- Category & Priority Row -->
        <div class="options-grid">
          <!-- Categories -->
          <div class="option-column">
            <span class="option-label">
              <Icon name="tag" size={13} />
              <span>Category</span>
            </span>
            <div class="category-pills">
              {#each categories as cat}
                <button
                  type="button"
                  class="pill-btn {cat.color} {category === cat.name ? 'selected' : ''}"
                  onclick={() => (category = cat.name)}
                >
                  {cat.name}
                </button>
              {/each}
            </div>
          </div>

          <!-- Priority -->
          <div class="option-column">
            <span class="option-label">
              <Icon name="sliders" size={13} />
              <span>Pacing</span>
            </span>
            <div class="priority-pills">
              {#each priorities as p}
                <button
                  type="button"
                  class="pill-btn {p.color} {priority === p.value ? 'selected' : ''}"
                  onclick={() => (priority = p.value)}
                >
                  {p.label}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Due Date & Actions -->
        <div class="bottom-action-row">
          <div class="due-date-wrapper">
            <label class="option-label inline" for="due-date-input">
              <Icon name="calendar" size={13} />
              <span>Due Date</span>
            </label>
            <input
              id="due-date-input"
              type="date"
              bind:value={dueDate}
              class="date-input"
            />
          </div>

          <div class="cancel-btn-wrapper">
            <button
              type="button"
              class="text-btn"
              onclick={() => {
                isExpanded = false
                description = ''
              }}
            >
              Collapse
            </button>
          </div>
        </div>
      </div>
    {/if}
  </form>
</div>

<style>
  .todo-form-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: 16px 20px;
    box-shadow: var(--shadow-card);
    margin-bottom: 24px;
    transition: var(--transition-smooth);
  }

  .todo-form-card:focus-within {
    border-color: var(--border-focus);
    box-shadow: var(--shadow-hover);
  }

  .main-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .input-icon {
    color: var(--rose-primary);
    display: flex;
    align-items: center;
  }

  .title-input {
    flex: 1;
    border: none;
    font-size: 16px;
    color: var(--text-main);
    background: transparent;
    padding: 8px 4px;
    font-weight: 500;
  }

  .title-input::placeholder {
    color: var(--text-subtle);
    font-weight: 400;
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--rose-primary);
    color: #ffffff;
    padding: 10px 20px;
    border-radius: var(--radius-full);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 14px rgba(217, 119, 132, 0.28);
    transition: var(--transition-smooth);
  }

  .add-btn:hover:not(:disabled) {
    background: var(--rose-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(217, 119, 132, 0.38);
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .expanded-options {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-light);
    animation: fadeIn 0.25s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form-group {
    margin-bottom: 14px;
  }

  .description-textarea {
    width: 100%;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    background: var(--bg-surface-tint);
    resize: vertical;
    font-size: 14px;
    color: var(--text-body);
    transition: var(--transition-smooth);
  }

  .description-textarea:focus {
    border-color: var(--border-focus);
    background: #ffffff;
  }

  .description-textarea::placeholder {
    color: var(--text-subtle);
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 14px;
  }

  .option-column {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .option-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .option-label.inline {
    margin-right: 6px;
  }

  .category-pills,
  .priority-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .pill-btn {
    font-size: 12px;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-light);
    background: var(--bg-surface-muted);
    color: var(--text-muted);
    transition: var(--transition-smooth);
  }

  .pill-btn:hover {
    border-color: var(--border-hover);
    color: var(--text-main);
  }

  .pill-btn.rose.selected {
    background: var(--rose-light);
    border-color: var(--rose-border);
    color: var(--rose-text);
  }

  .pill-btn.peach.selected {
    background: var(--peach-bg);
    border-color: var(--peach-border);
    color: var(--peach-text);
  }

  .pill-btn.butter.selected {
    background: var(--butter-bg);
    border-color: var(--butter-border);
    color: var(--butter-text);
  }

  .pill-btn.sage.selected {
    background: var(--sage-bg);
    border-color: var(--sage-border);
    color: var(--sage-text);
  }

  .pill-btn.lavender.selected {
    background: var(--lavender-bg);
    border-color: var(--lavender-border);
    color: var(--lavender-text);
  }

  .bottom-action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--border-light);
  }

  .due-date-wrapper {
    display: flex;
    align-items: center;
  }

  .date-input {
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    padding: 4px 10px;
    font-size: 13px;
    background: var(--bg-surface-tint);
    color: var(--text-main);
  }

  .date-input:focus {
    border-color: var(--border-focus);
  }

  .text-btn {
    font-size: 13px;
    color: var(--text-muted);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
  }

  .text-btn:hover {
    color: var(--text-main);
    background: var(--bg-surface-muted);
  }

  @media (max-width: 640px) {
    .options-grid {
      grid-template-columns: 1fr;
    }
    .bottom-action-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
</style>
