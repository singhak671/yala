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
router.post('/editService',membershipController.editService);
router.post('/dynamicFormField',membershipController.dynamicFormField);
router.get('/deletePlayerfromList',membershipController.deletePlayerfromList);
router.get('/sendPdfToPlayer',membershipController.sendPdfToPlayer);
router.post('/changeBookingStatus',membershipController.changeBookingStatus);






router.post('/getBookingList',membershipController.getBookingList)


router.post('/getMembership',playerController.getMembership);
router.get('/getClubList',playerController.getClubList);
router.post('/followMembership',playerController.followMembership);
router.get('/unFollowMembership',playerController.unFollowMembership);
router.post('/bookAservice',playerController.bookAservice),
router.post('/getUserTransaction',playerController.getUserTransaction)
router.post('/getServiceListInPlayer',playerController.getServiceListInPlayer)










module.exports=router 