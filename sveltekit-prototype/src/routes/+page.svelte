<script>
	import Toolbar from '$lib/components/Toolbar.svelte';
	import EditorPanel from '$lib/components/EditorPanel.svelte';
	import FeedbackPanel from '$lib/components/FeedbackPanel.svelte';
	import ConsolePanel from '$lib/components/ConsolePanel.svelte';

	let code = $state(`# Welcome to BlockPy SvelteKit Prototype!
# This is a demonstration of what BlockPy could look like in SvelteKit

def greet(name):
    """Greet someone by name"""
    return f"Hello, {name}!"

# Example usage
message = greet("World")
print(message)

# Try creating a simple data analysis
data = [1, 2, 3, 4, 5]
average = sum(data) / len(data)
print(f"Average: {average}")
`);

	let output = $state('');
	let feedback = $state('');
	let editorMode = $state('python');

	function runCode() {
		// Simulated code execution
		output = '> Running code...\n';
		output += 'Hello, World!\n';
		output += 'Average: 3.0\n';
		output += '> Program completed successfully';
		
		feedback = 'Great job! Your code ran without errors.';
	}

	function resetCode() {
		code = `# Start coding here\n\nprint("Hello, BlockPy!")`;
		output = '';
		feedback = '';
	}

	function changeEditorMode(mode) {
		editorMode = mode;
	}
</script>

<div class="blockpy-container">
	<header class="header">
		<div class="container">
			<h1 class="title">
				<span class="logo">🐕</span>
				BlockPy SvelteKit Prototype
			</h1>
			<p class="subtitle">A modern web-based Python environment</p>
		</div>
	</header>

	<Toolbar 
		{editorMode} 
		onRun={runCode} 
		onReset={resetCode}
		onModeChange={changeEditorMode}
	/>

	<main class="main-content">
		<div class="container">
			<div class="workspace">
				<div class="left-panel">
					<EditorPanel bind:code {editorMode} />
				</div>
				<div class="right-panel">
					<FeedbackPanel {feedback} />
					<ConsolePanel {output} />
				</div>
			</div>
		</div>
	</main>

	<footer class="footer">
		<div class="container">
			<p>BlockPy SvelteKit Prototype v0.1.0 | Built with SvelteKit</p>
		</div>
	</footer>
</div>

<style>
	.blockpy-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.header {
		background: linear-gradient(135deg, var(--blockpy-primary) 0%, var(--blockpy-secondary) 100%);
		color: white;
		padding: 2rem 0 1.5rem 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.logo {
		font-size: 2.5rem;
	}

	.subtitle {
		margin: 0;
		opacity: 0.9;
		font-size: 1rem;
	}

	.main-content {
		flex: 1;
		padding: 1.5rem 0;
	}

	.workspace {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.left-panel,
	.right-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.footer {
		background-color: var(--blockpy-dark);
		color: white;
		padding: 1rem 0;
		margin-top: 2rem;
		text-align: center;
	}

	.footer p {
		margin: 0;
		font-size: 0.9rem;
		opacity: 0.8;
	}

	@media (max-width: 968px) {
		.workspace {
			grid-template-columns: 1fr;
		}
	}
</style>
