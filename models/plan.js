const mongoose = require('mongoose');
const yogaworkoutDays = require('./days');

const planSchema = new mongoose.Schema(
	{
		plan_name: {
			type: String,
			required: true,
			index: true,
		},
		price: {
			type: Number,
			required: true,
			default: 0.0,
		},
		months: {
			type: Number,
			required: true,
			default: 1,
		},
		sku_id_android: {
			type: String,
			required: false,
		},
		sku_id_ios: {
			type: String,
			required: false,
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
	{ timestamps: true, collection: 'yogaworkoutPlan' }
);

module.exports = mongoose.model('yogaworkoutPlan', planSchema);
