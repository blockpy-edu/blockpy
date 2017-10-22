from instructor import *

def ensure_imports(*modules):
    ast = parse_program()
    for module in modules:
        imports= ast.find_all("Import")
        import_froms = ast.find_all("ImportFrom")
        if not imports and not import_froms:
            gently("You need to import the <code>{}</code> module!".format(module))
            return True
        success = False
        if imports:
            if any(alias._name == module
                       for i in imports
                       for alias in i.names):
                success = True
        if import_froms:
            if any(i.module == module for i in import_froms):
                success = True
        if not success:
            gently("You need to import the <code>{}</code> module.".format(module))
            return True
    return False