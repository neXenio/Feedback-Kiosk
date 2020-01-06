const crypto = require('crypto')
const uuidv4 = require('uuid/v4')

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
		return reward.verification === Reward.createHash(reward, secret)
	}

}

module.exports = Reward