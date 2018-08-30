const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User = require("../../models/user");
const followComp = require("../../models/compFollowOrgPlay.js");
const Competition = require("../../models/competition");
const Follow = require("../../models/compFollowOrgPlay");
var Twocheckout = require('2checkout-node');
const teamServices = require('../services/teamApis');
const TransactionSchema = require("../../models/transactions");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices = require('../services/userApis');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var aggregate = Competition.competition.aggregate();
const General = require("../../models/generalSchema.js")

const getAllCompetitions = (req, res) => {
    let flag = Validator(req.body, [], [], ["userId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.find({ published: true }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        else if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success)
        }
    })
}


const filterCompetitions = (req, res) => {
    // console.log("i am nody]]]]]]]]]]]]]]]]][[[[[[[[[[[[[[[[[[")
    console.log("i am body>>>>>>", req.body)
    let flag = Validator(req.body, [], [], [])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        let obj = {};
        if (req.body.filterFields) {
            console.log("xxxxxxxxx--->>>", req.body.filterFields)
            let array = ["sports", "status", "followStatus"];
            for (let key of array) {
                for (let data in req.body.filterFields) {
                    if (key == data && req.body.filterFields[data])
                        obj[key] = req.body.filterFields[key];
                    console.log(obj[key])
                }
            }
        }
        console.log("i am object>>>>>>", obj)
        let query = {
            page: req.body.page || 1,
            limit: req.body.limit || 4,
            // lean:true,
            // populate:{path:"competitionId",model:"competitions",match:{"status":obj.status}}
        }
        if (obj.followStatus) {
            console.log("11111111111111111111");
            let query2;
            if (obj.followStatus && !obj.sports && !obj.status)
                query2 = {};
            else if (obj.sports && !obj.status) {
                query2 = { sports: { $in: obj.sports }, published: true }
                console.log("111query>>>>>>>>>>>", query2);
            }
            else if (obj.status && obj.sports) {
                query2 = { $and: [{ sports: { $in: obj.sports } }, { status: obj.status }, { published: true }] }
                console.log("222query>>>>>", query2)
            }
            else if (obj.status && !obj.sports) {
                query2 = { status: obj.status, published: true };
                console.log("222query>>>>>", query2)
            }
            if (req.body.filterFields)
                if (req.body.filterFields.search) {
                    query2.$or = [
                        { competitionName: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { period: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { sports: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { status: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { venue: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { division: { $regex: req.body.filterFields.search, $options: 'i' } }
                    ]
                }
            let option = {
                populate: [{
                    path: "competitionId",
                    select: "competitionName _id createdAt organizer division period sports status published venue imageURL sportType published registrationForm",

                    match: query2
                },
                {
                    path: 'organizer',

                    select: "firstName lastName"
                }],
                sort: { createdAt: -1 },
                lean: false
            };

            console.log("i am final object with FOLLOW STATUS", query2)
            followComp.competitionFollow.paginate({ playerId: req.body.userId, followStatus: obj.followStatus }, option, (err, success) => {

                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);

                else {
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
                }
            })














            // followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate(
            //     // here array is for our memory. 
            //     // because may need to populate multiple things
            //     {
            //         path: 'competitionId',              
            //     select:"competitionName _id createdAt organizer division period sports status venue",

            //     match:query2
            //     }
            // ).
            // populate({
            //     path: 'organizer',

            // select:"firstName lastName"}).
            // sort({createdAt:-1}).
            //     skip((query.page-1)*query.limit).
            //     limit(query.limit).
            // lean().
            // exec((err,result)=>{
            //     if(err)
            //         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            //     else if(!result)
            //             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);

            //             else
            //                             {
            //                                 return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,result,query);
            //                             }
            // })
            //    console.log("i am object>2",obj);
            //    if(obj.followStatus && !obj.status && !obj.sports)
            //    {
            //        followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err,success)=>{
            //            if(err)
            //                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            //            else if(!success)
            //                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            //                else
            //                {
            //                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
            //                }


            //        })
            //    }
            //    else
            //        if(obj.followStatus && obj.status && !obj.sports){
            //            followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err1,success1)=>{
            //                if(err1)
            //                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
            //                else if(!success1)
            //                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            //                    else
            //                    {   
            //                        let arr=[];                            
            //                        for(let data of success1){
            //                           // console.log(data.competitionId);
            //                            for(let key1 in data.competitionId){

            //                                if(key1=="status" && data.competitionId.status==obj.status)
            //                                arr.push(data.competitionId);
            //                            }
            //                        }                            
            //                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,arr);
            //                    }   
            //            })
            //        }
            //        else if(obj.followStatus && obj.status && obj.sports){
            //            console.log("333333333",obj);
            //            followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err2,success2)=>{
            //                if(err2)
            //                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
            //                else if(!success2)
            //                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            //                    else
            //                    {   
            //                        let arr1=[];
            //                        for(let data of success2){
            //                            for(let key in data.competitionId){
            //                                if(key=="status" && data.competitionId.status==obj.status && data.competitionId.sports==obj.sports)
            //                                arr1.push(data.competitionId)
            //                            }
            //                        }                            
            //                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,arr1);
            //                    }   
            //            })
            //        }

            //        else if(obj.followStatus && !obj.status && obj.sports){
            //         console.log("44444444",obj);
            //            followComp.competitionFollow.find({playerId:req.body.userId,followStatus:obj.followStatus}).populate("competitionId").exec((err2,success2)=>{
            //                if(err2)
            //                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
            //                else if(!success2)
            //                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            //                    else
            //                    {   
            //                        let arr1=[];
            //                        for(let data of success2){
            //                            for(let key in data.competitionId){
            //                                if(key=="sports" && data.competitionId.sports==obj.sports)
            //                                arr1.push(data.competitionId)
            //                            }
            //                        }

            //                        function paginate (array, page_size, page_number) {
            //                         --page_number; // because pages logically start with 1, but technically with 0
            //                         return array.slice(page_number * page_size, (page_number + 1) * page_size);
            //                       }
            //                       let arr2=[];
            //                       //console.log(paginate([1, 2, 3, 4, 5, 6], 2, 2));
            //                       console.log(query)
            //                       arr2=paginate(arr1, query.limit, query.page);
            //                       console.log(arr2)
            //                       arr2.populate("organizer").exec((err,reqq)=>{
            //                           console.log(reqq)
            //                       })







            //                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,arr2);
            //                    }   
            //            })
            //        }
        }
        else {
            //    let query={
            //        page:req.body.page || 1,
            //        limit : req.body.limit ||4,
            //        lean:true,
            //        populate:{path:"organizer",select:"firstName lastName"}};
            // console.log("i am 1st obj", obj);
            obj.published = true;

            let query1;
            if (!obj.sports && !obj.status)
                query1 = obj;
            else if (obj.sports && !obj.status) {
                query1 = { sports: { $in: obj.sports }, published: true }
                console.log("111query>>>>>>>>>>>", query1);
            }
            else if (obj.status && obj.sports) {
                query1 = { $and: [{ sports: { $in: obj.sports } }, { status: obj.status }, { published: true }] };

                console.log("22 query>>>>>", query1)
            }
            else if (obj.status && !obj.sports) {
                query1 = obj;
                console.log("33 query>>>>>", query1)
            }

            //condition for searching 
            if (req.body.filterFields)
                if (req.body.filterFields.search) {
                    query1.$or = [
                        { competitionName: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { period: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { sports: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { status: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { venue: { $regex: req.body.filterFields.search, $options: 'i' } },
                        { division: { $regex: req.body.filterFields.search, $options: 'i' } }
                    ]
                }
            console.log("i am NEW FINAL obj", query1);

            // aggregate
            //     .match(query1)
            //     .unwind({
            //         path: '$playerFollowStatus',
            //         preserveNullAndEmptyArrays: true,
            //     }
            //     )
            // .group({
            //                 _id: "$_id",
            //                 "period": { "$first": "$period" },
            //                 // period:"$period",
            //                 "status": { "$first": "$status" },
            //                 "sports": { "$first": "$sports" },
            //                 "published": { "$first": "$published" },
            //                 "venue": { "$first": "$venue" },
            //                 "division": { "$first": "$division" },
            //                 "competitionName": { "$first": "$competitionName" },
            //                 "organizer": { "$first": "$organizer" },
            //                 "createdAt": { "$first": "$createdAt" },
            //                 "registrationForm":{"$first":"$registrationForm"},
            //                 "imageURL": { "$first": "$imageURL" },
            //                 "sportType": { "$first": "$sportType" },
            //                 "playerFollowStatus": {"$first": "$playerFollowStatus"},

            //         })

            // aggregate.lookup({
            //             from:"users",
            //             localField:"organizer",
            //             foreignField:"_id",
            //             as:"organizer"
            //         }).unwind({       path: '$playerFollowStatus',
            //         preserveNullAndEmptyArrays: true,
            //    })
            //     aggregate.project(
            //         {
            //                         _id: 1,
            //                         playerFollowStatus: {
            //                             $cond: {
            //                                 if: {
            //                                     $eq: ['$playerFollowStatus.playerId', req.body.userId]
            //                                 },
            //                                 then: "$playerFollowStatus",
            //                                 else: "NOT FOLLOWED",
            //                             }
            //                         },
            //                         division: 1,
            //                         period: 1,
            //                         sports: 1,
            //                         status: 1,
            //                         venue: 1,
            //                         sportType: 1,
            //                         published:1,
            //                         competitionName: 1,
            //                         organizer: 1,
            //                         createdAt: 1,
            //                         registrationForm:1,
            //                         imageURL: 1
            //                     }
            //     )
            aggregate = Competition.competition.aggregate([
                {
                    $match: query1
                },
                {
                    $unwind: {
                        path: '$playerFollowStatus',
                        preserveNullAndEmptyArrays: true,
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "organizer",
                        foreignField: "_id",
                        as: "organizer"
                    }
                },{
                   $unwind:"$organizer"
                } ,{
                    $project: {
                        _id: 1,
                        playerFollowStatus: {
                            $cond: {
                                if: {
                                    $eq: ['$playerFollowStatus.playerId', req.body.userId]
                                },
                                then: "$playerFollowStatus",
                                else: "NOT FOLLOWED",
                            }
                        },
                        division: 1,
                        period: 1,
                        sports: 1,
                        status: 1,
                        venue: 1,
                        sportType: 1,
                        published: 1,
                        competitionName: 1,
                        organizer: 1,
                        createdAt: 1,
                        registrationForm: 1,
                        imageURL: 1
                    }
                }])
            var option = { page: query.page, limit: query.limit }

            // Competition.competition.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
            //     if(err) 
            //     {
            //      return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            //     }
            //     else
            //     { console.log("pageCount",pageCount);
            //     console.log("count",count);
            //       res.send(results)
            //     }
            //   })


            Competition.competition.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
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
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_COMPETITION, success)
                    else
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.COMPETITION_NOT_FOUND)
                }
                else {
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                }
            })


            // Competition.competition.aggregate([
            //     {
            //         "$match": query1
            //     },
            //     {
            //         "$unwind": {
            //             path: '$playerFollowStatus',
            //             preserveNullAndEmptyArrays: true,
            //         }
            //     },
            //     {
            //         $group: {
            //             _id: "$_id",
            //             "period": { "$first": "$period" },
            //             // period:"$period",
            //             "status": { "$first": "$status" },
            //             "sports": { "$first": "$sports" },
            //             "published": { "$first": "$published" },
            //             "venue": { "$first": "$venue" },
            //             "division": { "$first": "$division" },
            //             "competitionName": { "$first": "$competitionName" },
            //             "organizer": { "$first": "$organizer" },
            //             "createdAt": { "$first": "$createdAt" },
            //             "registrationForm":{"$first":"$registrationForm"},
            //             "imageURL": { "$first": "$imageURL" },
            //             "sportType": { "$first": "$sportType" },
            //             "playerFollowStatus": {"$first": "$playerFollowStatus"},

            //         }
            //     },


            //     // {
            //     //     "$project": {
            //     //         _id: 1,
            //     //         playerFollowStatus: {
            //     //             $cond: {
            //     //                 if: {
            //     //                     $eq: ['$playerFollowStatus.playerId', req.body.userId]
            //     //                 },
            //     //                 then: "$playerFollowStatus",
            //     //                 else: "NOT FOLLOWED",
            //     //             }
            //     //         },
            //     //         division: 1,
            //     //         period: 1,
            //     //         sports: 1,
            //     //         status: 1,
            //     //         venue: 1,
            //     //         sportType: 1,
            //     //         published:1,
            //     //         competitionName: 1,
            //     //         organizer: 1,
            //     //         createdAt: 1,
            //     //         registrationForm:1,
            //     //         imageURL: 1
            //     //     }
            //     // },
            //     { '$sort': { 'createdAt': -1 } },

            //     {
            //         '$facet': {
            //             pageInfo: [{ $count: "total" }, { $addFields: { page: query.page, limit: query.limit } }],
            //             data: [{ $skip: ((query.page - 1) * query.limit) }, { $limit: query.limit }] // add projection here wish you re-shape the docs
            //         }
            //     }




            // ]).exec((err, result) => {
            //    // console.log("query }}}}}}}}}}}}}}}}}}}}}", query)
            //     if (err || !result)
            //         return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);



            //     User.populate(result[0].data, { path: "organizer", select: "firstName lastName", option: { lean: true } }, (errrr, succcc) => {


            //         if (errrr)
            //             return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err, errrr);


            //        // console.log("iam result>>>", result)





            //         //    Competition.competition.find({"playerFollowStatus.playerId":req.body.userId},(err,result)=>{
            //         //    if (err)
            //         //        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            //         //    else if(!result)
            //         //        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
            //         //    else{
            //         //let newResult=result;
            //         //    for( let data of result.docs){
            //         //        if(data.playerFollowStatus)
            //         //     for (let data1 of data.playerFollowStatus){
            //         //         if(data1.playerId==req.body.userId)
            //         //             {
            //         //                 data.playerStatus=data1;
            //         //                 delete data["playerFollowStatus"];
            //         //             }

            //         //              else
            //         //              {
            //         //                  data.player=null;
            //         //             delete data["playerFollowStatus"];
            //         //         }
            //         //    }}


            //         return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, succcc, result[0].pageInfo);
            //     })
            // })

        }
    }
}


const followCompetition = (req, res) => {
    console.log(req.body)
    let flag = Validator(req.body, [], [], ["userId", "competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        User.findOne({ _id: req.body.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS);
            else {
                let firstName = success.firstName;
                let lastName = success.lastName;
                Competition.competition.findById(req.body.competitionId).lean().exec((err1, success1) => {

                    if (err1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                    else if (!success1)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition not found !");
                    else {
                        let competitionName = success1.competitionName

                        var obj = {
                            playerId: (req.body.userId).toString(),
                        }

                        if (success1.allowPublicToFollow) {
                            obj.followStatus = "APPROVED";
                            req.body.followStatus = "APPROVED";
                        }
                        else
                            obj.followStatus = "PENDING";

                        console.log("objecvt>>>>>>>>", obj);
                        req.body.playerId = req.body.userId;
                        req.body.organizer = success1.organizer;
                        let data = new followComp.competitionFollow(req.body);
                        data.save((err2, success2) => {
                            if (err2 || !success2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                            else {
                                // Competition.competition.findByIdAndUpdate(req.body.competitionId, { $push: { playerFollowStatus: obj } }, { new: true }, (error, result5) => {
                                Competition.competition.findOneAndUpdate({ _id: req.body.competitionId }, { $addToSet: { playerFollowStatus: obj } }, { new: true, upsert: true })
                                    .populate("organizer", " _id competitionNotify email deviceToken countryCode mobileNumber firstName lastName organizerNotification")
                                    .exec((error, result5) => {
                                        if (error || !result5)
                                            return Response.sendResponse(res, responseCode.BAD_REQUEST, "Player has already followed the competition", error);
                                        else
                                            Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success2);
                                        // User.findOne({ _id: success2.organizer },(err, success) => {
                                        //  console.log("successssssss------>>>>>.", success2.organizer);

                                        // console.log(success.deviceToken)
                                        //===================
                                        if (result5.organizer.organizerNotification)
                                            if ((result5.organizer.organizerNotification).indexOf("registration") != -1) {
                                                message.sendSMS(firstName + " " + lastName + " has followed your competition i.e, " + competitionName, result5.organizer.countryCode, result5.organizer.mobileNumber, (error, result) => {
                                                    if (err)
                                                        console.log("error in sending SMS")
                                                    else if (result)
                                                        console.log("SMS sent successfully to the organizer!")
                                                })

                                                message.sendMail(result5.organizer.email, "Yala Sports App ✔", firstName + " " + lastName + " has followed your competition i.e, " + competitionName, (err, result) => {
                                                    console.log("send1--->>", result1)
                                                })
                                            }
                                        message.sendPushNotifications(result5.organizer.deviceToken, firstName + " " + lastName + " has followed your competition " + competitionName)
                                        message.saveNotification([result5.organizer._id], firstName + " " + lastName + " has followed your competition " + competitionName)
                                        //})
                                    })
                            }

                        })
                    }
                })
            }
        })
}


// const followCompetition=(req,res)=>{
//     console.log(req.body)
//     let flag =Validator(req.body,[],[],["userId","competitionId"])
// 	if(flag)
//         return Response.sendResponse(res,flag[0],flag[1]);       
//     else
//         User.findOne({_id:req.body.userId,role:"PLAYER"},(err,success)=>{
//             if(err)
//                 return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
//             else if(!success)
//                     return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
//                 else
//                     Competition.competition.findById(req.body.competitionId).lean().exec((err1,success1)=>{
//                         if(err1)
//                             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
//                         else if(!success1)
//                                 return Response.sendResponse(res,responseCode.NOT_FOUND,"Competition not found !");
//                             else{

//                                 var obj={
//                                     playerId:req.body.userId,
//                                 }


//                                 if(success1.allowPublicToFollow){
//                                     obj.followStatus="APPROVED";
//                                     req.body.followStatus="APPROVED";}
//                                     else
//                                     obj.followStatus="PENDING";

//                                  console.log("objecvt>>>>>>>>",obj);
//                                 req.body.playerId=req.body.userId;
//                                 req.body.organizer=success1.organizer;
//                                 let data= new followComp.competitionFollow(req.body);
//                                 data.save((err2,success2)=>{
//                                     if(err2 ||!success2)
//                                         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
//                                     else{
//                                         Competition.competition.findByIdAndUpdate(req.body.competitionId,{$push:{playerFollowStatus:obj}},{new:true},(error,result5)=>{
//                                             if(error || !result5)
//                                                 return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
//                                             else
//                                                     return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success2,result5);
//                                         })
//                                     }

//                                 })
//                             }
//                     })
//         })
// }

const searchCompetition = (req, res) => {
    // let search = new RegExp("^" + req.body.search)
    Competition.competition.find({
        published: true, $or: [
            { competitionName: { $regex: req.query.search, $options: 'i' } },
            { period: { $regex: req.query.search, $options: 'i' } },
            { sports: { $regex: req.query.search, $options: 'i' } },
            { status: { $regex: req.query.search, $options: 'i' } },
            { venue: { $regex: req.query.search, $options: 'i' } },
            { division: { $regex: req.query.search, $options: 'i' } }
        ]
    })
        .populate({
            path: "organizer",
            select: "firstName lastName",
            match: {
                $or: [
                    { "firstName": { $regex: req.query.search, $options: 'i' } },
                    { "lastName": { $regex: req.query.search, $options: 'i' } }
                ]
            }
        })
        .exec((err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (success == false)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "No data found!");
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);


            }

        })

}

