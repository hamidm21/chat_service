const joi = require('joi');


exports.message = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	text: joi.string().required(),
});

exports.joinRoom = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	joined_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	access_token: joi.optional()
});

exports.createRoom = joi.object().keys({
	_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	members: joi.array().required(),
	title: joi.string().required(),
	avatar: joi.string().required(),
	creator_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	type: joi.string().required(),
	state: joi.string().required(),
	unreadMessages: joi.number().required(),
	lastMessage: joi.object().required(),
	owner_id: joi.required(),
	is_new: joi.required(),
	access_token: joi.optional()
});

exports.newMessage = joi.object().keys({
	text: joi.string().required(),
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	time: joi.date().optional(),
	primary_key: joi.number().optional(),
	access_token: joi.optional()

});

exports.isTyping = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	typing: joi.boolean().required(),
	access_token: joi.optional()
});

exports.readMessage = joi.object().keys({
	message_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	receiver_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	sender_id: joi.string().required().regex(/^[a-f\d]{24}$/i),
	access_token: joi.optional()
});

exports.joi = joi;