<script>
  import { onMount, onDestroy } from 'svelte'
  import Header from './lib/components/Header.svelte'
  import StatsBanner from './lib/components/StatsBanner.svelte'
  import TodoForm from './lib/components/TodoForm.svelte'
  import TodoFilter from './lib/components/TodoFilter.svelte'
  import TodoItem from './lib/components/TodoItem.svelte'
  import EditTodoModal from './lib/components/EditTodoModal.svelte'
  import SupabaseModal from './lib/components/SupabaseModal.svelte'
  import Icon from './lib/components/Icon.svelte'
  import {
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  } from './lib/todoService.js'
  import { getSupabase, getCredentials } from './lib/supabase.js'

  // State management with Svelte 5 Runes
  let todos = $state([])
  let isLoading = $state(true)
  let isSupabaseConnected = $state(false)
  let activeFilter = $state('all') // 'all' | 'active' | 'completed'
  let selectedCategory = $state('all')
  let searchQuery = $state('')
  let sortBy = $state('newest') // 'newest' | 'oldest' | 'due_date' | 'priority'

  // Modals state
  let isSupabaseModalOpen = $state(false)
  let editingTodo = $state(null)

  // Realtime subscription channel
  let realtimeChannel = null

  // Fetch all tasks
  async function loadTodos() {
    isLoading = true
    try {
      const res = await fetchTodos()
      todos = res.data || []
      isSupabaseConnected = res.isSupabase
    } catch (err) {
      console.error('Failed to load todos:', err)
    } finally {
      isLoading = false
    }
  }

  // Subscribe to Supabase realtime changes
  function setupRealtime() {
    const supabase = getSupabase()
    if (!supabase) return

    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }

    realtimeChannel = supabase
      .channel('public:todos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            todos = [payload.new, ...todos.filter((t) => t.id !== payload.new.id)]
          } else if (payload.eventType === 'UPDATE') {
            todos = todos.map((t) => (t.id === payload.new.id ? payload.new : t))
          } else if (payload.eventType === 'DELETE') {
            todos = todos.filter((t) => t.id !== payload.old.id)
          }
        }
      )
      .subscribe()
  }

  onMount(async () => {
    const creds = getCredentials()
    isSupabaseConnected = creds.isValid
    await loadTodos()
    if (isSupabaseConnected) {
      setupRealtime()
    }
  })

  onDestroy(() => {
    if (realtimeChannel) {
      const supabase = getSupabase()
      supabase?.removeChannel(realtimeChannel)
    }
  })

  // CRUD Operations
  async function handleAddTodo(todoInput) {
    const res = await addTodo(todoInput)
    if (res.data) {
      todos = [res.data, ...todos]
    }
  }

  async function handleToggleTodo(id, currentStatus) {
    // Optimistic UI update
    todos = todos.map((t) => (t.id === id ? { ...t, is_completed: !currentStatus } : t))
    await toggleTodo(id, currentStatus)
  }

  async function handleUpdateTodo(id, updates) {
    todos = todos.map((t) => (t.id === id ? { ...t, ...updates } : t))
    await updateTodo(id, updates)
  }

  async function handleDeleteTodo(id) {
    todos = todos.filter((t) => t.id !== id)
    await deleteTodo(id)
  }

  function handleConnectionChanged(connected) {
    isSupabaseConnected = connected
    loadTodos()
    if (connected) {
      setupRealtime()
    }
  }

  // Derived counts for filters
  let filterCounts = $derived({
    all: todos.length,
    active: todos.filter((t) => !t.is_completed).length,
    completed: todos.filter((t) => t.is_completed).length,
  })

  // Priority weight for sorting
  const priorityWeights = { high: 3, medium: 2, low: 1 }

  // Filtered and Sorted list
  let filteredTodos = $derived.by(() => {
    let list = [...todos]

    // 1. Filter by Status
    if (activeFilter === 'active') {
      list = list.filter((t) => !t.is_completed)
    } else if (activeFilter === 'completed') {
      list = list.filter((t) => t.is_completed)
    }

    // 2. Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory)
    }

    // 3. Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query)) ||
          t.category.toLowerCase().includes(query)
      )
    }

    // 4. Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      }
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      }
      if (sortBy === 'priority') {
        return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
      }
      return 0
    })

    return list
  })
</script>

