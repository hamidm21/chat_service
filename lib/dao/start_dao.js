const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const {
	client,
	Sclient
} = require('../utils/redis');

exports.flushDB = async () => {
	try {
		await client.selectAsync(0);
		const flushed = await client.flushdb();
		// const fu = await Sclient.flushdb();
		redis_log('db flushed succesfully');
		return flushed;
	} catch (e) {
		winston.error('db flush has error');
	}
};