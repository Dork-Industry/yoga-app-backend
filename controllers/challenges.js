const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutChallenges = require('../models/challenges');
const { uploadFile, getFile, deleteFile } = require('../utility/s3');

const getAllChallenges = async (req, res) => {
	try {
		let challenges = await yogaworkoutChallenges.find().sort({ createdAt: -1 });
		if (challenges.length === 0) {
			return res.status(200).json({
				message: 'No Challenges Added!',
				challenges: [],
			});
		} else {
			// const challengesWithImages = await Promise.all(
			// 	challenges.map(async (item) => {
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
				challenges: challenges,
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

const addChallenges = async (req, res) => {
	try {
		if (!req.body.challengesName) {
			return res.status(400).json({
				message: 'Enter Challenge Name!',
			});
		}
		let image = '';
		if (req.file) {
			// const imageRes = await uploadFile(req.file, 'Challenges');
			// if (imageRes && imageRes.Key) {
			// 	image = imageRes.Key;
			// }
			image = req.file.path;
		}

		let challengesName = req.body.challengesName;
		let description = req.body?.description;
		let isActive = req.body.isActive ? req.body.isActive : 1;

		const newChallenges = new yogaworkoutChallenges({
			challengesName: challengesName,
			description: description,
			isActive: isActive,
			image: image,
		});
		await newChallenges.save();
		res.status(201).json({ message: 'Challenge Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

const updateChallenges = async (req, res) => {
	if (!req.body.challengesName) {
		return res.status(400).json({
			message: 'Enter Challenge Name!',
		});
	}
	const challengesId = req.params.id;
	let challengesName = req.body.challengesName;
	let description = req.body?.description;
	let isActive = req.body.isActive ? req.body.isActive : 1;

	let newChallenges = {
		challengesName: challengesName,
		description: description,
		isActive: isActive,
	};
	if (mongoose.Types.ObjectId.isValid(challengesId)) {
		const updatedChallenges = await yogaworkoutChallenges.findByIdAndUpdate(
			challengesId,
			newChallenges,
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);
		if (!updatedChallenges) {
			return res.status(404).json({ message: 'Challenges not found' });
		}

		res.json(updatedChallenges);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

const deleteChallenges = async (req, res) => {
	const challengesId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(challengesId)) {
		return res.status(400).json({ message: 'Invalid challenges ID' });
	}

	try {
		const documentExists = await yogaworkoutChallenges.findOne({ _id: challengesId, });
		if (documentExists) {
			const deletedChallenges = await yogaworkoutChallenges.findByIdAndDelete(
				challengesId
			);
			if (deletedChallenges.deletedCount === 0) {
				return res.status(404).json({ message: 'Challenges not found' });
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
			res.json({ message: 'Challenges deleted successfully', deletedChallenges });
		}
		else {
			res.status(500).json({ message: 'No document found to delete.' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Challenges' });
	}
};

const changeChallengesStatus = async (req, res) => {
	let challengesId = req.body.id.toString();
	let challengesStatus = req.body.status;

	// console.log('req.body', req.body);

	if (mongoose.Types.ObjectId.isValid(challengesId)) {
		const updatedChallenges = await yogaworkoutChallenges.findOneAndUpdate(
			{ _id: challengesId },
			{ $set: { isPro: challengesStatus } },
			{ returnDocument: 'after' }
		);
		// console.log('updatedChallenges', updatedChallenges);
		if (!updatedChallenges) {
			return res.status(404).json({ message: 'Challenges not found' });
		}

		res.json(updatedChallenges);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	getAllChallenges,
	addChallenges,
	updateChallenges,
	deleteChallenges,
	changeChallengesStatus,
};
