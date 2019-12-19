const winston = require('winston')
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const socketio = require('./socket')
const logger = require('./logger')

const CONFIG_PATH_DEFAULT = 'feedback-kiosk.conf'
const CONFIG_PATH = process.env.FEEDBACK_KIOSK_CONFIG || CONFIG_PATH_DEFAULT

const STATUS_CODE_SUCCESS = 200
const STATUS_CODE_UNAUTHORIZED = 401
const STATUS_CODE_ERROR = 500

const PORT = 8080

const app = express()
const server = http.createServer(app)
const socket = socketio(server)

/**
 * Reads the configuration JSON from the filesystem.
 */
function getConfigFromFile(path) {
	if (fs.existsSync(path)) {
		const configFileContents = fs.readFileSync(path, 'utf8')
		const config = JSON.parse(configFileContents)
		logger.log('info', `Parsed config from file: ${path}`, config)
		return config
	} else {
		logger.log('warn', `Using default config, no file avaialble at: ${path}`)
		return {
			// TODO: create default config
		}
	}
}

// restore config
const config = getConfigFromFile(CONFIG_PATH)

// setup body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// handle authentication requests
app.post('/feedback', (request, response) => {
	logger.log('verbose', 'Received feedback request body: ', request.body)
})

// handle unexpected errors
app.use((error, request, response, next) => {
	logger.log('error', 'Unexpected error: ', error)
	socket.onAuthenticationError(request.body)
	response.status(STATUS_CODE_ERROR)
	response.send(error.message);
})

// serve static directory
app.use(express.static(path.join(__dirname, 'static')))

// start listening
server.listen(PORT, () => logger.log('info', `Listening on port ${PORT}`))
