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

const sendMessage = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId", "playerId", "message"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    User.find({ _id: req.body.organizerId, _id: req.body.senderId, _id: req.body.playerId }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
            if (req.body.message.senderId == req.body.organizerId)
                General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: req.body.playerId }, { $push: { message: req.body.message }, $set: { playerRead: false, organizerRead: true } }, { new: true, upsert: true }, (err1, success1) => {
                    if (err1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success1);
                    }

                })
            else
                General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: req.body.playerId }, { $push: { message: req.body.message }, $set: { organizerRead: false, playerRead: true } }, { new: true, upsert: true }, (err1, success1) => {
                    if (err1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success1);
                    }

                })

        }
    })
}



const getMessages = (req, res) => {
    let flag = Validator(req.body, [], [], [])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    User.find({ _id: req.body.organizerId, _id: req.body.senderId, _id: req.body.playerId }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (!success)
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
                else if (!success1)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                else {
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success1);
                }

            })
        }
    })
}

const sendMessageToAll = (req, res) => {
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
                .exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {

                        //res.send(success);
                        async.forEach(success, (key1, callback) => {
                            async.forEach(key1.playerId, (key, callback) => {
                                General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: key }, { $push: { message: req.body.message }, $set: { playerRead: false } }, { upsert: true, multi: true }, (err1, success1) => {
                                    if (err1) return res.send(err1);
                                    console.log("^^^^^^^^^^^^^success>", key);
                                    if (key.competitionNotify.email.indexOf("email") !== -1)
                                        arr.push(key.email)

                                });
                            }, (err) => {
                                if (err) console.error(err.message);

                            });
                            if (key1 == success[(success.length - 1)])
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Message successfully send to all!", arr)
                            console.log(arr)
                        })
                        message.sendMail(["anuragcoolm@gmail.com"], "DON", "I am anurag", (err, success) => {
                            if (success) {
                                console.log("array&&&&&", arr)
                                console.log("message sent SUCCESSFULLY_DONE");
                            }
                        }, req.body.organizerId);


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

const sendMessageToAllPlayers = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId", "message"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);

    communicationValidator(req.body.organizerId, ["mail"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            followComp.competitionFollow.find({ organizer: req.body.organizerId, registration: true })
                .populate("playerId")
                .exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else {
                        async.forEach(success, (key, callback) => {
                            console.log(">>>>>>>>>>>>>>>",key.playerId._id)
                            General.chat.findOneAndUpdate({ organizerId: req.body.organizerId, playerId: key.playerId._id }, { $push: { message: req.body.message }, $set: { playerRead: false } }, { upsert: true, multi: true }, (err1, success1) => {
                                if (err1) return res.send(err1);
                                // console.log("^^^^^^^^^^^^^success>", key);
                                // if (key.competitionNotify.email.indexOf("email") !== -1)
                                //     arr.push(key.email)
                                if(success.indexOf(key)==(success.length-1))
                                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Message successfully send to all!")

                                

                            });
                        }, (err) => {
                            if (err) console.error(err.message);

                        });



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
            else if (!success)
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
                    else if (!success)
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
    sendMessageToAll,
    sendMessageToAllPlayers,
    getListOfMessageForPlayer
}

