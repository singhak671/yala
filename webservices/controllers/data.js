const dataServices = require('../services/dataApis');
const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices = require('../services/userApis');
const media = require("../../global_functions/uploadMedia");
const Validator = require('../../middlewares/validation').validate_all_request;
//const Notification = require("../../global_functions/notification")
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const message = require("../../global_functions/message");
const Data = require("../../models/data")
const Follow = require("../../models/compFollowOrgPlay");
const Membership = require("../../models/orgMembership");
const serviceBooking = require("../../models/serviceBooking");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var multiparty = require('multiparty');
var _ = require('underscore');
const tryyyy = (req, res) => {
    // deviceToken=['ddMQdHYWfB4:APA91bHmiaJtIJAlonDRDEKSlZFi3-6tvvMJ9qRIs_IBRbZakJG1HUgmOZRkHQJ54uVwvcuPXhGHk-cc3AmZL0Cvnnklx5wC7-nQQXQtAiB5D5ttAOR-RkBZI6ZrjLeOD9uh6SttStoN2g2dmETfBpRqTpqUUhtXqQ']
    // notify={
    //     title: 'YALA App',
    // 		body: 'Media is added !'
    // }
    // message.sendNotificationToAll('Media is added !',deviceToken)
    // ,(err,success)=>{
    // if(err)
    // return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
    // else
    // return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.EVERYTHING_IS_OK,success)
    // })
    //     var mailList=["shrivastavaankita21sept@gmail.com","anny71014.shrivastava@gmail.com","anny71014.shrivastav@gmail.com"]
    //    message.sendMailToAll(mailList,"hIIIII",(err,success)=>{
    //        console.log(success)
    //    },"5b55721fd6e47a46a4516f87")
    message.getPrivateKey((req.query.userId), (err, success) => {
        if (success) {
            console.log("success--->>", success)
        }
    })
}
const accessPlanData = (req, res) => {
    subscriptionValidator(req.query, ["data"], (err, flag) => {
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
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success.employeePermissionForCoordinator.dataBase)
                    }
                    else if (success.employeeRole == "ADMINSTRATOR") {
                        console.log("qqqqqqqq")
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success.employeePermissionForAdminstartor.dataBase)
                    }
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, "ALL")
                }
            })
        }
    })
}
//====================================Club Apis(Membership & Competititon)=====================================
//--------------------------Add Club---------------------------------------------------------
const addClub = (req, res) => {
    console.log("req.body------>>>>", req.body)
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    // else if(!req.body)
    // return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PROVIDE_DATA)
    else {
        let query = {
            _id: req.query.userId,
            role: "ORGANIZER"
        }
        userServices.findUser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    $and: [{ clubName: req.body.clubName }, { userId: req.query.userId }]
                }
                dataServices.findClub(query, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (success)
                        return Response.sendResponse(res, responseCode.ALREADY_EXIST, responseMsg.CLUB_EXISTS)
                    else {

                        if (req.body.image) {
                            media.uploadImg(req.body.image, (err, success) => {
                                if (err) {
                                    return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR, err)
                                }
                                else {
                                    console.log("image.url---->>", success)
                                    req.body.image = success
                                    dataServices.addClub(req.body, (err, success) => {
                                        if (err)
                                            Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                        else
                                            Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.CLUB_ADDED, success)
                                    })
                                }
                            })
                        }
                        else {
                            req.body.image = req.body.imageURL
                            console.log("HDSFGJJFDG", req.body)
                            dataServices.addClub(req.body, (err, success) => {
                                if (err)
                                    Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else
                                    Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.CLUB_ADDED, success)
                            })
                        }
                    }
                })
            }
        })
    }
}
//--------------------------Get Detail of Club-------------------------------------------------------
const getListOfClub = (req, res) => {
    console.log(req.body)
    if (!req.query.userId) {
        Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.query.userId = success.employeerId
                let query = {
                    userId: req.query.userId
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query.$or = [
                        { clubName: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { headquaters: { $regex: search, $options: 'i' } },
                        { status: { $regex: search, $options: 'i' } }
                    ]
                }
                console.log("query--->>", query)
                let options = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 4,
                    sort: { createdAt: -1 }
                }
                dataServices.getListOfClub(query, options, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    //   else if(!success)
                    //   return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
                    else return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.CLUB_LIST, success)

                })
            }
        })
    }
}
//----------List of Club without pagination-----
const listOfClub = (req, res) => {
    console.log(req.body)
    if (!req.query.userId) {
        Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.query.userId = success.employeerId
                let query = {
                    userId: req.query.userId
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query.$or = [
                        { clubName: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { headquaters: { $regex: search, $options: 'i' } },
                        { status: { $regex: search, $options: 'i' } }
                    ]
                }
                console.log("query--->>", query)

                Data.club.find(query, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CLUB_NOT_FOUND)
                    else return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.CLUB_LIST, success)

                })
            }
        })
    }
}
//-------------------------------Find Club------------------------------------------------------
const findClub = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.clubId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.CLUB_IS_REQ)
    else {
        let query = {
            _id: req.query.clubId,
        }
        dataServices.findClub(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CLUB_NOT_FOUND)
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.CLUB_DETAILS, success)
        })
    }
}
//---------------------------Edit Club-------------------------------------------------------
const editClub = (req, res) => {
    console.log("req.body--->>", req.body)
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.clubId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.CLUB_IS_REQ)
    else {
        let query = {
            _id: req.query.clubId
        }
        dataServices.findClub(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CLUB_NOT_FOUND)
            else {
                if (req.body.image) {
                    media.uploadImg(req.body.image, (err, success) => {
                        if (err) {
                            return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                        }
                        else {
                            console.log("image.url", success)
                            req.body.image = success
                            let query = {
                                _id: req.query.clubId
                            }
                            let options = {
                                new: true
                            }
                            dataServices.editClub(query, req.body, options, (err, success) => {
                                if (err)
                                    Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else if (!success)
                                    return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.NOT_MODIFIED)
                                else
                                    Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.CLUB_UPDATE, success)

                            })
                        }
                    })
                }
                else {
                    req.body.image = req.body.imageURL
                    let query = {
                        _id: req.query.clubId
                    }
                    let options = {
                        new: true
                    }
                    dataServices.editClub(query, req.body, options, (err, success) => {
                        if (err)
                            Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                        else if (!success)
                            return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.NOT_MODIFIED)
                        else
                            Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.CLUB_UPDATE, success)

                    })
                }
            }
        })
    }
}
//-----------------------Delete Club----------------------------------------------------------
const deleteClub = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.clubId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.CLUB_IS_REQ)
    else {
        let query = {
            _id: req.query.clubId
        }
        dataServices.deleteClub(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CLUB_NOT_FOUND)
            else {
                let query = {
                    "club.clubId": req.query.clubId,
                }
                dataServices.deleteVenue(query, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else
                        return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.CLUB_DELETE)
                })

            }
        })
    }
}

