function arrayContains(needle, haystack) {
    return haystack.indexOf(needle) > -1;
}

function AbstractInterpreter(code, filename) {
    NodeVisitor.apply(this, Array.prototype.slice.call(arguments));
    this.id = 0;
    this.frameIndex = 0;
    this.code = code;
    this.source = code !== "" ? this.code.split("\n") : [];
    this.filename = filename || '__main__';
    this.stackDepth = 0;
}

AbstractInterpreter.prototype = new NodeVisitor();

AbstractInterpreter.prototype.BUILTINS = {'print': {"type": 'None'}, 
                                'True': {"type": "Bool"}, 
                                'False': {"type": "Bool"}, 
                                'None': {"type": 'None'}}
AbstractInterpreter.prototype.MODULES = {
    'weather': {
        'get_temperature': 'int',
        'get_forecasts': ['int'],
        'get_report': {"temperature": 'int', "humidity": "int", "wind": "int"},
        'get_forecasted_reports': [{"temperature": 'int', "humidity": "int", "wind": "int"}],
        'get_all_forecasted_temperatures': [{'city': 'str', 'forecasts': ['int']}],
        'get_highs_lows': {'highs': ['int'], 'lows': ['int']}
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

AbstractInterpreter.prototype.newReport = function(parentFrame) {
    return {
            "Unread variables": [],
            "Undefined variables": [],
            "Overwritten variables": [],
            "Used plurals": [],
            "Unused singulars": [],
            "Non-list iterations": [],
            "Empty iterations": [],
            "Type changes": [],
            "Singular is plural": [],
            "Unknown functions": []
        }
}

AbstractInterpreter.prototype.newFrame = function(parentFrame) {
    this.frameIndex += 1;
    return {"variables":{}, 
            "plurals": [], 
            "singulars": [], 
            "children": [],
            "writes": [],
            "reads": [],
            "parentFrame": parentFrame,
            "index": this.frameIndex};
}

AbstractInterpreter.prototype.analyze = function() {    
    // Attempt parsing - might fail!
    var ast;
    try {
        var parse = Sk.parse(this.filename, this.code);
        ast = Sk.astFromParse(parse.cst, this.filename, parse.flags);
    } catch (error) {
        return {"error": error, "message": "Parsing error"};
    }
    
    this.rootFrame = this.newFrame(null);
    this.currentFrame = this.rootFrame;
    this.report = this.newReport();
    
    for (var name in this.BUILTINS) {
        this.addVariable(name);
        this.setType(name, this.BUILTINS[name]);
    }
    
    this.visit(ast);
    this.postProcess();
}

AbstractInterpreter.prototype.postProcess = function() {
    this.checkUnreadVariables(this.rootFrame)
    this.checkUnusedSingular(this.rootFrame)
    this.checkUsedPlural(this.rootFrame)
    this.checkSingularIsPlural(this.rootFrame)
}

AbstractInterpreter.prototype.getFrameIndex = function() {
    return this.currentFrame.index;
}
AbstractInterpreter.prototype.addSingular = function(singular) {
    this.currentFrame.singulars.push(singular);
}
AbstractInterpreter.prototype.addPlural = function(plural) {
    this.currentFrame.plurals.push(plural);
}
AbstractInterpreter.prototype.addFrame = function() {
    var newChild = this.newFrame(this.currentFrame)
    this.currentFrame.children.push(newChild)
    this.currentFrame = newChild
}
AbstractInterpreter.prototype.leaveFrame = function() {
    this.currentFrame = this.currentFrame.parentFrame;
}
AbstractInterpreter.prototype.addVariable = function(name) {
    var currentFrame = this.currentFrame;
    currentFrame.writes.push(name);
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            var behavior = currentFrame.variables[name].behavior;
            if (behavior.slice(-1)[0] == "write") {
                this.report["Overwritten variables"].push(name)
            }
            behavior.push("write");
            return;
        }
        currentFrame = currentFrame.parentFrame;
    }
    this.currentFrame.variables[name] = {"behavior": ["write"], "type": null};
}
AbstractInterpreter.prototype.setType = function(name, type) {
    var currentFrame = this.currentFrame;
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            var variable = currentFrame.variables[name];
            if (variable.type !== null) {
                if (variable.type !== type) {
                    this.report["Type changes"].push(name);
                }
            }
            variable.type = type;
            return;
        }
        currentFrame = currentFrame.parentFrame;
    }
}

