const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User = require("../../models/user");
const Chat = require("../../models/chat");
const Competition = require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const communicationValidator = require('../../middlewares/validation').validate_communication_credentials;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices = require('../services/userApis');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Team = require("../../models/team")
const followComp = require("../../models/compFollowOrgPlay.js");
const General = require("../../models/generalSchema.js")
const CreateTeamInCompetition = require("../../models/team.js")
var async = require("async");
var Notification=require("../../models/notification.js")

const sendMessage = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId", "playerId", "message"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
    communicationValidator(req.body.organizerId, ["mail"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
    User.find({ _id:{$in:[req.body.organizerId, req.body.senderId, req.body.playerId ]}}, (err, success) => {

        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (success==false)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
           // console.log(success)
            let obj={
                message:(`You have a new message !`),//from ${success.organizer.firstName} ${success.organizer.lastName}
                title:"YALA Sports App"

            }
            
            if (req.body.message.senderId == req.body.organizerId){
                General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: req.body.playerId }, { $push: { message: req.body.message }, $set: { playerRead: false, organizerRead: true } }, { new: true, upsert: true })
                .populate("playerId")
                .populate({path:"organizerId",
                    select:"_id firstName lastName" })
                .exec((err1, success1) => {
                   //
                   // console.log("}}}}}}}}}}}}}77}}}}}",success1)
                    if (err1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (success==false)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {  console.log("}}}}}}}}}}}}}77}}}}}",success1.playerId.email)
                       Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success1);

                       //================save notifications============== 
                       obj.message=`You have a new message from ${success1.organizerId.firstName+" "+success1.organizerId.lastName} in your YALA account`;
                        Notification.findOneAndUpdate({userId:req.body.playerId},{$push:{notification:obj}},{new:true,multi:true,upsert:true},(err,success)=>{});
                       console.log("data of player",success1.playerId.competitionNotify.email.indexOf("message"))
                        if(success1.playerId.competitionNotify.email.indexOf("message")!=-1)
                            message.sendMail(success1.playerId.email, "YALA Sports", `You have a new message from ${success1.organizerId.firstName+" "+success1.organizerId.lastName} in your YALA account`, (err, success) => {
                                if (err)
                                console.log("error in message sent!");
                                else
                                 {
                                    // console.log("array&&&&&", arr)
                                    console.log("message sent SUCCESSFULLY_DONE");
                                }
                            },success1.organizerId._id);
                       
                        //===================sent message to phone number==================
                        if(success1.playerId.competitionNotify.mobile.indexOf("message")!=-1)
                            message.sendSMS(`You have a new message from ${success1.organizerId.firstName+" "+success1.organizerId.lastName} in your YALA account`,success1.playerId.countryCode,success1.playerId.mobileNumber,(err,sent)=>{
                                if (err)
                                console.log("error in message sent!");
                                else{
                                    console.log("message sent SUCCESSFULLY_DONE");
                                }
                                
                            })
                        //==============sent push notifications=========================

                        message.sendPushNotifications(success1.playerId.deviceToken,`Hi! you have a new message from ${success1.organizerId.firstName+" "+success1.organizerId.lastName} in your YALA account.`,(err,success)=>{})
                    }

                })}
            else
               { General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: req.body.playerId }, { $push: { message: req.body.message }, $set: { organizerRead: false, playerRead: true } }, { new: true, upsert: true })
                .populate("organizerId")
                .populate({path:"playerId",
                    select:"_id firstName lastName" })
                .exec((err1, success1) => {
                   
                    if (err1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (success1==false)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {
                        //console.log("anurag")
                        Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success1);
                        obj.message=`You have a new message from ${success1.playerId.firstName+" "+success1.playerId.lastName} in your YALA account`;
                        Notification.findOneAndUpdate({userId:req.body.organizerId},{$push:{notification:obj}},{new:true,multi:true,upsert:true},(err,success)=>{});
                        console.log("}}}}}}}}}}}}}}}}}}",success1.organizerId.email)


                        //==========send mail==================
                        message.sendMail(success1.organizerId.email, `You have a new message from ${success1.playerId.firstName+" "+success1.playerId.lastName} in your YALA account`, (err,result) => {
                          //console.log(err,result)
                          if (err)
                            console.log("error in mail sent!");
                          else{
                                //console.log("array&&&&&", arr);
                                console.log("mail sent SUCCESSFULLY_DONE");
                            }
                        },success1.organizerId._id);
                        //===================sent message to phone number==================
                        message.sendSMS(`You have a new message from ${success1.playerId.firstName+" "+success1.playerId.lastName} in your YALA account`,success1.organizerId.countryCode,success1.organizerId.mobileNumber,(err,sent)=>{
                            if (err)
                            console.log("error in message sent!");
                            else{
                                console.log("message sent SUCCESSFULLY_DONE");
                            }
                            
                        })
                        //==============sent push notifications=========================
                        message.sendPushNotifications(success1.organizerId.deviceToken,`You have a new message from ${success1.playerId.firstName+" "+success1.playerId.lastName} in your YALA account`,(err,success)=>{})

                    
                    }

                })
            }
        }
    })
    
    }
})
}
}



