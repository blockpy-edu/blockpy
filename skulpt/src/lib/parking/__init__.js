var $builtinmodule = function(name)
{
    var mod = {};
    
    var day = function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function (self, name) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            Sk.builtin.pyCheckType("name", "string", Sk.builtin.checkString(name));
            self.name = name;
            self.name.v = self.name.v.toLowerCase().slice(0,3)
        });
        $loc.__str__ = new Sk.builtin.func(function (self) {
            return Sk.ffi.remapToPy('<'+self.name.v+'>');
        });
        $loc.__repr__ = new Sk.builtin.func(function (self) {
            return Sk.ffi.remapToPy('<'+self.name.v+'>');
        });
    }
    
    var WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    
    mod.Day = Sk.misceval.buildClass(mod, day, 'Day', []);
    
    mod._today = undefined;
    
    mod.today = new Sk.builtin.func(function() {
        var t = Sk.today || mod._today || Sk.ffi.remapToPy(WEEKDAYS[(new Date).getDay()]);
        return Sk.misceval.callsim(mod.Day, t);
        //return Sk.ffi.remapToPy(t);
    });
    
    mod.day_compare = new Sk.builtin.func(function(comparison, value, day) {
        Sk.builtin.pyCheckArgs("day_compare", arguments, 3, 3);
        Sk.builtin.pyCheckType("comparison", "string", Sk.builtin.checkString(comparison));
        Sk.builtin.pyCheckType("value", "Day", Sk.builtin.isinstance(value, mod.Day));
        Sk.builtin.pyCheckType("day", "string", Sk.builtin.checkString(day));
        var v = day.v.toLowerCase().slice(0,3);
        switch (comparison.v) {
            case 'IS': return Sk.ffi.remapToPy(value.name.v == v);
            default: return Sk.ffi.remapToPy(false);
        }
    });
    
    mod.time_compare = new Sk.builtin.func(function(operator, left, hour, minute, meridian) {
        switch (ordering) {
            case 'IS': return left == right;
        }
    });

    mod.get_current = new Sk.builtin.func(function(ticker) {
        Sk.builtin.pyCheckArgs("get_current", arguments, 1, 1);
        Sk.builtin.pyCheckType("ticker", "string", Sk.builtin.checkString(ticker));
        ticker = normalize_ticker(ticker.v);
        if (ticker === null) {
            throw new Sk.builtin.ValueError("Stock data is only available for the following companies: Facebook, Apple, Microsoft, Google.");
        }
        return Sk.ffi.remapToPy(STOCK_REPORTS[ticker][0]);
    });
    
    mod.get_past = new Sk.builtin.func(function(ticker) {
        Sk.builtin.pyCheckArgs("get_past", arguments, 1, 1);
        Sk.builtin.pyCheckType("ticker", "string", Sk.builtin.checkString(ticker));
        ticker = normalize_ticker(ticker.v);
        if (ticker === null) {
            throw new Sk.builtin.ValueError("Stock data is only available for the following companies: Facebook, Apple, Microsoft, Google.");
        }
        return Sk.ffi.remapToPy(STOCK_REPORTS[ticker]);
    });

    return mod;
}