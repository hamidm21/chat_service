const Chat = require('./Chat');
const Kafka = require('./Kafka');

module.exports = (app) => {
	app.use('/Chat', Chat);
	app.use('/Kafka', Kafka);

	//react routes
	app.all('/user*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/psychologist*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/register*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/login*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/articlelist*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/forgetpassword*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/emailsent*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/passchanged*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/newpassword*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/aboutus*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/contact*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/rules*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/questions*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/s*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
	app.all('/family*', (req, res) => {
		res.sendFile('index.html', {
			root: '../landing'
		});
	});
};