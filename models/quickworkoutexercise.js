const mongoose = require('mongoose');

const quickworkoutexerciseSchema = new mongoose.Schema(
	{
		quickworkout_Id: {
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
	{ timestamps: true, collection: 'yogaworkoutQuickworkoutexercise' }
);

module.exports = mongoose.model(
	'yogaworkoutQuickworkoutexercise',
	quickworkoutexerciseSchema
);
