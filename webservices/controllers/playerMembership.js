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
const serviceBooking = require("../../models/serviceBooking")
const userServices = require('../services/userApis');
const mongoose = require('mongoose');
const Team = require("../../models/team")
const followComp = require("../../models/compFollowOrgPlay.js");
const General = require("../../models/generalSchema.js")
const ObjectId = mongoose.Types.ObjectId;
const media = require("../../global_functions/uploadMedia");
const teamServices = require('../services/teamApis');
const Membership = require("../../models/orgMembership");
const TransactionSchema = require("../../models/transactions");

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

//Get Service list in player
const getServiceListInPlayer = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    else {
        let query1 = { "playerFollowStatus.playerId": req.query.userId, "playerFollowStatus.followStatus": "APPROVED" }
        Membership.membershipSchema.aggregate([
            {
                $match: query1
            },
            {
                $project: {
                    membershipId: "$_id",
                    _id: 0
                }
            }
        ]).exec((err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.NO_DATA_FOUND)
            else {
                let query = {
                    $or: success,
                    showStatus: "ACTIVE"
                }
                if (req.body.search) {
                    query={
                        $and:[
                           { $or:[
                                { serviceName: { $regex: req.body.search, $options: 'i' } },
                                { amount: { $regex: req.body.search, $options: 'i' } },
                                { "professionals.professionalName": { $regex: req.body.search, $options: 'i' } },
                                { status: { $regex: req.body.search, $options: 'i' } },
                                { venueName: { $regex: req.body.search, $options: 'i' } },
                                { description: { $regex: req.body.search, $options: 'i' } },
                                { organizerName: { $regex: req.body.search, $options: 'i' } },
                                { membershipName: { $regex: req.body.search, $options: 'i' } },
                            ]},
                          {$or:success}
                        ],
                        showStatus: "ACTIVE"
                       };
                }
                if (req.body.status)
                query.status = req.body.status;
                if (req.body.membershipId)
                query.organizerName = req.body.organizerName;
                let option={
                    page:req.body.page||1,
                    limit:req.body.limit||4,
                    sort:{createdAt:-1},
                    populate:{path:"membershipId",model:"orgmembership",select:"imageURL"},
                    lean:true
                }
                console.log("query--->",query)
                Membership.serviceSchema.paginate(query,option, (err, success) => {
                    if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.NO_DATA_FOUND)
                    else{
                        for (i = 0; i < success.docs.length; i++) {
                            if (((success.docs[i].playerId).toString()).indexOf(req.query.userId) != -1) {
                                success.docs[i].bookingStatus = "True"
                            }
                            else {
                                success.docs[i].bookingStatus = "False"
                            }
                        }
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK,"List of Service",success)
                    }
                })
            }
        })
    }
}
// Book A service
const bookAservice = (req, res) => {
    console.log("req.body for player paymnet>>>>>", req.body)
    let flag = Validator(req.body, [], [], ["playerId", "membershipId", "organizerId", "serviceId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        User.findOne({ _id: req.body.playerId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, "User not found")
            else {
                Membership.membershipSchema.findOne({ _id: req.body.membershipId, "playerFollowStatus.playerId": req.body.playerId, "playerFollowStatus.followStatus": "APPROVED" }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Follow membership first")
                    else {
                        serviceBooking.serviceBooking.findOne({ playerId: req.body.playerId, serviceId: req.body.serviceId }, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (success)
                                return Response.sendResponse(res, responseCode.ALREADY_EXIST, "You have already booked this service")
                            else {
                                let availableSlots = [], duration = []
                                Membership.serviceSchema.findOne({ _id: req.body.serviceId }, (err, success) => {
                                    if (err)
                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                    else if (!success)
                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Service not found")
                                    else {
                                        for (let data = 0; data < success.slots.length; data++) {
                                            for (data1 in req.body.timeSlots) {
                                                if (success.slots[data].time == req.body.timeSlots[data1] && success.slots[data].noOfSeats != 0)
                                                    availableSlots.push(req.body.timeSlots[data1])
                                            }
                                        }
                                        console.log("I am available slots ", availableSlots)
                                        if (!availableSlots.length)
                                            return Response.sendResponse(res, responseCode.BAD_REQUEST, "No slots is empty")
                                        else {
                                            for (data in availableSlots) {
                                                for (data1 in req.body.duration) {
                                                    if (availableSlots[data] == req.body.duration[data1].startTime)
                                                        duration.push(req.body.duration[data1])
                                                }
                                            }
                                            if (req.body.regData.paymentMethod == "Cash") {
                                                let obj1 = {
                                                    organizerId: req.body.organizerId,
                                                    membershipId: req.body.membershipId,
                                                    membershipName: req.body.membershipName,
                                                    playerId: req.body.playerId,
                                                    startDate: req.body.startDate,
                                                    status: "pending",
                                                    endDate: req.body.endDate,
                                                    booking: true,
                                                    timeSlots: availableSlots,
                                                    followStatus: "APPROVED",
                                                    serviceName: req.body.serviceName,
                                                    serviceId: req.body.serviceId,
                                                    paymentMethod: "Cash",
                                                    totalPrice: req.body.totalPrice,
                                                    duration: duration
                                                }
                                                serviceBooking.serviceBooking.create(obj1, (err, success) => {
                                                    if (err || !success)
                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                    else {
                                                        let obj = {
                                                            type: "MEMBERSHIP",
                                                            playerId: req.body.playerId,
                                                            paymentMethod: "Cash",
                                                            organizerId: req.body.organizerId,
                                                            bookingId: success._id
                                                        }
                                                        TransactionSchema.organizerTransaction.create(obj, (err, success1) => {
                                                            if (err)
                                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                            else if (!success1)
                                                                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Error in saving transaction detail")
                                                            else {
                                                                async.forEach(availableSlots, (key, callback) => {
                                                                    Membership.serviceSchema.findOne({ _id: req.body.serviceId, "slots.time": key }, { "slots.$.time": 1 }, (err, success3) => {
                                                                        if (success3) {
                                                                            Membership.serviceSchema.findOneAndUpdate({ _id: req.body.serviceId, "slots.time": key }, { $set: { "slots.$.noOfSeats": success3.slots[0].noOfSeats - 1 } }, { new: true }, (err, success) => {
                                                                                if (err)
                                                                                    console.log("noooooo")
                                                                                else {
                                                                                    console.log("success")
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                })
                                                                Membership.serviceSchema.findOneAndUpdate({ _id: req.body.serviceId }, { $addToSet: { playerId: req.body.playerId } }, { new: true }, (err, success) => {
                                                                    if (err)
                                                                        console.log("noooooo")
                                                                    else {
                                                                        console.log("success")
                                                                    }
                                                                })
                                                                Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Booking Confirmed for Slots" + availableSlots, success);
                                                                User.findOneAndUpdate({ _id: req.body.playerId }, { $push: { playerDynamicDetails: req.body.regData.playerDynamicDetails } }, { new: true }, (err, success) => {
                                                                    if (err)
                                                                        console.log("noooooo")
                                                                    else {
                                                                        console.log("success")
                                                                    }
                                                                })
                                                                User.findOne({ _id: req.body.organizerId }, { password: 0 }, (err, success) => {
                                                                    if (success.organizerNotification)
                                                                        if ((success.organizerNotification).indexOf("registration") != -1) {
                                                                            message.sendSMS(req.body.regData.name + " has booked  your service i.e, " + req.body.serviceName, success.countryCode, success.mobileNumber, (error, result) => {
                                                                                if (err)
                                                                                    console.log("error in sending SMS")
                                                                                else if (result)
                                                                                    console.log("SMS sent successfully to the organizer!")
                                                                            })
                                                                            message.sendMail(success.email, "Yala Sports App ✔", req.body.regData.name + " has booked your service i.e, " + req.body.serviceName, (err, result) => {
                                                                                console.log("send1--->>", result1)
                                                                            })
                                                                        }
                                                                    //=====================
                                                                    message.sendPushNotifications(success.deviceToken, req.body.regData.name + " has booked your service i.e, " + req.body.serviceName)
                                                                    message.saveNotification([success._id], req.body.regData.name + " has booked your service i.e, " + req.body.serviceName)
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                            else if (req.body.regData.paymentMethod == "Card") {
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
                                                    "total": req.body.totalPrice,
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
                                                            let obj1 = {
                                                                organizerId: req.body.organizerId,
                                                                membershipId: req.body.membershipId,
                                                                membershipName: req.body.membershipName,
                                                                playerId: req.body.playerId,
                                                                startDate: req.body.startDate,
                                                                status: "confirmed",
                                                                endDate: req.body.endDate,
                                                                booking: true,
                                                                paymentMethod: "Card",
                                                                timeSlots: availableSlots,
                                                                followStatus: "APPROVED",
                                                                serviceName: req.body.serviceName,
                                                                serviceId: req.body.serviceId,
                                                                totalPrice: req.body.totalPrice,
                                                                duration: duration
                                                            }
                                                            serviceBooking.serviceBooking.create(obj1, (err, success) => {
                                                                if (err || !success)
                                                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                else {
                                                                    let obj = {
                                                                        type: "MEMBERSHIP",
                                                                        playerId: req.body.playerId,
                                                                        paymentMethod: "Card",
                                                                        paymentDetails: data,
                                                                        organizerId: req.body.organizerId,
                                                                        bookingId: success._id
                                                                    }
                                                                    TransactionSchema.organizerTransaction.create(obj, (err, success1) => {
                                                                        if (err)
                                                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                        else if (!success1)
                                                                            return Response.sendResponse(res, responseCode.BAD_REQUEST, "Error in saving transaction detail")
                                                                        else {
                                                                            async.forEach(availableSlots, (key, callback) => {
                                                                                Membership.serviceSchema.findOne({ _id: req.body.serviceId, "slots.time": key }, { "slots.$.time": 1 }, (err, success3) => {
                                                                                    if (success3) {
                                                                                        Membership.serviceSchema.findOneAndUpdate({ _id: req.body.serviceId, "slots.time": key }, { $set: { "slots.$.noOfSeats": success3.slots[0].noOfSeats - 1 } }, { new: true }, (err, success) => {
                                                                                            if (err)
                                                                                                console.log("noooooo")
                                                                                            else {
                                                                                                console.log("success")
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            })
                                                                            Membership.serviceSchema.findOneAndUpdate({ _id: req.body.serviceId }, { $addToSet: { playerId: req.body.playerId } }, { new: true }, (err, success) => {
                                                                                if (err)
                                                                                    console.log("noooooo")
                                                                                else {
                                                                                    console.log("success")
                                                                                }
                                                                            })
                                                                            Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Payment successfully done .Booking confirmed for slots " + availableSlots, success);
                                                                            User.findOneAndUpdate({ _id: req.body.playerId }, { $push: { playerDynamicDetails: req.body.regData.playerDynamicDetails } }, { new: true }, (err, success) => {
                                                                                if (err)
                                                                                    console.log("noooooo")
                                                                                else {
                                                                                    console.log("success")
                                                                                }
                                                                            })
                                                                            User.findOne({ _id: req.body.organizerId }, { password: 0 }, (err, success) => {
                                                                                if (success.organizerNotification)
                                                                                    if ((success.organizerNotification).indexOf("registration") != -1) {
                                                                                        message.sendSMS(req.body.regData.name + " has booked  your service i.e, " + req.body.serviceName, success.countryCode, success.mobileNumber, (error, result) => {
                                                                                            if (err)
                                                                                                console.log("error in sending SMS")
                                                                                            else if (result)
                                                                                                console.log("SMS sent successfully to the organizer!")
                                                                                        })
                                                                                        message.sendMail(success.email, "Yala Sports App ✔", req.body.regData.name + " has booked your service i.e, " + req.body.serviceName, (err, result) => {
                                                                                            console.log("send1--->>", result1)
                                                                                        })
                                                                                    }
                                                                                //=====================
                                                                                message.sendPushNotifications(success.deviceToken, req.body.regData.name + " has booked your service i.e, " + req.body.serviceName)
                                                                                message.saveNotification([success._id], req.body.regData.name + " has booked your service i.e, " + req.body.serviceName)
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
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}
const getUserTransaction = (req, res) => {
    if (!req.body.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    let options = {
        page: req.body.page || 1,
        limit: req.body.limit || 4,
        sort: {createdAt: -1 },
        populate: [{ path: "playerId", model: "user" ,select:{firstName:1}}, { path: "bookingId", model: "serviceBooking" },{ path: "organizerId", model: "user" ,select:{firstName:1,lastName:1,email:1,mobileNumber:1,countryCode:1}}]
    }
    TransactionSchema.organizerTransaction.paginate({ playerId: req.body.userId }, options, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
        else
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
    })
}
module.exports={
    getMembership,
    getClubList,
    followMembership,
    unFollowMembership,
    bookAservice,
    getServiceListInPlayer,
    getUserTransaction

}