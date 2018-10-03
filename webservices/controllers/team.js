const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices = require('../services/userApis');
const teamServices = require('../services/teamApis');
const message = require("../../global_functions/message");
const bcrypt = require('bcryptjs');
const Team = require("../../models/team")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Follow = require("../../models/compFollowOrgPlay");
const General = require("../../models/generalSchema.js")
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const media = require("../../global_functions/uploadMedia");
const Membership = require("../../models/orgMembership");
const serviceBooking = require("../../models/serviceBooking")
var async = require("async");
var waterfall = require('async-waterfall');
//---------------------------Select competiton----------------------------------------------
const selectCompition = (req, res) => {
    console.log("ghfghdhfh", req.query.userId)
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                req.body.userId = success.employeerId
            else
                req.body.userId = req.query.userId
            let select = {
                competitionName: 1,
                sportType: 1
            }
            teamServices.selectCompition({ organizer: req.body.userId }, select, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                else if (!success.length)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.COMPETITION_NOT_FOUND)
                else
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_COMPETITION, success)
            })
        })
    }
}
//---------------------------------Select Venue(Membership and Competititon)---------------------------------------------
const selectVenue = (req, res) => {
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                req.body.userId = success.employeerId
            else
                req.body.userId = req.query.userId
            let select = {
                venue: 1
            }
            teamServices.selectVenue({ userId: req.body.userId }, select, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                else if (!success.length)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.VENUE_NOT_FOUND)
                else
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_VENUE, success)
            })
        })
    }
}

