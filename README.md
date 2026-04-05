corgis-blockly
==============

![CORGIS BlockPy](images/blockly-corgi-logo.png?raw=true "CORGIS BlockPy")

BlockPy is a web-based Python environment that lets you work with blocks, text, or both. Designed for Data Science and equipped with powerful tools like the State Explorer and Guided Feedback, the goal of BlockPy is to let you solve authentic, real-world problems.

The goal of BlockPy is to give you a gentle introduction to Python but eventually mature you into a more serious programming environment (such as Spyder or PyCharm). Long-term, we may support some game/animation design stuff that Scratch/Snap does, but that's not the real goal.

The BlockPy project is aimed at solving some hard technical problems: having a block-based environment for a dynamic language can be tricky - are a given pair of square brackets representing list indexing or dictionary indexing? Our goal is to use advanced program analysis techniques to provide excellent support to learners.

## Recent Changes: Pyodide Port

**Note:** BlockPy has been ported from Skulpt to Pyodide for Python execution. This provides better Python compatibility and access to the full Python standard library. See [PYODIDE_PORT.md](PYODIDE_PORT.md) for detailed information about the changes.

### Key Benefits
- Full Python 3 compatibility (CPython via WebAssembly)
- Access to scientific libraries (NumPy, Pandas, etc.)
- Better performance for complex computations
- Active development and community support

### Migration Notes
The port uses an adapter layer that maintains Skulpt-compatible APIs, minimizing disruption to existing code. However, some Skulpt-specific modules need Pyodide equivalents (see documentation).

Overview
--------

The core architecture of BlockPy is a synthesis of:

* Blockly: a visual library for manipulating a block canvas that can generate equivalent textual code in a variety of languages
* **Pyodide** (formerly Skulpt): A full CPython runtime compiled to WebAssembly, providing complete Python 3 compatibility in the browser.

By combining these two technologies, we end up with a powerful system for writing Python code quickly. Everything is meant to run locally in the client, so there's no complexity of sandboxing students' code on the server.

Installation
------------

**Note on Pyodide:** With the migration to Pyodide, Skulpt is no longer required for basic BlockPy functionality. Pyodide is loaded from a CDN at runtime. However, for full ecosystem support (Pedal, Designer, etc.), you may still need some of the traditional dependencies.

### Minimal Installation (Pyodide-only)

For basic BlockPy with Pyodide:

```shell
$> git clone https://github.com/blockpy-edu/blockpy blockpy
$> cd blockpy
$> npm install --legacy-peer-deps
$> NODE_OPTIONS="--openssl-legacy-provider" npm run build
```

Then open `tests/index.html` in a modern browser with internet access (for Pyodide CDN).

### Full Installation (with all dependencies)

First, you're going to need all of our special dependencies. The final structure looks like this:

```
blockpy-edu/
  blockly/          # Required for block editor
  BlockMirror/      # Required for block-text conversion
  blockpy/          # This repository
  skulpt/           # (OPTIONAL - legacy support)
pedal-edu/
  pedal/            # (OPTIONAL - for feedback system)
  curriculum-ctvt   # (OPTIONAL)
  curriculum-sneks  # (OPTIONAL)
```

1. Create the top-level directories:

```shell
$> mkdir blockpy-edu
$> mkdir pedal-edu  # Optional
```

2. ~~Skulpt is probably the hardest dependency, since you will probably want to modify it.~~ 
   **Update:** Skulpt is now optional with Pyodide. Only needed for legacy compatibility.

Note from 4/4/2026: You need to use the `esbuild-source` branch nowadays.

```shell
# OPTIONAL - Only if you need Skulpt compatibility
$> cd blockpy-edu
$> git clone https://github.com/blockpy-edu/skulpt skulpt
$> cd skulpt
$> npm install
$> npm run devbuild
```

3. Install required dependencies (Blockly and BlockMirror):

```shell
$> cd blockpy-edu
$> git clone https://github.com/blockpy-edu/BlockMirror BlockMirror
$> git clone https://github.com/google/blockly blockly
```

4. Optional dependencies (Pedal feedback system and curricula):

```shell
$> cd ../pedal-edu
$> git clone https://github.com/pedal-edu/pedal pedal
$> git clone https://github.com/pedal-edu/curriculum-ctvt curriculum-ctvt
$> git clone https://github.com/pedal-edu/curriculum-sneks curriculum-sneks
```

5. Install BlockPy:

```shell
$> cd ../blockpy-edu/blockpy
$> npm install --legacy-peer-deps
$> NODE_OPTIONS="--openssl-legacy-provider" npm run build
```

That should rebuild the files into `dist`. You can then open `tests/index.html` and explore.
