const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutDays = require('../models/days');

/**
 * @api {post} /addDay Add a New Day
 * @apiName AddDay
 * @apiGroup Days
 * @apiPermission admin
 *
 * @apiParam {String} week_id Week ID
 * @apiParam {String} dayName Day Name
 *
 * @apiSuccess {String} message Day added successfully
 *
 * @apiError (Internal Server Error 500) ServerError Failed to add Day
 */

const addDay = async (req, res) => {
	try {
		const week_Id = req.body.week_id;
		if (!req.body.daysName) {
			return res.status(400).json({
				message: 'Enter Day Name!',
			});
		}

		// console.log("week_Id", week_Id)
		if (!mongoose.Types.ObjectId.isValid(week_Id)) {
			return res.status(400).json({ message: 'Invalid Week ID' });
		}

		const newDay = new yogaworkoutDays({
			week_Id: week_Id,
			daysName: req.body.daysName,
		});
		await newDay.save();
		res.status(201).json({ message: 'Day Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {get} /getDaysByWeekId/:id Get Days By Week ID
 * @apiName GetDaysByWeekId
 * @apiGroup Days
 * @apiPermission admin
 *
 * @apiParam {String} id Week ID
 *
 * @apiSuccess {Object[]} Days List of Days
 *
 * @apiError (Bad Request 400) NoDays No Days Added!
 * @apiError (Internal Server Error 500) ServerError Failed to get Days
 */
const getDaysByWeekId = async (req, res) => {
	try {
		const week_Id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(week_Id)) {
			return res.status(200).json({ message: 'Invalid Week ID' });
		}

		const days = await yogaworkoutDays.find({ week_Id: week_Id })
		.populate({
			path: 'week_Id',
			select: '_id weekName',
		});
		if (days.length === 0) {
			return res.status(400).json({
				message: 'No Days Added!',
			});
		} else {
			res.status(200).json({
				days,
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
 * @api {patch} /updateDay/:id Update a Day
 * @apiName updateDay
 * @apiGroup Days
 * @apiPermission admin
 *
 * @apiParam {ObjectId} id Day ID
 * @apiParam {String} dayName Day Name
 *
 * @apiSuccess {Object} Day Updated successfully!
 * @apiSuccess {Object} updatedDay Updated Day object
 *
 * @apiError (Bad Request 400) InvalidId Invalid Day ID
 * @apiError (Not Found 404) DayNotFound Day not found
 * @apiError (Internal Server Error 500) UpdateError Failed to update Day
 */
const updateDay = async (req, res) => {
	const day_Id = req.params.id;
	if (!req.body.daysName) {
		return res.status(400).json({
			message: 'Enter Day Name!',
		});
	}

	let newDay = {
		daysName: req.body.daysName,
	};

	if (mongoose.Types.ObjectId.isValid(day_Id)) {
		const updatedDay = await yogaworkoutDays.findByIdAndUpdate(day_Id, newDay, {
			new: true, // Return the updated document
			runValidators: true, // Run schema validators on update
		});
		if (!updatedDay) {
			return res.status(404).json({ message: 'Day not found' });
		}

		res.json(updatedDay);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

/**
 * @api {delete} /deleteDay/:id Delete a Day
 * @apiName DeleteDay
 * @apiGroup Days
 * @apiPermission admin
 *
 * @apiParam {String} id Day ID
 *
 * @apiSuccess {String} message Day deleted successfully
 * @apiSuccess {Object} deletedDay Deleted Day object
 *
 * @apiError (Bad Request 400) InvalidId Invalid Day ID
 * @apiError (Not Found 404) DayNotFound Day not found
 * @apiError (Internal Server Error 500) DeleteError Failed to delete Day
 */
const deleteDay = async (req, res) => {
	const dayId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(dayId)) {
		return res.status(400).json({ message: 'Invalid Day ID' });
	}

	try {
		const deletedDay = await yogaworkoutDays.deleteOne({ _id: dayId });

		if (deletedDay.deletedCount === 0) {
			return res.status(404).json({ message: 'Day not found' });
		}

		res.json({ message: 'day deleted successfully', deletedDay });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Failed to delete Day' });
	}
};

module.exports = { addDay, getDaysByWeekId, updateDay, deleteDay };