//-----------------------------------Create Team---------------------------------------------------
const createTeam = (req, res) => {
    console.log("req.body--->>", req.body)
    subscriptionValidator(req.query, ["Create Team & Player",], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            if (!req.query.userId) {
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
            }
            else {req.body.email=req.body.email.toLowerCase();
                req.body.organizer = req.query.userId
                userServices.findUser({ _id: req.query.userId }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
                    else {
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizer = success.employeerId
                        else
                            req.body.organizer = req.query.userId
                        let query = {
                            organizer: req.body.organizer,
                            email: req.body.email,
                            deleteStatus: "ACTIVE"
                        }
                        teamServices.findTeam(query, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (success)
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.TEAM_NAME_EXISTS)
                            else {
                                message.uploadImg(req.body.imageURL, (err, result) => {
                                    if (result) {
                                        console.log("iiiiiiiiiiiiiiiiiiii", result)
                                        req.body.imageURL = result.secure_url
                                        console.log("req.body---->>>", req.body)
                                        teamServices.addTeam(req.body, (err, success) => {
                                            if (err)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                            else
                                                return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.TEAM_ADDED, success)
                                        })
                                    }
                                    else {
                                        console.log("error while saving", err)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    })
}
//-----------------------------------------Get Detail of Team-----------------------------------------------------
const getDetailOfTeam = (req, res) => {
    subscriptionValidator(req.query, ["Create Team & Player"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            if (!req.query.userId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
            else if (!req.query.teamId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.TEAM_IS_REQUIRED)
            else {
                userServices.findUser({ _id: req.query.userId }, (err, success) => {
                    if (err || !success)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizer = success.employeerId
                        else
                            req.body.organizer = req.query.userId
                        let query = {
                            _id: ObjectId(req.query.teamId),
                            organizer: ObjectId(req.body.organizer),
                            visibleStatus: "ACTIVE"
                        }
                        console.log(query)
                        Team.aggregate([
                            {
                                $lookup: {
                                    from: "competitions",
                                    localField: "competitionId",
                                    foreignField: "_id",
                                    as: "Comp"
                                }
                            }, {
                                $unwind: "$Comp"
                            },
                            { $match: query },

                        ]).exec((err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (!success.length)
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_TEAM_FOUND)
                            else
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.TEAM_DETAIL, success)
                        })
                    }
                })

            }
        }
    })
}

//---------------Filter Team---------------------------------------
const filterTeam = (req, res) => {
    subscriptionValidator(req.query, ["Create Team & Player"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            if (!req.query.userId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
            else {
                userServices.findUser({ _id: req.query.userId }, (err, success) => {
                    if (err || !success)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizer = success.employeerId
                        else
                            req.body.organizer = req.query.userId
                        let query = {
                            organizer: ObjectId(req.body.organizer),
                            visibleStatus: "ACTIVE"
                        }
                        if (req.body.search) {
                            let search = new RegExp("^" + req.body.search)
                            query = {
                                organizer: ObjectId(req.body.organizer),
                                visibleStatus: "ACTIVE",
                                $or: [{ teamName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { competitionName: { $regex: search, $options: 'i' } }, { "teamDynamicDetail.venue": { $regex: search, $options: 'i' } }, { "Comp.sports": { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }]
                            }
                        }
                        if (req.body.status)
                            query.status = req.body.status
                        if (req.body.competitionName)
                            query.competitionName = req.body.competitionName
                        if (req.body.division)
                            query["Comp.division"] = { $in: req.body.division }
                        if (req.body.sports)
                            query["Comp.sports"] = { $in: req.body.sports }
                        if (req.body.venue)
                            query["Comp.venue"] = req.body.venue
                        if (req.body.competitionStatus)
                            query["Comp.status"] = req.body.competitionStatus
                        if (req.body.period)
                            query["Comp.period"] = req.body.period
                        console.log("query-->>", query)
                        let option = {
                            limit: req.body.limit || 10,
                            page: req.body.page || 1
                        }
                        var aggregate = Team.aggregate([
                            {
                                $lookup: {
                                    from: "competitions",
                                    localField: "competitionId",
                                    foreignField: "_id",
                                    as: "Comp"
                                }
                            }, {
                                $unwind: "$Comp"
                            },
                            { $match: query },
                            { $sort: { createdAt: -1 } }
                        ])
                        Team.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
                            if (!err) {
                                const success = {
                                    "docs": result,
                                    "total": total,
                                    "limit": option.limit,
                                    "page": option.page,
                                    "pages": pages,
                                }
                                console.log(success)
                                if (success)
                                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.TEAM_DETAIL, success)
                                else
                                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_TEAM_FOUND)
                            }
                            else {
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            }
                        })
                    }
                })

            }
        }
    })
}
//----------------------Print Team Details----------------
const listOfTeam = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizer = success.employeerId
                else
                    req.body.organizer = req.query.userId
                let query = {
                    organizer: ObjectId(req.body.organizer),
                    visibleStatus: "ACTIVE"
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query = {
                        organizer: ObjectId(req.body.organizer),
                        visibleStatus: "ACTIVE",
                        $or: [{ teamName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { competitionName: { $regex: search, $options: 'i' } }, { venue: { $regex: search, $options: 'i' } }, { sports: { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }]
                    }
                }
                if (req.body.status)
                    query.status = req.body.status
                if (req.body.competitionName)
                    query.competitionName = req.body.competitionName
                if (req.body.division)
                    query["Comp.division"] = { $in: req.body.division }
                if (req.body.sports)
                    query["Comp.sports"] = { $in: req.body.sports }
                if (req.body.venue)
                    query.venue = req.body.venue
                if (req.body.competitionStatus)
                    query["Comp.status"] = req.body.competitionStatus
                if (req.body.period)
                    query["Comp.period"] = req.body.period
                console.log("query-->>", query)
                let option = {
                    limit: req.body.limit || 10,
                    page: req.body.page || 1
                }
                Team.aggregate([
                    {
                        $lookup: {
                            from: "competitions",
                            localField: "competitionId",
                            foreignField: "_id",
                            as: "Comp"
                        }
                    }, {
                        $unwind: "$Comp"
                    },
                    { $match: query },
                    { $sort: { createdAt: -1 } }
                ]).exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_TEAM_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.TEAM_DETAIL, success)
                })
            }
        })

    }
}