//---------------------------Select club-----------------------
const selectClub = (req, res) => {
    if (!req.query.userId) {
        return Reponse.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_NOT_FOUND)
    }
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    userId: req.body.userId
                }
                select = {


                }
                dataServices.selectClub(query, select, (err, success) => {
                    if (err) {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    }
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CLUB_NOT_FOUND)
                    else {
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.CLUB_LIST, success)
                    }
                })
            }
        })
    }
}
//====================================Sponsors Apis(Membership & Competititon)=====================================
//--------------------------Add Sponsers-------------------------------------------------------
const addSponsors = (req, res) => {
    console.log("req.body--->>", req.body)
    if (!req.query.userId) {
        Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if (!req.body.sponsorName || !req.body.link || !req.body.description)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PROVIDE_DATA)
    else {
        query = {
            _id: req.query.userId
        }
        userServices.findUser(query, (err, success) => {
            if (err) {
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            }
            else if (!success) {
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            }
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    $and: [{ userId: req.body.userId }, { sponsorName: req.body.sponsorName }]
                }
                dataServices.findSponser(query, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
                    else if (success)
                        return Response.sendResponse(res, responseCode.ALREADY_EXIST, responseMsg.SPONSER_EXISTS)
                    else {
                        if (req.body.image) {

                            media.uploadImg(req.body.image, (err, success) => {
                                if (err) {
                                    return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                                }
                                else {
                                    console.log("image.url", success)
                                    req.body.image = success
                                    dataServices.addSponsers(req.body, (err, success) => {
                                        if (err)
                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
                                        else
                                            return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.SPONSERS_ADDED, success)
                                    })
                                }
                            })

                        }
                        else {
                            if (req.body.imageURL)
                                req.body.image = req.body.imageURL
                            console.log("HDSFGJJFDG", req.body)
                            dataServices.addSponsers(req.body, (err, success) => {
                                if (err)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
                                else
                                    return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.SPONSERS_ADDED, success)
                            })

                        }
                    }
                })

            }
        })
    }
}
//--------------Get List of Sponser-----------------------------
const getListOfSponsor = (req, res) => {
    console.log("req.body---->>", req.body)
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else {
        let query = {
            _id: req.query.userId
        }
        userServices.findUser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    userId: req.body.userId
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query.$or = [
                        { sponsorName: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                        { link: { $regex: search, $options: 'i' } },
                        { status: { $regex: search, $options: 'i' } },
                        { $where: `/^${req.body.search}.*/.test(this.position)` },
                        { "visibleIn.competitionName": { $regex: search, $options: 'i' } },
                        { "visibleIn.membershipName": { $regex: search, $options: 'i' } }
                    ]
                }
                console.log("query--->>", query)
                let options = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 4,
                    sort: { createdAt: -1 }
                }
                dataServices.getListOfSponser(query, options, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.SPONSER_NOT_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_SPONSERS, success)
                })
            }
        })
    }
}
// ------------------------- Get Edit Sponsers------------------------------------------------
const getEditDetailOfSponsor = (req, res) => {

    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.sponsorId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.SPONSER_IS_REQUIRED)
    else {
        let query = {
            _id: req.query.sponsorId
        }
        dataServices.findSponser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.SPONSER_NOT_FOUND)
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.DETAIL_OF_SPONSER, success)
        })
    }
}
//------------------------Edit Sponsers----------------------------------
const editSponsor = (req, res) => {
    console.log("req.query--->>", req.query)
    console.log("req.body---->>", req.body)
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.sponsorId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.SPONSER_IS_REQUIRED)
    else {
        let query = {
            _id: req.query.sponsorId
        }
        dataServices.findSponser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.SPONSER_NOT_FOUND)
            else if (req.body.image) {
                media.uploadImg(req.body.image, (err, success) => {
                    if (err) {
                        return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                    }
                    else {
                        console.log("image.url", success)
                        req.body.image = success
                        let query = {
                            _id: req.query.sponsorId,
                        }
                        let options = {
                            new: true
                        }
                        dataServices.editSponser(query, req.body, options, (err, success) => {
                            if (err)
                                Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (!success)
                                Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.SPONSER_NOT_FOUND)
                            else
                                Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SPONSER_UPDATE, success)

                        })
                    }
                })

            }
            else {
                req.body.image = req.body.imageURL
                let query = {
                    _id: req.query.sponsorId
                }
                let options = {
                    new: true
                }
                dataServices.editSponser(query, req.body, options, (err, success) => {
                    if (err)
                        Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.SPONSER_NOT_FOUND)
                    else
                        Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SPONSER_UPDATE, success)

                })
            }

        })
    }
}
//------------------Delete Sponser---------------------------------
const deleteSponsor = (req, res) => {
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if (!req.query.sponsorId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.SPONSER_IS_REQUIRED)
    else {
        let query = {
            _id: req.query.sponsorId
        }
        dataServices.deleteSponser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.SPONSER_NOT_FOUND)
            else
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.SPONSER_DELETE)
        })

    }

}

