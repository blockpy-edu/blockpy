var $builtinmodule = function(name)
{
    var mod = {};
    //mod.pi = Sk.builtin.assk$(Math.PI, Sk.builtin.nmber.float$);
    
    var CURRENT_WEATHER = {'BLACKSBURG': 60,
                           'SEATTLE': 47,
                           'MIAMI': 75,
                           'SANJOSE': 88,
                           'NEWYORK': 54};
   var HISTORIC_WEATHER = {'BLACKSBURG': [60, 71, 65, 66, 78, 75, 66, 55, 53],
                           'SEATTLE':    [47, 53, 42, 41, 44, 50, 46, 44, 42],
                           'MIAMI':      [75, 80, 80, 81, 82, 79, 78, 50, 60],
                           'SANJOSE':    [88, 89, 92, 93, 90, 88, 93, 87, 85],
                           'NEWYORK':    [54, 50, 60, 63, 65, 61, 60, 59, 55]};
    var PROPER_CITIES = {'BLACKSBURG': ["Blacksburg, VA", "blacksburg", "blacksburg,va"],
                         'SEATTLE': ['Seattle, WA', 'seattle', 'seattle,wa'],
                         'MIAMI':   ['Miami, FL', 'miami', 'miami,wa'],
                         'SANJOSE': ['San Jose, CA', 'san jose', 'san jose,ca'],
                         'NEWYORK': ['New York, NY', 'new york', 'new york,ny']};
    var FIRST_PROPER_CITIES = []
    for (var city in PROPER_CITIES) {
        for (index in PROPER_CITIES[city]) {
            var proper_city = PROPER_CITIES[city][index];
            FIRST_PROPER_CITIES.push(proper_city);
            CURRENT_WEATHER[proper_city.toLowerCase()] = CURRENT_WEATHER[city];
            HISTORIC_WEATHER[proper_city.toLowerCase()] = HISTORIC_WEATHER[city];
        }
    }

//	RNL	added
    mod.get_forecasts = new Sk.builtin.func(function(city) {
        Sk.builtin.pyCheckArgs("get_forecasts", arguments, 1, 1);
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = city.v.toLowerCase();
        if (! city in HISTORIC_WEATHER) {
            throw "Weather data is only available for the following cities: " + FIRST_PROPER_CITIES;
        }
        return new Sk.builtin.list(HISTORIC_WEATHER[city]);
    });
    
    mod.get_temperature = new Sk.builtin.func(function(city) {
        Sk.builtin.pyCheckArgs("get_temperature", arguments, 1, 1);
        Sk.builtin.pyCheckType("city", "string", Sk.builtin.checkString(city));
        city = city.v.toLowerCase();
        if (! city in CURRENT_WEATHER) {
            throw "Weather data is only available for the following cities: " + FIRST_PROPER_CITIES;
        }
        return new Sk.builtin.int_(CURRENT_WEATHER[city]);
    });

    return mod;
}