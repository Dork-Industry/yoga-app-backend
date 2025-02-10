const { mongoose } = require("mongoose");
const yogaworkoutExercise = require("../models/exercise")

const getAllExercise = async (req, res) => {
    try {
        let exericises = await yogaworkoutExercise.find();
        if (exericises.length === 0) {
            return res.status(400).json({
                message: "No Exericises Added!"
            });
        }
        else {
            res.status(200).json({
                exericises
            });
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

const addExercise = async (req, res) => {
    try {
        if (!req.body.exerciseName) {
            return res.status(400).json({
                message: "Enter Exercise Name!"
            });
        }
        if (!req.body.exerciseTime) {
            return res.status(400).json({
                message: "Enter Exercise Time in Minutes!"
            });
        }

        let exerciseName = req.body.exerciseName;
        let exerciseTime = req.body.exerciseTime;
        let description = req.body?.description;
        let isActive = req.body.isActive ? req.body.isActive : 1;

        const newExercise = new yogaworkoutExercise({
            exerciseName: exerciseName,
            exerciseTime: exerciseTime,
            description: description,
            isActive: isActive,
        })
        await newExercise.save();
        res.status(201).json({ message: 'Exercise Added successfully!' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

const updateExercise = async (req, res) => {
    const exerciseId = req.params.id;
    let exerciseName = req.body.exerciseName;
    let exerciseTime = req.body.exerciseTime;
    let description = req.body?.description;
    let isActive = req.body.isActive ? req.body.isActive : 1;

    let newExercise = {
        exerciseName: exerciseName,
        exerciseTime: exerciseTime,
        description: description,
        isActive: isActive,
    }
    console.log("newExercise", newExercise)
    if (mongoose.Types.ObjectId.isValid(exerciseId)) {

        const updatedExercise = await yogaworkoutExercise.findByIdAndUpdate(exerciseId, newExercise, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators on update
        });
        if (!updatedExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        res.json(updatedExercise);

    } else {
        res.status(500).send({
            message: 'Invalid ObjectId'
        });
    }
}

const deleteExercise = async(req,res) => {
    const exerciseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
        return res.status(400).json({ error: 'Invalid exercise ID' });
    }

    try {
        // Find the user by ID and delete
        const deletedExercise = await yogaworkoutExercise.findByIdAndDelete(exerciseId);

        if (!deletedExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        res.json({ message: 'Exercise deleted successfully', deletedExercise });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete Exercise' });
    }
}

module.exports = { getAllExercise, addExercise, updateExercise,deleteExercise };