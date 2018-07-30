const router=require("express").Router();
//const dataController = require('../webservices/controllers/data');
const playerCompetitionController = require('../webservices/controllers/playerCompetition');
const AUTH=require('../middlewares/auth_handler')
// const configOrganizerController = require('../webservices/controllers/configuration_organizer');

//router.post('/data/team/addTeam',dataController.addTeam);


router.post('/competition/getAllCompetitions',AUTH.verifyToken,playerCompetitionController.getAllCompetitions);


router.post('/competition/followCompetition',AUTH.verifyToken,playerCompetitionController.followCompetition);
router.post('/competition/filterCompetitions',AUTH.verifyToken,playerCompetitionController.filterCompetitions);
router.post('/competition/unFollowCompetition',AUTH.verifyToken,playerCompetitionController.unFollowCompetition);
module.exports=router;