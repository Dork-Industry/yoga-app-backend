const { mongoose } = require('mongoose');
const yogaworkoutSetting = require('../models/settings');




const settings = async (req, res) => {
	try {
		let settings = await yogaworkoutSetting.find().sort({ createdAt: -1 });
		if (settings.length === 0) {
			return res.status(400).json({
				message: 'No Settings Added!',
			});
		} else {

			res.status(200).json({
				data: {
					success: '1',
					settings: settings,
				}
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};
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
			return res.status(404).json({ error: 'Stretch not found' });
		}

		res.json(updatedStretches);
	} else {
		res.status(500).send({
			message: 'Invalid ObjectId',
		});
	}
};

const updateSettings = async (req, res) => {
	if (!req.body.settingId) {
		return res.status(400).json({
			message: 'Enter Setting Id!',
		});
	}
	try {
		let settings = await yogaworkoutSetting.find().sort({ createdAt: -1 });
		if (settings.length === 0) {
			return res.status(400).json({
				message: 'No Settings Found!',
			});
		} else {
			const challenges = req.body.challenges ? req.body.challenges : settings[0].challenges;
			const category = req.body.category ? req.body.category : settings[0].category;
			const discover = req.body.discover ? req.body.discover : settings[0].discover;
			const quickworkout = req.body.quickworkout ? req.body.quickworkout : settings[0].quickworkout;
			const stretches = req.body.stretches ? req.body.stretches : settings[0].stretches;

			const newsettings = {
				challenges: challenges,
				category: category,
				discover: discover,
				quickworkout: quickworkout,
				stretches: stretches
			}
			const updatedSettings = await yogaworkoutSetting.findOneAndUpdate({ settingId: settings[0].settingId },
				newsettings,
				{ new: true }
			);
			if (!updatedSettings) {
				return res.status(404).json({ error: 'Settings not found' });
			}


			res.status(200).json({
				data: {
					success: '1',
					settings: updatedSettings,
				}
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}

}

module.exports = { settings, updateSettings }
