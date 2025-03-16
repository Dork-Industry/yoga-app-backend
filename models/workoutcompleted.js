const mongoose = require('mongoose');
const yogaworkoutDays = require('./days');

const workoutCompletedSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutUser',
			required: true,
			index: true,
		},
		workout_type: {
			type: Number,
		},
		workout_id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutQuickworkout',
			required: true,
			index: true,
		},
		kcal:{
			type: Number,
			default : 0
		},
		completed_duration : {
			type : Number,
			default :0
		},
		completed_date:{
			type : Date,
			default: Date.now,
		},
		date_year:{
			type: String
		},
		is_completed: {
			type: Number,
			emun: [0, 1],
			default: 0,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true, collection: 'yogaworkoutworkoutCompleted' }
);



module.exports = mongoose.model('yogaworkoutworkoutCompleted', workoutCompletedSchema);
