const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const {
	client
} = require('../utils/redis');


/**
 * joinSocket saves a hashmap with the room id as a key and 
 * key value pairs of socket id(key) : sender id(velue)
 * @async
 * @param {ID} room_id - room_id 
 * @arg {ID} socket_id - socket_id
 * @arg {ID} joined_id - joined_id
 * @returns {Object} joined socket_ids in room
 * @throws {Error} redis error
 */

exports.joinSocket = async (room_id, socket_id, joined_id) => {
	try {
		const pDB = await client.selectAsync(0);
		redis_log({pDB});
		const joinedToRoom = await client.hsetAsync(room_id, socket_id, joined_id);
		const joinedToUser = await client.hsetAsync(joined_id, socket_id, room_id);
		redis_log({joinedToRoom, joinedToUser});
		return Promise.resolve(true);
	} catch (e) {
		winston.error(`error in join socket to the room - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};

exports.getRoomMembersId = async (room_id) => {
	try {
		const pDB = await client.selectAsync(0);
		redis_log({pDB});
		const members = await client.hvalsAsync(room_id);
		if(members.lenght !== 0) {
			return Promise.resolve(members);
		}
	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};


/**
 * removeSocketFromRoom
 */

exports.removeSocketFromRoom = async (rooms, socket_id) => {
	try {
		const pDB = await client.selectAsync(0);
		redis_log({pDB});
		for (const room of rooms) {
			const removedSocket = await client.hdelAsync(room, socket_id);
			redis_log(removedSocket);
		}
		return Promise.resolve(rooms);

	} catch (e) {
		winston.error(`error in remove socket from room - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};


// exports.saveIsNew = async room_id => {
// 	try {
// 		const sDB = await client.selectAsync(1);
// 		redis_log({sDB});
// 		const saved = await client.hsetAsync('isNew', room_id, true);
// 		Promise.resolve(saved);
// 	} catch (e) {
// 		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
// 		return Promise.reject(e);
// 	}
// };

// exports.deleteIsNew = async room_id => {
// 	try {
// 		const sDB = await client.selectAsync(1);
// 		redis_log({sDB});
// 		const saved = await client.hdelAsync('isNew', room_id);
// 		Promise.resolve(saved);
// 	} catch (e) {
// 		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
// 		return Promise.reject(e);
// 	}
// };

exports.findSocketsById = async (id, room_id) => {
	try {
		const pDB = await client.selectAsync(0);
		redis_log({pDB});
		const hashmap = await client.hgetallAsync(room_id);
		const sockets = Object.keys(hashmap).filter(key => hashmap[key] === id);
		redis_log(sockets);

		return Promise.resolve(sockets);

	} catch (e) {
		return Promise.reject(e);
	}
};