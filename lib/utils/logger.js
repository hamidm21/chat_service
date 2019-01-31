const winston = require('winston');
const rootPath = require('app-root-path');


const options = {
	file: {
		level: process.env.LOG_LEVEL || 'info',
		filename: `${rootPath}/logs/goftare.log`,
		handleExceptions: true,
		json: true,
		timestamp: function() {
			return new Date();
		},
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: true,
	},
	console: {
		level: process.env.LOG_LEVEL || 'debug',
		handleExceptions: true,
		json: false,
		timestamp: function() {
			return new Date();
		},
		colorize: true,
	},
};


const logger = winston.createLogger({
	transports: [
		new winston.transports.File(options.file),
		new winston.transports.Console(options.console),
	],
	exitOnError: false
});


logger.stream = {
	write: function(message, encoding) {
		logger.info(`${message}  -  ${encoding}  -  ${new Date()}`);
	},
};


module.exports = logger;