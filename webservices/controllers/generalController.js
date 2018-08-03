const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const  Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
const Team=require("../../models/team")
const followComp=require("../../models/compFollowOrgPlay.js");
const General=require("../../models/generalSchema.js")

const addDivision=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["divisionName","minAge","maxAge","gender","date","sports"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.division.findOne({divisionName:req.body.divisionName,sports:req.body.sports},(err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(success)
                return Response.sendResponse(res,responseCode.BAD_REQUEST,`A division with the name "${req.body.divisionName}" already exists !`);
            else{
                req.body.organizer=req.body.userId;
                General.division.create(req.body,(err1,success1)=>{
                    if (err1)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                    else if(!success1)
                            return Response.sendResponse(res,responseCode.BAD_REQUEST,`Cannot create a division!`);
                        else
                            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success1);
                })
            }
            
    })

}

const getDivision=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],[])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.division.find({organizer:req.body.userId},(err,result)=>{
        res.send(result)
    })
}

module.exports={
    addDivision,
    getDivision
}