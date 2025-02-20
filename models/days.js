const mongoose = require('mongoose');
const yogaworkoutChallengesexercise = require('./challengesexercise');

const daysSchema = new mongoose.Schema(
	{
		week_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutWeek',
			required: true,
			index: true,
		},
		// weekId: {
		//     type: String,
		// },
		daysName: {
			type: String,
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
	{ timestamps: true, collection: 'yogaworkoutDays' }
);

daysSchema.pre('deleteOne', async function (next) {
	const daysId = this.getQuery()._id;
	const daysCount = await yogaworkoutChallengesexercise.countDocuments({ days_Id: daysId });

	if (daysCount > 0) {
		next(new Error('Cannot delete Day because related Challenges Exercise exist.'));
	} else {
		next();
	}
});

module.exports = mongoose.model('yogaworkoutDays', daysSchema);
