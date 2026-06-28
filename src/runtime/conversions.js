export function runtimeToJs(runtime, value) {
    if (!runtime) {
        return value;
    }
    try {
        return runtime.remapToJs(value);
    } catch (e) {
        return value;
    }
}

export function runtimeToPy(runtime, value) {
    if (!runtime) {
        return value;
    }
    try {
        return runtime.remapToPy(value);
    } catch (e) {
        return value;
    }
}
