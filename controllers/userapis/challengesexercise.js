const yogaworkoutChallengesexercise = require('../../models/challengesexercise');

const getChallengesExercise = async (req, res) => {
    try {
        if (req.body.days_id) {
            let days_id = req.body.days_id;
            const result = await yogaworkoutChallengesexercise.aggregate([
                {
                    $match: { daysId: days_id }
                },
                {
                    $lookup: {
                        from: 'yogaworkoutExercise',
                        localField: "exerciseId",
                        foreignField: "exerciseId",
                        as: 'Exercise'
                    }
                },
                {
                    $unwind: "$Exercise" // Deconstruct the Exercise array
                },
                {
                    $replaceRoot: { newRoot: "$Exercise" } // Replace the root with the Exercise document
                },
                {
                    $project: {
                        totalDays: 0 // Exclude the totalDays field if it exists
                    }
                }
            ])
            res.status(200).json({
                result,
            });
        }
        else {
            res.status(200).json({
                success: 0,
                week: [],
                error: 'Variable not set'
            })
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Server Error',
        });
    }
}

module.exports = { getChallengesExercise }