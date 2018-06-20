/**
 * @fileoverview CORGIS Skulpt Earthquake library for returning realistic, interesting data about earthquake events around the world.
 * @author acbart@vt.edu (Austin Cory Bart)
 */

var $builtinmodule = function(name)
{
    var mod = {};
    
    var EARTHQUAKE_DATA = [ 
        { "distance" : 0.0029, "gap" : 91.0, "id" : "nc72399435", "location" : { "depth" : 2.48, "latitude" : 38.827, "longitude" : -122.853 }, "location_description" : "10km WNW of The Geysers, California", "magnitude" : 0.66, "significance" : 7, "time" : 1424577875110 },
        { "distance" : 0.0717, "gap" : 129.0, "id" : "nc72399425", "location" : { "depth" : 8.1, "latitude" : 38.5776, "longitude" : -122.554 }, "location_description" : "2km E of Calistoga, California", "magnitude" : 1.62, "significance" : 40, "time" : 1424574975250},
        { "distance" : 0.0780, "gap" : 150.0, "id" : "nc72399420", "location" : { "depth" : 4.48, "latitude" : 38.587, "longitude" : -122.557 }, "location_description" : "2km ENE of Calistoga, California", "magnitude" : 1.4, "significance" : 30, "time" : 1424574832330 },
        { "distance" : 0.1238, "gap" : 147.0, "id" : "nc72399415", "location" : { "depth" : 9.17, "latitude" : 40.2758, "longitude" : -121.387 }, "location_description" : "13km WSW of Chester, California", "magnitude" : 1.93, "significance" : 57, "time" : 1424574753850 }, 
        { "distance" : 0.0054, "gap" : 49.0, "id" : "nc72399410", "location" : { "depth" : 2.61, "latitude" : 38.8373, "longitude" : -122.829 }, "location_description" : "9km W of Cobb, California", "magnitude" : 0.87, "significance" : 12, "time" : 1424574374130 }, 
        { "distance" : 1.2127, "gap" : 342.0, "id" : "pr15053000", "location" : { "depth" : 107.0, "latitude" : 18.6208, "longitude" : -68.2754 }, "location_description" : "14km ENE of Punta Cana, Dominican Republic", "magnitude" : 3.1000, "significance" : 148, "time" : 1424574304700 }, 
        { "distance" : 1.9430, "gap" : 95.0, "id" : "usc000ts7u", "location" : { "depth" : 10.0, "latitude" : 40.0871, "longitude" : 143.5009 }, "location_description" : "141km ENE of Miyako, Japan", "magnitude" : 5.0, "significance" : 385, "time" : 1424573622970 }, 
        { "distance" : 0.0500, "gap" : 45.0, "id" : "ci37099639", "location" : { "depth" : 13.8800, "latitude" : 33.6235, "longitude" : -116.681 }, "location_description" : "8km N of Anza, California", "magnitude" : 0.9399, "significance" : 14, "time" : 1424573419770 }, 
        { "distance" : 0.0063, "gap" : 111.0, "id" : "nc72399375", "location" : { "depth" : 2.25, "latitude" : 38.8230, "longitude" : -122.8431 }, "location_description" : "9km NW of The Geysers, California", "magnitude" : 0.2899, "significance" : 1, "time" : 1424569656300 }, 
        { "distance" : 0.161, "gap" : 171.75, "id" : "nn00483998", "location" : { "depth" : 14.7375, "latitude" : 37.1516, "longitude" : -117.2762 }, "location_description" : "53km WNW of Beatty, Nevada", "magnitude" : 0.9599, "significance" : 14, "time" : 1424568722388 }, 
        { "distance" : 0.0184, "gap" : 108.0, "id" : "nc72399370", "location" : { "depth" : 2.569, "latitude" : 38.8228, "longitude" : -122.8598 }, "location_description" : "10km WNW of The Geysers, California", "magnitude" : 0.5400, "significance" : 4, "time" : 1424568640760 }, 
        { "distance" : 0.0278, "gap" : 126.0, "id" : "nc72399360", "location" : { "depth" : 7.4699, "latitude" : 37.6376, "longitude" : -118.9359 }, "location_description" : "3km ESE of Mammoth Lakes, California", "magnitude" : 1.1000, "significance" : 19, "time" : 1424568510180 }]

    mod.get = new Sk.builtin.func(function(property) {
        Sk.builtin.pyCheckArgs("get", arguments, 1, 1);
        Sk.builtin.pyCheckType("property", "string", Sk.builtin.checkString(property));
        switch (property.v.toLowerCase()) {
            case "magnitude":
                return Sk.ffi.remapToPy(EARTHQUAKE_DATA.map(function(elem) {
                    return elem['magnitude'];
                }));
            case "depth":
                return Sk.ffi.remapToPy(EARTHQUAKE_DATA.map(function(elem) {
                    return elem['location']['depth'];
                }));
            default:
                throw new Sk.builtin.ValueError("Only depth and magnitude are available through this function.");
        }
    });
    
    mod.get_both = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_both", arguments, 0, 0);
        return Sk.ffi.remapToPy(EARTHQUAKE_DATA.map(function(elem) {
                return {'magnitude': elem['magnitude'],
                        'depth': elem['location']['depth']};
            }));
    });
    
    mod.get_all = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_all", arguments, 0, 0);
        return Sk.ffi.remapToPy(EARTHQUAKE_DATA);
    });
    

    return mod;
}