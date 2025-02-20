const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutWeek = require('../models/week');

/**
 * @api {post} /addWeek
 * @apiName addWeek
 * @apiGroup Week
 * @apiParam {ObjectId} challenges_id Challenges ID
 * @apiParam {String} weekName Week Name
 * @apiSuccess {Object} Week Added successfully!
 * @apiError {Object} Server Error
 */
const addWeek = async (req, res) => {
	try {
		const challenges_id = req.body.challenges_id;
		if (!req.body.weekName) {
			return res.status(400).json({
				message: 'Enter Week Name!',
			});
		}
		if (!mongoose.Types.ObjectId.isValid(challenges_id)) {
			return res.status(400).json({ error: 'Invalid Challenges ID' });
		}

		const newWeek = new yogaworkoutWeek({
			challenges_Id: challenges_id,
			weekName: req.body.weekName,
		});
		await newWeek.save();
		res.status(201).json({ message: 'Week Added successfully!' });
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

/**
 * @api {get} /getWeeks
 * @apiName getAllWeeks
 * @apiGroup Week
 * @apiSuccess {Object[]} weeks Array of all weeks
 * @apiError {Object} No Challenges Added!
 * @apiError {Object} Server Error
 */
const getAllWeeks = async (req, res) => {
	try {
		let weeks = await yogaworkoutWeek.find();
		if (weeks.length === 0) {
			return res.status(400).json({
				message: 'No Challenges Added!',
			});
		} else {
			res.status(200).json({
				weeks,
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
 * @api {get} /getWeeksByChallengesId/:id
 * @apiName getWeeksByChallengesId
 * @apiGroup Week
 * @apiParam {ObjectId} id Challenges ID
 * @apiSuccess {Object[]} weeks Array of all weeks
 * @apiError {Object} No Challenges Added!
 * @apiError {Object} Server Error
 */
const getWeeksByChallengesId = async (req, res) => {
	try {
		const challengesId = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(challengesId)) {
			return res.status(400).json({ error: 'Invalid Challenges ID' });
		}

		const weeks = await yogaworkoutWeek.find({ challenges_Id: challengesId })
		.populate({
			path: 'challenges_Id',
			select: '_id challengesName',
		});
		if (weeks.length === 0) {
			return res.status(400).json({
				message: 'No Weeks Added!',
			});
		} else {
			res.status(200).json({
				weeks,
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
 * @api {post} /updateWeek/:id
 * @apiName updateWeek
 * @apiGroup Week
 * @apiParam {ObjectId} id Week ID
 * @apiParam {String} weekName Week Name
 * @apiSuccess {Object} Week Updated successfully!
 * @apiError {Object} Week not found
 * @apiError {Object} Invalid ObjectId
 */
const updateWeek = async (req, res) => {
	const week_Id = req.params.id;
	if (!req.body.weekName) {
		return res.status(400).json({
			message: 'Enter Week Name!',
		});
	}

	let newWeek = {
		weekName: req.body.weekName,
	};

	if (mongoose.Types.ObjectId.isValid(week_Id)) {
		const updatedWeek = await yogaworkoutWeek.findByIdAndUpdate(
			week_Id,
			newWeek,
			{
				new: true, // Return the updated document
				runValidators: true, // Run schema validators on update
			}
		);
		if (!updatedWeek) {
			return res.status(404).json({ error: 'Week not found' });
		}

		res.json(updatedWeek);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

/**
 * @api {delete} /deleteWeek/:id Delete a Week
 * @apiName deleteWeek
 * @apiGroup Week
 * @apiPermission admin
 *
 * @apiParam {ObjectId} id Week ID
 *
 * @apiSuccess {String} message Week deleted successfully
 * @apiSuccess {Object} deletedWeek Deleted Week object
 *
 * @apiError (Bad Request 400) InvalidId Invalid Week ID
 * @apiError (Not Found 404) WeekNotFound Week not found
 * @apiError (Internal Server Error 500) DeleteError Failed to delete Week
 */
const deleteWeek = async (req, res) => {
	const weekId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(weekId)) {
		return res.status(400).json({ error: 'Invalid Week ID' });
	}

	try {
		
		const deletedWeek = await yogaworkoutWeek.deleteOne({ _id: weekId });

		if (deletedWeek.deletedCount === 0) {
			return res.status(404).json({ error: 'Week not found' });
		}

		res.json({ message: 'Week deleted successfully', deletedWeek });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete Week' });
	}
};

module.exports = {
	addWeek,
	getAllWeeks,
	updateWeek,
	deleteWeek,
	getWeeksByChallengesId,
};
