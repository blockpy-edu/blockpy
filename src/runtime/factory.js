import {SkulptRuntimeAdapter} from "./skulpt_adapter";
import {PyodideRuntimeAdapter} from "./pyodide_adapter";

export const PYTHON_RUNTIMES = {
    SKULPT: "skulpt",
    PYODIDE: "pyodide"
};

export function resolvePythonRuntime(main) {
    const fromUrl = getRuntimeFromUrl();
    const fromConfig = getRuntimeFromConfig(main);
    const fromFeatureFlag = getRuntimeFromFeatureFlag();
    const backend = normalizeRuntime(fromUrl || fromConfig || fromFeatureFlag || PYTHON_RUNTIMES.SKULPT);
    return createRuntimeAdapter(main, backend);
}

export function createRuntimeAdapter(main, backend) {
    if (backend === PYTHON_RUNTIMES.PYODIDE) {
        return new PyodideRuntimeAdapter(main);
    }
    return new SkulptRuntimeAdapter(main);
}

export function normalizeRuntime(value) {
    if (!value) {
        return PYTHON_RUNTIMES.SKULPT;
    }
    const normalized = String(value).toLowerCase().trim();
    if (normalized === PYTHON_RUNTIMES.PYODIDE) {
        return PYTHON_RUNTIMES.PYODIDE;
    }
    return PYTHON_RUNTIMES.SKULPT;
}

function getRuntimeFromUrl() {
    if (typeof window === "undefined" || !window.location || !window.location.search) {
        return null;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("runtime") || params.get("python_runtime");
}

function getRuntimeFromFeatureFlag() {
    if (typeof window === "undefined") {
        return null;
    }
    if (window.BLOCKPY_RUNTIME) {
        return window.BLOCKPY_RUNTIME;
    }
    if (window.BLOCKPY_FEATURES && window.BLOCKPY_FEATURES.pythonRuntime) {
        return window.BLOCKPY_FEATURES.pythonRuntime;
    }
    return null;
}

function getRuntimeFromConfig(main) {
    if (!main) {
        return null;
    }
    if (main.initialConfiguration_) {
        if (main.initialConfiguration_.runtime) {
            return main.initialConfiguration_.runtime;
        }
        if (main.initialConfiguration_["runtime.backend"]) {
            return main.initialConfiguration_["runtime.backend"];
        }
        if (main.initialConfiguration_["assignment.settings.runtime_backend"]) {
            return main.initialConfiguration_["assignment.settings.runtime_backend"];
        }
    }
    if (main.model && main.model.assignment && main.model.assignment.settings) {
        const runtimeBackend = main.model.assignment.settings.runtimeBackend;
        if (typeof runtimeBackend === "function") {
            return runtimeBackend();
        }
    }
    return null;
}
