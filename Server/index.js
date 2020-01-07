const winston = require('winston')
const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const ua = require('universal-analytics')
const uuidv4 = require('uuid/v4')
const socketio = require('./socket')
const logger = require('./logger')

const CONFIG_PATH_DEFAULT = './feedback-kiosk-config.json'
const CONFIG_PATH = process.env.FEEDBACK_KIOSK_CONFIG || CONFIG_PATH_DEFAULT

const STATUS_CODE_SUCCESS = 200
const STATUS_CODE_UNAUTHORIZED = 401
const STATUS_CODE_ERROR = 500

const PORT = 3001

const app = express()
const server = http.createServer(app)
const socket = socketio(server)

const apiRouter = express.Router()
const rewardRouter = require('./routers/reward')

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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ type: 'application/json' }))

// set CORS headers
app.use(cors())
app.options('*', cors())

// handle unexpected errors
app.use((error, request, response, next) => {
	logger.log('error', 'Unexpected error: ', error)
	response.status(STATUS_CODE_ERROR)
	response.send(error.message);
})

// serve static directory
app.use(express.static(path.join(__dirname, 'static')))

// provide current config
apiRouter.get('/config', (request, response) => {
	response.status(STATUS_CODE_SUCCESS)
	response.json(config)
})

// handle feedback
apiRouter.post('/feedback', (request, response) => {
	logger.log('verbose', 'Received feedback request body: ', request.body)
	socket.onFeedbackReceived(request.body)

	var selectedOption = request.body.selectedOption
	if (!selectedOption.path) {
		selectedOption.path = `${config.id}/${selectedOption.id}/`
	}

	if (config.analyticsId) {
		// initialze analytics for session
		const analytics = ua(config.analyticsId, {
			uid: request.body.sessionId || uuidv4()
		})

		// track pageview
		const pageViewParameters = {
			dp: `/feedback/${selectedOption.path}`, // path
			dt: selectedOption.name, // title
			dh: 'https://github.com/neXenio/Feedback-Kiosk' // hostname
		}
		analytics.pageview(pageViewParameters).send();

		// track event
		const eventParameters = {
			ec: config.id, // category
			ea: selectedOption.id, // action
			el: selectedOption.name, // label
		}
		analytics.event(eventParameters).send()
	} else {
		logger.log('warn', `Not using analytics, no ID specified in config field 'analyticsId'`)
	}

	response.sendStatus(STATUS_CODE_SUCCESS)
})

apiRouter.use('/reward', rewardRouter)
app.use(['/api', ''], apiRouter)

// start listening
server.listen(PORT, () => logger.log('info', `Listening on port ${PORT}`))
