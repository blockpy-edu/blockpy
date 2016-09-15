var $builtinmodule = function(name)
{
    var WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    var FULL_DAYS = {
        "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday",
        "thu": "Thursday", "fri": "Friday", "sat": "Saturday",
        "sun": "Sunday"
    }
    
    var convert_day = function(day) {
        return WEEKDAYS.indexOf(day.name.v);
    }
    var convert_day_string = function(day) {
        return WEEKDAYS.indexOf(day.v.toLowerCase().slice(0, 3));
    }
    var convert_time = function(hour, minute, meridian) {
        return hour*60 + minute + (meridian.toLowerCase() == "pm" ? 12*60 : 0);
    }
    
    var mod = {};
    
    var time = function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function (self, hour, minute, meridian) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 4, 4);
            Sk.builtin.pyCheckType("hour", "int", Sk.builtin.checkInt(hour));
            Sk.builtin.pyCheckType("minute", "int", Sk.builtin.checkInt(minute));
            Sk.builtin.pyCheckType("meridian", "int", Sk.builtin.checkString(meridian));
            self.hour = hour;
            self.minute = minute;
            self.meridian = meridian;
            self.meridian.v = self.meridian.v.toLowerCase();
        });
        $loc.__str__ = new Sk.builtin.func(function (self) {
            return Sk.ffi.remapToPy('<'+(self.hour.v || 12) +':'+
                                    (self.minute.v < 10 ? '0'+self.minute.v : self.minute.v)+
                                    self.meridian.v+'>');
        });
        $loc.__repr__ = new Sk.builtin.func(function (self) {
            return Sk.ffi.remapToPy('<'+(self.hour.v || 12)+':'+
                                    (self.minute.v < 10 ? '0'+self.minute.v : self.minute.v)+
                                    self.meridian.v+'>');
        });
        var comparison = function (operation, self, other) {
            if (Sk.builtin.isinstance(other, mod.Time).v) {
                if (operation(convert_time(self.hour.v % 12, self.minute.v, self.meridian.v), 
                              convert_time(other.hour.v % 12, other.minute.v, other.meridian.v))) {
                    return Sk.ffi.remapToPy(true);
                } else {
                    return Sk.ffi.remapToPy(false);
                }
            } else {
                return Sk.ffi.remapToPy(false);
            }
        }
        $loc.__eq__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l==r}, self, other);
        })
        
        $loc.__ne__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            if (!Sk.builtin.isinstance(other, mod.Time).v) {
                return Sk.builtin.bool.true$;
            }
            return comparison(function(l,r) {return l!=r}, self, other);
        });
        
        $loc.__lt__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l < r}, self, other);
        });
        
        $loc.__gt__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l > r}, self, other);
        });
        
        $loc.__le__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l <= r}, self, other);
        });
        
        $loc.__ge__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l >= r}, self, other);
        });
    }
    
    var day = function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function (self, name) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            Sk.builtin.pyCheckType("name", "string", Sk.builtin.checkString(name));
            self.name = name;
            self.name.v = self.name.v.toLowerCase().slice(0,3)
        });
        $loc.__str__ = new Sk.builtin.func(function (self) {
            return Sk.ffi.remapToPy('<'+FULL_DAYS[self.name.v]+'>');
        });
        $loc.__repr__ = new Sk.builtin.func(function (self) {
            return Sk.ffi.remapToPy('<'+FULL_DAYS[self.name.v]+'>');
        });
        var comparison = function (operation, self, other) {
            if (Sk.builtin.isinstance(other, mod.Day).v) {
                if (operation(convert_day(self), convert_day(other))) {
                    return Sk.ffi.remapToPy(true);
                } else {
                    return Sk.builtin.bool.false$;
                }
            } else {
                return Sk.builtin.bool.false$;
            }
        }
        $loc.__eq__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l==r}, self, other);
        })
        
        $loc.__ne__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            if (!Sk.builtin.isinstance(other, mod.Day).v) {
                return Sk.builtin.bool.true$;
            }
            return comparison(function(l,r) {return l!=r}, self, other);
        });
        
        $loc.__lt__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l < r}, self, other);
        });
        
        $loc.__gt__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l > r}, self, other);
        });
        
        $loc.__le__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l <= r}, self, other);
        });
        
        $loc.__ge__ = new Sk.builtin.func(function (self, other) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            return comparison(function(l,r) {return l >= r}, self, other);
        });
    }
    
    mod.Day = Sk.misceval.buildClass(mod, day, 'Day', []);
    mod.Time = Sk.misceval.buildClass(mod, time, 'Time', []);
    
    mod._today = undefined;
    mod._hour = undefined;
    mod._minute = undefined;
    mod._meridian = undefined;
    
    mod.today = new Sk.builtin.func(function() {
        var t = ((new Date).getDay() + 6) % 7; // would be -1, but % is broken for negatives in JS
        t = Sk.today || mod._today || Sk.ffi.remapToPy(WEEKDAYS[t]);
        return Sk.misceval.callsim(mod.Day, t);
    });
    
    mod.now = new Sk.builtin.func(function() {
        var d = new Date();
        var hour = d.getHours() % 12,
            minute = d.getMinutes(),
            meridian = d.getHours() < 12 ? 'am' : 'pm';
        hour = Sk._hour || mod._hour || Sk.ffi.remapToPy(hour);
        minute = Sk._minute || mod._minute || Sk.ffi.remapToPy(minute);
        meridian = Sk._meridian || mod._meridian || Sk.ffi.remapToPy(meridian);
        return Sk.misceval.callsim(mod.Time, hour, minute, meridian);
    });
    
    mod.day_compare = new Sk.builtin.func(function(comparison, value, day) {
        Sk.builtin.pyCheckArgs("day_compare", arguments, 3, 3);
        Sk.builtin.pyCheckType("comparison", "string", Sk.builtin.checkString(comparison));
        Sk.builtin.pyCheckType("value", "Day", Sk.builtin.isinstance(value, mod.Day).v);
        Sk.builtin.pyCheckType("day", "string", Sk.builtin.checkString(day));
        var day_n = convert_day_string(day),
            value_n = convert_day(value);
        switch (comparison.v) {
            case 'IS': return Sk.ffi.remapToPy(value_n == day_n);
            case "BEFORE_EQUAL": return Sk.ffi.remapToPy(value_n <= day_n);
            case "AFTER_EQUAL": return Sk.ffi.remapToPy(value_n >= day_n);
            case "BEFORE": return Sk.ffi.remapToPy(value_n < day_n);
            case "AFTER": return Sk.ffi.remapToPy(value_n > day_n);
            case "IS_NOT": return Sk.ffi.remapToPy(value_n != day_n);
            default: throw new Sk.builtins.ValueError("Unknown comparison")
        }
    });
    
    mod.time_compare = new Sk.builtin.func(function(comparison, left, hour, minute, meridian) {
        Sk.builtin.pyCheckArgs("time_compare", arguments, 5, 5);
        Sk.builtin.pyCheckType("comparison", "string", Sk.builtin.checkString(comparison));
        Sk.builtin.pyCheckType("left", "Time", Sk.builtin.isinstance(left, mod.Time).v);
        Sk.builtin.pyCheckType("hour", "int", Sk.builtin.checkInt(hour));
        Sk.builtin.pyCheckType("minute", "int", Sk.builtin.checkInt(hour));
        Sk.builtin.pyCheckType("meridian", "string", Sk.builtin.checkString(meridian));
        var right_time = convert_time(hour.v % 12, minute.v, meridian.v),
            left_time = convert_time(left.hour.v % 12, left.minute.v, left.meridian.v);
        switch (comparison.v) {
            case 'IS': return Sk.ffi.remapToPy(left_time == right_time);
            case "BEFORE_EQUAL": return Sk.ffi.remapToPy(left_time <= right_time);
            case "AFTER_EQUAL": return Sk.ffi.remapToPy(left_time >= right_time);
            case "BEFORE": return Sk.ffi.remapToPy(left_time < right_time);
            case "AFTER": return Sk.ffi.remapToPy(left_time > right_time);
            case "IS_NOT": return Sk.ffi.remapToPy(left_time != right_time);
            default: throw new Sk.builtins.ValueError("Unknown comparison")
        }
    });

    return mod;
}