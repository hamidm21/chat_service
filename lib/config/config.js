require('dotenv').config();

const config = {

	PORT: process.env.PORT,
	KAFKA_HOST: process.env.KAFKA_HOST,
	PRODUCER_CONFIG: {
		requireAcks: parseInt(process.env.REQUIREACKS),
		ackTimeoutMs: parseInt(process.env.ACKTIMEOUTMS),
		partitionerType: parseInt(process.env.PARTITIONERTYPE)
	},
	PAYLOAD: {
		topic: process.env.TOPIC,
		messages: [], // multi messages should be a array, single message can be just a string or a KeyedMessage instance
		key: 'message', // string or buffer, only needed when using keyed partitioner
		partition: 0, // default 0
		attributes: 1, // default: 0
		timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10 and KafkaClient only)
	},
	RESPONSE: {
		result: true,
		message: '',
		data: {},
		error_code: 0
	},
	REDIS_PRIMERY_DB: process.env.REDIS_PRIMERY_DB,
	REDIS_SECONDARY_DB: process.env.REDIS_SECONDARY_DB,
	TOPIC: process.env.TOPIC,
	REDIS_HOST: process.env.REDIS_HOST,
	JWT_SECRET: process.env.JWT_SECRET,


};


module.exports = config;