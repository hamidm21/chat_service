const joi = require('joi');


const message = joi.object().keys({
	token: joi.string().required() ,
	room_id: joi.string().required().min(23).max(25) ,
	text: joi.string().require() ,
	time_stamp: joi.date().timestamp()
});

exports.schemas = {message};