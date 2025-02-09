const yogaworkoutCategory = require('../models/category');

const getAllCategories = async (req,res) => {
    try{
        let categories = await yogaworkoutCategory.find();
        if(categories.length === 0)
        {
            return res.status(400).json({
                message: "No Categories Added!"
            });
        }
        else{
            res.status(200).json({
                categories
            });
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

module.exports = { getAllCategories };