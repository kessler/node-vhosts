var sdt = require('sdt')
var config = require('./config.js')
var util = require('util')

module.exports = function (argv, callback) {
	sdt.getStatus(config.sdt, function(err, status) {
	    if (err) {
	    	
	    	if (err.code === 'ENOENT') {
	    		
	    		return callback(null, 'Daemon is stopped')
	    	}

	    	return callback(err)	    	
	    } 
	    
	    callback(null, util.format('Daemon is %s', (status ? 'running' : 'stopped')))
	})
}