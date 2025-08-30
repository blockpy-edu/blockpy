declare const $: any;

interface LocalStorageInterface {
    _data?: Record<string, string>;
    setItem: (key: string, value: string) => void;
    getItem: (key: string) => string | null;
    removeItem: (key: string) => void;
    clear: () => void;
}

let LOCAL_STORAGE_REF: LocalStorageInterface;
try {
    LOCAL_STORAGE_REF = localStorage;
    const mod = "BLOCKPY_LOCALSTORAGE_TEST";
    LOCAL_STORAGE_REF.setItem(mod, mod);
    LOCAL_STORAGE_REF.removeItem(mod);
} catch(e) {
    LOCAL_STORAGE_REF = {
        _data       : {},
        setItem     : function(id: string, val: string) { return this._data![id] = String(val); },
        getItem     : function(id: string) { return this._data!.hasOwnProperty(id) ? this._data![id] : null; },
        removeItem  : function(id: string) { return delete this._data![id]; },
        clear       : function() { return this._data = {}; }
    };
}

/**
 * Helper object for interfacing with the LocalStorage. The LocalStorage
 * browser API allows for offline storage. That API is very unsophisticated,
 * and is essentially a lame key-value store. This object sits on top
 * and provides a number of useful utilities, including rudimentary
 * cache expiration.
 */
export class LocalStorageWrapper {
    private namespace: string;

    constructor(namespace: string) {
        this.namespace = namespace;
    }

    /**
     * A method for adding a key/value pair to LocalStorage.
     * Note that both parameters must be strings (JSON.stringify is your friend).
     */
    set(key: string, value: string): void {
        LOCAL_STORAGE_REF.setItem(this.namespace + "_" + key + "_value", value);
        LOCAL_STORAGE_REF.setItem(this.namespace + "_" + key + "_timestamp", $.now().toString());
    }

    /**
     * A method for removing a key from LocalStorage.
     */
    remove(key: string): void {
        LOCAL_STORAGE_REF.removeItem(this.namespace + "_" + key + "_value");
        LOCAL_STORAGE_REF.removeItem(this.namespace + "_" + key + "_timestamp");
    }

    /**
     * A method for retrieving the value associated with the given key.
     */
    get(key: string): string | null {
        return LOCAL_STORAGE_REF.getItem(this.namespace + "_" + key + "_value");
    }

    /**
     * A method for retrieving the time associated with the given key.
     * @returns The timestamp (local epoch) when the key was last set.
     */
    getTime(key: string): number {
        const timestamp = LOCAL_STORAGE_REF.getItem(this.namespace + "_" + key + "_timestamp");
        return parseInt(timestamp || "0");
    }

    /**
     * A method for retrieving the value associated with the given key.
     * If the key does not exist, then the default value is used instead.
     * This default will be set.
     */
    getDefault(key: string, defaultValue: string): string {
        if (this.has(key)) {
            return this.get(key)!;
        } else {
            this.set(key, defaultValue);
            return defaultValue;
        }
    }

    /**
     * A test for whether the given key is in LocalStorage.
     */
    has(key: string): boolean {
        return LOCAL_STORAGE_REF.getItem(this.namespace + "_" + key + "_value") !== null;
    }

    /**
     * A test for whether the server has the newer version. This function
     * assumes that the server trip takes about 5 seconds. This method
     * is largely deprecated.
     */
    is_new(key: string, server_time: number): boolean {
        const stored_time = LOCAL_STORAGE_REF.getItem(this.namespace + "_" + key + "_timestamp");
        return (server_time >= parseInt(stored_time || "0") + 5000);
    }
}