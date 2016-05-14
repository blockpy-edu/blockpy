import ast

from module_white_list import MODULE_WHITE_LIST

'''
for loop
dictionary access
assignment statement (particularly creating an empty list)
corgis import
corgis access
'''

class Finder(ast.NodeVisitor):
    def __init__(self):
        self.results = {}
        self.corgis_module = None
        self.inside_assignment = False
        self.inside_left_assignment = False
        
    def generic_visit(self, node):
        ast.NodeVisitor.generic_visit(self, node)
    
    def visit_Subscript(self, node):
        if isinstance(node.slice, ast.Index):
            if isinstance(node.slice.value, ast.Str):
                if 'DICTIONARY_ACCESS' not in self.results:
                    self.results['DICTIONARY_ACCESS'] = (node.lineno, node.col_offset)
        ast.NodeVisitor.generic_visit(self, node)
        
    def visit_Name(self, node):
        if node.id is self.corgis_module and 'CORGIS_USE' not in self.results:
            self.results['CORGIS_USE'] = (node.lineno, node.col_offset)
        if node.id == 'append' and 'LIST_APPEND' not in self.results:
            self.results['LIST_APPEND'] = (node.lineno, node.col_offset)
        if node.id == 'print' and 'PRINT_USE' not in self.results:
            self.results['PRINT_USE'] = (node.lineno, node.col_offset)
            
    def visit_Attribute(self, node):
        if node.attr == 'append' and 'LIST_APPEND' not in self.results:
            self.results['LIST_APPEND'] = (node.lineno, node.col_offset)
        if node.attr in ('scatter', 'bar', 'barh', 'plot') and 'MATPLOTLIB_PLOT' not in self.results:
            self.results['MATPLOTLIB_PLOT'] = (node.lineno, node.col_offset)
        ast.NodeVisitor.generic_visit(self, node)
            
    def visit_List(self, node):
        if self.inside_assignment and 'LIST_ASSIGNMENT' not in self.results:
            self.results['LIST_ASSIGNMENT'] = (node.lineno, node.col_offset)
    def visit_Dict(self, node):
        if self.inside_assignment and 'DICT_ASSIGNMENT' not in self.results:
            self.results['DICT_ASSIGNMENT'] = (node.lineno, node.col_offset)
        
    def visit_Assign(self, node):
        if 'ASSIGNMENT' not in self.results:
            self.results['ASSIGNMENT'] = (node.lineno, node.col_offset)
        self.inside_assignment = True
        ast.NodeVisitor.generic_visit(self, node)
        self.inside_assignment = False
    
    def visit_If(self, node):
        if 'IF_STATEMENT' not in self.results:
            self.results['IF_STATEMENT'] = (node.lineno, node.col_offset)
        ast.NodeVisitor.generic_visit(self, node)
    
    def visit_For(self, node):
        if 'FOR_LOOP' not in self.results:
            self.results['FOR_LOOP'] = (node.lineno, node.col_offset)
        ast.NodeVisitor.generic_visit(self, node)
        
    def visit_Import(self, node):
        modules = [alias.name.split('.')[-1] for alias in node.names]
        for module in modules:
            if module.startswith('matplotlib') and 'IMPORT_MATPLOTLIB' not in self.results:
                self.results['IMPORT_MATPLOTLIB'] = (node.lineno, node.col_offset)
            elif module in MODULE_WHITE_LIST and 'IMPORT_CORGIS' not in self.results:
                self.results['IMPORT_CORGIS'] = (node.lineno, node.col_offset)
                self.corgis_module = module
    def visit_ImportFrom(self, node):
        module = node.module
        if module.startswith('matplotlib') and 'IMPORT_MATPLOTLIB' not in self.results:
            self.results['IMPORT_MATPLOTLIB'] = (node.lineno, node.col_offset)
        elif module in MODULE_WHITE_LIST and 'IMPORT_CORGIS' not in self.results:
            self.results['IMPORT_CORGIS'] = (node.lineno, node.col_offset)
            self.corgis_module = module

def find_elements(code):
    root = ast.parse(code)
    finder = Finder()
    finder.visit(root)
    return finder.results
    
if __name__ == '__main__':
    import sys
    from pprint import pprint
    with open(sys.argv[1]) as student_file:
        pprint(find_elements(student_file.read()))