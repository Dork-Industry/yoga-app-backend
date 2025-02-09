const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY;  // Replace with your secret key
exports.SECRET_KEY = SECRET_KEY;
const SECRET_IV = process.env.SECRET_IV;    // Replace with your secret IV
exports.SECRET_IV = SECRET_IV;

function encrypt_decrypt(action, string) {
    const encryptMethod = 'aes-256-cbc';
    
    // Create the key and IV using SHA-256
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();  // 32 bytes for AES-256
    const iv = Buffer.from(crypto.createHash('sha256').update(SECRET_IV).digest('hex').slice(0, 16), 'hex');  // 16 bytes for AES-256-CBC

    let output = false;

    if (action === 'encrypt') {
        const cipher = crypto.createCipheriv(encryptMethod, key, iv);
        output = Buffer.concat([cipher.update(string, 'utf8'), cipher.final()]);
        output = output.toString('base64');
    } else if (action === 'decrypt') {
        const decipher = crypto.createDecipheriv(encryptMethod, key, iv);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(string, 'base64')), decipher.final()]);
        output = decrypted.toString('utf8');
    }

    return output;
}

module.exports = { encrypt_decrypt };
