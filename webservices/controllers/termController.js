const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const TermsAndPolicy=require("../../models/termsAndPrivacyModel")

const getTermsAndConditions=(req,res)=>{
    console.log(req.body.role)
    if(!req.body.role){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ROLE_IS_REQ)
    }
    else{
        let role=req.body.role
        TermsAndPolicy.findOne({},(err,success)=>{
            if(success)
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.TERMS_UPDATE_SUCCESSFULLY,success[role])
            else 
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
        })
    }
	
}
const updateTermsAndPrivacy=(req,res)=>{
	if(!req.body)
	return Response.sendResponseWithoutData(res, resCode.BAD_REQUEST,responseMsg.PROVIDE_DATA)
 else{
     let role=req.body.role
     
    TermsAndPolicy.findOne({},(err,success)=>{
     if(err)
     return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
     else if(!success){
         console.log("gdfghsghfhdghf")
     }
     else{
        success[req.body.role].termsAndConditions=req.body.termsAndConditions;
        success[req.body.role].privacyPolicy=req.body.privacyPolicy;
        success.save((err,result)=>{
            if(err)
             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
             else
             return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.TERMS_MODIFIED,result[role])
        })
      

     }
     })
 
 }
}
module.exports={
    getTermsAndConditions,
    updateTermsAndPrivacy
}