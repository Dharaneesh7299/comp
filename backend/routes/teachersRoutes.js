const express= require('express');
const { get_student , 
    add_student , 
    add_teacher ,
    delete_student ,
    update_student ,
    getTeacherProfile , 
    updateTeacherProfile ,
    } = require('../controllers/teachersController');
const router = express.Router();

router.get('/getstudent',get_student);
router.post('/addstudent',add_student);
router.delete('/deletestudent',delete_student);
router.put('/updatestudent',update_student);
router.post('/getprofile',getTeacherProfile);
router.post('/addteacher',add_teacher);
router.put('/updateteacher',updateTeacherProfile);

module.exports = router ;