const getMessages = (req, res) => {
    let flag = Validator(req.body, [], [], [])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    User.find({ _id: req.body.organizerId, _id: req.body.senderId, _id: req.body.playerId }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (success==false)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
            let options = {
                populate: [{
                    path: "message.senderId",
                    select: "firstName lastName image",
                    sort: { "message.createdAt": -1 }
                },
            {
                path:"organizerId",
                select: "firstName lastName image"

            },
            {
                path:"playerId",
                select: "firstName lastName image"

            }],
                page: req.body.page || 1,
                limit: req.body.limit || 10,
                //sort:{"message.createdAt":-1}
            }
            //{$or:[{organizerId:req.body.organizerId,playerId:req.body.playerId},{organizerId:req.body.organizerId},{playerId:req.body.playerId}]

            let query = {};
            if (req.body.organizerId && req.body.playerId)
                query = { organizerId: req.body.organizerId, playerId: req.body.playerId }
            else if (req.body.organizerId && !req.body.playerId)
                query = { organizerId: req.body.organizerId }
            else if (!req.body.organizerId && req.body.playerId)
                query = { playerId: req.body.playerId }

            General.chat.paginate(query, options, (err1, success1) => {
                if (err1)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                else if (success1==false)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                else {
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success1);
                }

            })
        }
    })
}

