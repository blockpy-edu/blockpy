#!/usr/bin/env node

var program = require('commander')
var minifier = require('./src/minify')
var input

if(require.main === module) {
	var skip = []
	program
		.version(require('./package.json').version)
		.option('-o, --output [file]', 'The output file')
		.option('-t, --template [template]', 'A template for building the output file')
		.option('-c, --clean', 'Deletes any files that resembles the template')
		.option('-C, --clean-only', 'Same as `--clean`, but without minifying the files afterwards')
		.option('-s, --skip <path-component>', 'Skip any files that contains this in the path')
		.option('--no-comments', 'Remove license-style comments')
		.usage('[--output file] path/to/input')

		.on('skip', function(path) {
			skip.push(path)
		})

		.parse(process.argv)

	input = program.args[0]

	if(!input) {
		program.parse(['bla', 'bla', '--help'])
		process.exit()
	}

	if(skip.length) program.skip = skip

	program.noComments = program.comments === false

	minifier.on('error', function(msg) {
		console.log(msg)
		process.exit(1)
	})
	program.uglify = {
		output: {
			semicolons:false,
		},
	}
	minifier.minify(input, program)

	if(program.cleanOnly) {
		return console.log('Minified files cleaned')
	}

	console.log('Minification complete')
}

module.exports = minifier
