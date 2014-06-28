var config = require('./config.js')
var fs = require('fs')
var path = require('path')
var async = require('async')

module.exports = function (args, callback) {

	console.log('listing domains at %s', config.directory)

	fs.readdir(config.directory, function(err, files) {
		if (err) return callback(err)

		async.each(files, print, callback)
	})
}

function print(file, callback) {
	fs.readFile(path.join(config.directory, file), 'utf8', function(err, content) {
		if (err) return callback(err)

		console.log('%s: %s', file, content)
		callback()
	})
}