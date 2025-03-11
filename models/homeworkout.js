const mongoose = require('mongoose');

const homeworkoutSchema = new mongoose.Schema(
	{
		days_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutDays',
			required: true,
			index: true,
		},

		user_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutExercise',
			required: true,
			index: true,
		},
		workouts: {
			type: String,
			required: true,
		},
		kcal: {
			type: String,
			required: true,
		},
		duration: {
			type: Number,
			required: true,
		},

		// homeWorkoutId: {
		//     type: Number,
		//     required: true
		// },

		// userId: {
		//     type:Number,
		//     required: true
		// },

		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true, collection: 'yogaworkoutHomeWorkout' }
);

module.exports = mongoose.model('yogaworkoutHomeWorkout', homeworkoutSchema);
