var table = require('text-table');

module.exports = function() {
	return table([
		[''],
		['Usage: vhosts [command] [parameters]'],
		[''],
		['Commands:'],
		['help', 'display this message'],
		['start', 'starts the vhosts server', 'vhosts start [3000]'],
		['stop', 'stops the vhosts server', 'vhosts stop'],
		['status', 'print the status of the vhosts server', 'vhosts status'],
		['add', 'adds a new vhost', 'vhosts add mydomain.com /path/to/app.js'],
		['remove', 'adds a new vhost', 'vhosts add mydomain.com /path/to/app.js'],
		['list', 'list current vhost mapping', 'vhosts list']
	]);	
}