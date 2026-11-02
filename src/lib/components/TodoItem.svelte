<script>
  import Icon from './Icon.svelte'
  import confetti from 'canvas-confetti'

  let { todo, onToggle, onEdit, onDelete } = $props()

  let isDeleting = $state(false)
  let isExpanded = $state(false)

  // Soft pastel confetti colors
  function triggerCelebration() {
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#F3CBD3', '#F7DBC7', '#DDD1EF', '#D97784', '#FBEBB5'],
        disableForReducedMotion: true,
      })
    } catch {
      // ignore
    }
  }

  function handleCheck() {
    if (!todo.is_completed) {
      triggerCelebration()
    }
    onToggle(todo.id, todo.is_completed)
  }

  function handleDeleteClick() {
    isDeleting = true
    setTimeout(() => {
      onDelete(todo.id)
    }, 200)
  }

  // Format Due Date
  function formatDueDate(dateStr) {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return { text: 'Due Today', isToday: true, isOverdue: false }
    if (diffDays === 1) return { text: 'Tomorrow', isToday: false, isOverdue: false }
    if (diffDays < 0) return { text: 'Overdue', isToday: false, isOverdue: true }

    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: false,
      isOverdue: false,
    }
  }

  const dueInfo = $derived(formatDueDate(todo.due_date))

  // Category Color Map
  function getCategoryClass(cat) {
    switch (cat) {
      case 'Self Care':
        return 'cat-rose'
      case 'Work & Study':
        return 'cat-peach'
      case 'Home & Cozy':
        return 'cat-butter'
      case 'Wellness':
        return 'cat-sage'
      case 'Personal':
      default:
        return 'cat-lavender'
    }
  }

  // Priority Label
  function getPriorityLabel(p) {
    if (p === 'high') return 'Priority'
    if (p === 'low') return 'Gentle'
    return 'Balanced'
  }
</script>

<div
  class="todo-card {todo.is_completed ? 'completed' : ''} {isDeleting ? 'deleting' : ''}"
>
  <div class="todo-main-row">
    <!-- Checkbox -->
    <button
      type="button"
      class="custom-checkbox {todo.is_completed ? 'checked' : ''}"
      onclick={handleCheck}
      aria-label={todo.is_completed ? 'Mark incomplete' : 'Mark completed'}
    >
      {#if todo.is_completed}
        <Icon name="check" size={14} strokeWidth={2.4} />
      {/if}
    </button>

    <!-- Content -->
    <div class="todo-content" onclick={() => (isExpanded = !isExpanded)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && (isExpanded = !isExpanded)}>
      <div class="title-and-badges">
        <span class="todo-title {todo.is_completed ? 'done-title' : ''}">
          {todo.title}
        </span>
      </div>

      <!-- Badges -->
      <div class="badges-row">
        <!-- Category Badge -->
        <span class="badge {getCategoryClass(todo.category)}">
          {todo.category}
        </span>

        <!-- Priority Badge -->
        <span class="badge priority-{todo.priority}">
          {getPriorityLabel(todo.priority)}
        </span>

        <!-- Due Date -->
        {#if dueInfo}
          <span
            class="badge due-badge {dueInfo.isToday ? 'due-today' : ''} {dueInfo.isOverdue ? 'due-overdue' : ''}"
          >
            <Icon name="calendar" size={11} />
            <span>{dueInfo.text}</span>
          </span>
        {/if}
      </div>

      <!-- Optional description -->
      {#if todo.description}
        <p class="todo-description {isExpanded ? 'expanded' : ''}">
          {todo.description}
        </p>
      {/if}
    </div>

    <!-- Actions -->
    <div class="todo-actions">
      <button
        type="button"
        class="action-btn edit-btn"
        onclick={() => onEdit(todo)}
        title="Edit details"
        aria-label="Edit todo"
      >
        <Icon name="pencil" size={15} />
      </button>

      <button
        type="button"
        class="action-btn delete-btn"
        onclick={handleDeleteClick}
        title="Remove"
        aria-label="Delete todo"
      >
        <Icon name="trash" size={15} />
      </button>
    </div>
  </div>
</div>

<style>
  .todo-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 12px;
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }

  .todo-card:hover {
    box-shadow: var(--shadow-card);
    border-color: var(--border-hover);
    transform: translateY(-1px);
  }

  .todo-card.completed {
    background: #FAF7F5;
    opacity: 0.85;
  }

  .todo-card.deleting {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }

  .todo-main-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  /* Custom Circular Checkbox */
  .custom-checkbox {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #E5BAC3;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    flex-shrink: 0;
    color: #FFFFFF;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .custom-checkbox:hover {
    border-color: var(--rose-primary);
    transform: scale(1.08);
  }

  .custom-checkbox.checked {
    background: var(--rose-primary);
    border-color: var(--rose-primary);
    box-shadow: 0 2px 8px rgba(217, 119, 132, 0.35);
  }

  .todo-content {
    flex: 1;
    cursor: pointer;
  }

  .todo-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-main);
    line-height: 1.4;
    transition: var(--transition-smooth);
    display: inline-block;
  }

  .todo-title.done-title {
    color: var(--text-subtle);
    text-decoration: line-through;
    text-decoration-color: #E298A5;
    text-decoration-thickness: 1.5px;
  }

  .badges-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: var(--radius-full);
  }

  /* Categories */
  .cat-rose {
    background: var(--rose-light);
    color: var(--rose-text);
  }

  .cat-peach {
    background: var(--peach-bg);
    color: var(--peach-text);
  }

  .cat-butter {
    background: var(--butter-bg);
    color: var(--butter-text);
  }

  .cat-sage {
    background: var(--sage-bg);
    color: var(--sage-text);
  }

  .cat-lavender {
    background: var(--lavender-bg);
    color: var(--lavender-text);
  }

  /* Priority */
  .priority-high {
    background: #FDE8E9;
    color: #9B3948;
    font-weight: 600;
  }

  .priority-medium {
    background: #FDF3E7;
    color: #8C551F;
  }

  .priority-low {
    background: #EEF5EE;
    color: #436A47;
  }

  /* Due Date */
  .due-badge {
    background: var(--bg-surface-muted);
    color: var(--text-muted);
    border: 1px solid var(--border-light);
  }

  .due-badge.due-today {
    background: #FCECEF;
    color: var(--rose-text);
    border-color: #F3CBD3;
    font-weight: 600;
  }

  .due-badge.due-overdue {
    background: #FDE8E8;
    color: #A33A3A;
    border-color: #F8B4B4;
    font-weight: 600;
  }

  .todo-description {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 6px;
    line-height: 1.45;
    white-space: pre-line;
  }

  .todo-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.7;
    transition: var(--transition-smooth);
  }

  .todo-card:hover .todo-actions {
    opacity: 1;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-subtle);
    transition: var(--transition-smooth);
  }

  .edit-btn:hover {
    color: var(--rose-primary);
    background: var(--rose-light);
  }

  .delete-btn:hover {
    color: #B53F4F;
    background: #FCE8E8;
  }
</style>
