var $builtinmodule = function(name)
{
    var mod = {};
    
    var CONNECTED = false;
    
    var WEATHER_REPORTS = {
    'BLACKSBURG':[{'temperature': 78, 'humidity':  20, 'wind':  7}, {'temperature': 61, 'humidity': 50, 'wind': 10},
                  {'temperature': 81, 'humidity': 100, 'wind':  5}, {'temperature': 62, 'humidity': 90, 'wind': 15},
                  {'temperature': 84, 'humidity':  30, 'wind': 19}, {'temperature': 66, 'humidity':  0, 'wind': 28},
                  {'temperature':  87, 'humidity':   0, 'wind': 12}, {'temperature':  68, 'humidity':  0, 'wind': 14},
                  {'temperature': 86, 'humidity':   0, 'wind':  4}, {'temperature':  68, 'humidity': 60, 'wind':  0}],
    'SEATTLE':   [{'temperature': 76, 'humidity': 10, 'wind':  7}, {'temperature': 60, 'humidity': 0, 'wind': 9},
                  {'temperature': 74, 'humidity': 0, 'wind':  9}, {'temperature': 58, 'humidity': 20, 'wind': 3},
                  {'temperature': 77, 'humidity':  10, 'wind': 10}, {'temperature': 59, 'humidity':  30, 'wind': 6},
                  {'temperature': 80, 'humidity':  20, 'wind':  7}, {'temperature': 62, 'humidity':  0, 'wind': 7},
                  {'temperature': 85, 'humidity':  0, 'wind':  2}, {'temperature': 61, 'humidity': 0, 'wind': 2}],
    'MIAMI':     [{'temperature': 89, 'humidity': 60, 'wind': 12}, {'temperature': 79, 'humidity': 60, 'wind': 14},
                  {'temperature': 71, 'humidity': 60, 'wind': 15}, {'temperature': 88, 'humidity': 60, 'wind': 17},
                  {'temperature': 80, 'humidity':  40, 'wind': 11}, {'temperature': 88, 'humidity': 40, 'wind':  9},
                  {'temperature': 82, 'humidity':  30, 'wind':  8}, {'temperature': 88, 'humidity':  30, 'wind': 10},
                  {'temperature': 81, 'humidity':  30, 'wind':  5}, {'temperature': 88, 'humidity':  30, 'wind':  3}],
    'SANJOSE':   [{'temperature': 82, 'humidity': 0, 'wind': 10}, {'temperature': 61, 'humidity': 0, 'wind': 11},
                  {'temperature': 83, 'humidity': 0, 'wind': 13}, {'temperature': 62, 'humidity': 0, 'wind':  6},
                  {'temperature': 82, 'humidity': 0, 'wind':  7}, {'temperature': 62, 'humidity': 0, 'wind':  8},
                  {'temperature': 79, 'humidity': 0, 'wind':  3}, {'temperature': 62, 'humidity': 0, 'wind':  4},
                  {'temperature': 79, 'humidity': 0, 'wind':  2}, {'temperature': 62, 'humidity': 0, 'wind':  5}],
    'NEWYORK':   [{'temperature': 74, 'humidity':   70, 'wind':  5}, {'temperature': 77, 'humidity':  40, 'wind': 10},
                  {'temperature': 64, 'humidity':   0, 'wind': 27}, {'temperature': 81, 'humidity':  0, 'wind': 17},
                  {'temperature': 65, 'humidity':   0, 'wind': 15}, {'temperature': 81, 'humidity': 0, 'wind': 4},
                  {'temperature': 70, 'humidity':  30, 'wind': 17}, {'temperature': 84, 'humidity': 30, 'wind': 9},
                  {'temperature': 73, 'humidity': 30, 'wind': 8}, {'temperature': 88, 'humidity': 30, 'wind': 4}]
/*
    'BLACKSBURG':[{'temperature': 30, 'humidity':  20, 'wind':  3}, {'temperature': 25, 'humidity': 50, 'wind': 10},
                  {'temperature': 29, 'humidity': 100, 'wind':  5}, {'temperature': 18, 'humidity': 90, 'wind': 15},
                  {'temperature': 24, 'humidity':  30, 'wind': 19}, {'temperature': 14, 'humidity':  0, 'wind': 28},
                  {'temperature':  7, 'humidity':   0, 'wind': 12}, {'temperature':  0, 'humidity':  0, 'wind': 14},
                  {'temperature': 12, 'humidity':   0, 'wind':  4}, {'temperature':  2, 'humidity': 60, 'wind':  0}],
    'SEATTLE':   [{'temperature': 56, 'humidity': 100, 'wind':  7}, {'temperature': 37, 'humidity': 100, 'wind': 9},
                  {'temperature': 55, 'humidity': 100, 'wind':  9}, {'temperature': 40, 'humidity': 100, 'wind': 3},
                  {'temperature': 54, 'humidity':  80, 'wind': 10}, {'temperature': 43, 'humidity':  70, 'wind': 6},
                  {'temperature': 52, 'humidity':  40, 'wind':  7}, {'temperature': 42, 'humidity':  20, 'wind': 7},
                  {'temperature': 51, 'humidity':  80, 'wind':  2}, {'temperature': 41, 'humidity': 100, 'wind': 2}],
    'MIAMI':     [{'temperature': 70, 'humidity': 20, 'wind': 12}, {'temperature': 69, 'humidity': 40, 'wind': 14},
                  {'temperature': 71, 'humidity': 20, 'wind': 15}, {'temperature': 71, 'humidity': 20, 'wind': 17},
                  {'temperature': 68, 'humidity':  0, 'wind': 11}, {'temperature': 64, 'humidity': 20, 'wind':  9},
                  {'temperature': 77, 'humidity':  0, 'wind':  8}, {'temperature': 72, 'humidity':  0, 'wind': 10},
                  {'temperature': 79, 'humidity':  0, 'wind':  5}, {'temperature': 73, 'humidity':  0, 'wind':  3}],
    'SANJOSE':   [{'temperature': 65, 'humidity': 0, 'wind': 10}, {'temperature': 48, 'humidity': 0, 'wind': 11},
                  {'temperature': 66, 'humidity': 0, 'wind': 13}, {'temperature': 43, 'humidity': 0, 'wind':  6},
                  {'temperature': 68, 'humidity': 0, 'wind':  7}, {'temperature': 42, 'humidity': 0, 'wind':  8},
                  {'temperature': 67, 'humidity': 0, 'wind':  3}, {'temperature': 43, 'humidity': 0, 'wind':  4},
                  {'temperature': 70, 'humidity': 0, 'wind':  2}, {'temperature': 44, 'humidity': 0, 'wind':  5}],
    'NEWYORK':   [{'temperature': 5, 'humidity':   50, 'wind':  5}, {'temperature': 8, 'humidity':  40, 'wind': 10},
                  {'temperature': 8, 'humidity':   80, 'wind': 27}, {'temperature': 3, 'humidity':  90, 'wind': 17},
                  {'temperature': 2, 'humidity':   90, 'wind': 15}, {'temperature': 1, 'humidity': 100, 'wind': 4},
                  {'temperature': 9, 'humidity':  100, 'wind': 17}, {'temperature': 5, 'humidity': 100, 'wind': 9},
                  {'temperature': -4, 'humidity': 100, 'wind': 8}, {'temperature': -10, 'humidity': 100, 'wind': 4}]
*/
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