//------------------------Select Team---------------------------------------
const selectTeam = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizer = success.employeerId
                else
                    req.body.organizer = req.query.userId
                let query = {
                    organizer: req.body.organizer,
                    visibleStatus: "ACTIVE"
                }
                if (req.query.competitionId) {
                    query.competitionId = req.query.competitionId
                }
                console.log(query)
                let select = {
                    teamName: 1
                }
                teamServices.selectTeam(query, select, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_TEAM_FOUND, err)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.lIST_OF_TEAM, success)
                })
            }
        })

    }
}
const tryyyy = (req, res) => {

}
//---------------------------Add player-----------------------------------------------
const addPlayer = (req, res) => {
    console.log(req.body.playerDetail)
    subscriptionValidator(req.query, ["Create Team & Player",], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        if (!req.query.userId)
            return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
        else {
            userServices.findUser({ _id: req.query.userId }, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
                else {
                    if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                        req.body.organizer = success.employeerId
                    else{
                        if(req.body.email)
                            req.body.email=req.body.email.toLowerCase();
                        req.body.organizer = req.query.userId
                    userServices.findUser({ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] }, (err, success) => {
                        if (err)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                        else if (success)
                            return Response.sendResponse(res, responseCode.ALREADY_EXIST, responseMsg.PLAYER_EXISTS)
                        else {
                            teamServices.findCompition({ _id: req.body.competitionId }, (err, success) => {
                                if (err || !success)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else {
                                    console.log(new Date(req.body.playerDetail.dob))
                                    General.division.aggregate([
                                        {
                                            $match: {
                                                divisionName: success.division
                                            }
                                        },
                                        { $project: { dateDifference: { $divide: [{ $subtract: ["$date", new Date(req.body.playerDetail.dob)] }, (60 * 60 * 24 * 1000 * 366)] }, gender: 1, minAge: 1, maxAge: 1, divisionName: 1 } },
                                    ], (err, success) => {
                                        console.log(success[0])
                                        if (err || !success)
                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                        else {
                                            if (success[0].gender == "male" || success[0].gender == "female" || success[0].gender == "co-ed") {
                                                if (req.body.playerDetail.gender != success[0].gender && success[0].gender != "co-ed")
                                                    return Response.sendResponse(res, responseCode.BAD_REQUEST, `"${success[0].gender}" are allowed only for Competition "${req.body.competitionName}" !`)
                                                else {
                                                    console.log("yieepieee")
                                                    console.log("dsffj", parseInt(success[0].dateDifference))
                                                    if (success[0].dateDifference < success[0].minAge || success[0].dateDifference > (success[0].maxAge) + 1)
                                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, `"${success[0].minAge}" to "${success[0].maxAge}" year age players are allowed for Competition "${req.body.competitionName}" !`)
                                                    else {
                                                        console.log("yippieee")
                                                        const password = message.genratePassword();
                                                        console.log("password-->>", password)
                                                        req.body.password = password
                                                        let salt = bcrypt.genSaltSync(10);
                                                        req.body.playerDetail.password = bcrypt.hashSync(req.body.password, salt)
                                                        req.body.playerDetail.role = ["PLAYER"],
                                                            req.body.playerDetail.phoneVerified = true
                                                        req.body.playerDetail.emailVerified = true
                                                        message.uploadImg(req.body.playerDetail.image, (err, res1) => {
                                                            console.log("res--->>", res1)
                                                            if (res1) {
                                                                req.body.playerDetail.image = res1.secure_url
                                                                console.log(req.body.playerDetail)
                                                                userServices.addUser(req.body.playerDetail, (err, success) => {
                                                                    if (err)
                                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                    else {
                                                                        let set = {
                                                                            $push: {
                                                                                playerFollowStatus: {
                                                                                    playerId: (success._id).toString(),
                                                                                    followStatus: "APPROVED"
                                                                                }
                                                                            }
                                                                        }
                                                                        teamServices.updateCompetition({ _id: req.body.competitionId }, set, { new: true }, (err, success1) => {
                                                                            if (err || !success1)
                                                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                            else {
                                                                                let obj = {
                                                                                    organizer: req.body.organizer,
                                                                                    competitionId: req.body.competitionId,
                                                                                    playerId: success._id,
                                                                                    registration: true,
                                                                                    status: req.body.status,
                                                                                    followStatus: "APPROVED",
                                                                                    teamName: req.body.teamName,
                                                                                    teamId: req.body.teamId
                                                                                }
                                                                                teamServices.addCompetitonFollow(obj, (err, success2) => {
                                                                                    if (err || !success2)
                                                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                                    else {
                                                                                        if (req.body.teamName) {
                                                                                            let set = {
                                                                                                $push: {
                                                                                                    playerId: success._id
                                                                                                }
                                                                                            }
                                                                                            teamServices.updateTeam({ _id: req.body.teamId }, set, { new: true }, (err, success3) => {
                                                                                                if (err || !success3)
                                                                                                    console.log("Not Success", err)
                                                                                                else {
                                                                                                    console.log("success")
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                        Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.PLAYER_ADDED, success);
                                                                                        message.sendMail(success.email, "YALA Login Credentials", "Your Login Credentials are:" + "<br/>UserId : " + req.body.playerDetail.email + "<br/>Password : " + req.body.password, (err, result1) => {
                                                                                            if (err || !result1) {
                                                                                                console.log(err)
                                                                                            }
                                                                                            else {
                                                                                                console.log(result1)
                                                                                            }
                                                                                        }, req.body.organizer)
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error while uploading image")
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    })}
                }
            })
        }
    })
}

//------------------get list of Player------------------------------------------------
const getListOfPlayer = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizer = success.employeerId
                else
                    req.body.organizer = req.query.userId
                let query = {
                    organizer: ObjectId(req.body.organizer),
                    "registration": true,
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query = {
                        organizer: ObjectId(req.body.organizer),
                        "registration": true,
                        $or: [{ teamName: { $regex: search, $options: 'i' } }, { "Comp.competitionName": { $regex: search, $options: 'i' } }, { "Player.gender": { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }, { "Player.firstName": { $regex: search, $options: 'i' } }, { "Comp.division": { $regex: search, $options: 'i' } }, { "Player.email": { $regex: search, $options: 'i' } }]
                    }
                }
                if (req.body.teamName)
                    query["teamName"] = req.body.teamName
                if (req.body.status)
                    query["status"] = req.body.status
                if (req.body.competitionName)
                    query["Comp.competitionName"] = req.body.competitionName
                if (req.body.gender)
                    query["Player.gender"] = req.body.gender
                if (req.body.competitionStatus)
                    query["Comp.status"] = req.body.competitionStatus
                if (req.body.division)
                    query["Comp.division"] = { $in: req.body.division }
                if (req.body.sports)
                    query["Comp.sports"] = { $in: req.body.sports }
                console.log("query-->>", query)
                let option = {
                    limit: req.body.limit || 10,
                    page: req.body.page || 1,
                    sort: { createdAt: -1 },
                    allowDiskUse: true
                }
                var aggregate = Follow.competitionFollow.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    {
                        $lookup: {
                            from: "competitions",
                            localField: "competitionId",
                            foreignField: "_id",
                            as: "Comp"
                        }
                    },
                    {
                        $unwind: "$Comp"
                    },
                    { $unwind: "$Player" },
                    { $match: query },
                    { $sort: { createdAt: -1 } }
                ])
                Follow.competitionFollow.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
                    if (!err) {
                        const success = {
                            "docs": result,
                            "total": total,
                            "limit": option.limit,
                            "page": option.page,
                            "pages": pages,
                        }
                        console.log(success)
                        if (success)
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_PLAYER, success)
                        else
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
                    }
                    else {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    }
                })
            }
        })
    }
}
//------------------List of Player Without pagination for Print--------
const listOfPlayer = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizer = success.employeerId
                else
                    req.body.organizer = req.query.userId
                let query = {
                    organizer: ObjectId(req.body.organizer),
                    "registration": true,
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query = {
                        organizer: ObjectId(req.body.organizer),
                        "registration": true,
                        $or: [{ teamName: { $regex: search, $options: 'i' } }, { "Comp.competitionName": { $regex: search, $options: 'i' } }, { "Player.gender": { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }, { "Player.firstName": { $regex: search, $options: 'i' } }, { "Comp.division": { $regex: search, $options: 'i' } }, { "Player.email": { $regex: search, $options: 'i' } }]
                    }
                }
                if (req.body.teamName)
                    query["teamName"] = req.body.teamName
                if (req.body.status)
                    query["status"] = req.body.status
                if (req.body.competitionName)
                    query["Comp.competitionName"] = req.body.competitionName
                if (req.body.gender)
                    query["Player.gender"] = req.body.gender
                if (req.body.competitionStatus)
                    query["Comp.status"] = req.body.competitionStatus
                if (req.body.division)
                    query["Comp.division"] = { $in: req.body.division }
                if (req.body.sports)
                    query["Comp.sports"] = { $in: req.body.sports }
                console.log("query-->>", query)
                Follow.competitionFollow.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    {
                        $lookup: {
                            from: "competitions",
                            localField: "competitionId",
                            foreignField: "_id",
                            as: "Comp"
                        }
                    },
                    {
                        $unwind: "$Comp"
                    },
                    { $unwind: "$Player" },
                    { $match: query },
                    { $sort: { createdAt: -1 } }
                ]).exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success.length)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_PLAYER, success)
                })

            }
        })
    }
}


//--------------------------Get Details of Player---------------------------
const getDetailOfPlayer = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.playerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PLAYER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizer = success.employeerId
                else
                    req.body.organizer = req.query.userId
                let query = {
                    organizer: ObjectId(req.body.organizer),
                    playerId: ObjectId(req.query.playerId)
                }
                Follow.competitionFollow.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    {
                        $lookup: {
                            from: "competitions",
                            localField: "competitionId",
                            foreignField: "_id",
                            as: "Comp"
                        }
                    },

                    {
                        $unwind: "$Comp"
                    },
                    { $unwind: "$Player" },

                    { $match: query },
                ]).exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success.length)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PLAYER_DETAIL, success)
                })
            }
        })

    }
}



