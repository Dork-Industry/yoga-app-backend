const mongoose = require('mongoose');

const categoryexerciseSchema = new mongoose.Schema(
	{
		category_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutCategory',
			required: true,
			index: true,
		},

		exercise_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutExercise',
			required: true,
			index: true,
		},

		// categoryId: {
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
	{ timestamps: true, collection: 'yogaworkoutCategoryexercise' }
);

module.exports = mongoose.model(
	'yogaworkoutCategoryexercise',
	categoryexerciseSchema
);
