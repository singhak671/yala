const router=require('express').Router()
const mediaController = require('../webservices/controllers/media');
const AUTH=require('../middlewares/auth_handler')
router.get('/accessPlanMedia',AUTH.verifyToken,mediaController.accessPlanMedia)
router.post('/createTry',mediaController.createTry)
router.post('/createAlbum',AUTH.verifyToken,mediaController.createAlbum)
router.post('/getListOfMedia',AUTH.verifyToken,mediaController.getListOfMedia)
router.get('/getDetailofMedia',AUTH.verifyToken,mediaController.getDetailofMedia)
router.get('/likeMedia',AUTH.verifyToken,mediaController.likeMedia)
router.post('/getListOfMediaPlayer',AUTH.verifyToken,mediaController.getListOfMediaPlayer)
router.post('/commentMedia',AUTH.verifyToken,mediaController.commentMedia)
router.get("/getCommnet",AUTH.verifyToken,mediaController.getCommnet)
module.exports=router 