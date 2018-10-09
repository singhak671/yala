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
router.post('/addCard',AUTH.verifyToken,userController.addCard)
router.get('/getCardDetails',AUTH.verifyToken,userController.getCardDetails)
router.post('/editCardDetails',AUTH.verifyToken,userController.editCardDetails)
router.post('/deleteCard',AUTH.verifyToken,userController.deleteCard)
router.post('/getCard',AUTH.verifyToken,userController.getCard)
router.post('/paymentOrder',userController.paymentOrder);
router.post('/addEmployee',AUTH.verifyToken,userController.addEmployee)
router.post('/getListOfEmployee',AUTH.verifyToken,userController.getListOfEmployee)
router.get('/deleteEmployee',AUTH.verifyToken,userController.deleteEmployee)
router.post('/searchUser',AUTH.verifyToken,userController.searchUser)
router.post('/setRoleForEmployee',AUTH.verifyToken,userController.setRoleForEmployee)
router.get('/getRoleForEmployee',AUTH.verifyToken,userController.getRoleForEmployee)


router.post('/changeAutoRenew',AUTH.verifyToken,userController.changeAutoRenew);
router.post('/changeCardforAutoRenew',AUTH.verifyToken,userController.changeCardforAutoRenew);

router.post('/controlNotification',AUTH.verifyToken,userController.controlNotification)
router.get('/getControlNotification',AUTH.verifyToken,userController.getControlNotification)
router.post('/getnotificationList',AUTH.verifyToken,userController.getnotificationList)
// router.post('/saveNotification',userController.saveNotification)
router.get('/deleteNotification',AUTH.verifyToken,userController.deleteNotification)
router.post('/orgNotification',AUTH.verifyToken,userController.orgNotification)

router.get('/updateDeviceToken',userController.updateDeviceToken)


////////////////////// ADMIN ROUTES   //////////////////////

router.post('/sendLink',userController.sendLink)
router.post('/resetPassword/:_id',userController.resetPassword)
router.get('/authenticateUser/:_id',userController.authenticateUser)
router.post('/userList',userController.userList)
router.get('/countUserActive',userController.countUserActive)
router.get('/countUserInActive',userController.countUserInActive)
router.get('/blockUser/:pageNumber',userController.blockUser);
router.get('/activeUser/:pageNumber',userController.activeUser);
router.post('/addUser',userController.addUser); //add user 09 oct
router.post('/createBlockUser',userController.createBlockUser); //add user 09 oct
router.post('/viewUser',userController.viewUser); //add user 09 oct
router.post('/editUser',userController.editUser); //add user 09 oct
router.post('/deleteUser',userController.deleteUser); //add user 09 oct
router.post('/userSearch',userController.userSearch); //add user 09 oct
router.get('/aboutUs',userController.aboutUs);



module.exports=router;