const mongoose = require('mongoose');

const discoverexerciseSchema = new mongoose.Schema(
	{
		discover_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutDiscover',
			required: true,
			index: true,
		},

		exercise_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutExercise',
			required: true,
			index: true,
		},

		// discoverId: {
		//     type: Number,
		//     required: true
		// },

		// exerciseId: {
		//     type: Number,
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
	{ timestamps: true, collection: 'yogaworkoutDiscoverexercise' }
);

module.exports = mongoose.model(
	'yogaworkoutDiscoverexercise',
	discoverexerciseSchema
);
