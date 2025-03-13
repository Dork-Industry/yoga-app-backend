const yogaworkoutCategoryexercise = require('../../models/categoryexercise');
const s3 = require('../../utility/s3');

const getExerciseByCategoryId = async (req, res) => {
	try {
		if (req.body.category_id) {
			const category_Id = req.body.category_id;
			const categoryexercises = await yogaworkoutCategoryexercise.aggregate([
				{
					$match: { categoryId: category_Id },
				},
				{
					$lookup: {
						from: 'yogaworkoutExercise',
						localField: 'exerciseId',
						foreignField: 'exerciseId',
						as: 'Exercise',
					},
				},
				{
					$unwind: '$Exercise', // Deconstruct the Exercise array
				},
				{
					$replaceRoot: { newRoot: '$Exercise' }, // Replace the root with the Exercise document
				},
				{
					$project: {
						totalDays: 0, // Exclude the totalDays field if it exists
					},
				},
			]);
			const categoryexercisesWithImages = await Promise.all(
				categoryexercises.map(async (item) => {
					const updatedItem = item.toObject ? item.toObject() : item;
					if (item.exercise_Id?.image !== '') {
						const imageurl = await s3.getFile(item?.image); // Assuming getFile is an async function
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
				data: { success: 1, exercise: categoryexercisesWithImages, error: '' },
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
