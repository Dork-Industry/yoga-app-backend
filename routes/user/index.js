const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/userapis/category');
const exerciseController = require('../../controllers/userapis/exercise');
const challengesController = require('../../controllers/userapis/challenges');
const discoverController = require('../../controllers/userapis/discover');
const quickworkoutController = require('../../controllers/userapis/quickworkout');
const stretchesController = require('../../controllers/userapis/stretches');

// START: exercise module
router.get('/exercise',  exerciseController.getAllExercise);
// END: exercise module

// START: category module
router.get('/category',  categoryController.getAllCategories);
// END: category module

// START: challenges module
router.get('/challenges',  challengesController.getAllChallenges);
// END: challenges module

// START: discover module
router.get('/discover',  discoverController.getAllDiscovers);
// END: discover module

// START: quickworkout module
router.get(
	'/quickworkout',
	quickworkoutController.getAllQuickworkouts
);
// END: quickworkout module

// START: stretches module
router.get('/stretches',  stretchesController.getAllStretches);
// END: stretches module

module.exports = router;