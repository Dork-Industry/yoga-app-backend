const { mongoose, ObjectId } = require('mongoose');
// const yogaworkoutWeek = require('../../models/week');
const yogaworkoutWeekCompleted = require('../../models/weekcompleted');
const { checkUserLogin } = require('./user');


const weekCompleted = async (req, res) => {
	try {
		const data = req.body;
		if (data.user_id && data.user_id != "" &&
			data.session && data.session != "" &&
			data.device_id && data.device_id != ""
		) {
			const checkuserLogin = await checkUserLogin(data.user_id, data.session, data.device_id);
			if (checkuserLogin) {
				if (data.week_id && data.week_id != "") {
					const newWeekCompleted = new yogaworkoutWeekCompleted({
						user_id: data.user_id,
						week_id: data.week_id,
						is_completed: 1
					})

					await newWeekCompleted.save();
					res.status(201).json({ data: { success: 1, weekcompleted: newWeekCompleted, error: 'Week Completed Successfully!' } });
				}
				else {
					res.status(201).json({ data: { success: 0, weekcompleted: [], error: 'Variable not set!' } });
				}
			}
			else {
				res.status(201).json({ data: { success: 0, weekcompleted: [], error: 'Please login first!' } });
			}
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, week: [], error: 'Server Error' },
		});
	}
};



module.exports = {
	weekCompleted
};
