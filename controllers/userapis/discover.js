const yogaworkoutDiscover = require('../../models/discover');
const { getFile } = require('../../utility/s3');

const getAllDiscovers = async (req, res) => {
	try {
		let discovers = await yogaworkoutDiscover.find().sort({ createdAt: -1 });
		if (discovers.length === 0) {
			return res.status(400).json({
				data: { success: 0, discover: [], error: 'Please Try Again' },
			});
		} else {
			const discoversWithImages = await Promise.all(
				discovers.map(async (item) => {
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
				data: { success: 1, discover: discoversWithImages, error: '' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, discover: [], error: 'Server Error' },
		});
	}
};

module.exports = { getAllDiscovers };
