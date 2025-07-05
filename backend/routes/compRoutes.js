const express = require('express');

const {add_comp , update_comp} = require('../controllers/compController');
const router = express.Router();

router.post('/add',add_comp);
router.put('/update',update_comp);

module.exports = router;