<script>
	let { feedback } = $props();
</script>

<div class="feedback-panel">
	<div class="panel-header">
		<h3>💬 Feedback</h3>
	</div>
	<div class="feedback-content">
		{#if feedback}
			<div class="feedback-message success">
				<span class="icon">✅</span>
				<p>{feedback}</p>
			</div>
		{:else}
			<p class="no-feedback">Run your code to see feedback here</p>
		{/if}
	</div>
</div>

<style>
	.feedback-panel {
		background-color: var(--panel-bg);
		border: 1px solid var(--blockpy-border);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.panel-header {
		background-color: var(--blockpy-success);
		color: white;
		padding: 0.75rem 1rem;
	}

	.panel-header h3 {
		font-size: 1rem;
		margin: 0;
	}

	.feedback-content {
		padding: 1rem;
		min-height: 120px;
	}

	.feedback-message {
		display: flex;
		gap: 1rem;
		align-items: start;
		padding: 1rem;
		border-radius: 4px;
		background-color: rgba(39, 174, 96, 0.1);
		border: 1px solid var(--blockpy-success);
	}

	.icon {
		font-size: 1.5rem;
	}

	.feedback-message p {
		margin: 0;
		flex: 1;
	}

	.no-feedback {
		color: #999;
		font-style: italic;
		margin: 0;
	}
</style>
