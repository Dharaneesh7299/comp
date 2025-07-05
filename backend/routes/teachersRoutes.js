const express= require('express');
const { get_student , add_student} = require('../controllers/teachersController');
const router = express.Router();

router.get('/get',get_student);
router.post('/add',add_student);

module.exports = router ;