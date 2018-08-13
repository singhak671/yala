const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const Chat=require("../../models/chat");
const  Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const communicationValidator = require('../../middlewares/validation').validate_communication_credentials;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Team=require("../../models/team")
const followComp=require("../../models/compFollowOrgPlay.js");
const General=require("../../models/generalSchema.js")
const CreateTeamInCompetition=require("../../models/team.js")
var async = require("async");

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
                if(req.body.message.senderId==req.body.organizerId)
                General.chat.findOneAndUpdate({organizerId:req.body.organizerId,playerId:req.body.playerId},{$push:{message:req.body.message},$set:{playerRead:false,organizerRead:true}},{new:true,upsert:true},(err1,success1)=>{
                    if (err1)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                    else if(!success)
                            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                        else{
                            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success1);
                        }
                            
                })
                else
                General.chat.findOneAndUpdate({organizerId:req.body.organizerId,playerId:req.body.playerId},{$push:{message:req.body.message},$set:{organizerRead:false,playerRead:true}},{new:true,upsert:true},(err1,success1)=>{
                    if (err1)
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



const getMessages=(req,res)=>{
    let flag =Validator(req.body,[],[],[])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    User.find({_id:req.body.organizerId,_id:req.body.senderId,_id:req.body.playerId},(err,success)=>{
        if (err)
             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
         else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else{
                let options={
                    populate:[{
                        path:"message.senderId",
                        select:"firstName lastName image",
                        sort:{"message.createdAt":-1}
                    }],
                    page:req.body.page ||1,
                    limit:req.body.limit ||10,
                    //sort:{"message.createdAt":-1}
                }
                //{$or:[{organizerId:req.body.organizerId,playerId:req.body.playerId},{organizerId:req.body.organizerId},{playerId:req.body.playerId}]

                let query={};
                if(req.body.organizerId && req.body.playerId)
                    query={organizerId:req.body.organizerId,playerId:req.body.playerId}
                else if(req.body.organizerId && !req.body.playerId)
                    query={organizerId:req.body.organizerId}
                else if(!req.body.organizerId && req.body.playerId)
                    query={playerId:req.body.playerId} 
                
                General.chat.paginate(query,options,(err1,success1)=>{
                    if (err1)
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

const sendMessageToAll=(req,res)=>{
    let flag =Validator(req.body,[],[],["organizerId","message"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    
        communicationValidator(req.body.organizerId,["mail"],(err,flag)=>{
            if(flag[0]!==200)
            return Response.sendResponse(res,flag[0],flag[1],flag[2]);
       else{
    CreateTeamInCompetition.find({organizer:req.body.organizerId},{playerId:1},{lean:true})
    .populate("playerId")
    .exec((err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else{
               res.send(success);
                async.forEach(success,(key1,callback)=>{                
                async.forEach(key1.playerId, (key,callback) => {
                    General.chat.findOneAndUpdate ({organizerId:req.body.organizerId,playerId:key},{$push:{message:req.body.message},$set:{playerRead:false}},{upsert:true,multi:true}, (err, success) => {
                    if (err) return res.send(err);
           
                       
                    });  
                }, (err) => {
                    if (err) console.error(err.message);
                
                });
                if(key1==success[(success.length-1)])
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Message successfully send to all!")
            })
            message.sendMail(["anuragcoolm@gmail.com"],"DON","I am anurag",(err,success)=>{
                if(success)
                console.log("message sent SUCCESSFULLY_DONE");
            },req.body.organizerId);
                
            }

    })



    // let data=[{playerId:'5b6d2d18ae9a5547795b2b71'},{playerId:'5b6d24c5de2cb346cfa9b939'},{playerId:"5b473f699a937b9f01ccc2bc"}];
    //let data=['5b6d2d18ae9a5547795b2b71','5b6d24c5de2cb346cfa9b939',"5b473f699a937b9f01ccc2bc","5b6d2d18ae9a5547795b2b72"];


    // data.forEach(function(obj) {
    //     General.chat.update({organizerId:req.body.organizerId,playerId: obj.playerId},{$push:{message:req.body.message}},{upsert:true,multi:true},(err,success) =>{
    //         if (err)
    //             console.log(err);//return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
    //         else if(!success)
    //             console.log("not success");//return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
    //             else{
    //                 console.log(success);
    //             }
    //     });
    // });
//     async.forEach(data, (key,callback) => {
//         General.chat.findOneAndUpdate ({organizerId:req.body.organizerId,playerId:key},{$push:{message:req.body.message}},{upsert:true,multi:true}, (err, success) => {
//         if (err) return res.send(err);
//         if(key==data[(data.length-1)])
//         return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Message successfully send to all!")
           
//         });  
// }, (err) => {
//     if (err) console.error(err.message);

// });
    


    // General.chat.findAndModify ({organizerId:req.body.organizerId,playerId:{$in:data}},{$push:{message:req.body.message}},{upsert:true,multi:true},(err,success1)=>{
    //     if (err)
    //         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
    //     else if(!success1)
    //             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
    //         else{
    //             return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success1);
    //         }
                
    // })
}
})
}

module.exports={
    sendMessage,
    getMessages,
    sendMessageToAll
}

