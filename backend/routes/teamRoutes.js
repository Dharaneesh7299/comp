const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.post('/create', teamController.createTeam);
router.get('/get', teamController.getAllTeams);
router.put('/update', teamController.updateTeam);
router.delete('/delete', teamController.deleteTeam);

module.exports = router;
