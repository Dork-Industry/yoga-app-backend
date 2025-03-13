const yogaworkoutChallengesexercise = require('../../models/challengesexercise');
const s3 = require('../../utility/s3');

const getChallengesExercise = async (req, res) => {
	try {
		if (req.body.days_id) {
			let days_id = req.body.days_id;
			const result = await yogaworkoutChallengesexercise.aggregate([
				{
					$match: { daysId: days_id },
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
			const challengesexercisesWithImages = await Promise.all(
				result.map(async (item) => {
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
				data: {
					success: 1,
					exercise: challengesexercisesWithImages,
					error: '',
				},
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

module.exports = { getChallengesExercise };
