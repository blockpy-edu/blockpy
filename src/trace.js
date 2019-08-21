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
    
    <table class='table table-sm table-striped table-bordered table-hover'>
        <caption>Current variables at this step</caption>
        <thead>
            <tr><th>Name</th><th>Type</th><th>Value</th></tr>
        </thead>
        <tbody data-bind="foreach: ui.trace.data().properties">
            <tr data-bind="visible: name != '__file__' && name != '__path__'">
                <td data-bind="text: name"></td>
                <td data-bind="text: type"></td>
                <td>
                    <code data-bind="text: value"></code>
                    <!-- ko if: type == "List" -->
                    
                    <a href="" data-bind="click: //$root.viewExactValue(type, exact_value)">
                    <span class='glyphicon glyphicon-new-window'></span>
                    </a>
                    <!-- /ko -->
                </td>
            </tr>
        </tbody>
    </table>
    
</div>
`;

export class BlockPyTrace {

    constructor(main, tag) {
        this.main = main;
        this.tag = tag;

        this.IGNORED_GLOBALS = ["__name__", "__doc__", "__package__",
                                "classmethod", "property", "staticmethod"];

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
        if (!this.main.model.display.traceExecution()) {
            for (let property in variables) {
                let value = variables[property];
                if (this.IGNORED_GLOBALS.indexOf(property) === -1) {
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
        switch (value.constructor) {
            case Sk.builtin.func:
                return {"name": property,
                    "type": "Function",
                    "value":
                        (value.func_code.co_varnames !== undefined ?
                            " Arguments: "+value.func_code.co_varnames.join(", ") :
                            " No arguments")
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
                    "value": value.$r().v
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
                    "value": value.$r().v
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