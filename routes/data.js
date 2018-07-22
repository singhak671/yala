const router=require('express').Router()
const dataController = require('../webservices/controllers/data');
const AUTH=require('../middlewares/auth_handler')

router.post('/addClub',AUTH.verifyToken,dataController.addClub);
router.get("/getListOfClub",AUTH.verifyToken,dataController.getListOfClub)
router.get('/findClub',AUTH.verifyToken,dataController.findClub)
router.post('/editClub',AUTH.verifyToken,dataController.editClub)
router.get('/deleteClub',AUTH.verifyToken,dataController.deleteClub)
router.post('/addSponsers',AUTH.verifyToken,dataController.addSponsers);
router.get('/getListOfSponser',AUTH.verifyToken,dataController.getListOfSponser)
router.post('/getEditDetailOfSponser',AUTH.verifyToken,dataController.getEditDetailOfSponser)
router.post('/editSponser',AUTH.verifyToken,dataController.editSponser)
router.post("/deleteSponser",AUTH.verifyToken,dataController.deleteSponser)
router.post("/searchSponser",AUTH.verifyToken,dataController.searchSponser)
module.exports=router