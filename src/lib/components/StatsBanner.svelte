<script>
  import Icon from './Icon.svelte'

  let { todos = [] } = $props()

  let total = $derived(todos.length)
  let completed = $derived(todos.filter((t) => t.is_completed).length)
  let active = $derived(todos.filter((t) => !t.is_completed).length)
  let selfCareCount = $derived(
    todos.filter((t) => t.category === 'Self Care' || t.category === 'Wellness').length
  )
</script>

<div class="stats-grid">
  <!-- Total -->
  <div class="stat-card">
    <div class="stat-icon-wrapper rose">
      <Icon name="sparkles" size={16} />
    </div>
    <div class="stat-content">
      <span class="stat-num">{total}</span>
      <span class="stat-label">Total Intentions</span>
    </div>
  </div>

  <!-- Completed -->
  <div class="stat-card">
    <div class="stat-icon-wrapper sage">
      <Icon name="check-circle" size={16} />
    </div>
    <div class="stat-content">
      <span class="stat-num">{completed}</span>
      <span class="stat-label">Accomplished</span>
    </div>
  </div>

  <!-- Active / In Progress -->
  <div class="stat-card">
    <div class="stat-icon-wrapper peach">
      <Icon name="sliders" size={16} />
    </div>
    <div class="stat-content">
      <span class="stat-num">{active}</span>
      <span class="stat-label">In Gentle Flow</span>
    </div>
  </div>

  <!-- Self Care & Wellness -->
  <div class="stat-card">
    <div class="stat-icon-wrapper lavender">
      <Icon name="heart" size={16} />
    </div>
    <div class="stat-content">
      <span class="stat-num">{selfCareCount}</span>
      <span class="stat-label">Mind & Wellness</span>
    </div>
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 18px;
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    gap: 14px;
    transition: var(--transition-smooth);
  }

  .stat-card:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-card);
    border-color: var(--border-hover);
  }

  .stat-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-icon-wrapper.rose {
    background: var(--rose-light);
    color: var(--rose-primary);
  }

  .stat-icon-wrapper.sage {
    background: var(--sage-bg);
    color: var(--sage-text);
  }

  .stat-icon-wrapper.peach {
    background: var(--peach-bg);
    color: var(--peach-text);
  }

  .stat-icon-wrapper.lavender {
    background: var(--lavender-bg);
    color: var(--lavender-text);
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-num {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.1;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 440px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
