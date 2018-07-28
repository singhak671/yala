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
   // console.log("i am nody]]]]]]]]]]]]]]]]][[[[[[[[[[[[[[[[[[")
   console.log("i am body>>>>>>",req.body)
   let flag =Validator(req.body,[],[],[])
   if(flag)
       return Response.sendResponse(res,flag[0],flag[1]);       
   else
   {   let obj={};
       if(req.body.filterFields){
           let array=["sports","status","followStatus"];
           for (let key of array){
                   for(let data in req.body.filterFields){
                       if(key==data && req.body.filterFields[data])
                       obj[key]=req.body.filterFields[key];
                   }
           }
       }
       console.log("i am object>>>>>>",obj)
       let query={
        page:req.body.page || 1,
        limit : req.body.limit ||4}
       if(obj.followStatus){

       console.log("i am object>2",obj);
       if(obj.followStatus && !obj.status && !obj.sports)
       {
           followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err,success)=>{
               if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
               else if(!success)
                       return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                   else
                   {
                       return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
                   }


           })
       }
       else
           if(obj.followStatus && obj.status && !obj.sports){
               followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err1,success1)=>{
                   if(err1)
                       return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                   else if(!success1)
                           return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                       else
                       {   
                           let arr=[];                            
                           for(let data of success1){
                              // console.log(data.competitionId);
                               for(let key1 in data.competitionId){
                                 
                                   if(key1=="status" && data.competitionId.status==obj.status)
                                   arr.push(data.competitionId);
                               }
                           }                            
                           return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,arr);
                       }   
               })
           }
           else if(obj.followStatus && obj.status && obj.sports){
               console.log("333333333",obj);
               followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err2,success2)=>{
                   if(err2)
                       return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
                   else if(!success2)
                           return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                       else
                       {   
                           let arr1=[];
                           for(let data of success2){
                               for(let key in data.competitionId){
                                   if(key=="status" && data.competitionId.status==obj.status && data.competitionId.sports==obj.sports)
                                   arr1.push(data.competitionId)
                               }
                           }                            
                           return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,arr1);
                       }   
               })
           }

           else if(obj.followStatus && !obj.status && obj.sports){
            console.log("44444444",obj);
               followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err2,success2)=>{
                   if(err2)
                       return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
                   else if(!success2)
                           return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                       else
                       {   
                           let arr1=[];
                           for(let data of success2){
                               for(let key in data.competitionId){
                                   if(key=="sports" && data.competitionId.sports==obj.sports)
                                   arr1.push(data.competitionId)
                               }
                           }
                           
                           function paginate (array, page_size, page_number) {
                            --page_number; // because pages logically start with 1, but technically with 0
                            return array.slice(page_number * page_size, (page_number + 1) * page_size);
                          }
                          let arr2=[];
                          //console.log(paginate([1, 2, 3, 4, 5, 6], 2, 2));
                          console.log(query)
                          arr2=paginate(arr1, query.limit, query.page);
                          console.log(arr2)
                          arr2.populate("organizer").exec((err,reqq)=>{
                              console.log(reqq)
                          })







                           return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,arr2);
                       }   
               })
           }
       }
else{
       let query={
           page:req.body.page || 1,
           limit : req.body.limit ||4,
           lean:true,
           populate:{path:"organizer",select:"firstName lastName"}};
           Competition.competition.aggregate([
            {
                "$match": 
                    {}
            },
            {
                "$unwind": "$playerFollowStatus"
            },
            
            {
                "$project": {
                    _id : 1,
                    sports:1,
                   playerFollowStatus: {$eq:["$playerFollowStatus.playerId",req.body.userId]}
                }
            },
            {$group: {
                _id: '$_id',
                
                'playerFollowStatus': {$max: '$playerFollowStatus'},
               
            }},
            // project again to remove _id
            {$project: {
                _id: 0,
                
                'playerFollowStatus': '$playerFollowStatus',
                
            }}
        ]

        
        ,(err,result)=>{
            















    //    Competition.competition.find({"playerFollowStatus.playerId":req.body.userId},(err,result)=>{
    //    if (err)
    //        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
    //    else if(!result)
    //        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
    //    else{
           //let newResult=result;
        //    for( let data of result.docs){
        //        if(data.playerFollowStatus)
        //     for (let data1 of data.playerFollowStatus){
        //         if(data1.playerId==req.body.userId)
        //             {
        //                 data.playerStatus=data1;
        //                 delete data["playerFollowStatus"];
        //             }
                     
        //              else
        //              {
        //                  data.player=null;
        //             delete data["playerFollowStatus"];
        //         }
        //    }}
       
          
       return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,result,err);
       })   
   }
   }
}

const followCompetition=(req,res)=>{
    console.log(req.body)
    let flag =Validator(req.body,[],[],["userId","competitionId"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);       
    else
        User.findOne({_id:req.body.userId,role:"PLAYER"},(err,success)=>{
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

                                var obj={
                                    playerId:req.body.userId,
                                }


                                if(success1.allowPublicToFollow){
                                    obj.followStatus="APPROVED";
                                    req.body.followStatus="APPROVED";}
                                    else
                                    obj.followStatus="PENDING";

                                 console.log("objecvt>>>>>>>>",obj);
                                req.body.playerId=req.body.userId;
                                req.body.organizer=success1.organizer;
                                let data= new followComp.competitionFollow(req.body);
                                data.save((err2,success2)=>{
                                    if(err2 ||!success2)
                                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
                                    else{
                                        Competition.competition.findByIdAndUpdate(req.body.competitionId,{$push:{playerFollowStatus:obj}},{new:true},(error,result5)=>{
                                            if(error || !result5)
                                                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
                                            else
                                                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success2);
                                        })
                                    }
                                     
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
