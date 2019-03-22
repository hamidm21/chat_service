const winston = require('../utils/logger');
const log = require('debug')('chat_service:dao:user');
const elog = require('debug')('chat_service:error:dao:user');
const {
	client
} = require('../utils/redis');


exports.getUserSocketsById = async user_id => {
	try {
		log({'getUserSocketsById data': user_id});
		const pDB = await client.selectAsync(0);
		log({pDB});
		const userSockets = await client.hkeysAsync(user_id);
		log({'getUserSocketsById result': userSockets});
		return Promise.resolve(userSockets);
	} catch (e) {
		elog({'getUserSocketsById error': e});
		winston.error(`error in getUserSocketsById - ${e}`);
		return Promise.reject(e);
	}
};

exports.getUserRoomsById = async user_id => {
	try {
		log({'getUserRoomsById data': user_id});
		const pDB = await client.selectAsync(0);
		log({pDB});
		const userRooms = await client.hvalsAsync(user_id);
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
		const pDB = await client.selectAsync(0);
		log({pDB});
		const sockets = await client.hkeysAsync(user_id);
		log({'removeUserObject result': sockets});
		for (const socket of sockets) {
			await client.hdelAsync(user_id, socket);
		}
		return Promise.resolve(true);
	} catch (e) {
		elog({'removeUserObject error': e});
		winston.error(`error in removeUserObject - ${e}`);
		return Promise.reject(e);
	}
};