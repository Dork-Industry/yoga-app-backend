const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutDiscover = require('../../models/discover');
const yogaworkoutDiscoverexercise = require('../../models/discoverexercise');
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

const getDiscoverExercise = async (req, res) => {
	try {
		if (req.body.discover_id) {
			// let discoversexercises = await yogaworkoutDiscoverexercise.find({ discover_Id: req.body.discover_id }).sort({ createdAt: -1 });
			const discoversexercises = await yogaworkoutDiscoverexercise.aggregate([
				{
					$match: { discover_Id: new mongoose.Types.ObjectId(req.body.discover_id) },
				},
				{
					$lookup: {
						from: 'yogaworkoutExercise',
						localField: 'exercise_Id',
						foreignField: '_id',
						as: 'Exercise',
					},
				},
				{
					$project: {
						Exercise: 1, // Check if the 'Exercise' field is being populated
					},
				},
				{
					$unwind: {
						path: '$Exercise', // Deconstruct the Exercise array
						preserveNullAndEmptyArrays: true, // If no Exercise matched, don't exclude the document
					},
				},
				{
					$replaceRoot: {
						newRoot: {
							$ifNull: ['$Exercise', { message: 'No Exercise found' }], // If Exercise is missing, provide a fallback object
						},
					},
				},
			]);
			const discoverexercisesWithImages = await Promise.all(
				discoversexercises.map(async (item) => {
					const updatedItem = item.toObject ? item.toObject() : item;
					if (item.exercise_Id?.image !== '') {
						const imageurl = await getFile(item?.image); // Assuming getFile is an async function
						// console.log("imageurl", imageurl);
						return {
							...updatedItem,
							image: imageurl,
						}; // Update the image URL
					}
					return updatedItem; // Return the item unchanged if no image update is needed
				})
			);
			res.status(200).json({
				data: { success: 1, exercise: discoverexercisesWithImages, error: '' },
			});
		}
		else {
			res.status(201).json({
				data: { success: 0, exercise: [], error: 'Variable not set' },
			});
		}

	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, discover: [], error: 'Server Error' },
		});
	}
}

module.exports = { getAllDiscovers, getDiscoverExercise };
