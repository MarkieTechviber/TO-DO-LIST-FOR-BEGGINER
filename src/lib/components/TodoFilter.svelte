<script>
  import Icon from './Icon.svelte'

  let {
    activeFilter = 'all',
    selectedCategory = 'all',
    searchQuery = '',
    sortBy = 'newest',
    counts = { all: 0, active: 0, completed: 0 },
    onFilterChange,
    onCategoryChange,
    onSearchChange,
    onSortChange,
  } = $props()

  const categories = [
    'all',
    'Self Care',
    'Work & Study',
    'Home & Cozy',
    'Wellness',
    'Personal',
  ]
</script>

<div class="filter-container">
  <!-- Search & Tabs Row -->
  <div class="filter-top-row">
    <!-- Status Tabs -->
    <div class="status-tabs" role="tablist">
      <button
        role="tab"
        aria-selected={activeFilter === 'all'}
        class="tab-btn {activeFilter === 'all' ? 'active' : ''}"
        onclick={() => onFilterChange('all')}
      >
        <span>All</span>
        <span class="count-bubble">{counts.all}</span>
      </button>

      <button
        role="tab"
        aria-selected={activeFilter === 'active'}
        class="tab-btn {activeFilter === 'active' ? 'active' : ''}"
        onclick={() => onFilterChange('active')}
      >
        <span>Active</span>
        <span class="count-bubble">{counts.active}</span>
      </button>

      <button
        role="tab"
        aria-selected={activeFilter === 'completed'}
        class="tab-btn {activeFilter === 'completed' ? 'active' : ''}"
        onclick={() => onFilterChange('completed')}
      >
        <span>Completed</span>
        <span class="count-bubble">{counts.completed}</span>
      </button>
    </div>

    <!-- Search Input -->
    <div class="search-box">
      <Icon name="search" size={15} class="search-icon" />
      <input
        type="text"
        value={searchQuery}
        oninput={(e) => onSearchChange(e.currentTarget.value)}
        placeholder="Filter your list..."
        class="search-input"
      />
      {#if searchQuery}
        <button
          type="button"
          class="clear-btn"
          onclick={() => onSearchChange('')}
          aria-label="Clear search"
        >
          <Icon name="x" size={13} />
        </button>
      {/if}
    </div>
  </div>

  <!-- Category & Sort Row -->
  <div class="filter-bottom-row">
    <div class="category-scroll">
      {#each categories as cat}
        <button
          type="button"
          class="cat-chip {selectedCategory === cat ? 'active' : ''}"
          onclick={() => onCategoryChange(cat)}
        >
          {cat === 'all' ? 'All Collections' : cat}
        </button>
      {/each}
    </div>

    <div class="sort-wrapper">
      <label for="sort-select" class="sort-label">Sort:</label>
      <select
        id="sort-select"
        value={sortBy}
        onchange={(e) => onSortChange(e.currentTarget.value)}
        class="sort-select"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="due_date">Due Date</option>
        <option value="priority">Priority</option>
      </select>
    </div>
  </div>
</div>

<style>
  .filter-container {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .filter-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .status-tabs {
    display: flex;
    gap: 6px;
    background: var(--bg-surface-muted);
    padding: 4px;
    border-radius: var(--radius-full);
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    transition: var(--transition-smooth);
  }

  .tab-btn.active {
    background: #ffffff;
    color: var(--text-main);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }

  .count-bubble {
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: var(--radius-full);
    background: var(--rose-light);
    color: var(--rose-text);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface-tint);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-full);
    padding: 6px 14px;
    width: 240px;
    transition: var(--transition-smooth);
  }

  .search-box:focus-within {
    border-color: var(--border-focus);
    background: #ffffff;
    width: 270px;
  }

  :global(.search-icon) {
    color: var(--text-subtle);
  }

  .search-input {
    border: none;
    background: transparent;
    font-size: 13px;
    color: var(--text-main);
    width: 100%;
  }

  .search-input::placeholder {
    color: var(--text-subtle);
  }

  .clear-btn {
    color: var(--text-subtle);
    display: flex;
    align-items: center;
  }

  .clear-btn:hover {
    color: var(--text-main);
  }

  .filter-bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding-top: 10px;
    border-top: 1px solid var(--border-light);
  }

  .category-scroll {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .cat-chip {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-light);
    background: var(--bg-surface-muted);
    color: var(--text-muted);
    white-space: nowrap;
    transition: var(--transition-smooth);
  }

  .cat-chip:hover {
    border-color: var(--border-hover);
    color: var(--text-main);
  }

  .cat-chip.active {
    background: var(--rose-light);
    border-color: var(--rose-border);
    color: var(--rose-text);
    font-weight: 600;
  }

  .sort-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sort-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .sort-select {
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    font-size: 12px;
    background: var(--bg-surface);
    color: var(--text-body);
  }

  .sort-select:focus {
    border-color: var(--border-focus);
  }

  @media (max-width: 640px) {
    .filter-top-row {
      flex-direction: column;
      align-items: stretch;
    }
    .search-box {
      width: 100% !important;
    }
    .filter-bottom-row {
      flex-direction: column;
      align-items: stretch;
    }
    .sort-wrapper {
      justify-content: flex-end;
    }
  }
</style>
