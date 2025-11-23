<script>
	let { editorMode, onRun, onReset, onModeChange } = $props();
</script>

<div class="toolbar">
	<div class="container">
		<div class="toolbar-content">
			<div class="toolbar-section">
				<h3 class="toolbar-title">Editor Mode</h3>
				<div class="button-group">
					<button 
						class="btn-mode {editorMode === 'python' ? 'active' : ''}"
						onclick={() => onModeChange('python')}
					>
						📝 Python
					</button>
					<button 
						class="btn-mode {editorMode === 'blocks' ? 'active' : ''}"
						onclick={() => onModeChange('blocks')}
					>
						🧩 Blocks
					</button>
					<button 
						class="btn-mode {editorMode === 'split' ? 'active' : ''}"
						onclick={() => onModeChange('split')}
					>
						↔️ Split
					</button>
				</div>
			</div>

			<div class="toolbar-section">
				<h3 class="toolbar-title">Actions</h3>
				<div class="button-group">
					<button class="btn-primary" onclick={onRun}>
						▶️ Run Code
					</button>
					<button class="btn-secondary" onclick={onReset}>
						🔄 Reset
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.toolbar {
		background-color: white;
		border-bottom: 2px solid var(--blockpy-border);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.toolbar-content {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		padding: 1rem 0;
		align-items: center;
	}

	.toolbar-section {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.toolbar-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--blockpy-dark);
		margin: 0;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	.btn-mode {
		background-color: var(--blockpy-light);
		color: var(--blockpy-dark);
		padding: 8px 16px;
		border-radius: 4px;
		border: 2px solid transparent;
		transition: all 0.2s;
	}

	.btn-mode.active {
		background-color: var(--blockpy-secondary);
		color: white;
		border-color: var(--blockpy-secondary);
	}

	.btn-mode:hover {
		border-color: var(--blockpy-secondary);
	}

	@media (max-width: 768px) {
		.toolbar-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
	}
</style>
