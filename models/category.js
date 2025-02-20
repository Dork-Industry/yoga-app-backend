const mongoose = require('mongoose');
const yogaworkoutCategoryexercise = require('./categoryexercise');

const categorySchema = new mongoose.Schema(
	{
		category: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		description: {
			type: String,
		},
		// categoryId:{
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
	{ timestamps: true, collection: 'yogaworkoutCategory' }
);

categorySchema.pre('deleteOne', async function (next) {
	const categoryId = this.getQuery()._id;
	const categoryCount = await yogaworkoutCategoryexercise.countDocuments({
		category_Id: categoryId,
	});

	if (categoryCount > 0) {
		next(
			new Error(
				'Cannot delete Category because related Category Exercise exist.'
			)
		);
	} else {
		next();
	}
});

module.exports = mongoose.model('yogaworkoutCategory', categorySchema);
