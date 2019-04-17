const log = require('debug')('chat_service:controller:chat');
const elog = require('debug')('chat_service:error:controller:chat');
const winston = require('../utils/logger');
const validator = require('../utils/validator');
const moment = require('moment-jalaali');
const mongoose = require('mongoose');
const {
	producer,
	km
} = require('../utils/kafka');
const chat_dao = require('../dao/chat_dao');
const room_dao = require('../dao/room_dao');
const config = require('../config/config');

/**
 * newMessage is the corresponding function for new_message socket 
 * @param {Object} io - socket io object   
 * @param {Object} socket - user socket object 
 * @param {Object} data - data object provided by the client side
 * @arg {String} text - the message text provided in data object
 * @arg {ID} room_id - room id provided in data object
 * @arg {Date} time - timestamp of message provided by data object 
 * @returns {String} successfully sent the message
 * @throws {Error} throws an exeption if kafka ro socket.io fail to deliver the message
 * @async
 */

exports.newMessage = async (io, socket, data, callback) => {
	const {
		text,
		room_id,
		primary_key,
		sender_id,
		creator_id
	} = data;
	try {
		log({'newMessage data': data});
		const valid = validator.joi.validate(data, validator.newMessage);
		if (valid.error) {
			elog({'newMessage validation error': valid.error});
			callback(Object.assign({}, config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const message_id = mongoose.Types.ObjectId();
			const incremental_id = await chat_dao.incrementId(room_id);
			log(incremental_id);
			const msg = {
				incremental_id,
				text,
				room_id,
				timestamp: new Date().getTime(),
				moment: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
				sender_id,
				creator_id,
				message_id,
				is_read: 1,
				type: 'text',
			};
			const keyedMessage = new km('newMessage', JSON.stringify(msg));
			msg.primary_key = primary_key || 1;
			log({'newMessage message': msg});
			producer.send([Object.assign({}, config.PAYLOAD, {
				messages: [keyedMessage]
			})], function (e, result) {
				if (e) {
					elog({'error in newMessage producer': e});
					winston.error(`error in newMessage producer ---- ${e.status || 500} ---- ${e.message} ---- ${e.stack} ---- ${new Date()}`);
					Promise.reject(e);
				} else {
					log({'newMessage producer result': result});
					// callback(Object.assign({}, config.RESPONSE, {
					// 	message: 'message has been sent successfully'
					// }));
					//TODO: brodcast in the future
					/**
					 * @memberof socket_handler - this is a backend event
					 * @event send_message
					 * @emits text - message text 
					 * @emits room_id - id of the room 
					 * @emits timestamp - just a fucking timestamp
					 * @emits moment - jalali momnet 
					 * @emits sender_id - id of the message sender
					 * @emits message_id - id of the sent message 
					 * @description - sends message to the given room
					 */
					callback(Object.assign({}, config.RESPONSE, {
						result: true,
						message: 'success',
						data: msg
					}));
					io.to(room_id).emit('send_message', Object.assign({}, config.RESPONSE, {
						message: 'successful',
						data: msg
					}));
				}
			});

		}
	} catch (e) {
		elog({'error in newMessage': e});
		winston.error(`error in newMessage - ${e.stack} `);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: 'error in newMessage',
			data: e
		}));
		// throw e;
	}
};


/**
 * isTypig is the corresponding function for is_typing socket
 * @param {Object} io - socket io object
 * @param {Object} data - data object provided by the client side
 * @arg {ID} room_id - room id provided by data object
 * @arg {Boolean} typing - indicates the user typing state provided by data object 
 * @returns {Id} returns the user id
 * @throws {Error} throws if socket can not emit to the room
 * @async
 */

