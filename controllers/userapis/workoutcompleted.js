const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutworkoutCompleted = require('../../models/workoutcompleted');
const { checkUserLogin } = require('./user');


const workoutCompleted = async (req, res) => {
	try {
		const data = req.body;
		if (data.user_id && data.user_id != "" &&
			data.session && data.session != "" &&
			data.device_id && data.device_id != ""
		) {
			const checkuserLogin = await checkUserLogin(data.user_id, data.session, data.device_id);
			if (checkuserLogin) {
				if (data.workout_type && data.workout_type != "" &&
					data.workout_id && data.workout_id != "" &&
					data.kcal && data.kcal != "" &&
					data.completed_duration && data.completed_duration != "" &&
					data.completed_date && data.completed_date != ""
				) {
					const date_years = data.completed_date.split("-")
					const date_year = date_years[1] + "-" + date_years[0];
					const newWorkoutCompleted = new yogaworkoutworkoutCompleted({
						workout_type: data.workout_type,
						workout_id: data.workout_id,
						kcal: data.kcal,
						completed_duration: data.completed_duration,
						completed_date: data.completed_date,
						date_year: date_year
					})

					const addedWorkoutCompleted = await newWorkoutCompleted.save();
					if (addedWorkoutCompleted) {
						res.status(201).json({ data: { success: 1, workoutscompleted: addedWorkoutCompleted, error: 'Add Workout Completed!' } });
					}
					else{
						res.status(201).json({ data: { success: 0, workoutscompleted: [], error: 'Please Try Again!' } });
					}

				}
				else {
					res.status(201).json({ data: { success: 0, workoutscompleted: [], error: 'Variable not set!' } });
				}
			}
			else {
				res.status(201).json({ data: { success: 0, workoutscompleted: [], error: 'Please login first!' } });
			}
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, workoutscompleted: [], error: 'Server Error' },
		});
	}
};



module.exports = {
	workoutCompleted
};
