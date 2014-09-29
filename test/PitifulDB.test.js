var assert = require('assert')
var PitifulDB = require('../lib/PitifulDB.js')
var path = require('path')
var should = require('should')
var EventEmitter = require('events').EventEmitter
var debug = require('debug')('PitifulDB.test')
var fs = require('fs')

var DB_FILE = path.join(__dirname, 'test.db') 

describe('PitifulDB', function () {
	var pdb

	beforeEach(function () {
		pdb = new PitifulDB(DB_FILE)
	})

	describe('unit', function() {
		var mockFs

		beforeEach(function () {
			mockFs = {}

			pdb._fs = mockFs
		})

		it('normal init', function(done) {
			var ee = new EventEmitter()

			var order = []

			ee.on = function(ev, fn) {
				this.ev = ev
				this.fn = fn
				order.push('onchange')
			}

			mockFs.watch = function(file, opts) {
				this.file = file
				this.opts = opts
				order.push('watch')
				return ee
			}

			mockFs.readFile = function(name, enc, cb) {
				order.push('readFile')
				cb(null, '123\n123\n')
			}

			pdb.init(function (err) {
				if (err) return done(err)
	
				pdb._index.should.have.lengthOf(1)
				pdb._index[0].should.equal('123')
				done()
			})

			order.should.have.lengthOf(3)
			order[0].should.equal('watch')
			order[1].should.equal('onchange')			
			order[2].should.equal('readFile')			
			
			ee.ev.should.equal('change')
			mockFs.file.should.equal(DB_FILE)
			mockFs.opts.should.eql({ persistent: false })
		})	

		it('init with non existant db file', function(done) {
			
			var order = []

			var fd = {}
			var e = new Error()

			e.code = 'ENOENT'

			var watchCalls = 0

			mockFs.watch = function(file, opts) {
				order.push('watch')

				if (++watchCalls === 1)
					throw e
				else
					return new EventEmitter()
			}

			mockFs.readFile = function(name, enc, cb) {
				cb(null, '123\n123\n')
			}

			mockFs.open = function (file, attrs, cb) {
				order.push('open')
				
				this.file = file
				this.attrs = attrs
				
				cb(null, fd)
			}
				
			mockFs.close = function (fd, cb) {
				order.push('close')

				this.fd = fd

				cb()
			}

			pdb.init(function(err) {

				order.should.have.lengthOf(4)
				order[0].should.equal('watch')
				order[1].should.equal('open')
				order[2].should.equal('close')
				order[3].should.equal('watch')

				mockFs.fd.should.equal(fd)
				mockFs.file.should.equal(DB_FILE)
				mockFs.attrs.should.equal('a')

				done()
			})
		})

		it('emits an add event', function(done) {
			
			var ee = new EventEmitter()
			
			mockFs.watch = function () {
				return ee
			}

			var count = 0

			mockFs.readFile = function(name, enc, cb) {
				this.file = name
				this.enc = enc

				// first read yield empty file
				if (count++ === 0)
					cb(null, '')
				else
					cb(null, '123')
			}

			pdb.on('add', function (data) {
				data.should.eql(['123'])

				mockFs.file.should.equal(DB_FILE)
				mockFs.enc.should.equal('utf8')

				pdb._index.should.have.lengthOf(1)
				pdb._index[0].should.equal('123')

				done()
			})

			pdb.init(function () {
				ee.emit('change', DB_FILE)							
			})
		})

		it('emits a remove event', function (done) {

			var ee = new EventEmitter()
			
			mockFs.watch = function () {
				return ee
			}

			var count = 0

			mockFs.readFile = function(name, enc, cb) {
				this.file = name
				this.enc = enc
				
				// first read yields file with data
				if (count++ === 0)
					cb(null, '123')
				else
					cb(null, '')
			}

			pdb.on('remove', function (data) {
				data.should.eql([ '123' ])

				mockFs.file.should.equal(DB_FILE)
				mockFs.enc.should.equal('utf8')

				pdb._index.should.have.lengthOf(0)

				done()
			})

			pdb.init(function () {
				pdb._index.should.have.lengthOf(1)

				ee.emit('change', DB_FILE)							
			})
		})
	})


	describe.skip('integration', function () {
		it('inits', function (done) {
			var dbFile = path.join(__dirname, 'test.db')
			pdb = new PitifulDB(dbFile)

			pdb.init(function (err) {
				if (err) return done(err)


			})

			pdb.on('add', function (added) {
				console.log(added)
				console.log(pdb._index)
				done()
			})
		})
	})
})