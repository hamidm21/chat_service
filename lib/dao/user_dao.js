const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const { client } = require('../utils/redis');


exports.getUserSocketById = async (user_id) => {
	try {
		const userSockets = await client.hgetallAsync(user_id);
		redis_log(userSockets);
		return Promise.resolve(Object.keys(userSockets));
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};