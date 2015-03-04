var $builtinmodule = function(name)
{
    var mod = {};
    
    var WEATHER_REPORTS = {
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

    return mod;
};