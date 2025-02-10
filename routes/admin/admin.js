const express = require("express");
const { Login, Dashboard } = require("../../controllers/admin");
const { authenticate } = require("../../middlewares/auth");
const { getAllCategories } = require("../../controllers/category");
const { getAllExercise, addExercise, updateExercise, deleteExercise } = require('../../controllers/exercise')
const router = express.Router();

router.post("/login", Login);

router.get('/dashboard', authenticate, Dashboard)

router.get('/category', authenticate, getAllCategories);

router.get('/exercise', authenticate, getAllExercise);

router.post('/addexecise', authenticate, addExercise);

router.post('/updateexercise/:id', authenticate, updateExercise);

router.post('/deleteexercise/:id', authenticate, deleteExercise);

module.exports = router;