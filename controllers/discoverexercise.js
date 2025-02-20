const mongoose = require('mongoose');
const yogaworkoutDiscoverexercise = require('../models/discoverexercise');
const yogaworkoutDiscover = require('../models/discover');
const yogaworkoutExercise = require('../models/exercise');
const s3 = require('../utility/s3');

/**
 * @api {post} /addDiscoverexercises
 * @apiName addDiscoverexercises
 * @apiGroup Discoverexercise
 * @apiParam {ObjectId} discover_id Discover ID
 * @apiParam {ObjectId[]} exercise_ids Exercise IDs
 * @apiSuccess {Object} Discover and exercises added successfully
 * @apiError {Object} Invalid Discover ID
 * @apiError {Object} exercise_ids must be a non-empty array
 * @apiError {Object} Invalid Exercise ID format
 * @apiError {Object} One or more Exercise IDs are invalid
 * @apiError {Object} Server Error
 */
const addDiscoverexercises = async (req, res) => {
	try {
		// Utility function to validate ObjectId
		const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
		const { discover_id, exercise_ids } = req.body;

		if (!mongoose.Types.ObjectId.isValid(discover_id)) {
			return res.status(400).json({ error: 'Invalid Discover ID' });
		}
		if (!Array.isArray(exercise_ids) || exercise_ids.length === 0) {
			return res
				.status(400)
				.json({ error: 'exercise_ids must be a non-empty array' });
		}
		if (!exercise_ids.every(isValidObjectId)) {
			return res.status(400).json({ error: 'Invalid Exercise ID format' });
		}
		const exercises = await yogaworkoutExercise.find({
			_id: { $in: exercise_ids },
		});
		if (exercises.length !== exercise_ids.length) {
			return res
				.status(400)
				.json({ error: 'One or more Exercise IDs are invalid' });
		}

		let discover = await yogaworkoutDiscover.findOne({ _id: discover_id });
		if (!discover) {
			return res.status(404).json({ error: 'Discover not found' });
		}

		const existingRecords = await yogaworkoutDiscoverexercise.find({
			discover_Id: discover._id,
			exercise_Id: { $in: exercise_ids },
		});
		const existingExerciseIds = existingRecords.map((record) =>
			record.exercise_Id.toString()
		);
		const newExercises = exercise_ids.filter(
			(id) => !existingExerciseIds.includes(id)
		);

		if (newExercises.length > 0) {
			await yogaworkoutDiscoverexercise.insertMany(
				newExercises.map((exercise_id) => ({
					discover_Id: discover._id,
					exercise_Id: exercise_id,
				}))
			);
		}

		res.status(201).json({
			message: 'Discover and exercises added successfully',
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {get} /getExerciseByDiscoverId/:id
 * @apiName getExerciseByDiscoverId
 * @apiGroup Discoverexercise
 * @apiParam {ObjectId} id Discover ID
 * @apiSuccess {Object[]} discoverexercises Array of all discoverexercise
 * @apiError {Object} No Discoverexercise Added!
 * @apiError {Object} Server Error
 */
const getExerciseByDiscoverId = async (req, res) => {
	try {
		const discover_Id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(discover_Id)) {
			return res.status(400).json({ error: 'Invalid Discover ID' });
		}

		const discoverexercises = await yogaworkoutDiscoverexercise
			.find({
				discover_Id: discover_Id,
			})
			.populate({
				path: 'discover_Id',
				select: '_id discover',
			})
			.populate({
				path: 'exercise_Id',
				select: '_id exerciseName description exerciseTime image',
			});
		if (discoverexercises.length === 0) {
			return res.status(400).json({
				message: 'No Discoverexercise Added!',
			});
		} else {
			const discoverexercisesWithImages = await Promise.all(
				discoverexercises.map(async (item) => {
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
				discoverexercises: discoverexercisesWithImages,
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
 * @api {delete} /deleteDiscoverexercise/:id
 * @apiName deleteDiscoverexercise
 * @apiGroup Discoverexercise
 * @apiParam {ObjectId} id Discoverexercise ID
 * @apiSuccess {Object} Discoverexercise deleted successfully!
 * @apiError {Object} Invalid ObjectId
 * @apiError {Object} Discoverexercise not found
 * @apiError {Object} Failed to delete Discoverexercise
 */
const deleteDiscoverexercise = async (req, res) => {
	const discoverexerciseId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(discoverexerciseId)) {
		return res.status(400).json({ error: 'Invalid Discoverexercise ID' });
	}

	try {
		const deletedDiscoverexercise = await yogaworkoutDiscoverexercise.deleteOne(
			{
				_id: discoverexerciseId,
			}
		);

		if (deletedDiscoverexercise.deletedCount === 0) {
			return res.status(404).json({ error: 'Discoverexercise not found' });
		}

		res.json({
			message: 'Discoverexercise deleted successfully',
			deletedDiscoverexercise,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete Discoverexercise' });
	}
};

/**
 * @api {post} /changeDiscoverexerciseStatus
 * @apiName changeDiscoverexerciseStatus
 * @apiGroup Discoverexercise
 * @apiParam {String} id Discoverexercise ID
 * @apiParam {Number} status Discoverexercise Status
 * @apiSuccess {Object} Updated Discoverexercise object
 * @apiError {Object} Discoverexercise not found
 * @apiError {Object} Invalid ObjectId
 */
const changeDiscoverexerciseStatus = async (req, res) => {
	let discoverexerciseStatusId = req.body.id.toString();
	let discoverexerciseStatusStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(discoverexerciseStatusId)) {
		const updatedDiscoverexercise =
			await yogaworkoutDiscoverexercise.findOneAndUpdate(
				{ _id: discoverexerciseStatusId },
				{ $set: { isActive: discoverexerciseStatusStatus } },
				{ returnDocument: 'after' }
			);

		if (!updatedDiscoverexercise) {
			return res.status(404).json({ error: 'Discoverexercise not found' });
		}

		res.json(updatedDiscoverexercise);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	addDiscoverexercises,
	getExerciseByDiscoverId,
	deleteDiscoverexercise,
	changeDiscoverexerciseStatus,
};
