const socketio = require('socket.io')
const logger = require('./logger')

const socket = (server) => {
	
	const io = socketio(server)

	io.on('connection', (socket) => {

		logger.log('debug', `Socket connected: ${socket.id}`)

		socket.on('disconnect', (reason) => {
			logger.log('debug', `Socket disconnected: ${socket.id}`)
		})

		socket.on('error', (error) => {
			logger.log('warn', 'Socket error: ', error)
		})

	})

	this.onFeedbackReceived = (request) => {
		io.emit('feedback-received', request)
	}

	return this
}

module.exports = socket