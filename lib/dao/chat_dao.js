const log = require('debug')('chat_service:dao:chat');
const elog = require('debug')('chat_service:error:dao:chat');
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
		const pDB = await client.selectAsync(0);
		log({pDB});
		const sender_id = await client.hgetAsync(room_id, socket_id);
		log({'getSenderIdBySocket result': sender_id});
		return Promise.resolve(sender_id);
	} catch (e) {
		elog({'getSenderIdBySocket error': e});
		winston.error(`getSenderIdBySocket error - ${e}`);
		return Promise.reject(e);
	}
};


exports.incrementId = async room_id => {
	try {
		log({'incrementId data': room_id});
		const sDB = await client.selectAsync(1);
		log({sDB});
		const result = await client.incrAsync(room_id);
		log({'incrementId result': result});
		return Promise.resolve(result);
	} catch (e) {
		elog({'incrementId error': e});
		winston.error(`error in get incremental id - ${e.stack}- ${new Date()}`);
		Promise.reject(e);
	}
};