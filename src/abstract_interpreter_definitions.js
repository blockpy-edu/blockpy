AbstractInterpreter.prototype.TYPE_INHERITANCE = {
    "Sequence": ["List", "Set", "Tuple", "Str"],
    "Num": ["Int", "Float"]
}
AbstractInterpreter.prototype.BUILTINS = {
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
    "range": {
        "type": "Function",
        "returns": {"type": "List", "subtype": {"type": "Num"}},
        "parameters": [
            {"type": "Num"},
            {"type": "Num", "optional": true}
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
    'input': {"type": "Str"},
    'reversed': {"type": "List"},
    'len': {"type": "Num"},
    'type': {"type": "Any"},
    'dir': {"type": "List"}
};
AbstractInterpreter.METHODS = {
    "List": {
        "append": {
            "type": "Function",
            "returns": {"type": "None"}
        }
    }
}
AbstractInterpreter.MODULES = {
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