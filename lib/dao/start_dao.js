const winston = require('../utils/logger');
const log = require('debug')('chat:dao:start');
const elog = require('debug')('chat:error:dao:start');
const {
	client
} = require('../utils/redis');

exports.flushDB = async () => {
	try {
		await client.selectAsync(0);
		const flushed = await client.flushdb();
		log('db flushed succesfully');
		return flushed;
	} catch (e) {
		elog('error while flushing db');
		winston.error('db flush has error'+ e);
	}
};


exports.getLastCommitedOffset = async () => {
	try {
		await client.selectAsync(1);
		const lastOffset = await client.getAsync('lastOffset');
		Promise.resolve(lastOffset);
	} catch (e) {
		elog('error while getting the last commited offset');
		winston.error('get last commited offset has errors' + e);
	}
};