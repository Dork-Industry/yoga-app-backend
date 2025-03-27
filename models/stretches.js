const mongoose = require('mongoose');
const yogaworkoutStretchesexercise = require('./stretchesexercise');

const stretchesSchema = new mongoose.Schema(
	{
		stretches: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		description: {
			type: String,
		},

		isActive: {
			type: Number,
			enum: [1, 0],
			default: 1,
		},
		isPro: {
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
	{ timestamps: true, collection: 'yogaworkoutStretches' }
);

stretchesSchema.pre('deleteOne', async function (next) {
	const stretchesId = this.getQuery()._id;
	const stretchesCount = await yogaworkoutStretchesexercise.countDocuments({
		stretches_Id: stretchesId,
	});
	if (stretchesCount > 0) {
		next(
			new Error(
				'Cannot delete Stretches because related Stretches Exercise exist.'
			)
		);
	} else {
		next();
	}
});

module.exports = mongoose.model('yogaworkoutStretches', stretchesSchema);
