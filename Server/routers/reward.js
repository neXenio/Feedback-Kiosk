const logger = require('../logger')
const Reward = require('../reward')
const rewardRouter = require('express').Router()

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
	if (Reward.isValid(reward, SECRET)) {
		logger.log('info', 'Reward is valid: ', reward)
		response.json(true)
	} else {
		logger.log('warn', 'Reward is invalid: ', reward)
		response.json(false)
	}
})

module.exports = rewardRouter