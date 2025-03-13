const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY; // Replace with your secret key
exports.SECRET_KEY = SECRET_KEY;
const SECRET_IV = process.env.SECRET_IV; // Replace with your secret IV
exports.SECRET_IV = SECRET_IV;

function encrypt_decrypt(action, string) {
	// Create key and IV using SHA-256 (ensure they are the correct lengths)
	const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
	const iv = crypto
		.createHash('sha256')
		.update(SECRET_IV)
		.digest()
		.slice(0, 16);

	let output = false;

	if (action === 'encrypt') {
		const cipher = crypto.createCipheriv(
			process.env.ecnryption_method,
			key,
			iv
		);
		let encrypted = cipher.update(string, 'utf8', 'base64');
		encrypted += cipher.final('base64');
		output = encrypted;
	} else if (action === 'decrypt') {
		const decipher = crypto.createDecipheriv(
			process.env.ecnryption_method,
			key,
			iv
		);
		let decrypted = decipher.update(string, 'base64', 'utf8');
		decrypted += decipher.final('utf8');
		output = decrypted;
	}

	return output;
}

module.exports = { encrypt_decrypt };
