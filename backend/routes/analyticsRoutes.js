const express = require('express');

const { int_data , category_count , month_count , most_reg} = require('../controllers/analyticsController');
const router = express.Router();

router.get('/count',int_data);
router.get('/category',category_count);
router.get('/month',month_count);
router.get('/most',most_reg);

module.exports = router;