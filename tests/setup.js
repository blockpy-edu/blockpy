/**
 * Jest setup file for BlockPy tests
 * This file runs before each test to set up the environment
 */

// Mock global objects that BlockPy expects
global.$ = global.jQuery = require('jquery');
global.ko = require('knockout');

// Mock FilePond
global.FilePond = {
    create: jest.fn(),
    registerPlugin: jest.fn()
};

// Mock DOM APIs not available in jsdom
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        getPropertyValue: () => '',
    }),
});

// Mock console methods to avoid noise in tests
global.console = {
    ...global.console,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
};

// Mock window.hljs (highlight.js) that's used in interface
window.hljs = {
    highlightBlock: jest.fn()
};

// Comprehensive Skulpt mock for BlockPy tests
global.Sk = {
    emojiProxy: jest.fn(),
    builtin: {
        int_: jest.fn(),
        none: {
            none$: jest.fn()
        },
        str: jest.fn(),
        tuple: jest.fn(),
        bool: jest.fn(),
        dict: jest.fn(),
        list: jest.fn(),
        set: jest.fn(),
        TypeError: jest.fn(),
        ValueError: jest.fn(),
        KeyError: jest.fn(),
        IndexError: jest.fn(),
        checkString: jest.fn(),
        asnum$: jest.fn()
    },
    misceval: {
        callsimArray: jest.fn(),
        isTrue: jest.fn(),
        richCompareBool: jest.fn(),
        chain: jest.fn()
    },
    ffi: {
        remapToJs: jest.fn(),
        remapToPy: jest.fn()
    },
    abstr: {
        typeName: jest.fn(),
        setUpModuleMethods: jest.fn(),
        buildNativeClass: jest.fn()
    },
    generic: {
        getAttr: jest.fn(),
        setAttr: jest.fn()
    }
};

// Set up basic DOM structure that BlockPy expects
document.body.innerHTML = '<div id="blockpy-test-container"></div>';