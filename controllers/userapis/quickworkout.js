const yogaworkoutQuickworkout = require('../../models/quickworkout');
const { getFile } = require('../../utility/s3');

const getAllQuickworkouts = async (req, res) => {
	try {
		let quickworkouts = await yogaworkoutQuickworkout
			.find()
			.sort({ createdAt: -1 });
		if (quickworkouts.length === 0) {
			return res.status(400).json({
				data: { success: 0, quickworkout: [], error: 'Please Try Again' },
			});
		} else {
			const quickworkoutsWithImages = await Promise.all(
				quickworkouts.map(async (item) => {
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
					data: {
						success: 1,
						quickworkout: quickworkoutsWithImages,
						error: '',
					},
				},
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, quickworkout: [], error: 'Server Error' },
		});
	}
};

module.exports = { getAllQuickworkouts };
