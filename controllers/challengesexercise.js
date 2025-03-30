const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutChallengesexercise = require('../models/challengesexercise');
const yogaworkoutDays = require('../models/days');
const yogaworkoutExercise = require('../models/exercise');
const s3 = require('../utility/s3');

/**
 * @api {post} /addChallengesexercises
 * @apiName addChallengesexercises
 * @apiGroup Challengesexercise
 * @apiParam {ObjectId} day_id Day ID
 * @apiParam {ObjectId[]} exercise_ids Exercise IDs
 * @apiSuccess {Object} Day and exercises added successfully
 * @apiError {Object} Invalid Day ID
 * @apiError {Object} exercise_ids must be a non-empty array
 * @apiError {Object} Invalid Exercise ID format
 * @apiError {Object} One or more Exercise IDs are invalid
 * @apiError {Object} Server Error
 */
const addChallengesexercises = async (req, res) => {
	try {
		// Utility function to validate ObjectId
		const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
		const { day_id, exercise_ids } = req.body;

		if (!mongoose.Types.ObjectId.isValid(day_id)) {
			return res.status(400).json({ message: 'Invalid Day ID' });
		}
		if (!Array.isArray(exercise_ids) || exercise_ids.length === 0) {
			return res
				.status(400)
				.json({ message: 'exercise_ids must be a non-empty array' });
		}
		if (!exercise_ids.every(isValidObjectId)) {
			return res.status(400).json({ message: 'Invalid Exercise ID format' });
		}
		const exercises = await yogaworkoutExercise.find({
			_id: { $in: exercise_ids },
		});
		if (exercises.length !== exercise_ids.length) {
			return res
				.status(400)
				.json({ message: 'One or more Exercise IDs are invalid' });
		}

		let day = await yogaworkoutDays.findOne({ _id: day_id });
		if (!day) {
			return res.status(404).json({ message: 'Day not found' });
		}

		const existingRecords = await yogaworkoutChallengesexercise.find({
			days_Id: day._id,
			exercise_Id: { $in: exercise_ids },
		});
		const existingExerciseIds = existingRecords.map((record) =>
			record.exercise_Id.toString()
		);
		const newExercises = exercise_ids.filter(
			(id) => !existingExerciseIds.includes(id)
		);

		if (newExercises.length > 0) {
			await yogaworkoutChallengesexercise.insertMany(
				newExercises.map((exercise_id) => ({
					days_Id: day._id,
					exercise_Id: exercise_id,
				}))
			);
		}

		res.status(201).json({
			message: 'Day and exercises added successfully',
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {get} /getExerciseByDaysId/:id
 * @apiName getExerciseByDaysId
 * @apiGroup Challengesexercise
 * @apiParam {ObjectId} id Day ID
 * @apiSuccess {Object[]} challengesexercises Array of all challengesexercise
 * @apiError {Object} No Challengesexercise Added!
 * @apiError {Object} Server Error
 */
const getExerciseByDaysId = async (req, res) => {
	try {
		const day_Id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(day_Id)) {
			return res.status(400).json({ message: 'Invalid Day ID' });
		}

		const challengesexercises = await yogaworkoutChallengesexercise
			.find({
				days_Id: day_Id,
			})
			.populate({
				path: 'days_Id',
				select: '_id daysName',
			})
			.populate({
				path: 'exercise_Id',
				select: '_id exerciseName description exerciseTime image',
			});
		if (challengesexercises.length === 0) {
			return res.status(200).json({
				message: 'No Challengesexercise Added!',
				challengesexercises : []
			});
		} else {
			// const challengesexercisesWithImages = await Promise.all(
			// 	challengesexercises.map(async (item) => {
			// 		const updatedItem = item.toObject ? item.toObject() : item;
			// 		if (item.exercise_Id?.image !== '') {
			// 			const imageurl = await s3.getFile(item.exercise_Id?.image); // Assuming getFile is an async function
			// 			// console.log("imageurl", imageurl);
			// 			return {
			// 				...updatedItem,
			// 				exercise_Id: { ...updatedItem.exercise_Id, image: imageurl },
			// 			}; // Update the image URL
			// 		}
			// 		return updatedItem; // Return the item unchanged if no image update is needed
			// 	})
			// );
			res.status(200).json({
				challengesexercises: challengesexercises,
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {delete} /deleteChallengesexercise/:id
 * @apiName deleteChallengesexercise
 * @apiGroup Challengesexercise
 * @apiParam {ObjectId} id Challengesexercise ID
 * @apiSuccess {Object} Challengesexercise deleted successfully!
 * @apiError {Object} Invalid ObjectId
 * @apiError {Object} Challengesexercise not found
 * @apiError {Object} Failed to delete Challengesexercise
 */
const deleteChallengesexercise = async (req, res) => {
	const challengesexerciseId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(challengesexerciseId)) {
		return res.status(400).json({ message: 'Invalid Challengesexercise ID' });
	}

	try {
		const deletedChallengesexercise =
			await yogaworkoutChallengesexercise.deleteOne({
				_id: challengesexerciseId,
			});

		if (deletedChallengesexercise.deletedCount === 0) {
			return res.status(404).json({ message: 'Challengesexercise not found' });
		}

		res.json({
			message: 'Challengesexercise deleted successfully',
			deletedChallengesexercise,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Challengesexercise' });
	}
};

/**
 * @api {post} /changeChallengesexerciseStatus
 * @apiName changeChallengesexerciseStatus
 * @apiGroup Challengesexercise
 * @apiParam {String} id Challengesexercise ID
 * @apiParam {Number} status Challengesexercise Status
 * @apiSuccess {Object} Updated Challengesexercise object
 * @apiError {Object} Challengesexercise not found
 * @apiError {Object} Invalid ObjectId
 */
const changeChallengesexerciseStatus = async (req, res) => {
	let ChallengesexerciseStatusId = req.body.id.toString();
	let ChallengesexerciseStatusStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(ChallengesexerciseStatusId)) {
		const updatedChallengesexercise =
			await yogaworkoutChallengesexercise.findOneAndUpdate(
				{ _id: ChallengesexerciseStatusId },
				{ $set: { isActive: ChallengesexerciseStatusStatus } },
				{ returnDocument: 'after' }
			);

		if (!updatedChallengesexercise) {
			return res.status(404).json({ message: 'Challengesexercise not found' });
		}

		res.json(updatedChallengesexercise);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	addChallengesexercises,
	getExerciseByDaysId,
	deleteChallengesexercise,
	changeChallengesexerciseStatus,
};
