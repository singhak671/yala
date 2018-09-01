const router=require('express').Router()
const dataController = require('../webservices/controllers/data');
const teamController=require('../webservices/controllers/team')
const AUTH=require('../middlewares/auth_handler')
//router.post('/addClub',dataController.addClub);
router.post('/addClub',AUTH.verifyToken,dataController.addClub);
router.post("/getListOfClub",AUTH.verifyToken,dataController.getListOfClub);
router.get('/findClub',AUTH.verifyToken,dataController.findClub)
router.post('/editClub',AUTH.verifyToken,dataController.editClub)
router.get('/deleteClub',AUTH.verifyToken,dataController.deleteClub)


router.post('/addSponsors',AUTH.verifyToken,dataController.addSponsors);
router.post('/getListOfSponsor',AUTH.verifyToken,dataController.getListOfSponsor);
router.get('/getEditDetailOfSponsor',AUTH.verifyToken,dataController.getEditDetailOfSponsor)
router.post('/editSponsor',AUTH.verifyToken,dataController.editSponsor)
router.get("/deleteSponsor",AUTH.verifyToken,dataController.deleteSponsor)
router.get("/selectClub",AUTH.verifyToken,dataController.selectClub)


router.post("/addVenue",AUTH.verifyToken,dataController.addVenue);
router.post('/getListOfVenue',AUTH.verifyToken,dataController.getListOfVenue)
router.get('/getEditDetailOfVenue',AUTH.verifyToken,dataController.getEditDetailOfVenue)
router.post('/editVenue',AUTH.verifyToken,dataController.editVenue)
router.get('/deleteVenue',AUTH.verifyToken,dataController.deleteVenue)


router.post('/addReferee',AUTH.verifyToken,dataController.addReferee)
router.post('/getListOfReferee',AUTH.verifyToken,dataController.getListOfReferee)
router.get('/getEditDetailOfReferee',AUTH.verifyToken,dataController.getEditDetailOfReferee)
router.post('/editReferee',AUTH.verifyToken,dataController.editReferee)
router.get('/deleteReferee',AUTH.verifyToken,dataController.deleteReferee)


router.get('/selectCompition',AUTH.verifyToken,teamController.selectCompition)
router.get('/selectVenue',AUTH.verifyToken,teamController.selectVenue)
router.post('/createTeam',AUTH.verifyToken,teamController.createTeam)
router.get('/getDetailOfTeam',AUTH.verifyToken,teamController.getDetailOfTeam)
router.post('/filterTeam',AUTH.verifyToken,teamController.filterTeam)
router.get('/selectTeam',AUTH.verifyToken,teamController.selectTeam)

router.post('/listOfTeam',AUTH.verifyToken,teamController.listOfTeam)

router.post('/listOfPlayer',AUTH.verifyToken,teamController.listOfPlayer)

router.post('/addPlayer',AUTH.verifyToken,teamController.addPlayer)
router.post('/getListOfPlayer',AUTH.verifyToken,teamController.getListOfPlayer)
router.get('/getDetailOfPlayer',AUTH.verifyToken,teamController.getDetailOfPlayer)

// router.post('/addSport',AUTH.verifyToken,dataController.addSport)
// router.post("/getListOfSport",AUTH.verifyToken,dataController.getListOfSport)
// router.get('/findSport',AUTH.verifyToken,dataController.findSport)
// router.post('/editSport',AUTH.verifyToken,dataController.editSport)
// router.get('/deleteSport',AUTH.verifyToken,dataController.deleteSport)
// router.post('/searchSport',AUTH.verifyToken,dataController.searchSport)
// router.get('/selectSport',AUTH.verifyToken,dataController.selectSport)
module.exports=router 