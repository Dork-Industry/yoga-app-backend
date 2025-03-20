const mongoose = require('mongoose');

const customplanSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutUser',
			required: true,
			index: true,
		},
		name: {
			type: String,
			required : true,
		},
		description: {
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
	{ timestamps: true, collection: 'yogaworkoutCustomPlan' }
);

module.exports = mongoose.model('yogaworkoutCustomPlan', customplanSchema);
