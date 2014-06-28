var config = require('./config.js')
var fs = require('fs')
var path = require('path')

module.exports = function(args, callback) {

	if (!args || args.length < 2) {
		return callback(new Error('missing command arguments'))
	}

	var domain = args[0]

	// this will turn back to * later on
	domain = domain.replace(/\*/g, '_')

	var appPath = args[1]

	console.log('adding %s, %s', domain, appPath)

	fs.writeFile(path.join(config.directory, domain), appPath, callback)
}