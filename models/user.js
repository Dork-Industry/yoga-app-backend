const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
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
			required : true
		},
        age: {
			type: Number,
			required : true
		},
        gender: {
			type: Number,
			required : true
		},
    }
)