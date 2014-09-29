var fs = require('fs')
var inspect = require('util').inspect
var path = require('path')
var async = require('async')
var config = require('./config.js')
var EventEmitter = require('events').EventEmitter
var _ = require('lodash')
var inherits = require('util').inherits
var newline = require('newline')
var os = require('os')

module.exports = PitifulDB

/*
	a pitiful excuse for a database
*/
inherits(PitifulDB, EventEmitter)
function PitifulDB(file, lineEnding) {
	if (!this instanceof PitifulDB) return new PitifulDB(file)

	EventEmitter.call(this)

	this._lineEnding = lineEnding
	this._dbFile = file
	this._fs = fs
	this._encoding = 'utf8'
	this._index = []
}

PitifulDB.prototype.init = function(callback) {
	var self = this

	try {
		this._watcher = this._fs.watch(this._dbFile, { persistent: false })
		this._watcher.on('change', _.bind(this._onChange, this))

		// read the file right away
		this._fs.readFile(this._dbFile, this._encoding, function(err, data) {
			if (err) return callback(err)

			self._index = self._parseDb(data)
		})

		callback(null, this)

	} catch (e) {

		// if the db file does not exist then create it 
		// and rerun the initialization
		if (e.code === 'ENOENT') {
			this._fs.open(this._dbFile, 'a', function(err, fd) {

				if (err) return callback(err)

				self._fs.close(fd, function(err) {
					if (err) return callback(err)

					self.init(callback)	
				})
			})			
		} else {
			throw e
		}
	}	
}

PitifulDB.prototype.put = function (line, cb) {
	fs.appendFile(this._dbFile, line + os.EOL, this._encoding, cb)
}

PitifulDB.prototype._onChange = function() {	
	this._fs.readFile(this._dbFile, this._encoding, _.bind(this._onReadFile, this))
}

PitifulDB.prototype._onReadFile = function(err, data) {

	try {
		
		var rows = this._parseDb(data)

		var added = _.difference(rows, this._index)
		var removed = _.difference(this._index, rows)

		this._index = rows

		if (added.length > 0)
			this.emit('add', added)

		if (removed.length > 0)
			this.emit('remove', removed)
	
	} catch (e) {
		this.emit('error', e)
	}
}

PitifulDB.prototype._parseDb = function(data) {
	var rows = this._split(data)

	if (rows.length === 0) return

	rows = _.unique(rows)

	var last = rows.pop()

	// usually last will be empty since we split by new line, but if it isn't, return it back
	if (last)
		rows.push(last)

	return rows
}

PitifulDB.prototype._detectLineEnding = function(data) {
	if (this._lineEnding) return this._lineEnding

	var le = newline.detect(data)

	if (le === 'LF') return '\n'

	if (le === 'CR') return '\r'

	if (le === 'CRLF') return '\r\n'

	throw new Error('unknown line ending: ' + le)
}

/*

*/
//TODO might be better to do this using regex?
PitifulDB.prototype._split = function (data) {
	return data.split(this._detectLineEnding(data))
}