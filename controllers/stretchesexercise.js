const mongoose = require('mongoose');
const yogaworkoutStretchesexercise = require('../models/stretchesexercise');
const yogaworkoutStretches = require('../models/stretches');
const yogaworkoutExercise = require('../models/exercise');
const s3 = require('../utility/s3');

/**
 * @api {post} /addStretchesexercises
 * @apiName addStretchesexercises
 * @apiGroup Stretchesexercise
 * @apiParam {ObjectId} stretches_id Stretches ID
 * @apiParam {ObjectId[]} exercise_ids Exercise IDs
 * @apiSuccess {Object} Stretches and exercises added successfully
 * @apiError {Object} Invalid Stretches ID
 * @apiError {Object} exercise_ids must be a non-empty array
 * @apiError {Object} Invalid Exercise ID format
 * @apiError {Object} One or more Exercise IDs are invalid
 * @apiError {Object} Server Error
 */
const addStretchesexercises = async (req, res) => {
	try {
		// Utility function to validate ObjectId
		const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
		const { stretches_id, exercise_ids } = req.body;

		if (!mongoose.Types.ObjectId.isValid(stretches_id)) {
			return res.status(400).json({ message: 'Invalid Stretches ID' });
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

		let stretches = await yogaworkoutStretches.findOne({ _id: stretches_id });
		if (!stretches) {
			return res.status(404).json({ message: 'Stretches not found' });
		}

		const existingRecords = await yogaworkoutStretchesexercise.find({
			stretches_Id: stretches._id,
			exercise_Id: { $in: exercise_ids },
		});
		const existingExerciseIds = existingRecords.map((record) =>
			record.exercise_Id.toString()
		);
		const newExercises = exercise_ids.filter(
			(id) => !existingExerciseIds.includes(id)
		);

		if (newExercises.length > 0) {
			await yogaworkoutStretchesexercise.insertMany(
				newExercises.map((exercise_id) => ({
					stretches_Id: stretches._id,
					exercise_Id: exercise_id,
				}))
			);
		}

		res.status(201).json({
			message: 'Stretches and exercises added successfully',
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {get} /getExerciseByStretchesId/:id
 * @apiName getExerciseByStretchesId
 * @apiGroup Stretchesexercise
 * @apiParam {ObjectId} id Stretches ID
 * @apiSuccess {Object[]} stretchesexercises Array of all stretchesexercise
 * @apiError {Object} No Stretchesexercise Added!
 * @apiError {Object} Server Error
 */
const getExerciseByStretchesId = async (req, res) => {
	try {
		const stretches_Id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(stretches_Id)) {
			return res.status(400).json({ message: 'Invalid Stretches ID' });
		}

		const stretchesexercises = await yogaworkoutStretchesexercise
			.find({
				stretches_Id: stretches_Id,
			})
			.populate({
				path: 'stretches_Id',
				select: '_id stretches',
			})
			.populate({
				path: 'exercise_Id',
				select: '_id exerciseName description exerciseTime image',
			});
		if (stretchesexercises.length === 0) {
			return res.status(400).json({
				message: 'No Stretchesexercise Added!',
			});
		} else {
			const stretchesexercisesWithImages = await Promise.all(
				stretchesexercises.map(async (item) => {
					const updatedItem = item.toObject ? item.toObject() : item;
					if (item.exercise_Id?.image !== '') {
						const imageurl = await s3.getFile(item.exercise_Id?.image); // Assuming getFile is an async function
						// console.log("imageurl", imageurl);
						return {
							...updatedItem,
							exercise_Id: { ...updatedItem.exercise_Id, image: imageurl },
						}; // Update the image URL
					}
					return updatedItem; // Return the item unchanged if no image update is needed
				})
			);
			res.status(200).json({
				stretchesexercises: stretchesexercisesWithImages,
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
 * @api {delete} /deleteStretchesexercise/:id
 * @apiName deleteStretchesexercise
 * @apiGroup Stretchesexercise
 * @apiParam {ObjectId} id Stretchesexercise ID
 * @apiSuccess {Object} Stretchesexercise deleted successfully!
 * @apiError {Object} Invalid ObjectId
 * @apiError {Object} Stretchesexercise not found
 * @apiError {Object} Failed to delete Stretchesexercise
 */
const deleteStretchesexercise = async (req, res) => {
	const stretchesexerciseId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(stretchesexerciseId)) {
		return res.status(400).json({ message: 'Invalid Stretchesexercise ID' });
	}

	try {
		const deletedStretchesexercise =
			await yogaworkoutStretchesexercise.deleteOne({
				_id: stretchesexerciseId,
			});

		if (deletedStretchesexercise.deletedCount === 0) {
			return res.status(404).json({ message: 'Stretchesexercise not found' });
		}

		res.json({
			message: 'Stretchesexercise deleted successfully',
			deletedStretchesexercise,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Stretchesexercise' });
	}
};

/**
 * @api {post} /changeStretchesexerciseStatus
 * @apiName changeStretchesexerciseStatus
 * @apiGroup Stretchesexercise
 * @apiParam {String} id Stretchesexercise ID
 * @apiParam {Number} status Stretchesexercise Status
 * @apiSuccess {Object} Updated Stretchesexercise object
 * @apiError {Object} Stretchesexercise not found
 * @apiError {Object} Invalid ObjectId
 */
const changeStretchesexerciseStatus = async (req, res) => {
	let stretchesexerciseStatusId = req.body.id.toString();
	let stretchesexerciseStatusStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(stretchesexerciseStatusId)) {
		const updatedStretchesexercise =
			await yogaworkoutStretchesexercise.findOneAndUpdate(
				{ _id: stretchesexerciseStatusId },
				{ $set: { isActive: stretchesexerciseStatusStatus } },
				{ returnDocument: 'after' }
			);

		if (!updatedStretchesexercise) {
			return res.status(404).json({ message: 'Stretchesexercise not found' });
		}

		res.json(updatedStretchesexercise);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	addStretchesexercises,
	getExerciseByStretchesId,
	deleteStretchesexercise,
	changeStretchesexerciseStatus,
};
