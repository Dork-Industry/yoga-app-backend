const yogaworkoutSetting = require('../../models/settings');

const settings = async (req, res) => {
	try {
		let settings = await yogaworkoutSetting.findOne().sort({ createdAt: -1 });
		if (settings.length === 0) {
			return res.status(400).json({
				data: { success: 0, setting: [], error: 'Please Try Again' },
			});
		} else {
			res.status(200).json({
				data: { success: 1, setting: settings, error: '' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, setting: [], error: 'Server Error' },
		});
	}
};

module.exports = { settings };
