const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const {
	client
} = require('../utils/redis');

exports.flushDB = async () => {
	try {
		await client.selectAsync(0);
		const flushed = await client.flushdb();
		// const fu = await Sclient.flushdb();
		redis_log('db flushed succesfully');
		return flushed;
	} catch (e) {
		winston.error('db flush has error'+ e);
	}
};


exports.getLastCommitedOffset = async () => {
	try {
		await client.selectAsync(1);
		const lastOffset = await client.getAsync('lastOffset');
		Promise.resolve(lastOffset);
	} catch (e) {
		winston.error('get last commited offset has errors' + e);
	}
};