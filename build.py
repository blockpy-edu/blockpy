with open('src/interface.html', 'r') as input, open('src/interface.js', 'w') as output:
    contents = input.read()
    cleaned_contents = contents.replace('"', '\\"').replace('\n', '')
    js_contents = '''
/**
 * An automatically generated file, based on interface.html.
 * An interesting problem in web development is managing HTML
 * code in JS files. Rather than embedding string literals and
 * concatenating them, or some other hackish soluion,
 * we simply convert an HTML file to a JS string. Therefore,
 * relevant edits should be in interface.html instead.
 *
 * The BlockPyInterface global can be seen as a constant
 * representation of the default interface.
 */
BlockPyInterface = "{interface_code}";
'''.format(interface_code=cleaned_contents)
    output.write(js_contents)