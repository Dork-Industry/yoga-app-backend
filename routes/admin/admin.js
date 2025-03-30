const express = require('express');
const adminController = require('../../controllers/admin');
const { authenticate } = require('../../middlewares/auth');
const categoryController = require('../../controllers/category');
const exerciseController = require('../../controllers/exercise');
const challengesController = require('../../controllers/challenges');
const discoverController = require('../../controllers/discover');
const quickworkoutController = require('../../controllers/quickworkout');
const stretchesController = require('../../controllers/stretches');
const weekController = require('../../controllers/week');
const daysController = require('../../controllers/days');
const challengesexerciseController = require('../../controllers/challengesexercise');
const categoryexerciseController = require('../../controllers/categoryexercise');
const discoverexerciseController = require('../../controllers/discoverexercise');
const quickworkoutexerciseController = require('../../controllers/quickworkoutexercise');
const stretchesexerciseController = require('../../controllers/stretchesexercise');
const planController = require('../../controllers/plan');
const userController = require('../../controllers/user');
const settingController = require("../../controllers/setting");
const router = express.Router();
const path = require('path');
const multer = require('multer')
const fs = require('fs')

// Configure storage for Multer
const createUploader = (category) => {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			const uploadDir = `uploads/${category}`;
			// const uploadDir = path.join('uploads', category);
			// Create directory if it doesn't exist
			fs.mkdir(uploadDir, { recursive: true }, (err) => {
				if (err) return cb(err);
				cb(null, uploadDir);
			});
		},
		filename: function (req, file, cb) {
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
			cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
		}
	});
	return multer({
		storage: storage,
		fileFilter: (req, file, cb) => {
			if (file.mimetype.startsWith('image/')) {
				cb(null, true);
			} else {
				cb(new Error('Only image files are allowed!'), false);
			}
		},
		limits: { fileSize: 1 * 1024 * 1024 } // 5MB limit
	});
}




// Create uploaders for different categories
const exerciseUpload = createUploader('exercise');
const categoryUpload = createUploader('category');
const challengesUpload = createUploader('challenges');
const discoverUpload = createUploader('discover');
const quickworkoutUpload = createUploader('quickworkout');
const stretchesUpload = createUploader('stretches');

// // Configure multer
// const upload = multer({
// 	storage: multer.memoryStorage(),
// 	limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
// 	fileFilter: (req, file, cb) => {
// 		if (file.mimetype.startsWith('image/')) {
// 			cb(null, true);
// 		} else {
// 			cb(new Error('Unsupported file type. Only images are allowed.'), false);
// 		}
// 	},
// });



router.post('/login', adminController.Login);
router.get('/dashboard', authenticate, adminController.Dashboard);
router.post('/logout', authenticate, adminController.Logout);
router.post('/changePassword', authenticate, adminController.ChangePassword);

// START: exercise module
router.get('/exercise', authenticate, exerciseController.getAllExercise);
router.post(
	'/addExercise',
	authenticate,
	exerciseUpload.single('image'),
	exerciseController.addExercise
);
router.post(
	'/updateExercise/:id',
	authenticate,
	exerciseController.updateExercise
);
router.post(
	'/deleteExercise/:id',
	authenticate,
	exerciseController.deleteExercise
);
router.post(
	'/changeExerciseStatus',
	authenticate,
	exerciseController.changeExerciseStatus
);
// END: exercise module

// START: category module
router.get('/category', authenticate, categoryController.getAllCategories);
router.post(
	'/addCategory',
	authenticate,
	categoryUpload.single('image'),
	categoryController.addCategory
);
router.post(
	'/updateCategory/:id',
	authenticate,
	categoryController.updateCategory
);
router.post(
	'/deleteCategory/:id',
	authenticate,
	categoryController.deleteCategory
);
router.post(
	'/changeCategoryStatus',
	authenticate,
	categoryController.changeCategoryStatus
);
// END: category module

// START: categoryexercise module
router.get(
	'/getExerciseByCategoryId/:id',
	authenticate,
	categoryexerciseController.getExerciseByCategoryId
);
router.post(
	'/addCategoryexercises',
	authenticate,
	categoryexerciseController.addCategoryexercises
);
router.post(
	'/deleteCategoryexercise/:id',
	authenticate,
	categoryexerciseController.deleteCategoryexercise
);
router.post(
	'/changeCategoryexerciseStatus',
	authenticate,
	categoryexerciseController.changeCategoryexerciseStatus
);
// END: categoryexercises module

// START: challenges module
router.get('/challenges', authenticate, challengesController.getAllChallenges);
router.post(
	'/addChallenges',
	authenticate,
	challengesUpload.single('image'),
	challengesController.addChallenges
);
router.post(
	'/updateChallenges/:id',
	authenticate,
	challengesController.updateChallenges
);
router.post(
	'/deleteChallenges/:id',
	authenticate,
	challengesController.deleteChallenges
);
router.post(
	'/changeChallengesStatus',
	authenticate,
	challengesController.changeChallengesStatus
);
// END: challenges module

// START: week module
router.get(
	'/getWeeksByChallengesId/:id',
	authenticate,
	weekController.getWeeksByChallengesId
);
router.get('/getWeeks', authenticate, weekController.getAllWeeks);
router.post('/addWeek', authenticate, weekController.addWeek);
router.post('/updateWeek/:id', authenticate, weekController.updateWeek);
router.post('/deleteWeek/:id', authenticate, weekController.deleteWeek);
// END: week module

