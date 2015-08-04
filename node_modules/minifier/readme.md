minifier
========

A simple tool for minifying CSS/JS without a big setup.

Feature highlights
------------------

- It minifies JS and CSS
- It reworks URLs in CSS from the original location to the output location.
- It automatically resolves `@import` statements in CSS.


How to install
--------------

There are two ways to install it:

1. `npm install [-g] minifier`
2. Cloning directly from [github](https://github.com/fizker/minifier).

Installing through `npm` will create a binary (`minify`) in the usual
locations. Cloning and installing from `github` will not, but the `index.js`
file can be executed either directly or via `node index.js`; this is the file
that the binary links to anyway.


How to run from a command-line
------------------------------

Running it is simple:

	minify [--output path/to/put/file] path/to/file

If the output parameter is not set, it will place a file next to the original,
with the suffix `.min`.

For example, `minifier script.js` will output `script.min.js`, whereas
`minifier --output out.js script.js` will output `out.js`.

A folder can also be targeted. When that is done, it will minify all css and js
file in that folder.

In that case, `--output` does not make much sense, as all files will be minified
to the same. If the name still requires a specific pattern such as a timestamp,
`--template` is the option for you. Note that files named after a template will
be left in the same folder as the original file.

There are various options available:

- `{{filename}}` is the original filename.
- `{{ext}}` is the extension.
- `{{sha}}` is a sha-digest of the unminified file contents.
- `{{md5}}` is a md5-digest of the unminified file contents.

For example, `{{filename}}-{{md5}}.min.{{ext}}` will make `abc.js` into something
like `abc-f90731d65c61af25b149658a120d26cf.min.js`.

To avoid the minification of previously minified files, there is a `--clean`
option, which will delete all files that match the output pattern.

This also means that any real files that match the pattern will be removed as
well, so please be careful.


Running from a node-script
--------------------------

It is also possible to run the minifier from within another node script:

	var minifier = require('minifier')
	var input = '/some/path'

	minifier.on('error', function(err) {
		// handle any potential error
	})
	minifier.minify(input, options)

As with the command-line variant, the input should be a path to either a
javascript file, a css file or a folder.

The options-dictionary takes the same parameters as the command-line variant:

- output: A path-string that tells where to put the output.
- template: A string template for how to build the outputted filenames.
- clean: A bool for whether other files with names similar to the template
  should be deleted before minifying the contents of a folder.
- cleanOnly: A bool for whether to run with `clean` option and then exiting
  before minifying any files.

There are one important additional option: `uglify`. This will be passed on to
uglify, so that the minification can be controlled. See the
[uglify documentation](https://github.com/mishoo/UglifyJS2#the-simple-way)
for more details (the `uglify.minify(path, opts)` function is used internally).

-----

The method for building the output name from the template is exposed for
convenience:

	var minifier = require('minifier')
	var file = 'abc.js'
	var template = '{{filename}}.{{md5}}.{{ext}}'
	var content = null; // or the content, if md5 or sha1 should be calculated
	var result = minifier.generateOutputName(file, { template: template, content: content })

If the input-path includes any folders, they will also be added to the output.

If `content` is eschewed, the `md5` and `sha` digests cannot be calculated.

But there is an option for turning them into either `RegExp` or `glob` compatible
syntax: Simply add `glob: true` or `regex: true` to the options array:

	var result = minifier.generateOutputName(file, { template: template, glob: true })

`glob` will return a string for passing to a `glob` function, whereas `regex`
will return a `RegExp` instance for manual comparison.

Running the tests
-----------------

After installing from [github](https://github.com/fizker/minifier), simply run
`npm test`.

There is a script called `prepareManualTests.js`, which will run the script
against the css-files inside `test/manual/css/` and provides a real-world
example of the CSS minification tools.

The manual tests can be seen by opening `test/manual/index.html` in a browser
after executing `prepareManualTests.js`.


Credits
-------

In no particular order:

- [duckduckgo](http://duckduckgo.com) for the image used by the manual tests.
- [sqwish](https://github.com/ded/sqwish) for minifying CSS files.
- [uglify-js](https://github.com/mishoo/UglifyJS2) for minifying JS files.
- [commander](https://github.com/visionmedia/commander.js) for command-line
  interaction.
- [mocha](https://github.com/visionmedia/mocha) and [chai](http://chaijs.com)
  for testing home-brewed logic.
- [glob](https://github.com/isaacs/node-glob) for trawling through the
  file-system when targetting a folder.
- [hogan.js](http://twitter.github.com/hogan.js/) for parsing the template
  string.
