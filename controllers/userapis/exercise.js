const yogaworkoutExercise = require('../../models/exercise');
const { getFile } = require('../../utility/s3');

const getAllExercise = async (req, res) => {
    try {
        let exercises = await yogaworkoutExercise.find().sort({ createdAt: -1 });
        if (exercises.length === 0) {
            return res.status(400).json({
                message: 'No Exericises Added!',
            });
        } else {
            const exercisesWithImages = await Promise.all(
                exercises.map(async (item) => {
                    const updatedItem = item.toObject ? item.toObject() : item;
                    if (item.image !== '') {
                        const imageurl = await s3.getFile(item.image); // Assuming getFile is an async function
                        // console.log("imageurl", imageurl);
                        return { ...updatedItem, image: imageurl }; // Update the image URL
                    }
                    return updatedItem; // Return the item unchanged if no image update is needed
                })
            );

            res.status(200).json({
                data: {
                    success: '1',
                    exercises: exercisesWithImages,
                }
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Server Error',
        });
    }
};

module.exports = { getAllExercise }