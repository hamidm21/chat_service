const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const {
	client
} = require('../utils/redis');


exports.getUserSocketsById = async user_id => {
	try {
		const userSockets = await client.hkeysAsync(user_id);
		return Promise.resolve(userSockets);
	} catch (e) {
		winston.error(`error in getUserSocketsById - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};

exports.getUserRoomsById = async user_id => {
	try {
		const userRooms = await client.hvalsAsync(user_id);
		return Promise.resolve(userRooms);
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};

exports.removeUserObject = async user_id => {
	try {
		const sockets = await client.hkeysAsync(user_id);
		for (const socket of sockets) {
			await client.hdelAsync(user_id, socket);
		}
		return Promise.resolve(true);
	} catch (e) {
		winston.error(`error in removeUserObject - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};