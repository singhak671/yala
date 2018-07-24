const router=require("express").Router();
//const dataController = require('../webservices/controllers/data');
const playerCompetitionController = require('../webservices/controllers/playerCompetition');
const AUTH=require('../middlewares/auth_handler')
// const configOrganizerController = require('../webservices/controllers/configuration_organizer');

//router.post('/data/team/addTeam',dataController.addTeam);


router.post('/competition/getAllCompetitions',AUTH.verifyToken,playerCompetitionController.getAllCompetitions);

module.exports=router;