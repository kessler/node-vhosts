var rc = require('rc')
var path = require('path')
var debug = require('debug')('vhosts:config')

var script = path.join(__dirname, 'app.js')

debug('app script: %s', script)

module.exports = rc('vhosts', {
	port: 3000,

	// directory cache stuff
	directory: path.resolve(__dirname, '..', 'work', 'vhosts'),

	extensionBlacklist: ['.swx', 'swp'],

	// sdt stuff
	cwd: process.cwd(),
    command: 'node',
    args: [script].concat(process.argv.slice(2)),
    out: path.resolve(__dirname, '..', 'work', 'vhosts.out.log'),
    err: path.resolve(__dirname, '..', 'work', 'vhosts.err.log'),
    pidFile: path.resolve(__dirname, '..', 'work', 'vhosts.pid')	
})