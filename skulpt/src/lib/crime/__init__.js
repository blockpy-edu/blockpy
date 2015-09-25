/**
 * @fileoverview CORGIS Skulpt Crime library for returning realistic, interesting data about UCR crime reports in America.
 * @author acbart@vt.edu (Austin Cory Bart)
 */

var $builtinmodule = function(name)
{
    var mod = {};
    
    if (_CRIME_DATA === undefined) {
        throw new Sk.builtin.NameError(
                "Can not resolve _CRIME_DATA. Make sure the file is available!");
    }

    mod.get_property_crimes = new Sk.builtin.func(function(state) {
        Sk.builtin.pyCheckArgs("get_property_crimes", arguments, 1, 1);
        Sk.builtin.pyCheckType("state", "string", Sk.builtin.checkString(state));
        state = state.v.toLowerCase();
        if (! (state in _CRIME_DATA)) {
            throw new Sk.builtin.Exception("State name not found: "+state);
        }
        return Sk.ffi.remapToPy(_CRIME_DATA[state]['data'].map(function(elem) {
            return elem['rates']['property']['all'];
        }));
    });
    
    mod.get_violent_crimes = new Sk.builtin.func(function(state) {
        Sk.builtin.pyCheckArgs("get_violent_crimes", arguments, 1, 1);
        Sk.builtin.pyCheckType("state", "string", Sk.builtin.checkString(state));
        state = state.v.toLowerCase();
        if (! (state in _CRIME_DATA)) {
            throw new Sk.builtin.Exception("State name not found: "+state);
        }
        return Sk.ffi.remapToPy(_CRIME_DATA[state]['data'].map(function(elem) {
            return elem['rates']['violent']['all'];
        }));
    });
    
    mod.get_by_year = new Sk.builtin.func(function(year) {
        Sk.builtin.pyCheckArgs("get_by_year", arguments, 1, 1);
        Sk.builtin.pyCheckType("year", "string", Sk.builtin.checkString(year));
        year = year.v.toLowerCase();
        var year_data = Array();
        for (var state in _CRIME_DATA) {
            var data = _CRIME_DATA[state]['data'];
            for (var i = 0; i < data.length; i+= 1) {
                if (data[i]['year'] == year) {
                    year_data.push({'state': _CRIME_DATA[state]['state'],
                                    'violent': _CRIME_DATA[state]['data'][i]['rates']['violent']['all'],
                                    'property': _CRIME_DATA[state]['data'][i]['rates']['property']['all'],
                                    'population': _CRIME_DATA[state]['data'][i]['population']});
                }
            }
        }
        if (year_data.length == 0) {
            throw new Sk.builtin.Exception("Year not valid: "+year);
        }
        return Sk.ffi.remapToPy(year_data);
    });
    
    mod.get_all = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_all", arguments, 0, 0);
        return Sk.ffi.remapToPy(_CRIME_DATA);
    });
    

    return mod;
};