AbstractInterpreter.prototype.getType = function(name) {
    var currentFrame = this.currentFrame;
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            return currentFrame.variables[name].type;
        }
        currentFrame = currentFrame.parentFrame;
    }
    return null;
}

AbstractInterpreter.prototype.isTypeEmptyList = function(name) {
    var type = this.getType(name);
    return (type !== null && type.constructor === Array) && (type.length == 0);
}
AbstractInterpreter.prototype.isTypeList = function(name) {
    var type = this.getType(name);
    return (type !== null && type.constructor === Array);
}
AbstractInterpreter.prototype.readVariable = function(name) {
    var currentFrame = this.currentFrame;
    currentFrame.reads.push(name);
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            currentFrame.variables[name].behavior.push("read");
            return;
        }
        currentFrame = currentFrame.parentFrame;
    }
    this.report["Undefined variables"].push(name);
}
AbstractInterpreter.prototype.checkUnreadVariables = function(frame) {
    //TODO: Make it check EVERYWHERE before deciding to report unread
    for (var name in frame.variables) {
        if (!("read" in frame.variables[name].behavior)) {
            if (!(name in this.BUILTINS)) {
                this.report["Unread variables"].push(name);
            }
        }
    }
    for (var i = 0, len = frame.children.length; i < len; i++) {
        this.checkUnreadVariables(frame.children[i])
    }
}

AbstractInterpreter.prototype.checkUnusedSingular = function(frame) {
    for (var i = 0, len = frame.singulars.length; i < len; i++) {
        if (!(this.walkFramesForUse(frame, frame.singulars[i], "reads"))) {
            this.report["Unused singulars"].push(frame.singulars[i])
        }
    }
    for (var i = 0, len = frame.children.length; i < len; i++) {
        this.checkUnusedSingular(frame.children[i])
    }
}
AbstractInterpreter.prototype.checkUsedPlural = function(frame) {
    for (var i = 0, len = frame.plurals.length; i < len; i++) {
        if (this.walkFramesForUse(frame, frame.plurals[i], "both")) {
            this.report["Used plurals"].push(frame.plurals[i])
        }
    }
    for (var i = 0, len = frame.children.length; i < len; i++) {
        this.checkUsedPlural(frame.children[i])
    }
}
AbstractInterpreter.prototype.checkSingularIsPlural = function(frame) {
    for (var i = 0, len = frame.plurals.length; i < len; i++) {
        for (var j = 0, len = frame.singulars.length; j < len; j++) {
            if (frame.plurals[i] == frame.singulars[j]) {
                this.report["Singular is plural"].push(frame.singulars[j]);
            }
        }
    }
    for (var i = 0, len = frame.children.length; i < len; i++) {
        this.checkSingularIsPlural(frame.children[i])
    }
}
AbstractInterpreter.prototype.walkFramesForUse = function(frame, name, type) {
    if (type === undefined) {
        type = "both";
    }
    if ((type == "both" || type == "reads") && arrayContains(name, frame.reads)) {
        return true;
    }
    if ((type == "both" || type == "writes") && arrayContains(name, frame.writes)) {
        return true;
    }
    var result = false;
    for (var i = 0, len = frame.children.length; i < len; i++) {
        result = result || this.walkFramesForUse(frame.children[i], name, type);
    }
    return result;
}

AbstractInterpreter.prototype.visit = function(node) {
    this.stackDepth += 1;
    NodeVisitor.prototype.visit.call(this, node);
    this.stackDepth -= 1;
}

AbstractInterpreter.prototype.typecheck = function(value) {
    switch (value._astname) {
        case "Name":
            return this.getType(value.id.v);
        case "Num": case "Str":
            return {"type": value._astname};
        case "Tuple":
            var components = [];
            for (var i = 0, len = value.elts.length; i < len; i++) {
                components.push(this.typecheck(value.elts[i]))
            }
            return {"type": "Tuple", "components": components};
        case "Dict":
            var keys = [], values = [], string_keys = true;
            for (var i = 0, len = value.keys.length; i < len; i++) {
                var key_type = this.typecheck(value.keys[i]);
                keys.push(key_type);
                values.push(this.typecheck(value.values[i]))
                string_keys = string_keys && (key_type.type == "Str");
            }
            return {"type": "Dict", "keys": keys, "values": values, "all strings": string_keys};
        case "List":
            if (value.elts.length == 0) {
                return {"type": "List", "empty": true};
            } else {
                return {"type": "List", "empty": false, "component": this.typecheck(value.elts[0])};
            }
        case "Call":
            return this.walkAttributeChain(value.func);
        default:
            return {"type": "Unknown"}
    }
}

