const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');


const getAllCompetitions=(req,res)=>{
    let flag =Validator(req.body,[],[],["userId"]); 
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    Competition.competition.find({status:{$in:["inProcess","settingUp","running","completed"]}},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                else
                {
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
                }
    })
}


const filterCompetitions=(req,res)=>{
    let flag =Validator(req.body,['userId'],[],["filterFields"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);       
    else
    {   let obj={};
        let array=["sports","division","period","status"];
        for (let key of array){
                for(let data in req.body.filterFields){
                    if(key==data)
                    obj[key]=req.body.filterFields[key];
                }
        }
        obj.organizer=req.body.userId;
        Competition.competition.find(obj,(err,result)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!result)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
        else
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,result);
        })   
    }
}

module.exports={
    getAllCompetitions,
    filterCompetitions
}
