
js_in = ['analyzer/analyzer.js', 'analyzer/python_errors.js', 'converter/reverse_ast.js', 'converter/python_to_blockly.js', 'kennel/kennel.js']
css_in = ['libs/font-awesome.min.css', 'kennel/kennel.css']

#js_out = 'kennel_dist/blockpy.js'
#css_out = 'kennel_dist/blockpy.css'
js_out = r'C:\Users\acbart\Projects\runestone\directives\blockly\js\blockpy.js'
css_out = r'C:\Users\acbart\Projects\runestone\directives\blockly\js\blockpy.css'

for files_in, file_out in [ (js_in, js_out), (css_in, css_out) ]:
    with open(file_out, 'w') as outfile:
        for fname in files_in:
            with open(fname) as infile:
                for line in infile:
                    outfile.write(line)
                outfile.write("\n")