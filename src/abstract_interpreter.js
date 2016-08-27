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
                                'sum': {"type": "Num"},
                                'round': {"type": "Num"},
                                'range': {"type": "List"},
                                'xrange': {"type": "List"},
                                'reversed': {"type": "List"},
                                'len': {"type": "Num"},
                                'True': {"type": "Bool"}, 
                                'False': {"type": "Bool"}, 
                                'None': {"type": 'None'}}
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
            "Append to non-list": [],
            "Used iteration list": [],
            "Unused iteration variable": [],
            "Non-list iterations": [],
            "Empty iterations": [],
            "Type changes": [],
            "Iteration variable is iteration list": [],
            "Unknown functions": [],
            "Incompatible types": []
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
    try {
        var parse = Sk.parse(this.filename, this.code);
        this.ast = Sk.astFromParse(parse.cst, this.filename, parse.flags);
    } catch (error) {
        return {"error": error, "message": "Parsing error"};
    }
    
    this.rootFrame = this.newFrame(null);
    this.currentFrame = this.rootFrame;
    this.report = this.newReport();
    this.ifStack = [];
    
    for (var name in this.BUILTINS) {
        this.addVariable(name);
        this.setType(name, this.BUILTINS[name]);
    }
    
    this.visit(this.ast);
    this.postProcess();
    return true;
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
AbstractInterpreter.prototype.addVariable = function(name, loc) {
    var currentFrame = this.currentFrame;
    currentFrame.writes.push(name);
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            var behavior = currentFrame.variables[name].behavior;
            if (behavior.slice(-1)[0].mode == "write") {
                this.report["Overwritten variables"].push({
                    'name': name,
                    'last_location': loc,
                    'first_location': behavior[0].location
                })
            }
            behavior.push({"mode": "write", "location": loc});
            return;
        }
        currentFrame = currentFrame.parentFrame;
    }
    this.currentFrame.variables[name] = {"behavior": [{"mode": "write", "location": loc}], "type": null};
}

