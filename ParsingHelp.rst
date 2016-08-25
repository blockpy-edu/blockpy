Sk.compile(source)
    calls Sk.parse(source) which returns a CST
    then Sk.astFromParse(cst) which returns an AST
    then Sk.symboltable(ast) which returns the SymbolTable
    then Compiler(source, st) which returns a list of compiled code lines
    
Sk.parse(source)
    
