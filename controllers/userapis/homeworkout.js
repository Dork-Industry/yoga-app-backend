const yogaworkoutHomeWorkout = require('../../models/homeworkout');

const getHomeWorkout = async (req, res) => {
	try {
		if (req.body.user_id) {
			let user_id = req.body.user_id;
			const result = await yogaworkoutHomeWorkout.aggregate([
				{
					$match: { userId: user_id },
				},
			]);
			res.status(200).json({
				result,
			});
		} else {
			res.status(200).json({
				success: 0,
				week: [],
				error: 'Variable not set',
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

module.exports = {
	getHomeWorkout,
};