<div class="app-layout">
  <div class="planner-wrapper">
    <!-- Header -->
    <Header
      completedCount={filterCounts.completed}
      totalCount={filterCounts.all}
      {isSupabaseConnected}
      onOpenSupabaseModal={() => (isSupabaseModalOpen = true)}
    />

    <!-- Quick Stats -->
    <StatsBanner {todos} />

    <!-- Create Task Form -->
    <TodoForm onAddTodo={handleAddTodo} />

    <!-- Filters & Search -->
    <TodoFilter
      {activeFilter}
      {selectedCategory}
      {searchQuery}
      {sortBy}
      counts={filterCounts}
      onFilterChange={(f) => (activeFilter = f)}
      onCategoryChange={(c) => (selectedCategory = c)}
      onSearchChange={(s) => (searchQuery = s)}
      onSortChange={(s) => (sortBy = s)}
    />

    <!-- Todo List Items -->
    <main class="todo-list-container">
      {#if isLoading}
        <div class="state-card">
          <Icon name="refresh" size={24} class="spinning rose-icon" />
          <p class="state-text">Gathering your intentions...</p>
        </div>
      {:else if filteredTodos.length === 0}
        <div class="state-card empty">
          <div class="empty-icon-circle">
            <Icon name="heart" size={26} />
          </div>
          <h3 class="empty-title">All peaceful here</h3>
          <p class="empty-desc">
            {#if searchQuery}
              No tasks match "{searchQuery}". Try a different keyword or reset filters.
            {:else if activeFilter === 'completed'}
              No completed tasks yet. Take it one gentle step at a time!
            {:else if activeFilter === 'active'}
              All caught up! Time for tea, rest, or adding a fresh thought.
            {:else}
              Your list is clean and open. What would bring joy to your day?
            {/if}
          </p>
        </div>
      {:else}
        <div class="todos-stack">
          {#each filteredTodos as todo (todo.id)}
            <TodoItem
              {todo}
              onToggle={handleToggleTodo}
              onEdit={(item) => (editingTodo = item)}
              onDelete={handleDeleteTodo}
            />
          {/each}
        </div>
      {/if}
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p class="footer-brand">
          <Icon name="sparkles" size={13} />
          <span>Ch&eacute;rie Planner &bull; A warm, gentle space for your day</span>
        </p>
        <button
          type="button"
          class="footer-link"
          onclick={() => (isSupabaseModalOpen = true)}
        >
          <Icon name="database" size={13} />
          <span>{isSupabaseConnected ? 'Database Connected' : 'Connect Supabase Cloud'}</span>
        </button>
      </div>
    </footer>
  </div>
</div>

<!-- Edit Modal -->
{#if editingTodo}
  <EditTodoModal
    todo={editingTodo}
    onSave={handleUpdateTodo}
    onClose={() => (editingTodo = null)}
  />
{/if}

<!-- Supabase Setup Modal -->
<SupabaseModal
  isOpen={isSupabaseModalOpen}
  onClose={() => (isSupabaseModalOpen = false)}
  onConnectionChanged={handleConnectionChanged}
/>

<style>
  .app-layout {
    min-height: 100vh;
    padding: 40px 20px 60px;
    display: flex;
    justify-content: center;
  }

  .planner-wrapper {
    width: 100%;
    max-width: 840px;
  }

  .todo-list-container {
    margin-bottom: 32px;
  }

  .todos-stack {
    display: flex;
    flex-direction: column;
  }

  .state-card {
    background: var(--bg-surface);
    border: 1px dashed var(--border-light);
    border-radius: var(--radius-xl);
    padding: 48px 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .state-card.empty {
    border-style: solid;
    box-shadow: var(--shadow-sm);
  }

  .empty-icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--rose-light);
    color: var(--rose-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    border: 1px solid var(--rose-border);
  }

  .empty-title {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 6px;
  }

  .empty-desc {
    font-size: 14px;
    color: var(--text-muted);
    max-width: 380px;
    line-height: 1.5;
  }

  :global(.rose-icon) {
    color: var(--rose-primary);
  }

  .state-text {
    font-size: 14px;
    color: var(--text-muted);
    margin-top: 12px;
  }

  .app-footer {
    padding-top: 24px;
    border-top: 1px solid var(--border-light);
    margin-top: 40px;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--rose-text);
    font-weight: 500;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    background: var(--rose-light);
    border: 1px solid var(--rose-border);
    transition: var(--transition-smooth);
  }

  .footer-link:hover {
    background: #F8D8DE;
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    .app-layout {
      padding: 20px 12px 40px;
    }
    .footer-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>