//====================================Venue Apis(Membership & Competititon)=====================================
//------------------------------Add Venue----------------------------------
const addVenue = (req, res) => {
    console.log("req.body------>>>>", req.body)
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.body)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PROVIDE_DATA)
    else {
        let query = {
            _id: req.query.userId,

        }
        userServices.findUser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    $and: [{ venue: req.body.venue }, { userId: req.body.userId }]
                }
                dataServices.findVenue(query, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (success)
                        return Response.sendResponse(res, responseCode.ALREADY_EXIST, responseMsg.VENUE_EXISTS)
                    else {
                        let query = {
                            clubName: req.body.club
                        }
                        dataServices.findClub(query, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            if (!success)
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CLUB_NOT_FOUND);
                            else
                                req.body.club = {
                                    clubName: success.clubName,
                                    clubId: success._id
                                }
                            dataServices.addVenue(req.body, (err, success) => {
                                if (err)
                                    Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else
                                    Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.VENUE_ADDED, success)
                            })
                        })

                    }

                })
            }
        })
    }
}
//-------------------------------------get List of Venue--------------------------------------------
const getListOfVenue = (req, res) => {
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else {
        let query = {
            _id: req.query.userId
        }
        userServices.findUser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(re, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    userId: req.body.userId
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query.$or = [
                        { venue: { $regex: search, $options: 'i' } },
                        { status: { $regex: search, $options: 'i' } },
                        { "club.clubName": { $regex: search, $options: 'i' } }
                    ]
                }
                console.log("query--->>", query)
                let options = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 4,
                    sort: { createdAt: -1 }
                }
                dataServices.getListOfVenue(query, options, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.VENUE_NOT_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_VENUE, success)
                })
            }
        })
    }
}
//------------------------------------------Get Detail of One Venue---------------------------------------------------------------------
const getEditDetailOfVenue = (req, res) => {
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if (!req.query.venueId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.VENUE_NOT_FOUND)
    else {
        let query = {
            _id: req.query.venueId
        }
        dataServices.findVenue(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.VENUE_NOT_FOUND)
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.VENUE_DETAIL, success)
        })
    }
}
//-----------------------------------Edit Venue------------------------------------------------------------------
const editVenue = (req, res) => {
    console.log("req.body--->>", req.body)
    console.log("req.query", req.query)
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if (!req.query.venueId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.VENUE_NOT_FOUND)
    else {
        let query = {
            _id: req.query.venueId,
        }
        dataServices.findVenue(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.VENUE_NOT_FOUND)
            else {
                let query = {
                    clubName: req.body.club
                }
                dataServices.findClub(query, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CLUB_NOT_FOUND)
                    else
                        req.body.club = {
                            clubName: success.clubName,
                            clubId: success._id
                        }
                    let query = {
                        _id: req.query.venueId,
                    }
                    dataServices.updateVenue(query, req.body, { new: true }, (err, success) => {
                        if (err)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                        else
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.VENUE_UPDATE, success)
                    })
                })
            }
        })
    }
}
//-----------------------------------------Delete Venue-----------------------------
const deleteVenue = (req, res) => {
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if (!req.query.venueId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.VENUE_NOT_FOUND)
    else {
        let query = {
            _id: req.query.venueId
        }
        dataServices.deleteVenue(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.VENUE_NOT_FOUND)
            else
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.VENUE_DELETE)
        })
    }
}

