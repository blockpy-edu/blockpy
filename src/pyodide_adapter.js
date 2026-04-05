/**
 * @fileoverview Pyodide adapter layer that provides a Skulpt-compatible API
 * This allows gradual migration from Skulpt to Pyodide while maintaining
 * compatibility with existing BlockPy code.
 */

/**
 * PyodideAdapter - Main adapter class that wraps Pyodide with Skulpt-like API
 */
export class PyodideAdapter {
    constructor() {
        this.pyodide = null;
        this.initialized = false;
        this.globalNamespace = null;
        this.pythonVersion = 3;
        
        // Configuration options (Skulpt-compatible)
        this.execLimit = 5000;
        this.execLimitFunction = () => 5000;
        this.retainGlobals = false;
        this.globals = {};
        
        // Hooks and callbacks
        this.afterSingleExecution = null;
        this.beforeCall = null;
        this.timeoutHandler = null;
        this.inBrowser = null;
        this.fileToURL = null;
        this.requestsGet = null;
        
        // Module and file management
        this.builtinFiles = {files: {}};
        this.sysmodules = null;
        
        // Runtime state
        this.executionReports = {};
        this.console = null;
        this.queuedInput = [];
        this.environ = null;
        
        // Configuration
        this.currentConfig = {};
    }
    
    /**
     * Initialize Pyodide runtime
     */
    async initialize() {
        if (this.initialized) {
            return this.pyodide;
        }
        
        try {
            // Load Pyodide from CDN
            this.pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            
            // Set up Python environment
            await this.pyodide.runPythonAsync(`
import sys
import io
import traceback
from js import Object

# Create a namespace for globals
_blockpy_globals = {}
_blockpy_trace = []
_blockpy_calls = {}

# Output buffering
_blockpy_output = []

# Custom print function
def _blockpy_print(*args, sep=' ', end='\\n'):
    output = sep.join(str(arg) for arg in args) + end
    _blockpy_output.append(output)

# Store original builtins
_original_print = print
_original_input = input

# Override print
import builtins
builtins.print = _blockpy_print
`);
            
            this.initialized = true;
            this.globalNamespace = this.pyodide.globals.get("_blockpy_globals");
            return this.pyodide;
        } catch (error) {
            console.error("Failed to initialize Pyodide:", error);
            throw error;
        }
    }
    
    /**
     * Configure the Pyodide environment (Skulpt-compatible)
     */
    configure(options) {
        this.currentConfig = {...this.currentConfig, ...options};
        
        if (options.retainGlobals !== undefined) {
            this.retainGlobals = options.retainGlobals;
        }
        
        // Store configuration hooks
        if (options.output) {
            this.currentConfig.output = options.output;
        }
        if (options.inputfun) {
            this.currentConfig.inputfun = options.inputfun;
        }
        if (options.read) {
            this.currentConfig.read = options.read;
        }
        if (options.filewrite) {
            this.currentConfig.filewrite = options.filewrite;
        }
        if (options.imageProxy) {
            this.currentConfig.imageProxy = options.imageProxy;
        }
        if (options.emojiProxy) {
            this.currentConfig.emojiProxy = options.emojiProxy;
        }
    }
    
    /**
     * Parse Python code and return AST (Skulpt-compatible)
     */
    parse(filename, code) {
        try {
            const result = this.pyodide.runPython(`
import ast
import sys

code = ${JSON.stringify(code)}
try:
    parsed = ast.parse(code, filename=${JSON.stringify(filename)})
    {'success': True, 'cst': parsed}
except SyntaxError as e:
    {'success': False, 'error': str(e), 'line': e.lineno, 'offset': e.offset}
`);
            return result;
        } catch (error) {
            throw this.createBuiltinError("SyntaxError", error.message);
        }
    }
    
    /**
     * Create AST from parse result (Skulpt-compatible)
     */
    astFromParse(cst, filename, flags) {
        // For Pyodide, we already have an AST from parse
        // Convert it to a format similar to Skulpt
        const astData = this.pyodide.runPython(`
import ast
import json

class ASTEncoder:
    def encode_node(self, node):
        if not isinstance(node, ast.AST):
            return node
        
        result = {
            '_type': node.__class__.__name__
        }
        
        for field, value in ast.iter_fields(node):
            if isinstance(value, list):
                result[field] = [self.encode_node(item) for item in value]
            elif isinstance(value, ast.AST):
                result[field] = self.encode_node(value)
            else:
                result[field] = value
        
        # Add line numbers if available
        if hasattr(node, 'lineno'):
            result['lineno'] = node.lineno
        if hasattr(node, 'col_offset'):
            result['col_offset'] = node.col_offset
            
        return result

encoder = ASTEncoder()
ast_json = encoder.encode_node(cst)
ast_json
`);
        
        return astData.toJs();
    }
    
