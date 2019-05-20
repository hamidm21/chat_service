const Chat = require('./Chat');
const Kafka = require('./Kafka');

module.exports = (app) => {
	app.use('/Chat', Chat);
	app.use('/Kafka', Kafka);
};