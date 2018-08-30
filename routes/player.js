const router=require("express").Router();
//const dataController = require('../webservices/controllers/data');
const playerCompetitionController = require('../webservices/controllers/playerCompetition');
const AUTH=require('../middlewares/auth_handler')
// const configOrganizerController = require('../webservices/controllers/configuration_organizer');

//router.post('/data/team/addTeam',dataController.addTeam);


router.post('/competition/getAllCompetitions',playerCompetitionController.getAllCompetitions);


router.post('/competition/followCompetition',AUTH.verifyToken,playerCompetitionController.followCompetition);
router.post('/competition/filterCompetitions',playerCompetitionController.filterCompetitions);
router.post('/competition/unFollowCompetition',AUTH.verifyToken,playerCompetitionController.unFollowCompetition);
router.post('/competition/confirmRegistration',AUTH.verifyToken,playerCompetitionController.confirmRegistration);
router.post('/competition/competitionNotification',AUTH.verifyToken,playerCompetitionController.competitionNotification);
router.post('/competition/getRegisterFormOrNot',AUTH.verifyToken,playerCompetitionController.getRegisterFormOrNot);
router.get('/competition/searchCompetition',AUTH.verifyToken,playerCompetitionController.searchCompetition);
module.exports=router;