const sendMessageToAllTeam = (req, res) => {
    var mailArray = [];
    var pushArray=[];
    var mobileArray=[];
    var saveNotify=[];
    var count=0;
    let flag = Validator(req.body, [], [], ["organizerId", "message"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);

    communicationValidator(req.body.organizerId, ["mail"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            let arr = [];
            CreateTeamInCompetition.find({ organizer: req.body.organizerId }, { playerId: 1 }, { lean: true })
                .populate("playerId")
                .populate({path:"organizer",
                            select:"_id firstName lastName" })
                .exec((err, success) => {

                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (success==false)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {
                        //console.log(success)
                        let obj={
                            message:(`You have a new message !`),//from ${success.organizer.firstName} ${success.organizer.lastName}
                            title:"YALA Sports App"

                        }
                        // console.log('success')
                        
                        async.forEach(success, function(key1, callback1) {
                            
                            // console.log('succ => ', obj)
                             async.forEach(key1.playerId, function(key, callback2) {
                                
                                General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: key }, { $push: { message: req.body.message }, $set: { playerRead: false } }, { upsert: true, multi: true }, (err1, success1) => {
                                    if (err1) return console.log(err1);
                                    if ((key.competitionNotify.email.indexOf("message") !== -1) && (mailArray.indexOf(key.email)== -1)) {
                                        mailArray.push(key.email)
                                    }
                                        // console.log('new')
                                    if((key.deviceToken && pushArray.indexOf(key.deviceToken[0])== -1) && key.deviceToken[0]) {
                                        pushArray.push.apply(pushArray,key.deviceToken);// push notification array
                                        // console.log('pushArray =>' , pushArray)
                                    }
                                    
                                    if(saveNotify.indexOf(key._id)== -1)
                                        saveNotify.push(key._id);  //save notification
                                    if((key.competitionNotify.email.indexOf("message") !== -1) && mobileArray.indexOf(key.countryCode+key.mobileNumber)== -1)
                                        mobileArray.push((key.countryCode+key.mobileNumber))
                                            // mobile number array to send message
                                    // console.log('after')
                                    callback2(null, 'res');
                                    // callback1(null, 'dsa')
                                });
                                
                            }, function(err2, succ2) {
                                if(err2) console.log('err2')
                                else {
                                    // console.log('succ2 => ', pushArray)
                                    callback1(null, 'dsd')
                                }
                            }) 
                            
                        }, function(err1, succ1){
                            if(err1) console.log('error 1')
                            else {
                                console.log("task has completed", pushArray,saveNotify,mailArray);
                                message.sendMail(mailArray, "YALA Sports ✔", `Hi! you have a new message from ${success[0].organizer.firstName+" "+success[0].organizer.lastName} in your YALA account.`, (err, success) => {
                                    if (success) {
                                        
                                        console.log("message sent SUCCESSFULLY_DONE");
                                    }
                                }, req.body.organizerId);
                          
                            
                          
                             //==================send push notifications to all players=============//
                             message.sendPushNotifications(pushArray,`Hi! you have a new message from ${success[0].organizer.firstName+" "+success[0].organizer.lastName} in your YALA account.`,(err,success)=>{})
                            message.saveNotification(saveNotify,`Hi! you have a new message from ${success[0].organizer.firstName+" "+success[0].organizer.lastName} in your YALA account.`);
                                message.sendSmsToAll(mobileArray,`Hi! you have a new message from ${success[0].organizer.firstName+" "+success[0].organizer.lastName} in your YALA account.`)
                        }
                        })


                        /* async.forEach(success, (key1, callback) => {
                            
                            async.forEach(key1.playerId, (key, callback) => {
                               // Notification.findOneAndUpdate({userId:key._id},{$push:{notification:obj}},{new:true,multi:true,upsert:true},(err,success)=>{});
                                General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: key }, { $push: { message: req.body.message }, $set: { playerRead: false } }, { upsert: true, multi: true }, (err1, success1) => {
                                    if (err1) return console.log(err1);
                                    if ((key.competitionNotify.email.indexOf("message") !== -1) && (mailArray.indexOf(key.email)== -1))
                                    {
                                    mailArray.push(key.email)}
                                   
                                if((key.deviceToken && pushArray.indexOf(key.deviceToken[0])== -1) && key.deviceToken[0])
                                    pushArray.push.apply(pushArray,key.deviceToken);// push notification array
                                if(saveNotify.indexOf(key._id)== -1)
                                    saveNotify.push(key._id);  //save notification
                                if(mobileArray.indexOf(key.countryCode+key.mobileNumber)== -1)
                                    mobileArray.push((key.countryCode+key.mobileNumber)) // mobile number array to send message
                                //console.log("^^^^^^^^^^^^^success>",key.competitionNotify.email.indexOf("message"),key.email);
                                    // if (key.competitionNotify.email.indexOf("message") != -1)
                                    //     mailArray.push(key.email);
                                        
                                    // pushArray.push.apply(pushArray,key.deviceToken);
                                    // //==============push only unique fields===========
                                    // if(saveNotify.indexOf(key._id)== -1)
                                    //     saveNotify.push(key._id);
                                    
                                    // if (key.competitionNotify.mobile.indexOf("message") != -1) // push notification array
                                    //      mobileArray.push((key.countryCode+key.mobileNumber)) ;// mobile number array to send message
                                    console.log("ARRAY>>>",mailArray,mobileArray,pushArray,saveNotify)
                                    //      callback()
                                });
                            },callback())
                           count++;
                          // console.log("i am count",count,success.length);
                           if(count==success.length){
                               //console.log("DONE");
                               
                               console.log('$$$$$$$$$$$$$$$$done',success.length,mailArray,pushArray,saveNotify)
                           }
                           
                        },(err)=> {
                            console.log("iterationDone")
                            if(err)
                            console.log("i am anurag")
                            else{
                                console.log("****||||||||||||||********************")
                            }
                           
                          }) */
                    
                      
                            Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Message successfully send to all!");
                          //  console.log("Array>>>",saveNotify)
                            

                    }

                })


        }
    })
}







