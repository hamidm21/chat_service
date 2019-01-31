// const kafka_log = require('debug')('goftare:kafka');
const winston = require('../utils/logger');
// const { producer } = require('../utils/kafka');
const room_dao = require('../dao/room_dao');
// const config = require('../config/config');

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
 * takes a user's id and socket_id then joines it into the redis room and socket io room
 * @async
 */

exports.joinRoom = async (io , socket , data , callback) => {
	const {room_id , joined_id} = data;
	try{
		const members = await room_dao.joinSocketToRoom(room_id , socket.id , joined_id);
		if (members) {
			socket.join(room_id);
			io.to(room_id).emit('joined_room' , {joined_id, members});
			callback('successful');
		}
	}catch(e){
		winston.error(`error in joinRoom function - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		throw e;
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
exports.disconnecting = async (io , socket)=> {
	const rooms = Object.keys(socket.rooms).filter(room => typeof room === 'string' && !!room && room.length != 20);
	try{
		const removedSocket = await room_dao.removeSocketFromRoom(rooms , socket.id);
		for (const room of removedSocket.rooms) {
			io.to(room).emit('disconnected' , { sender_id: removedSocket.sender_id });
		}
	}catch(e){
		winston.error(`error in disconnect - ${e.status || 500} - ${e.message} - ${e.stack} - ${new Date()}`);
		throw e;
	}
};