AbstractInterpreter.prototype.walkAttributeChain = function(attribute) {
    if (this._astname == "Attribute") {
        var result = this.walkAttributeChain(attribute.value);
        if (result == null) {
            return null;
        } else if (attribute.attr in result) {
            return result[attribute.attr];
        } else {
            this.report["Unknown functions"].append(attribute.attr);
            return null;
        }
    } else if (this._astname == "Name") {
        if (attribute.id.v in this.MODULES) {
            return MODULES[attribute.id.v];
        } else {
            this.report["Unknown functions"].append(attribute.attr);
            return null;
        }
    }
}

AbstractInterpreter.prototype.visit_AugAssign = function(node) {
    var typeValue = this.typecheck(node.value);
    this.generic_visit(node);
    var walked = this.walk(node.target);
    for (var i = 0, len = walked.length; i < len; i++) {
        var targetChild = walked[i];
        if (targetChild._astname == "Tuple") {
            
        } else if (targetChild._astname == "Name") {
            this.setType(targetChild.id.v, typeValue);
        }
    }
}
AbstractInterpreter.prototype.visit_Assign = function(node) {
    var typeValue = this.typecheck(node.value);
    this.generic_visit(node);
    for (var i = 0, len = node.targets.length; i < len; i++) {
        var walked = this.walk(node.targets[i]);
        for (var j = 0, len = walked.length; j < len; j++) {
            var targetChild = walked[j];
            if (targetChild._astname == "Tuple") {
                
            } else if (targetChild._astname == "Name") {
                this.setType(targetChild.id.v, typeValue);
            }
        }
    }
}
AbstractInterpreter.prototype.visit_Import = function(node) {
    for (var i = 0, len = node.names.length; i < len; i++) {
        var module = node.names[i];
        var asname = module.asname === null ? module.name : module.asname;
        this.addVariable(asname.v);
        this.setType(asname.v, {"type": "Module"});
    }
}
AbstractInterpreter.prototype.visit_ImportFrom = function(node) {
    for (var i = 0, len = node.names.length; i < len; i++) {
        var module = node.module === null ? node.names[i] : node.module + node.names[i];
        var asname = module.asname === null ? module.name : module.asname;
        this.addVariable(asname.v);
        this.setType(asname.v, {"type": "Module"});
    }
}

AbstractInterpreter.prototype.visit_Name = function(node) {
    if (node.ctx.name == "Store") {
        this.addVariable(node.id.v);
    } else if (node.ctx.name === "Load") {
        this.readVariable(node.id.v);
    }
    this.generic_visit(node);
}

AbstractInterpreter.prototype.visit_For = function(node) {
    this.visit(node.iter);
    this.addFrame();
    var walked = this.walk(node.iter);
    for (var i = 0, len = walked.length; i < len; i++) {
        var child = walked[i];
        if (child._astname === "Name" && child.ctx.name === "Load") {
            if (this.isTypeEmptyList(child.id.v)) {
                this.report["Empty iterations"].push(child.id.v);
            }
            if (!(this.isTypeList(child.id.v))) {
                this.report["Non-list iterations"].push(child.id.v);
            }
            this.addPlural(child.id.v);
        } else if (child._astname === "List" && child.elts.length === 0) {
            this.report["Empty iterations"].push(child.lineno);
        } else {
            console.log(child);
        }
    }
    walked = this.walk(node.target);
    for (var i = 0, len = walked.length; i < len; i++) {
        var child = walked[i];
        if (child._astname === "Name" && child.ctx.name === "Store") {
            this.addSingular(child.id.v);
        }
    }
    this.visit(node.target);
    var iterType = this.typecheck(node.iter);
    if (iterType !== null && iterType.type == "List" && !iterType.empty) {
        this.setType(node.target.id.v, iterType.component);
    }
    for (var i = 0, len = node.body.length; i < len; i++) {
        this.visit(node.body[i]);
    }
    for (var i = 0, len = node.orelse.length; i < len; i++) {
        this.visit(node.orelse[i]);
    }
    this.leaveFrame();
}

var filename = '__main__.py';
var python_source = 'import weather\nb = 0\nfor x in y:\n    t = 0\nfor x in []:\n    p = 0\nfor temp in temp:\n    temp += 1\nweather = 7\nred = 7\nb = "red"';
var analyzer = new AbstractInterpreter(python_source);
analyzer.analyze()
console.log(python_source);
console.log(analyzer.report);