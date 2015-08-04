module.exports = parse

var fs = require('fs')
var path = require('path')
var format = require('util').format
var stripUTF8ByteOrder = require('./strip-utf8-byte-order')
var stringImportMatcher = /@import ["'](.+)["'];?/g
var importMatcher = /@import +(?:url\()?([^()]+)\)?(:? *;)?/g
var urlMatcher = /url\(["']?([^"'()]+?)(?:\?.*?)?["']?\)/g
var urlWithScheme = /^(?:[a-z][a-z-+.0-9]*:)?\/\//i
var absoluteUrl = /^\//i
var dataUrl = /^data:/

function parse(file, absRoot, transform) {
	if(!transform) transform = function(content) { return content }
	var root = path.dirname(file)
	var absRoot = absRoot || ''
	var relRoot = path.relative(absRoot, root)
	var content = transform(stripUTF8ByteOrder(fs.readFileSync(file, 'utf8')))

	return content
		.replace(stringImportMatcher, function(match, url) {
			return format('@import url(%s);', url)
		})
		.replace(urlMatcher, function(match, url) {
			url = url.trim()
			if(!url.match(dataUrl) && !url.match(urlWithScheme) && !url.match(absoluteUrl)) {
				url = path.join(relRoot, url).replace(/\\/g, '/')
			}
			return format('url(%s)', url)
		})
		.replace(importMatcher, function(match, file) {
			if(file.match(urlWithScheme)) {
				return format('@import url(%s);', file)
			}

			if(!file.match(absoluteUrl)) {
				file = path.join(absRoot, file)
			}
			var parsedFile = parse(file, absRoot, transform)
			return parsedFile +'\n'
		})
		.trim()
}
