const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const yogaworkoutChallenges = require('../../models/challenges');
const yogaworkoutWeek = require('../../models/week');
const yogaworkoutDays = require('../../models/days');
const yogaworkoutDaysCompleted = require('../../models/dayscompleted');
const { getFile } = require('../../utility/s3');
const { checkUserLogin } = require('./user');

const getTotalDays = async (weekId) => {
	const days = await yogaworkoutDays.find({ week_Id: weekId });
	if (days.length > 0) {
		return days.length;
	} else {
		return 0;
	}
};

const getTotalWeek = async (challengesId) => {
	const weeks = await yogaworkoutWeek.find({ challenges_Id: challengesId });
	if (weeks.length > 0) {
		let totalday = 0;

		for (const week of weeks) {
			const totaldays = await getTotalDays(week._id);
			totalday += totaldays;
		}

		return { totalWeeks: weeks.length, totalday: totalday };
	} else {
		return { totalWeeks: 0, totaldays: 0 };
	}
};

const getTotalDaysCompleted = async (weekId, userId) => {
	const daysCompleted = await yogaworkoutDaysCompleted.find({
		week_id: weekId,
		user_id: userId,
	});
	if (daysCompleted.length > 0) {
		return daysCompleted.length;
	} else {
		return 0;
	}
};

const getTotalDayCompleted = async (challengesId, userId) => {
	const weeks = await yogaworkoutWeek.find({ challenges_Id: challengesId });
	if (weeks.length > 0) {
		let totalday = 0;

		for (const week of weeks) {
			let totaldays = await getTotalDaysCompleted(week._id, userId);
			totalday += totaldays;
		}

		return { totalweek: weeks.length, totalday: totalday };
	} else {
		return { totalweek: 0, totalday: 0 };
	}
};

const getAllChallenges = async (req, res) => {
	try {
		// let totalweekanddaycompleted = await getTotalDayCompleted(item._id,)
		const data = req.body;
		if (data.user_id && data.user_id != '') {
			const userId = data.user_id;
			if (
				data.session &&
				data.session != '' &&
				data.device_id &&
				data.device_id != ''
			) {
				const session = data.session;
				const deviceId = data.device_id;
				const checkuserLogin = await checkUserLogin(userId, session, deviceId);
				if (checkuserLogin) {
					let challenges = await yogaworkoutChallenges
						.find({ isActive: 1 })
						.sort({ createdAt: -1 });
					if (challenges.length === 0) {
						return res.status(400).json({
							data: { success: 0, challenges: [], error: 'Please Try Again' },
						});
					} else {
						const challengesWithImages = await Promise.all(
							challenges.map(async (item) => {
								const updatedItem = item.toObject ? item.toObject() : item;
								let totalweeks = await getTotalWeek(item._id);
								let totalweekanddaycompleted = await getTotalDayCompleted(
									item._id,
									userId
								);
								if (item.image !== '') {
									const imageurl = await getFile(item.image); // Assuming getFile is an async function
									// console.log("imageurl", imageurl);
									return {
										...updatedItem,
										image: imageurl,
										totalweek: totalweeks.totalWeeks,
										totaldays: totalweeks.totalday,
										totaldayscompleted: totalweekanddaycompleted.totalday,
									}; // Update the image URL
								}
								return {
									...updatedItem,
									totalweek: totalweeks.totalWeeks,
									totaldays: totalweeks.totalday,
									totaldayscompleted: totalweekanddaycompleted.totalday,
								}; // Return the item unchanged if no image update is needed
							})
						);
						res.status(200).json({
							data: { success: 1, challenges: challengesWithImages, error: '' },
						});
					}
				} else {
					res.status(201).json({
						data: { success: 0, challenges: [], error: 'Please login first' },
					});
				}
			} else {
				res.status(201).json({
					data: { success: 0, challenges: [], error: 'Variable not set' },
				});
			}
		} else {
			let challenges = await yogaworkoutChallenges
				.find({ isActive: 1 })
				.sort({ createdAt: -1 });
			if (challenges.length === 0) {
				return res.status(400).json({
					data: { success: 0, challenges: [], error: 'Please Try Again' },
				});
			} else {
				const challengesWithImages = await Promise.all(
					challenges.map(async (item) => {
						const updatedItem = item.toObject ? item.toObject() : item;
						let totalweeks = await getTotalWeek(item._id);
						if (item.image !== '') {
							const imageurl = await getFile(item.image); // Assuming getFile is an async function
							// console.log("imageurl", imageurl);
							return {
								...updatedItem,
								image: imageurl,
								totalweek: totalweeks.totalWeeks,
								totaldays: totalweeks.totalday,
								totaldayscompleted: 0,
							}; // Update the image URL
						}
						return {
							...updatedItem,
							totalweek: totalweeks.totalWeeks,
							totaldays: totalweeks.totalday,
							totaldayscompleted: 0,
						}; // Return the item unchanged if no image update is needed
					})
				);
				res.status(200).json({
					data: { success: 1, challenges: challengesWithImages, error: '' },
				});
			}
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, challenges: [], error: 'Server Error' },
		});
	}
};

module.exports = { getAllChallenges };
