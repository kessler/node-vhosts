'use strict'
console.log('THIS TEST MUST BE RUN IN ELEVATED MODE')

var assert = require('assert')
var child = require('child_process')
var path = require('path')
var request = require('request')
var uuid = require('node-uuid')
var hostile = require('hostile')
var config = require('../lib/config.js')
var async = require('async')
var _ = require('lodash')
var rimraf = require('rimraf')
var fs = require('fs')

var WORK_DIR = path.join(__dirname, 'work')
var DOMAIN_DIR = path.join(WORK_DIR, 'domains')
var OUT_LOG = path.join(WORK_DIR, 'out.log')
var ERR_LOG = path.join(WORK_DIR, 'err.log')
var PID_FILE = path.join(WORK_DIR, 'vhosts.pid')
var APP_FILE = path.join(WORK_DIR, 'app.js')

// service different hosts + remove hosts on the fly
var SAMPLE_DOMAIN_1 = 'www.' + uuid() + '.com'

// add vhosts on the fly
var SAMPLE_DOMAIN_2 = 'www.' + uuid() + '.com'
var SAMPLE_DOMAIN_3 = 'www.' + uuid() + '.com'

// add wildcard hosts
var SAMPLE_DOMAIN_4_BASE = uuid() + '.com'
var SAMPLE_DOMAIN_4_FILE = '_.' + SAMPLE_DOMAIN_4_BASE
var SAMPLE_DOMAIN_4_SUB1 = 'a.' + SAMPLE_DOMAIN_4_BASE
var SAMPLE_DOMAIN_4_SUB2 = 'b.' + SAMPLE_DOMAIN_4_BASE

var SAMPLE_DOMAIN_5_BASE = uuid() + '.com'
var SAMPLE_DOMAIN_5_FILE = 'a_.' + SAMPLE_DOMAIN_5_BASE
var SAMPLE_DOMAIN_5_SUB1 = 'a1.' + SAMPLE_DOMAIN_5_BASE
var SAMPLE_DOMAIN_5_SUB2 = 'a2.' + SAMPLE_DOMAIN_5_BASE

var SAMPLE_DOMAIN_6_BASE = uuid() + '.com'
var SAMPLE_DOMAIN_6 = '*.' + SAMPLE_DOMAIN_6_BASE
var SAMPLE_DOMAIN_6_SUB1 = 'a1.' + SAMPLE_DOMAIN_6_BASE
var SAMPLE_DOMAIN_6_SUB2 = 'a2.' + SAMPLE_DOMAIN_6_BASE

var PREEXISTING_DOMAIN_FILE = path.join(DOMAIN_DIR, SAMPLE_DOMAIN_1)

