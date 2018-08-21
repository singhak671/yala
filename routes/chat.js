const router=require('express').Router()
const chatController = require('../webservices/controllers/chatController.js');
const teamController=require('../webservices/controllers/team');
const AUTH=require('../middlewares/auth_handler');



router.post('/sendMessage',chatController.sendMessage);
router.post('/getMessages',AUTH.verifyToken,chatController.getMessages);
router.post('/sendMessageToAllTeam',AUTH.verifyToken,chatController.sendMessageToAllTeam);
router.post('/sendMessageToAllPlayers',AUTH.verifyToken,chatController.sendMessageToAllPlayers);
router.get('/getListOfMessageForPlayer',AUTH.verifyToken,chatController.getListOfMessageForPlayer);
router.post('/sendMsgToAllPlayersOfATeam',AUTH.verifyToken,chatController.sendMsgToAllPlayersOfATeam);










module.exports=router 