export const TRACE_HTML = `

<div class="blockpy-trace col-md-6 blockpy-panel"
            role="region" aria-label="Trace">
    
    <div class="clearfix">
        <strong>Trace: </strong>
        
        <!-- Feedback/Trace Visibility Control -->
        <button type='button'
                class='btn btn-sm btn-outline-secondary float-right blockpy-hide-trace'
                data-bind="click: ui.secondRow.advanceState">
            <span class='fas fa-eye'></span> Hide Trace
        </button>
    </div>

    <div class="input-group mb-3 blockpy-trace-controls">
        <div class="input-group-prepend">
            <button type='button' class='btn btn-outline-secondary'
                data-bind="click: ui.trace.first">
                <span class='fas fa-step-backward'></span>
            </button>
            <button type='button' class='btn btn-outline-secondary'
                data-bind="click: ui.trace.backward">
                <span class='fas fa-backward'></span>
            </button>
            <span class="input-group-text">Step:</span>
            <span class="input-group-text">
                <span data-bind='text: execution.student.currentTraceStep'></span>
                / <span data-bind='text: execution.student.lastStep'></span>
            </span>
        </div>
        <div class="input-group-append">
            <button type='button' class='btn btn-outline-secondary'
                data-bind="click: ui.trace.forward">
                <span class='fas fa-forward'></span>
            </button>
            <button type='button' class='btn btn-outline-secondary'
                data-bind="click: ui.trace.last">
                <span class='fas fa-step-forward'></span>
            </button>
            <span class="input-group-text">
                <span data-bind='text: ui.trace.line'></span>
            </span>
        </div>
    </div>
    <p data-bind="text: ui.trace.ast"></p>
    <p>Variables after this step:</p>
    <table class='table table-sm table-striped table-bordered table-hover'>
        <thead>
            <tr><th>Name</th><th>Type</th><th>Value</th></tr>
        </thead>
        <tbody data-bind="foreach: ui.trace.data().properties">
            <tr data-bind="visible: name != '__file__' && name != '__path__'">
                <td data-bind="text: name"></td>
                <td data-bind="text: type"></td>
                <td>
                    <code data-bind="text: value"></code>
                    <!-- ko if: type == "List" || type == "Dictionary" || type == "Tuple" -->
                    
                    <a href="" data-bind="click: function() { $root.viewExactValue(name, type, exact_value); }">
                    <span class='fas fa-external-link-alt' title='Explore in new window'></span>
                    </a>
                    <!-- /ko -->
                </td>
            </tr>
        </tbody>
    </table>
    
</div>
`;

export const AST_DESCRIPTIONS = {
    "Add": "An addition operator",
    "And": "A boolean AND operator",
    "AnnAssign": "An annotated assignment",
    "Assert": "An assert statement",
    "Assign": "An assignment statement",
    "AsyncFor": "An asychronous for loop",
    "AsyncFunctionDef": "An asychronous function definition",
    "AsyncWith": "An asychronous with statement",
    "Attribute": "An attribute lookup (access a field)",
    "AugAssign": "An augmented assignment",
    "AugLoad": "An augmented load",
    "AugStore": "An augmented store",
    "Await": "An await statement",
    "BinOp": "A binary operator",
    "BitAnd": "A bitwise AND operator",
    "BitOr": "A bitwise OR operator",
    "BitXor": "A bitwise XOR operator",
    "BoolOp": "A boolean operator",
    "Break": "A break statement",
    "Bytes": "A literal bytes string",
    "Call": "A function call",
    "ClassDef": "A class definition",
    "Compare": "A boolean comparison",
    "Constant": "A literal value",
    "Continue": "A continue statement",
    "Del": "A delete statement",
    "Delete": "A deletion",
    "Dict": "A dictionary literal",
    "DictComp": "A dictionary comprehension",
    "Div": "A division operator",
    "Ellipsis": "An ellipsis",
    "Eq": "An equality comparison operator",
    "ExceptHandler": "An except handler",
    "Expr": "An expression used as a statement",
    "Expression": "An evaluated expression",
    "ExtSlice": "A multi-dimensional slice",
    "FloorDiv": "An integer division operator",
    "For": "A FOR loop",
    "FormattedValue": "A formatted value in an f-string",
    "FunctionDef": "A function definition",
    "GeneratorExp": "A generator expression",
    "Global": "A global statement",
    "Gt": "A greater than comparison operator",
    "GtE": "A greater than or equal to comparison operator",
    "If": "An IF statement",
    "IfExp": "An IF expression",
    "Import": "An import statement",
    "ImportFrom": "An import/from statement",
    "In": "An IN operator",
    "Index": "An index",
    "Interactive": "An interactive expression",
    "Invert": "An invert operator",
    "Is": "An IS operator",
    "IsNot": "An IS NOT operator",
    "JoinedStr": "An f-string",
    "LShift": "A left shift operator",
    "Lambda": "A lambda expression",
    "List": "A list literal",
    "ListComp": "A list comprehension",
    "Load": "A load",
    "Lt": "A less than comparison operator",
    "LtE": "A less than or equal to comparison operator",
    "MatMult": "A matrix multiplication operator",
    "Mod": "A modulo operator",
    "Module": "A module",
    "Mult": "A multiplication operator",
    "Name": "A name",
    "NameConstant": "A name constant",
    "Nonlocal": "A nonlocal statement",
    "Not": "A not operator",
    "NotEq": "A not equal to comparison operator",
    "NotIn": "A NOT IN operator",
    "Num": "A numeric literal",
    "Or": "A boolean OR operator",
    "Param": "A parameter",
    "Pass": "A pass statement",
    "Pow": "A power operator",
    "RShift": "A right shift operator",
    "Raise": "A raise statement",
    "Return": "A return statement",
    "Set": "A set literal",
    "SetComp": "A set comprehension",
    "Slice": "A slice",
    "Starred": "A starred argument",
    "Store": "A store",
    "Str": "A string literal",
    "Sub": "A subtraction operator",
    "Subscript": "A subscript",
    "Suite": "A suite",
    "Try": "A try statement",
    "Tuple": "A tuple literal",
    "TypeIgnore": " a type ignore",
    "UAdd": "A unary addition operator",
    "USub": "A unary subtraction operator",
    "UnaryOp": "A unary operator",
    "While": "A while loop",
    "With": "A with statement",
    "Yield": "A yield statement",
    "YieldFrom": "A yield/from statement"
};

