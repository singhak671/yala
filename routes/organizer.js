const router=require("express").Router();
//const dataController = require('../webservices/controllers/data');
const competitionController = require('../webservices/controllers/competition');
const configOrganizerController = require('../webservices/controllers/configuration_organizer');
const generalController = require('../webservices/controllers/generalController');

const AUTH=require('../middlewares/auth_handler')

//router.post('/data/team/addTeam',dataController.addTeam);


router.post('/competition/addNewCompetition',competitionController.addNewCompetition);
router.post('/competition/getACompetition',competitionController.getACompetition);
router.post('/competition/getAllCompetitions',competitionController.getAllCompetition);
router.post('/competition/filterCompetition',competitionController.filterCompetition);
router.post('/competition/configureCompetition',competitionController.configureCompetition);

router.post('/competition/addPrize',competitionController.addPrize);
router.post('/competition/getPrizeList',competitionController.getPrizeList);
router.post('/competition/editPrize',competitionController.editPrize);
router.get('/competition/getAPrize',competitionController.getAPrize);
router.post('/competition/deletePrize',competitionController.deletePrize);
router.post('/competition/optionCompetition',competitionController.optionCompetition);
router.post('/competition/addFile',competitionController.addFile);
router.get('/competition/getAFile',competitionController.getAFile);
router.post('/competition/getFileList',competitionController.getFileList);
router.post('/competition/editFile',competitionController.editFile);
router.post('/competition/deleteFile',competitionController.deleteFile);



router.post('/config/standing/addStanding',configOrganizerController.addStanding);
router.post('/config/standing/getOneStanding',configOrganizerController.getOneStanding);
router.post('/config/standing/getAllStanding',configOrganizerController.getAllStanding);
router.post('/config/standing/editStanding',configOrganizerController.editStanding);
router.post('/config/standing/deleteStanding',configOrganizerController.deleteStanding);

router.post('/competition/getPlayerList',competitionController.getPlayerList);
router.post('/competition/approveCompetition',competitionController.approveCompetition);

router.post('/competition/searchAndFilterPlayerList',competitionController.searchAndFilterPlayerList)

router.post('/competition/publishCompetition',competitionController.publishCompetition);
router.post('/competition/unPublishCompetition',competitionController.unPublishCompetition);
router.post('/competition/getRegistrationDetail',competitionController.getRegistrationDetail);
router.post('/competition/competitionRegistration',competitionController.competitionRegistration);
router.post('/competition/configTeamFields',competitionController.configTeamFields);
router.post('/competition/getTeamfields',competitionController.getTeamfields);
router.post('/competition/configPlayerFields',competitionController.configPlayerFields);
router.post('/competition/getPlayerFields',competitionController.getPlayerFields);
router.post('/competition/createTeamInCompetition',competitionController.createTeamInCompetition);




router.post('/addDivision',generalController.addDivision);
router.post('/getDivision',generalController.getDivision);
router.get('/selectDivision',generalController.selectDivision);
router.post('/getADivision',generalController.getADivision);
router.post('/editDivision',generalController.editDivision);
router.post('/deleteDivision',generalController.deleteDivision);


router.post('/addPeriod',generalController.addPeriod);
router.post('/getPeriod',generalController.getPeriod);
router.get('/selectPeriod',generalController.selectPeriod);
router.post('/getAPeriod',generalController.getAPeriod);
router.post('/editPeriod',generalController.editPeriod);
router.post('/deletePeriod',generalController.deletePeriod);



router.post('/addSport',AUTH.verifyToken,generalController.addSport);
router.post('/getSport',generalController.getSport);
router.post('/getASport',generalController.getASport);
router.get('/selectSport',AUTH.verifyToken,generalController.selectSport);
router.post('/editSport',generalController.editSport);
router.post('/deleteSport',AUTH.verifyToken,generalController.deleteSport);


router.post('/addSmtpDetails',AUTH.verifyToken,generalController.addSMTPDetails);
router.post('/getMailMessageDetails',generalController.getMailMessageDetails);








module.exports=router;