const express = require('express');

const { int_data , category_count , month_count} = require('../controllers/analyticsController');
const router = express.Router();

router.get('/count',int_data);
router.get('/category',category_count);
router.get('/month',month_count)

module.exports = router;