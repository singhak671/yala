const router=require('express').Router()
const userController = require('../webservices/controllers/user');
const AUTH=require('../middlewares/auth_handler')
router.post('/signup',userController.signup);
router.post('/verifyOtp',userController.verifyOtp);
router.get('/resendOtp',userController.resendOtp);
router.post('/login',userController.login);
router.post('/updateUser',AUTH.verifyToken,userController.updateUser);
router.get('/getDetail',AUTH.verifyToken,userController.getDetail);
router.post('/changePassword',AUTH.verifyToken,userController.changePassword);
router.post('/forgetPassword',userController.forgetPassword);
router.post('/changePlan',userController.changePlan)
router.get('/logOut',AUTH.verifyToken,userController.logOut)
router.get('/code',userController.code)
router.post('/addCard',userController.addCard)
router.get('/getCardDetails',AUTH.verifyToken,userController.getCardDetails)
router.post('/editCardDetails',AUTH.verifyToken,userController.editCardDetails)
router.post('/deleteCard',userController.deleteCard)
router.post('/paymentOrder',userController.paymentOrder);
router.post('/addEmployee',AUTH.verifyToken,userController.addEmployee)
router.post('/getListOfEmployee',AUTH.verifyToken,userController.getListOfEmployee)
router.get('/deleteEmployee',AUTH.verifyToken,userController.deleteEmployee)
router.post('/searchUser',AUTH.verifyToken,userController.searchUser)
router.post('/setRoleForEmployee',AUTH.verifyToken,userController.setRoleForEmployee)
router.get('/getRoleForEmployee',AUTH.verifyToken,userController.getRoleForEmployee)


router.post('/changeAutoRenew',userController.changeAutoRenew);
router.post('/changeCardforAutoRenew',userController.changeCardforAutoRenew);

router.post('/controlNotification',AUTH.verifyToken,userController.controlNotification)
router.get('/getControlNotification',AUTH.verifyToken,userController.getControlNotification)
router.post('/getnotificationList',AUTH.verifyToken,userController.getnotificationList)
// router.post('/saveNotification',userController.saveNotification)
router.get('/deleteNotification',AUTH.verifyToken,userController.deleteNotification)
router.post('/orgNotification',AUTH.verifyToken,userController.orgNotification)
module.exports=router;