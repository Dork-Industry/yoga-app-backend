const mongoose = require('mongoose');
const yogaworkoutQuickworkoutexercise = require('../models/quickworkoutexercise');
const yogaworkoutQuickworkout = require('../models/quickworkout');
const yogaworkoutExercise = require('../models/exercise');
const s3 = require('../utility/s3');

/**
 * @api {post} /addQuickworkoutexercises
 * @apiName addQuickworkoutexercises
 * @apiGroup Quickworkoutexercise
 * @apiParam {ObjectId} quickworkout_id Quickworkout ID
 * @apiParam {ObjectId[]} exercise_ids Exercise IDs
 * @apiSuccess {Object} Quickworkout and exercises added successfully
 * @apiError {Object} Invalid Quickworkout ID
 * @apiError {Object} exercise_ids must be a non-empty array
 * @apiError {Object} Invalid Exercise ID format
 * @apiError {Object} One or more Exercise IDs are invalid
 * @apiError {Object} Server Error
 */
const addQuickworkoutexercises = async (req, res) => {
	try {
		// Utility function to validate ObjectId
		const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
		const { quickworkout_id, exercise_ids } = req.body;

		if (!mongoose.Types.ObjectId.isValid(quickworkout_id)) {
			return res.status(400).json({ message: 'Invalid Quickworkout ID' });
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

		let quickworkout = await yogaworkoutQuickworkout.findOne({
			_id: quickworkout_id,
		});
		if (!quickworkout) {
			return res.status(404).json({ message: 'Quickworkout not found' });
		}

		const existingRecords = await yogaworkoutQuickworkoutexercise.find({
			quickworkout_Id: quickworkout._id,
			exercise_Id: { $in: exercise_ids },
		});
		const existingExerciseIds = existingRecords.map((record) =>
			record.exercise_Id.toString()
		);
		const newExercises = exercise_ids.filter(
			(id) => !existingExerciseIds.includes(id)
		);

		if (newExercises.length > 0) {
			await yogaworkoutQuickworkoutexercise.insertMany(
				newExercises.map((exercise_id) => ({
					quickworkout_Id: quickworkout._id,
					exercise_Id: exercise_id,
				}))
			);
		}

		res.status(201).json({
			message: 'Quickworkout and exercises added successfully',
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {get} /getExerciseByQuickworkoutId/:id
 * @apiName getExerciseByQuickworkoutId
 * @apiGroup Quickworkoutexercise
 * @apiParam {ObjectId} id Quickworkout ID
 * @apiSuccess {Object[]} quickworkoutexercises Array of all quickworkoutexercise
 * @apiError {Object} No Quickworkoutexercise Added!
 * @apiError {Object} Server Error
 */
const getExerciseByQuickworkoutId = async (req, res) => {
	try {
		const quickworkout_Id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(quickworkout_Id)) {
			return res.status(400).json({ message: 'Invalid Quickworkout ID' });
		}

		const quickworkoutexercises = await yogaworkoutQuickworkoutexercise
			.find({
				quickworkout_Id: quickworkout_Id,
			})
			.populate({
				path: 'quickworkout_Id',
				select: '_id quickworkout',
			})
			.populate({
				path: 'exercise_Id',
				select: '_id exerciseName description exerciseTime image',
			});
		if (quickworkoutexercises.length === 0) {
			return res.status(400).json({
				message: 'No Quickworkoutexercise Added!',
			});
		} else {
			// const quickworkoutexercisesWithImages = await Promise.all(
			// 	quickworkoutexercises.map(async (item) => {
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
				quickworkoutexercises: quickworkoutexercises,
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
 * @api {delete} /deleteQuickworkoutexercise/:id
 * @apiName deleteQuickworkoutexercise
 * @apiGroup Quickworkoutexercise
 * @apiParam {ObjectId} id Quickworkoutexercise ID
 * @apiSuccess {Object} Quickworkoutexercise deleted successfully!
 * @apiError {Object} Invalid ObjectId
 * @apiError {Object} Quickworkoutexercise not found
 * @apiError {Object} Failed to delete Quickworkoutexercise
 */
const deleteQuickworkoutexercise = async (req, res) => {
	const quickworkoutexerciseId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(quickworkoutexerciseId)) {
		return res.status(400).json({ message: 'Invalid Quickworkoutexercise ID' });
	}

	try {
		const deletedQuickworkoutexercise =
			await yogaworkoutQuickworkoutexercise.deleteOne({
				_id: quickworkoutexerciseId,
			});

		if (deletedQuickworkoutexercise.deletedCount === 0) {
			return res.status(404).json({ message: 'Quickworkoutexercise not found' });
		}

		res.json({
			message: 'Quickworkoutexercise deleted successfully',
			deletedQuickworkoutexercise,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Quickworkoutexercise' });
	}
};

/**
 * @api {post} /changeQuickworkoutexerciseStatus
 * @apiName changeQuickworkoutexerciseStatus
 * @apiGroup Quickworkoutexercise
 * @apiParam {String} id Quickworkoutexercise ID
 * @apiParam {Number} status Quickworkoutexercise Status
 * @apiSuccess {Object} Updated Quickworkoutexercise object
 * @apiError {Object} Quickworkoutexercise not found
 * @apiError {Object} Invalid ObjectId
 */
const changeQuickworkoutexerciseStatus = async (req, res) => {
	let quickworkoutexerciseStatusId = req.body.id.toString();
	let quickworkoutexerciseStatusStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(quickworkoutexerciseStatusId)) {
		const updatedQuickworkoutexercise =
			await yogaworkoutQuickworkoutexercise.findOneAndUpdate(
				{ _id: quickworkoutexerciseStatusId },
				{ $set: { isActive: quickworkoutexerciseStatusStatus } },
				{ returnDocument: 'after' }
			);

		if (!updatedQuickworkoutexercise) {
			return res.status(404).json({ message: 'Quickworkoutexercise not found' });
		}

		res.json(updatedQuickworkoutexercise);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	addQuickworkoutexercises,
	getExerciseByQuickworkoutId,
	deleteQuickworkoutexercise,
	changeQuickworkoutexerciseStatus,
};
