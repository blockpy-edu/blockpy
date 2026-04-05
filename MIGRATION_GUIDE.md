# Pyodide Migration Guide

## For Developers Continuing This Work

This guide provides practical steps for completing the Pyodide migration.

## Current State

✅ **Completed:**
- Pyodide adapter layer with Skulpt-compatible API
- All imports updated to use the adapter
- Build system configured correctly
- Documentation created

⚠️ **Needs Testing:**
- Actual execution with Pyodide runtime
- Error handling and display
- Trace functionality
- Input/output operations

❌ **Not Implemented:**
- Custom module ports (image, coverage, instructor utils, etc.)
- Pedal integration
- External ecosystem dependencies

## Testing the Port

### Step 1: Local Test Environment

1. Clone the repository on a machine with internet access:
```bash
git clone https://github.com/blockpy-edu/blockpy
cd blockpy
npm install --legacy-peer-deps
NODE_OPTIONS="--openssl-legacy-provider" npm run build
```

2. Start a local web server:
```bash
python3 -m http.server 8000
```

3. Open in browser:
```
http://localhost:8000/tests/pyodide_test.html
```

This simple test should load Pyodide and execute basic Python code.

### Step 2: Test Full BlockPy

1. Ensure you have the Blockly dependency:
```bash
cd ..
git clone https://github.com/google/blockly
cd blockpy
```

2. Open the main test page:
```
http://localhost:8000/tests/index.html
```

3. Try basic operations:
   - Run simple print statement
   - Test variable assignment
   - Check error handling
   - Test trace functionality

### Step 3: Debug Common Issues

#### Issue: Pyodide fails to load
**Solution:** Check browser console, ensure CDN is accessible, verify Pyodide URL is correct

#### Issue: Code doesn't execute
**Solution:** Check `engine.js` initialization, ensure `await Sk.initialize()` completes

#### Issue: Errors aren't displayed correctly
**Solution:** Update error formatting in `feedback.js` to handle Pyodide error format

## Porting Custom Modules

### Module: image.js

**Skulpt version:**
```javascript
// src/skulpt_modules/image.js
var $builtinmodule = function(name) {
    var mod = {};
    // Skulpt-specific image manipulation
    return mod;
};
```

**Pyodide version:**
To port, you need to:

1. Create a Python module that Pyodide can import:
```python
# Create image.py in Pyodide's file system
class Image:
    def __init__(self):
        self.data = None
    
    def open(self, url):
        # Fetch image from URL
        pass
    
    def show(self):
        # Display in browser
        pass
```

2. Register it with Pyodide:
```javascript
// In pyodide_adapter.js initialize()
await this.pyodide.runPythonAsync(`
import sys
sys.modules['image'] = ...
`);
```

### Module: sk_mod_instructor.js

This module provides instructor utilities. Port it as a Python package:

```python
# instructor.py
def get_model():
    """Access to the BlockPy model"""
    pass

def set_success(score=1.0):
    """Set student success"""
    pass

# etc.
```

Register with Pyodide and expose to JavaScript as needed.

### Module: coverage.js

For code coverage, consider using Python's built-in `trace` or `coverage` modules:

```javascript
// In pyodide_adapter.js
await this.pyodide.loadPackage('coverage');
await this.pyodide.runPythonAsync(`
import coverage
cov = coverage.Coverage()
`);
```

## Handling Async Operations

Pyodide is fully async. Update synchronous operations:

### Before (Skulpt):
```javascript
let result = Sk.parse(filename, code);
```

### After (Pyodide):
```javascript
let result = await Sk.parse(filename, code);
```

Make sure calling functions are async and use `await`.

## Error Handling Updates

Pyodide errors have different structure than Skulpt:

### Skulpt Error:
```javascript
{
    tp$name: "NameError",
    args: ...,
    traceback: [...]
}
```

### Pyodide Error:
```javascript
{
    message: "...",
    name: "PythonError",
    type: "NameError"
}
```

Update `feedback.js` to handle both formats or normalize them in the adapter.

