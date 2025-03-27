const mongoose = require('mongoose');

const customplanexerciseSchema = new mongoose.Schema(
	{
		custom_plan_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutCustomPlan',
			required: true,
			index: true,
		},

		exercise_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutExercise',
			required: true,
			index: true,
		},

		exercise_time: {
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
	{ timestamps: true, collection: 'yogaworkoutCustomPlanExercise' }
);

module.exports = mongoose.model(
	'yogaworkoutCustomPlanExercise',
	customplanexerciseSchema
);
