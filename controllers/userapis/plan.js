const yogaworkoutPlan = require('../../models/plan');
const { getFile } = require('../../utility/s3');
const { checkUserLogin } = require('./user');

const getPlan = async (req, res) => {
	try {
		// let totalweekanddaycompleted = await getTotalDayCompleted(item._id,)
		const data = req.body;
		if (data.user_id && data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != ''
		) {
			const session = data.session;
			const deviceId = data.device_id;
			const checkuserLogin = await checkUserLogin(userId, session, deviceId);
			if (checkuserLogin) {
				let plan = await yogaworkoutPlan
					.find({ isActive: 1 })
					.sort({ createdAt: -1 });
				if (plan.length === 0) {
					return res.status(400).json({
						data: { success: 0, plan: [], error: 'Please Try Again' },
					});
				} else {
					
					res.status(200).json({
						data: { success: 1, plan: plan, error: '' },
					});
				}
			} else {
				res.status(201).json({
					data: { success: 0, plan: [], error: 'Please login first' },
				});
			}
		}
		else {
			res.status(200).json({
				data: { success: 1, plan: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, plan: [], error: 'Server Error' },
		});
	}
};

module.exports = { getPlan };