AbstractInterpreter.prototype.setListType = function(name, type, loc) {
    var currentFrame = this.currentFrame;
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            var variable = currentFrame.variables[name];
            if (variable.type.type === "List") {
                if (variable.type.empty || this.testTypeEquality(variable.type.component, type)) {
                    variable.type = {"type": "List", "empty": false, "component": type};
                } else {
                    this.report["Type changes"].push(loc);
                }
            } else {
                this.report["Append to non-list"].push(name);
            }
            // Adjust the read to become a write
            for (var i = variable.behavior.length-1; i > 0; i = i-1) {
                if (variable.behavior[i].location == loc) {
                    variable.behavior[i].mode = "append";
                }
            }
        }
        currentFrame = currentFrame.parentFrame;
    }
}
AbstractInterpreter.prototype.testTypeEquality = function(left, right) {
    if (left === null || right === null) {
        return false;
    } else if (left.type === null || right.type === null) {
        return false;
    } else if (left.type === "List" && right.type === "List") {
        if (left.empty && right.empty) {
            return true;
        } else if (left.empty || right.empty) {
            return false;
        } else {
            return left.component == right.component
        }
    } else {
        return left.type == right.type;
    }
}
AbstractInterpreter.prototype.setType = function(name, type, loc) {
    var currentFrame = this.currentFrame;
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            var variable = currentFrame.variables[name];
            if (variable.type !== null) {
                if (!this.testTypeEquality(variable.type, type)) {
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
    return (type !== null && type.type === "List") && (type.empty);
}
AbstractInterpreter.prototype.isTypeList = function(name) {
    var type = this.getType(name);
    return (type !== null && type.type === "List");
}
AbstractInterpreter.prototype.readVariable = function(name, loc) {
    var currentFrame = this.currentFrame;
    currentFrame.reads.push(name);
    while (currentFrame !== null) {
        if (name in currentFrame.variables) {
            currentFrame.variables[name].behavior.push({"mode": "read", "location": loc});
            return;
        }
        currentFrame = currentFrame.parentFrame;
    }
    this.report["Undefined variables"].push({'name': name, 'line': loc});
}
AbstractInterpreter.prototype.checkUnreadVariables = function(frame) {
    //TODO: Make it check EVERYWHERE before deciding to report unread
    for (var name in frame.variables) {
        if (!(name in this.BUILTINS)) {
            var is_read = false
            for (var i = 0, len = frame.variables[name].behavior.length;
                 i < len; i++) {
                is_read = is_read || frame.variables[name].behavior[i].mode == "read";
            }
            if (!is_read) {
                var typeInfo = this.getType(name);
                //console.log(frame.variables[name].behavior[0])
                this.report["Unread variables"].push({
                    'name': name, 
                    'type': typeInfo == null ? null : typeInfo.type,
                    'line': frame.variables[name].behavior[0].location
                });
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
            this.report["Unused iteration variable"].push(frame.singulars[i])
        }
    }
    for (var i = 0, len = frame.children.length; i < len; i++) {
        this.checkUnusedSingular(frame.children[i])
    }
}
AbstractInterpreter.prototype.checkUsedPlural = function(frame) {
    for (var i = 0, len = frame.plurals.length; i < len; i++) {
        if (this.walkFramesForUse(frame, frame.plurals[i], "both")) {
            this.report["Used iteration list"].push(frame.plurals[i])
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
                this.report["Iteration variable is iteration list"].push(frame.singulars[j]);
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
            var literals = true;
            for (var i = 0, len = value.keys.length; i < len; i++) {
                literals = literals && (key_type.type == "Str");
            }
            if (literals) {
                var components = {};
                for (var i = 0, len = value.keys.length; i < len; i++) {
                    var key_type = this.typecheck(value.keys[i]);
                    var value_type = this.typecheck(value.values[i]);
                    components[value.keys[i].id.v] = {"key": key_type, "value": value_type};
                }
                return {"type": "Dict", "literals": true, "components": components};
            } else {
                var key_type = {"type": "Unknown"}, value_type = {"type": "Unknown"};
                if (value.keys.length > 0) {
                    key_type = this.typecheck(value.keys[0]);
                    value_type = this.typecheck(value.values[0]);
                }
                return {"type": "Dict", "literals": false, "key": key_type, "value": value_type};
            }
        case "List":
            if (value.elts.length == 0) {
                return {"type": "List", "empty": true};
            } else {
                return {"type": "List", "empty": false, "component": this.typecheck(value.elts[0])};
            }
        case "Call":
            return this.walkAttributeChain(value.func);
        case "BinOp":
            var left = this.typecheck(value.left),
                right = this.typecheck(value.right);
            if (left === null || right === null) {
                return {"type": "Unknown"}
            } else if (left.type != right.type) {
                this.report["Incompatible types"].push(value.lineno);
            } else {
                return left;
            }
        default:
            return {"type": "Unknown"}
    }
}

AbstractInterpreter.prototype.walkAttributeChain = function(attribute) {
    if (attribute._astname == "Attribute") {
        var result = this.walkAttributeChain(attribute.value);
        if (result == null) {
            return null;
        } else if (attribute.attr.v in result) {
            return result[attribute.attr.v];
        } else {
            this.report["Unknown functions"].push(attribute.attr.v);
            return null;
        }
    } else if (attribute._astname == "Name") {
        if (attribute.id.v in AbstractInterpreter.MODULES) {
            return AbstractInterpreter.MODULES[attribute.id.v];
        } else {
            this.report["Unknown functions"].push(attribute.attr);
            return null;
        }
    }
}

AbstractInterpreter.prototype.visit_AugAssign = function(node) {
    var typeValue = this.typecheck(node.value);
    this.visit(node.value);
    this.visit(node.target);
    var walked = this.walk(node.target);
    for (var i = 0, len = walked.length; i < len; i++) {
        var targetChild = walked[i];
        if (targetChild._astname == "Tuple") {
            
        } else if (targetChild._astname == "Name") {
            this.setType(targetChild.id.v, typeValue, this.getLocation(node));
        }
    }
}
AbstractInterpreter.prototype.visit_Call = function(node) {
    this.generic_visit(node);
    if (node.func._astname == "Attribute") {
        if (node.func.attr.v == "append") {
            if (node.args.length >= 1) {
                var valueType = this.typecheck(node.args[0]);
                if (node.func.value._astname == "Name") {
                    var target = node.func.value.id.v;
                    this.setListType(target, valueType, this.getLocation(node));
                }
            }
        }
    }
}
AbstractInterpreter.prototype.visit_Assign = function(node) {
    var typeValue = this.typecheck(node.value);
    this.visit(node.value);
    this.visitList(node.targets);
    for (var i = 0, len = node.targets.length; i < len; i++) {
        var walked = this.walk(node.targets[i]);
        for (var j = 0, len = walked.length; j < len; j++) {
            var targetChild = walked[j];
            if (targetChild._astname == "Tuple") {
                
            } else if (targetChild._astname == "Name") {
                this.setType(targetChild.id.v, typeValue, this.getLocation(node));
            }
        }
    }
}
AbstractInterpreter.prototype.getLocation = function(node) {
    return node.lineno+"|"+node.col_offset;
}
AbstractInterpreter.prototype.visit_Import = function(node) {
    for (var i = 0, len = node.names.length; i < len; i++) {
        var module = node.names[i];
        var asname = module.asname === null ? module.name : module.asname;
        this.addVariable(asname.v, this.getLocation(node));
        this.setType(asname.v, {"type": "Module"}, this.getLocation(node));
    }
}
AbstractInterpreter.prototype.visit_ImportFrom = function(node) {
    for (var i = 0, len = node.names.length; i < len; i++) {
        var module = node.module === null ? node.names[i] : node.module + node.names[i];
        var asname = module.asname === null ? module.name : module.asname;
        this.addVariable(asname.v, this.getLocation(node));
        this.setType(asname.v, {"type": "Module"}, this.getLocation(node));
    }
}

AbstractInterpreter.prototype.visit_Name = function(node) {
    if (node.ctx.name == "Store") {
        this.addVariable(node.id.v, this.getLocation(node));
    } else if (node.ctx.name === "Load") {
        this.readVariable(node.id.v, this.getLocation(node));
    }
    this.generic_visit(node);
}

var ifStackId = 0;
AbstractInterpreter.prototype.visit_If = function(node) {
    //this.ifStack.push(ifStackId);
    var me = ifStackId;
    console.log(node.lineno, "Entered IF", me)
    ifStackId += 1;
    this.visit(node.test);
    for (var i = 0, len = node.body.length; i < len; i++) {
        this.visit(node.body[i]);
    }
    //var ifs = this.ifStack.pop();
    console.log(node.lineno, "Left IF", me, "Exploring the", node.orelse.length, "elsebodies")
    for (var i = 0, len = node.orelse.length; i < len; i++) {
        //this.ifStack.push(ifStackId);
        console.log(node.lineno, "Entered Else", me)
        //ifStackId += 1;
        this.visit(node.orelse[i]);
        //var ifs = this.ifStack.pop();
        console.log(node.lineno, "Left Else",  me)
    }
    this.inside_if = false;
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
            this.addPlural(child.id.v, this.getLocation(node));
        } else if (child._astname === "List" && child.elts.length === 0) {
            this.report["Empty iterations"].push(child.lineno);
        } else {
            //console.log(child);
        }
    }
    walked = this.walk(node.target);
    for (var i = 0, len = walked.length; i < len; i++) {
        var child = walked[i];
        if (child._astname === "Name" && child.ctx.name === "Store") {
            this.addSingular(child.id.v, this.getLocation(node));
        }
    }
    this.visit(node.target);
    var iterType = this.typecheck(node.iter);
    if (iterType !== null && iterType.type == "List" && !iterType.empty) {
        this.setType(node.target.id.v, iterType.component, this.getLocation(node));
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
//var python_source = 'sum([1,2])/len([4,5,])\ntotal=0\ntotal=total+1\nimport weather\nimport matplotlib.pyplot as plt\ncelsius_temperatures = []\nexisting=weather.get_forecasts("Miami, FL")\nfor t in existing:\n    celsius = (t - 32) / 2\n    celsius_temperatures.append(celsius)\nplt.plot(celsius_temperatures)\nplt.title("Temperatures in Miami")\nplt.show()';
var python_source = 'if 5:\n    a = 0\n    b = 0\n    c = 0\nelif "yes":\n    a = 3\n    b = 3\nelse:\n    a = 5\n    if True:\n        b = 7\n    else:\n        b = 3\nprint(a)\nprint(b)';
var analyzer = new AbstractInterpreter(python_source);
analyzer.analyze()
console.log(python_source);
console.log("AST:", analyzer.ast);
console.log("Frames:", analyzer.rootFrame);
console.log("Report:",analyzer.report);