const mongoose = require('mongoose');
const yogaworkoutSession = require('./models/yogaworkoutSession'); // Assuming this is your model's location

const checkUserLogin = async (userId, session, deviceId) => {
	try {
		// Find the session based on userId, session, and deviceId
		const existingSession = await yogaworkoutSession.findOne({
			user_Id: userId,
			session: session,
			deviceId: deviceId,
		});

		// If a session exists, return true, otherwise false
		return existingSession !== null;
	} catch (err) {
		console.error('Error checking user login:', err);
		throw new Error('Could not check user login');
	}
};

module.exports = { checkUserLogin };
