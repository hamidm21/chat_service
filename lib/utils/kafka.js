const log = require('debug')('chat_service:utils:kafka');
const elog = require('debug')('chat_service:error:utils:kafka');
const kafka = require('kafka-node');
// const blubird = require('bluebird');
const config = require('../config/config');
const km = kafka.KeyedMessage;
const Producer = kafka.Producer;
const Client = new kafka.KafkaClient({kafkaHost: config.KAFKA_HOST});
const producer = new Producer(Client , config.PRODUCER_CONFIG);

// const newproducer = blubird.promisify(producer.send, {context: producer});

producer.on('ready' , ()=> {
	log('kafka server is up and running');
});

producer.on('error' , (error)=> {
	elog(`kafka connection has errors -----> ${error}`);
});


// exports.createTopic = function (req , res){
// 	Client.createTopics([{
// 		topic : config.TOPIC ,
// 		partitions: 2 ,
// 		replicationFactor: 1
// 	}] , (error , result)=> {
// 		if(error)
// 			Promise.reject(e);rror;
// 		else if (result)
// 			res.json({result : result});
// 		else
// 			res.json({result : 'seccesfull'});
// 	});
// };


// exports.newproducer = newproducer;
exports.producer = producer;
exports.client = Client;
exports.km = km;
 

