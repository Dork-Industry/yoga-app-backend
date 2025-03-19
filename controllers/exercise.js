const { mongoose } = require('mongoose');
const yogaworkoutExercise = require('../models/exercise');
const { deleteFile, getFile, uploadFile } = require('../utility/s3');
const yogaworkoutChallengesexercise = require('../models/challengesexercise');
const yogaworkoutCategoryexercise = require('../models/categoryexercise');
const yogaworkoutDiscoverexercise = require('../models/discoverexercise');
const yogaworkoutQuickworkoutexercise = require('../models/quickworkoutexercise');
const yogaworkoutStretchesexercise = require('../models/stretchesexercise');

const getAllExercise = async (req, res) => {
	try {
		let exercises = await yogaworkoutExercise.find().sort({ createdAt: -1 });
		if (exercises.length === 0) {
			return res.status(200).json({
				message: 'No Exericises Added!',
				exercises : []
			});
		} else {
			const exercisesWithImages = await Promise.all(
				exercises.map(async (item) => {
					const updatedItem = item.toObject ? item.toObject() : item;
					if (item.image !== '') {
						const imageurl = await getFile(item.image); // Assuming getFile is an async function
						// console.log("imageurl", imageurl);
						return { ...updatedItem, image: imageurl }; // Update the image URL
					}
					return updatedItem; // Return the item unchanged if no image update is needed
				})
			);

			res.status(200).json({
				exercises: exercisesWithImages,
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

const addExercise = async (req, res) => {
	try {
		if (!req.body.exerciseName) {
			return res.status(400).json({
				message: 'Enter Exercise Name!',
			});
		}
		if (!req.body.exerciseTime) {
			return res.status(400).json({
				message: 'Enter Exercise Time in Minutes!',
			});
		}

		let image = '';
		if (req.file) {
			const imageRes = await uploadFile(req.file, 'Exercise');
			if (imageRes && imageRes.Key) {
				image = imageRes.Key;
			}
		}

		let exerciseName = req.body.exerciseName;
		let exerciseTime = req.body.exerciseTime;
		let description = req.body?.description;
		let isActive = req.body.isActive ? req.body.isActive : 1;

		const newExercise = new yogaworkoutExercise({
			exerciseName: exerciseName,
			exerciseTime: exerciseTime,
			description: description,
			isActive: isActive,
			image: image,
		});
		await newExercise.save();
		res.status(201).json({ message: 'Exercise Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

const updateExercise = async (req, res) => {
	const exerciseId = req.params.id;
	let exerciseName = req.body.exerciseName;
	let exerciseTime = req.body.exerciseTime;
	let description = req.body?.description;
	let isActive = req.body.isActive ? req.body.isActive : 1;

	let newExercise = {
		exerciseName: exerciseName,
		exerciseTime: exerciseTime,
		description: description,
		isActive: isActive,
	};
	console.log('newExercise', newExercise);
	if (mongoose.Types.ObjectId.isValid(exerciseId)) {
		const updatedExercise = await yogaworkoutExercise.findByIdAndUpdate(
			exerciseId,
			newExercise,
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);
		if (!updatedExercise) {
			return res.status(404).json({ message: 'Exercise not found' });
		}

		res.json(updatedExercise);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

const deleteExercise = async (req, res) => {
	const exerciseId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
		return res.status(400).json({ message: 'Invalid exercise ID' });
	}

	try {
		const documentExists = await yogaworkoutExercise.findOne({ _id: exerciseId, });
		if (documentExists) {
			const deletedExercise = await yogaworkoutExercise.findByIdAndDelete(
				exerciseId
			);

			if (deletedExercise.deletedCount === 0) {
				return res.status(404).json({ message: 'Exercise not found' });
			}
			else {

				await yogaworkoutChallengesexercise.deleteMany({ exercise_Id: exerciseId });
				await yogaworkoutCategoryexercise.deleteMany({ exercise_Id: exerciseId });
				await yogaworkoutDiscoverexercise.deleteMany({ exercise_Id: exerciseId });
				await yogaworkoutQuickworkoutexercise.deleteMany({
					exercise_Id: exerciseId,
				});
				await yogaworkoutStretchesexercise.deleteMany({ exercise_Id: exerciseId });
				if (documentExists.image) {
					ImageToDelet = documentExists.image;
					const imageRes = await deleteFile(ImageToDelet);
					// console.log("imageRes", imageRes)
				}
			}
			res.json({ message: 'Exercise deleted successfully', deletedExercise });
		}
		else {
			res.status(500).json({ message: 'No document found to delete.' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Exercise' });
	}
};

/**
 * @api {post} /changeExerciseStatus
 * @apiName changeExerciseStatus
 * @apiGroup Exercise
 * @apiParam {String} id Exercise ID
 * @apiParam {Number} status Exercise Status
 * @apiSuccess {Object} Exercise status changed successfully!
 * @apiError {Object} Exercise not found
 * @apiError {Object} Invalid ObjectId
 */
const changeExerciseStatus = async (req, res) => {
	let exerciseId = req.body.id.toString();
	let exerciseStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(exerciseId)) {
		const updatedExercise = await yogaworkoutExercise.findOneAndUpdate(
			{ _id: exerciseId },
			{ $set: { isActive: exerciseStatus } },
			{ returnDocument: 'after' }
		);
		// console.log('updatedExercise', updatedExercise);
		if (!updatedExercise) {
			return res.status(404).json({ message: 'Exercise not found' });
		}

		res.json(updatedExercise);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	getAllExercise,
	addExercise,
	updateExercise,
	deleteExercise,
	changeExerciseStatus,
};