const unFollowCompetition = (req, res) => {
    let flag = Validator(req.body, [], [], ["userId", "competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        User.findOne({ _id: req.body.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS);
            else
                Competition.competition.findOneAndUpdate({ _id: req.body.competitionId, "playerFollowStatus.playerId": req.body.userId }, { $pull: { playerFollowStatus: { playerId: req.body.userId } } }, { safe: true, new: true }).lean().exec((err1, success1) => {
                    if (err1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                    else if (!success1)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition not found !");
                    else {
                        followComp.competitionFollow.findOneAndRemove({ playerId: req.body.userId, competitionId: req.body.competitionId }, (err2, success2) => {
                            if (err2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                            else if (!success2)
                                return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition not found !");
                            else
                                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Successfully deleted");
                        })
                    }
                })
        })

}

const confirmRegistration = (req, res) => {
    console.log("req.body for player paymnet>>>>>", req.body)
    let flag = Validator(req.body, [], [], ["regData"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        User.findOne({ _id: req.body.regData.playerId }, (err, success1) => {
            if (err || !success1)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                let gender = success1.gender; let dob = success1.dob;
                Competition.competitionReg.findOne({ competitionId: req.body.regData.competitionId }, {}, { populate: { path: "competitionId", Model: "competition" } }, (error, result) => {
                    if (error)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, error);
                    else if (!result)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition not found")
                    else {
                        console.log("result----->>>", result.competitionId.division)
                        General.division.aggregate([
                            {
                                $match: {
                                    divisionName: result.competitionId.division
                                }
                            },
                            { $project: { dateDifference: { $divide: [{ $subtract: ["$date", new Date(dob)] }, (60 * 60 * 24 * 1000 * 366)] }, gender: 1, minAge: 1, maxAge: 1, divisionName: 1 } },
                        ], (err, success) => {
                            console.log(success)
                            if (err || !success)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else {
                                let GENDER;
                                if (success[0].gender == "male")
                                    GENDER = "Males";
                                if (success[0].gender == "female")
                                    GENDER = "Females";
                                if (success[0].gender == "co-ed")
                                    GENDER = "Co-ed";

                                if (success[0].gender == "male" || success[0].gender == "female" || success[0].gender == "co-ed") {
                                    if (gender != success[0].gender && success[0].gender != "co-ed")
                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, `"${GENDER}" are only allowed to register in this Competition`)
                                    else {
                                        if (success[0].dateDifference < success[0].minAge || success[0].dateDifference > (success[0].maxAge) + 1)
                                            return Response.sendResponse(res, responseCode.BAD_REQUEST, `Players whose age lies between "${success[0].minAge}" to "${success[0].maxAge}" are only allowed to register in this Competition `)
                                        else {
                                            if (result.freeOrPaid == "paid" && req.body.regData.paymentMethod == "Online") {
                                                if (!req.body.data || !req.body.data.response || !req.body.data.response.token)
                                                    return Response.sendResponse(res, responseCode.BAD_REQUEST, "Payment failed");

                                                var tco = new Twocheckout({
                                                    sellerId: "901386003",         // Seller ID, required for all non Admin API bindings 
                                                    privateKey: "CA54E803-AC54-41C3-8677-A36DE6C276A4",     // Payment API private key, required for checkout.authorize binding
                                                    sandbox: true                          // Uses 2Checkout sandbox URL for all bindings
                                                });

                                                var params = {
                                                    "merchantOrderId": "123",
                                                    "token": req.body.data.response.token.token,
                                                    "currency": "USD",
                                                    "total": result.registrationFee,
                                                    "billingAddr": {
                                                        "name": "Testing Tester",
                                                        "addrLine1": "123 Test St",
                                                        "city": "Columbus",
                                                        "state": "Ohio",
                                                        "zipCode": "43123",
                                                        "country": "USA",
                                                        "email": "example@2co.com",
                                                        "mobileNumber": "5555555555"
                                                    }
                                                };

                                                tco.checkout.authorize(params, function (error, data) {
                                                    console.log("i am data and error", data, error);
                                                    if (error || !data) {
                                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, "UNAUTHORIZED");
                                                    } else {
                                                        if (data.response.responseCode == "APPROVED" && data.response.orderNumber && !data.response.errors) {
                                                            TransactionSchema.organizerTransaction.findOneAndUpdate({ organizerId: req.body.regData.organizerId, playerId: req.body.regData.playerId }, { $push: { paymentDetails: data } }, { new: true, safe: true, upsert: true }, (err3, success3) => {
                                                                if (err3 || !success3)
                                                                    return Response.sendResponse(res, responseCode.BAD_REQUEST, "Transaction history not saved");
                                                                else {
                                                                    if (req.body.data.paymentMethod == "Offline")
                                                                        var paymentMethod = "UNCONFIRMED";
                                                                    else
                                                                        paymentMethod = "CONFIRMED";


                                                                    if (req.body.regData.team)
                                                                        if (req.body.regData.team._id) {
                                                                            var teamname = req.body.regData.team.teamName;
                                                                            let set = {
                                                                                $push: {
                                                                                    playerId: req.body.regData.playerId
                                                                                }
                                                                            }
                                                                            teamServices.updateTeam({ _id: req.body.regData.team._id }, set, { new: true }, (err, success3) => {
                                                                                if (err || !success3)
                                                                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                                else {
                                                                                    console.log("success")
                                                                                }
                                                                            })
                                                                        }
                                                                    Follow.competitionFollow.findOneAndUpdate({ "competitionId": req.body.regData.competitionId, playerId: req.body.regData.playerId, organizer: req.body.regData.organizerId }, { $set: { registration: true, status: paymentMethod, teamName: teamname } })
                                                                        .populate("organizer", " _id competitionNotify email deviceToken countryCode mobileNumber firstName lastName organizerNotification")
                                                                        .populate("competitionId", "competitionName _id")
                                                                        .exec((err, success) => {
                                                                            if (err)
                                                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                                                                            else if (!success)
                                                                                return Response.sendResponse(res, responseCode.NOT_FOUND, "data");
                                                                            else {
                                                                                User.findOneAndUpdate({ _id: req.body.regData.playerId }, { $set: { playerDynamicDetails: req.body.regData.playerDynamicDetails } }, (err1, success1) => {
                                                                                    if (err)
                                                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                                                                                    else if (!success1)
                                                                                        return Response.sendResponse(res, responseCode.NOT_FOUND, "Player not found !");
                                                                                    else {
                                                                                        var firstName = success1.firstName;
                                                                                        var lastName = success1.lastName;

                                                                                        Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You are successfully registered!");
                                                                                        //============sending notification to the organizer//
                                                                                        if (success.organizer.organizerNotification)
                                                                                            if ((success.organizer.organizerNotification).indexOf("registration") != -1) {
                                                                                                message.sendSMS(firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName, success.organizer.countryCode, success.organizer.mobileNumber, (error, result) => {
                                                                                                    if (err)
                                                                                                        console.log("error in sending SMS")
                                                                                                    else if (result)
                                                                                                        console.log("SMS sent successfully to the organizer!")
                                                                                                })

                                                                                                message.sendMail(success.organizer.email, "Yala Sports App ✔", firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName, (err, result) => {
                                                                                                    console.log("send1--->>", result1)
                                                                                                })
                                                                                            }
                                                                                        //=====================
                                                                                        message.sendNotificationToAll(firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName, [success.organizer.deviceToken])
                                                                                        message.saveNotification([success.organizer._id], firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName)
                                                                                    }

                                                                                })
                                                                            }
                                                                        })


                                                                }

                                                            })

                                                        }
                                                        else {
                                                            return sendResponse(res, responseCode.BAD_REQUEST, "Payment is not successfull")
                                                        }

                                                    }
                                                })

                                            }
                                            else {
                                                if (req.body.regData.paymentMethod == "Offline")
                                                    var paymentMethod = "UNCONFIRMED";
                                                if (req.body.regData.team)
                                                    if (req.body.regData.team._id) {
                                                        var teamname = req.body.regData.team.teamName;
                                                        let set = {
                                                            $push: {
                                                                playerId: req.body.regData.playerId
                                                            }
                                                        }
                                                        teamServices.updateTeam({ _id: req.body.regData.team._id }, set, { new: true }, (err, success3) => {
                                                            if (err || !success3)
                                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                            else {
                                                                console.log("success")
                                                            }
                                                        })
                                                    }

                                                Follow.competitionFollow.findOneAndUpdate({ competitionId: req.body.regData.competitionId, playerId: req.body.regData.playerId, organizer: req.body.regData.organizerId }, { $set: { registration: true, teamName: teamname, status: paymentMethod } })
                                                    .populate("organizer", " _id competitionNotify email deviceToken countryCode mobileNumber firstName lastName")
                                                    .populate("competitionId", "competitionName _id")
                                                    .exec((err, success) => {
                                                        if (err)
                                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                                                        else if (!success)
                                                            return Response.sendResponse(res, responseCode.NOT_FOUND, "Player not followed the competition");
                                                        else {
                                                            User.findOneAndUpdate({ _id: req.body.regData.playerId }, { $set: { playerDynamicDetails: req.body.regData.playerDynamicDetails } }, (err1, success1) => {
                                                                if (err)
                                                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                                                                else if (!success1)
                                                                    return Response.sendResponse(res, responseCode.NOT_FOUND, "Player not found !");
                                                                else {
                                                                    var firstName = success1.firstName;
                                                                    var lastName = success1.lastName;

                                                                    Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You are successfully registered!");
                                                                    //============sending notification to the organizer//
                                                                    if (success.organizer.organizerNotification)
                                                                        if ((success.organizer.organizerNotification).indexOf("registration") != -1) {
                                                                            message.sendSMS(firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName, success.organizer.countryCode, success.organizer.mobileNumber, (error, result) => {
                                                                                if (err)
                                                                                    console.log("error in sending SMS")
                                                                                else if (result)
                                                                                    console.log("SMS sent successfully to the organizer!")
                                                                            })

                                                                            message.sendMail(success.organizer.email, "Yala Sports App ✔", firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName, (err, result) => {
                                                                                console.log("send1--->>", result1)
                                                                            })
                                                                        }
                                                                    //=====================
                                                                    message.sendNotificationToAll(firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName, [success.organizer.deviceToken])
                                                                    message.saveNotification([success.organizer._id], firstName + " " + lastName + " is registered into your competition i.e, " + success.competitionId.competitionName)
                                                                }

                                                            })
                                                        }
                                                    })

                                            }
                                        }
                                    }
                                }
                            }

                        })

                    }
                })

            }
        })

    }
}




