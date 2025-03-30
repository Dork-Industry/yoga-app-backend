const { mongoose } = require('mongoose');
const yogaworkoutDiscover = require('../models/discover');
const { uploadFile, getFile, deleteFile } = require('../utility/s3');

/**
 * @api {get} /discover
 * @apiName getAllDiscovers
 * @apiGroup Discover
 * @apiSuccess {Object[]} discovers List of Discover
 * @apiError {Object} Server Error
 * @apiError {Object} No Discovers Added!
 */
const getAllDiscovers = async (req, res) => {
	try {
		let discovers = await yogaworkoutDiscover.find().sort({ createdAt: -1 });
		if (discovers.length === 0) {
			return res.status(200).json({
				message: 'No Discovers Added!',
				discovers: []
			});
		} else {
			// const discoversWithImages = await Promise.all(
			// 	discovers.map(async (item) => {
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
				discovers: discovers,
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
 * @api {post} /adddiscover
 * @apiName addDiscover
 * @apiGroup Discover
 * @apiParam {String} discoverName Discover Name
 * @apiParam {String} [description] Discover Description
 * @apiParam {Number} [isActive] Discover Status
 * @apiSuccess {Object} Discover added successfully!
 * @apiError {Object} Server Error
 * TODO: Add Logic for image upload
 */
const addDiscover = async (req, res) => {
	try {
		if (!req.body.discoverName) {
			return res.status(400).json({
				message: 'Enter Discover Name!',
			});
		}
		let image = '';
		if (req.file) {
			// const imageRes = await uploadFile(req.file, 'Discover');
			// if (imageRes && imageRes.Key) {
			// 	image = imageRes.Key;
			// }
			image = req.file.path;
		}

		let discoverName = req.body.discoverName;
		let description = req.body?.description;
		let isActive = req.body.isActive ? req.body.isActive : 1;

		const newDiscover = new yogaworkoutDiscover({
			discover: discoverName,
			description: description,
			isActive: isActive,
			image: image,
		});
		await newDiscover.save();
		res.status(201).json({ message: 'Discover Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {post} /updatediscover/:id
 * @apiName updateDiscover
 * @apiGroup Discover
 * @apiParam {String} id Discover ID
 * @apiParam {String} [discoverName] Discover Name
 * @apiParam {String} [description] Discover Description
 * @apiParam {Number} [isActive] Discover Status
 * @apiSuccess {Object} Discover updated successfully!
 * @apiError {Object} Discover not found
 * @apiError {Object} Invalid ObjectId
 * TODO: Add Logic for image upload
 */
const updateDiscover = async (req, res) => {
	if (!req.body.discoverName) {
		return res.status(400).json({
			message: 'Enter Discover Name!',
		});
	}

	const discoverId = req.params.id;
	let discoverName = req.body.discoverName;
	let description = req.body?.description;
	let isActive = req.body.isActive ? req.body.isActive : 1;

	let newDiscover = {
		discover: discoverName,
		description: description,
		isActive: isActive,
	};
	// console.log('newDiscover', newDiscover);
	if (mongoose.Types.ObjectId.isValid(discoverId)) {
		const updatedDiscover = await yogaworkoutDiscover.findByIdAndUpdate(
			discoverId,
			newDiscover,
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);
		if (!updatedDiscover) {
			return res.status(404).json({ message: 'Discover not found' });
		}

		res.json(updatedDiscover);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

// TODO: Add Logic for check dependency on parent-child records/models
const deleteDiscover = async (req, res) => {
	const discoverId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(discoverId)) {
		return res.status(400).json({ message: 'Invalid discover ID' });
	}

	try {
		const documentExists = await yogaworkoutDiscover.findOne({ _id: discoverId, });
		if (documentExists) {
			const deletedDiscover = await yogaworkoutDiscover.deleteOne({
				_id: discoverId,
			});

			if (deletedDiscover.deletedCount === 0) {
				return res.status(404).json({ message: 'Discover not found' });
			}
			else {
				if (documentExists.image) {
					// ImageToDelet = documentExists.image;
					// const imageRes = await deleteFile(ImageToDelet);
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
				}
			}

			res.json({ message: 'Discover deleted successfully', deletedDiscover });
		}
		else {
			res.status(500).json({ message: 'No document found to delete.' });
		}

	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Discover' });
	}
};

/**
 * @api {post} /changeDiscoverStatus
 * @apiName changeDiscoverStatus
 * @apiGroup Discover
 * @apiParam {String} id Discover ID
 * @apiParam {Number} status Discover Status
 * @apiSuccess {Object} Discover status changed successfully!
 * @apiError {Object} Discover not found
 * @apiError {Object} Invalid ObjectId
 */
const changeDiscoverStatus = async (req, res) => {
	let discoverId = req.body.id.toString();
	let discoverStatus = req.body.status;

	// console.log('req.body', req.body);

	if (mongoose.Types.ObjectId.isValid(discoverId)) {
		const updatedDiscover = await yogaworkoutDiscover.findOneAndUpdate(
			{ _id: discoverId },
			{ $set: { isPro: discoverStatus } },
			{ returnDocument: 'after' }
		);
		// console.log('updatedDiscover', updatedDiscover);
		if (!updatedDiscover) {
			return res.status(404).json({ message: 'Discover not found' });
		}

		res.json(updatedDiscover);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	getAllDiscovers,
	addDiscover,
	updateDiscover,
	deleteDiscover,
	changeDiscoverStatus,
};
