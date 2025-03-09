const { mongoose, ObjectId } = require('mongoose');
const yogaworkoutWeek = require('../../models/week');
const yogaworkoutDays = require('../../models/days');


/**
 * @api {get} /getWeeks
 * @apiName getAllWeeks
 * @apiGroup Week
 * @apiSuccess {Object[]} weeks Array of all weeks
 * @apiError {Object} No Challenges Added!
 * @apiError {Object} Server Error
 */
const getWeek = async (req, res) => {
	try {

		if (req.body.challenges_id) {
			let challenges_id = req.body.challenges_id;
			const result = await yogaworkoutWeek.aggregate([
				{
					$match: { challengesId: challenges_id }
				},
				{
					$lookup: {
						from: 'yogaworkoutDays',
						localField: "_id",
						foreignField: "weekId",
						as: 'days'
					}
				},
				{
					$project: {
						_id:1,
						weekName: 1,
						challengesId:1,
						totalDays: { $size: "$days" }
					}
				}
			])
			res.status(200).json({
				result,
			});
		}
		else {
			res.status(200).json({
				success: 0,
				week: [],
				error: 'Variable not set'
			})
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



module.exports = {
	getWeek,
	getWeeksByChallengesId,
};
