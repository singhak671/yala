const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
const configOrganizer=require("../../models/configuration_organizer")

const addStanding=(req,res)=>{
    let flag =Validator(req.body,["userId",],[],["standingName","sport"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    User.findById(req.body.userId,(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
    
        configOrganizer.standing.findOne({$or:[{userId:req.body.userId,standingName:req.body.standingName},{userId:req.body.userId,sport:req.body.sport}]},(err,success1)=>{
            console.log(err,"success1>>>>",success1);
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
            if(success1)
                return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);
            configOrganizer.standing.create(req.body,(err,success2)=>{
                if(err || ! success2)
                    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);
                return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success2);
            })            
        })
    })
}


const getOneStanding=(req,res)=>{
   let flag =Validator(req.body,["userId"],[],["standingId"]); 
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    configOrganizer.standing.findOne({userId:req.body.userId,_id:req.body.standingId},(err,success)=>{
        console.log(err,"success>>>>",success);
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);          
    })
}


const getAllStanding=(req,res)=>{
   let flag =Validator(req.body,["userId"],[],["page","limit"]); 
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);  
    configOrganizer.standing.paginate({userId:req.body.userId},{ page: req.body.page, limit: req.body.limit },(err,success)=>{
        console.log(err,"success>>>>",success);
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);          
    })
}


const editStanding =(req,res)=>{
    let flag =Validator(req.body,["userId","standingDetails"],["_id","criterias","standingName","sport","visibleColumns"],[]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
        for(let data of req.body.standingDetails.criterias)
            {
                if(!data.criteria || !data.order)
                    return Response.sendResponse(res,responseCode.BAD_REQUEST,`Please provide "criteria" and "order" object in criterias array`);
            }   
    configOrganizer.standing.findOne({userId:req.body.userId,_id:req.body.standingDetails._id},(err,success)=>{
        console.log(err,"success>>>>",success);
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        configOrganizer.standing.findByIdAndUpdate({userId:req.body.userId,_id:req.body.standingDetails._id},req.body.standingDetails,{new:true},(err,success1)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
            if(!success1)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success1);
        })            
    })
}

const deleteStanding=(req,res)=>{
    let flag =Validator(req.body,["userId"],[],["standingId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    configOrganizer.standing.findOneAndDelete({userId:req.body.userId,_id:req.body.standingId},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        return Response.sendResponse(res,responseCode.RESOURCE_DELETED,"Successfully deleted",success);

    })
}






module.exports={
   addStanding,
   editStanding,
   deleteStanding,
   getOneStanding,
   getAllStanding
}