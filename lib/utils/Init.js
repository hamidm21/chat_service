const path = require('path');
const express = require('express');

module.exports = (app) => {

	app.use(function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
		res.setHeader('Access-Control-Expose-Headers', '');
		next();
	});

	// Serve static files from the React app
	app.use(express.static(path.join(__dirname, '/../build')));


	app.use((req, res, next) => {
                
		req.base = {
			result: true,
			message: '',
			data: {}
		};
		next();
	});
};