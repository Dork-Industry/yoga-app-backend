const mongoose = require('mongoose');
const yogaworkoutDiscoverexercise = require('./discoverexercise');

const discoverSchema = new mongoose.Schema(
	{
		discover: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		description: {
			type: String,
		},
		// discoverId:{
		//     type: Number,
		//     unique: true
		// },
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
	{ timestamps: true, collection: 'yogaworkoutDiscover' }
);


discoverSchema.pre('deleteOne', async function (next) {
	const discoverId = this.getQuery()._id;
	const discoverCount = await yogaworkoutDiscoverexercise.countDocuments({
		discover_Id: discoverId,
	});

	if (discoverCount > 0) {
		next(
			new Error(
				'Cannot delete Discover because related Discover Exercise exist.'
			)
		);
	} else {
		next();
	}
});

module.exports = mongoose.model('yogaworkoutDiscover', discoverSchema);
