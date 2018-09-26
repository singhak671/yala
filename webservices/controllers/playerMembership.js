var isBase64 = require('is-base64');
var async = require("async");
const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User = require("../../models/user");
const Competition = require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices = require('../services/userApis');
const mongoose = require('mongoose');
const Team = require("../../models/team")
const followComp = require("../../models/compFollowOrgPlay.js");
const General = require("../../models/generalSchema.js")
const ObjectId = mongoose.Types.ObjectId;
const media = require("../../global_functions/uploadMedia");
const teamServices = require('../services/teamApis');
const Membership = require("../../models/orgMembership");

const getMembership=(req,res)=>{
    let flag = Validator(req.body, [], [], ["playerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
        let query={
            status:"Confirmed",           
        };
        if(req.body.clubName)
            query.clubName=req.body.clubName;           
        if(req.body.search){
            query.$or = [
                { membershipName: { $regex: req.body.search, $options: 'i' } },
                { clubName: { $regex: req.body.search, $options: 'i' } },
                { "organizerId.firstName": { $regex: req.body.search, $options: 'i' } },
                { "organizerId.lastName": { $regex: req.body.search, $options: 'i' } }
            ]
        }
        console.log("i am query to get list of membership list by PLAYER",query);
        var aggregate=Membership.membershipSchema.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "organizerId",
                    foreignField: "_id",
                    as: "organizerId"
                }
            },
            // {
            //     $unwind: "$organizer"
            // },

            // { '$sort': { 'createdAt': -1 } },

            // {
            //     $match: query
            // }
                            {
                                "$match": query
                            },
                            {
                                "$unwind": {
                                    path:'$playerFollowStatus',
                                    "preserveNullAndEmptyArrays": true      
                            }},
                            // {
                            //     "$match": {$or:[{'playerFollowStatus.playerId':req.body.playerId}]}
                            // },
                                 
                            {
                                "$project": {
                                    _id: 1,
                                    playerFollowStatus: {
                                        $cond: {
                                            if: {
                                                $eq: ['$playerFollowStatus.playerId', ObjectId(req.body.playerId)]
                                            },
                                            then: "$playerFollowStatus",
                                            else: "NOT FOLLOWED",
                                        }
                                    },
                                    membershipName:1,
                                    clubName:1,
                                    clubId:1,
                                    updatedAt:1,
                                    createdAt:1,
                                    imageURL:1,
                                    allowPublicToFollow:1,
                                   
                                    "organizerId._id":1,
                                    "organizerId.firstName":1,
                                    "organizerId.lastName":1,

                                    status:1
                                }
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    // "membershipName": { "$first": "$membershipName" },
                                    // // period:"$period",
                                    "clubName": { "$first": "$clubName" },
                                    "clubId": { "$first": "$clubId" },
                                    // "published": { "$first": "$published" },
                                    
                                    // "competitionName": { "$first": "$competitionName" },
                                    "updatedAt": { "$first": "$updatedAt" },
                                    "createdAt": { "$first": "$createdAt" },
                                    "membershipName":{"$first":"$membershipName"},
                                    
                                    "imageURL": { "$first": "$imageURL" },
                                    "allowPublicToFollow": { "$first": "$allowPublicToFollow" },
                                    "organizerId":{"$first":"$organizerId"},
                                    "status":{"$first":"$status"},
                                     "playerFollowStatus": {"$max":"$playerFollowStatus"},
                                    
            
                                }
                            },
                           
                            // {
                            //     "$project": {
                            //         _id: 1,
                            //         playerFollowStatus: {
                            //             $cond: {
                            //                 if: {
                            //                     $eq: ['$playerFollowStatus',"NOT FOLLOWED"]
                            //                 },
                            //                 then: "$playerFollowStatus",
                            //                 else: "NOT FOLLOWED",
                            //             }
                            //         },
                            //     }
                            // }
                            // {
                            //     "$unwind": {
                            //         path:'$playerFollowStatus',
                            //         preserveNullAndEmptyArrays:false     
                            // }},
                            // {
                            //     "$match": {"playerFollowStatus":{ $type : 3 }}  // type:3 for object. 2 for string
                            // }
                            
                            // {$match:{"playerFollowStatus.playerId":req.body.playerId}}
                        ])
                
                        
        let option = {
            limit: req.body.limit || 10,
            page: req.body.page || 1,
            sortBy:{createdAt:1},
            
        }
        Membership.membershipSchema.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
           // console.log("&&&&&&&&&&&>>",err,result);
            const success = {
                    "docs": result,
                    "total": total,
                    "limit": option.limit,
                    "page": option.page,
                    "pages": pages,
                }
                if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                else if(!result)
                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
                    else
                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
                
        })
                        
    }
        
}

