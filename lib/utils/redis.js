const redis_log = require('debug')('goftare:redis');
const config = require ('../config/config');
const redis = require('redis');
const winston = require('../utils/logger');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient([{db: config.REDIS_PRIMERY_DB}]);
// const Sclient = redis.createClient([{db: config.REDIS_SECONDARY_DB}]);

client.on('ready' , ()=> {
	redis_log('primery redis connection is ready');
});

client.on('connect', ()=> {
	redis_log('primery redis connection is established');    
});

client.on('error', (e)=> {
	winston.error(`error in primery redis connection - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
});


// Sclient.on('ready' , ()=> {
// 	redis_log('secondary redis connection is ready');
// });

// Sclient.on('connect', ()=> {
// 	redis_log('secondary redis connection is established');    
// });

// Sclient.on('error', (e)=> {
// 	winston.error(`error in secondary redis connection - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
// });

exports.client = client;
// exports.Sclient = Sclient;
