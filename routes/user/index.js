const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/userapis/category');
const exerciseController = require('../../controllers/userapis/exercise');
const challengesController = require('../../controllers/userapis/challenges');
const discoverController = require('../../controllers/userapis/discover');
const quickworkoutController = require('../../controllers/userapis/quickworkout');
const stretchesController = require('../../controllers/userapis/stretches');
const settingController = require('../../controllers/userapis/settings');
const weekController = require('../../controllers/userapis/week');
const dayController = require('../../controllers/userapis/days');
const challengesExerciseController = require('../../controllers/userapis/challengesexercise');
const homeWorkoutController = require('../../controllers/userapis/homeworkout');
const categoryExerciseController = require('../../controllers/userapis/categoryexercise');
const userController = require('../../controllers/userapis/user');
const weekCompletedController = require('../../controllers/userapis/weekcompleted');
const dayCompletedController = require('../../controllers/userapis/daycompleted');
const workoutCompletedController = require('../../controllers/userapis/workoutcompleted');
const planController = require('../../controllers/userapis/plan');
const customplanController = require('../../controllers/userapis/customPlan');
const customplanexerciseController = require('../../controllers/userapis/customplanexercise');

//START : User Module
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/checkalreadyregister', userController.checkAlreadyRegister);
router.post('/forgotpassword', userController.forgotPassword);
router.post('/verifyotp', userController.verifyOTP);
router.post('/changepassword', userController.changePassword);
router.post('/updatepassword', userController.updatePassword);
//END : User Module

// START: exercise module
router.get('/exercise', exerciseController.getAllExercise);
// END: exercise module

// START: category module
router.get('/category', categoryController.getAllCategories);
router.post(
	'/categoryexercise',
	categoryExerciseController.getExerciseByCategoryId
);
// END: category module

// START: challenges module
router.post('/challenges', challengesController.getAllChallenges);
router.post('/getweek', weekController.getWeek);
router.post('/weekcompleted', weekCompletedController.weekCompleted);
router.post('/daycompleted', dayCompletedController.dayCompleted);
router.post('/getdays', dayController.getDay);
router.post(
	'/challengesexercise',
	challengesExerciseController.getChallengesExercise
);
// END: challenges module

// START: discover module
router.post('/discover', discoverController.getAllDiscovers);
router.post('/discoverexercise', discoverController.getDiscoverExercise);
// END: discover module

// START: quickworkout module
router.post('/quickworkout', quickworkoutController.getAllQuickworkouts);
router.post(
	'/quickworkoutexercise',
	quickworkoutController.getQuickworkoutExercise
);
// END: quickworkout module

// START: stretches module
router.post('/stretches', stretchesController.getAllStretches);
router.post('/stretchesexercise', stretchesController.getStretchesExercise);
// END: stretches module

// START: settings module
router.get('/settings', settingController.settings);
// END: settings module

// START: homeWorkout module
router.post('/gethomeworkout', homeWorkoutController.getHomeWorkout);
router.post('/homeworkout', homeWorkoutController.homeWorkout);
// END: homeWorkout module

// START: purchaseplan module
router.post('/plan', planController.getPlan);
router.post('/cancelplan', planController.cancelPlan);
router.post('/checkpurchaseplanday', planController.checkPurchasePlanDay);
router.post('/addpurchaseplan', planController.addPurchasePlan);
// END: purchaseplan module

// START: customplan module
router.post('/getcustomplan', customplanController.getCustomPlan);
router.post('/customplan', customplanController.addCustomPlan);
// END: customplan module

// START: customplanexercise module
router.post(
	'/getcustomplanexercise',
	customplanexerciseController.getCustomPlanExercise
);
router.post(
	'/customplanexercise',
	customplanexerciseController.customPlanExercise
);
router.post(
	'/editcustomplanexercise',
	customplanexerciseController.editCustomPlanExercise
);
router.post(
	'/deletecustomplanexercise',
	customplanexerciseController.deleteCustomPlanExercise
)
// END: customplanexercise module

// START: workoutscompleted module
router.post('/workoutcompleted', workoutCompletedController.workoutCompleted);
router.post(
	'/getworkoutcompleted',
	workoutCompletedController.getWorkoutCompleted
);
// END: workoutscompleted module

module.exports = router;
