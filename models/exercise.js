const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
	{
		image: {
			type: String,
			default: '0',
		},
		video: {
			type: String,
		},
		description: {
			type: String,
		},
		// exerciseId: {
		//     type: Number,
		//     unique: true
		// },
		exerciseName: {
			type: String,
			required: true,
		},
		exerciseTime: {
			type: Number,
			required: true,
			default: 1,
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
	{ timestamps: true, collection: 'yogaworkoutExercise' }
);

module.exports = mongoose.model('yogaworkoutExercise', exerciseSchema);
