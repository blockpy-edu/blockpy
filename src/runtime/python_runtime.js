export class PythonRuntime {
    constructor(main) {
        this.main = main;
    }

    getName() {
        throw new Error("Abstract runtime name");
    }

    getCapabilities() {
        throw new Error("Abstract runtime capabilities");
    }

    configure(options) {
        throw new Error("Abstract runtime configure");
    }

    execute(filename, code, sysmodules) {
        throw new Error("Abstract runtime execute");
    }

    parse(filename, code) {
        throw new Error("Abstract runtime parse");
    }

    remapToJs(value) {
        return value;
    }

    remapToPy(value) {
        return value;
    }

    setExecutionReports(reports) {}

    setConsole(consoleComponent) {}

    setQueuedInput(values) {}

    getQueuedInput() {
        return [];
    }

    pushQueuedInput(value) {}

    popQueuedInput() {
        return "";
    }

    setInBrowser(handler) {}

    setFileToURL(handler) {}

    setRequestsGet(handler) {}

    setTimeoutHandler(handler) {}

    setBeforeCall(handler) {}

    getBeforeCall() {
        return null;
    }

    setBeforeCallBackup(handler) {}

    setAfterSingleExecution(handler) {}

    setRetainGlobals(value) {}

    getGlobals() {
        return {};
    }

    setGlobals(globals) {}

    clearGlobals() {}

    getSysmodules() {
        return undefined;
    }

    setSysmodules(sysmodules) {}

    setExecLimitFunction(fn) {}

    getExecLimit() {
        return Infinity;
    }

    setExecLimit(limit) {}

    setExecStart(timestamp) {}

    ensureEnviron() {}

    setEnvironItem(key, value) {}

    makePyString(value) {
        return value;
    }

    makePyInt(value) {
        return value;
    }

    makePyDict() {
        return {};
    }

    makeError(name, message) {
        const error = new Error(message);
        error.name = name;
        return error;
    }

    isGracefulExit(error) {
        return error && error.name === "GracefulExit";
    }

    setBuiltinFile(path, content) {}

    getBuiltinFile(path) {
        return undefined;
    }

    hasBuiltinFile(path) {
        return this.getBuiltinFile(path) !== undefined;
    }

    deleteBuiltinFile(path) {}

    setClearExistingStudentImports(handler) {}

    popSysmodule(sysmodules, filename) {
        return undefined;
    }
}
