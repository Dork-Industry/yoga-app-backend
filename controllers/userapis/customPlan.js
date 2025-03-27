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
						data: {
							success: 0,
							customplan: [],
							error: 'No Custome Plan Created',
						},
					});
				} else {
					const customPlanWithExercise = await Promise.all(
						customPlan.map(async (item) => {
							const updatedItem = item.toObject ? item.toObject() : item;
							let totalexercise = await yogaworkoutCustomPlanExercise.find({
								custom_plan_id: item._id,
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
				if (
					data.name &&
					data.name != '' &&
					data.description &&
					data.description != ''
				) {
					let newCustomPlan = new yogaworkoutCustomPlan({
						user_id: data.user_id,
						name: data.name,
						description: data.description,
					});
					const savedCustomPlan = await newCustomPlan.save();
					if (savedCustomPlan) {
						return res.status(200).json({
							data: {
								success: 1,
								customplan: [],
								error: 'Custom Plan added Successfully',
							},
						});
					} else {
						res.status(400).json({
							data: { success: 0, customplan: [], error: 'Please Try Again' },
						});
					}
				} else {
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
};

const deleteCustomPlan = async (req, res) => {
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
				if (
					data.custom_plan_id &&
					data.custom_plan_id != ''
				) {
					const deletedCustomPlan = await yogaworkoutCustomPlan.findOneAndDelete({_id : data.custom_plan_id, user_id : data.user_id});
					if (deletedCustomPlan) {
						return res.status(200).json({
							data: {
								success: 1,
								customplan: [],
								error: 'Custom Plan deleted Successfully',
							},
						});
					} else {
						res.status(400).json({
							data: { success: 0, customplan: [], error: 'Please Try Again' },
						});
					}
				} else {
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

const editCustomPlan = async(req,res) => {
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
				if (
					data.custom_plan_id &&
					data.custom_plan_id != '' &&
					data.name &&
					data.name != '' &&
					data.description &&
					data.description !=''
				) {
					const updatedCustomPlan = await yogaworkoutCustomPlan.findByIdAndUpdate(
						data.custom_plan_id,
						{ $set: { name: data.name, description : data.description } },
						{ new: true } // return the updated document
					  );
					
					if (updatedCustomPlan) {
						return res.status(200).json({
							data: {
								success: 1,
								customplan: [],
								error: 'Custom Plan Updated Successfully',
							},
						});
					} else {
						res.status(400).json({
							data: { success: 0, customplan: [], error: 'Please Try Again' },
						});
					}
				} else {
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

module.exports = { getCustomPlan, addCustomPlan, deleteCustomPlan, editCustomPlan };
