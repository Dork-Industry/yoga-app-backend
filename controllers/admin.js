const jwt = require('jsonwebtoken');
const { mongoose } = require('mongoose');
const yogaworkoutAdmin = require('../models/adminuser');

const Login = async (req, res) => {
	const { email, password } = req.body;
	try {
		// const db = mongoose.connection.db;
		// const collection = db.collection('yogaworkoutAdmin');
		let AdminUser = await yogaworkoutAdmin.findOne({ email });
		// console.log("AdminUser", AdminUser)
		if (!AdminUser) {
			return res.status(400).json({
				message: 'User Not Exist',
			});
		}
		// const isMatch = await bcrypt.compare(password, AdminUser.password);
		if (!(AdminUser.password === password))
			return res.status(400).json({
				message: 'Incorrect Password !',
			});

		const payload = {
			userId: AdminUser._id,
		};

		jwt.sign(
			payload,
			process.env.SECRET_KEY,
			{
				expiresIn: 24 * 60 * 60,
			},
			(err, token) => {
				if (err) throw err;
				res.status(200).json({
					token,
				});
			}
		);
	} catch (e) {
		// console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

const Dashboard = async (req, res) => {
	const db = mongoose.connection.db;
	const categories = await db.collection('yogaworkoutCategory').count();
	const exercise = await db.collection('yogaworkoutExercise').count();
	const challenges = await db.collection('yogaworkoutChallenges').count();
	const discover = await db.collection('yogaworkoutDiscover').count();
	const quickworkout = await db.collection('yogaworkoutQuickworkout').count();
	const stretches = await db.collection('yogaworkoutStretches').count();

	res.status(200).json({
		categories,
		exercise,
		challenges,
		discover,
		quickworkout,
		stretches,
	});
};

const Logout = async (req, res) => {
	try {
		// To log out, we can simply invalidate the token on the client-side
		// Optionally, you can implement token blacklisting in a database or cache

		res.status(200).json({
			message: 'Logged out successfully',
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Server Error',
		});
	}
};

const ChangePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword, confirmPassword } = req.body;
		const token = req.headers.authorization?.split(' ')[1];

		if (!token) {
			return res
				.status(401)
				.json({ message: 'Unauthorized: No token provided' });
		}

		// Verify JWT token
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		const adminUser = await yogaworkoutAdmin.findById(decoded.userId);

		if (!adminUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if old password matches
		// const isMatch = await bcrypt.compare(oldPassword, adminUser.password);
		// if (!isMatch) {
		if (!(adminUser.password === oldPassword)) {
			return res.status(400).json({ message: 'Incorrect old password' });
		}

		// Validate confirm password
		if (newPassword !== confirmPassword) {
			return res
				.status(400)
				.json({ message: 'New password and confirm password do not match' });
		}

		// Hash the new password before saving
		// const salt = await bcrypt.genSalt(10);
		// const hashedPassword = await bcrypt.hash(newPassword, salt);
		const hashedPassword = newPassword;

		adminUser.password = hashedPassword;
		await adminUser.save();

		res.status(200).json({ message: 'Password changed successfully' });
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: 'Server Error' });
	}
};

module.exports = { Dashboard, Login, Logout, ChangePassword };
