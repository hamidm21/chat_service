const crypto = require('crypto');
const log = require('debug')('chat:utils:encryption');
const iv = 'o20a81i4930k74d1';
const key = 'dfb3mk21fd46ha2e9f680be0abc8d9f2';
const algorithm = 'aes-256-cbc';

const encrypt = function (data) {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

const decrypt = function (ciphertext) {
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	return decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8');
};

exports.decryptRequestBody = function (req, res, next) {

	if (process.env.CRYPTO == 'false') return next();
	const body = req.body.data;
	try {
		req.body = JSON.parse(decrypt(body));
		next();
	} catch (err) {
		next(new Error(err));
	}

};

exports.encryptResponse = function (req, res, next) {

	if (process.env.CRYPTO == 'false') return next();
	const send = res.json;
	let data = '';
	res.json = function (d) {
		try {
			log(data);
			data = JSON.stringify(arguments[0]);
			arguments[0] = {
				data: encrypt(data)
			};
			send.apply(res, arguments);
		} catch (err) {
			next(new Error(err));
		}
	};
	next();

};

exports.decryptRequestHeaders = function (req, res, next) {

	if (process.env.CRYPTO == 'false') return next();
	let headers = req.headers.data;
	delete req.headers.data;
	try {
		headers = JSON.parse(decrypt(headers));
		Object.assign(req.headers, headers);
		next();
	} catch (err) {
		next(new Error(err));
	}

};
