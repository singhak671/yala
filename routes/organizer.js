const router=require("express").Router();
//const dataController = require('../webservices/controllers/data');
const competitionController = require('../webservices/controllers/competition');
const configOrganizerController = require('../webservices/controllers/configuration_organizer');
const AUTH=require('../middlewares/auth_handler')

//router.post('/data/team/addTeam',dataController.addTeam);


router.post('/competition/addNewCompetition',competitionController.addNewCompetition);
router.post('/competition/getACompetition',competitionController.getACompetition);
router.post('/competition/getAllCompetitions',competitionController.getAllCompetition);
router.post('/competition/filterCompetition',competitionController.filterCompetition);
router.post('/competition/configureCompetition',competitionController.configureCompetition);

router.post('/competition/addPrize',competitionController.addPrize);
router.post('/competition/editPrize',competitionController.editPrize);
router.post('/competition/deletePrize',competitionController.deletePrize);
router.post('/competition/optionCompetition',competitionController.optionCompetition);
router.post('/competition/addFile',competitionController.addFile);
router.post('/competition/editFile',competitionController.editFile);
router.post('/competition/deleteFile',competitionController.deleteFile);



router.post('/config/standing/addStanding',configOrganizerController.addStanding);
router.post('/config/standing/getOneStanding',configOrganizerController.getOneStanding);
router.post('/config/standing/getAllStanding',configOrganizerController.getAllStanding);
router.post('/config/standing/editStanding',configOrganizerController.editStanding);
router.post('/config/standing/deleteStanding',configOrganizerController.deleteStanding);

router.post('/competition/getPlayerList',competitionController.getPlayerList);
router.post('/competition/approveCompetition',competitionController.approveCompetition);



router.post('/competition/publishCompetition',competitionController.publishCompetition);
router.post('/competition/unPublishCompetition',competitionController.unPublishCompetition);
router.post('/competition/getRegistrationDetail',competitionController.getRegistrationDetail);
router.post('/competition/competitionRegistration',competitionController.competitionRegistration);
router.post('/competition/configTeamFields',competitionController.configTeamFields);
router.post('/competition/getTeamfields',competitionController.getTeamfields);
router.post('/competition/configPlayerFields',competitionController.configPlayerFields);
router.post('/competition/getPlayerFields',competitionController.getPlayerFields);
router.post('/competition/createTeamInCompetition',competitionController.createTeamInCompetition);

module.exports=router;