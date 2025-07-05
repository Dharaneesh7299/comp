const express= require('express');

const { getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const router = require('./teachersRoutes');

router.get('/getprofile', getStudentProfile);
router.put('/updateprofile', updateStudentProfile);

module.exports = router;