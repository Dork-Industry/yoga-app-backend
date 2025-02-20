const mongoose = require('mongoose');
const yogaworkoutDays = require('./days');

const weekSchema = new mongoose.Schema(
	{
		// challengesId: {
		//     type: String,
		//     default: "0"
		// },
		challenges_Id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutChallenges',
			required: true,
			index: true,
		},

		weekName: {
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
	{ timestamps: true, collection: 'yogaworkoutWeek' }
);

weekSchema.pre('deleteOne', async function (next) {
	const weekId = this.getQuery()._id;
	const daysCount = await yogaworkoutDays.countDocuments({ week_Id: weekId });

	if (daysCount > 0) {
		next(new Error('Cannot delete Week because related Days exist.'));
	} else {
		next();
	}
});

module.exports = mongoose.model('yogaworkoutWeek', weekSchema);
