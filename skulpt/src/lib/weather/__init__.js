var $builtinmodule = function(name)
{
    var mod = {};
    if (typeof Sk.connectedServices === 'undefined') {
        Sk.connectedServices = {};
    }
    
    var CONNECTED = 'weather' in Sk.connectedServices;
    var CONNECTED_URL = Sk.connectedServices['weather']
    
    var CACHE = function() {
        var name = "WEATHER_BLOCKPY_";
        this.set =  function(key, value) {
            localStorage.setItem(name+key+"_value", value);
            localStorage.setItem(name+key+"_timestamp", (new Date).getTime());
        };
        this.remove = function(key) {
            localStorage.removeItem(name+key+"_value");
            localStorage.removeItem(name+key+"_timestamp");
        };
        this.get = function(key) {
            return localStorage.getItem(name+key+"_value");
        };
        this.has = function(key) {
            if (this.is_old(key, 10)) {
                this.remove(key);
                return false;
            } else {
                return localStorage.getItem(name+key+"_value") !== null;
            }
        };
        // Tests whether the server has the newer version
        this.is_old = function(key, minutes) {
            var stored_time = localStorage.getItem(name+key+"_timestamp");
            current_time = (new Date).getTime();
            return (current_time >= stored_time+(minutes*60000));
        };
    };
    
    var WEATHER_REPORTS = {
    'BLACKSBURG':[{'temperature': 78, 'humidity':  20, 'wind':  7}, {'temperature': 61, 'humidity': 50, 'wind': 10},
                  {'temperature': 81, 'humidity': 100, 'wind':  5}, {'temperature': 62, 'humidity': 90, 'wind': 15},
                  {'temperature': 84, 'humidity':  30, 'wind': 19}, {'temperature': 66, 'humidity':  0, 'wind': 28},
                  {'temperature': 87, 'humidity':   0, 'wind': 12}, {'temperature': 68, 'humidity':  0, 'wind': 14},
                  {'temperature': 86, 'humidity':   0, 'wind':  4}, {'temperature': 68, 'humidity': 60, 'wind':  0}],
    'SEATTLE':   [{'temperature': 56, 'humidity': 10, 'wind':  7}, {'temperature': 40, 'humidity': 0, 'wind': 9},
                  {'temperature': 54, 'humidity': 0, 'wind':  9}, {'temperature': 38, 'humidity': 20, 'wind': 3},
                  {'temperature': 57, 'humidity':  10, 'wind': 10}, {'temperature': 39, 'humidity':  30, 'wind': 6},
                  {'temperature': 60, 'humidity':  20, 'wind':  7}, {'temperature': 42, 'humidity':  0, 'wind': 7},
                  {'temperature': 65, 'humidity':  0, 'wind':  2}, {'temperature': 41, 'humidity': 0, 'wind': 2}],
    'MIAMI':     [{'temperature': 79, 'humidity': 60, 'wind': 12}, {'temperature': 59, 'humidity': 60, 'wind': 14},
                  {'temperature': 61, 'humidity': 60, 'wind': 15}, {'temperature': 68, 'humidity': 60, 'wind': 17},
                  {'temperature': 70, 'humidity':  40, 'wind': 11}, {'temperature': 68, 'humidity': 40, 'wind':  9},
                  {'temperature': 72, 'humidity':  30, 'wind':  8}, {'temperature': 68, 'humidity':  30, 'wind': 10},
                  {'temperature': 71, 'humidity':  30, 'wind':  5}, {'temperature': 68, 'humidity':  30, 'wind':  3}],
    'SANJOSE':   [{'temperature': 62, 'humidity': 0, 'wind': 10}, {'temperature': 41, 'humidity': 0, 'wind': 11},
                  {'temperature': 63, 'humidity': 0, 'wind': 13}, {'temperature': 42, 'humidity': 0, 'wind':  6},
                  {'temperature': 62, 'humidity': 0, 'wind':  7}, {'temperature': 42, 'humidity': 0, 'wind':  8},
                  {'temperature': 59, 'humidity': 0, 'wind':  3}, {'temperature': 42, 'humidity': 0, 'wind':  4},
                  {'temperature': 59, 'humidity': 0, 'wind':  2}, {'temperature': 42, 'humidity': 0, 'wind':  5}],
    'NEWYORK':   [{'temperature': 59, 'humidity':   70, 'wind':  5}, {'temperature': 47, 'humidity':  40, 'wind': 10},
                  {'temperature': 60, 'humidity':   0, 'wind': 27}, {'temperature': 31, 'humidity':  0, 'wind': 17},
                  {'temperature': 49, 'humidity':   0, 'wind': 15}, {'temperature': 31, 'humidity': 0, 'wind': 4},
                  {'temperature': 60, 'humidity':  30, 'wind': 17}, {'temperature': 44, 'humidity': 30, 'wind': 9},
                  {'temperature': 63, 'humidity': 30, 'wind': 8}, {'temperature': 48, 'humidity': 30, 'wind': 4}]
    };
    function normalize_city(city) {
        switch (city.toLowerCase()) {
            case "blacksburg, va": case "blacksburg va": case "blacksburg":
            case "va": case "virginia":
                return "BLACKSBURG";
            case "seattle, wa": case "seattle wa": case "seattle":
            case "wa": case "washington":
                return "SEATTLE";
            case "miami, fl": case "miami fl": case "miami":
            case "fl": case "florida":
                return "MIAMI";
            case "san jose, ca": case "san jose ca": case "san jose":
            case "ca": case "california": case "sanjose":
                return "SANJOSE";
            case "new york, ny": case "new york ny": case "new york":
            case "ny": case "newyork":
                return "NEWYORK";
            default: return null;
        }
    }
    
    var sanitizeInput = function(functionName, city) {
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = normalize_city(city.v);
        if (city === null) {
            throw new Sk.builtin.ValueError("Weather data is only available for the following cities: Blacksburg, Miami, San Jose, New York, Seattle.");
        }
    };
    
    var getData = function(city) {
        if (CONNECTED) {
            if (CACHE.has(city)) {
                return CACHE.get(city);
            } else {
                $.post(CONNECTED_URL, {'city': city}, function(data) {
                    // Oh. This is actually going to be a thing.
                    // Have to crack how Skulpt does it and replicate that.
                    // Or figure 
                })
            }
        } else {
            return WEATHER_REPORTS;
        }
    }

    mod.get_temperature = new Sk.builtin.func(function(city) {
        Sk.builtin.pyCheckArgs("get_temperature", arguments, 1, 1);
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = normalize_city(city.v);
        if (city === null) {
            throw new Sk.builtin.ValueError("Weather data is only available for the following cities: Blacksburg, Miami, San Jose, New York, Seattle.");
        }
        
        return Sk.ffi.remapToPy(WEATHER_REPORTS[city][0]['temperature']);
    });
    
    mod.get_forecasts = new Sk.builtin.func(function(city) {
        Sk.builtin.pyCheckArgs("get_forecasts", arguments, 1, 1);
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = normalize_city(city.v);
        if (city === null) {
            throw new Sk.builtin.ValueError("Weather data is only available for the following cities: Blacksburg, Miami, San Jose, New York, Seattle.");
        }
        return Sk.ffi.remapToPy(WEATHER_REPORTS[city].map(function(elem){
            return elem['temperature'];
        }));
    });
    
    mod.get_report = new Sk.builtin.func(function(city) {
        Sk.builtin.pyCheckArgs("get_report", arguments, 1, 1);
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = normalize_city(city.v);
        if (city === null) {
            throw new Sk.builtin.ValueError("Weather data is only available for the following cities: Blacksburg, Miami, San Jose, New York, Seattle.");
        }
        return Sk.ffi.remapToPy(WEATHER_REPORTS[city][0]);
    });
    
    mod.get_forecasted_reports = new Sk.builtin.func(function(city) {
        Sk.builtin.pyCheckArgs("get_forecasted_reports", arguments, 1, 1);
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = normalize_city(city.v);
        if (city === null) {
            throw new Sk.builtin.ValueError("Weather data is only available for the following cities: Blacksburg, Miami, San Jose, New York, Seattle.");
        }
        return Sk.ffi.remapToPy(WEATHER_REPORTS[city]);
    });
    
    mod.get_highs_lows = new Sk.builtin.func(function(city) {
        Sk.builtin.pyCheckArgs("get_highs_lows", arguments, 1, 1);
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = normalize_city(city.v);
        if (city === null) {
            throw new Sk.builtin.ValueError("Weather data is only available for the following cities: Blacksburg, Miami, San Jose, New York, Seattle.");
        }
        var highs = [], lows = [];
        for (var i = 0; i < WEATHER_REPORTS[city].length; i+= 1) {
            var temperature = WEATHER_REPORTS[city][i]['temperature'];
            if (i % 2 == 0) {
                highs.push(temperature);
            } else {
                lows.push(temperature);
            }
        }
        return Sk.ffi.remapToPy({"highs": highs, "lows":  lows});
    });
    
    var get_temperatures = function(city) {
        return WEATHER_REPORTS[city].map(function(elem){
            return elem['temperature'];
        })
    };
    
    mod.get_all_forecasted_temperatures = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_all_forecasted_temperatures", arguments, 0, 0);
        return Sk.ffi.remapToPy([
            {"city": "Blacksburg, VA", "forecasts": get_temperatures("BLACKSBURG")},
            {"city": "Seattle, WA", "forecasts": get_temperatures("SEATTLE")},
            {"city": "Miami, FL", "forecasts": get_temperatures("MIAMI")},
            {"city": "San Jose, CA", "forecasts": get_temperatures("SANJOSE")},
            {"city": "New York, NY", "forecasts": get_temperatures("NEWYORK")},
        ]);
    });
    
    mod.connect = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("connect", arguments, 0, 0);
        CONNECTED = true;
    });
    mod.disconnect = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("disconnect", arguments, 0, 0);
        CONNECTED = false;
    });

    return mod;
};