const log = require('debug')('chat_service:dao:chat');
const elog = require('debug')('chat_service:error:dao:chat');
const {REDIS_PRIMERY_DB, REDIS_SECONDARY_DB} = require('../config/config');
const winston = require('../utils/logger');
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
		log({'getSenderIdBySocket data': {room_id, socket_id}});
		const sender_id = await client.multi().select(REDIS_PRIMERY_DB).hget(room_id, socket_id).execAsync();
		log({'getSenderIdBySocket result': sender_id});
		return Promise.resolve(sender_id[1]);
	} catch (e) {
		elog({'getSenderIdBySocket error': e});
		winston.error(`getSenderIdBySocket error - ${e}`);
		return Promise.reject(e);
	}
};


exports.incrementId = async room_id => {
	try {
		log({'incrementId data': room_id});
		const result = await client.multi().select(REDIS_SECONDARY_DB).incr(room_id).execAsync();
		log({'incrementId result': result});
		return Promise.resolve(result[1]);
	} catch (e) {
		elog({'incrementId error': e});
		winston.error(`error in get incremental id - ${e.stack}- ${new Date()}`);
		Promise.reject(e);
	}
};