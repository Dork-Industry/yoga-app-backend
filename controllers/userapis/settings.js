const yogaworkoutSetting = require('../../models/settings');

const settings = async (req, res) => {
    try {
        let settings = await yogaworkoutSetting.find().sort({ createdAt: -1 });
        if (settings.length === 0) {
            return res.status(400).json({
                message: 'No Settings Added!',
            });
        } else {
           
            res.status(200).json({
                data : {
                    success : '1',
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

module.exports = { settings }