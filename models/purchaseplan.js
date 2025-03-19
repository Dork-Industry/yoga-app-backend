const mongoose = require('mongoose');

const purchasePlanSchema = new mongoose.Schema(
	{
		purchase_plan_id: {
			type: Number,
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutUser',
			required: true,
			index: true,
		},
		plan_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'yogaworkoutPlan',
			required: true,
			index: true,
		},
		plan_name: {
			type: String,
			maxlength: 250,
			default: null,
		},
		price: {
			type: String,
			maxlength: 50,
			default: null,
		},
		months: {
			type: Number,
			default: null,
		},
		purchase_date: {
			type: String,
			maxlength: 50,
			default: null,
		},
		expire_date: {
			type: String,
			maxlength: 50,
			default: null,
		},
		total_days: {
			type: Number,
			default: null,
		},
		is_active: {
			type: Number,
			default: null,
		},
		is_payment: {
			type: Number,
			default: null,
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
	{ timestamps: true, collection: 'yogaworkoutPurchasePlan' }
);

module.exports = mongoose.model('yogaworkoutPurchasePlan', purchasePlanSchema);
