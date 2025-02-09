const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        category:{
            type : String,
            required: true
        },
        image:{
            type: String,
        },
        decaription:{
            type:String
        },
        categoryId:{
            type: Number,
            unique: true
        },
        isActive:{
            type: Number,
            enum:[1,0],
            default: 1
        },
        createdAt:{
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true, collection: "yogaworkoutCategory" }
)

module.exports = mongoose.model('yogaworkoutCategory', categorySchema);