// START: day module
router.get(
	'/getDaysByWeekId/:id',
	authenticate,
	daysController.getDaysByWeekId
);
router.post('/addDay', authenticate, daysController.addDay);
router.post('/updateDay/:id', authenticate, daysController.updateDay);
router.post('/deleteDay/:id', authenticate, daysController.deleteDay);
// END: day module

// START: challengesexercise module
router.get(
	'/getExerciseByDaysId/:id',
	authenticate,
	challengesexerciseController.getExerciseByDaysId
);
router.post(
	'/addChallengesexercises',
	authenticate,
	challengesexerciseController.addChallengesexercises
);
router.post(
	'/deleteChallengesexercise/:id',
	authenticate,
	challengesexerciseController.deleteChallengesexercise
);
router.post(
	'/changeChallengesexerciseStatus',
	authenticate,
	challengesexerciseController.changeChallengesexerciseStatus
);
// END: challengesexercises module

// START: discover module
router.get('/discover', authenticate, discoverController.getAllDiscovers);
router.post(
	'/addDiscover',
	authenticate,
	discoverUpload.single('image'),
	discoverController.addDiscover
);
router.post(
	'/updateDiscover/:id',
	authenticate,
	discoverController.updateDiscover
);
router.post(
	'/deleteDiscover/:id',
	authenticate,
	discoverController.deleteDiscover
);
router.post(
	'/changeDiscoverStatus',
	authenticate,
	discoverController.changeDiscoverStatus
);
// END: discover module

// START: discoverexercise module
router.get(
	'/getExerciseByDiscoverId/:id',
	authenticate,
	discoverexerciseController.getExerciseByDiscoverId
);
router.post(
	'/addDiscoverexercises',
	authenticate,
	discoverexerciseController.addDiscoverexercises
);
router.post(
	'/deleteDiscoverexercise/:id',
	authenticate,
	discoverexerciseController.deleteDiscoverexercise
);
router.post(
	'/changeDiscoverexerciseStatus',
	authenticate,
	discoverexerciseController.changeDiscoverexerciseStatus
);
// END: discoverexercise module

// START: quickworkout module
router.get(
	'/quickworkout',
	authenticate,
	quickworkoutController.getAllQuickworkouts
);
router.post(
	'/addQuickworkout',
	authenticate,
	quickworkoutUpload.single('image'),
	quickworkoutController.addQuickworkout
);
router.post(
	'/updateQuickworkout/:id',
	authenticate,
	quickworkoutController.updateQuickworkout
);
router.post(
	'/deleteQuickworkout/:id',
	authenticate,
	quickworkoutController.deleteQuickworkout
);
router.post(
	'/changeQuickworkoutStatus',
	authenticate,
	quickworkoutController.changeQuickworkoutStatus
);
// END: quickworkout module

// START: quickworkoutexercise module
router.get(
	'/getExerciseByQuickworkoutId/:id',
	authenticate,
	quickworkoutexerciseController.getExerciseByQuickworkoutId
);
router.post(
	'/addQuickworkoutexercises',
	authenticate,
	quickworkoutexerciseController.addQuickworkoutexercises
);
router.post(
	'/deleteQuickworkoutexercise/:id',
	authenticate,
	quickworkoutexerciseController.deleteQuickworkoutexercise
);
router.post(
	'/changeQuickworkoutexerciseStatus',
	authenticate,
	quickworkoutexerciseController.changeQuickworkoutexerciseStatus
);
// END: quickworkoutexercise module

// START: stretches module
router.get('/stretches', authenticate, stretchesController.getAllStretches);
router.post(
	'/addStretches',
	authenticate,
	stretchesUpload.single('image'),
	stretchesController.addStretches
);
router.post(
	'/updateStretches/:id',
	authenticate,
	stretchesController.updateStretches
);
router.post(
	'/deleteStretches/:id',
	authenticate,
	stretchesController.deleteStretches
);
router.post(
	'/changeStretchesStatus',
	authenticate,
	stretchesController.changeStretchesStatus
);
// END: stretches module

// START: stretchesexercise module
router.get(
	'/getExerciseByStretchesId/:id',
	authenticate,
	stretchesexerciseController.getExerciseByStretchesId
);
router.post(
	'/addStretchesexercises',
	authenticate,
	stretchesexerciseController.addStretchesexercises
);
router.post(
	'/deleteStretchesexercise/:id',
	authenticate,
	stretchesexerciseController.deleteStretchesexercise
);
router.post(
	'/changeStretchesexerciseStatus',
	authenticate,
	stretchesexerciseController.changeStretchesexerciseStatus
);
// END: stretchesexercise module

// START: plan module
router.get('/plan', authenticate, planController.getAllPlans);
router.post(
	'/addplan',
	authenticate,
	planController.addPlan
);
router.post(
	'/updatePlan/:id',
	authenticate,
	planController.updatePlan
);
router.post(
	'/deletePlan/:id',
	authenticate,
	planController.deletePlan
);
// router.post(
// 	'/changePlanStatus',
// 	authenticate,
// 	planController.changePlanStatus
// );
// END: plan module



// START: user module
router.get('/user', authenticate, userController.getAllUser);
router.post('/changeuserstatus', authenticate, userController.changeUserStatus);
// END: user module


// START: settings module
router.get('/settings', authenticate, settingController.settings);
router.post('/updatesetting', authenticate, settingController.updateSettings);
// END: settings module

module.exports = router;
