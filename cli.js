#!/usr/bin/env node
var help = require('./lib/help.js')
var argv = require('minimist')(process.argv.slice(2))
var debug = require('debug')('vhosts:cli')

var commands = [ 'help', 'start', 'stop', 'status', 'add', 'remove', 'list' ]

var userCommand = argv._[0]

debug(userCommand)

if (!userCommand) {
	console.error('missing a command')
	console.error(help())
	process.exit(1)
}

if (commands.indexOf(userCommand) === -1) {
	console.error('invalid a command: %s', userCommand)
	console.error(help())
	process.exit(1)
}

var command = require('./lib/' + userCommand + '.js')

try {

	var result = command(argv._.slice(1), function(err, result) {
		if (err) {
			console.error(err)
			process.exit(1)
		}

		if (result)
			console.log(result)
	})

	if (result)
		console.log(result)

} catch (e) {
	
	console.error('error: %s', e)
	console.error(help())
	process.exit(1)
}