var rc = require('rc')
var path = require('path')
var debug = require('debug')('vhosts:config')
var getUserHome = require('kessler').fs.getUserHome
var script = path.join(__dirname, 'app.js')

debug('app script: %s', script)

var userHome = getUserHome()

module.exports = rc('vhosts', {
	port: 3000,

	// directory cache stuff
	directory: path.join(userHome, '.vhosts'),

	extensionBlacklist: ['.swx', 'swp'],

	// sdt stuff
	cwd: process.cwd(),
    command: 'node',
    args: [script].concat(process.argv.slice(2)),
    out: path.join(userHome, 'vhosts.out.log'),
    err: path.join(userHome, 'vhosts.err.log'),
    pidFile: path.join(userHome, 'vhosts.pid')
})