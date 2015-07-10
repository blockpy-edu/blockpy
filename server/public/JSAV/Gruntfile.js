// Grunt build file for JSAV
module.exports = function(grunt) {
  "use strict";

  var BUILD_DIR = 'build/',
      SRC_DIR = 'src/';

  // autoload all grunt tasks in package.json
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    gitinfo: { // get the JSAV version info from git tag and number
      commands: { // expose it as gitinfo.version
        version: ['describe', '--tags', '--long']
      }
    },
    concat: {  // concat the JSAV javascript file
      //options: { // use the header and footer specified above
      //  banner: JS_BANNER,
      //  footer: JS_FOOTER
      //},
      build: { // the order matters, so list every file manually
        src: [SRC_DIR + 'front.js',
              SRC_DIR + 'core.js',
              SRC_DIR + 'translations.js',
              SRC_DIR + 'anim.js',
              SRC_DIR + 'utils.js',
              SRC_DIR + 'messages.js',
              SRC_DIR + 'effects.js',
              SRC_DIR + 'events.js',
              SRC_DIR + 'graphicals.js',
              SRC_DIR + 'datastructures.js',
              SRC_DIR + 'array.js',
              SRC_DIR + 'tree.js',
              SRC_DIR + 'list.js',
              SRC_DIR + 'graph.js',
              SRC_DIR + 'matrix.js',
              SRC_DIR + 'code.js',
              SRC_DIR + 'settings.js',
              SRC_DIR + 'questions.js',
              SRC_DIR + 'exercise.js',
              SRC_DIR + 'version.js'],
        dest: BUILD_DIR + 'JSAV.js'
      }
    },
    uglify: { // for building the minified version
      build: {
        options: {
          preserveComments: 'some',
          mangle: false
        },
        files: {
          'build/JSAV-min.js': [BUILD_DIR + 'JSAV.js']
        }
      }
    },
    qunit: {
      files: ['test/index.html']
    },
    jshint: { // for linting the JS
      sources: ['Gruntfile.js', 'src/*.js'],
      tests: ['test/**/*.js']
    },
    csslint: { // for linting the CSS
      jsav: {
        src: ['css/JSAV.css']
      }
    },
    exec: {
      version: "git describe --tags --long | awk '{ printf \"%s\", $0 }' > " + SRC_DIR + "version.txt",
      front: "cat src/front1.txt src/version.txt src/front2.txt > src/front.js",
      versionjs: "cat src/version1.txt src/version.txt src/version2.txt > src/version.js"
    },
    watch: {
      jssrc: {
        files: ['src/*.js'],
        tasks: ['default']
      }
    }
  });

  grunt.registerTask('build', ['exec', 'concat', 'uglify']);
  grunt.registerTask('lint', ['jshint', 'csslint']);
  grunt.registerTask('test', ['qunit']);
  grunt.registerTask('default', ['build']);
};