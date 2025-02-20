const mongoose = require('mongoose');

const challengesexerciseSchema = new mongoose.Schema(
	{
		days_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutDays',
			required: true,
			index: true,
		},

		exercise_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutExercise',
			required: true,
			index: true,
		},

		// daysId: {
		//     type: Number,
		//     required: true
		// },

		// exerciseId: {
		//     type:Number,
		//     required: true
		// },

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
	{ timestamps: true, collection: 'yogaworkoutChallengesexercise' }
);

module.exports = mongoose.model(
	'yogaworkoutChallengesexercise',
	challengesexerciseSchema
);
