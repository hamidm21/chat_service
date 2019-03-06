// const client = require('../utils/kafka').client;
// const Consumer = require('kafka-node').Consumer;
// const km = require('kafka-node').KeyedMessage;
// const getLastOffset = require('../dao/start_dao').getLastCommitedOffset;
// const config = require('../config/config');

// exports.consumerInit = async () => {
// 	const lastOffset = await getLastOffset();
// 	const consumer = new Consumer(client, [Object.assign({}, config.PAYLOADS, {
// 		offset: lastOffset
// 	})], config.CONSUMER_CONFIG);
//     consumer.on('message', message => {
//         switch (message.key) {
//             case 'isNew':
                                
//                 break;
        
//             default:
//                 break;
//         }
//     });
// };
