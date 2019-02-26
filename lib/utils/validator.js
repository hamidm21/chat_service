const joi = require('joi');


exports.message = joi.object().keys({
	room_id: joi.string().required().min(23).max(25) ,
	text: joi.string().require() ,
	time_stamp: joi.date().timestamp()
});

exports.joinRoom = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	joined_room: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.createRoom = joi.object().keys({
	_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	members: joi.array().required(),
	creator_id: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.newMessage = joi.object().keys({
	text: joi.string().required(),
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.isTyping = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	typing: joi.boolean().required()
});

exports.readMessage = joi.object().keys({
	message_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	receiver_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	sender_id: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.joi = joi;