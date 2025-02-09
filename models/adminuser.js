const mongoose = require('mongoose');


const adminuserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        mobile: {
            type: String,
            default: '0'
        },
        rights: {
            type: Number,
            default: 1
        },
        adminId: {
            type: Number,
            required: true,
            unique: true
        },
        image: {
            type: String,
            default: "0"
        }

    },
    { timestamps: true, collection: "yogaworkoutAdmin" }
);

module.exports = mongoose.model('yogaworkoutAdmin', adminuserSchema);
