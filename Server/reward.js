const crypto = require('crypto')
const uuidv4 = require('uuid/v4')
const logger = require('./logger')

class Reward {

	constructor(secret) {
		this.id = uuidv4()
		this.timestamp = Date.now()
		this.verification = Reward.createHash(this, secret)
	}

	static createHash(reward, secret) {
		return crypto.createHash('sha256')
			.update(`${reward.id}|${reward.timestamp}|${secret}`)
			.digest('hex')
	}

	static isValid(reward, secret) {
		const hash = Reward.createHash(reward, secret)
		logger.log('debug', `Verifying reward: ${reward.id}\n- Expected: ${reward.verification}\n- Actual:   ${hash}`)
		return reward.verification === hash
	}

}

module.exports = Reward