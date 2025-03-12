const yogaworkoutStretches = require('../../models/stretches');
const { getFile } = require('../../utility/s3');

const getAllStretches = async (req, res) => {
	try {
		let stretchess = await yogaworkoutStretches.find().sort({ createdAt: -1 });
		if (stretchess.length === 0) {
			return res.status(400).json({
				success: 0,
				stretches: [],
				error: 'Please Try Again',
			});
		} else {
			const stretchessWithImages = await Promise.all(
				stretchess.map(async (item) => {
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
				data: {
					success: 1,
					stretches: stretchessWithImages,
					error: '',
				},
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			success: 0,
			stretches: [],
			error: 'Server Error',
		});
	}
};

module.exports = { getAllStretches };
