import {PythonRuntime} from "./python_runtime";

export class SkulptRuntimeAdapter extends PythonRuntime {
    getName() {
        return "skulpt";
    }

    getCapabilities() {
        return {
            stepping: true,
            tracing: true,
            instructorFlow: true,
            moduleInjection: "builtinFiles",
            timeoutInterrupt: true,
            globalsPersistence: true,
            studentImportIsolation: true
        };
    }

    configure(options) {
        Sk.configure(options);
    }

    execute(filename, code, sysmodules) {
        return Sk.misceval.asyncToPromise(() =>
            Sk.importMainWithBody(filename, false, code, true, sysmodules)
        );
    }

    parse(filename, code) {
        const parsed = Sk.parse(filename, code);
        return {
            parse: parsed,
            ast: Sk.astFromParse(parsed.cst, filename, parsed.flags)
        };
    }

    remapToJs(value) {
        return Sk.ffi.remapToJs(value);
    }

    remapToPy(value) {
        return Sk.ffi.remapToPy(value);
    }

    setExecutionReports(reports) {
        Sk.executionReports = reports;
    }

    setConsole(consoleComponent) {
        Sk.console = consoleComponent;
    }

    setQueuedInput(values) {
        Sk.queuedInput = values;
    }

    getQueuedInput() {
        return Sk.queuedInput || [];
    }

    pushQueuedInput(value) {
        if (!Sk.queuedInput) {
            Sk.queuedInput = [];
        }
        Sk.queuedInput.push(value);
    }

    popQueuedInput() {
        if (Sk.queuedInput && Sk.queuedInput.length) {
            return Sk.queuedInput.shift();
        }
        return "";
    }

    setInBrowser(handler) {
        Sk.inBrowser = handler;
    }

    setFileToURL(handler) {
        Sk.fileToURL = handler;
    }

    setRequestsGet(handler) {
        Sk.requestsGet = handler;
    }

    setTimeoutHandler(handler) {
        Sk.timeoutHandler = handler;
    }

    setBeforeCall(handler) {
        Sk.beforeCall = handler;
    }

    getBeforeCall() {
        return Sk.beforeCall;
    }

    setBeforeCallBackup(handler) {
        Sk.beforeCallBackup = handler;
    }

    setAfterSingleExecution(handler) {
        Sk.afterSingleExecution = handler;
    }

    setRetainGlobals(value) {
        Sk.retainGlobals = value;
    }

    getGlobals() {
        return Sk.globals;
    }

    setGlobals(globals) {
        Sk.globals = globals;
    }

    clearGlobals() {
        Sk.globals = {};
    }

    getSysmodules() {
        return Sk.sysmodules;
    }

    setSysmodules(sysmodules) {
        Sk.sysmodules = sysmodules;
    }

    setExecLimitFunction(fn) {
        Sk.execLimitFunction = fn;
        Sk.execLimit = fn();
    }

    getExecLimit() {
        return Sk.execLimit;
    }

    setExecLimit(limit) {
        Sk.execLimit = limit;
    }

    setExecStart(timestamp) {
        Sk.execStart = timestamp;
    }

    ensureEnviron() {
        if (typeof Sk.environ === "undefined") {
            Sk.environ = new Sk.builtin.dict();
        }
    }

    setEnvironItem(key, value) {
        this.ensureEnviron();
        Sk.environ.set$item(new Sk.builtin.str(key), new Sk.builtin.int_(value));
    }

    makePyString(value) {
        return new Sk.builtin.str(value);
    }

    makePyInt(value) {
        return new Sk.builtin.int_(value);
    }

    makePyDict() {
        return new Sk.builtin.dict();
    }

    makeError(name, message) {
        const ctor = Sk.builtin[name] || Sk.builtin.Exception;
        if (ctor) {
            return new ctor(message);
        }
        const fallback = new Error(message);
        fallback.name = name;
        return fallback;
    }

    isGracefulExit(error) {
        return error && error.tp$name === "GracefulExit";
    }

    getModuleScope(module) {
        return module && module.$d ? module.$d : module;
    }

    getNamedModuleScope(module, name) {
        const scope = this.getModuleScope(module);
        if (scope && scope[name] && scope[name].$d) {
            return scope[name].$d;
        }
        return scope ? scope[name] : undefined;
    }

    getEvalValue(module) {
        const scope = this.getModuleScope(module);
        if (scope && scope._ && scope._.$r) {
            return this.remapToJs(scope._.$r());
        }
        return undefined;
    }

    setBuiltinFile(path, content) {
        if (!Sk.builtinFiles || !Sk.builtinFiles.files) {
            throw new Error("Skulpt builtinFiles not initialized.");
        }
        Sk.builtinFiles.files[path] = content;
    }

    getBuiltinFile(path) {
        if (!Sk.builtinFiles || !Sk.builtinFiles.files) {
            return undefined;
        }
        return Sk.builtinFiles.files[path];
    }

    deleteBuiltinFile(path) {
        if (Sk.builtinFiles && Sk.builtinFiles.files) {
            delete Sk.builtinFiles.files[path];
        }
    }

    setClearExistingStudentImports(handler) {
        Sk.clearExistingStudentImports = handler;
    }

    popSysmodule(sysmodules, filename) {
        const skFilename = new Sk.builtin.str(filename);
        return sysmodules.pop$item(skFilename);
    }

    getPython3Future() {
        return Sk.python3;
    }
}
