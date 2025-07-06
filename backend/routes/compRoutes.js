const express = require('express');

const {add_comp , update_comp , delete_comp , get_comp} = require('../controllers/compController');
const router = express.Router();

router.post('/add',add_comp);
router.put('/update',update_comp);
router.delete('/delete',delete_comp);
router.get('/get',get_comp);

module.exports = router;