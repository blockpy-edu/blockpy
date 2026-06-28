import {PythonRuntime} from "./python_runtime";

export class PyodideRuntimeAdapter extends PythonRuntime {
    constructor(main) {
        super(main);
        this.globals_ = {};
        this.sysmodules_ = undefined;
        this.queuedInput_ = [];
        this.files_ = {};
        this.pyodide_ = null;
    }

    getName() {
        return "pyodide";
    }

    getCapabilities() {
        return {
            stepping: false,
            tracing: false,
            instructorFlow: false,
            moduleInjection: "memoryFS",
            timeoutInterrupt: false,
            globalsPersistence: true,
            studentImportIsolation: false
        };
    }

    resolvePyodide_() {
        if (this.pyodide_) {
            return this.pyodide_;
        }
        if (typeof window !== "undefined" && window.pyodide) {
            this.pyodide_ = window.pyodide;
            return this.pyodide_;
        }
        throw new Error("Pyodide runtime selected, but window.pyodide is not available.");
    }

    configure(options) {
        return options;
    }

    async execute(filename, code, sysmodules) {
        const pyodide = this.resolvePyodide_();
        try {
            await pyodide.runPythonAsync(code);
        } catch (error) {
            const wrapped = new Error(error && error.message ? error.message : String(error));
            wrapped.name = "PythonError";
            wrapped.original = error;
            throw wrapped;
        }
        return {
            $pyodide: true,
            filename,
            globals: this.globals_,
            sysmodules: sysmodules || this.sysmodules_
        };
    }

    parse(filename, code) {
        // Pyodide parsing is not yet wired into BlockPy's AST/trace pipeline.
        // Return an empty AST shape so parser-dependent features degrade safely.
        // TODO: Replace with real AST parsing support for trace and parser reports.
        return {
            parse: null,
            ast: {body: []}
        };
    }

    setQueuedInput(values) {
        this.queuedInput_ = values || [];
    }

    getQueuedInput() {
        return this.queuedInput_;
    }

    pushQueuedInput(value) {
        this.queuedInput_.push(value);
    }

    popQueuedInput() {
        if (this.queuedInput_.length) {
            return this.queuedInput_.shift();
        }
        return "";
    }

    setRetainGlobals(value) {
        this.retainGlobals_ = Boolean(value);
    }

    getGlobals() {
        return this.globals_;
    }

    setGlobals(globals) {
        this.globals_ = globals || {};
    }

    clearGlobals() {
        this.globals_ = {};
    }

    getSysmodules() {
        return this.sysmodules_;
    }

    setSysmodules(sysmodules) {
        this.sysmodules_ = sysmodules;
    }

    setExecLimitFunction(fn) {
        this.execLimitFunction_ = fn;
        this.execLimit_ = fn ? fn() : Infinity;
    }

    getExecLimit() {
        return this.execLimit_ || Infinity;
    }

    setExecLimit(limit) {
        this.execLimit_ = limit;
    }

    setExecStart(timestamp) {
        this.execStart_ = timestamp;
    }

    ensureEnviron() {}

    setEnvironItem(key, value) {
        this.environ_ = this.environ_ || {};
        this.environ_[key] = value;
    }

    setBuiltinFile(path, content) {
        this.files_[path] = content;
    }

    getBuiltinFile(path) {
        return this.files_[path];
    }

    deleteBuiltinFile(path) {
        delete this.files_[path];
    }

    makeError(name, message) {
        const error = new Error(message);
        error.name = name;
        return error;
    }

    isGracefulExit(error) {
        return error && error.name === "GracefulExit";
    }

    getModuleScope(module) {
        if (module && module.globals) {
            return module.globals;
        }
        return module;
    }
}
