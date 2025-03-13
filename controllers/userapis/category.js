const yogaworkoutCategory = require('../../models/category');
const { getFile } = require('../../utility/s3');

const getAllCategories = async (req, res) => {
	try {
		let categories = await yogaworkoutCategory.find().sort({ createdAt: -1 });
		if (categories.length === 0) {
			return res.status(400).json({
				data: { success: 0, category: [], error: 'Please Try Again' },
			});
		} else {
			const categoryWithImages = await Promise.all(
				categories.map(async (item) => {
					const updatedItem = item.toObject ? item.toObject() : item;
					if (item.image !== '') {
						const imageurl = await getFile(item.image); // Assuming getFile is an async function
						// console.log("imageurl", imageurl);
						return { ...updatedItem, image: imageurl }; // Update the image URL
					}
					return updatedItem; // Return the item unchanged if no image update is needed
				})
			);
			res.status(200).json({
				data: { success: 1, category: categoryWithImages, error: '' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, category: [], error: 'Server Error' },
		});
	}
};

module.exports = { getAllCategories };
