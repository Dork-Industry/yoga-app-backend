const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutDaysCompleted = require('../../models/dayscompleted')
const { checkUserLogin } = require('./user');


const dayCompleted = async (req, res) => {
	try {
		const data = req.body;
		if (data.user_id && data.user_id != "" &&
			data.session && data.session != "" &&
			data.device_id && data.device_id != ""
		) {
			const checkuserLogin = await checkUserLogin(data.user_id, data.session, data.device_id);
			if (checkuserLogin) {
				if (data.week_id && data.week_id != "" && data.days_id && data.days_id != '') {
					const newDayCompleted = new yogaworkoutDaysCompleted({
						user_id: data.user_id,
						week_id: data.week_id,
						days_id : data.days_id,
						is_completed: 1
					})

					await newDayCompleted.save();
					res.status(201).json({ data: { success: 1, weekcompleted: newDayCompleted, error: 'Day Completed Successfully!' } });
				}
				else {
					res.status(201).json({ data: { success: 0, daycompleted: [], error: 'Variable not set!' } });
				}
			}
			else {
				res.status(201).json({ data: { success: 0, daycompleted: [], error: 'Please login first!' } });
			}
		}
		else{
			res.status(201).json({ data: { success: 0, daycompleted: [], error: 'Variable not set!' } });
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, daycompleted: [], error: 'Server Error' },
		});
	}
};



module.exports = {
	dayCompleted
};
