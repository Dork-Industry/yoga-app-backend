const mongoose = require('mongoose');
const yogaworkoutCategoryexercise = require('../models/categoryexercise');
const yogaworkoutCategory = require('../models/category');
const yogaworkoutExercise = require('../models/exercise');
const s3 = require('../utility/s3');

/**
 * @api {post} /addCategoryexercises
 * @apiName addCategoryexercises
 * @apiGroup Categoryexercise
 * @apiParam {ObjectId} category_id Category ID
 * @apiParam {ObjectId[]} exercise_ids Exercise IDs
 * @apiSuccess {Object} Category and exercises added successfully
 * @apiError {Object} Invalid Category ID
 * @apiError {Object} exercise_ids must be a non-empty array
 * @apiError {Object} Invalid Exercise ID format
 * @apiError {Object} One or more Exercise IDs are invalid
 * @apiError {Object} Server Error
 */
const addCategoryexercises = async (req, res) => {
	try {
		// Utility function to validate ObjectId
		const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
		const { category_id, exercise_ids } = req.body;

		if (!mongoose.Types.ObjectId.isValid(category_id)) {
			return res.status(400).json({ message: 'Invalid Category ID' });
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

		let category = await yogaworkoutCategory.findOne({ _id: category_id });
		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		const existingRecords = await yogaworkoutCategoryexercise.find({
			category_Id: category._id,
			exercise_Id: { $in: exercise_ids },
		});
		const existingExerciseIds = existingRecords.map((record) =>
			record.exercise_Id.toString()
		);
		const newExercises = exercise_ids.filter(
			(id) => !existingExerciseIds.includes(id)
		);

		if (newExercises.length > 0) {
			await yogaworkoutCategoryexercise.insertMany(
				newExercises.map((exercise_id) => ({
					category_Id: category._id,
					exercise_Id: exercise_id,
				}))
			);
		}

		res.status(201).json({
			message: 'Category and exercises added successfully',
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {get} /getExerciseByCategoryId/:id
 * @apiName getExerciseByCategoryId
 * @apiGroup Categoryexercise
 * @apiParam {ObjectId} id Category ID
 * @apiSuccess {Object[]} categoryexercises Array of all categoryexercise
 * @apiError {Object} No Categoryexercise Added!
 * @apiError {Object} Server Error
 */
const getExerciseByCategoryId = async (req, res) => {
	try {
		const category_Id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(category_Id)) {
			return res.status(400).json({ message: 'Invalid Category ID' });
		}

		const categoryexercises = await yogaworkoutCategoryexercise
			.find({
				category_Id: category_Id,
			})
			.populate({
				path: 'category_Id',
				select: '_id category',
			})
			.populate({
				path: 'exercise_Id',
				select: '_id exerciseName description exerciseTime image',
			});
		if (categoryexercises.length === 0) {
			return res.status(400).json({
				message: 'No Categoryexercise Added!',
			});
		} else {
			const categoryexercisesWithImages = await Promise.all(
				categoryexercises.map(async (item) => {
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
				categoryexercises: categoryexercisesWithImages,
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
 * @api {delete} /deleteCategoryexercise/:id
 * @apiName deleteCategoryexercise
 * @apiGroup Categoryexercise
 * @apiParam {ObjectId} id Categoryexercise ID
 * @apiSuccess {Object} Categoryexercise deleted successfully!
 * @apiError {Object} Invalid ObjectId
 * @apiError {Object} Categoryexercise not found
 * @apiError {Object} Failed to delete Categoryexercise
 */
const deleteCategoryexercise = async (req, res) => {
	const categoryexerciseId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(categoryexerciseId)) {
		return res.status(400).json({ message: 'Invalid Categoryexercise ID' });
	}

	try {
		const deletedCategoryexercise = await yogaworkoutCategoryexercise.deleteOne(
			{
				_id: categoryexerciseId,
			}
		);

		if (deletedCategoryexercise.deletedCount === 0) {
			return res.status(404).json({ message: 'Categoryexercise not found' });
		}

		res.json({
			message: 'Categoryexercise deleted successfully',
			deletedCategoryexercise,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Categoryexercise' });
	}
};

/**
 * @api {post} /changeCategoryexerciseStatus
 * @apiName changeCategoryexerciseStatus
 * @apiGroup Categoryexercise
 * @apiParam {String} id Categoryexercise ID
 * @apiParam {Number} status Categoryexercise Status
 * @apiSuccess {Object} Updated Categoryexercise object
 * @apiError {Object} Categoryexercise not found
 * @apiError {Object} Invalid ObjectId
 */
const changeCategoryexerciseStatus = async (req, res) => {
	let categoryexerciseStatusId = req.body.id.toString();
	let categoryexerciseStatusStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(categoryexerciseStatusId)) {
		const updatedCategoryexercise =
			await yogaworkoutCategoryexercise.findOneAndUpdate(
				{ _id: categoryexerciseStatusId },
				{ $set: { isActive: categoryexerciseStatusStatus } },
				{ returnDocument: 'after' }
			);

		if (!updatedCategoryexercise) {
			return res.status(404).json({ message: 'Categoryexercise not found' });
		}

		res.json(updatedCategoryexercise);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	addCategoryexercises,
	getExerciseByCategoryId,
	deleteCategoryexercise,
	changeCategoryexerciseStatus,
};
