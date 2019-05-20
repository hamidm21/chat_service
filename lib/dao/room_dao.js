const winston = require('../utils/logger');
const log = require('debug')('chat:dao:room');
const elog = require('debug')('chat:error:dao:room');
const {REDIS_PRIMERY_DB} = require('../config/config');
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
		const joined = await client.multi().
			select(REDIS_PRIMERY_DB).
			hget(joined_id, socket_id).
			execAsync();
		log({'the rooms in redis before join new ones': joined});
		// log({'parsed string' : JSON.parse(joined[1])});
		const rooms = joined[1] && typeof JSON.parse(joined[1]) === 'object' ? JSON.stringify(JSON.parse(joined[1]).concat(room_id)): JSON.stringify(Array(room_id));
		const join = await client.multi().
			select(REDIS_PRIMERY_DB).
			hset(room_id, socket_id, joined_id).
			hset(joined_id, socket_id, rooms).
			execAsync();
		log({'joinSocket result': {joinedToRoom: join[1], joinedToUser: join[2]}});
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
		
		const members = await client.multi().select(REDIS_PRIMERY_DB).hvals(room_id).execAsync();
		if(members.lenght !== 0) {
			log({'getRoomMembersId result': members});
			return Promise.resolve(members[1]);
		}
	} catch (e) {
		elog({'getRoomMembersId error': e});
		winston.error(`error in  - ${e}`);
		return Promise.reject(e);
	}
};


/**
 * removeSocketFromRooms
 */

exports.removeSocketFromRooms = async (rooms, socket_id) => {
	try {
		log({'removeSocketFromRooms data': {rooms, socket_id}});
		for (const room of rooms) {
			await client.multi().select(REDIS_PRIMERY_DB).hdel(room, socket_id).execAsync();
			log({'socket removed from this room _____________': room});
		}
		log({'removeSocketFromRooms result': rooms});
		return Promise.resolve(rooms);

	} catch (e) {
		elog({'removeSocketFromRooms error': e});
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

exports.findSocketsById = async (sender_id, room_id) => {
	try {
		log({'findSocketsById data': {sender_id, room_id}});
		const hashmap = await client.multi().select(REDIS_PRIMERY_DB).hgetall(room_id).execAsync();
		log({'test find socket ': hashmap});
		const sockets = Object.keys(hashmap[1]).filter(key => hashmap[1][key] == sender_id);
		log({'findSocketsById result': sockets});
		return Promise.resolve(sockets);
	} catch (e) {
		elog({'findSocketsById error': e});
		winston.error(`error in findSocketsById - ${e}`);
		return Promise.reject(e);
	}
};