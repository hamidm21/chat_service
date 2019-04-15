const winston = require('../utils/logger');
const log = require('debug')('chat_service:dao:user');
const elog = require('debug')('chat_service:error:dao:user');
const {REDIS_PRIMERY_DB} = require('../config/config');
const {
	client
} = require('../utils/redis');


exports.getUserSocketsById = async user_id => {
	try {
		log({'getUserSocketsById data': user_id});
		// const pDB = await client.selectAsync(0);
		// log({pDB});
		const userSockets = await client.multi().select(REDIS_PRIMERY_DB).hkeys(user_id).execAsync();
		log({'getUserSocketsById result': userSockets});
		return Promise.resolve(userSockets[1]);
	} catch (e) {
		elog({'getUserSocketsById error': e});
		winston.error(`error in getUserSocketsById - ${e}`);
		return Promise.reject(e);
	}
};

exports.getUserRoomsById = async user_id => {
	try {
		log({'getUserRoomsById data': user_id});
		// const pDB = await client.selectAsync(0);
		// log({pDB});
		const userRooms = await client.multi().select(REDIS_PRIMERY_DB).hvals(user_id).execAsync();
		log({'getUserRoomsById result': userRooms});
		return Promise.resolve(userRooms);
	} catch (e) {
		elog({'getUserRoomsById error': e});
		winston.error(`error in  - ${e}`);
		return Promise.reject(e);
	}
};

exports.removeUserObject = async user_id => {
	try {
		log({'removeUserObject data': user_id});
		// const pDB = await client.selectAsync(0);
		// log({pDB});
		const sockets = await client.multi().select(REDIS_PRIMERY_DB).hkeys(user_id).execAsync();
		log({'removeUserObject result': sockets});
		for (const socket of sockets[1]) {
			await client.multi().select(REDIS_PRIMERY_DB).hdel(user_id, socket).execAsync();
		}
		return Promise.resolve(true);
	} catch (e) {
		elog({'removeUserObject error': e});
		winston.error(`error in removeUserObject - ${e}`);
		return Promise.reject(e);
	}
};