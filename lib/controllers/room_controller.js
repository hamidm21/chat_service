/**
 * @module SOCKET_EVENTS 
 */
const log = require('debug')('chat:controller:room');
const elog = require('debug')('chat:error:controller:room');
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const kafka = require('../handlers/kafka_handler');
const room_dao = require('../dao/room_dao');
const user_dao = require('../dao/user_dao');
const chat_dao = require('../dao/chat_dao');
const config = require('../config/config');

/**
 * joinRoom is the corresponding fuconstnction for join_room socket
 * @param {Object} io - socket io object   
 * @param {Object} socket - user socket object 
 * @param {Object} data - data object provided by the client side
 * @arg {ID} room_id - room id provided by data object
 * @arg {ID} joined_id - id of the joined member provided by data object
 * @returns {callback} successful if user successfully join the room
 * @emits object - containes the joined user id and members inside the room
 * @throws {emit} to emit errors in the future
 * @description
 * takes a user's id and socket_id then joines it into the redis room and socket io room also saves the user socket in redis 
 * @async
 */

exports.joinRoom = async (io, socket, data, callback) => {
	const {
		room_id
	} = data;
	try {
		log({
			'joinRoom data': data
		});
		const joined_id = socket.handshake.query.user_id;
		const valid = validator.joi.validate(data, validator.joinRoom);
		if (valid.error) {
			elog({
				'joinRoom validation error': valid.error
			});
			callback(Object.assign({}, config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			await room_dao.joinSocket(room_id, socket.id, joined_id);
			const members = await room_dao.getRoomMembersId(room_id);
			socket.join(room_id);
			/**
			 * @event module:SOCKET_EVENTS.event:joined_room
			 * @emits joined_id - the joined user id
			 * @emits members - the array of members objects
			 * @description the answer of the join room is an event named joined_room
			 *  which gives back the joined id and the "online" members 
			 */
			log({
				'joined_room': {
					joined_id,
					members
				}
			});
			io.to(room_id).emit('joined_room', Object.assign({}, config.RESPONSE, {
				message: 'successful',
				data: {
					joined_id,
					members,
					room_id
				}
			}));
			callback(Object.assign({}, config.RESPONSE, {
				message: 'joined_room',
				data: members
			}));
		}
	} catch (e) {
		elog({
			'error in joinRoom': e
		});
		winston.error(`error in joinRoom function ------\n ${e}\n ------\n ${new Date()}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: e.message,
			data: {
				e
			}
		}));
	}
};
exports.createRoom = async (io, socket, data, callback) => {

	const {
		_id,
		members,
		title,
		avatar,
		creator_id,
		type,
		state,
		unreadMessages,
		lastMessage,
		owner_id,
		is_new,
		suggested_psychologist,
		is_paid,
		isActive
	} = data;
	try {
		log({
			'createRoom': data
		});
		const valid = validator.joi.validate(data, validator.createRoom);
		if (valid.error) {
			elog({
				'createRoom validation error': valid.error
			});
			callback(Object.assign(config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const sockets = [];

			const saved = await room_dao.joinSocket(_id, socket.id, creator_id);
			const notifyIncrId = await chat_dao.incrementId(_id);
			const autoIncrId = await chat_dao.incrementId(_id);
			lastMessage[0].incremental_id = notifyIncrId;
			lastMessage[1].incremental_id = autoIncrId;
			if (saved) {
				for (const member of members) {
					const memberSockets = await user_dao.getUserSocketsById(member.user_id);
					log({
						memberSockets
					});
					for (const memberSocket of memberSockets) {
						sockets.push(memberSocket);
					}
				}
			}
			log({
				'createRoom sockets to be notified': sockets
			});
			const result = await kafka.produce(config.TOPICS.API, 'newMessage', lastMessage[0], lastMessage[1]);
			if (sockets.length !== 0) {
				for (const socket of sockets) {
					/**
							 * @event module:SOCKET_EVENTS.event:new_room
							 * @emits _id - the room id
							 * @emits members - new room members
							 * @description - this event indicates that a new room is
							 *  created and is supposed to emit a "join_room" after reciving 
							 */
					log({
						'createRoom producer result': result
					});
					io.to(socket).emit('new_room', Object.assign({}, config.RESPONSE, {
						message: 'new_room',
						data: {
							_id,
							members,
							title,
							avatar,
							creator_id,
							type,
							state,
							unreadMessages,
							lastMessage,
							owner_id,
							is_new,
							suggested_psychologist,
							is_paid,
							isActive
						}
					}));
				}
				socket.join(_id);
				callback(Object.assign({}, config.RESPONSE, {
					message: 'room_created',
					data: {
						lastMessage
					}
				}));

			} else
				callback(Object.assign({}, config.RESPONSE, {
					result: false,
					message: 'failed to create the room by socket'
				}));
		}
	} catch (e) {
		elog({
			'error in createRoom': e
		});
		winston.error(`error in createRoom function - ${e}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: e.message,
			data: e
		}));
	}
};


