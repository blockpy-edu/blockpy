var fs = require('fs')
var path = require('path')
var fmerge = require('fmerge')
var format = require('util').format
var sqwish = require('sqwish')
var uglify = require('uglify-js')
var stripUTF8ByteOrder = require('./utils').stripUTF8ByteOrder
var generateOutput = require('./utils').generateOutputName
var glob = require('glob')
var cssParser = require('css-resolve-import')

var EventEmitter = require('events').EventEmitter
var obj = new EventEmitter()

obj.minify = minify
obj.generateOutputName = generateOutput

module.exports = obj

function minify(input, options) {
	options = fmerge({}, options)

	var output
	var template

	if(!input) {
		obj.emit('error', new Error('The input is required'))
	}

	if(options.cleanOnly) {
		options.clean = true
	}
	output = options.output
	template = options.template

	if(output && template) {
		return obj.emit(
			  'error'
			,   new Error('It does not make sense to provide both --output and '
			  + '--template options. Please choose one.')
		)
	}

	if(fs.statSync(input).isDirectory()) {
		if(output) {
			return obj.emit('error',
				new Error('You cannot use `output` option against a directory'))
		}
		if(options.clean) {
			clean(input, template || '{{filename}}.min.{{ext}}')
		}
		if(options.cleanOnly) {
			return
		}

		var files = glob.sync(path.join(input, '**/*.js'))
			.concat(
				glob.sync(path.join(input, '**/*.css'))
			)
		if(options.skip) {
			files = files.filter(function(file) {
				return !options.skip.some(function(filter) {
					return ~file.indexOf(filter)
				})
			})
		}
		files.every(handleInput)

		return
	}

	if(options.clean) {
		if(template) {
			clean(path.dirname(input), template)
		} else if(fs.existsSync(output)) {
			fs.unlinkSync(output)
		}
	}

	if(options.cleanOnly) {
		return
	}

	handleInput(input)

	function handleInput(input) {
		if(!/\.(js|css)$/.test(input)) {
			obj.emit(
				  'error'
				, new Error(format(
				    'Please reference a file with the extension .js or .css. You referenced <%s>'
				  , input
				  ))
				)
			return false
		}

		if(/\.js$/.test(input)) {
			js(input)
		} else {
			css(input)
		}
		return true
	}

	function js(input) {
		var max = fs.readFileSync(input, 'utf8')
		var comment = firstComment(max)
		var min = uglify.minify(max, fmerge(options.uglify, { fromString: true })).code
		var opts = { content: min, template: template }
		var renderedOutput = output || generateOutput(input, opts)

		if(comment) {
			min = comment +'\n' + min
		}

		fs.writeFileSync(renderedOutput, min)
	}

	function css(input) {
		var inDir = path.dirname(input)
		var outDir = path.dirname(output || input)
		var root = path.join(inDir, path.relative(inDir, outDir))
		var min = cssParser(input, root, function(max) {
			var max = stripUTF8ByteOrder(max)
			var comment = firstComment(max)
			var min = sqwish.minify(max, false)

			if(comment) {
				min = comment + '\n' + min
			}

			return min
		})
		var opts = { content: min, template: template }
		var renderedOutput = output || generateOutput(input, opts)

		fs.writeFileSync(renderedOutput, min)
	}

	function clean(dir, template) {
		template = template.replace(/{{[^}]*}}/g, '*')
		glob.sync(path.join(dir, '**', template)).forEach(function(file) {
			fs.unlinkSync(file)
		})
	}

	function firstComment(content) {
		if(options.noComments) return null
		content = content.trim()
		if(content[0] == '/' && content[1] == '*') {
			return content.substring(0, content.indexOf('*/')+2)
		}
		if(content[0] == '/' && content[1] == '/') {
			var lines = content.split(/[\r\n]{1,2}/g)
			content = lines[0]
			for(var i = 1; i < lines.length; i++) {
				var line = lines[i]
				if(line[0] == '/' && line[1] == '/') {
					content += '\n' + line
				}
			}
			return content
		}
		return null
	}
}
