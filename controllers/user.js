const { mongoose } = require('mongoose');
const yogaworkoutUser = require('../models/user');

const getAllUser = async (req, res) => {
	try {
		let Users = await yogaworkoutUser.find().sort({ createdAt: -1 });
		if (Users.length === 0) {
			return res.status(200).json({
				message: 'No User Added!',
				user:[]
			});
		} else {
			res.status(200).json({
				user: Users,
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};
const changeUserStatus = async (req, res) => {
	let userId = req.body.id.toString();
	let userStatus = req.body.status;

	if (mongoose.Types.ObjectId.isValid(userId)) {
		const updatedUser = await yogaworkoutUser.findOneAndUpdate(
			{ _id: userId },
			{ $set: { isActive: userStatus } },
			{ returnDocument: 'after' }
		);
		// console.log('updatedStretches', updatedStretches);
		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}
		return res.status(200).json({ message: 'User Status Updated Successfully!', user:updatedUser });
	
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

module.exports = {
	getAllUser,
	changeUserStatus
};
