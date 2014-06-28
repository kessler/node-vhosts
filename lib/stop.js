var sdt = require('sdt')
var config = require('./config.js')
var util = require('util')

module.exports = function (argv, callback) {
	sdt.stop(config, function(err, alreadyStopped) {
	    if (err) 
	        return callback(err)
	        
	    callback(null, util.format('Daemon was ' + (alreadyStopped ? 'already stopped' : 'stopped')))
	})
}