<script>
	let { output } = $props();
</script>

<div class="console-panel">
	<div class="panel-header">
		<h3>🖥️ Console Output</h3>
	</div>
	<div class="console-content">
		{#if output}
			<pre class="console-output">{output}</pre>
		{:else}
			<p class="no-output">Console output will appear here when you run your code</p>
		{/if}
	</div>
</div>

<style>
	.console-panel {
		background-color: var(--panel-bg);
		border: 1px solid var(--blockpy-border);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.panel-header {
		background-color: var(--blockpy-dark);
		color: white;
		padding: 0.75rem 1rem;
	}

	.panel-header h3 {
		font-size: 1rem;
		margin: 0;
	}

	.console-content {
		padding: 1rem;
		min-height: 200px;
		max-height: 300px;
		overflow-y: auto;
		background-color: #1e1e1e;
	}

	.console-output {
		margin: 0;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
		font-size: 13px;
		line-height: 1.5;
		color: #00ff00;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.no-output {
		color: #666;
		font-style: italic;
		margin: 0;
	}
</style>
