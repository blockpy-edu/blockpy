var jsdom = require('jsdom'),
    window = jsdom.jsdom().defaultView;

jsdom.jQueryify(window, "./libs/jquery.js", function(){
    var $ = window.$; 
})

//require("./libs/jquery.js");
require("./libs/jquery-ui.min.js");
require("./libs/jquery.hotkeys.js");
require("./libs/jquery.multi-select.js");
require("./libs/d3.min.js");
require("./libs/math.0.19.0.min.js");
require("./libs/bootstrap.min.js");
require("./libs/bootstrap-wysiwyg.js");
require("./libs/mindmup-editabletable.js");
require("./libs/codemirror/codemirror.js");
require("./libs/codemirror/python.js");
require("./libs/codemirror/htmlmixed.js");
require("./libs/codemirror/xml.js");
require("./libs/knockout-3.4.0.js");
require('./dist/blockpy.js')