const { getFile } = require('../../utility/s3');
const { checkUserLogin } = require('./user');
const yogaworkoutCustomPlan = require('../../models/customplan');
const yogaworkoutCustomPlanExercise = require('../../models/customplanexercise');
const yogaworkoutExercises = require('../../models/exercise');

// Method to get exercise details
const getExerciseDetail = async (exerciseId) => {
	try {
		const exerciseDetail = await yogaworkoutExercises
			.findOne({
				_id: exerciseId,
			})
			.exec();
		return exerciseDetail;
	} catch (err) {
		console.error('Error fetching exercise detail:', err);
		return null;
	}
};

// Main function to get custom plan exercises
const getCustomPlanExercises = async (customPlanId) => {
	try {
		// Fetching all custom plan exercises for a given custom_plan_id
		const exercises = await yogaworkoutCustomPlanExercise
			.find({
				custom_plan_id: customPlanId,
			})
			.sort({ _id: 1 }) // Sorting by custom_plan_exercise_id ascending
			.exec();

		if (exercises.length > 0) {
			const array = [];

			for (const exercise of exercises) {
				// Fetch exercise details for each exercise_id
				const exercisedetail = await getExerciseDetail(exercise.exercise_id);

				// Building the result array
				array.push({
					custom_plan_exercise_id: exercise.custom_plan_exercise_id,
					custom_plan_id: exercise.custom_plan_id,
					exercise_time: exercise.exercise_time,
					exercisedetail: exercisedetail,
				});
			}

			return array; // Return the result array
		} else {
			return false; // Return false if no exercises found
		}
	} catch (err) {
		console.error('Error fetching custom plan exercises:', err);
		return false;
	}
};

const getCustomPlanExercise = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != '' &&
			data.custom_plan_id &&
			data.custom_plan_id != ''
		) {
			const checkuserLogin = await checkUserLogin(
				data.user_id,
				data.session,
				data.device_id
			);
			if (checkuserLogin) {
				let customplanexercise = await getCustomPlanExercises(
					data.custom_plan_id
				);
				if (customplanexercise) {
					return res.status(200).json({
						data: {
							success: 0,
							customplanexercise: customplanexercise,
							error: '',
						},
					});
				} else {
					res.status(400).json({
						data: {
							success: 0,
							customplanexercise: [],
							error: 'Please Try Again',
						},
					});
				}
			} else {
				res.status(201).json({
					data: {
						success: 0,
						customplanexercise: [],
						error: 'Please login first',
					},
				});
			}
		} else {
			res.status(200).json({
				data: { success: 0, customplanexercise: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, customplanexercise: [], error: 'Server Error' },
		});
	}
};

const customPlanExercise = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != '' &&
			data.custom_plan_id &&
			data.custom_plan_id != '' &&
			data.exercise_id &&
			data.exercise_id != '' &&
			data.exercise_time &&
			data.exercise_time != ''
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
						addcustomplanexercise: [],
						error: 'Please login first',
					},
				});
			}

			const time = new Date(); // Using current time for created_at and updated_at

			// Create a new instance of the CustomPlanExercise model
			const newCustomPlanExercise = new yogaworkoutCustomPlanExercise({
				custom_plan_id: data.custom_plan_id,
				exercise_id: data.exercise_id,
				exercise_time: data.exercise_time,
				created_at: time,
				updated_at: time,
			});

			// Save the new document to the database
			const savedExercise = await newCustomPlanExercise.save();

			// Check if the save was successful
			if (savedExercise) {
				res.status(200).json({
					data: {
						success: 1,
						addcustomplanexercise: [],
						error: 'Add Custom Plan Exercise',
					},
				});
			} else {
				res.status(200).json({
					data: {
						success: 0,
						addcustomplanexercise: [],
						error: 'Please Try Again',
					},
				});
			}
		} else {
			res.status(200).json({
				data: {
					success: 0,
					addcustomplanexercise: [],
					error: 'Variable not set',
				},
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, addcustomplanexercise: [], error: 'Server Error' },
		});
	}
};

const editCustomPlanExercise = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != '' &&
			data.custom_plan_id &&
			data.custom_plan_id != '' &&
			data.exercise_id &&
			data.exercise_id != '' &&
			data.exercise_time &&
			data.exercise_time != '' &&
			data.custom_plan_exercise_id &&
			data.custom_plan_exercise_id != ''
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
						editcustomplanexercise: [],
						error: 'Please login first',
					},
				});
			}
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, editcustomplanexercise: [], error: 'Server Error' },
		});
	}
};

const deleteCustomPlanExercise = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != '' &&
			data.custom_plan_exercise_id &&
			data.custom_plan_exercise_id != ''
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
						deletecustomplanexercise: [],
						error: 'Please login first',
					},
				});
			}
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, deletecustomplanexercise: [], error: 'Server Error' },
		});
	}
};

module.exports = {
	getCustomPlanExercise,
	customPlanExercise,
	editCustomPlanExercise,
	deleteCustomPlanExercise,
};
