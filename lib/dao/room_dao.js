const winston = require('../utils/logger');
const log = require('debug')('chat_service:dao:room');
const elog = require('debug')('chat_service:error:dao:room');
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
		log({'joinSocket data': {room_id, socket_id, joined_id}});
		const pDB = await client.selectAsync(0);
		log({pDB});
		const joinedToRoom = await client.hsetAsync(room_id, socket_id, joined_id);
		const joinedToUser = await client.hsetAsync(joined_id, socket_id, room_id);
		log({'joinSocket result': {joinedToRoom, joinedToUser}});
		return Promise.resolve(true);
	} catch (e) {
		elog({'joinSocket error': e});
		winston.error(`error in join socket to the room - ${e}`);
		return Promise.reject(e);
	}
};

exports.getRoomMembersId = async room_id => {
	try {
		log({'getRoomMembersId data': room_id});
		const pDB = await client.selectAsync(0);
		log({pDB});
		const members = await client.hvalsAsync(room_id);
		if(members.lenght !== 0) {
			log({'getRoomMembersId result': members});
			return Promise.resolve(members);
		}
	} catch (e) {
		elog({'getRoomMembersId error': e});
		winston.error(`error in  - ${e}`);
		return Promise.reject(e);
	}
};


/**
 * removeSocketFromRoom
 */

exports.removeSocketFromRoom = async (rooms, socket_id) => {
	try {
		log({'removeSocketFromRoom data': {rooms, socket_id}});
		const pDB = await client.selectAsync(0);
		log({pDB});
		for (const room of rooms) {
			await client.hdelAsync(room, socket_id);
		}
		log({'removeSocketFromRoom result': rooms});
		return Promise.resolve(rooms);

	} catch (e) {
		elog({'removeSocketFromRoom error': e});
		winston.error(`error in remove socket from room - ${e}`);
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
// 		winston.error(`error in  - ${e}`);
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
// 		winston.error(`error in  - ${e}`);
// 		return Promise.reject(e);
// 	}
// };

exports.findSocketsById = async (id, room_id) => {
	try {
		log({'findSocketsById data': {id, room_id}});
		const pDB = await client.selectAsync(0);
		log({pDB});
		const hashmap = await client.hgetallAsync(room_id);
		const sockets = Object.keys(hashmap).filter(key => hashmap[key] === id);
		log({'findSocketsById result': sockets});
		return Promise.resolve(sockets);
	} catch (e) {
		elog({'findSocketsById error': e});
		winston.error(`error in findSocketsById - ${e}`);
		return Promise.reject(e);
	}
};