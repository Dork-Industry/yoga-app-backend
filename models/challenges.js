const mongoose = require('mongoose');

const challengesSchema = new mongoose.Schema(
	{
		image: {
			type: String,
			default: '0',
		},

		description: {
			type: String,
		},
		// challengesId: {
		//     type: Number,
		//     unique: true
		// },
		challengesName: {
			type: String,
			required: true,
		},
		isActive: {
			type: Number,
			enum: [0, 1],
			default: 1,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true, collection: 'yogaworkoutChallenges' }
);

module.exports = mongoose.model('yogaworkoutChallenges', challengesSchema);