const sendMsgToAllPlayersOfATeam = (req, res) => {
    var mailArray = [];
    var pushArray=[];
    var mobileArray=[];
    var saveNotify=[];
   
    let flag = Validator(req.body, [], [], ["organizerId", "message","teamId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);

    communicationValidator(req.body.organizerId, ["mail"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            
            CreateTeamInCompetition.findById({ _id:req.body.teamId})
                .populate({
                            path:"playerId",
                            select:"_id competitionNotify email deviceToken countryCode mobileNumber firstName lastName"})
                .populate({path:"organizer",
                           select:"_id firstName lastName" })
                .exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (success==false)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {
                        // let obj={
                        //     message:(`you have a new message!`),
                        //     title:"YALA Sports App"

                        // }

                       // console.log(success);

                            async.forEach(success.playerId, (key, callback) => {
                                
                               // Notification.findOneAndUpdate({userId:key._id},{$push:{notification:obj}},{new:true,multi:true,upsert:true},(err,success)=>{});
                                General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: key }, { $push: { message: req.body.message }, $set: { playerRead: false } }, { upsert: true, multi: true }, (err1, success1) => {
                                    if (err1) 
                                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1)
                                   // console.log("^^^^^^^^^^^^^success>", key);
                                     if ((key.competitionNotify.email.indexOf("message") !== -1) && (mailArray.indexOf(key.email)== -1))
                                        {
                                        mailArray.push(key.email)}
                                        
                                    if((key.deviceToken && pushArray.indexOf(key.deviceToken[0])== -1) && key.deviceToken[0])
                                        pushArray.push.apply(pushArray,key.deviceToken);// push notification array
                                    if(saveNotify.indexOf(key._id)== -1)
                                        saveNotify.push(key._id);  //save notification
                                    if((key.competitionNotify.email.indexOf("message") !== -1) && mobileArray.indexOf(key.countryCode+key.mobileNumber)== -1)
                                        mobileArray.push((key.countryCode+key.mobileNumber)) // mobile number array to send message
                                    
                                    
                                    // if ( count== success.playerId.length){
                                    //     console.log("array&&&&& after success", mailArray,pushArray,saveNotify)
                                    // //console.log("TEST",count,success.playerId.length)
                                       
                                    //     //==============send email to all  players=====================//
                                    //     message.sendMail(mailArray, "YALA Sports ✔", `You have a new message from "${success.organizer.firstName} ${success.organizer.lastName}"`, (err3, success) => {
                                    //         if(err3)
                                    //         console.log(err3)
                                    //        else if (success) {
                                    //             console.log("array&&&&&", mailArray)
                                    //             console.log("message sent SUCCESSFULLY_DONE");}
                                                
                                            
                                    //     }, req.body.organizerId);

                                    //     //==================send push notifications to all players=============//
                                    //     message.sendPushNotifications(pushArray,`Hi! you have a new message from ${success.organizer.firstName} ${success.organizer.lastName}`,(err,success)=>{})
                                        
                                    //     //===================save notification of all players==================//
                                    //     message.saveNotification(saveNotify,`Hi! you have a new message from ${success.organizer.firstName} ${success.organizer.lastName}`);
                                      




                                    // }
                                      
                                    callback(null,"res");
                                });
                               
                            }, (err,result) => {
                                if (err) console.error("error",err);
                                else {
                                    console.log("Iteration done succcesfully!",pushArray,saveNotify,mailArray);
                                    message.sendMail(mailArray, "YALA Sports ✔", `You have a new message from "${success.organizer.firstName} ${success.organizer.lastName}" in your YALA account`, (err3, success) => {
                                                if(err3) console.log(err3)
                                               else if (success) {
                                                    console.log("array&&&&&", mailArray)
                                                    console.log("message sent SUCCESSFULLY_DONE");}
                                                    
                                                
                                            }, req.body.organizerId);
    
                                            //==================send push notifications to all players=============//
                                            message.sendPushNotifications(pushArray,`Hi! you have a new message from ${success.organizer.firstName} ${success.organizer.lastName} in your YALA account.`,(err,success)=>{})
                                            
                                            //===================save notification of all players==================//
                                            message.saveNotification(saveNotify,`Hi! you have a new message from ${success.organizer.firstName} ${success.organizer.lastName} in your YALA account.`);
                                            //==============send message to all==========================
                                            message.sendSmsToAll(mobileArray,`Hi! you have a new message from ${success.organizer.firstName} ${success.organizer.lastName} in your YALA account.`);
                                }

                            });
                            Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Message successfully send to all!")
                            
                        // User.find({_id:{$in:success.playerId}},{"competitionNotify":1,"email":1,"deviceToken":1,"countryCode":1,"mobileNumber":1},(err2,success2)=>{
                        //     if(err2)
                        //         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                        //     else if(!success2)
                        //         return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                        //         else{
                        //             if (success.email.indexOf("email") !== -1)
                               
                        //             arr.push(success2.email);
                        //             console.log()
                        //         }

                        // })
                            // if (key1 == success[(success.length - 1)])
                            //     return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Message successfully send to all!")
                           // console.log(arr)
                        
                      


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
            //         if (err) return console.log(err);
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








const sendMessageToAllPlayers = (req, res) => {
    var mailArray = [];
    var pushArray=[];
    var mobileArray=[];
    var firstName,lastName;
    let flag = Validator(req.body, [], [], ["organizerId", "message"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);

    communicationValidator(req.body.organizerId, ["mail"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            followComp.competitionFollow.distinct("playerId",{ organizer: req.body.organizerId, registration: true })
           
                
                .exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (success==false)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {
                        console.log("success>>>>>",success);
                        let obj={
                            message:(`you have a new message !`),
                            title:"YALA Sports App"

                        }
                    
                        async.forEach(success, (key, callback) => {
                          //  Notification.findOneAndUpdate({userId:key},{$push:{notification:obj}},{new:true,multi:true,upsert:true},(err,success)=>{});
                          //  console.log(">>>>>>>>>>>>>>>",key)
                            General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: key }, { $push: { message: req.body.message }, $set: { playerRead: false } }, { upsert: true, multi: true })
                            .populate("organizerId","_id firstName lastName")
                            .exec((err1, success1) => {
                               
                                if (err1) return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                                firstName=success1.organizerId.firstName;
                                lastName=success1.organizerId.lastName;
                                User.findOne({_id:key},(err2,success2)=>{
                                    if(success2){
                                       // 

                                    if ((success2.competitionNotify.email.indexOf("message") != -1) && (mailArray.indexOf(success2.email)== -1))
                                        {
                                        mailArray.push(success2.email)}
                                    if((success2.deviceToken && pushArray.indexOf(success2.deviceToken[0])== -1) && success2.deviceToken[0])
                                        pushArray.push.apply(pushArray,success2.deviceToken);// push notification array
                                    
                                    if((success2.competitionNotify.email.indexOf("message") !== -1) && mobileArray.indexOf(success2.countryCode+success2.mobileNumber)== -1)
                                        mobileArray.push((success2.countryCode+success2.mobileNumber))

                                        console.log("success>>>>>LAST DTA&&**&*&*&*&&*((((")
                                    // if(success2.competitionNotify.email.indexOf("message")!=-1)
                                    //     mailArray.push(success2.email);
                                    // if(success2.competitionNotify.mobile.indexOf("message"))
                                    //         mobileArray.push((success2.countryCode+success2.mobileNumber));

                                    // pushArray.push.apply(pushArray,success2.deviceToken);
                                    }
                                    callback(null,"result"); 

                                })

                                
                                // console.log("^^^^^^^^^^^^^success>", key);
                                // if (key.competitionNotify.email.indexOf("email") !== -1)
                                //     arr.push(key.email) 
                               
                                                              
                            
                            });
                        }, (err,result) => {
                            if (err) console.error(err.message);
                            else console.log("iteration done succesfully",pushArray,mailArray,mobileArray);
                          
                                  //  console.log("anurag",mailArray)
                                    

                                      message.sendMail(mailArray, "YALA Sports", `Hi! you have a new message from ${firstName} ${lastName} in your YALA account.`, (err3, success) => {
                                            if(err3)
                                            console.log(err3)
                                           else if (success) {
                                                console.log("array&&&&&", mailArray)
                                                console.log("mail sent SUCCESSFULLY_DONE");
                                             
                                            }
                                        }, req.body.organizerId);

                                        //==================send push notifications to all players=============//
                                        message.sendPushNotifications(pushArray,`Hi ! you have a new message from ${firstName} ${lastName} in your YALA account.`,(err,success)=>{})
                                        
                                        //===================save notification of all players==================//
                                        message.saveNotification(success,`Hi! you have a new message from ${firstName} ${lastName} in your YALA account.`);
                                        //================send message to all======================
                                        message.sendSmsToAll(mobileArray,`Hi! you have a new message from ${firstName} ${lastName} in your YALA account.`);
                                      

                                

                        });
                        Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Message successfully send to all!");



                    }
                })


            //return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
        }

    })

}



