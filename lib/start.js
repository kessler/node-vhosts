var sdt = require('sdt')
var config = require('./config.js')
var debug = require('debug')('vhosts:start')
var util = require('util')

module.exports = function (argv, callback) {
	debug(new Date().toUTCString())
	sdt.start(config, function(err, pid) {
	    if (err)
	        return callback(err)	        
	    
	    callback(null, util.format('Daemon started with pid: %s', pid))
	})
}