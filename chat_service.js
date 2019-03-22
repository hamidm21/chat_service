const app = require('express')();
const winston = require('./lib/utils/logger');
const server = require('http').createServer(app);
const express = require('express');
const config = require('./lib/config/config');
const log = require('debug')('chat_service');
const morgan = require('morgan');
const path = require('path');
const cookieParser =  require('cookie-parser');
const Init = require('./lib/utils/Init');
const Routes = require('./routes/index');
const socketHandler = require('./lib/handlers/socket_handler');
const start_dao = require('./lib/dao/start_dao');
const io = require('socket.io')(server , {
	transports: ['websocket'],
});
//const errorHandler = require('./lib/handlers/errorHandler')
//View engine setup
//const app.set('views', path.join(__dirname, 'views'))
//const app.set('view engine', 'jade')
// MiddleWares
app.use(morgan('combined' , { stream: winston.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../landing')));

//initializing
Init(app);
socketHandler(io);
Routes(app);
//errorHandler(app)


server.listen(config.PORT , () => {
	const flushed = start_dao.flushDB();
	if(flushed){
		log(`server is running on ${config.PORT}`);		
	}
});

module.exports = app;
