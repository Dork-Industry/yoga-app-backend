const express = require('express');
const router = express.Router();


const admin = require('./admin/admin');
const user = require('./user/index');
router.use('/admin', admin);
router.use('/user', user)


module.exports = router;