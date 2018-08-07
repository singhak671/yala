const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const Chat=require("../../models/chat");
const  Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
const Team=require("../../models/team")
const followComp=require("../../models/compFollowOrgPlay.js");

const sendMessage=(req,res)=>{
    let flag =Validator(req.body,[],[],["organizerId","playerId","message"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    User.find({_id:req.body.organizerId,_id:req.body.senderId,_id:req.body.playerId},(err,success)=>{
        if (err)
             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
         else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else{
                Chat.chat.findOneAndUpdate({organizerId:req.body.organizerId,playerId:req.body.playerId},{$push:{message:req.body.message}},{new:true,upsert:true},(err1,success1)=>{
                    if (err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                    else if(!success)
                            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                        else{
                            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success1);
                        }
                            
                })
            }
    })
}

module.exports={
    sendMessage
}