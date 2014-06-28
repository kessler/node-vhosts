var config = require('./config.js')
var fs = require('fs')
var path = require('path')

module.exports = function(args, callback) {

	if (!args || args.length < 1) {
		return callback(new Error('missing command arguments'))
	}

	var domain = args[0]

	// this will turn back to * later on
	domain = domain.replace(/\*/g, '_')

	console.log('removing %s', domain)
	
	fs.unlink(path.join(config.directory, domain), callback)
}