//---------Membership Player (Data section)----------------
const addPlayerInMember = (req, res) => {
    subscriptionValidator(req.query, ["Create Team & Player",], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            if (!req.query.organizerId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
            else {
                userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
                    else {
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizerId = success.employeerId
                        else
                            req.body.organizerId = req.query.organizerId
                        userServices.findUser({ $or: [{ email: req.body.playerDetail.email }, { mobileNumber: req.body.playerDetail.mobileNumber }] }, (err, success1) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (success1)
                                return Response.sendResponse(res, responseCode.ALREADY_EXIST, "Player already exists")
                            else {
                                Membership.serviceSchema.findOne({ membershipId: req.body.membershipId, _id: req.body.serviceId }, (err, success2) => {
                                    if (err)
                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                    else if (!success2)
                                        return Response.sendResponse(res, responseCode.NOT_FOUND, "Service not found")
                                    else {
                                        let availableSlots = []
                                        Membership.serviceSchema.findOne({ _id: req.body.serviceId }, (err, success) => {
                                            if (err)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                            else
                                                console.log("success=====>>>", success.slots[0].time)
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
                                                let totalPrice = availableSlots.length * success.amount
                                                let duration = [], temp = {}
                                                for (data in availableSlots) {
                                                    temp = {
                                                        startTime: availableSlots[data],
                                                        totalDuration: success.duration,
                                                        price: success.amount
                                                    }
                                                    duration.push(temp)
                                                }
                                                const password = message.genratePassword();
                                                console.log("password-->>", password)
                                                req.body.password = password
                                                let salt = bcrypt.genSaltSync(10);
                                                req.body.playerDetail.password = bcrypt.hashSync(req.body.password, salt)
                                                req.body.playerDetail.role = ["PLAYER"],
                                                    req.body.playerDetail.phoneVerified = true
                                                req.body.playerDetail.emailVerified = true
                                                message.uploadImg(req.body.playerDetail.image, (err, res1) => {
                                                    console.log("res--->>", res1)
                                                    if (res1) {
                                                        req.body.playerDetail.image = res1.secure_url
                                                        console.log(req.body.playerDetail)
                                                        userServices.addUser(req.body.playerDetail, (err, success) => {
                                                            if (err)
                                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                            else {
                                                                let set = {
                                                                    $push: {
                                                                        playerFollowStatus: {
                                                                            playerId: (success._id).toString(),
                                                                            followStatus: "APPROVED"
                                                                        }
                                                                    }
                                                                }
                                                                Membership.membershipSchema.findOneAndUpdate({ _id: req.body.membershipId }, set, { new: true }, (err, success1) => {
                                                                    if (err || !success1)
                                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                    else {
                                                                        let obj = {
                                                                            organizerId: req.body.organizerId,
                                                                            membershipId: req.body.membershipId,
                                                                            membershipName: req.body.membershipName,
                                                                            playerId: success._id,
                                                                            startDate: req.body.startDate,
                                                                            endDate: req.body.endDate,
                                                                            booking: true,
                                                                            timeSlots: availableSlots,
                                                                            followStatus: "APPROVED",
                                                                            serviceName: req.body.serviceName,
                                                                            serviceId: req.body.serviceId,
                                                                            totalPrice: totalPrice,
                                                                            duration: duration

                                                                        }
                                                                        console.log("obj--->>", obj)
                                                                        serviceBooking.serviceBooking.create(obj, (err, success2) => {
                                                                            if (err || !success2)
                                                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
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
                                                                                Membership.serviceSchema.findOneAndUpdate({ _id: req.body.serviceId }, { $addToSet: { playerId: success._id } }, { new: true }, (err, success) => {
                                                                                    if (err)
                                                                                        console.log("noooooo")
                                                                                    else {
                                                                                        console.log("success")
                                                                                    }

                                                                                })
                                                                                Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Player added successfully for slots " + availableSlots, success);
                                                                                message.sendMail(success.email, "YALA Login Credentials", "Your Login Credentials are:" + "<br/>UserId : " + req.body.playerDetail.email + "<br/>Password : " + req.body.password, (err, result1) => {
                                                                                    if (err || !result1) {
                                                                                        console.log(err)
                                                                                    }
                                                                                    else {
                                                                                        console.log(result1)
                                                                                    }
                                                                                }, req.body.organizer)
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                    else {
                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error while uploading image")
                                                    }
                                                })
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
    })
}

const getServiceList = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizerId = success.employeerId
                else
                    req.body.organizerId = req.query.organizerId
                let query = {
                    organizerId: ObjectId(req.body.organizerId),
                    "booking": true,
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query = {
                        organizerId: ObjectId(req.body.organizerId),
                        "booking": true,
                        $or: [{ serviceName: { $regex: search, $options: 'i' } }, { membershipName: { $regex: search, $options: 'i' } }, { timeSlots: { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }, { "Player.firstName": { $regex: search, $options: 'i' } }, { "Comp.division": { $regex: search, $options: 'i' } }, { "Player.email": { $regex: search, $options: 'i' } }]
                    }
                }
                if (req.body.serviceName)
                    query.serviceName = req.body.teamName
                if (req.body.status)
                    query["status"] = req.body.status
                if (req.body.membershipName)
                    query.membershipName = req.body.competitionName
                if (req.body.gender)
                    query["Player.gender"] = req.body.gender
                if (req.body.timeSlots)
                    query.timeSlots = { $in: req.body.timeSlots }
                console.log("query-->>", query)
                let option = {
                    limit: req.body.limit || 10,
                    page: req.body.page || 1,
                    allowDiskUse: true
                }
                var aggregate = serviceBooking.serviceBooking.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    {
                        $lookup: {
                            from: "services",
                            localField: "serviceId",
                            foreignField: "_id",
                            as: "Service"
                        }
                    },
                    {
                        $lookup: {
                            from: "orgmemberships",
                            localField: "membershipId",
                            foreignField: "_id",
                            as: "Membership"
                        }
                    },
                    {
                        $unwind: "$Service"
                    },
                    { $unwind: "$Player" },
                    { $unwind: "$Membership" },
                    { $match: query },
                    {
                        $project: {
                            "Player.password": 0,
                            "Player.competitionNotify": 0,
                            "Player.membershipNotify": 0,
                            "Player.venueNotify": 0,
                            "Player.employeePermissionForCoordinator": 0,
                            "Player.employeePermissionForAdminstartor": 0,
                            "Player:organizerType": 0,
                            "Player.subscriptionAccess": 0,
                            "Player.organizerCompetition": 0,
                            "Player.organizerNotification": 0,
                            "Player.deviceToken": 0,
                            "Player.cardDetails": 0
                        }
                    },
                    { $sort: { createdAt: -1 } }
                ])
                serviceBooking.serviceBooking.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
                    if (!err) {
                        const success = {
                            "docs": result,
                            "total": total,
                            "limit": option.limit,
                            "page": option.page,
                            "pages": pages,
                        }
                        if (success)
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_PLAYER, success)
                        else
                            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
                    }
                    else {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    }
                })
            }
        })
    }
}



//-------------List of Player Without pagination----------------------------
const getList = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizerId = success.employeerId
                else
                    req.body.organizerId = req.query.organizerId
                let query = {
                    organizerId: ObjectId(req.body.organizerId),
                    "booking": true,
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query = {
                        organizerId: ObjectId(req.body.organizerId),
                        "booking": true,
                        $or: [{ serviceName: { $regex: search, $options: 'i' } }, { membershipName: { $regex: search, $options: 'i' } }, { timeSlots: { $regex: search, $options: 'i' } }, { status: { $regex: search, $options: 'i' } }, { "Player.firstName": { $regex: search, $options: 'i' } }, { "Comp.division": { $regex: search, $options: 'i' } }, { "Player.email": { $regex: search, $options: 'i' } }]
                    }
                }
                if (req.body.serviceName)
                    query.serviceName = req.body.teamName
                if (req.body.status)
                    query["status"] = req.body.status
                if (req.body.membershipName)
                    query.membershipName = req.body.competitionName
                if (req.body.gender)
                    query["Player.gender"] = req.body.gender
                if (req.body.timeSlots)
                    query.timeSlots = { $in: req.body.timeSlots }
                console.log("query-->>", query)
                serviceBooking.serviceBooking.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    {
                        $lookup: {
                            from: "services",
                            localField: "serviceId",
                            foreignField: "_id",
                            as: "Service"
                        }
                    },
                    {
                        $lookup: {
                            from: "orgmemberships",
                            localField: "membershipId",
                            foreignField: "_id",
                            as: "Membership"
                        }
                    },
                    {
                        $unwind: "$Service"
                    },
                    { $unwind: "$Player" },
                    { $unwind: "$Membership" },
                    { $match: query },
                    {
                        $project: {
                            "Player.password": 0,
                            "Player.competitionNotify": 0,
                            "Player.membershipNotify": 0,
                            "Player.venueNotify": 0,
                            "Player.employeePermissionForCoordinator": 0,
                            "Player.employeePermissionForAdminstartor": 0,
                            "Player:organizerType": 0,
                            "Player.subscriptionAccess": 0,
                            "Player.organizerCompetition": 0,
                            "Player.organizerNotification": 0,
                            "Player.deviceToken": 0,
                            "Player.cardDetails": 0
                        }
                    },
                    { $sort: { createdAt: -1 } }
                ]).exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success.length)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PLAYER_DETAIL, success)
                })
            }
        })
    }
}


