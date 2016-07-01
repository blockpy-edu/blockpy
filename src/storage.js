function LocalStorageWrapper(namespace) {
    this.set =  function(key, value) {
        localStorage.setItem(namespace+"_"+key+"_value", value);
        localStorage.setItem(namespace+"_"+key+"_timestamp", $.now());
    };
    this.remove = function(key) {
        localStorage.removeItem(namespace+"_"+key+"_value");
        localStorage.removeItem(namespace+"_"+key+"_timestamp");
    };
    this.get = function(key) {
        return localStorage.getItem(namespace+"_"+key+"_value");
    };
    this.has = function(key) {
        return localStorage.getItem(namespace+"_"+key+"_value") !== null;
    };
    // Tests whether the server has the newer version
    this.is_new = function(key, server_time) {
        var stored_time = localStorage.getItem(namespace+"_"+key+"_timestamp");
        return (server_time >= stored_time+5000);
    };
};
//BlockPyLocalStorage = new LocalStorageWrapper("BLOCKPY")