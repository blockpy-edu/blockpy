with open('src/interface.html', 'r') as input, open('src/interface.js', 'w') as output:
    contents = input.read()
    cleaned_contents = contents.replace('"', '\\"').replace('\n', '')
    js_contents = '''
BlockPyInterface = "{interface_code}";
'''.format(interface_code=cleaned_contents)
    output.write(js_contents)
    
with open('src/parking.js', 'r') as input, open('src/imported_skulpt.js', 'w') as output:
    contents = input.read()
    cleaned_contents = contents.replace('"', '\\"').replace('\n', '')
    js_contents = '''
Sk.builtinFiles['files']['src/lib/dates.js'] = "{interface_code}";
'''.format(interface_code=cleaned_contents)
    output.write(js_contents)