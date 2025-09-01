# BlockPy Development Instructions

BlockPy is a web-based Python environment combining visual blocks (Blockly) and text editing, with Skulpt for client-side Python execution. It's designed for data science education with guided feedback and state exploration tools.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Critical Setup Requirements

**NEVER CANCEL builds or long-running commands** - All build operations require completion for proper validation.

### Essential Dependencies and Timing

- **Node.js Compatibility**: Requires `NODE_OPTIONS="--openssl-legacy-provider"` for Node.js 17+ due to webpack 4.x compatibility
- **npm install**: Use `npm install --legacy-peer-deps` (takes ~32 seconds, NEVER CANCEL - set timeout to 60+ seconds)
- **Build process**: `NODE_OPTIONS="--openssl-legacy-provider" npm run build` (takes ~11 seconds, NEVER CANCEL - set timeout to 60+ seconds)  
- **Linting**: `npx eslint src/blockpy.js` (takes ~1.3 seconds)

### Working With This Repository

**CRITICAL**: This repository is part of a larger ecosystem and cannot run fully standalone. The complete setup requires multiple sibling repositories:

```
blockpy-edu/
  skulpt/          # Python-to-JS compiler
  blockly/         # Visual blocks library  
  BlockMirror/     # Block-text conversion
  blockpy/         # This repository
pedal-edu/
  pedal/           # Feedback system
  curriculum-ctvt/
  curriculum-sneks/
```

## Build and Development Commands

### Initial Setup
```bash
# Install dependencies (NEVER CANCEL - takes ~32 seconds)
npm install --legacy-peer-deps
```

### Building the Project
```bash
# Development build with watch mode (runs continuously)
NODE_OPTIONS="--openssl-legacy-provider" npm run dev

# Production build (NEVER CANCEL - takes ~11 seconds)  
NODE_OPTIONS="--openssl-legacy-provider" npm run build
```

### Code Quality
```bash
# Lint JavaScript code (~1.3 seconds)
npx eslint src/blockpy.js

# Lint all JS files in src/
npx eslint src/
```

### Testing the Build Output
```bash
# Start local web server for testing
python -m http.server 8000

# Access test page at: http://localhost:8000/tests/index.html
# NOTE: Full functionality requires complete ecosystem setup
```

## Validation Scenarios

**Always run these validation steps after making changes:**

1. **Build Validation**: Ensure webpack builds complete successfully and generates `dist/blockpy.js`, `dist/blockpy.css`, and `dist/blockpy.min.js`
2. **Lint Validation**: Run ESLint to catch code style issues before committing
3. **File Structure**: Verify dist files are created with expected sizes (~1.4MB blockpy.js, ~1MB blockpy.min.js, ~38KB blockpy.css)

## Important Limitations and Known Issues

### What Works in This Repository Alone:
- Build process (webpack compilation)
- Code linting (ESLint)
- Static file generation
- Basic web server hosting

### What Requires Full Ecosystem:
- **Complete application functionality** - needs skulpt, blockly, BlockMirror, pedal dependencies
- **Python code execution** - requires skulpt compiler from sibling directory
- **Visual block editing** - requires blockly from sibling directory  
- **Block-text conversion** - requires BlockMirror from sibling directory
- **Feedback system** - requires pedal modules from sibling directories

### Broken/Outdated Components:
- `build.py` - fails due to missing `src/interface.html` and `src/instructor/` directory
- `merge.py` - outdated file list, expects different src structure
- `npm test` - not configured, returns error
- Python preprocessing scripts are not needed with current webpack setup

## File Structure and Key Locations

### Critical Source Files:
- `src/blockpy.js` - Main entry point
- `src/editor/` - Editor components (Python, blocks, etc.)
- `src/engine/` - Execution engine and configurations
- `webpack.config.js` - Build configuration
- `tests/index.html` - Main test entry point (requires ecosystem)

### Generated Files (in dist/):
- `blockpy.js` - Development build (~1.4MB)
- `blockpy.min.js` - Production build (~1MB)
- `blockpy.css` - Stylesheets (~38KB)

### Configuration:
- `.eslintrc.json` - ESLint configuration
- `package.json` - npm dependencies and scripts
- `.babelrc` - Babel transpilation settings

## Common Development Tasks

### Making Code Changes:
1. Edit files in `src/` directory
2. Run `NODE_OPTIONS="--openssl-legacy-provider" npm run build`
3. Run `npx eslint src/` to check code quality
4. Test with `python -m http.server 8000` and verify dist files

### Before Committing:
1. **Always build**: `NODE_OPTIONS="--openssl-legacy-provider" npm run build`
2. **Always lint**: `npx eslint src/`
3. **Verify dist files**: Check that `dist/` contains updated builds
4. **Never commit** `node_modules/` or temporary files

### Debugging Build Issues:
- Ensure `NODE_OPTIONS="--openssl-legacy-provider"` is set for Node.js 17+
- Use `--legacy-peer-deps` flag for npm install if dependency conflicts occur
- Check webpack output for specific error messages
- Verify all source files exist before building

## Architecture Notes

BlockPy uses a component-based architecture with KnockoutJS for UI binding. The main execution flow:
1. User code → BlockPy Engine → Configuration classes → Skulpt execution  
2. Results → Feedback system → UI updates
3. Editor synchronization between blocks and text via BlockMirror

Key components:
- **Editors**: Python, blocks, markdown, JSON, etc. (`src/editor/`)
- **Engine**: Code execution and configurations (`src/engine/`)
- **Feedback**: Result processing and presentation (`src/feedback.js`)
- **Interface**: UI components and layouts (`src/interface.js`)

**Remember: This codebase is part of a larger educational platform. For full functionality, the complete ecosystem setup is required as described in the main README.md.**