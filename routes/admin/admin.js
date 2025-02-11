const express = require("express");
const { Login, Dashboard } = require("../../controllers/admin");
const { authenticate } = require("../../middlewares/auth");
const { getAllCategories } = require("../../controllers/category");
const { getAllExercise, addExercise, updateExercise, deleteExercise } = require('../../controllers/exercise');
const { getAllChallenges, addChallenges, updateChallenges, deleteChallenges } = require("../../controllers/challenges");
const router = express.Router();

router.post("/login", Login);

router.get('/dashboard', authenticate, Dashboard)

router.get('/category', authenticate, getAllCategories);

router.get('/exercise', authenticate, getAllExercise);

router.post('/addexecise', authenticate, addExercise);

router.post('/updateexercise/:id', authenticate, updateExercise);

router.post('/deleteexercise/:id', authenticate, deleteExercise);

router.get('/challenges', authenticate, getAllChallenges);

router.post('/addchallenges', authenticate, addChallenges);

router.post('/updatechallenges/:id', authenticate, updateChallenges);

router.post('/deletechallenges/:id', authenticate, deleteChallenges);

module.exports = router;