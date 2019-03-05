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
		redis_log({room_id, joined_id, socket_id});
		const joinedToRoom = await client.hmsetAsync(room_id, socket_id, joined_id);
		const joinedToUser = await client.hmsetAsync(joined_id, socket_id, room_id);
		redis_log({joinedToRoom, joinedToUser});
		return Promise.resolve(true);
	} catch (e) {
		winston.error(`error in join socket to the room - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		return Promise.reject(e);
	}
};

exports.getRoomMembersId = async (room_id) => {
	try {
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
		// redis_log({rooms, socket_id});
		// const sender_id = await client.hgetAsync(rooms[0], socket_id);
		// redis_log({rooms});
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


exports.findSocketsById = async (id, room_id) => {
	try {
		const hashmap = await client.hgetallAsync(room_id);
		const sockets = Object.keys(hashmap).filter(key => hashmap[key] === id);
		redis_log(sockets);

		return Promise.resolve(sockets);

	} catch (e) {
		return Promise.reject(e);
	}
};