//--------Get Detail of Player (Membership)

const DetailOfPlayer = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.playerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PLAYER_IS_REQUIRED)
    else {
        userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizerId = success.employeerId
                else
                    req.body.organizerId = req.query.organizerId
                let query = {
                    organizerId: ObjectId(req.body.organizerId),
                    playerId: ObjectId(req.query.playerId)
                }
                serviceBooking.serviceBooking.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    {
                        $lookup: {
                            from: "services",
                            localField: "serviceId",
                            foreignField: "_id",
                            as: "Service"
                        }
                    },
                    {
                        $lookup: {
                            from: "orgmemberships",
                            localField: "membershipId",
                            foreignField: "_id",
                            as: "Membership"
                        }
                    },
                    {
                        $unwind: "$Service"
                    },
                    { $unwind: "$Player" },
                    { $unwind: "$Membership" },
                    { $match: query },
                    {
                        $project: {
                            "Player.password": 0,
                            "Player.competitionNotify": 0,
                            "Player.membershipNotify": 0,
                            "Player.venueNotify": 0,
                            "Player.employeePermissionForCoordinator": 0,
                            "Player.employeePermissionForAdminstartor": 0,
                            "Player:organizerType": 0,
                            "Player.subscriptionAccess": 0,
                            "Player.organizerCompetition": 0,
                            "Player.organizerNotification": 0,
                            "Player.deviceToken": 0,
                            "Player.cardDetails": 0
                        }
                    },
                ]).exec((err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success.length)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PLAYER_DETAIL, success)
                })
            }
        })

    }
}

module.exports = {
    tryyyy,
    selectCompition,
    selectVenue,
    createTeam,
    getDetailOfTeam,
    filterTeam,
    selectTeam,
    addPlayer,
    getListOfPlayer,
    getDetailOfPlayer,

    listOfTeam,
    listOfPlayer,


    addPlayerInMember,
    getServiceList,
    DetailOfPlayer,
    getList
}



















































