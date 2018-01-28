import os
import re

with open('src/interface.html', 'r') as inp:
    with open('src/interface.js', 'w') as output:
        contents = inp.read()
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
    
INSTRUCTOR_ROOT = 'src/instructor/'
with open('src/sk_mod_instructor_extended.js', 'w') as output:
    output.write("""
/**
 * An automatically generated file, based on the files in `instructors/`.
 * We need to have the python code in these files made available in the 
 * JS files, so we load them in via a preprocessing step.
 */

var $INSTRUCTOR_MODULES_EXTENDED = {};

""")
    for instructor_file_name in os.listdir(INSTRUCTOR_ROOT):
        with open(INSTRUCTOR_ROOT+instructor_file_name, 'r') as input:
            print(instructor_file_name)
            contents = input.read()
            contents = contents.replace('\\','\\\\').replace('"', '\\"').replace('\n', '\\n')
            output.write('$INSTRUCTOR_MODULES_EXTENDED["{module}"] = "{code}"\n'.format(
                module = instructor_file_name,
                code = contents
            ))
