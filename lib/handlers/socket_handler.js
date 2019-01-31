const room_controller = require('../controllers/room_controller');
const chat_controller = require('../controllers/chat_controller');
const socket_log = require('debug')('goftare:socket');
const winston = require('../utils/logger');

module.exports = (io) => {

	io.on('connection', (socket) => {

		socket_log('socket io is connected');

		socket.on('disconnecting', function () {

			room_controller.disconnecting(io, socket);

		});

		socket.on('disconnect', () => {

			socket_log(`socket is disconnected  ${socket.id}`);

		});

		socket.on('error', e => {

			winston.error(`error in socket - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);

		});

		socket.on('join_room', (data, callback) => {

			room_controller.joinRoom(io, socket, data, callback);
		
		});

		socket.on('new_message', data => {

			chat_controller.newMessage(io, socket, data);

		});

		socket.on('read_message', data => {

			chat_controller.readMessage(io, socket, data);

		});

		socket.on('is_typing', data => {

			chat_controller.isTyping(io, socket, data);

		});

	});
};