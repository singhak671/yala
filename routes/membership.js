const router=require('express').Router()
const membershipController = require('../webservices/controllers/orgMembership');
const AUTH=require('../middlewares/auth_handler');

router.post('/addMembership',membershipController.addMembership);
router.post('/getListOfMembership',membershipController.getListOfMembership);
router.get('/selectMembership',membershipController.selectMembership);
router.post('/editMembership',membershipController.editMembership);






module.exports=router 