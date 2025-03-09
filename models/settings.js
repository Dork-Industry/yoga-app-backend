const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
	{
		challenges: {
			type: Number,
			enum: [0, 1],
			default: 1,
		},
		category: {
			type: Number,
			enum: [0, 1],
			default: 1,
		},
		discover: {
			type: Number,
			enum: [0, 1],
			default: 1,
		},
		quickworkout: {
			type: Number,
			enum: [0, 1],
			default: 1,
		},
		stretches: {
			type: Number,
			enum: [0, 1],
			default: 1,
		},
		settingId: {
			type: Number,
			enum: [0, 1],
			default: 1,
		},
		
	},
	{ timestamps: true, collection: 'yogaworkoutSetting' }
);

module.exports = mongoose.model('yogaworkoutSetting', settingsSchema);
