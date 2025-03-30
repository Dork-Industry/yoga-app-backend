const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutCategoryexercise = require('../../models/categoryexercise');
const s3 = require('../../utility/s3');

const getExerciseByCategoryId = async (req, res) => {
	try {
		if (req.body.category_id) {
			const category_Id = req.body.category_id;
			const categoryexercises = await yogaworkoutCategoryexercise.aggregate([
				{
					$match: { category_Id: new mongoose.Types.ObjectId(category_Id) },
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
			// const categoryexercisesWithImages = await Promise.all(
			// 	categoryexercises.map(async (item) => {
			// 		const updatedItem = item.toObject ? item.toObject() : item;
			// 		if (item.exercise_Id?.image !== '') {
			// 			const imageurl = await s3.getFile(item?.image); // Assuming getFile is an async function
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
				data: { success: 1, exercise: categoryexercises, error: '' },
			});
		} else {
			res.status(200).json({
				data: { success: 0, exercise: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, exercise: [], error: 'Server Error' },
		});
	}
};

module.exports = {
	getExerciseByCategoryId,
};