export class BlockPyTrace {

    constructor(main, tag) {
        this.main = main;
        this.tag = tag;

        this.IGNORED_GLOBALS = ["__name__", "__doc__", "__package__",
                                "classmethod", "property", "staticmethod", "$free", "$cell"];

        // this.trace.click(this.buildTraceTable.bind(this));
    }

    /**
     * Consume a set of variables traced from the execution and parse out any
     * global variables and modules.
     *
     * @param {Object} variables - a mapping of variable names to their Skupt value.
     */
    parseGlobals(variables) {
        let result = [];
        let modules = [];
        //console.log(variables);
        if (!this.main.model.display.traceExecution()) {
            /*if ("$cell" in variables) {
                variables = {...variables, ...variables.$cell};
            }*/
            /*if ("$free" in variables) {
                variables = {...variables, ...variables.$free};
            }*/
            for (let property in variables) {
                let value = variables[property];
                if (this.IGNORED_GLOBALS.indexOf(property) === -1 && value !== undefined) {
                    property = property.replace("_$rw$", "")
                        .replace("_$rn$", "");
                    let parsed;
                    try {
                        parsed = BlockPyTrace.parseValue(property, value);
                    } catch {
                        parsed = {"name": property, "type": "Unknown", "value": value.toString()};
                    }
                    if (parsed !== null) {
                        result.push(parsed);
                    } else if (value.constructor === Sk.builtin.module) {
                        modules.push(value.$d.__name__.v);
                    }
                }
            }
        }
        return {"properties": result, "modules": modules};
    };

    /**
     * Convert a Skulpt value into a more easily printable object.
     *
     * @param {String} property
     * @param {Object} value - the skulpt value
     */
    static parseValue(property, value, fullLength) {
        if (value === undefined) {
            return {"name": property,
                "type": "Unknown",
                "value": "Undefined"
            };
        }
        switch (property) {
            case "dataclass":
                return {
                    name: property,
                    type: "Decorator",
                    value: "<dataclass decorator>"
                };
        }
        switch (value.constructor) {
            case Sk.builtin.func:
                return {"name": property,
                    "type": "Function",
                    "value":
                        (value.func_code.co_varnames !== undefined ?
                            " Parameters: "+value.func_code.co_varnames.join(", ") :
                            " No parameters")
                };
            case Sk.builtin.module: return null;
            case Sk.builtin.str:
                if (fullLength || value.v.length <= 32) {
                    return {"name": property,
                        "type": "String",
                        "value": value.$r().v
                    };
                } else {
                    return {"name": property,
                        "type": "String",
                        "value": "["+value.sq$length()+" characters not shown]"
                    };
                }
            case Sk.builtin.none:
                return {"name": property,
                    "type": "None",
                    "value": "None"
                };
            case Sk.builtin.bool:
                return {"name": property,
                    "type": "Boolean",
                    "value": value.$r().v
                };
            case Sk.builtin.nmber:
                return {"name": property,
                    "type": "int" === value.skType ? "Integer": "Float",
                    "value": value.$r().v
                };
            case Sk.builtin.int_:
                return {"name": property,
                    "type": "Integer",
                    "value": value.$r().v
                };
            case Sk.builtin.float_:
                return {"name": property,
                    "type": "Float",
                    "value": value.$r().v
                };
            case Sk.builtin.tuple:
                return {"name": property,
                    "type": "Tuple",
                    "value": value.$r().v,
                    "exact_value": value
                };
            case Sk.builtin.list:
                if (value.v.length <= 20) {
                    return {"name": property,
                        "type": "List",
                        "value": value.$r().v,
                        "exact_value": value
                    };
                } else {
                    return {"name": property,
                        "type": "List",
                        "value": "[... "+value.v.length+" elements ...]",
                        "exact_value": value
                    };
                }
            case Sk.builtin.dict:
                return {"name": property,
                    "type": "Dictionary",
                    "value": value.$r().v,
                    "exact_value": value
                };
            case Number:
                return {"name": property,
                    "type": value % 1 === 0 ? "Integer" : "Float",
                    "value": value
                };
            case String:
                return {"name": property,
                    "type": "String",
                    "value": value
                };
            case Boolean:
                return {"name": property,
                    "type": "Boolean",
                    "value": (value ? "True": "False")
                };
            default:
                return {"name": property,
                    "type": value.tp$name === undefined ? value : value.tp$name,
                    "value": value.$r === undefined ? value : value.$r().v
                };
        }
    };


}

// TODO: viewExactValue