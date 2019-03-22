const log = require('debug')('chat_serice:utils:redis');
const elog = require('debug')('chat_serice:error:utils:redis');
const config = require ('../config/config');
const redis = require('redis');
const winston = require('../utils/logger');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient([{db: config.REDIS_PRIMERY_DB}]);

client.on('ready' , ()=> {
	log('primery redis connection is ready');
});

client.on('connect', ()=> {
	log('primery redis connection is established');    
});

client.on('error', (e)=> {
	winston.error(`error in primery redis connection - ${e}`);
	elog('error in primery redis connection');
});

exports.client = client;