//-----------------------------Add Refree-------------------------------------------------------
const addReferee = (req, res) => {
    console.log("req.body----->>", req.body)
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        let query = {
            _id: req.query.userId
        }
        userServices.findUser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    $and: [{ userId: req.body.userId }, { email: req.body.email }]
                }
                dataServices.findRefree(query, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
                    else if (success)
                        return Response.sendResponse(res, responseCode.ALREADY_EXIST, responseMsg.REFREE_EXISTS)
                    else {
                        if (req.body.image) {
                            media.uploadImg(req.body.image, (err, success) => {
                                if (err) {
                                    return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR, err)
                                }
                                else {
                                    console.log("image.url", success)
                                    req.body.image = success
                                    dataServices.addRefree(req.body, (err, success) => {
                                        if (err)
                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                        else
                                            Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.REFREE_ADDED, success)
                                    })
                                }
                            })
                        }
                        else {
                            req.body.image = req.body.imageURL
                            console.log("HDSFGJJFDG", req.body)
                            dataServices.addRefree(req.body, (err, success) => {
                                if (err)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
                                else
                                    Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.REFREE_ADDED, success)
                            })
                        }

                    }
                })
            }
        })
    }
}
//--------------------------------------Get List of Referee------------------------------------------
const getListOfReferee = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        let query = {
            _id: req.query.userId
        }
        userServices.findUser(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(re, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.userId = success.employeerId
                else
                    req.body.userId = req.query.userId
                let query = {
                    userId: req.body.userId
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { mobileNumber: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { dob: { $regex: search, $options: 'i' } },
                        { gender: { $regex: search, $options: 'i' } },
                        { activities: { $regex: search, $options: 'i' } },
                    ]
                }
                console.log("query--->>", query)
                let options = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 4,
                    sort: { createdAt: -1 }
                }
                dataServices.getListOfRefree(query, options, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.REFREE_NOT_FOUND)
                    else
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.REFREE_LIST, success)
                })
            }
        })
    }
}
//-------------------------------------Get Detail of Referee-------------------------------------
const getEditDetailOfReferee = (req, res) => {
    if (!req.query.userId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if (!req.query.refereeId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REFREE_NOT_FOUND)
    else {
        let query = {
            _id: req.query.refereeId
        }
        dataServices.findRefree(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.REFREE_NOT_FOUND)
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.REFREE_DETAIL, success)
        })
    }
}
//--------------------------------Edit Referee-----------------------------------------------------
const editReferee = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.refereeId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REFREE_IS_REQUIRED)
    else {
        let query = {
            _id: req.query.refereeId
        }
        dataServices.findRefree(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.REFREE_NOT_FOUND)
            else {
                if (req.body.image) {
                    media.uploadImg(req.body.image, (err, success) => {
                        if (err) {
                            return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                        }
                        else {
                            console.log("image.url", success)
                            req.body.image = success
                            let query = {
                                _id: req.query.refereeId
                            }
                            dataServices.updateRefree(query, req.body, { new: true }, (err, success) => {
                                if (err)
                                    Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else
                                    Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.REFREE_UPDATE, success)
                            })
                        }
                    })
                }
                else {
                    req.body.image = req.body.imageURL
                    let query = {
                        _id: req.query.refereeId
                    }
                    dataServices.updateRefree(query, req.body, { new: true }, (err, success) => {
                        if (err)
                            Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                        else
                            Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.REFREE_UPDATE, success)
                    })
                }
            }
        })
    }
}
//-------------------------------Delete Referee------------------------------------
const deleteReferee = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.query.refereeId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REFREE_IS_REQUIRED)
    else {
        let query = {
            _id: req.query.refereeId
        }
        dataServices.deleteRefree(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.REFREE_DELETE)
        })
    }
}