const getListOfMessageForPlayer = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    else {
        User.findOne({ _id: req.query.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (success==false)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_DATA_FOUND)
            else {
                let option = {
                    page: 1,
                    limit: 10,
                    sort: { createdAt: -1 },
                    populate: [
                        { path: "playerId", model: User, select: { firstName: 1, lastName: 1, image: 1 } },
                        { path: "organizerId", model: User, select: { firstName: 1, lastName: 1, image: 1 } },
                        { path: "message.senderId", model: User, select: { firstName: 1, lastName: 1, image: 1 } }
                    ],
                }
                General.chat.paginate({ playerId: req.query.userId }, option, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (success==false)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_DATA_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.MESSAGE_LIST, success)
                })
            }
        })
    }
}


const getMessage = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    if (!req.query.senderId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.SENDER_IS_REQ)
    else {
        User.findOne({ _id: req.query.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                let query = {
                    $and: [{ $or: [{ playerId: ObjectId(req.query.userId) }, { organizerId: ObjectId(req.query.userId) }] }, { $or: [{ playerId: ObjectId(req.query.senderId) }, { organizerId: ObjectId(req.query.senderId) }] }],
                }
                var aggregate = Chat.chat.aggregate([{
                    $match: query
                }, {
                    $unwind: "$message"
                }, {
                    $sort: { "message.createdAt": -1 }
                }, {
                    $lookup: {
                        from: "users",
                        localField: "message.senderId",
                        foreignField: "_id",
                        as: "senderDetail"
                    }
                }, {
                    $unwind: "$senderDetail"
                }, {
                    $project: { message: "$message", _id: 0, "senderDetail.firstName": 1, "senderDetail.lastName": 1, "senderDetail.image": 1 }
                }
                ])
                let option = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 10,
                }
                General.chat.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
                    if (!err) {
                        const success = {
                            "docs": result,
                            "total": total,
                            "limit": option.limit,
                            "page": option.page,
                            "pages": pages,
                        }
                        console.log(success)
                        if (success.docs.length)
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.MESSAGE_LIST, success)
                        else
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_DATA_FOUND)
                    }
                    else {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    }
                })
            }
        })
    }
}



module.exports = {
    sendMessage,
    getMessages,
    sendMessageToAllTeam,
    sendMessageToAllPlayers,
    getListOfMessageForPlayer,
    sendMsgToAllPlayersOfATeam
}