exports.notNew = async (io, socket, data, callback) => {

	const {
		room_id
	} = data;
	try {
		log({
			'notNew': data
		});
		const valid = validator.joi.validate(data, validator.notNew);
		if (valid.error) {
			elog({
				'isNew validation error': valid.error
			});
			callback(Object.assign(config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const result = await kafka.produce(config.TOPICS.API, 'notNew', {room_id});
			log({
				'isNew producer result': result
			});
			io.to(room_id).emit('not_new', Object.assign({}, config.RESPONSE, {
				message: 'not new',
				data: {
					room_id
				}
			}));
		}
	} catch (e) {
		elog({
			'error in isNew': e
		});
		winston.error(`error in  - ${e}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: e.message,
			data: e
		}));
	}
};
/**
 * disconnecting is the corresponding function for disconneting socket 
 * @param {Object} io - socket io object   
 * @param {Object} socket - user socket object
 * @arg {ID[]} rooms - takes the joined rooms for the disconnecting user from socket object
 * @emits sender_id - id of the disconnecting user
 * @throws {emit} to emit errors in the future
 * @async
 */

exports.disconnecting = async (io, socket) => {
	// const rooms = Object.keys(socket.rooms).filter(room => typeof room === 'string' && !!room && room.length != 20);
	try {
		// const userRoom = await user_dao.getUserRoomsById(socket.handshake.query.user_id, socket.id);
		const userSockets = await user_dao.getUserSocketsById(socket.handshake.query.user_id);
		log({
			'discconecting user': socket.handshake.query.user_id,
			'disconnecting room': userSockets
		});
		switch (userSockets.length) {
		case 0:
			log({
				'a user with no socket just left :|': socket
			});
			break;
		case 1: {
			const rooms = await user_dao.getUserRoomsById(socket.handshake.query.user_id, socket.id);
			await room_dao.removeSocketFromRooms(rooms, socket.id);
			await user_dao.removeUserObject(socket.handshake.query.user_id);
			for (const room of rooms) {
				/**
				 * @event module:SOCKET_EVENTS.event:disconnected
				 * @emits sender_id - id of the user who is disconnected
				 * @description - user is disconnecting  socket_io
				 */
				log({'emit this room for a disconnected user': room});
				socket.broadcast.to(room).emit('disconnected', Object.assign({}, config.RESPONSE, {
					message: 'user disconnected',
					data: {
						sender_id: socket.handshake.query.user_id,
						room_id: room
					}
				}));
			}
			break;
		}
		default: {
			const rooms = await user_dao.getUserRoomsById(socket.handshake.query.user_id, socket.id);
			log({rooms});
			await room_dao.removeSocketFromRooms(rooms, socket.id);
			await user_dao.removeUserSocket(socket.handshake.query.user_id, socket.id);
			for(const room of rooms) {
				socket.broadcast.to(room).emit('disconnected', Object.assign({}, config.RESPONSE, {
					message: 'user disconnected',
					data: {
						sender_id: socket.handshake.query.user_id,
						room_id: room
					}
				}));
			}
			break;
		}
		}
	} catch (e) {
		elog({
			'error in disconneting': e
		});
		winston.error(`error in disconnect - ${e}`);
	}
};

exports.choosePsychologist = async (io, socket, data, callback) => {
	const {
		room_id,
		psychologist_id,
		psychologist_username
	} = data;
	try {
		log({'choosePsychologist data': data});
		const valid = validator.joi.validate(data, validator.choosePsychologist);
		if (valid.error) {
			elog({'choosePsychologist validation error': valid.error});
			callback(Object.assign({}, config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const result = await kafka.produce(config.TOPICS.API, 'choosePsychologist', {
				room_id,
				psychologist_id,
				psychologist_username
			});
			log({'choosePsychologist producer result': result});
			callback(Object.assign({}, config.RESPONSE, {
				message: 'success',
				data: {
					room_id,
					psychologist_id,
					psychologist_username
				}
			}));
			io.to(room_id).emit('choose_psychologist', Object.assign({}, config.RESPONSE, {
				data: {
					room_id,
					psychologist_id,
					psychologist_username
				}
			}));
		}
	} catch (e) {
		elog({'error in choosePsychologist': e});
		winston.error(`error in isTyping - ${e}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: 'error in choosePsychologist'
		}));
	}
};


exports.expireTransaction = async (io, socket, data, callback) => {
	const {
		room_id,
		user_id
	} = data;
	try {
		log({
			'expireTransaction data': data
		});
		const valid = validator.joi.validate(data, validator.expireTransaction);
		if (valid.error) {
			elog({
				'isNew validation error': valid.error
			});
			callback(Object.assign(config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const result = await kafka.produce(config.TOPICS.PAY, 'expireTransaction', {
				room_id,
				user_id
			});
			log({'expireTransaction producer': result});
			callback(Object.assign(config.RESPONSE, {
				message: 'success'
			}));
			io.to(room_id).emit('expire_transaction', Object.assign({}, config.RESPONSE, {
				data: {
					room_id,
					user_id
				}
			}));
		}
	} catch (e) {
		elog({'error in expireTransaction': e});
		winston.error(`error in expireTransaction - ${e}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: 'error in expireTransaction'
		}));
	}
};