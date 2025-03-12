const yogaworkoutUser = require('../../models/user');

const checkUserAlreadyRegister = async (userName, mobileNo) => {
    const user = await yogaworkoutUser.find({ username: userName, mobile: mobileNo });
    if (user.length === 0) {
        return false;
    } else {
        return TransformStreamDefaultController;
    }
}

const checkUserBan = async (userName, is_Active) => {
    const user = await yogaworkoutUser.find({ username: userName, isActive: is_Active });
    if (user.length === 0) {
        return false;
    } else {
        return true;
    }
}
const register = async (req, res) => {
    try {
        let userDetails = req.body;
        // console.log("userDetails", userDetails)
        if (userDetails.first_name && userDetails.first_name != "" &&
            userDetails.last_name && userDetails.last_name != "" &&
            userDetails.username && userDetails.username != "" &&
            userDetails.email && userDetails.email != "" &&
            userDetails.password && userDetails.password != "" &&
            userDetails.mobile && userDetails.mobile != "" &&
            userDetails.age && userDetails.age != "" &&
            userDetails.gender && userDetails.gender != "" &&
            userDetails.height && userDetails.height != "" &&
            userDetails.weight && userDetails.weight != "" &&
            userDetails.address && userDetails.address != "" &&
            userDetails.city && userDetails.city != "" &&
            userDetails.state && userDetails.state != "" &&
            userDetails.country && userDetails.country != "" &&
            userDetails.intensively && userDetails.intensively != "" &&
            userDetails.timeinweek && userDetails.timeinweek != "" &&
            userDetails.device_id && userDetails.device_id != ""
        ) {
            const checkUserRegister = await checkUserAlreadyRegister(userDetails.username, userDetails.mobile);
            // console.log("checkUserRegister", checkUserRegister)
            if (checkUserRegister) {
                res.status(500).json({
                    success: 0,
                    userdetail: [],
                    error: 'User already register',
                });
            }
            else {
                const newUser = new yogaworkoutUser({
                    username: userDetails.username,
                    email: userDetails.email,
                    password: userDetails.password,
                    mobile: userDetails.mobile,
                    age: userDetails.age,
                    gender: userDetails.gender,
                    height: userDetails.height,
                    weight: userDetails.weight,
                    image: userDetails?.image,
                    address: userDetails.address,
                    city: userDetails.city,
                    state: userDetails.state,
                    country: userDetails.country,
                    intensively: userDetails.intensively,
                    timeinweek: userDetails.timeinweek,
                    first_name: userDetails.first_name,
                    last_name: userDetails.last_name,
                    device_id : userDetails.device_id
                });

                const savedUser = await newUser.save();
                res.status(201).json({ success: 1, login: savedUser, message: 'Register Successfully' });
            }
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: 0,
            exercise: [],
            error: 'Server Error',
        });
    }

}

const login = async (req, res) => {
    try {
        const user = req.body;
        if (user.username && user.username != "" &&
            user.password && user.password != "" &&
            user.device_id && user.device_id != "") {
            const isBan = await checkUserBan(user.username, 1)

            if(isBan){
                const Loginuser = await yogaworkoutUser.find({ username: user.username, password: user.password, device_id : user.device_id });
                if (Loginuser.length === 0) {
                    res.status(500).json({
                        success: 0,
                        userdetail: [],
                        error: 'User not Found',
                    });
                }
                else{
                    res.status(200).json({
                        success: 1,
                        userdetail: Loginuser,
                        message: 'Login Successfully',
                    });
                }
            }
            else{
                res.status(500).json({
                    success: 0,
                    userdetail: [],
                    error: 'May be User is Not Active',
                });
            }
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            success: 0,
            exercise: [],
            error: 'Server Error',
        });
    }
}



module.exports = { register , login}