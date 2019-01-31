const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const { client } = require('../utils/redis');


/**
 * getSenderIdBySocket get's the sender_id from redis by the given socket_id and room_id
 * @async
 * @param {ID} room_id - 
 */

exports.getSenderIdBySocket = async (room_id, socket_id) => {
	try {
		const sender_id = await client.hgetAsync(room_id, socket_id);
		redis_log(sender_id);
		return Promise.resolve(sender_id);
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		throw e;
	}
};