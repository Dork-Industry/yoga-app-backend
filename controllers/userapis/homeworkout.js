const yogaworkoutHomeWorkout = require('../../models/homeworkout');
const { checkUserLogin } = require('./user');

const getHomeWorkout = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != ''
		) {
			const checkuserLogin = await checkUserLogin(
				data.user_id,
				data.session,
				data.device_id
			);
			if (!checkuserLogin) {
				res.status(201).json({
					data: { success: 0, homeworkout: [], error: 'Please login first' },
				});
			}
			const result = await yogaworkoutHomeWorkout.aggregate([
				{
					$match: { userId: data.user_id },
				},
			]);
			res.status(200).json({
				data: { success: 1, homeworkout: result, error: '' },
			});
		} else {
			res.status(200).json({
				data: { success: 0, homeworkout: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, homeworkout: [], error: 'Server Error' },
		});
	}
};

const homeWorkout = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != ''
		) {
			const checkuserLogin = await checkUserLogin(
				data.user_id,
				data.session,
				data.device_id
			);
			if (checkuserLogin) {
				let customPlan = await yogaworkoutCustomPlan
					.find({ user_id: data.user_id })
					.sort({ createdAt: -1 });
				if (customPlan.length === 0) {
					return res.status(400).json({
						data: { success: 0, homeworkout: [], error: 'Please Try Again' },
					});
				} else {
					const customPlanWithExercise = await Promise.all(
						customPlan.map(async (item) => {

							let totalexercise = await yogaworkoutCustomPlanExercise.find({
								custom_plan_id: item._id
							});
							return { ...updatedItem, totalexercise: totalexercise.length }; // Update the image URL

							// return updatedItem; // Return the item unchanged if no image update is needed
						})
					);
					res.status(200).json({
						data: { success: 1, homeworkout: customPlanWithExercise, error: '' },
					});
				}
			} else {
				res.status(201).json({
					data: { success: 0, homeworkout: [], error: 'Please login first' },
				});
			}
		} else {
			res.status(200).json({
				data: { success: 1, homeworkout: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, homeworkout: [], error: 'Server Error' },
		});
	}
}

module.exports = {
	getHomeWorkout,
	homeWorkout
};
