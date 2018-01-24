nodejs_in = [
         "src/front.js",
         "src/utilities.js",
         "src/python_errors.js",
         "src/ast_node_visitor.js",
         "src/abstract_interpreter.js",
         "src/pytifa.js",
         "src/abstract_interpreter_definitions.js",
         "src/treeMatching.js",
         "src/sk_mod_instructor_extended.js",
         "src/sk_mod_instructor.js",
         "src/feedback.js",
         "src/printer.js",
         "src/engine.js",
            ]

js_in = ["src/front.js",
         "src/utilities.js",
         "src/python_errors.js",
         "src/ast_node_visitor.js",
         "src/abstract_interpreter.js",
         "src/pytifa.js",
         "src/abstract_interpreter_definitions.js",
         "src/python_to_blockly.js",
         "src/treeMatching.js",
         "src/sk_mod_instructor_extended.js",
         "src/sk_mod_instructor.js",
         "src/imported.js",
         "src/blockly_blocks/class.js",
         "src/blockly_blocks/comment.js",
         "src/blockly_blocks/comprehensions.js",
         "src/blockly_blocks/dict.js",
         "src/blockly_blocks/if.js",
         "src/blockly_blocks/io.js",
         "src/blockly_blocks/lists.js",
         "src/blockly_blocks/sets.js",
         "src/blockly_blocks/loops.js",
         "src/blockly_blocks/parking.js",
         "src/blockly_blocks/tuple.js",
         "src/blockly_blocks/turtles.js",
         "src/blockly_blocks/text.js",
         "src/blockly_blocks/plots.js",
         "src/dialog.js",
         "src/storage.js",
         "src/printer.js",
         "src/interface.js",
         "src/server.js",
         "src/presentation.js",
         "src/editor.js",
         "src/corgis.js",
         "src/history.js",
         "src/english.js",
         "src/feedback.js",
         "src/toolbar.js",
         "src/engine.js",
         "src/main.js"]
css_in = ['src/blockpy.css']

#js_out = 'kennel_dist/blockpy.js'
#css_out = 'kennel_dist/blockpy.css'
js_out = r'dist/blockpy.js'
nodejs_out = r'dist/blockpy_node.js'
css_out = r'dist/blockpy.css'

for files_in, file_out in [ (js_in, js_out), (css_in, css_out), (nodejs_in, nodejs_out) ]:
    with open(file_out, 'w') as outfile:
        for fname in files_in:
            with open(fname) as infile:
                for line in infile:
                    outfile.write(line)
                outfile.write("\n")