//======================NEWSLETTER SECTION=============
const newsletterPlayerList = (req, res) => {
    if (!req.query.organizerId) {
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    }
    else {
        userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
            if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                req.body.organizerId = success.employeerId
            else
                req.body.organizerId = req.query.organizerId
            let query = {
                organizer: ObjectId(req.body.organizerId),
                registration: true,
                "newsLetterVisible": true
            }
            let query1 = {
                organizerId: ObjectId(req.body.organizerId),
                booking: true,
                "newsLetterVisible": true
            }
            if (req.body.competitionId) {
                query.competitionId = ObjectId(req.body.competitionId),
                    query1.membershipId = null
            }
            if (req.body.membershipId) {
                query1.membershipId = ObjectId(req.body.membershipId)
                query.competitionId = null
            }
            if (req.body.competitionId && req.body.membershipId) {
                query1.membershipId = ObjectId(req.body.membershipId)
                query.competitionId = ObjectId(req.body.competitionId)
            }
            if (req.body.startDate && !req.body.endDate) {
                query["Player.dob"] = { $gte: req.body.startDate }
                query1["Player.dob"] = { $gte: req.body.startDate }
            }
            if (req.body.endDate && !req.body.startDate) {
                query["Player.dob"] = { $lte: req.body.endDate }
                query1["Player.dob"] = { $lte: req.body.endDate }
            }
            if (req.body.startDate && req.body.endDate) {
                query["Player.dob"] = { $gte: req.body.startDate, $lte: req.body.endDate }
                query1["Player.dob"] = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            let search = new RegExp("^" + req.body.search)
            console.log("query----->>", query, query1)
            let masterQuery = [
                {
                    $lookup: {
                        from: "users",
                        localField: "playerId",
                        foreignField: "_id",
                        as: "Player"
                    }
                },
                {
                    $match: query
                },
                {
                    $project: {
                        "Player.email": 1, "Player.dob": 1, "Player._id": 1
                    }
                },
                {
                    $unwind: "$Player"
                },
                {
                    $match: { "Player.email": { $regex: search, $options: "i" } }
                },
                {
                    $group: { _id: { email: "$Player.email", dob: "$Player.dob", _id: "$Player._id" } }
                }

            ]

            Follow.competitionFollow.aggregate(masterQuery, (err, success1) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                else {
                    masterQuery[1].$match = query1
                    serviceBooking.serviceBooking.aggregate(masterQuery, (err, success2) => {
                        if (err)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                        else {
                            var finalArray = []
                            success1.push.apply(success1, success2);
                            console.log("successssss", success1)
                            var finalArray = _.uniq(success1, function (p) { return p._id.email; });
                            let page = req.body.page || 1, limit = req.body.limit || 4
                            var data = finalArray.slice((page - 1) * limit, page * limit)
                            let itemList = {
                                docs: data,
                                page: page,
                                total: finalArray.length,
                                limit: limit,
                                pages: Math.ceil(finalArray.length / limit)
                            }

                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "List of player", itemList)
                        }

                    })
                }
            })
        })
    }
}

