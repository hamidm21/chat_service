/**
 * @module SOCKET_EVENTS 
 */
const log = require('debug')('chat_service:controller:room');
const elog = require('debug')('chat_service:error:controller:room');
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const {
	producer,
	km
} = require('../utils/kafka');
const mongoose = require('mongoose');
const moment = require('moment-jalaali');
const room_dao = require('../dao/room_dao');
const user_dao = require('../dao/user_dao');
const chat_dao = require('../dao/chat_dao');
const config = require('../config/config');

/**
 * joinRoom is the corresponding function for join_room socket
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
		room_id,
		joined_id
	} = data;
	try {
		log({
			'joinRoom data': data
		});
		socket.user_id = joined_id;
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
			const joined = await room_dao.joinSocket(room_id, socket.id, joined_id);
			const members = await room_dao.getRoomMembersId(room_id);
			if (members && joined) {
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
						members
					}
				}));
				callback(Object.assign({}, config.RESPONSE, {
					message: 'joined_room'
				}));
			} else
				callback(Object.assign({}, config.RESPONSE, {
					result: false,
					message: 'failed'
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
			const saveIncrementalId = await chat_dao.incrementId(_id);
			lastMessage.incremental_id = saveIncrementalId;

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

			// const created = await room_dao.saveRoom(room_id, sockets);
			log({
				'createRoom sockets to be notified': sockets
			});
			const keyedMessage = new km('newMessage', JSON.stringify(lastMessage));
			producer.send([Object.assign({}, config.PAYLOAD, {
				messages: [keyedMessage]
			})], function (e, result) {
				if (e) {
					elog({
						'error in createRoom producer': e
					});
					callback(Object.assign({}, config.RESPONSE, {
						result: false,
						message: 'kafka error',
						data: e
					}));
				} else {
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
								'createRoom lastMessage': lastMessage
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
								}
							}));
						}
						socket.join(_id);
						callback(Object.assign({}, config.RESPONSE, {
							message: 'room_created',
							data: lastMessage
						}));

					} else
						callback(Object.assign({}, config.RESPONSE, {
							result: false,
							message: 'failed to create the room by socket'
						}));
				}
			});
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


exports.isNew = async (io, socket, data, callback) => {

	const {
		room_id
	} = data;
	try {
		log({
			'isNew': data
		});
		const valid = validator.joi.validate(data, validator.isNew);
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
			const keyedMessage = new km('notNew', JSON.stringify({
				room_id
			}));
			producer.send([Object.assign({}, config.PAYLOAD, {
				messages: [keyedMessage]
			})], function (e, result) {
				if (e) {
					elog({
						'error in isNew producer': e
					});
					callback(Object.assign({}, config.RESPONSE, {
						result: false,
						message: 'kafka error',
						data: e
					}));
				} else {
					log({
						'isNew producer result': result
					});
					io.to(socket).emit('not_new', Object.assign({}, config.RESPONSE, {
						message: 'not new',
						data: {
							room_id
						}
					}));
				}
			});
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
		const userRooms = await user_dao.getUserRoomsById(socket.user_id);
		log({
			'discconecting user': socket.user_id,
			'disconnecting rooms': userRooms
		});
		if (userRooms.length !== 0) {
			await user_dao.removeUserObject(socket.user_id);
			const rooms = await room_dao.removeSocketFromRoom(userRooms, socket.id);
			for (const room of rooms) {
				/**
				 * @event module:SOCKET_EVENTS.event:disconnected
				 * @emits sender_id - id of the user who is disconnected
				 * @description - user is disconnecting  socket_io
				 */
				io.to(room).emit('disconnected', Object.assign({}, config.RESPONSE, {
					message: 'user disconnected',
					data: {
						sender_id: socket.user_id
					}
				}));
			}
		} else
			log({
				'a user with no room just left :|': socket.user_id
			});
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
		psychologist_id
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
			const keyedMessage = new km('choosePsychologist', JSON.stringify(data));
			producer.send([Object.assign({}, config.PAYLOAD, {
				messages: [keyedMessage]
			})], function(e, result) {
				if (e) {
					elog({'error in choosePsychologist producer': e});
					winston.error(`error in choosePsychologist producer - ${e}`);
					Promise.reject(e);
				} else {
					log({'choosePsychologist producer result': result});
					callback(Object.assign({}, config.RESPONSE, {
						message: 'success',
					}));
					io.to(room_id).emit('choose_psychologist', data);
				}
			});
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