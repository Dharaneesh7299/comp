const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.post('/create', teamController.createTeam);
router.post('/get', teamController.getAllTeams);
router.put('/update', teamController.updateTeam);
router.delete('/delete', teamController.deleteTeam);
router.put('/update-status', teamController.updateTeamStatus);
router.post('/std_data',teamController.stdteam_data);
router.post('/dash_data',teamController.dash_data);
module.exports = router;
