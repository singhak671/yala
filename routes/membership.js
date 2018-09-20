const router=require('express').Router()
const membershipController = require('../webservices/controllers/orgMembership');
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








module.exports=router 