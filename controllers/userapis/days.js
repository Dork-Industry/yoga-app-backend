const { mongoose, ObjectId } = require('mongoose');
const { checkUserLogin } = require('./user');
const yogaworkoutDays = require('../../models/days');
const yogaworkoutDaysCompleted = require('../../models/dayscompleted');

/**
 * @api {get} /getDays
 * @apiName getAllDays
 * @apiGroup Day
 * @apiSuccess {Object[]} days Array of all days
 * @apiError {Object} No Challenges Added!
 * @apiError {Object} Server Error
 */
const getDay = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id !== '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != ''
		) {
			const userId = data.user_id;
			const session = data.session;
			const deviceId = data.device_id;
			const checkuserLogin = await checkUserLogin(userId, session, deviceId);
			if (!checkuserLogin) {
				return res.status(201).json({
					data: { success: 0, days: [], error: 'Please login first' },
				});
			}
		} else {
			data.user_id = new mongoose.Types.ObjectId();
		}
		if (data.week_id) {
			let week_id = data.week_id;
			const result = await yogaworkoutDays.aggregate([
				{
					$match: { week_Id: new mongoose.Types.ObjectId(week_id) },
				},
				{
					$lookup: {
						from: 'yogaworkoutChallengesexercise',
						localField: '_id',
						foreignField: 'days_Id',
						as: 'exercises',
					},
				},
				{
					$project: {
						_id: 1,
						daysName: 1,
						week_Id: 1,
						totalExercises: { $size: '$exercises' },
					},
				},
			]);
			let daysWithCompletionStatus = result;
			if (data.user_id && data.user_id !== '' && result.length) {
				// Check if the user has completed each day
				daysWithCompletionStatus = await Promise.all(
					result.map(async (day) => {
						const dayCompleted = await yogaworkoutDaysCompleted.findOne({
							days_id: day._id,
							user_id: data.user_id,
						});
						return {
							...day,
							is_completed: dayCompleted ? 1 : 0,
						};
					})
				);
			}
			res.status(200).json({
				data: { success: 1, days: daysWithCompletionStatus, error: '' },
			});
		} else {
			res.status(200).json({
				data: { success: 0, days: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, days: [], error: 'Server Error' },
		});
	}
};

module.exports = {
	getDay,
};