exports.isTyping = async (io, socket, data, callback) => {
	const {
		room_id,
		typing
	} = data;
	try {
		log({'isTyping data': data});
		const valid = validator.joi.validate(data, validator.isTyping);
		if (valid.error) {
			elog({'isTyping validation error': valid.error});
			callback(Object.assign({}, config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const sender_id = await chat_dao.getSenderIdBySocket(room_id, socket.id);
			if (typing) {
				/**
				 * @memberof socket_handler - this is a backend event
				 * @event start_typing 
				 * @emits sender_id - typing user id
				 * @description - this event happens when a user is typing (0_0)
				 */
				log({'start_typing' : {sender_id, room_id}});
				io.to(room_id).emit('start_typing', Object.assign({}, config.RESPONSE, {
					message: 'start_typing',
					data: {
						sender_id,
						room_id
					}
				}));
			} else {
				/**
				 * @memberof socket_handler - this is a backend event
				 * @event stop_typing 
				 * @emits sender_id - typing user id
				 * @description - this event happens when a user is not typing (0_0)
				 */
				log({'stop_typing' : {sender_id, room_id}});
				io.to(room_id).emit('stop_typing', Object.assign({}, config.RESPONSE, {
					message: 'stop_typing',
					data: {
						sender_id,
						room_id
					}
				}));
			}
		}
	} catch (e) {
		elog({'error in isTyping': e});
		winston.error(`error in isTyping - ${e}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: 'error in isTyping',
			data: e
		}));
	}

};


/**
 * readMessage is the corresponding function for read_message socket
 * @param {Object} io - socket io object
 * @param {Object} data - data object provided by the client side
 * @arg {Number} offset - unique message kafka offset provided by data object
 * @arg {Date} time - timestamp of message provided by data object
 * @arg {ID} room_id - room id provided in data object
 * @arg {ID} receiver_id - id of receiver provided by data object
 */

exports.readMessage = async (io, socket, data, callback) => {
	const {
		message_id,
		room_id,
		receiver_id,
		sender_id
	} = data;
	try {
		log({'readMessage data': data});
		const valid = validator.joi.validate(data, validator.readMessage);
		if (valid.error) {
			elog({'readMessage validation error': valid.error});
			callback(Object.assign({}, config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			const sender_sockets = await room_dao.findSocketsById(sender_id, room_id);
			const keyedMessage = new km('readMessage', JSON.stringify({
				sender_id,
				receiver_id,
				room_id,
				message_id
			}));
			producer.send([Object.assign({}, config.PAYLOAD, {
				messages: [keyedMessage]
			})], function (e, result) {
				if (e) {
					elog({'error in readMessage producer': e});
					winston.error(`error in isRead producer - ${e}`);
					Promise.reject(e);
				} else {
					for (const sender_socket of sender_sockets) {
						/**
						 * @memberof socket_handler - this is a backend event
						 * @event read_message 
						 * @emits sender_id - id of the user who had sent the message
						 * @emits receiver_id - id of the user who had read the message 
						 * @emits room_id - id of the room 
						 * @emits message_id - mongo id of the message 
						 * @description - this event happens when a message is read by a user
						 */
						log({'readMessage producer result': result});
						callback(Object.assign({}, config.RESPONSE, {
							message: 'success',
							data: {
								room_id,
								message_id,
								is_read: 2
							}
						}));
						io.to(sender_socket).emit('read_message', Object.assign({}, config.RESPONSE, {
							data: {
								sender_id,
								receiver_id,
								room_id,
								message_id
							}
						}));
					}

				}
			});
		}
	} catch (e) {
		elog({'error in readMessage': e});
		winston.error(`error in readMessage - ${e}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: 'error in readMessage',
			data: e
		}));
	}
};


exports.notifySecretary = async (io, socket, data, callback) => {
	const {
		username,
		room_id
	} = data;
	try {
		log({'notifySecretary data': data});
		const valid = validator.joi.validate(data, validator.notifySecretary);
		if (valid.error) {
			elog({'readMessage validation error': valid.error});
			callback(Object.assign({}, config.RESPONSE, {
				result: false,
				message: 'input is not valid',
				data: valid.error
			}));
		} else {
			log({'notifySecretary result': username});
			callback(Object.assign({}, config.RESPONSE, {
				message: 'success'
			}));
			io.to(room_id).emit('read_message', Object.assign({}, config.RESPONSE, {
				data: {
					username				
				}
			}));
		}
	} catch (e) {
		elog({'error in notifySecretary': e});
		winston.error(`error in notifySecretary - ${e}`);
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: 'error in notifySecretary',
			data: e
		}));
	}
};