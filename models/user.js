const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		mobile: {
			type: String,
			required: true,
			unique: true,
		},
		age: {
			type: String,
			required: true,
		},
		gender: {
			type: String,
			required: true,
		},
		height: {
			type: String,
			required: true,
		},
		weight: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			// required: true,
		},
		address: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		country: {
			type: String,
			required: true,
		},
		intensively: {
			type: String,
			required: true,
		},
		timeinweek: {
			type: String,
			required: true,
		},
		first_name: {
			type: String,
			required: true,
		},
		last_name: {
			type: String,
			required: true,
		},
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
	{ timestamps: true, collection: 'yogaworkoutUser' }
);
module.exports = mongoose.model('yogaworkoutUser', userSchema);
