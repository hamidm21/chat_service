const kafka_log = require('debug')('goftare:kafka');
const winston = require('../utils/logger');
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

exports.newMessage = async (io, socket, message) => {
	const {
		text,
		room_id
	} = message;
	try {
		const message_id = mongoose.Types.ObjectId();
		const sender_id = await chat_dao.getSenderIdBySocket(room_id, socket.id);
		const msg = {
			text,
			room_id,
			time: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
			sender_id,
			message_id
		};
		const keyedMessage = new km('newMessage', JSON.stringify(msg));
		kafka_log(`............................${JSON.stringify(keyedMessage)}`);
		producer.send([Object.assign(config.PAYLOAD, {
			messages: [keyedMessage]
		})], function (e, result) {
			if (e) {
				winston.error(`error in newMessage producer ---- ${e.status || 500} ---- ${e.message} ---- ${e.stack} ---- ${new Date()}`);
				throw e;
			} else {
				kafka_log(result);
				io.to(room_id).emit('send_message', Object.assign({}, config.RESPONSE, {
					message: 'successful',
					data: msg
				}));
			}
		});

	} catch (e) {
		winston.error(`error in newMessage - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		throw e;
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

exports.isTyping = async (io, socket, data) => {
	const {
		room_id,
		typing
	} = data;
	try {
		const sender_id = await chat_dao.getSenderIdBySocket(room_id, socket.id);
		if (typing) {
			io.to(room_id).emit('start_typing', Object.assign({}, config.RESPONSE, {
				message: 'start_typing',
				data: {
					sender_id
				}
			}));
		} else
			io.to(room_id).emit('stop_typing', Object.assign({}, config.RESPONSE, {
				message: 'stop_typing',
				data: {
					sender_id
				}
			}));
	} catch (e) {
		winston.error(`error in isTyping - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		throw e;
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

exports.readMessage = async (io, socket, data) => {
	const {
		message_id,
		room_id,
		receiver_id,
		sender_id
	} = data;
	try {

		const sender_sockets = await room_dao.findSocketsById(sender_id, room_id);
		const keyedMessage = new km('readMessage', JSON.stringify({
			sender_id,
			receiver_id,
			room_id,
			message_id
		}));
		producer.send([Object.assign(config.PAYLOAD, {
			messages: [keyedMessage]
		})], function (e, result) {
			if (e) {
				winston.error(`error in isRead producer - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
				throw e;
			} else {
				kafka_log(result);

				for (const sender_socket of sender_sockets) {
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
	} catch (e) {
		winston.error(`error in isTyping - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
	}
};