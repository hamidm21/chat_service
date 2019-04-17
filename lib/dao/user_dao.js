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
		const userSockets = await client.multi().select(REDIS_PRIMERY_DB).hkeys(user_id).execAsync();
		log({'getUserSocketsById result': userSockets});
		return Promise.resolve(userSockets[1]);
	} catch (e) {
		elog({'getUserSocketsById error': e});
		winston.error(`error in getUserSocketsById - ${e}`);
		return Promise.reject(e);
	}
};

exports.getUserRoomsById = async (user_id, socket_id) => {
	try {
		log({'getUserRoomsById data': user_id, socket_id});
		const userRooms = await client.multi().select(REDIS_PRIMERY_DB).hget(user_id, socket_id).execAsync();
		log({'getUserRoomsById result': userRooms});
		return Promise.resolve(JSON.parse(userRooms[1]));
	} catch (e) {
		elog({'getUserRoomsById error': e});
		winston.error(`error in  - ${e}`);
		return Promise.reject(e);
	}
};

exports.removeUserObject = async user_id => {
	try {
		log({'removeUserObject data': user_id});
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

exports.removeUserSocket = async (user_id, socket_id) => {
	try {
		log({'removeUserObject data': user_id, socket_id});
		await client.multi().select(REDIS_PRIMERY_DB).hdel(user_id, socket_id).execAsync();
		return Promise.resolve(true);
	} catch (e) {
		elog({'removeUserObject error': e});
		winston.error(`error in removeUserObject - ${e}`);
		return Promise.reject(e);
	}
};

exports.getSocketUniqueRooms = async (user_id, socket_id) => {
	try {
		log({
			'getSocketUniqueRooms data ': user_id, socket_id 
		});
		const rooms = await client.multi().
			select(REDIS_PRIMERY_DB).
			hget(user_id, socket_id).
			execAsync();
		const unique_rooms = [];
		for(const room of JSON.parse(rooms[1])) {
			const room_users = await client.multi().
				select(REDIS_PRIMERY_DB).
				hvals(room).
				execAsync();
			room_users[1].map(user => {if  (user === user_id) {
				log({
					userHasSocketInRoom: user
				});
			}else {
				unique_rooms.push(user);
			}});
		}
		log({
			'getSocketUniqueRooms result': unique_rooms
		});
		return Promise.resolve(unique_rooms);
	} catch (e) {
		elog({'getSocketUniqueRooms error ': e});
		return Promise.reject(e);
	}
};