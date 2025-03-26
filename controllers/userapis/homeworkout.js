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
				return res.status(201).json({
					data: { success: 0, homeworkout: [], error: 'Please login first' },
				});
			}
			// const result = await yogaworkoutHomeWorkout.aggregate([
			// 	{
			// 		$match: { user_Id: data.user_id },
			// 	},
			// ]);
			const result = await yogaworkoutHomeWorkout.find({
				user_Id: data.user_id,
			});
			if (result.length > 0) {
				res.status(200).json({
					data: { success: 1, homeworkout: result, error: '' },
				});
			} else {
				res.status(200).json({
					data: { success: 0, homeworkout: [], error: 'No HomeWorkOut Found' },
				});
			}
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
				if (
					data.workouts &&
					data.workouts != '' &&
					data.kcal &&
					data.kcal != '' &&
					data.duration &&
					data.duration != ''
				) {
					const homeworkout = await yogaworkoutHomeWorkout.find({
						user_Id: data.user_id,
					});
					let updatedHomeWorkout;
					if (homeworkout.length > 0) {
						updatedHomeWorkout = await yogaworkoutHomeWorkout
							.findOneAndUpdate(
								{ user_Id: data.user_id },
								{
									workouts: data.workouts,
									kcal: data.kcal,
									duration: data.duration,
								},
								{ new: true }
							)
							.then((updatedData) => {
								return updatedData;
							})
							.catch((err) => {
								console.log('Error updating homeWorkout : ', err);
							});
					} else {
						const newHomeWorkout = new yogaworkoutHomeWorkout({
							user_Id: data.user_id,
							workouts: data.workouts,
							kcal: data.kcal,
							duration: data.duration,
						});
						updatedHomeWorkout = await newHomeWorkout.save();
					}

					if (updatedHomeWorkout.length >0) {
						res.status(200).json({
							data: {
								success: 1,
								homeworkout: updatedHomeWorkout[0],
								error: 'Home Workout Added Successfully',
							},
						});
					} else {
						res.status(200).json({
							data: {
								success: 0,
								homeworkout: {},
								error: 'Error in Adding HomeWorkout',
							},
						});
					}
				} else {
					res.status(200).json({
						data: { success: 0, homeworkout: [], error: 'Variable not set' },
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
};

module.exports = {
	getHomeWorkout,
	homeWorkout,
};
