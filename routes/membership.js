const router=require('express').Router()
const membershipController = require('../webservices/controllers/orgMembership');
const playerController = require('../webservices/controllers/playerMembership');
const AUTH=require('../middlewares/auth_handler');

router.post('/addMembership',membershipController.addMembership);
router.post('/getListOfMembership',membershipController.getListOfMembership);
router.get('/selectMembership',membershipController.selectMembership);
router.post('/editMembership',membershipController.editMembership);
router.get('/deleteMembership',membershipController.deleteMembership);
router.post('/addProfessional',membershipController.addProfessional);
router.post('/getListOfProfessional',membershipController.getListOfProfessional);
router.get('/selectProfessional',membershipController.selectProfessional);
router.post('/editProfessional',membershipController.editProfessional);
router.get('/deleteProfessional',membershipController.deleteProfessional);
router.post('/addService',membershipController.addService);
router.post('/getListOfService',membershipController.getListOfService);
router.get('/selectService',membershipController.selectService);
router.get('/getAMembership',membershipController.getAMembership);
router.get('/getAProfessional',membershipController.getAProfessional);
router.get('/getAService',membershipController.getAService);
router.get('/publishService',membershipController.publishService);
router.post('/approveMembership',membershipController.approveMembership);
router.post('/getApprovalList',membershipController.getApprovalList);







router.post('/getMembership',playerController.getMembership);
router.get('/getClubList',playerController.getClubList);
router.post('/followMembership',playerController.followMembership);
router.get('/unFollowMembership',playerController.unFollowMembership);










module.exports=router 