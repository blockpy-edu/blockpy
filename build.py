with open('src/interface.html', 'r') as input, open('src/interface.js', 'w') as output:
    contents = input.read()
    cleaned_contents = contents.replace('"', '\\"').replace('\n', '')
    js_contents = '''
BlockPyInterface = "{interface_code}";
'''.format(interface_code=cleaned_contents)
    output.write(js_contents)