// Minimal Skulpt mock so utilities.js can be imported in Jest
global.Sk = {
    builtin: {
        int_: function() {},
        none: { none$: null },
        str: function() {},
        tuple: function() {},
    },
    misceval: {
        callsimOrSuspendArray: function() {},
        isTrue: function() {},
        richCompareBool: function() {},
        chain: function() {},
    },
    abstr: {
        typeName: function() {},
        setUpModuleMethods: function() {},
        buildNativeClass: function() {},
    },
    ffi: {
        remapToPy: function() {},
        remapToJs: function() {},
    },
    generic: {
        getAttr: function() {},
        setAttr: function() {},
    },
};
