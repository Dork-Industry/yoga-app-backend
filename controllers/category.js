const { mongoose } = require('mongoose');
const yogaworkoutCategory = require('../models/category');
const { uploadFile, getFile, deleteFile } = require('../utility/s3');

/**
 * @api {get} /category
 * @apiName getAllCategories
 * @apiGroup Category
 * @apiSuccess {Object[]} categories Array of all categories
 * @apiError {Object} Server Error
 */
const getAllCategories = async (req, res) => {
	try {
		let categories = await yogaworkoutCategory.find().sort({ createdAt: -1 });
		if (categories.length === 0) {
			return res.status(400).json({
				message: 'No Categories Added!',
			});
		} else {
			const categoryWithImages = await Promise.all(
				categories.map(async (item) => {
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
				categories: categoryWithImages,
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
 * @api {post} /addcategory
 * @apiName addCategory
 * @apiGroup Category
 * @apiParam {String} categoryName Category Name
 * @apiParam {String} [description] Category Description
 * @apiParam {Number} [isActive] Category Status
 * @apiSuccess {Object} Category added successfully!
 * @apiError {Object} Server Error
 * TODO: Add Logic for image upload
 */
const addCategory = async (req, res) => {
	try {
		if (!req.body.categoryName) {
			return res.status(400).json({
				message: 'Enter Category Name!',
			});
		}
		let image = '';
		if (req.file) {
			const imageRes = await uploadFile(req.file, 'Category');
			if (imageRes && imageRes.Key) {
				image = imageRes.Key;
			}
		}

		let categoryName = req.body.categoryName;
		let description = req.body?.description;
		let isActive = req.body.isActive ? req.body.isActive : 1;

		const newCategory = new yogaworkoutCategory({
			category: categoryName,
			description: description,
			isActive: isActive,
			image: image,
		});
		await newCategory.save();
		res.status(201).json({ message: 'Category Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {post} /updatecategory/:id
 * @apiName updateCategory
 * @apiGroup Category
 * @apiParam {String} id Category ID
 * @apiParam {String} [categoryName] Category Name
 * @apiParam {String} [description] Category Description
 * @apiParam {Number} [isActive] Category Status
 * @apiSuccess {Object} Category updated successfully!
 * @apiError {Object} Category not found
 * @apiError {Object} Invalid ObjectId
 * TODO: Add Logic for image upload
 */
const updateCategory = async (req, res) => {
	if (!req.body.categoryName) {
		return res.status(400).json({
			message: 'Enter Category Name!',
		});
	}

	const categoryId = req.params.id;
	let categoryName = req.body.categoryName;
	let description = req.body?.description;
	let isActive = req.body.isActive ? req.body.isActive : 1;

	let newCategory = {
		category: categoryName,
		description: description,
		isActive: isActive,
	};
	console.log('newCategory', newCategory);
	if (mongoose.Types.ObjectId.isValid(categoryId)) {
		const updatedCategory = await yogaworkoutCategory.findByIdAndUpdate(
			categoryId,
			newCategory,
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);
		if (!updatedCategory) {
			return res.status(404).json({ error: 'Category not found' });
		}

		res.json(updatedCategory);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

/**
 * @api {delete} /deleteCategory/:id
 * @apiName deleteCategory
 * @apiGroup Category
 * @apiParam {ObjectId} id Category ID
 * @apiSuccess {String} message Category deleted successfully
 * @apiSuccess {Object} deletedCategory Details of the deleted category
 * @apiError {Object} InvalidId Invalid category ID
 * @apiError {Object} CategoryNotFound Category not found
 * @apiError {Object} ServerError Failed to delete Category
 */
const deleteCategory = async (req, res) => {
	const categoryId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(categoryId)) {
		return res.status(400).json({ error: 'Invalid category ID' });
	}

	try {
		const documentExists = await yogaworkoutCategory.findOne({ _id: categoryId, });
		if (documentExists) {
			const deletedCategory = await yogaworkoutCategory.deleteOne({
				_id: categoryId,
			});
			if (deletedCategory.deletedCount === 0) {
				return res.status(404).json({ error: 'Category not found' });
			}
			else{
				if(documentExists.image) {
					ImageToDelet = documentExists.image;
					const imageRes = await deleteFile(ImageToDelet);
					// console.log("imageRes", imageRes)
				}
			}
			res.json({ message: 'Category deleted successfully', deletedCategory });
		} else {
			res.status(500).json({ error: 'No document found to delete.' });
		}
		
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete Category' });
	}
};

/**
 * @api {post} /changeCategoryStatus
 * @apiName changeCategoryStatus
 * @apiGroup Category
 * @apiParam {String} id Category ID
 * @apiParam {Number} status Category Status
 * @apiSuccess {Object} Category status changed successfully!
 * @apiError {Object} Category not found
 * @apiError {Object} Invalid ObjectId
 */
const changeCategoryStatus = async (req, res) => {
	let categoryId = req.body.id.toString();
	let categoryStatus = req.body.status;

	// console.log('req.body', req.body);

	if (mongoose.Types.ObjectId.isValid(categoryId)) {
		const updatedCategory = await yogaworkoutCategory.findOneAndUpdate(
			{ _id: categoryId },
			{ $set: { isActive: categoryStatus } },
			{ returnDocument: 'after' }
		);
		// console.log('updatedCategory', updatedCategory);
		if (!updatedCategory) {
			return res.status(404).json({ error: 'Category not found' });
		}

		res.json(updatedCategory);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	getAllCategories,
	addCategory,
	updateCategory,
	deleteCategory,
	changeCategoryStatus,
};
