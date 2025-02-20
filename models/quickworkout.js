const mongoose = require('mongoose');
const yogaworkoutQuickworkoutexercise = require('./quickworkoutexercise');

const quickworkoutSchema = new mongoose.Schema(
	{
		quickworkout: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		description: {
			type: String,
		},
		// quickworkoutId:{
		//     type: Number,
		//     unique: true
		// },
		isActive: {
			type: Number,
			enum: [1, 0],
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
	{ timestamps: true, collection: 'yogaworkoutQuickworkout' }
);

quickworkoutSchema.pre('deleteOne', async function (next) {
	const quickworkoutId = this.getQuery()._id;
	const quickworkoutCount = await yogaworkoutQuickworkoutexercise.countDocuments({
		quickworkout_Id: quickworkoutId,
	});
	if (quickworkoutCount > 0) {
		next(
			new Error(
				'Cannot delete Quickworkout because related Quickworkout Exercise exist.'
			)
		);
	} else {
		next();
	}
});

module.exports = mongoose.model('yogaworkoutQuickworkout', quickworkoutSchema);
