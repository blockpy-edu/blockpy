module.exports =
	{ parse: parse
	}

var fs = require('fs')
var path = require('path')
var format = require('util').format
var utils = require('./utils')
var stringImportMatcher = /@import ["'](.+)["'];/g
var importMatcher = /@import +(url\()?([^()]+)\)? *;/g
var urlMatcher = /url\(["']?([^"'()]+)["']?\)/g
var absoluteUrl = /^([a-zA-Z]:\/)?\//
var dataUrl = /^data:/

function parse(file, absRoot, minifier) {
	if(!minifier) minifier = function(content) { return content }
	var root = path.dirname(file)
	var absRoot = absRoot || ''
	var relRoot = path.relative(absRoot, root)
	var content = minifier(utils.stripUTF8ByteOrder(fs.readFileSync(file, 'utf8')))

	return content
		.replace(stringImportMatcher, function(match, url) {
			return format('@import url(%s);', url)
		})
		.replace(urlMatcher, function(match, url) {
			url = url.trim()
			if(!url.match(dataUrl) && !url.match(absoluteUrl)) {
				url = path.join(relRoot, url).replace(/\\/g, '/')
			}
			return format('url(%s)', url)
		})
		.replace(importMatcher, function(match, junk, file) {
			if(!file.match(absoluteUrl)) {
				file = path.join(absRoot, file)
			}
			var parsedFile = parse(file, absRoot)
			return parsedFile +'\n'
		})
		.trim()
}
