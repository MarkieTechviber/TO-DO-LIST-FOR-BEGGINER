<script>
  import Icon from './Icon.svelte'

  let { todos = [] } = $props()

  let total = $derived(todos.length)
  let completed = $derived(todos.filter((t) => t.is_completed).length)
  let active = $derived(todos.filter((t) => !t.is_completed).length)
  let selfCareCount = $derived(
    todos.filter((t) => t.category === 'Self Care' || t.category === 'Wellness').length
  )

  // Categories breakdown
  const categoryList = [
    { name: 'Self Care', color: 'rose' },
    { name: 'Work & Study', color: 'peach' },
    { name: 'Home & Cozy', color: 'butter' },
    { name: 'Wellness', color: 'sage' },
    { name: 'Personal', color: 'lavender' },
  ]

  let categoryCounts = $derived(
    categoryList.map((cat) => ({
      ...cat,
      count: todos.filter((t) => t.category === cat.name).length,
    }))
  )
</script>

<div class="sidebar-wrapper">
  <!-- Section Title -->
  <div class="sidebar-header">
    <div class="header-badge">
      <Icon name="sparkles" size={13} />
      <span>DAILY PULSE</span>
    </div>
    <h3 class="sidebar-title">Progress Overview</h3>
  </div>

  <!-- The 4 Boxes on the Right -->
  <div class="stats-grid-2x2">
    <!-- Box 1: Total Intentions -->
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon rose">
          <Icon name="sparkles" size={15} />
        </div>
        <span class="stat-num">{total}</span>
      </div>
      <span class="stat-label">Total Intentions</span>
    </div>

    <!-- Box 2: Accomplished -->
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon sage">
          <Icon name="check-circle" size={15} />
        </div>
        <span class="stat-num">{completed}</span>
      </div>
      <span class="stat-label">Accomplished</span>
    </div>

    <!-- Box 3: In Gentle Flow -->
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon peach">
          <Icon name="sliders" size={15} />
        </div>
        <span class="stat-num">{active}</span>
      </div>
      <span class="stat-label">In Gentle Flow</span>
    </div>

    <!-- Box 4: Mind & Wellness -->
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon lavender">
          <Icon name="heart" size={15} />
        </div>
        <span class="stat-num">{selfCareCount}</span>
      </div>
      <span class="stat-label">Mind & Wellness</span>
    </div>
  </div>

  <!-- Collections Breakdown Card -->
  <div class="cozy-card collections-card">
    <h4 class="card-subtitle">
      <Icon name="tag" size={13} />
      <span>Collection Balance</span>
    </h4>
    <div class="collections-list">
      {#each categoryCounts as cat}
        <div class="collection-row">
          <div class="collection-name-group">
            <span class="dot {cat.color}"></span>
            <span class="cat-text">{cat.name}</span>
          </div>
          <span class="cat-count">{cat.count}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Cozy Reminder Card -->
  <div class="cozy-card reminder-card">
    <div class="reminder-icon">
      <Icon name="heart" size={16} />
    </div>
    <div class="reminder-content">
      <p class="reminder-text">
        "One calm, gentle step at a time. Honor your pace and cherish your small wins."
      </p>
    </div>
  </div>
</div>

<style>
  .sidebar-wrapper {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .sidebar-header {
    margin-bottom: 2px;
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    background: var(--rose-light);
    color: var(--rose-text);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
    border: 1px solid var(--rose-border);
  }

  .sidebar-title {
    font-family: var(--font-heading);
    font-size: 19px;
    font-weight: 600;
    color: var(--text-main);
  }

  /* The 4 Boxes in a 2x2 grid */
  .stats-grid-2x2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 14px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: var(--transition-smooth);
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
    border-color: var(--border-hover);
  }

  .stat-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon.rose {
    background: var(--rose-light);
    color: var(--rose-primary);
  }

  .stat-icon.sage {
    background: var(--sage-bg);
    color: var(--sage-text);
  }

  .stat-icon.peach {
    background: var(--peach-bg);
    color: var(--peach-text);
  }

  .stat-icon.lavender {
    background: var(--lavender-bg);
    color: var(--lavender-text);
  }

  .stat-num {
    font-family: var(--font-heading);
    font-size: 24px;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
  }

  /* Cozy Cards */
  .cozy-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    box-shadow: var(--shadow-sm);
  }

  .card-subtitle {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 12px;
  }

  .collections-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .collection-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .collection-name-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot.rose { background: #E07A8A; }
  .dot.peach { background: #F4A261; }
  .dot.butter { background: #E9C46A; }
  .dot.sage { background: #8AB17D; }
  .dot.lavender { background: #A78BFA; }

  .cat-text {
    color: var(--text-body);
  }

  .cat-count {
    font-weight: 600;
    color: var(--text-muted);
    font-size: 12px;
    padding: 1px 7px;
    border-radius: var(--radius-full);
    background: var(--bg-surface-muted);
  }

  .reminder-card {
    background: var(--bg-surface-tint);
    border: 1px dashed var(--border-light);
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .reminder-icon {
    color: var(--rose-primary);
    margin-top: 2px;
  }

  .reminder-text {
    font-size: 13px;
    font-style: italic;
    color: var(--text-muted);
    line-height: 1.5;
  }
</style>
