from flask.ext.assets import Bundle, Environment
from main import app

bundles = {

    'blockpy_js': Bundle(
        'libs/jquery.hotkeys.js',
        'libs/d3.min.js',
        'libs/math.0.19.0.min.js',
        'libs/bootstrap-wysiwyg.js',
        "libs/mindmup-editabletable.js",
        "libs/codemirror/codemirror.js",
        "libs/codemirror/python.js",
        "libs/codemirror/htmlmixed.js",
        "libs/codemirror/xml.js",
        "libs/summernote/summernote.min.js",
        "libs/summernote/summernote-ext-hint.js",
        "libs/summernote/summernote-ext-video.js",
        "libs/crime_data.js",
        "blockly/blockly_compressed.js",
        "blockly/blocks_compressed.js",
        "blockly/python_compressed.js",
        "blockly/pseudo_compressed.js",
        "blockly/javascript_compressed.js",
        "blockly/msg/js/en.js",
        "skulpt/dist/skulpt.min.js",
        "skulpt/dist/skulpt-stdlib.js",
        "analyzer/analyzer.js",
        "analyzer/python_errors.js",
        "converter/python_to_blockly.js",
        "kennel/kennel.js",
        "converter/renderBlocklyToPng.js",
        output='gen/blockpy.js'),

    'blockpy_css': Bundle(
        'libs/codemirror/codemirror.css',
        'libs/font-awesome.min.css',
        'libs/summernote/summernote.css',
        'kennel/kennel.css',
        output='gen/blockpy.css'),
        
    'blockly_maze_css': Bundle(
        'blockly-games/appengine/common/common.css',
        'blockly-games/appengine/maze/style.css',
        output='gen/blockly_maze.css'),
    'blockly_maze_js': Bundle(
        'blockly-games/appengine/common/boot.js',
        'blockly-games/appengine/common/storage.js',
        output='gen/blockly_maze.js'),
}

assets = Environment(app)

assets.register(bundles)