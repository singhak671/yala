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
            status:"confirmed",           
        };
        if(req.body.status)
        if(req.body.search){
            query.$or = [
                { membershipName: { $regex: search, $options: 'i' } },
                { clubName: { $regex: search, $options: 'i' } },
                { "organizerId.firstName": { $regex: search, $options: 'i' } },
                { "organizerId.lastName": { $regex: search, $options: 'i' } }
            ]
        }
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
                                                $eq: ['$playerFollowStatus.playerId', req.body.playerId]
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
                                    
                                    "imageURL": { "$first": "$imageURL" },
                                    "allowPublicToFollow": { "$first": "$allowPublicToFollow" },
                                    "organizerId":{"$first":"$organizerId"},
                                    "status":{"$first":"$status"},
                                     "playerFollowStatus": {"$addToSet":"$playerFollowStatus"},
                                    
            
                                }
                            },
                            // {$match:{"playerFollowStatus.playerId":req.body.playerId}}
                        ])
                        
        let option = {
            limit: req.body.limit || 10,
            page: req.body.page || 1,
            sortBy:{createdAt:1},
            
        }
        Membership.membershipSchema.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
            console.log("&&&&&&&&&&&>>",err,result);
            const success = {
                    "docs": result,
                    "total": total,
                    "limit": option.limit,
                    "page": option.page,
                    "pages": pages,
                }
                res.send({success})
        })
                        
    }
        
}
module.exports={
    getMembership

}