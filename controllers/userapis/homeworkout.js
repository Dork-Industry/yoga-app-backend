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

module.exports = {
	getHomeWorkout,
};
