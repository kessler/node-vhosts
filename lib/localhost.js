var connect = require('connect')

module.exports = connect().use(function(request, response) {
	response.end('ok')
})

