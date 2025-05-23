const { mongoose } = require('mongoose');
const yogaworkoutStretches = require('../models/stretches');
const { uploadFile, getFile, deleteFile } = require('../utility/s3');

/**
 * @api {get} /stretches
 * @apiName getAllStretches
 * @apiGroup Stretches
 * @apiSuccess {Object[]} Stretches List of all stretches
 * @apiError {Object} Server Error
 */
const getAllStretches = async (req, res) => {
	try {
		let stretchess = await yogaworkoutStretches.find().sort({ createdAt: -1 });
		if (stretchess.length === 0) {
			return res.status(200).json({
				message: 'No Stretches Added!',
				stretchess: []
			});
		} else {
			// const stretchessWithImages = await Promise.all(
			// 	stretchess.map(async (item) => {
			// 		const updatedItem = item.toObject ? item.toObject() : item;
			// 		if (item.image !== '') {
			// 			const imageurl = await getFile(item.image); // Assuming getFile is an async function
			// 			// console.log("imageurl", imageurl);
			// 			return { ...updatedItem, image: imageurl }; // Update the image URL
			// 		}
			// 		return updatedItem; // Return the item unchanged if no image update is needed
			// 	})
			// );
			res.status(200).json({
				stretchess: stretchess,
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
 * @api {post} /addstretches
 * @apiName addStretches
 * @apiGroup Stretches
 * @apiParam {String} stretchesName Stretches Name
 * @apiParam {String} [description] Stretches Description
 * @apiParam {Number} [isActive] Stretches Status
 * @apiSuccess {Object} Stretches added successfully!
 * @apiError {Object} Server Error
 * TODO: Add Logic for image upload
 */
const addStretches = async (req, res) => {
	try {
		if (!req.body.stretchesName) {
			return res.status(400).json({
				message: 'Enter Stretch Name!',
			});
		}
		let image = '';
		if (req.file) {
			// const imageRes = await uploadFile(req.file, 'Stretches');
			// if (imageRes && imageRes.Key) {
			// 	image = imageRes.Key;
			// }
			image = req.file.path;
		}

		let stretchesName = req.body.stretchesName;
		let description = req.body?.description;
		let isActive = req.body.isActive ? req.body.isActive : 1;

		const newStretches = new yogaworkoutStretches({
			stretches: stretchesName,
			description: description,
			isActive: isActive,
			image: image,
		});
		await newStretches.save();
		res.status(201).json({ message: 'Stretch Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {post} /updatestretches/:id
 * @apiName updateStretches
 * @apiGroup Stretches
 * @apiParam {String} id Stretches ID
 * @apiParam {String} [stretchesName] Stretches Name
 * @apiParam {String} [description] Stretches Description
 * @apiParam {Number} [isActive] Stretches Status
 * @apiSuccess {Object} Stretches updated successfully!
 * @apiError {Object} Stretches not found
 * @apiError {Object} Invalid ObjectId
 * TODO: Add Logic for image upload
 */
const updateStretches = async (req, res) => {
	if (!req.body.stretchesName) {
		return res.status(400).json({
			message: 'Enter Stretch Name!',
		});
	}

	const stretchesId = req.params.id;
	let stretchesName = req.body.stretchesName;
	let description = req.body?.description;
	let isActive = req.body.isActive ? req.body.isActive : 1;

	let newStretches = {
		stretches: stretchesName,
		description: description,
		isActive: isActive,
	};
	// console.log('newStretches', newStretches);
	if (mongoose.Types.ObjectId.isValid(stretchesId)) {
		const updatedStretches = await yogaworkoutStretches.findByIdAndUpdate(
			stretchesId,
			newStretches,
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);
		if (!updatedStretches) {
			return res.status(404).json({ message: 'Stretch not found' });
		}

		res.json(updatedStretches);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

// TODO: Add Logic for check dependency on parent-child records/models
const deleteStretches = async (req, res) => {
	const stretchesId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(stretchesId)) {
		return res.status(400).json({ message: 'Invalid Stretch ID' });
	}

	try {
		const documentExists = await yogaworkoutStretches.findOne({ _id: stretchesId, });
		console.log("documentExists", documentExists)
		if (documentExists) {
			const deletedStretches = await yogaworkoutStretches.deleteOne({
				_id: stretchesId,
			});

			if (deletedStretches.deletedCount === 0) {
				return res.status(404).json({ message: 'Stretch not found' });
			}
			else {
				if (documentExists.image) {
					try {
						const fullPath = path.join(__dirname, '..', documentExists.image);
						// console.log('fullPath', fullPath)
						const uploadsDir = path.join(__dirname, '..');
						if (!path.normalize(fullPath).startsWith(path.normalize(uploadsDir))) {
							throw new Error('Invalid file path - security violation');
						}

						// Check if file exists before deleting
						try {
							await fs.access(fullPath);
							await fs.unlink(fullPath);

						} catch (fileError) {
							console.log("fileError", fileError)
							if (fileError.code === 'ENOENT') {
								console.warn('File not found, may have been deleted already');
							} else {
								throw fileError;
							}
						}
					} catch (fileError) {
						console.error('Error deleting file:', fileError);
						// Continue with DB deletion even if file deletion fails
					}
					// ImageToDelet = documentExists.image;
					// const imageRes = await deleteFile(ImageToDelet);

				}
			}

			res.json({ message: 'Stretch deleted successfully', deletedStretches });
		}
		else {

			res.status(500).json({ message: 'No document found to delete.' });
		}

	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Stretch' });
	}
};

/**
 * @api {post} /changeStretchesStatus
 * @apiName changeStretchesStatus
 * @apiGroup Stretches
 * @apiParam {String} id Stretches ID
 * @apiParam {Number} status Stretches Status
 * @apiSuccess {Object} Stretches status changed successfully!
 * @apiError {Object} Stretches not found
 * @apiError {Object} Invalid ObjectId
 */
const changeStretchesStatus = async (req, res) => {
	let stretchesId = req.body.id.toString();
	let stretchesStatus = req.body.status;

	// console.log('req.body', req.body);

	if (mongoose.Types.ObjectId.isValid(stretchesId)) {
		const updatedStretches = await yogaworkoutStretches.findOneAndUpdate(
			{ _id: stretchesId },
			{ $set: { isPro: stretchesStatus } },
			{ returnDocument: 'after' }
		);
		// console.log('updatedStretches', updatedStretches);
		if (!updatedStretches) {
			return res.status(404).json({ message: 'Stretches not found' });
		}

		res.json(updatedStretches);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	getAllStretches,
	addStretches,
	updateStretches,
	deleteStretches,
	changeStretchesStatus,
};
