/**
 * Python Type Inferencer and Flow Analyzer
 * TIFA
 *
 * Depends on Skulpt
 * 
 * TIFA uses a number of simplifications of the Python language.
 *  * Variables cannot change type
 *  * Variables cannot be deleted
 *  * Complex types have to be homogenous
 *  * No introspection or reflective characteristics
 *  * No dunder methods
 *  * No closures (maybe?)
 *  * No global variables
 *  * No multiple inheritance
 *
 * Additionally, it reads the following as issues:
 *  * Cannot read a variable without having first written to it.
 *  * Cannot rewrite a variable unless it has been read.
 *
 * @constructor
 * @this {Tifa}
 */
function Tifa() {
    NodeVisitor.apply(this, Array.prototype.slice.call(arguments));
}
Tifa.prototype = new NodeVisitor();

/**
 * Processes the AST of the given source code to generate a report.
 *
 * @param {string} code - The Python source code
 * @param {string} filename - Optional, the filename (defaults to __main__)
 */
Tifa.prototype.processCode = function(code, filename) {
    // Code
    this.source = code !== "" ? code.split("\n") : [];
    filename = filename || '__main__';
    
    // Attempt parsing - might fail!
    try {
        var parse = Sk.parse(filename, code);
        var ast = Sk.astFromParse(parse.cst, filename, parse.flags);
        this.processAst(ast);
    } catch (error) {
        this.report = {"error": error, "message": "Parsing error"};
        return;
    }
}

/**
 * Given an AST, actually performs the type and flow analyses to return a
 *  report.
 *
 * @constructor
 * @this {BlockPyEditor}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
Tifa.prototype.processAst = function(ast) {
    // Handle loops
    this.loopStackId = 0
    this.loopHierarchy = {};
    this.loopStack = [];
    
    // Handle decisions
    this.branchStackId = 0;
    
    this.branchTree = { null: [] };
    this.currentBranch = this.branchTree[null];
    this.currentBranchName = null;
    
    // Handle walking AST
    this.astStackDepth = 0;
    
    this.variables = {};
    this.variableTypes = {};
    this.variablesNonBuiltin = {};
    for (var name in this.BUILTINS) {
        this.setVariable(name, this.BUILTINS[name], true);
    }
    
    this.currentScope = null;
    this.scopeContexts = {};
    
    // OLD
    //this.frameIndex = 0;
    //this.rootFrame = this.newFrame(null);
    //this.currentFrame = this.rootFrame;
    this.report = this.newReport();
    
    this.visit(this.ast);
    
    //console.log(this.variables)
    this.postProcess();
}

/**
 * Reports
 * 
 * Unconnected blocks: Any names with ____
 * Empty Body: Any use of pass on its own
 * Unnecessary Pass: Any use of pass
 * Unread variables: A variable was not read after it was defined
 * Undefined variables: A variable was read before it was defined
 * Possibly undefined variables: A variable was read but was not defined in every branch
 * Overwritten variables: A written variable was written to again before being read
 * Append to non-list: Attempted to use the append method on a non-list
 * Used iteration list:
 * Unused iteration variable:
 * Non-list iterations:
 * Empty iterations:
 * Type changes:
 * Iteration variable is iteration list:
 * Unknown functions:
 * Incompatible types:
 * Return outside function:
 * Read out of scope:
 * Aliased built-in
 */
 
/*
https://github.com/python/typeshed/blob/master/stdlib/3/builtins.pyi
List
    append
    index
    

*/

/*
Important concepts:

    State: a mapping of Names and a set of Types

    Name
        The actual ID
        The scope ID
    
    Types
        Num
        Str
        List
        Tuple
        Set
        Dict
        Bool
        None
    
    Assign
    AugAssign
    Import
    With
    
    Attribute lookup
    
    Scope:
        ID
    CallStack:

    Functions
    Lambdas
    
    Return/yield
    
    Ifs/While : Branch
    
    For loops
    
    Classes
    Try/except
    Break/continue

*/