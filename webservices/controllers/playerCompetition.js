const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const followComp=require("../../models/compFollowOrgPlay.js");
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
    
    // let flag =Validator(req.body,[],[],[])
	// if(flag)
    //     return Response.sendResponse(res,flag[0],flag[1]);       
    // else
    // {   let obj={};
    //     if(req.body.filterFields){
    //         let array=["sports","status","followStatus"];
    //         for (let key of array){
    //                 for(let data in req.body.filterFields){
    //                     if(key==data && req.body.filterFields[data])
    //                     obj[key]=req.body.filterFields[key];
    //                 }
    //         }
    //     }
    //     console.log("i am object>>>>",obj);
    //     if(obj.followStatus && !obj.status && !obj.sports)
    //     {
    //         followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err,success)=>{
    //             if(err)
    //                 return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
    //             else if(!success)
    //                     return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
    //                 else
    //                 {
    //                     return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
    //                 }


    //         })
    //     }
    //     else
    //         if(obj.followStatus && obj.status && !obj.sports){
    //             followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err1,success1)=>{
    //                 if(err1)
    //                     return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
    //                 else if(!success1)
    //                         return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
    //                     else
    //                     {   let arr=[];
    //                         for(let data of success1){
    //                             for(let key in success1[data].competitionId){}
    //                         }
    //                         for(let key in success1.competitionId){
    //                         if(key=="sports")
    //                         return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success1);
    //                     }
    
    
    //             })
    //         }
    //     Competition.competition.find(obj,(err,result)=>{
    //     if (err)
    //         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
    //     else if(!result)
    //         return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
    //     else
    //     return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,result);
    //     })   
    // }
}

const followCompetition=(req,res)=>{
    let flag =Validator(req.body,[],[],["userId","competitionId"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);       
    else
        User.findOne({_id:req.body.userId,role:"ORGANIZER"},(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            else if(!success)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
                else
                    Competition.competition.findById(req.body.competitionId).lean().exec((err1,success1)=>{
                        if(err1)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                        else if(!success1)
                                return Response.sendResponse(res,responseCode.NOT_FOUND,"Competition not found !");
                            else{
                                if(success1.allowPublicToFollow)
                                    req.body.followStatus="APPROVED";
                                req.body.playerId=req.body.userId;
                                req.body.organizer=success1.organizer;
                                let data= new followComp.competitionFollow(req.body);
                                data.save((err2,success2)=>{
                                    if(err2 ||!success2)
                                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
                                    else
                                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success2,success1);
                                })
                            }
                    })
        })
}
module.exports={
    getAllCompetitions,
    filterCompetitions,
    followCompetition
}
