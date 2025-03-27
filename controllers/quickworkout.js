const { mongoose } = require('mongoose');
const yogaworkoutQuickworkout = require('../models/quickworkout');
const { uploadFile, getFile, deleteFile } = require('../utility/s3');

/**
 * @api {get} /quickworkout
 * @apiName getAllQuickworkouts
 * @apiGroup Quickworkout
 * @apiSuccess {Object[]} Quickworkout list
 * @apiError {Object} No Quickworkout Added!
 * @apiError {Object} Server Error
 */
const getAllQuickworkouts = async (req, res) => {
	try {
		let quickworkouts = await yogaworkoutQuickworkout
			.find()
			.sort({ createdAt: -1 });
		if (quickworkouts.length === 0) {
			return res.status(200).json({
				message: 'No Quickworkout Added!',
				quickworkouts:[]
			});
		} else {
			const quickworkoutsWithImages = await Promise.all(
				quickworkouts.map(async (item) => {
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
				quickworkouts: quickworkoutsWithImages,
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
 * @api {post} /addquickworkout
 * @apiName addQuickworkout
 * @apiGroup Quickworkout
 * @apiParam {String} quickworkoutName Quickworkout Name
 * @apiParam {String} [description] Quickworkout Description
 * @apiParam {Number} [isActive] Quickworkout Status
 * @apiSuccess {Object} Quickworkout added successfully!
 * @apiError {Object} Server Error
 * TODO: Add Logic for image upload
 */
const addQuickworkout = async (req, res) => {
	try {
		if (!req.body.quickworkoutName) {
			return res.status(400).json({
				message: 'Enter Quick Workout Name!',
			});
		}

		let image = '';
		if (req.file) {
			const imageRes = await uploadFile(req.file, 'QuickWorkout');
			if (imageRes && imageRes.Key) {
				image = imageRes.Key;
			}
		}

		let quickworkoutName = req.body.quickworkoutName;
		let description = req.body?.description;
		let isActive = req.body.isActive ? req.body.isActive : 1;

		const newQuickworkout = new yogaworkoutQuickworkout({
			quickworkout: quickworkoutName,
			description: description,
			isActive: isActive,
			image: image,
		});
		await newQuickworkout.save();
		res.status(201).json({ message: 'Quickworkout Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {post} /updatequickworkout/:id
 * @apiName updateQuickworkout
 * @apiGroup Quickworkout
 * @apiParam {String} id Quickworkout ID
 * @apiParam {String} [quickworkoutName] Quickworkout Name
 * @apiParam {String} [description] Quickworkout Description
 * @apiParam {Number} [isActive] Quickworkout Status
 * @apiSuccess {Object} Quickworkout updated successfully!
 * @apiError {Object} Quickworkout not found
 * @apiError {Object} Invalid ObjectId
 * TODO: Add Logic for image upload
 */
const updateQuickworkout = async (req, res) => {
	if (!req.body.quickworkoutName) {
		return res.status(400).json({
			message: 'Enter Quick Workout Name!',
		});
	}

	const quickworkoutId = req.params.id;
	let quickworkoutName = req.body.quickworkoutName;
	let description = req.body?.description;
	let isActive = req.body.isActive ? req.body.isActive : 1;

	let newQuickworkout = {
		quickworkout: quickworkoutName,
		description: description,
		isActive: isActive,
	};
	console.log('newQuickworkout', newQuickworkout);
	if (mongoose.Types.ObjectId.isValid(quickworkoutId)) {
		const updatedQuickworkout = await yogaworkoutQuickworkout.findByIdAndUpdate(
			quickworkoutId,
			newQuickworkout,
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);
		if (!updatedQuickworkout) {
			return res.status(404).json({ message: 'Quickworkout not found' });
		}

		res.json(updatedQuickworkout);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

// TODO: Add Logic for check dependency on parent-child records/models
const deleteQuickworkout = async (req, res) => {
	const quickworkoutId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(quickworkoutId)) {
		return res.status(400).json({ message: 'Invalid quickworkout ID' });
	}

	try {
		const documentExists = await yogaworkoutQuickworkout.findOne({ _id: quickworkoutId, });
		if (documentExists) {
			const deletedQuickworkout = await yogaworkoutQuickworkout.deleteOne({
				_id: quickworkoutId,
			});

			if (deletedQuickworkout.deletedCount === 0) {
				return res.status(404).json({ message: 'Quickworkout not found' });
			}
			else {
				if (documentExists.image) {
					ImageToDelet = documentExists.image;
					const imageRes = await deleteFile(ImageToDelet);
					// console.log("imageRes", imageRes)
				}
			}

			res.json({
				message: 'Quickworkout deleted successfully',
				deletedQuickworkout,
			});
		}
		else {
			res.status(500).json({ message: 'No document found to delete.' });
		}

	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Quickworkout' });
	}
};

/**
 * @api {post} /changeQuickworkoutStatus
 * @apiName changeQuickworkoutStatus
 * @apiGroup Quickworkout
 * @apiParam {String} id Quickworkout ID
 * @apiParam {Number} status Quickworkout Status
 * @apiSuccess {Object} Quickworkout status changed successfully!
 * @apiError {Object} Quickworkout not found
 * @apiError {Object} Invalid ObjectId
 */
const changeQuickworkoutStatus = async (req, res) => {
	let quickworkoutId = req.body.id.toString();
	let quickworkoutStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(quickworkoutId)) {
		const updatedQuickworkout = await yogaworkoutQuickworkout.findOneAndUpdate(
			{ _id: quickworkoutId },
			{ $set: { isPro: quickworkoutStatus } },
			{ returnDocument: 'after' }
		);

		if (!updatedQuickworkout) {
			return res.status(404).json({ message: 'Quickworkout not found' });
		}

		res.json(updatedQuickworkout);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	getAllQuickworkouts,
	addQuickworkout,
	updateQuickworkout,
	deleteQuickworkout,
	changeQuickworkoutStatus,
};
