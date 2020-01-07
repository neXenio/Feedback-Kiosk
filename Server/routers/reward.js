const express = require('express')
const QRCodeEncoder = require('qrcode')
const QRCodeDecoder = require('qrcode-reader')
const Jimp = require("jimp")
const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const logger = require('../logger')
const Reward = require('../reward')

const rewardRouter = express.Router()

const SECRET_DEFAULT = 'change me!'
const SECRET = process.env.FEEDBACK_KIOSK_SECRET || SECRET_DEFAULT

// create rewards
rewardRouter.get('/', (request, response) => {
	const reward = new Reward(SECRET)
	logger.log('info', 'Created reward: ', reward)
	response.send(reward)
})

// verify rewards
rewardRouter.post('/', (request, response) => {
	const reward = request.body
	reward.isValid = Reward.isValid(reward, SECRET)

	if (reward.isValid) {
		logger.log('info', 'Reward is valid: ', reward)
	} else {
		logger.log('warn', 'Reward is invalid: ', reward)
	}
	
	response.json(reward)
})

// create QR code
rewardRouter.get('/qr', (request, response) => {
	const reward = new Reward(SECRET)
	logger.log('info', 'Created reward: ', reward)

	const rewardBuffer = Buffer.from(JSON.stringify(reward))
	const encodedReward = rewardBuffer.toString('base64')

	logger.log('verbose', `Encoded reward: ${encodedReward}`)

	const options = {
		type: 'png',
		width: 500
	}

	QRCodeEncoder.toDataURL(encodedReward, options, (error, dataURL) => {
		const buffer = Buffer.from(dataURL.split(",")[1], 'base64')
		response.contentType('image/png')
		response.send(buffer)
	})
})

/**
 * Accepts a file as 'multipart/form-data', reads it as an image and
 * tries to detect a QR code. The QR code data will be decoded, parsed to
 * an reward and verified.
 */
rewardRouter.post('/qr', upload.single('image'), (request, response) => {
	Jimp.read(request.file.buffer, (error, image) => {
		if (error) {
			throw error
		}

		const decoder = new QRCodeDecoder()
		decoder.callback = (error, result) => {
			if (error) {
				throw error
			}

			logger.log('verbose', `QR code data: ${result.result}`)

			const encodedReward = result.result
			const rewardBuffer = Buffer.from(encodedReward, 'base64')
			const reward = JSON.parse(rewardBuffer.toString('utf-8'))
			reward.isValid = Reward.isValid(reward, SECRET)

			logger.log('info', 'Parsed reward: ', reward)

			response.send(reward)
		}
		decoder.decode(image.bitmap);
	})
})

module.exports = rewardRouter