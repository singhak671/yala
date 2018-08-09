const router=require('express').Router()
const chatController = require('../webservices/controllers/chatController.js');
const teamController=require('../webservices/controllers/team');
const AUTH=require('../middlewares/auth_handler');



router.post('/sendMessage',chatController.sendMessage);
router.post('/getMessages',chatController.getMessages);










module.exports=router 