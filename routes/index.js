const Chat = require('./Chat');
const Kafka = require('./Kafka');

module.exports = (app) => {
	app.use('/Chat', Chat);
	app.use('/Kafka', Kafka);
	app.all('/user/chat', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/user', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
};