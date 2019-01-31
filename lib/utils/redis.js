const redis_log = require('debug')('goftare:redis');
const redis = require('redis');
const winston = require('../utils/logger');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient();

client.on('ready' , ()=> {
	redis_log('redis connection is ready');
});

client.on('connect', ()=> {
	redis_log('redis connection is established');    
});

client.on('error', (error)=> {
	winston.error(`error in redis connection - ${error.status || 500} - ${error.message} - ${error.stack} - ${new Date()}`);
});


exports.client = client;