describe('vhosts service can', function () {
	this.timeout(10000)

	before(beforeAll)
	beforeEach(beforeEachImpl)
	after(afterAll)

	it('stop (stop command)', function(done) {
		async.waterfall([
			_.partial(exec, command('start')),
			_.partial(testGoodUrl, 'http://localhost:3000', 'ok'),
			_.partial(exec, command('stop')),
			_.partial(testBadUrl, 'http://localhost:3000'),
		], done)
	})

	it('start (start command)', function (done) {
		async.waterfall([
			_.partial(exec, command('start')),
			_.partial(testGoodUrl, 'http://localhost:3000', 'ok'),
			_.partial(exec, command('stop'))
		], done)
	})

	it('report status (status command)', function(done) {		
		async.waterfall([
			_.partial(exec, command('start')),
			_.partial(assertStatusReport, 'running'),
			_.partial(exec, command('stop')),
			_.partial(assertStatusReport, 'stopped')
		], done)
	})
	
	it('service different vhosts (' +SAMPLE_DOMAIN_1 + ')', function(done) {
		async.waterfall([
			_.partial(exec, command('start')),
			_.partial(testGoodUrl, 'http://' + SAMPLE_DOMAIN_1+ ':3000', 'vhost'),
			_.partial(exec, command('stop'))
		], done)
	})

	it.skip('lists vhosts', function() {

	})

	describe('add vhosts on the fly' , function () {

		it('via file creation in cache directory (' + SAMPLE_DOMAIN_2 + ')', function(done) {
			var url = 'http://' + SAMPLE_DOMAIN_2 + ':3000'

			async.waterfall([
				_.partial(exec, command('start')),				
				_.partial(testBadUrl, url),
				_.bind(fs.writeFile, fs, path.join(DOMAIN_DIR, SAMPLE_DOMAIN_2), APP_FILE),
				delay(500),
				_.partial(testGoodUrl, url, 'vhost'),				
				_.partial(exec, command('stop'))
			], done)		
		})

		it('via add command (' + SAMPLE_DOMAIN_3 + ')', function(done) {
			var url = 'http://' + SAMPLE_DOMAIN_3 + ':3000'

			async.waterfall([
				_.partial(exec, command('start')),
				_.partial(testBadUrl, url),
				_.partial(exec, command('add', SAMPLE_DOMAIN_3, APP_FILE)),
				delay(500),
				_.partial(testGoodUrl, url, 'vhost'),
				_.partial(exec, command('stop'))
			], done)			
		})
	})

	describe('remove hosts on the fly', function () {
		it('via file deletion', function (done) {
			var url = 'http://' + SAMPLE_DOMAIN_1 + ':3000'
			async.waterfall([
				_.partial(exec, command('start')),			
				_.partial(testGoodUrl, url, 'vhost'),
				_.bind(fs.unlink, fs, PREEXISTING_DOMAIN_FILE),
				delay(500),
				_.partial(testBadUrl, url),
				_.partial(exec, command('stop'))
			], done)
		})

		it('via remove command', function (done) {
			var url = 'http://' + SAMPLE_DOMAIN_1 + ':3000'
			async.waterfall([
				_.partial(exec, command('start')),			
				_.partial(testGoodUrl, url, 'vhost'),
				_.partial(exec, command('remove', SAMPLE_DOMAIN_1)),
				delay(500),
				_.partial(testBadUrl, url),
				_.partial(exec, command('stop'))
			], done)
		})
	})

	describe('add wildcard hosts', function (done) {
		it('for windows os - a file with _ to represent * (' + SAMPLE_DOMAIN_4_FILE + ')', function(done) {
			var url1 = 'http://' + SAMPLE_DOMAIN_4_SUB1 + ':3000'
			var url2 = 'http://' + SAMPLE_DOMAIN_4_SUB2 + ':3000'

			async.waterfall([
				_.partial(exec, command('start')),			
				_.partial(testBadUrl, url1),
				_.partial(testBadUrl, url2),
				_.bind(fs.writeFile, fs, path.join(DOMAIN_DIR, SAMPLE_DOMAIN_4_FILE), APP_FILE),
				delay(500),								
				_.partial(testGoodUrl, url1, 'vhost'),				
				_.partial(testGoodUrl, url2, 'vhost'),				
				_.partial(exec, command('stop'))
			], done)
		})	

		it('for windows os - a file _ to represent * (' + SAMPLE_DOMAIN_5_FILE + ')', function(done) {
			var url1 = 'http://' + SAMPLE_DOMAIN_5_SUB1 + ':3000'
			var url2 = 'http://' + SAMPLE_DOMAIN_5_SUB2 + ':3000'

			async.waterfall([
				_.partial(exec, command('start')),			
				_.partial(testBadUrl, url1),
				_.partial(testBadUrl, url2),
				_.bind(fs.writeFile, fs, path.join(DOMAIN_DIR, SAMPLE_DOMAIN_5_FILE), APP_FILE),
				delay(500),								
				_.partial(testGoodUrl, url1, 'vhost'),				
				_.partial(testGoodUrl, url2, 'vhost'),				
				_.partial(exec, command('stop'))
			], done)
		})

		it('via add command (' + SAMPLE_DOMAIN_6 + ')', function(done) {
			var url1 = 'http://' + SAMPLE_DOMAIN_6_SUB1 + ':3000'
			var url2 = 'http://' + SAMPLE_DOMAIN_6_SUB2 + ':3000'

			async.waterfall([
				_.partial(exec, command('start')),
				_.partial(testBadUrl, url1),
				_.partial(testBadUrl, url2),
				_.partial(exec, command('add', SAMPLE_DOMAIN_6, APP_FILE)),
				delay(500),
				_.partial(testGoodUrl, url1, 'vhost'),
				_.partial(testGoodUrl, url2, 'vhost'),
				_.partial(exec, command('stop'))
			], done)				
		})
	})
})

