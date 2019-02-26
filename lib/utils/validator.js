const joi = require('joi');


exports.message = joi.object().keys({
	room_id: joi.string().required().min(23).max(25) ,
	text: joi.string().require() ,
	time_stamp: joi.date().timestamp()
});

exports.joinRoom = joi.object().keys({
	room_id: joi.string().required().regex(/^[a-f\d]{24}$/i) ,
	joined_room: joi.string().required().regex(/^[a-f\d]{24}$/i)
});

exports.createRoom = joi.object().keys({

});

exports.newMessage = joi.object().keys({

});

exports.isTyping = joi.object().keys({

});

exports.

exports.joi = joi;