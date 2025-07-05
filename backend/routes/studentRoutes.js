const express = require('express');
const { getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const router = express.Router();

router.post('/getprofile', getStudentProfile);
router.put('/updateprofile', updateStudentProfile);

module.exports = router;