const getClubList=(req,res)=>{
    let flag = Validator(req.body, [], [], [])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
        Membership.membershipSchema.distinct("clubName",(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            else if(!success)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
                else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
            
        })
    }

}


const followMembership = (req, res) => {
    console.log(req.body)
    let flag = Validator(req.body, [], [], ["playerId", "membershipId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        User.findOne({ _id: req.body.playerId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "User not found");
            else {
                let firstName = success.firstName;
                let lastName = success.lastName;
                Membership.membershipSchema.findById(req.body.membershipId).lean().exec((err1, success1) => {

                    if (err1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                    else if (!success1)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, "Membership not found !");
                    else {
                        let membershipName = success1.membershipName;

                        var obj = {
                            playerId: (req.body.playerId).toString(),
                        }

                        if (success1.allowPublicToFollow) {
                            obj.followStatus = "APPROVED";
                            req.body.followStatus = "APPROVED";
                        }
                        else
                            obj.followStatus = "PENDING";

                        console.log("objecvt>>>>>>>>", obj);
                        
                        
                      
                                // Competition.competition.findByIdAndUpdate(req.body.competitionId, { $push: { playerFollowStatus: obj } }, { new: true }, (error, result5) => {
                                Membership.membershipSchema.findOneAndUpdate({ _id: req.body.membershipId }, { $addToSet: { playerFollowStatus: obj } }, { new: true, upsert: true })
                                    .populate("organizerId", " _id competitionNotify email deviceToken countryCode mobileNumber firstName lastName organizerNotification")
                                    .exec((error, result5) => {
                                        if (error || !result5)
                                            return Response.sendResponse(res, responseCode.BAD_REQUEST, "Player has already followed the competition", error);
                                        else{
                                            if(obj.followStatus=="PENDING")
                                             Response.sendResponse(res, responseCode.EVERYTHING_IS_OK,"Request sent successfully", result5);
                                            if(obj.followStatus=="APPROVED")
                                            Response.sendResponse(res, responseCode.EVERYTHING_IS_OK,"Competition followed successfully", result5);
                                        }
                                           
                                        // User.findOne({ _id: success2.organizer },(err, success) => {
                                        //  console.log("successssssss------>>>>>.", success2.organizer);

                                        // console.log(success.deviceToken)
                                        //===================
                                        if (result5.organizerId.organizerNotification)
                                            if ((result5.organizerId.organizerNotification).indexOf("registration") != -1) {
                                                message.sendSMS(firstName + " " + lastName + " has followed your membership i.e, " + membershipName, result5.organizerId.countryCode, result5.organizerId.mobileNumber, (error, result) => {
                                                    if (err)
                                                        console.log("error in sending SMS")
                                                    else if (result)
                                                        console.log("SMS sent successfully to the organizer!")
                                                })

                                                message.sendMail(result5.organizerId.email, "Yala Sports App ✔", firstName + " " + lastName + " has followed your membership i.e, " + membershipName, (err, result) => {
                                                    console.log("send1--->>", result1)
                                                })
                                            }
                                        message.sendPushNotifications(result5.organizerId.deviceToken, firstName + " " + lastName + " has followed your membership " + membershipName)
                                        message.saveNotification([result5.organizerId._id], firstName + " " + lastName + " has followed your membership " + membershipName)
                                        //})
                                    })
                         
                    }
                })
            }
        })
}

const unFollowMembership = (req, res) => {
    let flag = Validator(req.query, [], [], ["playerId", "membershipId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        Membership.membershipSchema.findOneAndUpdate({ _id: req.query.membershipId, "playerFollowStatus.playerId": req.query.playerId }, { $pull: { playerFollowStatus: { playerId: req.query.playerId } } }, { safe: true, new: true }).lean().exec((err1, success1) => {
            if (err1)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
            else if (!success1)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Membership not found.");
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK,"You have unfollowed the membership successfully.", success1);            
            }
        })        
}
module.exports={
    getMembership,
    getClubList,
    followMembership,
    unFollowMembership

}