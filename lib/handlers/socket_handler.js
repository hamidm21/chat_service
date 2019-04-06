const room_controller = require('../controllers/room_controller');
const chat_controller = require('../controllers/chat_controller');
const log = require('debug')('chat_service:handler:socket');
const elog = require('debug')('chat_service:error:handler:socket');
const winston = require('../utils/logger');

/**
 * @module SOCKET_EVENTS
 */

module.exports = (io) => {

	io.on('connection', (socket) => {

		log({'socket connected': socket.id});

		socket.on('disconnecting', function () {

			room_controller.disconnecting(io, socket);

			log({'socket is disconnecting' : socket.id});

		});

		socket.on('disconnect', () => {

			log({'socket is disconnected' : socket.id});

		});

		socket.on('error', e => {

			elog({'socket io has a problem': e});
			winston.error(`error in socket - ${e}`);

		});

		/**
		 * create_room event in socket_handler
		 * @event module:SOCKET_EVENTS.event:create_room - creates a socket room and a redis room
		 * @param {ID} room_id - the created room id that comes from the createRoom api
		 * @param {Array} members - room members that comes from createRoom api
		 * @param {ID} creator_id - id of user who created the room
		 * @description - this event takes three required argument , at first creates the redis room with the given 
		 * room id and then adds the creator socket to the room it also searches for connected members and emits them "new_room"
		 * to let them know about it.
		 * @returns room_created - if successful
		 * @emits room_id - emits the created room id to the online members
		 * @emits members - emits all the members of a room to online members
		 * cncf.io
		 */
		socket.on('create_room', (data, callback) => {

			log('createRoom triggered');
			room_controller.createRoom(io, socket, data, callback);
		
		});
		/**
		 * join_room event in socket_handler 
		 * @event module:SOCKET_EVENTS.event:join_room - joines one user socket to a room 
		 * @param {ID} room_id - the room id 
 		 * @param {ID} joined_id - id of the joined user
		 * @description - this event takes two required argument , joines the user id to the redis room and joines the user
		 * socket to the socket.io room then returns the currently online members of the room.
		 * @returns joined_room - if successful 
		 * @emits joined_id - emits to room the joined member id
		 * @emits members - emits to room the online members of the room 
		 */
		socket.on('join_room', (data, callback) => {

			log('joinRoom triggered');
			room_controller.joinRoom(io, socket, data, callback);
		
		});
		/**
		 * new_message event in socket_handler
		 * @event module:SOCKET_EVENTS.event:new_message - sends a new message to a room 
		 * @param {String} text - the message text sent by user
		 * @param {ID} room_id - room id that message goes to
 		 * @param {Date} time - the exact date of message beeing sent 
		 * @description - this event takes three required argument , sends the message to api service to be saved through kafka 
		 * newMessage topic and then emits the message to room 
		 * @emits msg - emits this object to the room {
			text,
			room_id,
			time: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
			sender_id,
			message_id
		}
		 */
		socket.on('new_message', (data, callback) => {

			log('mewMessage triggered');
			chat_controller.newMessage(io, socket, data, callback);

		});
		/**
		 * @event module:SOCKET_EVENTS.event:read_message - an event to indicate a message is read 
		 * @param {ID} message_id - id of the message
		 * @param {ID} room_id - id of the room that message has been sent to
		 * @param {ID} receiver_id - id of the member who saw the message
		 * @param {ID} sender_id - id of the message sender
		 * @emits object emits exatly what it got as an input {message_id, room_id, receiver_id, sender_id}}
		 */
		socket.on('read_message', (data, callback) => {

			log('readMessage triggered');
			chat_controller.readMessage(io, socket, data, callback);

		});
		/**
		 * @event module:SOCKET_EVENTS.event:is_typing - an event to indicate a message is read 
		 * @param {ID} room_id - id of the room
		 * @param {Boolean} typing - indicats the typing state of the user 
		 * @emits start_typing - this emit is fired to the room when a user typing is true
		 * @emits stop_typing - this emit is fired to the room when a user typing is false
		 */
		socket.on('is_typing', (data, callback) => {

			log('is_typing triggered');
			chat_controller.isTyping(io, socket, data, callback);

		});


		socket.on('is_new', (data, callback) => {

			log('is_new triggered');
			room_controller.isNew(io, socket, data, callback);
		
		});


		socket.on('choose_psychologist', (data, callback) => {

			log('choose_psychologist triggered');
			room_controller.choosePsychologist(io, socket, data, callback);
			
		});

		socket.on('notify_secretary', (data, callback) => {

			log('notify_secretary triggerd');
			chat_controller.notifySecretary(io, socket, data, callback);
			
		});
	});
};