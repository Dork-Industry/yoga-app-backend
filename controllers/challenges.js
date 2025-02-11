const { mongoose } = require("mongoose");
const yogaworkoutChallenges = require("../models/challenges")

const getAllChallenges = async (req, res) => {
    try {
        let challenges = await yogaworkoutChallenges.find();
        if (challenges.length === 0) {
            return res.status(400).json({
                message: "No Challenges Added!"
            });
        }
        else {
            res.status(200).json({
                challenges
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

const addChallenges = async (req, res) => {
    try {
        if (!req.body.challengesName) {
            return res.status(400).json({
                message: "Enter Exercise Name!"
            });
        }

        let challengesName = req.body.challengesName;
        let description = req.body?.description;
        let isActive = req.body.isActive ? req.body.isActive : 1;

        const newChallenges = new yogaworkoutChallenges({
            challengesName: challengesName,
            description: description,
            isActive: isActive,
        })
        await newChallenges.save();
        res.status(201).json({ message: 'Exercise Added successfully!' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

const updateChallenges = async (req, res) => {
    const challengesId = req.params.id;
    let challengesName = req.body.challengesName;
    let description = req.body?.description;
    let isActive = req.body.isActive ? req.body.isActive : 1;

    let newChallenges = {
        challengesName: challengesName,
        description: description,
        isActive: isActive,
    }
    // console.log("newExercise", newExercise)
    if (mongoose.Types.ObjectId.isValid(challengesId)) {

        const updatedChallenges = await yogaworkoutChallenges.findByIdAndUpdate(challengesId, newChallenges, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators on update
        });
        if (!updatedChallenges) {
            return res.status(404).json({ error: 'Challenges not found' });
        }

        res.json(updatedChallenges);

    } else {
        res.status(500).send({
            message: 'Invalid ObjectId'
        });
    }
}

const deleteChallenges = async(req,res) => {
    const challengesId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(challengesId)) {
        return res.status(400).json({ error: 'Invalid challenges ID' });
    }

    try {
        // Find the user by ID and delete
        const deletedChallenges = await yogaworkoutChallenges.findByIdAndDelete(challengesId);

        if (!deletedChallenges) {
            return res.status(404).json({ error: 'Challenges not found' });
        }

        res.json({ message: 'Challenges deleted successfully', deletedChallenges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete Challenges' });
    }
}

module.exports = { getAllChallenges, addChallenges, updateChallenges,deleteChallenges };