<script>
	let { code, editorMode } = $props();
</script>

<div class="editor-panel">
	<div class="panel-header">
		<h3>Code Editor</h3>
		<span class="mode-indicator">{editorMode === 'python' ? '📝 Python' : editorMode === 'blocks' ? '🧩 Blocks' : '↔️ Split'}</span>
	</div>
	<div class="editor-content">
		{#if editorMode === 'blocks'}
			<div class="blocks-placeholder">
				<p>🧩 Block Editor Placeholder</p>
				<p class="help-text">In the full application, this would display the Blockly visual editor</p>
			</div>
		{:else if editorMode === 'split'}
			<div class="split-editor">
				<div class="split-section">
					<h4>Blocks</h4>
					<div class="blocks-placeholder small">
						<p>🧩 Blocks</p>
					</div>
				</div>
				<div class="split-section">
					<h4>Python</h4>
					<textarea bind:value={code} placeholder="Write your Python code here..."></textarea>
				</div>
			</div>
		{:else}
			<textarea bind:value={code} placeholder="Write your Python code here..."></textarea>
		{/if}
	</div>
</div>

<style>
	.editor-panel {
		background-color: var(--panel-bg);
		border: 1px solid var(--blockpy-border);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		height: 500px;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		background-color: var(--blockpy-primary);
		color: white;
		padding: 0.75rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.panel-header h3 {
		font-size: 1rem;
		margin: 0;
	}

	.mode-indicator {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.editor-content {
		flex: 1;
		padding: 1rem;
		overflow: auto;
	}

	textarea {
		height: 100%;
		font-size: 14px;
		line-height: 1.5;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
	}

	.blocks-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 4px;
		color: white;
		text-align: center;
		padding: 2rem;
	}

	.blocks-placeholder p {
		margin: 0.5rem 0;
		font-size: 1.2rem;
	}

	.help-text {
		font-size: 0.9rem !important;
		opacity: 0.8;
		max-width: 300px;
	}

	.split-editor {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		height: 100%;
	}

	.split-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.split-section h4 {
		margin: 0;
		font-size: 0.9rem;
		color: var(--blockpy-dark);
	}

	.split-section textarea {
		flex: 1;
		min-height: 150px;
	}

	.blocks-placeholder.small {
		min-height: 200px;
		padding: 1rem;
	}

	.blocks-placeholder.small p {
		font-size: 1rem;
	}
</style>
