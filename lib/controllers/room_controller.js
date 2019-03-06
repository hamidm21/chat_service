/**
 * @module SOCKET_EVENTS 
 */
const kafka_log = require('debug')('goftare:kafka');
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const { producer, km } = require('../utils/kafka');
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
		socket.user_id = joined_id;
		const valid = validator.joi.validate(data, validator.joinRoom);
		if (valid.error) {
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
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: e.message,
			data: {
				e
			}
		}));
		winston.error(`error in joinRoom function ------\n ${e}\n ------\n ${new Date()}`);
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
		const valid = validator.joi.validate(data, validator.createRoom);
		if (valid.error) {
			callback(Object.assign(config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const sockets = [];

			const saved = await room_dao.joinSocket(_id, socket.id, creator_id);
			const saveIncrementalId = await chat_dao.incrementId(_id);
			kafka_log({saveIncrementalId});
			lastMessage.incremental_id = saveIncrementalId;

			if (saved) {
				for (const member of members) {
					const memberSockets = await user_dao.getUserSocketsById(member.user_id);
					kafka_log(memberSockets);
					for (const memberSocket of memberSockets) {
						sockets.push(memberSocket);
					}
				}
			}

			// const created = await room_dao.saveRoom(room_id, sockets);
			kafka_log('........................\n' + sockets + '\n.............................');
			const keyedMessage = new km('newMessage', JSON.stringify(lastMessage));
			producer.send([Object.assign(config.PAYLOAD, {
				messages: [keyedMessage]
			})], function (e, result) {
				if(e){
					callback(Object.assign({}, config.RESPONSE, {
						result: false,
						message: 'kafka error',
						data: e
					}));
				}else {
					kafka_log({result});
					if (sockets.length !== 0) {
						for (const socket of sockets) {
							/**
							 * @event module:SOCKET_EVENTS.event:new_room
							 * @emits _id - the room id
							 * @emits members - new room members
							 * @description - this event indicates that a new room is
							 *  created and is supposed to emit a "join_room" after reciving 
							 */
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
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: e.message,
			data: e
		}));
		winston.error(`error in joinRoom function - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
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
		kafka_log({'discconecting from room': userRooms});
		if(userRooms.length !== 0 ){
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
		}else
			kafka_log('user with no room discconnectred' + socket.user_id);
	} catch (e) {
		winston.error(`error in disconnect - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		Promise.reject(e);
	}
};