const mediaServices = require('../services/mediaApis');
const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const media = require("../../global_functions/uploadMedia");
const userServices = require('../services/userApis');
const each = require('async-each-series');
const Media = require("../../models/media");
const Competition = require("../../models/competition");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const teamServices = require('../services/teamApis');
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const message = require("../../global_functions/message");
const Follow = require("../../models/compFollowOrgPlay");
const User = require("../../models/user")
const accessPlanMedia = (req, res) => {
    subscriptionValidator(req.query, ["media"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else if (!req.query.userId) {
            return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_NOT_FOUND)
        }
        else {
            userServices.findUser({ _id: req.query.userId }, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
                else {
                    if (success.employeeRole == 'COORDINATOR') {
                        console.log("dhfgfgjjhg")
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success.employeePermissionForCoordinator.media)
                    }
                    else if (success.employeeRole == "ADMINSTRATOR") {
                        console.log("qqqqqqqq")
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success.employeePermissionForAdminstartor.media)
                    }
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, "ALL")
                }
            })
        }
    })
}
const createTry = (req, res) => {
    console.log("req.body--->>", req.body)
    subscriptionValidator(req.query, ["media"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            accessPlan(req.query, ["Create Album"], ["media"], (err, flag) => {
                if (flag[0] !== 200) {
                    return Response.sendResponse(res, flag[0], flag[1], flag[2]);
                }
                else {
                    console.log(flag[2])
                }
            })
        }
    })
}
//-------------------------Create Album Apis------------------------
const createAlbum = (req, res) => {
    console.log("req.body--->>", req.body, req.query)
    subscriptionValidator(req.query, ["media"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            if (!req.query.userId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
            else {
                req.body.organizer = req.query.userId
                userServices.findUser({ _id: req.query.userId }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
                    else {
                        let firstName = success.firstName
                        let lastName = success.lastName
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizer = success.employeerId
                        else
                            req.body.organizer = req.query.userId
                        console.log("fhfhhfhjg", req.body.organizer)
                        if (req.body.image) {
                            var imageArray = [], counter = 0;
                            each(req.body.image, (item, next) => {
                                counter++;
                                media.uploadMedia(item, (err, result) => {
                                    imageArray[imageArray.length] = { public_id: result.public_id, url: result.secure_url }
                                    if (err)
                                        console.log("wronggggggg")
                                    else if (req.body.image.length == counter) {
                                        console.log("hhjjjjh", imageArray)
                                        req.body.mediaUrls = imageArray
                                        mediaServices.addMedia(req.body, (err, success) => {
                                            if (err)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                            else {
                                                Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.MEDIA_CREATED, success)
                                                Follow.competitionFollow.find({ organizer: req.body.organizer, competitionId: req.body.competitionId }, { _id: 0, playerId: 1 }, { populate: { path: "playerId", model: User, select: { "email": 1, "competitionNotify": 1, _id: 1, mobileNumber: 1, countryCode: 1 } } }, (err, success) => {
                                                    console.log("success---->>>", success)
                                                    if (success) {
                                                        let arr = [], arrEmail = [], arrId = [], arrMobile = [];
                                                        for (let data in success) {
                                                            if ((success[data].playerId.competitionNotify.email).indexOf("media") != -1)
                                                                arrEmail.push(success[data].playerId.email)
                                                            if ((success[data].playerId.competitionNotify.mobile).indexOf("media") != -1)
                                                                arrMobile.push(success[data].playerId.countryCode + success[data].playerId.mobileNumber)
                                                            // arr.push(success[data].playerId.deviceToken)
                                                            arrId.push(success[data].playerId._id)
                                                        }
                                                        console.log("I am email mobile Id deviceToken", arrEmail, arrMobile, arrId, arr)
                                                        arr = ['ddMQdHYWfB4:APA91bHmiaJtIJAlonDRDEKSlZFi3-6tvvMJ9qRIs_IBRbZakJG1HUgmOZRkHQJ54uVwvcuPXhGHk-cc3AmZL0Cvnnklx5wC7-nQQXQtAiB5D5ttAOR-RkBZI6ZrjLeOD9uh6SttStoN2g2dmETfBpRqTpqUUhtXqQ']
                                                        message.sendMailToAll(arrEmail, "A new " + req.body.typeOfMedia + "is added by : " + firstName + " " + lastName, (err, success) => {
                                                            console.log(success)
                                                        }, req.body.organizer)
                                                        //message.sendSMSToAll(arrMobile, "A new " + req.body.typeOfMedia + "is added by :" + firstName + " " + lastName)
                                                        message.sendNotificationToAll("A new " + req.body.typeOfMedia + "is added by :" + firstName + " " + lastName, arr)
                                                        message.saveNotification(arrId, "A new " + req.body.typeOfMedia + "is added by : " + firstName + " " + lastName)
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        next();
                                    }
                                })
                            }, (finalResult) => {
                                console.log("ggggggg", finalResult)
                            })
                        }
                        else {
                            mediaServices.addMedia(req.body, (err, success) => {
                                if (err)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else
                                    Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.MEDIA_CREATED, success)
                                Follow.competitionFollow.find({ organizer: req.body.organizer, competitionId: req.body.competitionId }, { _id: 0, playerId: 1 }, { populate: { path: "playerId", model: User, select: { "email": 1, "competitionNotify": 1, _id: 1, countryCode: 1, mobileNumber: 1 } } }, (err, success) => {
                                    console.log("success---->>>", success)
                                    if (success) {
                                        let arr = [], arrEmail = [], arrId = [], arrMobile = [];
                                        for (let data in success) {
                                            if ((success[data].playerId.competitionNotify.email).indexOf("media") != -1)
                                                arrEmail.push(success[data].playerId.email)
                                            if ((success[data].playerId.competitionNotify.mobile).indexOf("media") != -1)
                                                arrMobile.push(success[data].playerId.countryCode + success[data].playerId.mobileNumber)
                                            // arr.push(success[data].playerId.deviceToken)
                                            arrId.push(success[data].playerId._id)
                                        }
                                        console.log("I am email mobile Id deviceToken", arrEmail, arrMobile, arrId, arr)
                                        arr = ['ddMQdHYWfB4:APA91bHmiaJtIJAlonDRDEKSlZFi3-6tvvMJ9qRIs_IBRbZakJG1HUgmOZRkHQJ54uVwvcuPXhGHk-cc3AmZL0Cvnnklx5wC7-nQQXQtAiB5D5ttAOR-RkBZI6ZrjLeOD9uh6SttStoN2g2dmETfBpRqTpqUUhtXqQ']
                                        message.sendMailToAll(arrEmail, "A new " + req.body.typeOfMedia + "is added by : " + firstName + " " + lastName, (err, success) => {
                                            console.log(success)
                                        }, req.body.organizer)
                                        //message.sendSmsToAll(arrMobile, "A new " + req.body.typeOfMedia + "is added by :" + firstName + " " + lastName)
                                        message.sendNotificationToAll("A new " + req.body.typeOfMedia + "is added by : " + firstName + " " + lastName, arr)
                                        message.saveNotification(arrId, "A new " + req.body.typeOfMedia + "is added by : " + firstName + " " + lastName)
                                    }
                                })
                            })
                        }
                    }
                })
            }
        }
    })
}

//--------------------Edit media------------------------------
const editMedia = (req, res) => {
    console.log("req.body--->>", req.body, req.query)
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_IS_REQUIRED)
    else {
        req.body.organizer = req.query.userId
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.query.organizer = success.employeerId
                else
                    req.query.organizer = req.query.userId
                if (req.body.image) {
                    var imageArray = [], counter = 0;
                    each(req.body.image, (item, next) => {
                        counter++;
                        media.uploadMedia(item, (err, result) => {
                            imageArray[imageArray.length] = { public_id: result.public_id, url: result.secure_url }
                            if (err)
                                console.log("wronggggggg")
                            else if (req.body.image.length == counter) {
                                console.log("hhjjjjh", imageArray)
                                let set = {
                                    title: req.body.title,
                                    description: req.body.description,
                                    competitionName: req.body.competitionName,
                                    competitionId: req.body.competitionId,
                                    $push: { mediaUrls: imageArray }
                                }
                                mediaServices.updateMedia({ organizer: req.query.organizer, _id: req.query.mediaId }, set, { new: true }, (err, success) => {
                                    if (err)
                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                    else
                                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.MEDIA_UPDATED, success)
                                })
                            } else {
                                next();
                            }
                        })
                    }, (finalResult) => {
                        console.log(finalResult)
                    })
                }
                else {
                    mediaServices.updateMedia({ organizer: req.query.organizer, _id: req.query.mediaId }, req.body, { new: true }, (err, success) => {
                        if (err)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                        else
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.MEDIA_UPDATED, success)
                    })
                }
            }
        })
    }
}
//----------------------------Get List of Media for organizer-------------------------------------------
const getListOfMedia = (req, res) => {
    subscriptionValidator(req.query, ["media"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            if (!req.query.userId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
            else {
                userServices.findUser({ _id: req.query.userId }, (err, successs) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!successs)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        if (successs.employeeRole == 'COORDINATOR' || successs.employeeRole == "ADMINSTRATOR")
                            req.query.userId = successs.employeerId
                        let option = {
                            page: req.body.page || 1,
                            limit: req.body.limit || 5,
                            sort: { createdAt: -1 },
                            populate: { path: "competitionId", model: Competition.competition, select: 'imageURL' },
                            lean: true
                        }
                        mediaServices.getListOfMedia({ organizer: req.query.userId }, option, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (!success.docs.length)
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.MEDIA_NOT_FOUND)
                            else {
                                for (i = 0; i < success.docs.length; i++) {
                                    // console.log(((success.docs[1].like).toString())+" "+((success.docs[i].like).toString()).indexOf(req.query.userId))
                                    if (((success.docs[i].like).toString()).indexOf(successs._id) != -1) {
                                        success.docs[i].likeStatus = "True"
                                    }
                                    else {
                                        success.docs[i].likeStatus = "False"
                                    }
                                }
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_MEDIA, success)
                            }
                        })
                    }
                })
            }
        }
    })
}
//------------------------------Get list of media for Player---------------------------------------------
const getListOfMediaPlayer = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PLAYER_IS_REQUIRED)
    else {
        let query = {
            playerId: req.query.userId,
            "followStatus": "APPROVED"
        }
        let select = {
            _id: 0,
            competitionId: 1, lean: true
        }
        teamServices.followStatus(query, select, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success.length)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.MEDIA_NOT_FOUND)
            else {
                let query = { $or: success }
                console.log(query)
                let option = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 5,
                    sort: { createdAt: -1 },
                    populate: { path: "competitionId", model: Competition.competition, select: 'imageURL' },
                    lean: true
                }
                mediaServices.getListOfMedia(query, option, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success.docs.length)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.MEDIA_NOT_FOUND)
                    else {
                        for (i = 0; i < success.docs.length; i++) {
                            //console.log(((success.docs[1].like).toString())+" "+((success.docs[i].like).toString()).indexOf(req.query.userId))
                            console.log(((success.docs[i].like).toString()).indexOf(req.query.userId))
                            if (((success.docs[i].like).toString()).indexOf(req.query.userId) != -1) {
                                success.docs[i].likeStatus = "True"
                            }
                            else {
                                success.docs[i].likeStatus = "False"
                            }
                        }
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_MEDIA, success)
                    }
                })
            }
        })
    }
}
//-------------------------------Media List for competition--------------------------
const mediaList = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PLAYER_IS_REQUIRED)
    else {
        let query = {
            playerId: req.query.userId,
            "followStatus": "APPROVED"
        }
        teamServices.follow(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
            else {
                let query = {
                    competitionId: req.query.competitionId
                }
                if (req.body.typeOfMedia)
                    query.typeOfMedia = req.body.typeOfMedia
                console.log(query)
                let option = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 5,
                    sort: { createdAt: -1 },
                    populate: { path: "competitionId", model: Competition.competition, select: 'imageURL' },
                    lean: true
                }
                mediaServices.getListOfMedia(query, option, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success.docs.length)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.MEDIA_NOT_FOUND)
                    else {
                        for (i = 0; i < success.docs.length; i++) {
                            console.log(((success.docs[i].like).toString()).indexOf(req.query.userId))
                            if (((success.docs[i].like).toString()).indexOf(req.query.userId) != -1) {
                                success.docs[i].likeStatus = "True"
                            }
                            else {
                                success.docs[i].likeStatus = "False"
                            }
                        }
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_MEDIA, success)
                    }
                })
            }
        })
    }
}
//------------------------------------------Get Detail of Media-------------------------------------------
const getDetailofMedia = (req, res) => {
    console.log("ad", req.query)
    if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_IS_REQUIERED)
    else {
        let query = {
            _id: req.query.mediaId
        }
        mediaServices.findMedia(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.MEDIA_NOT_FOUND)
            else {
                console.log("dsfnmdm", (success.like).toString().indexOf(req.query.userId))
                if ((success.like).toString().indexOf(req.query.userId) != -1)
                    success.likeStatus = "True"
                else
                    success.likeStatus = "False"
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.DETAIL_MEDIA, success)
            }
        })
    }
}
//------------------------------Like Media---------------------------------------------
const likeMedia = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_IS_REQUIERED)
    else {
        mediaServices.findMedia({ _id: req.query.mediaId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.MEDIA_NOT_FOUND)
            else {
                let query = {
                    "_id": success._id,
                    "like": req.query.userId
                }
                mediaServices.findMedia(query, (err, success1) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (success1) {
                        console.log(success.like.length)
                        let set = {
                            $pull: { like: req.query.userId },
                            noOfLike: success.like.length - 1,
                        }
                        let option = {
                            new: true
                        }
                        mediaServices.updateMedia({ _id: req.query.mediaId }, set, option, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else
                                return Response.sendResponse(res, responseCode.ALREADY_EXIST, responseMsg.MEDIA_UNLIKE)
                        })
                    }
                    else {
                        let set = {
                            $push: { like: req.query.userId },
                            noOfLike: success.like.length + 1
                        }
                        let option = {
                            new: true
                        }
                        mediaServices.updateMedia({ _id: req.query.mediaId }, set, option, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.MEDIA_LIKE)
                        })
                    }
                })
            }
        })
    }
}
//------------------------------comment Media------------------------------
const commentMedia = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_IS_REQUIERED)
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                console.log("gdghghfghdghfhgh", success)
                mediaServices.findMedia({ _id: req.query.mediaId }, (err, success1) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        console.log("bfndnfndsn", success1.competitionId._id)
                        mediaServices.findCommentStatus({ _id: success1.competitionId._id }, (err, success2) => {
                            if (err || !success2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else {

                                console.log(success2.allowComment)
                                if (success2.allowComment) {

                                    if (success.image) {
                                        let comment = {
                                            commentId: req.query.userId,
                                            text: req.body.text,
                                            commentImage: success.image,
                                            commentFirstName: success.firstName,
                                            commentLastName: success.lastName
                                        }
                                        let set = {
                                            $push: { comments: comment },
                                            noOfComment: success1.noOfComment + 1
                                        }
                                        let option = {
                                            new: true
                                        }
                                        mediaServices.updateMedia({ _id: req.query.mediaId }, set, option, (err, success) => {
                                            if (err)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                            else
                                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.COMMENT_ADDED, success)
                                        })
                                    }
                                    else {
                                        let comment = {
                                            commentId: req.query.userId,
                                            text: req.body.text,
                                            commentFirstName: success.firstName,
                                            commentLastName: success.lastName
                                        }
                                        let set = {
                                            $push: { comments: comment },
                                            noOfComment: success1.noOfComment + 1
                                        }
                                        let option = {
                                            new: true
                                        }
                                        mediaServices.updateMedia({ _id: req.query.mediaId }, set, option, (err, success) => {
                                            if (err)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                            else
                                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.COMMENT_ADDED, success)
                                        })
                                    }
                                }
                                else {
                                    console.log("fjjfjefjk")
                                    return Response.sendResponse(res, responseCode.FORBIDDEN, responseMsg.COMMENT_DISABLE)
                                }
                            }
                        })
                    }
                })
            }
        })
    }
}
//-----------------------------------Get Comment--------------------------
const getCommnet = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_IS_REQUIERED)
    else {
        mediaServices.findMedia({ _id: req.query.mediaId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.COMMENT_LIST, success.comments)
        })
    }
}
//------------------Delete particular image of media-------------------------------------
const deleteMedia = (req, res) => {
    if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_IS_REQUIERED)
    else if (!req.query.imageId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.IMAGE_IS_REQUIERED)
    else {
        mediaServices.findMediaUrl({ _id: req.query.mediaId, "mediaUrls._id": req.query.imageId }, { 'mediaUrls.$._id': 1 }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.MEDIA_NOT_FOUND);
            else {
                console.log(success.mediaUrls[0])
                mediaServices.updateMedia({ _id: req.query.mediaId, "mediaUrls._id": req.query.imageId }, { $pull: { mediaUrls: { _id: req.query.imageId } } }, { new: true }, (err, success1) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else {
                        message.deleteUploadedFile(success.mediaUrls[0].public_id, (err, success2) => {
                            console.log(success2.result)
                        });
                        return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.MEDIA_DELETED, success1);
                    }
                })
            }
        })
    }
}
//-------------------Edit News------------------
const editMediaNews = (req, res) => {
    if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_NOT_FOUND)
    else {
        mediaServices.findMedia({ _id: req.query.mediaId, typeOfMedia: "NEWS", }, (err, success1) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                message.editUploadedFile(req.body.mediaUrls[0].url, req.body.mediaUrls[0].public_id, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.EDITING_NOT_SUCCESS)
                    else {
                        console.log("urlllll--->>>", success1.mediaUrls[0]._id)
                        req.body.mediaUrls = { _id: req.body.mediaUrls[0]._id, public_id: success.public_id, url: success.secure_url }
                        mediaServices.updateMedia({ _id: req.query.mediaId }, req.body, { new: true }, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (!success)
                                return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.EDITING_NOT_SUCCESS, err)
                            else
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.MEDIA_UPDATED, success)
                        })
                    }
                })
            }
        })
    }
}
//------------------------------Delete Media----------------------------
const mediaDelete = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.mediaId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.MEDIA_IS_REQUIERED)
    else {
        let query = {
            _id: req.query.mediaId,
            organizer: req.query.userId
        }
        mediaServices.deleteMedia(query, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.mediaUrls) {
                    console.log(success.mediaUrls)
                }
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.MEDIA_DELETED)
            }
        })
    }
}
module.exports = {
    accessPlanMedia,
    createTry,
    createAlbum,
    getListOfMedia,
    getDetailofMedia,
    likeMedia,
    getListOfMediaPlayer,
    commentMedia,
    getCommnet,
    mediaList,
    editMedia,
    deleteMedia,
    editMediaNews,
    mediaDelete
}


