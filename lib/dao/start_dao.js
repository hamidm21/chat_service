const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const {
	Pclient
} = require('../utils/redis');

exports.flushDB = async () => {
	try {
		const flushed = await Pclient.flushdb();
		redis_log('db flushed succesfully');
		return flushed;
	} catch (e) {
		winston.error('db flush has error');
	}
};