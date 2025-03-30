const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutQuickworkout = require('../../models/quickworkout');
const yogaworkoutQuickworkoutexercise = require('../../models/quickworkoutexercise')
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
			// const quickworkoutsWithImages = await Promise.all(
			// 	quickworkouts.map(async (item) => {
			// 		const updatedItem = item.toObject ? item.toObject() : item;
			// 		if (item.image !== '') {
			// 			const imageurl = await getFile(item.image); // Assuming getFile is an async function
			// 			// console.log("imageurl", imageurl);
			// 			return { ...updatedItem, image: imageurl }; // Update the image URL
			// 		}
			// 		return updatedItem; // Return the item unchanged if no image update is needed
			// 	})
			// );
			res.status(200).json({
				data: {
					data: {
						success: 1,
						quickworkout: quickworkouts,
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

const getQuickworkoutExercise = async (req, res) => {
	try {
		if (req.body.quickworkout_id) {
			
			const quickworkoutexercises = await yogaworkoutQuickworkoutexercise.aggregate([
				{
					$match: { quickworkout_Id: new mongoose.Types.ObjectId(req.body.quickworkout_id) },
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
			// const quickworkoutexercisesWithImages = await Promise.all(
			// 	quickworkoutexercises.map(async (item) => {
			// 		const updatedItem = item.toObject ? item.toObject() : item;
			// 		if (item.exercise_Id?.image !== '') {
			// 			const imageurl = await getFile(item?.image); // Assuming getFile is an async function
			// 			// console.log("imageurl", imageurl);
			// 			return {
			// 				...updatedItem,
			// 				image: imageurl,
			// 			}; // Update the image URL
			// 		}
			// 		return updatedItem; // Return the item unchanged if no image update is needed
			// 	})
			// );
			res.status(200).json({
				data: { success: 1, exercise: quickworkoutexercises, error: '' },
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
			data: { success: 0, exercise: [], error: 'Server Error' },
		});
	}
}

module.exports = { getAllQuickworkouts, getQuickworkoutExercise };
