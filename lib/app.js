var connect = require('connect')
var config = require('./config.js')
var http = require('http')
var debug = require('debug')('vhosts:server')
var DirectoryCache = require('directory-cache')
var async = require('async')
var path = require('path')
var _ = require('lodash')
var fs = require('fs')
var vhost = require('vhost')
var DynamicMiddleware = require('dynamic-middleware')

var root = path.resolve(__dirname, '..')

// create vhosts dir if it doesn't exist
if (!fs.existsSync(config.directory))
	fs.mkdirSync(config.directory)

// holds all the dynamic vhost middlewares
var dms = {} 

// main connect app
var mainApp = connect()

// default localhost
addVhost('localhost', './localhost')

// directory cache stuff
var cache = DirectoryCache.create(config)

cache.filter = function(file) {
	var extension = path.extname(file)

	return config.extensionBlacklist.indexOf(extension) === -1
}

cache.on('add', function(file, data) {
	data = preparePath(data)
	
	fs.exists(data, function(exists) {

		if (exists) {
			addVhost(file, data)
		} else {
			console.log('add: ignoring non existant app location: %s for domain %s', data, file)
		}
	})
})

cache.on('change', function(file, data) {
	fs.exists(data, function(exists) {

		if (exists) {
			updateVhost(file, preparePath(data))
		} else {
			console.log('update: ignoring non existant app location: %s for domain %s', data, file)
		}
	})
})

cache.on('delete', removeVhost)

cache.on('error', function(err) {
	console.trace(err)
})

// start the show

var mainServer = http.createServer(mainApp)

var initSequence = [
	_.bind(cache.init, cache),
	_.bind(mainServer.listen, mainServer, config.port)
]

async.series(initSequence, function(err) {
	if (err) {
		console.error(err)
		process.exit(1)
	}

	debug('server ready')
})

function addVhost(domain, appPath) {
	
	domain = domain.replace(/_/g, '*')
	
	var rm
	// protect from faulty modules
	try {
		
		rm = vhost(domain, require(appPath))

	} catch (e) {
		console.error('failed to add vhost %s, %s', domain, appPath)
		console.trace(e)
	} 

	var dm = DynamicMiddleware(mainApp, rm)

	dm.use('/')
	dms[domain] = dm

	console.log('added vhost %s, %s', domain, appPath)
	
	return dm
}

function removeVhost(domain) {
	debug('removing vhost %s', domain)

	var dm = dms[domain]

	if (dm) {
		delete dms[domain]
		dm.remove()
	}
}

function updateVhost(domain, appPath) {
	debug('updating vhost %s, %s', domain, appPath)

	removeVhost(domain)
	addVhost(domain, appPath)
}

function preparePath (data) {
	data = data.toString()
	data = path.resolve(root, data)

	return data.trim()
}