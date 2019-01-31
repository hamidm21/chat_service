const winston = require('../utils/logger'); 
const redis_log = require('debug')('goftare:redis');
const {client} = require('../utils/redis');

exports.flushDB = async ()=> {
	try{
		const flushed = await client.flushdbAsync();
		redis_log('db flushed succesfully');
		return flushed;
	}catch(e){
		winston.error('db flush has error');
	} 
};