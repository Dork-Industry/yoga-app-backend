const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutworkoutCompleted = require('../../models/workoutcompleted');
const { checkUserLogin } = require('./user');
const yogaworkoutChallenges = require('../../models/challenges');
const yogaworkoutWeek = require('../../models/week');
const yogaworkoutDays = require('../../models/days');
const yogaworkoutDaysCompleted = require('../../models/dayscompleted');
const yogaworkoutCategory = require('../../models/category');
const yogaworkoutDiscover = require('../../models/discover');
const yogaworkoutQuickworkout = require('../../models/quickworkout');
const yogaworkoutStretches = require('../../models/stretches');

const workoutCompleted = async (req, res) => {
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
					data.workout_type &&
					data.workout_type != '' &&
					data.workout_id &&
					data.workout_id != '' &&
					data.kcal &&
					data.kcal != '' &&
					data.completed_duration &&
					data.completed_duration != '' &&
					data.completed_date &&
					data.completed_date != ''
				) {
					const date_years = data.completed_date.split('-');
					const date_year = date_years[1] + '-' + date_years[0];
					const newWorkoutCompleted = new yogaworkoutworkoutCompleted({
						user_id: data.user_id,
						workout_type: data.workout_type,
						workout_id: data.workout_id,
						kcal: data.kcal,
						completed_duration: data.completed_duration,
						completed_date: data.completed_date,
						date_year: date_year,
					});

					const addedWorkoutCompleted = await newWorkoutCompleted.save();
					if (addedWorkoutCompleted) {
						res.status(201).json({
							data: {
								success: 1,
								workoutscompleted: addedWorkoutCompleted,
								error: 'Add Workout Completed!',
							},
						});
					} else {
						res.status(201).json({
							data: {
								success: 0,
								workoutscompleted: [],
								error: 'Please Try Again!',
							},
						});
					}
				} else {
					res.status(201).json({
						data: {
							success: 0,
							workoutscompleted: [],
							error: 'Variable not set!',
						},
					});
				}
			} else {
				res.status(201).json({
					data: {
						success: 0,
						workoutscompleted: [],
						error: 'Please login first!',
					},
				});
			}
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, workoutscompleted: [], error: 'Server Error' },
		});
	}
};

const getWorkoutCompleted = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != '' &&
			data.completed_date &&
			data.completed_date != ''
		) {
			const checkuserLogin = await checkUserLogin(
				data.user_id,
				data.session,
				data.device_id
			);
			if (!checkuserLogin) {
				return res.status(201).json({
					data: {
						success: 0,
						workoutcompleted: [],
						error: 'Please login first',
					},
				});
			}

			const workoutcompleted = await getWorkouts(
				data.user_id,
				data.completed_date
			);
			if (workoutcompleted) {
				res.status(201).json({
					data: {
						success: 1,
						workoutscompleted: workoutcompleted,
						error: '',
					},
				});
			} else {
				res.status(201).json({
					data: {
						success: 0,
						workoutscompleted: [],
						error: 'Please Try Again',
					},
				});
			}
		} else {
			res.status(201).json({
				data: {
					success: 0,
					workoutscompleted: [],
					error: 'Variable not set!',
				},
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, workoutcompleted: [], error: 'Server Error' },
		});
	}
};

const getWorkouts = async (user_id, completed_date) => {
	try {
		// Query to find workout completed based on user_id and completed_date
		const workouts = await yogaworkoutworkoutCompleted
			.find({
				user_id: user_id,
				completed_date: completed_date,
			})
			.sort({ _id: -1 }); // Sort by workouts_completed_id DESC

		if (workouts.length > 0) {
			const workoutResults = [];

			for (let data of workouts) {
				let workout_name = '';
				let workout_id = data.workout_id;
				let workout_type = data.workout_type;

				// Fetch workout name based on workout_type
				switch (workout_type) {
					case 1:
						const challenge = await getChallengesDayId(workout_id);
						workout_name = `${challenge.challenges_name}, ${challenge.week_name}, ${challenge.days_name}`;
						break;
					case 2:
						const category = await yogaworkoutCategory.findById(workout_id);
						workout_name = category.category;
						break;
					case 3:
						const discover = await yogaworkoutDiscover.findById(workout_id);
						workout_name = discover.discover;
						break;
					case 4:
						const quickWorkout = await yogaworkoutQuickworkout.findById(
							workout_id
						);
						workout_name = quickWorkout.quickworkout;
						break;
					case 5:
						const stretches = await yogaworkoutStretches.findById(workout_id);
						workout_name = stretches.stretches;
						break;
					default:
						workout_name = 'Unknown Workout';
						break;
				}

				// Prepare result array
				workoutResults.push({
					workouts_completed_id: data.workouts_completed_id,
					workout_type: workout_type,
					workout_id: workout_id,
					kcal: data.kcal,
					completed_duration: data.completed_duration,
					completed_date: data.completed_date,
					workout_name: workout_name,
				});
			}

			return workoutResults;
		} else {
			return false; // No workouts found
		}
	} catch (err) {
		console.error(err);
		return false;
	}
};

const getChallengesDayId = async (days_id) => {
	try {
		// Find the Day document by days_id
		const day = await yogaworkoutDays.findById(days_id).exec();
		if (!day) {
			return false; // No matching day found
		}

		// Find the Week document associated with this day
		const week = await yogaworkoutWeek.findById(day.week_id).exec();
		if (!week) {
			return false; // No matching week found
		}

		// Find the Challenge document associated with this week
		const challenge = await yogaworkoutChallenges
			.findById(week.challenges_Id)
			.exec();
		if (!challenge) {
			return false; // No matching challenge found
		}

		// Prepare and return the data array
		const result = {
			challenges_id: challenge._id,
			challenges_name: challenge.challengesName,
			week_name: week.weekName,
			days_name: day.daysName,
		};

		return result;
	} catch (err) {
		console.error(err);
		return false;
	}
};

module.exports = {
	workoutCompleted,
	getWorkoutCompleted,
};
