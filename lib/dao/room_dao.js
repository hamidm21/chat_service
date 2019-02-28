const winston = require('../utils/logger');
const redis_log = require('debug')('goftare:redis');
const {
	Pclient
} = require('../utils/redis');


/**
 * joinSocketToRoom saves a hashmap with the room id as a key and 
 * key value pairs of socket id(key) : sender id(velue)
 * @async
 * @param {ID} room_id - room_id 
 * @arg {ID} socket_id - socket_id
 * @arg {ID} joined_id - joined_id
 * @returns {Object} joined socket_ids in room
 * @throws {Error} redis error
 */

exports.joinSocketToRoom = async (room_id, socket_id, joined_id) => {
	try {
		const joinedToRoom = await Pclient.hmsetAsync(room_id, [socket_id, joined_id]);
		const joinedToUser = await Pclient.hmsetAsync(joined_id, [socket_id, room_id]);
		if (joinedToRoom && joinedToUser) {
			const members = await Pclient.hlenAsync(room_id);
			if (members !== 0) {
				const roomMembers = await Pclient.hvalsAsync(room_id);
				redis_log(roomMembers);
				return Promise.resolve(roomMembers);
			} else
				return Promise.resolve(joinedToRoom);
		} else
			winston.error(`error in saving socket in redis - ${new Date()}`);
	} catch (e) {
		winston.error(`error in join socket to the room - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		throw e;
	}
};


/**
 * removeSocketFromRoom
 */

exports.removeSocketFromRoom = async (rooms, socket_id) => {
	try {
		const sender_id = await Pclient.hgetAsync(rooms[0], socket_id);
		redis_log(rooms);
		for (const room of rooms) {
			const removedSocket = await Pclient.hdelAsync(room, socket_id);
			redis_log(removedSocket);
		}
		return Promise.resolve({
			sender_id: sender_id,
			rooms: rooms
		});

	} catch (e) {
		winston.error(`error in  - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		throw e;
	}
};


exports.findSocketsById = async (id, room_id) => {
	try {
		const hashmap = await Pclient.hgetallAsync(room_id);
		const sockets = Object.keys(hashmap).filter(key => hashmap[key] === id);
		redis_log(sockets);

		return Promise.resolve(sockets);

	} catch (e) {
		throw e;
	}
};