    /**
     * Import and execute main module (Skulpt-compatible)
     */
    async importMainWithBody(filename, dumpJS, code, canSuspend, sysmodules) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            // Clear output buffer
            await this.pyodide.runPythonAsync("_blockpy_output.clear()");
            
            // Clear or preserve globals based on retainGlobals
            if (!this.retainGlobals) {
                await this.pyodide.runPythonAsync("_blockpy_globals.clear()");
                this.globals = {};
            }
            
            // Set up execution environment
            await this.pyodide.runPythonAsync(`
import sys
sys.path.insert(0, '/tmp')
`);
            
            // Write the code to a virtual file
            const escapedCode = code.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
            await this.pyodide.runPythonAsync(`
with open('/tmp/${filename}.py', 'w') as f:
    f.write("""${escapedCode}""")
`);
            
            // Execute the code
            const result = await this.pyodide.runPythonAsync(`
import sys
import traceback

# Track execution for tracing
_blockpy_trace.clear()
_blockpy_calls.clear()

try:
    # Execute the code in the global namespace
    with open('/tmp/${filename}.py', 'r') as f:
        code = f.read()
    exec(code, _blockpy_globals)
    
    # Collect output
    output = ''.join(_blockpy_output)
    
    # Success result
    {'success': True, 'output': output, 'globals': dict(_blockpy_globals)}
except Exception as e:
    # Error result
    exc_type, exc_value, exc_tb = sys.exc_info()
    tb_lines = traceback.format_exception(exc_type, exc_value, exc_tb)
    {
        'success': False, 
        'error': str(e),
        'error_type': exc_type.__name__,
        'traceback': ''.join(tb_lines),
        'output': ''.join(_blockpy_output)
    }
`);
            
            const resultJS = result.toJs();
            
            // Handle output
            if (resultJS.output && this.currentConfig.output) {
                this.currentConfig.output(resultJS.output);
            }
            
            // Store globals if retaining
            if (this.retainGlobals && resultJS.success) {
                this.globals = resultJS.globals || {};
            }
            
            if (!resultJS.success) {
                throw this.createPythonError(resultJS);
            }
            
            // Return a module-like object (Skulpt-compatible)
            return {
                $d: resultJS.globals || {},
                success: true
            };
            
        } catch (error) {
            if (error.isPythonError) {
                throw error;
            }
            throw this.createBuiltinError("RuntimeError", error.message || String(error));
        }
    }
    
    /**
     * Create a Python error object (Skulpt-compatible)
     */
    createPythonError(errorData) {
        const error = new Error(errorData.error || "Unknown error");
        error.isPythonError = true;
        error.nativeError = errorData;
        error.tp$name = errorData.error_type || "Error";
        error.traceback = errorData.traceback || "";
        
        // Format error for display (similar to Skulpt)
        error.toString = () => {
            return errorData.traceback || error.message;
        };
        
        return error;
    }
    
    /**
     * Create a builtin error (Skulpt-compatible)
     */
    createBuiltinError(errorType, message) {
        const error = new Error(message);
        error.tp$name = errorType;
        error.isPythonError = true;
        return error;
    }
}

/**
 * Create builtin module helpers (Skulpt-compatible namespace)
 */
export const builtin = {
    str: class SkStr extends String {
        constructor(value) {
            super(value);
            this.v = value;
        }
    },
    int_: class SkInt extends Number {
        constructor(value) {
            super(value);
            this.v = value;
        }
    },
    dict: class SkDict extends Map {
        set$item(key, value) {
            this.set(key, value);
        }
        get$item(key) {
            return this.get(key);
        }
        pop$item(key) {
            const value = this.get(key);
            this.delete(key);
            return value;
        }
        quick$lookup(key) {
            return this.has(key);
        }
    },
    OSError: class OSError extends Error {
        constructor(message) {
            super(message);
            this.name = "OSError";
            this.tp$name = "OSError";
        }
    },
    IOError: class IOError extends Error {
        constructor(message) {
            super(message);
            this.name = "IOError";
            this.tp$name = "IOError";
        }
    }
};

/**
 * Miscellaneous evaluation helpers (Skulpt-compatible)
 */
export const misceval = {
    asyncToPromise: (fn) => {
        return fn();
    }
};

/**
 * Global Pyodide adapter instance that mimics Skulpt's global Sk object
 */
export const Sk = new PyodideAdapter();
Sk.builtin = builtin;
Sk.misceval = misceval;
Sk.python3 = true;
