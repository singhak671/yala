const router=require('express').Router()
const termController = require('../webservices/controllers/termController');

router.post('/getTermsAndConditions',termController.getTermsAndConditions)
router.post('/updateTermsAndPrivacy',termController.updateTermsAndPrivacy)

module.exports=router;