//==================================get register form or not=========================
const getRegisterFormOrNot = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId", "competitionId", "playerId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Follow.competitionFollow.findOne({ competitionId: req.body.competitionId, playerId: req.body.playerId, organizer: req.body.organizerId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "data");
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);

            }
        })
    }
}
//========================
const competitionNotification = (req, res) => {
    let flag = Validator(req.body, [], [], ["userId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    let query = {};
    if (req.body.compEmailNotify && !req.body.compMobileNotify)
        query = { $set: { "competitionNotify.email": req.body.compEmailNotify } }
    else if (!req.body.compEmailNotify && req.body.compMobileNotify)
        query = { $set: { "competitionNotify.mobile": req.body.compMobileNotify } }
    else if (req.body.compEmailNotify && req.body.compMobileNotify)
        query = { $set: { "competitionNotify.mobile": req.body.compMobileNotify, "competitionNotify.email": req.body.compEmailNotify } };
    User.findByIdAndUpdate(req.body.userId, query, { new: true, safe: true }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
        else if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, "Player not found !");
        else {
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Success!");
        }
    })


}
module.exports = {
    getAllCompetitions,
    filterCompetitions,
    followCompetition,
    unFollowCompetition,

    confirmRegistration,
    competitionNotification,
    getRegisterFormOrNot,

    searchCompetition
}