//Remove player Form list 
const removePlayerFromList = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.playerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PLAYER_IS_REQUIRED)
    else {
        let set = {
            newsLetterVisible: false
        }
        Follow.competitionFollow.update({ playerId: req.query.playerId, organizer: req.query.organizerId, newsLetterVisible: true }, set, { new: true, multi: true }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                serviceBooking.serviceBooking.update({ playerId: req.query.playerId, organizerId: req.query.organizerId }, set, { new: true, multi: true }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else
                        return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Player deleted successfully")
                })
            }
        })
    }
}

//Send Mail to all Player,single Player,Selected Player

const sendMailToAll = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            console.log("files=======>>>>", files)
            console.log("fields=======>>>>", fields)
            let attachement = [
                {
                    filename: files.attachement[0].originalFilename,
                    path: files.attachement[0].path,
                    contentType: 'application/pdf'
                }]
            message.sendMailToAll(fields.mailList, "Please find the below attachement", (err, success) => {
                if (success)
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Mail sent successfully")
                else
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            }, "", attachement)
        });
    }
}


module.exports = {
    accessPlanData,
    tryyyy,
    addClub,
    getListOfClub,
    findClub,
    editClub,
    deleteClub,
    addSponsors,
    getListOfSponsor,
    getEditDetailOfSponsor,
    editSponsor,
    deleteSponsor,
    selectClub,
    addVenue,
    getListOfVenue,
    getEditDetailOfVenue,
    editVenue,
    deleteVenue,
    addReferee,
    getListOfReferee,
    getEditDetailOfReferee,
    editReferee,
    deleteReferee,

    listOfClub,



    newsletterPlayerList,
    removePlayerFromList,
    sendMailToAll
}
