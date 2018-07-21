const router=require('express').Router()
const userController = require('../webservices/controllers/user');
const competitionController = require('../webservices/controllers/competition');


router.post('/addUser',userController.addUser);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);
router.post('/login',userController.login);
router.post('/updateUser',userController.updateUser);
router.post('/getDetail',userController.getDetail);
router.post('/forgotPassword',userController.forgotPassword);
router.post('/changePassword',userController.changePassword);
router.post('/changePlan',userController.changePlan);
router.post('/settings/addCard',userController.addCard);
router.post('/settings/editCard',userController.editCard);
router.post('/settings/deleteCard',userController.deleteCard);


// router.post('/competition/addNewCompetition',competitionController.addNewCompetition);
// router.post('/competition/configureCompetition',competitionController.configureCompetition);

// router.post('/competition/addPrize',competitionController.addPrize);
// router.post('/competition/editPrize',competitionController.editPrize);
// router.post('/competition/deletePrize',competitionController.deletePrize);
// router.post('/competition/optionCompetition',competitionController.optionCompetition);






// router.post('/competition/optionCompetition',competitionController.optionCompetition);






module.exports=router;