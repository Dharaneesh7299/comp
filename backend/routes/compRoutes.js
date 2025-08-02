const express = require('express');

const {add_comp , update_comp , comp_id , delete_comp , get_comp} = require('../controllers/compController');
const router = express.Router();

router.post('/add',add_comp);
router.put('/update',update_comp);
router.delete('/delete',delete_comp);
router.get('/get',get_comp);
router.post('/getcomp',comp_id);

module.exports = router;