## Trace Functionality

The `step()` function in `student.js` collects execution traces. With Pyodide:

1. Use Python's `sys.settrace()`:
```python
import sys

def trace_calls(frame, event, arg):
    # Collect trace data
    pass

sys.settrace(trace_calls)
```

2. Expose trace data to JavaScript:
```javascript
const traceData = await this.pyodide.globals.get('_blockpy_trace').toJs();
```

## Performance Optimization

### Lazy Loading
```javascript
// Don't initialize Pyodide until first execution
if (!this.pyodide) {
    await this.initialize();
}
```

### Caching
```javascript
// Cache Pyodide in Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

### Progress Indicator
```javascript
// Show loading indicator
this.main.model.execution.feedback.message("Loading Python environment...");
await Sk.initialize();
this.main.model.execution.feedback.message("Ready!");
```

## Integrating with Pedal

Pedal provides feedback for student code. With Pyodide:

1. Install Pedal as a Python package:
```javascript
await this.pyodide.loadPackage('micropip');
await this.pyodide.runPythonAsync(`
import micropip
await micropip.install('pedal')
`);
```

2. Or include Pedal source in virtual filesystem:
```javascript
await this.pyodide.FS.writeFile('/pedal.py', pedalSource);
```

## Testing Strategy

1. **Unit Tests:** Test adapter methods individually
2. **Integration Tests:** Test full execution flow
3. **Regression Tests:** Ensure existing functionality still works
4. **Performance Tests:** Measure initialization and execution time

### Example Unit Test:
```javascript
describe('PyodideAdapter', () => {
    it('should parse valid Python code', async () => {
        const adapter = new PyodideAdapter();
        await adapter.initialize();
        const result = adapter.parse('test.py', 'print("hello")');
        expect(result.success).toBe(true);
    });
});
```

## Rollback Procedure

If major issues arise:

1. Revert commits:
```bash
git revert HEAD~3..HEAD  # Revert last 3 commits
```

2. Or switch branches:
```bash
git checkout main
npm run build
```

3. Or use hybrid approach:
```javascript
// In blockpy.js
const USE_PYODIDE = false;
if (USE_PYODIDE) {
    import {Sk} from "./pyodide_adapter";
} else {
    // Use Skulpt
}
```

## Resources

- [Pyodide Documentation](https://pyodide.org/en/stable/)
- [Pyodide API Reference](https://pyodide.org/en/stable/usage/api/js-api.html)
- [Python in the Browser Guide](https://pyodide.org/en/stable/usage/quickstart.html)
- [Skulpt to Pyodide Migration](https://github.com/pyodide/pyodide/discussions/1234) (hypothetical)

## Common Pitfalls

1. **Forgetting await:** All Pyodide operations are async
2. **Memory leaks:** Properly clean up Python objects
3. **File system:** Pyodide's FS is in-memory, not persistent
4. **CORS issues:** Loading packages from CDN requires proper CORS
5. **Package size:** Don't load unnecessary packages

## Success Criteria

The migration is complete when:

- ✅ All existing test cases pass
- ✅ Code execution works identically to Skulpt version
- ✅ Trace functionality is fully operational
- ✅ Error messages are properly formatted
- ✅ Custom modules are ported or replaced
- ✅ Performance is acceptable (< 3s initialization, similar execution speed)
- ✅ Documentation is comprehensive
- ✅ No regressions in existing functionality

## Get Help

If you encounter issues:

1. Check browser console for errors
2. Review [PYODIDE_PORT.md](PYODIDE_PORT.md) for architecture details
3. Open an issue on GitHub with:
   - Browser version
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior

## Timeline Estimate

- Week 1: Testing and debugging basic execution
- Week 2: Porting custom modules
- Week 3: Trace functionality and error handling
- Week 4: Integration with Pedal and ecosystem
- Week 5: Performance optimization
- Week 6: Documentation and final testing

Good luck! The foundation is solid, and the remaining work is primarily testing and module porting.
