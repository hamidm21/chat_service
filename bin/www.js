#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../chat_service');
var log = require('debug')('chat:www');
var http = require('http');
const pid = process.pid;
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const dotenv = require('dotenv').config();
const start_dao = require('../lib/dao/start_dao');


/**
 * Get port from environment and store in Express.
 */


if (cluster.isMaster) {
  log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection


var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
exports.io = require('socket.io')(server , {
  pingTimeout:15000,
  pingInterval:3000,
  transports: ['websocket'],
  cookie:false
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port , () => {
  const flushed = start_dao.flushDB();
  if(flushed){
    log(`Started process ${pid}`);
  }
});
server.on('error', onError);
server.on('listening', onListening);
log(`server is running on port ${process.env.PORT}`);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  log('Listening on ' + bind);
}

  
  console.log(`Worker ${process.pid} started`);
  exports.shit = "shit"
}


