/**
 * A Storage interface that mirrors the native localStorage API, with a
 * fallback in-memory implementation for environments where localStorage
 * is unavailable (e.g. private-browsing mode or Node.js tests).
 */
interface StorageLike {
    _data?: Record<string, string>;
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    clear(): void;
}

let LOCAL_STORAGE_REF: StorageLike;
try {
    LOCAL_STORAGE_REF = localStorage;
    let mod = "BLOCKPY_LOCALSTORAGE_TEST";
    LOCAL_STORAGE_REF.setItem(mod, mod);
    LOCAL_STORAGE_REF.removeItem(mod);
} catch(e) {
    LOCAL_STORAGE_REF = {
        _data       : {},
        setItem     : function(id: string, val: string): void { this._data![id] = String(val); },
        getItem     : function(id: string) { return this._data!.hasOwnProperty(id) ? this._data![id] : null; },
        removeItem  : function(id: string): void { delete this._data![id]; },
        clear       : function(): void { this._data = {}; }
    };
}

/**
 * Helper class for interfacing with the LocalStorage. The LocalStorage
 * browser API allows for offline storage. That API is very unsophisticated,
 * and is essentially a lame key-value store. This class sits on top
 * and provides a number of useful utilities, including rudimentary cache
 * cache expiration.
 */
export class LocalStorageWrapper {
    namespace: string;

    /**
     * @param namespace - A namespace to use in grouping access to localstorage.
     *   This keeps access clean and organized, while also making it possible to
     *   have multiple LocalStorage connections.
     */
    constructor(namespace: string) {
        this.namespace = namespace;
    }

    /**
     * A method for adding a key/value pair to LocalStorage.
     * Note that both parameters must be strings (JSON.stringify is your friend).
     *
     * @param key - The name of the key.
     * @param value - The value.
     */
    set(key: string, value: string): void {
        LOCAL_STORAGE_REF.setItem(this.namespace+"_"+key+"_value", value);
        LOCAL_STORAGE_REF.setItem(this.namespace+"_"+key+"_timestamp", String($.now()));
    }

    /**
     * A method for removing a key from LocalStorage.
     *
     * @param key - The name of the key to remove.
     */
    remove(key: string): void {
        LOCAL_STORAGE_REF.removeItem(this.namespace+"_"+key+"_value");
        LOCAL_STORAGE_REF.removeItem(this.namespace+"_"+key+"_timestamp");
    }

    /**
     * A method for retrieving the value associated with the given key.
     *
     * @param key - The name of the key to retrieve the value for.
     */
    get(key: string): string | null {
        return LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_value");
    }

    /**
     * A method for retrieving the time associated with the given key.
     *
     * @param key - The name of the key to retrieve the time for.
     * @returns The timestamp (local epoch) when the key was last set.
     */
    getTime(key: string): number {
        return parseInt(LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_timestamp") ?? "0");
    }

    /**
     * A method for retrieving the value associated with the given key.
     * If the key does not exist, then the default value is used instead.
     * This default will be set.
     *
     * @param key - The name of the key to retrieve the value for.
     * @param defaultValue - The default value to use. Must be a string.
     */
    getDefault(key: string, defaultValue: string): string {
        if (this.has(key)) {
            return this.get(key) as string;
        } else {
            this.set(key, defaultValue);
            return defaultValue;
        }
    }

    /**
     * A test for whether the given key is in LocalStorage.
     *
     * @param key - The key to test existence for.
     */
    has(key: string): boolean {
        return LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_value") !== null;
    }

    /**
     * A test for whether the server has the newer version. This function
     * assumes that the server trip takes about 5 seconds. This method
     * is largely deprecated.
     *
     * @param key - The key to check.
     * @param server_time - The server's time as an epoch (in milliseconds)
     */
    is_new(key: string, server_time: number): boolean {
        var stored_time = LOCAL_STORAGE_REF.getItem(this.namespace+"_"+key+"_timestamp");
        return (server_time >= Number(stored_time)+5000);
    }
}
