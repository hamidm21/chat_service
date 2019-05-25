const producer = require('../utils/kafka').producer;
const km = require('kafka-node').KeyedMessage;
const config = require('../config/config');
const log = require('debug')('chat:handler:kafka');
const elog = require('debug')('chat:error:handler:kafka');

exports.produce = async (topic, key, ...msgs) => {
	try {
		log({topic, key, msgs})
		const messages = msgs.map(x => new km(key, JSON.stringify(x)));
		producer.send([Object.assign({}, config.PAYLOAD, {
			topic,
			messages
		})], function (err, result) {
			if (err) {
				elog({
					'error in producer': `${key} ----> ${err} `
				});
				Promise.reject(err);
			} else {
				log({
					'producer result': `${key} ----> ${result}`
				});
				Promise.resolve(result);
			}
		});
	} catch (e) {
		elog({
			'error in transactionSms producer': e
		});
		Promise.reject(e);
	}
};