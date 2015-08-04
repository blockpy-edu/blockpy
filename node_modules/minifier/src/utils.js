module.exports =
	{ stripUTF8ByteOrder: stripUTF8ByteOrder
	, generateOutputName: generateOutputName
	}

var format = require('util').format
var hogan = require('hogan.js')
var digest = require('crypto').createHash
var path = require('path')

function generateOutputName(input, options) {
	if(!options) options = {}
	var extractedInput =
		{ md5: generate.bind(null, 'md5')
		, sha: generate.bind(null, 'sha256')
		}
	var dir = path.dirname(input)
	path.basename(input).replace(/^(.*)\.([^.]+)$/, function(match, file, ext) {
		extractedInput.ext = ext
		extractedInput.filename = file
		return ''
	})

	var output = hogan.compile(options.template || '{{filename}}.min.{{ext}}').render(extractedInput)

	output = path.join(dir, output)

	if(options.regex) return new RegExp(output.replace(/\.([^*])/g, '\\.$1'))
	return output

	function generate(algorithm) {
		if(options.regex) return '.*'
		if(options.glob) return '*'
		if(!options.content) throw new Error('Content is required for producing ' + algorithm)
		var digester = digest(algorithm)
		digester.update(options.content, 'utf8')
		return digester.digest('hex')
	}
}

function stripUTF8ByteOrder(data) {
	var content = data.toString()
	if(content[0] === '\uFEFF') {
		content = content.substring(1)
	}
	return content
}
