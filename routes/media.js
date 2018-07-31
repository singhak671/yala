const router=require('express').Router()
const mediaController = require('../webservices/controllers/media');
const AUTH=require('../middlewares/auth_handler')

router.post('/createAlbum',AUTH.verifyToken,mediaController.createAlbum)
router.post('/getListOfMedia',AUTH.verifyToken,mediaController.getListOfMedia)
router.get('/getDetailofMedia',AUTH.verifyToken,mediaController.getDetailofMedia)
module.exports=router 