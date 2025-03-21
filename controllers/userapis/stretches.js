const yogaworkoutStretches = require('../../models/stretches');
const yogaworkoutStretchesexercise = require('../../models/stretchesexercise');
const { getFile } = require('../../utility/s3');
const { checkUserLogin } = require('./user');

const getAllStretches = async (req, res) => {
	try {
		const data = req.body;
		if (data.user_id && data.user_id !== '') {
			const userId = data.user_id;
			if (
				data.session &&
				data.session !== '' &&
				data.device_id &&
				data.device_id !== ''
			) {
				const session = data.session;
				const deviceId = data.device_id;
				const checkuserLogin = await checkUserLogin(userId, session, deviceId);
				if (!checkuserLogin) {
					res.status(201).json({
						data: { success: 0, stretches: [], error: 'Please login first' },
					});
				} else {
					let stretchess = await yogaworkoutStretches
						.find()
						.sort({ createdAt: -1 });
					if (stretchess.length === 0) {
						return res.status(400).json({
							data: { success: 0, stretches: [], error: 'Please Try Again' },
						});
					} else {
						const stretchessWithImages = await Promise.all(
							stretchess.map(async (item) => {
								const updatedItem = item.toObject ? item.toObject() : item;
								let imageUrl = '';
								let totalexercise = await yogaworkoutStretchesexercise.find({
									stretches_Id: item._id,
								});

								if (item.image !== '') {
									imageUrl = await getFile(item.image); // Assuming getFile is an async function
									// console.log("imageurl", imageurl);
								}
								return {
									...updatedItem,
									image: imageUrl,
									totalexercise: totalexercise.length,
								}; // Update the image URL

								// return updatedItem; // Return the item unchanged if no image update is needed
							})
						);
						res.status(200).json({
							data: { success: 1, stretches: stretchessWithImages, error: '' },
						});
					}
				}
			} else {
				res.status(200).json({
					data: { success: 0, stretches: [], error: 'Variable not set' },
				});
			}
		} else {
			let stretchess = await yogaworkoutStretches
				.find()
				.sort({ createdAt: -1 });
			if (stretchess.length === 0) {
				return res.status(400).json({
					data: { success: 0, stretches: [], error: 'Please Try Again' },
				});
			} else {
				const stretchessWithImages = await Promise.all(
					stretchess.map(async (item) => {
						const updatedItem = item.toObject ? item.toObject() : item;
						let imageUrl = '';
						let totalexercise = await yogaworkoutStretchesexercise.find({
							stretches_Id: item._id,
						});

						if (item.image !== '') {
							imageUrl = await getFile(item.image); // Assuming getFile is an async function
							// console.log("imageurl", imageurl);
						}
						return {
							...updatedItem,
							image: imageUrl,
							totalexercise: totalexercise.length,
						}; // Update the image URL

						// return updatedItem; // Return the item unchanged if no image update is needed
					})
				);
				res.status(200).json({
					data: { success: 1, stretches: stretchessWithImages, error: '' },
				});
			}
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, stretches: [], error: 'Server Error' },
		});
	}
};

module.exports = { getAllStretches };
