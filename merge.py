
js_in = ["src/python_errors.js",
         "src/ast_node_visitor.js",
         "src/abstract_interpreter.js",
         "src/python_to_blockly.js",
         "src/imported.js",
         "src/custom_blocks.js",
         "src/util.js",
         "src/dialog.js",
         "src/storage.js",
         "src/printer.js",
         "src/interface.js",
         "src/server.js",
         "src/presentation.js",
         "src/property_explorer.js",
         "src/editor.js",
         'src/corgis.js',
         'src/history.js',
         'src/english.js',
         "src/feedback.js",
         "src/toolbar.js",
         "src/engine.js",
         "src/main.js"]
css_in = ['src/blockpy.css']

#js_out = 'kennel_dist/blockpy.js'
#css_out = 'kennel_dist/blockpy.css'
js_out = r'dist/blockpy.js'
css_out = r'dist/blockpy.css'

for files_in, file_out in [ (js_in, js_out), (css_in, css_out) ]:
    with open(file_out, 'w') as outfile:
        for fname in files_in:
            with open(fname) as infile:
                for line in infile:
                    outfile.write(line)
                outfile.write("\n")