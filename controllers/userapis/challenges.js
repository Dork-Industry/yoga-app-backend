const yogaworkoutChallenges = require('../../models/challenges');
const { getFile } = require('../../utility/s3');

const getAllChallenges = async (req, res) => {
    try {
        let challenges = await yogaworkoutChallenges.find().sort({ createdAt: -1 });
        if (challenges.length === 0) {
            return res.status(400).json({
                message: 'No Challenges Added!',
            });
        } else {
            const challengesWithImages = await Promise.all(
                challenges.map(async (item) => {
                    const updatedItem = item.toObject ? item.toObject() : item;
                    if (item.image !== '') {
                        const imageurl = await getFile(item.image); // Assuming getFile is an async function
                        // console.log("imageurl", imageurl);
                        return { ...updatedItem, image: imageurl }; // Update the image URL
                    }
                    return updatedItem; // Return the item unchanged if no image update is needed
                })
            );
            res.status(200).json({
                data : {
                    success : '1',
                    challenges: challengesWithImages,
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



module.exports = { getAllChallenges }