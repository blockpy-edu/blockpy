import { pythonToBlocks } from "./pythonToBlocks";
const DEBOUNCE_MS = 300;
function createSyncController(callbacks) {
    let state = {
        source: "external",
        isDirty: false,
        lastValidBlocksXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
        lastValidPython: "",
        isParsing: false,
        parseErrors: []
    };
    let debounceTimer = null;
    let isUpdating = false;
    function setState(updates) {
        state = { ...state, ...updates };
        callbacks.onSyncStateChange(state);
    }
    function onTextChange(text) {
        if (isUpdating) {return;}
        setState({ source: "text", isDirty: true });
        if (debounceTimer) {clearTimeout(debounceTimer);}
        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            parseAndUpdateBlocks(text);
        }, DEBOUNCE_MS);
    }
    function parseAndUpdateBlocks(text) {
        if (isUpdating) {return;}
        isUpdating = true;
        setState({ isParsing: true });
        try {
            const result = pythonToBlocks(text);
            if (result.success && result.blocksXml) {
                setState({
                    lastValidBlocksXml: result.blocksXml,
                    lastValidPython: text,
                    parseErrors: result.errors,
                    isParsing: false
                });
                callbacks.onBlocksUpdate(result.blocksXml, result.errors);
            } else {
                setState({ parseErrors: result.errors, isParsing: false });
                callbacks.onParseErrors(result.errors);
            }
        } finally {
            isUpdating = false;
        }
    }
    function onBlocksChange(blocksXml, generatedCode) {
        if (isUpdating) {return;}
        isUpdating = true;
        try {
            setState({
                source: "blocks",
                isDirty: true,
                lastValidBlocksXml: blocksXml,
                lastValidPython: generatedCode,
                parseErrors: []
            });
            callbacks.onCodeUpdate(generatedCode);
        } finally {
            isUpdating = false;
        }
    }
    function reset() {
        if (debounceTimer) {clearTimeout(debounceTimer);}
        debounceTimer = null;
        isUpdating = false;
        state = {
            source: "external",
            isDirty: false,
            lastValidBlocksXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
            lastValidPython: "",
            isParsing: false,
            parseErrors: []
        };
        callbacks.onSyncStateChange(state);
    }
    function dispose() {
        if (debounceTimer) {clearTimeout(debounceTimer);}
    }
    return {
        onTextChange,
        onBlocksChange,
        getState: () => ({ ...state }),
        reset,
        dispose
    };
}
export {
    createSyncController
};
