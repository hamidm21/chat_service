const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const {
	client
} = require('../utils/redis');


/**
 * getSenderIdBySocket get's the sender_id from redis by the given socket_id and room_id
 * @async
 * @param {ID} room_id - 
 */

exports.getSenderIdBySocket = async (room_id, socket_id) => {
	try {
		const sender_id = await client.hgetAsync(room_id, socket_id);
		return Promise.resolve(sender_id);
	} catch (e) {
		winston.error(`error in getSenderIdBySocket  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};


// exports.saveIncrementalId = async room_id => {
// 	try {
// 		const saved = await Sclient.setAsync(room_id, 0);
// 		Promise.resolve(saved);
// 	} catch (e) {
// 		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
// 		Promise.reject(e);
// 	}
// };

exports.incrementId = async room_id => {
	try {
		const result = await client.incrAsync(room_id);
		if(result) {
			redis_log({result});
		}
		const incremented_id = await client.getAsync(room_id);
		return Promise.resolve(incremented_id);
	} catch (e) {
		winston.error(`error in get incremental id - ${e.stack}- ${new Date()}`);
		Promise.reject(e);
	}
};