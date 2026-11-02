<script>
  import Icon from './Icon.svelte'

  let {
    completedCount = 0,
    totalCount = 0,
    isSupabaseConnected = false,
    onOpenSupabaseModal,
  } = $props()

  // Formatted soft date
  const today = new Date()
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  // Motivational quote
  const quotes = [
    'One gentle step at a time.',
    'Give yourself permission to pause and bloom.',
    'Small quiet steps make the sweetest progress.',
    'Focus on what brings calm to your day.',
    'Your time is precious; treat it with gentle care.',
  ]
  const currentQuote = quotes[today.getDate() % quotes.length]

  let progressPercent = $derived(
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  )
</script>

<header class="planner-header">
  <div class="header-top">
    <div class="brand">
      <div class="brand-badge">
        <Icon name="sparkles" size={15} />
        <span>GENTLE PLANNER</span>
      </div>
      <h1 class="brand-title">Today's Intentions</h1>
      <p class="brand-date">{dateFormatted} &bull; <span class="quote-text">{currentQuote}</span></p>
    </div>

    <div class="header-actions">
      <button
        class="db-badge {isSupabaseConnected ? 'connected' : 'local'}"
        onclick={onOpenSupabaseModal}
        title="Supabase Database Status"
      >
        <span class="status-dot"></span>
        <Icon name="database" size={14} />
        <span>{isSupabaseConnected ? 'Supabase Live' : 'Connect Supabase'}</span>
      </button>
    </div>
  </div>

  <!-- Progress Bar -->
  <div class="progress-section">
    <div class="progress-info">
      <span class="progress-label">Daily Harmony</span>
      <span class="progress-stats">
        <strong>{completedCount}</strong> of <strong>{totalCount}</strong> completed ({progressPercent}%)
      </span>
    </div>
    <div class="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" style="width: {progressPercent}%"></div>
    </div>
  </div>
</header>

<style>
  .planner-header {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: 28px 32px;
    box-shadow: var(--shadow-card);
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }

  .planner-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #F3CBD3 0%, #F7DBC7 50%, #DDD1EF 100%);
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--rose-light);
    color: var(--rose-text);
    border-radius: var(--radius-full);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
    border: 1px solid var(--rose-border);
  }

  .brand-title {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .brand-date {
    font-size: 14px;
    color: var(--text-muted);
  }

  .quote-text {
    font-style: italic;
    color: var(--rose-text);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .db-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 500;
    transition: var(--transition-smooth);
    border: 1px solid transparent;
  }

  .db-badge.connected {
    background: var(--sage-bg);
    color: var(--sage-text);
    border-color: var(--sage-border);
  }

  .db-badge.local {
    background: var(--rose-light);
    color: var(--rose-text);
    border-color: var(--rose-border);
  }

  .db-badge:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    display: inline-block;
  }

  .progress-section {
    background: var(--bg-surface-tint);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    margin-bottom: 10px;
  }

  .progress-label {
    font-weight: 600;
    color: var(--text-main);
  }

  .progress-stats {
    color: var(--text-muted);
  }

  .progress-stats strong {
    color: var(--rose-text);
  }

  .progress-track {
    height: 8px;
    background: #EFE4DC;
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #E88998, #F4A281);
    border-radius: var(--radius-full);
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (max-width: 640px) {
    .planner-header {
      padding: 20px;
    }
    .brand-title {
      font-size: 26px;
    }
    .header-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