/*
	test that a url is reachable and replies with an expected response
*/
function testGoodUrl(url, expectedBody, callback) {
	
	request(url, function(err, response, body) {
		if (err)
			return callback(err)

		if (!isResponseStatusOk(response)) 
				return doneWithBadResponseStatus(response, callback)

		assert.strictEqual(body, expectedBody)

		callback()
	})	
}

/*
	test that a url on the server either:

	refuse the connection or
	replies 404
*/
function testBadUrl(url, callback) {

	request(url, function(err, response, body) {
		
		var expectedErrorOccurred = false

		if (err && err.code === 'ECONNREFUSED') {			
			return callback(null)
		}

		if (response) {
			assert.strictEqual(response.statusCode, 404)
			return callback(null)			
		}
		
		if (err) {
			// something bad happened but nothing we expected
			callback(err)
		} else {
			throw new Error(url + ' - expected something bad to have happened, but nothing did.')
		}

	})
}

/*
	create the cli command text
*/
function command() {
	var cmd = 'node ' + path.resolve(__dirname, '..', 'cli.js')
	
	for (var i = 0; i < arguments.length; i++) {
		cmd += ' ' + arguments[i] 
	}

	cmd += ['',
		'--directory=' + DOMAIN_DIR, 
		'--sdt.out=' + OUT_LOG,
		'--sdt.err=' + ERR_LOG,
		'--sdt.pidFile=' + PID_FILE
		].join(' ')

	return cmd
}

/*
	execute a command in a child process 
*/
function exec(cmd, callback) {

	child.exec(cmd, function(err, stdout, stderr) {
		
		if (err) 
			return callback(err)

		setTimeout(callback, 1000)		
	})
}

/*
	execute a command in a child process passing back the output in a callback
*/
function execWithOutput(cmd, callback) {
	return child.exec(cmd, function(err, stdout, stderr) {
		
		if (err) 
			return callback(err)

		setTimeout(_.partial(callback, null, stdout, stderr), 1000)		
	})	
}

/*
	add all the test domains to /etc/hosts

	delete and create the test directory

	set the out and err logs and pid file of sdt

	create a "preexisting" domain file
*/
function beforeAll(done) {
			
	var init = [
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_1),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_2),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_3),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_4_SUB1),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_4_SUB2),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_5_SUB1),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_5_SUB2),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_6_SUB1),
		_.partial(hostile.set, '127.0.0.1', SAMPLE_DOMAIN_6_SUB2)
	]

	if (fs.existsSync(DOMAIN_DIR))
		init.push(_.bind(rimraf, null, DOMAIN_DIR))			
	
	if (fs.existsSync(OUT_LOG))
		init.push(_.bind(fs.unlink, fs, OUT_LOG))

	if (fs.existsSync(ERR_LOG))
		init.push(_.bind(fs.unlink, fs, ERR_LOG))

	if (fs.existsSync(PID_FILE))
		init.push(_.bind(fs.unlink, fs, PID_FILE))

	init.push(_.bind(fs.mkdir, fs, DOMAIN_DIR))
	
	async.waterfall(init, done)		
}

function beforeEachImpl(done) {
	
	if (!fs.existsSync(PREEXISTING_DOMAIN_FILE)) {
		fs.writeFile(PREEXISTING_DOMAIN_FILE, APP_FILE, done)
	} else {
		done()
	}
}

/*
	remove everything from /etc/hosts and stop any running process
*/
function afterAll(done) {
	async.waterfall([
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_1),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_2),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_3),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_4_SUB1),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_4_SUB2),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_5_SUB1),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_5_SUB2),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_6_SUB1),
		_.partial(hostile.remove, '127.0.0.1', SAMPLE_DOMAIN_6_SUB2),
		_.partial(exec, command('stop'))
	], function(err) {
		if (err) console.log(err)
		done()
	})
}

function isResponseStatusOk(response) {
	return response.statusCode > 199 && response.statusCode < 300
}

function doneWithBadResponseStatus(response, done) {
	done(new Error('bad response status code ' + response.statusCode))
}

function assertStatusReport(text, callback) {
	// execute the status command and assert the result
	execWithOutput(command('status'), function(err, stdout, stderr) {
		assert.ok(stdout.indexOf(text) > -1)
		callback()
	})						
}

function delay(ms) {
	return function(callback) {
		setTimeout(callback, ms)
	}
}

function print(something) {
	return function(callback) {
		console.log(something)
		callback()
	}
}