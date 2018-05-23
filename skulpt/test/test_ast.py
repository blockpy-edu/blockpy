import ast

print(dir(ast))

addition = ast.parse("1 + 2")

assert isinstance(addition, ast.Module), "Unable to parse addition"
assert hasattr(addition, 'body'), "Module has no body"
print(addition)
print(addition._fields)
print(addition.body)
assert addition.body[0].value.left.n == 1, "Parsed Addition wasn't correct"
print("lineno", addition.body[0].lineno)
assert addition.body[0].lineno == 1, "Addition's lineno was not 1"
assert addition.body[0].col_offset == 0, "Addition's col_offset was not 0"
assert addition.body[0].col_endoffset == 1, "Addition's col_endoffset was not 1"
assert addition.body[0].endlineno == 1, "Addition's endlineno was not 1"

print("1 + 2")
#print(ast.dump(addition)

FOR_CODE = "for x in y:\n    a = 0"
for_loop = ast.parse(FOR_CODE)
print("*"*20)
print(FOR_CODE)
print("FOR", for_loop, "should be Module")
print("FOR", for_loop.body[0], "should be For")
print("FOR", for_loop.body[0].body[0], "should be Assign")
#print("FOR", for_loop.body[0].body[0].id, "should not be a")
print(ast.dump(for_loop))


multiline = ast.parse("""for x in y:
   a + 1 - 3
if x:
   try:
       a = 7
   except:
       False
def T():
    while Banana():
        return 7
class X(basic):
    def define(apple, banana):
        this.__init__(7, 3, 4)
'''HEY''' or (1 and 2)
assert EXPLODE()
one += one
one -= one
one | one
a[0] += 100
5 < 3
not True
del apple["Hearted"]
import garbage
8 is 7
""")

#print("iter_fields:", ast.iter_fields(multiline.body[0]))

#print("iter_child_nodes:", ast.iter_child_nodes(multiline))

print(ast.dump(multiline, True, False))

print("All tests complete.")