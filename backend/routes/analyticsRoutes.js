const express = require('express');

const { int_data , category_count , std_count , comp_count , month_count , most_reg , recent_comp , rec_reg} = require('../controllers/analyticsController');
const router = express.Router();

router.get('/count',int_data);
router.get('/category',category_count);
router.get('/month',month_count);
router.get('/most',most_reg);
router.get('/recent',recent_comp);
router.get('/comp',comp_count);
router.get('/std',std_count);
router.get('/recentreg',rec_reg);

module.exports = router;