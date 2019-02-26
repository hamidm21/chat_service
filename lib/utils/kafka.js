const kafka_log = require('debug')('goftare:kafka');
const erro_log = require('debug')('goftare:error');
const kafka = require('kafka-node');
const config = require('../config/config');
const km = kafka.KeyedMessage;
const Producer = kafka.Producer;
const Client = new kafka.KafkaClient({kafkaHost: config.KAFKA_HOST});
const producer = new Producer(Client , config.PRODUCER_CONFIG);


producer.on('ready' , ()=> {
	kafka_log('kafka server is up and running');
});

producer.on('error' , (error)=> {
	erro_log(`kafka connection has errors -----> ${error}`);
});


// exports.createTopic = function (req , res){
// 	Client.createTopics([{
// 		topic : config.TOPIC ,
// 		partitions: 2 ,
// 		replicationFactor: 1
// 	}] , (error , result)=> {
// 		if(error)
// 			throw error;
// 		else if (result)
// 			res.json({result : result});
// 		else
// 			res.json({result : 'seccesfull'});
// 	});
// };


exports.producer = producer;
exports.client = Client;
exports.km = km;
 

