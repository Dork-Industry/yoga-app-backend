const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
	{
		user_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutUser',
			required: true,
			index: true,
		},

		session: {
			type: String,
			required: true,
			index: true,
		},
		
		deviceId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true, collection: 'yogaworkoutSession' }
);

module.exports = mongoose.model('yogaworkoutSession', sessionSchema);
