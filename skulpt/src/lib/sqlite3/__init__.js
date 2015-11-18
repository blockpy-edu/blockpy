var $builtinmodule = function (name) {
    var mod = {};
    if (typeof SQL != 'object') {
        Sk.debugout("sql.js not included and callable");
    }
    
    mod.version = '1';
    mod.connect = new Sk.builtin.func(function(database) {
        Sk.builtin.pyCheckArgs("connect", arguments, 1, 7);
        
        console.log(SQL);
    });
    
    return mod;
}