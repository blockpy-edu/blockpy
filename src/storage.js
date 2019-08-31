let LOCAL_STORAGE_REF;
try {
    LOCAL_STORAGE_REF = localStorage;
    let mod = "BLOCKPY_LOCALSTORAGE_TEST";
    LOCAL_STORAGE_REF.setItem(mod, mod);
    LOCAL_STORAGE_REF.removeItem(mod);
} catch(e) {
    LOCAL_STORAGE_REF = {
        _data       : {},
        setItem     : function(id, val) { return this._data[id] = String(val); },
        getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
        removeItem  : function(id) { return delete this._data[id]; },
        clear       : function() { return this._data = {}; }
    };
}

/**
 * Helper object for interfacing with the LocalStorage. The LocalStorage
 * browser API allows for offline storage. That API is very unsophisticated,
 * and is essentially a lame key-value store. This object sits on top
 * and provides a number of useful utilities, including rudimentarycache
 * cache expiration.
 *
 * @constructor
 * @this {LocalStorageWrapper}
 * @param {String} namespace - A namespace to use in grouping access to localstorage. This keeps access clean and organized, while also making it possible to have multiple LocalStorage connections.
 */
export function LocalStorageWrapper(namespace) {
    this.namespace = namespace;
}
/**
 * A method for adding a key/value pair to LocalStorage.
 * Note that both parameters must be strings (JSON.stringify is your friend).
 *
 * @param {String} key - The name of the key.
 * @param {String} value - The value.
 */
LocalStorageWrapper.prototype.set =  function(key, value) {
    LOCAL_STORAGE_REF.setItem(this.namespace+"_"+key+"_value", value);
    LOCAL_STORAGE_REF.setItem(this.namespace+"_"+key+"_timestamp", $.now());
};

/**
 * A method for removing a key from LocalStorage.
 *
 * @param {String} key - The name of the key to remove.
 */
LocalStorageWrapper.prototype.remove = function(key) {
    LOCAL_STORAGE_REF.removeItem(this.namespace+"_"+key+"_value");
    LOCAL_STORAGE_REF.removeItem(this.namespace+"_"+key+"_timestamp");
};

/**
 * A method for retrieving the value associated with the given key.
 *
 * @param {String} key - The name of the key to retrieve the value for.
 */
LocalStorageWrapper.prototype.get = function(key) {
    return LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_value");
};

/**
 * A method for retrieving the time associated with the given key.
 *
 * @param {String} key - The name of the key to retrieve the time for.
 * @returns {Integer} - The timestamp (local epoch) when the key was last set.
 */
LocalStorageWrapper.prototype.getTime = function(key) {
    return parseInt(LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_timestamp"));
};

/**
 * A method for retrieving the value associated with the given key.
 * If the key does not exist, then the default value is used instead.
 * This default will be set.
 *
 * @param {String} key - The name of the key to retrieve the value for.
 * @param {String} defaultValue - The default value to use. Must be a string.
 */
LocalStorageWrapper.prototype.getDefault = function(key, defaultValue) {
    if (this.has(key)) {
        return this.get(key);
    } else {
        this.set(key, defaultValue);
        return defaultValue;
    }
};

/**
 * A test for whether the given key is in LocalStorage.
 *
 * @param {String} key - The key to test existence for.
 */
LocalStorageWrapper.prototype.has = function(key) {
    return LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_value") !== null;
};

/**
 * A test for whether the server has the newer version. This function
 * assumes that the server trip takes about 5 seconds. This method
 * is largely deprecated.
 *
 * @param {String} key - The key to check.
 * @param {Integer} server_time - The server's time as an epoch (in milliseconds)
 */
LocalStorageWrapper.prototype.is_new = function(key, server_time) {
    var stored_time = LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_timestamp");
    return (server_time >= stored_time+5000);
};
