const { getFile } = require('../../utility/s3');
const { checkUserLogin } = require('./user');
const yogaworkoutCustomPlan = require('../../models/customplan');
const yogaworkoutCustomPlanExercise = require('../../models/customplanexercise');


const getCustomPlan = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != ''
		) {
			const checkuserLogin = await checkUserLogin(
				data.user_id,
				data.session,
				data.device_id
			);
			if (checkuserLogin) {
				let customPlan = await yogaworkoutCustomPlan
					.find({ user_id: data.user_id })
					.sort({ createdAt: -1 });
				if (customPlan.length === 0) {
					return res.status(400).json({
						data: { success: 0, customplan: [], error: 'Please Try Again' },
					});
				} else {
					const customPlanWithExercise = await Promise.all(
						customPlan.map(async (item) => {

							let totalexercise = await yogaworkoutCustomPlanExercise.find({
								custom_plan_id: item._id
							});
							return { ...updatedItem, totalexercise: totalexercise.length }; // Update the image URL

							// return updatedItem; // Return the item unchanged if no image update is needed
						})
					);
					res.status(200).json({
						data: { success: 1, customplan: customPlanWithExercise, error: '' },
					});
				}
			} else {
				res.status(201).json({
					data: { success: 0, customplan: [], error: 'Please login first' },
				});
			}
		} else {
			res.status(200).json({
				data: { success: 1, customplan: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, customplan: [], error: 'Server Error' },
		});
	}
};

const addCustomPlan = async (req, res) => {
	try {
		const data = req.body;
		if (
			data.user_id &&
			data.user_id != '' &&
			data.session &&
			data.session != '' &&
			data.device_id &&
			data.device_id != ''
		) {
			const checkuserLogin = await checkUserLogin(
				data.user_id,
				data.session,
				data.device_id
			);
			if (checkuserLogin) {
				if (data.name && data.name != '' && data.description && data.description != '') {
					let newCustomPlan = new yogaworkoutCustomPlan({
						user_id : data.user_id,
						name: data.name,
						description : data.description
					})
					const savedCustomPlan = await newCustomPlan.save();
					if (savedCustomPlan) {
						return res.status(200).json({
							data: { success: 1, customplan: [], error: 'Add Custom Plan' },
						});
					} else {
						
						res.status(400).json({
							data: { success: 0, customplan: [], error: 'Please Try Again' },
						});
					}
				}
				else {
					res.status(200).json({
						data: { success: 0, customplan: [], error: 'Variable not set' },
					});
				}

			} else {
				res.status(201).json({
					data: { success: 0, customplan: [], error: 'Please login first' },
				});
			}
		} else {
			res.status(200).json({
				data: { success: 0, customplan: [], error: 'Variable not set' },
			});
		}
	} catch (e) {
		console.error(e);
		res.status(500).json({
			data: { success: 0, customplan: [], error: 'Server Error' },
		});
	}
}


module.exports = { getCustomPlan, addCustomPlan };
