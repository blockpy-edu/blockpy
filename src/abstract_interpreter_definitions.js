AbstractInterpreter.prototype.TYPE_INHERITANCE = {
    "Sequence": ["List", "Set", "Tuple", "Str"],
    "Num": ["Int", "Float"]
}
AbstractInterpreter.prototype.BUILTINS = {
    //
    'KeyError': {"type": "Exception"},
    'IOError': {"type": "Exception"},
    // Values
    'True': {"type": "Bool"}, 
    'False': {"type": "Bool"}, 
    'None': {"type": 'None'},
    // Functions
    "print": {
        "type": "Function",
        "returns": {"type": "None"},
        "parameters": [
            {"type": "Any", "var": true}
        ]
    },
    "sum": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": "Sequence"},
            {"type": "Num", "optional": true}
        ]
    },
    "max": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": "Sequence"},
        ]
    },
    "min": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": "Sequence"},
        ]
    },
    "open": {
        "type": "Function",
        "returns": {"type": "File"},
        "parameters": [
            {"type": "Str"},
            {"type": "Str", "name": "mode", "optional": true}
        ]
    },
    "round": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": "Num"},
            {"type": "Num"}
        ]
    },
    "float": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": ["Str", "Num", "Bool"]}
        ]
    },
    "range": {
        "type": "Function",
        "returns": {"type": "List", "subtype": {"type": "Num"}},
        "parameters": [
            {"type": "Num"},
            {"type": "Num", "optional": true}
        ]
    },
    "map": {
        "type": "Function",
        "returns": {"type": "List"},
        "parameters": [
            {"type": "Function"},
            {"type": "Sequence"}
        ]
    },
    "filter": {
        "type": "Function",
        "returns": {"type": "List"},
        "parameters": [
            {"type": "Function"},
            {"type": "Sequence"}
        ]
    },
    "sorted": {
        "type": "Function",
        "returns": {"type": "List"},
        "parameters": [
            {"type": "Sequence"},
            {"type": "Function", "optional": true},
            {"type": "Function", "optional": true}
        ]
    },
    "xrange": {
        "type": "Function",
        "returns": {"type": "List", "subtype": {"type": "Num"}},
        "parameters": [
            {"type": "Num"},
            {"type": "Num", "optional": true}
        ]
    },
    "str": {
        "type": "Function",
        "returns": {"type": "Str"},
        "parameters": [
            {"type": "Any"}
        ]
    },
    "set": {
        "type": "Function",
        "returns": {"type": "Set"},
        "parameters": [
            {"type": "Any"}
        ]
    },
    "list": {
        "type": "Function",
        "returns": {"type": "List"},
        "parameters": [
            {"type": "Any"}
        ]
    },
    "dict": {
        "type": "Function",
        "returns": {"type": "Dict"},
        "parameters": [
            {"type": "Any"}
        ]
    },
    "abs": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": "Num"}
        ]
    },
    "int": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": "Any"}
        ]
    },
    "len": {
        "type": "Function",
        "returns": {"type": "Num"},
        "parameters": [
            {"type": "Sequence"}
        ]
    },
    'input': {"type": "Str"},
    'reversed': {"type": "List"},
    'type': {"type": "Any"},
    'dir': {"type": "List"}
};
AbstractInterpreter.METHODS = {
    "List": {
        "append": {
            "type": "Function",
            "returns": {"type": "None"}
        }
    },
    "Str": {
        "strip": {
            "type": "Function",
            "returns": {"type": "Str"}
        }
    }
}
AbstractInterpreter.MODULES = {
    'random': {
        'randint': { "type": "Function", "returns": {"type": "Num"}},
        'choice': { "type": "Function", "returns": {"type": "Any"}},
        'shuffle': { "type": "Function", "returns": {"type": "None"}},
    },
    'parking': {
        'now': { 'type': 'ParkingTime'},
        'Time': { 'type': 'ParkingTime'},
        'Day': { 'type': 'ParkingDay'},
        'today': { 'type': 'ParkingDay'}
    },
    'weather': {
        'get_temperature': {"type": 'Num'},
        'get_forecasts': {"type": "List", "empty": false, "component": {"type": 'Num'}},
        'get_report': {"type": "Dict", "all_strings": true,
                       "keys": {"temperature": {"type": 'Num'}, 
                                "humidity": {"type": "Num"},
                       "wind": {"type": "Num"}}},
        'get_forecasted_reports': [{"temperature": 'Num', "humidity": "Num", "wind": "Num"}],
        'get_all_forecasted_temperatures': [{'city': 'str', 'forecasts': ['int']}],
        'get_highs_lows': {'highs': ['Num'], 'lows': ['Num']}
    },
    'image': {
        
    },
    'stocks': {
        'get_current': 'float',
        'get_past': ['float'],
    },
    'earthquakes': {
        'get': ['float'],
        'get_both': [{'magnitude': 'float', 'depth': 'float'}],
        'get_all': [{'magnitude': 'float', 'distance': 'float', 'gap': 'int', 
                        'id': 'str', 'significance': 'int', 'time': 'int',
                        'location': {'depth': 'float', 'latitude': 'float', 'longitude': 'float',
                                     'location_description': 'str'}}]
    },
    'crime': {
        'get_property_crimes': ['float'],
        'get_violent_crimes': ['float'],
        'get_both_crimes': ['float'],
        'get_by_year': [{'state': 'str', 'violent': 'float', 'property': 'float', 'population': 'int'}],
        'get_all': {}
    },
    'books': {
        'get_all': [{'title': 'str', 'author': 'str', 'price': 'float', 'paperback': 'bool', 'page count': 'int'}]
    }
}