const jwt = require('jsonwebtoken');
const config = require('../config/config');
const winston = require('../utils/logger');
const log = require('debug')('chat_service:utils:guard');
const elog = require('debug')('chat_service:error:utils:guard');


exports.userGuard = (data, callback) => {
	try {
		const token = data.accessToken;
		if (token) {
			jwt.verify(token, config.JWT_SECRET, async function (err, decoded) {
				if (err) {
					switch (err.name) {
					case 'TokenExpiredError':
						callback(Object.assign({}, config.RESPONSE, {
							result: false,
							message: 'EXPIRED',
							data: err
						}));
						winston.debug('credential_expired' + token);
						break;
					case 'JsonWebTokenError':
						callback(Object.assign({}, config.RESPONSE, {
							result: false,
							message: 'ERROR',
							data: err
						}));
						winston.info('credential_error' + token);
						break;
					case 'NotBeforeError':
						callback(Object.assign({}, config.RESPONSE, {
							result: false,
							message: 'ERROR',
							data: err
						}));
						winston.info('credential_before' + token);
						break;
					}
				} else {
					return decoded;
				}
			});
		} else
			callback(Object.assign({}, config.RESPONSE, {
				result: false,
				message: 'EMPTY'
			}));

	} catch (e) {
		callback(Object.assign({}, config.RESPONSE, {
			result: false,
			message: 'error in guard function',
			data: e
		}));
	}
};
