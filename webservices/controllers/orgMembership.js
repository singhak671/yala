//****************************************** validation wale file me ek correction h userId and organizerId k lye  */////////////////
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
const serviceBooking = require("../../models/serviceBooking");
var json2html = require('node-json2html');
var fs = require('fs');
var pdf = require('html-pdf');
var options = { format: 'Letter' };


//==================================================ADD MEMBERSHIP===========================================//
const addMembership = (req, res) => {
    var s;
    let flag = Validator(req.body, [], [], ["organizerId", "membershipName", "clubName", "clubId", "status", "allowPublicToFollow", "imageURL"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {

        subscriptionValidator(req.body, ["Membership"], (err, flag) => {
            if (flag[0] !== 200)
                return Response.sendResponse(res, flag[0], flag[1], flag[2]);
            else {

                Membership.membershipSchema.count({ organizerId: req.body.organizerId }, (error1, data) => {
                    if (error1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, error1);
                    else {

                        Membership.membershipSchema.find({ organizerId: req.body.organizerId, membershipName: req.body.membershipName }, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                            else if (success.length)
                                return Response.sendResponse(res, responseCode.ALREADY_EXIST, "Membership name already exists.");
                            else {
                                console.log("count for membership>>>", data)
                                User.findById(req.body.organizerId, (error, result) => {
                                    if (error || !result)
                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, error);
                                    else if (result.subscription == "oneEvent" && data >= 1)
                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Only one membership is allowed for your plan");
                                    else {
                                        message.uploadImg(req.body.imageURL, (err1, success1) => {
                                            if (err1 || success1.error)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error in uploading the file", err1);
                                            else {
                                                if (success1.secure_url || success1.public_id) {
                                                    console.log("image all data>>>>>>", success1)
                                                    req.body.imagePublicId = success1.public_id;
                                                    req.body.imageURL = success1.secure_url;
                                                }
                                                Membership.membershipSchema.create(req.body, (err2, success2) => {
                                                    if (err2 || !success2)
                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                                                    else
                                                        return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Membership added successfully.");
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        }
                        )
                    }
                })
            }
        }
        )
    }
}

const getListOfMembership = (req, res) => {
    let flag = Validator(req.query, [], [], ["organizerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        console.log(req.body.limit)
        let options = {
            page: req.body.page || 1,
            limit: req.body.limit || 4,
            sort: { createdAt: -1 }
        }
        let query = {
            organizerId: req.query.organizerId
        };
        if (req.body.membershipStatus)
            query.status = req.body.membershipStatus;
        if (req.body.clubName)
            query.clubName = req.body.clubName;
        if (req.body.search) {
            query.$or = [
                { membershipName: { $regex: req.body.search, $options: 'i' } },
                { clubName: { $regex: req.body.search, $options: 'i' } },
                { status: { $regex: req.body.search, $options: 'i' } },
            ]
        }
        console.log("i am query to get list of membership >>>>>>>>", query)
        Membership.membershipSchema.paginate(query, options, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            }
        })
    }
}

const getAMembership = (req, res) => {
    let flag = Validator(req.query, [], [], ["organizerId", "membershipId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.membershipSchema.findById(req.query.membershipId, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Membership not found.")
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success)
        })

    }
}


const selectMembership = (req, res) => {
    let flag = Validator(req.query, [], [], ["organizerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.membershipSchema.find({ organizerId: req.query.organizerId }, {}, { select: "_id membershipName" }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            }
        })
    }
}

const editMembership = (req, res) => {

    let flag = Validator(req.body, [], [], []);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.membershipSchema.findById(req.body.membershipId, async (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                if (req.body.imageURL);
                let image = await checkImageURL(success.imageURL, success.imagePublicId);
                function checkImageURL(x, public_id) {
                    return new Promise((resolve, reject) => {
                        console.log("imageURL and PUBLIC Id>>", public_id)
                        if (req.body.imageURL != x) {
                            message.editUploadedFile(req.body.imageURL, public_id, (err1, success1) => {
                                console.log("err", err1, "success", success1)
                                if (err1 || success1.error) {
                                    x = "err";
                                    resolve(x);
                                }
                                else {
                                    if (success1.secure_url)
                                        x = success1.secure_url;
                                    resolve(x);
                                }
                            })
                        }
                        else
                            resolve(x);

                    });
                }
                if (req.body.imageURL && image == "err")
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error in uploading the file");
                else {
                    if (req.body.imageURL)
                        req.body.imageURL = image;
                    Membership.membershipSchema.findByIdAndUpdate(req.body.membershipId, req.body, { new: true, safe: true }, (err2, success2) => {
                        if (err2 || !success2)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_2err2OR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                        else {
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Membership edited successfully.", success2);
                        }

                    })
                }
            }
        })
    }
}

const deleteMembership = (req, res) => {
    let flag = Validator(req.query, [], [], ["membershipId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.membershipSchema.findByIdAndRemove(req.query.membershipId, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Memebership not found.");
            else {
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Membership deleted successfully.");
            }
        })
    }
}

const addProfessional = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId", "professionalName", "email", "countryCode", "mobileNumber", "status"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else if (!req.body.imageURL)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Image URL field must be profile image")
    else {
        req.body.email = req.body.email.toLowerCase();
        Membership.professionalSchema.findOne({ organizerId: req.body.organizerId, email: req.body.email, showStatus: "ACTIVE" }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (success)
                return Response.sendResponse(res, responseCode.ALREADY_EXIST, "Professional email id already exixts.");
            else {
                if (isBase64(req.body.imageURL))
                    message.uploadImg(req.body.imageURL, (err1, success1) => {
                        if (err1 || success1.error)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error in uploading the file", err1);
                        else {
                            if (success1.secure_url || success1.public_id) {
                                req.body.imageURL = success1.secure_url;
                                req.body.imagePublicId = success1.public_id;
                            }
                            Membership.professionalSchema.create(req.body, (err2, success2) => {
                                if (err || !success2)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                                else if (success)
                                    return Response.sendResponse(res, responseCode.ALREADY_EXIST, "Professional name already exixts.");
                                else
                                    return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Professional added successfully.", success2);
                            })
                        }
                    })
                else
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, "Please provide valid image.");
            }
        })

    }

}

const getListOfProfessional = (req, res) => {
    let flag = Validator(req.query, [], [], ["organizerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        //console.log(req.body.limit)
        let options = {
            page: req.body.page || 1,
            limit: req.body.limit || 4,
            sort: { createdAt: -1 }
        }
        let query = {
            organizerId: req.query.organizerId,
            showStatus: "ACTIVE"
        };
        if (req.body.search) {
            query.$or = [
                { professionalName: { $regex: req.body.search, $options: 'i' } },
                { email: { $regex: req.body.search, $options: 'i' } },
                { mobileNumber: { $regex: req.body.search, $options: 'i' } },
                { status: { $regex: req.body.search, $options: 'i' } },
            ]
        }
        console.log("i am query to get list of professional >>>>>>>>", query)
        Membership.professionalSchema.paginate(query, options, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            }
        })
    }
}

const getAProfessional = (req, res) => {
    let flag = Validator(req.query, [], [], ["organizerId", "professionalId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.professionalSchema.findById(req.query.professionalId, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Professional not found.")
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success)
        })

    }
}



const selectProfessional = (req, res) => {
    let flag = Validator(req.query, [], [], ["organizerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.professionalSchema.find({ organizerId: req.query.organizerId, showStatus: "ACTIVE" }, {}, { select: "_id professionalName" }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            }
        })
    }
}

const editProfessional = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId", "professionalId", "professionalName", "email", "countryCode", "mobileNumber", "status"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else if (!req.body.imageURL)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Image URL field must be profile image")
    else {
        Membership.professionalSchema.findById(req.body.professionalId, async (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                let image = await checkImageURL(success.imageURL, success.imagePublicId);
                function checkImageURL(x, public_id) {
                    return new Promise((resolve, reject) => {
                        console.log("imageURL and PUBLIC Id>>", public_id)
                        if (req.body.imageURL != x) {
                            message.editUploadedFile(req.body.imageURL, public_id, (err1, success1) => {
                                console.log("err", err1, "success", success1)
                                if (err1 || success1.error) {
                                    x = "err";
                                    resolve(x);
                                }
                                else {
                                    if (success1.secure_url)
                                        x = success1.secure_url;
                                    resolve(x);
                                }
                            })
                        }
                        else
                            resolve(x);

                    });
                }
                if (image == "err")
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error in uploading the file");
                else
                    req.body.imageURL = image;
                Membership.professionalSchema.findByIdAndUpdate(req.body.professionalId, req.body, { new: true, safe: true }, (err2, success2) => {
                    if (err2 || !success2)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_2err2OR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                    else {
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Professional edited successfully", success2);
                    }

                })
            }
        })
    }
}


const deleteProfessional = (req, res) => {
    let flag = Validator(req.query, [], [], ["professionalId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.professionalSchema.findByIdAndUpdate(req.query.professionalId, { showStatus: "INACTIVE" }, { upsert: true }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Professional not found.");
            else {
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Professional deleted successfully.");
            }
        })
    }
}

const addService = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId", "membershipId", "serviceName", "duration", "professionals", "status", "venueName", "venueId", "description", "noOfPlayersPerSlot", "serviceType", "offDays", "startDate", "endDate", "startDuration", "endDuration", "slots"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.serviceSchema.findOne({ organizerId: req.body.organizerId, serviceName: req.body.serviceName, showStatus: "ACTIVE" }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Service name already exists.");
            else {
                Membership.serviceSchema.create(req.body, (err1, success1) => {
                    if (err1 || !success1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                    else {
                        Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Service added successfully.", success1._id);
                        Membership.membershipSchema.findByIdAndUpdate(req.body.membershipId, { $push: { services: success1._id } }, { new: true, safe: true }, (err, success) => {
                            if (success)
                                async.forEach(req.body.professionals, function (key, callback2) {
                                    Membership.professionalSchema.findByIdAndUpdate(key.professionalId, { $push: { services: success1._id } }, { new: true }, (error, result) => {
                                        if (err || !result)
                                            console.log("ERROR in updating professoinals");
                                        else {
                                            console.log("professional update successfully");
                                        }
                                    })

                                }, function (err2, succ2) {
                                    if (err2)
                                        console.log('err2')
                                    else {
                                        console.log("task has completed");
                                    }
                                })
                        })
                    }
                })
            }
        })
    }
}

const editService = (req, res) => {
    let flag = Validator(req.body, [], [], ["serviceId", "serviceName", "professionals", "status", "venueName", "venueId", "description"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.serviceSchema.findOneAndUpdate({ _id: req.body.serviceId, showStatus: "ACTIVE" }, req.body, { new: true, safe: true }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Service doesn't exists.");
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            }
        })
    }
}

const getAService = (req, res) => {
    let flag = Validator(req.query, [], [], ["serviceId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.serviceSchema.findOne({ _id: req.query.serviceId, showStatus: "ACTIVE" }, "", { populate: { path: "membershipId", model: "orgmembership", select: "imageURL" } })
            .lean()
            .exec((err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, "Service not found.");
                else {
                    Membership.membershipSchema.findById(success.membershipId, "dynamicFormField _id membershipName", (error, result) => {
                        if (error)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, error)
                        else if (!result)
                            return Response.sendResponse(res, responseCode.NOT_FOUND, "Membership of this service is not found.");
                        else {
                            success.dynamicFormField = result.dynamicFormField;

                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
                        }
                    })
                }
            })
    }
}


const getListOfService = (req, res) => {
    let flag = Validator(req.body, [], [], ["loginWith"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        console.log(req.body.limit)
        let options = {
            page: req.body.page || 1,
            limit: req.body.limit || 4,
            sort: { createdAt: -1 },
        };
        let query = {
            showStatus: "ACTIVE"
        };
        if (req.body.organizerId)
            query.organizerId = req.body.organizerId;
        // if(req.body.loginWith == "WEBSITE") {
        //     if (!req.body.membershipId)
        //         return Response.sendResponse(res, responseCode.BAD_REQUEST, "Please provide membershipId in URL.");
        //     else
        //         query.membershipId = req.body.membershipId;
        // }
        if (req.body.status)
            query.status = req.body.status;
        if (req.body.membershipId)
            query.membershipId = req.body.membershipId;
        if (req.body.membershipName)
            query.membershipName = req.body.membershipName;
        if (req.body.search) {
            query.$or = [
                { serviceName: { $regex: req.body.search, $options: 'i' } },
                { amount: { $regex: req.body.search, $options: 'i' } },
                { "professionals.professionalName": { $regex: req.body.search, $options: 'i' } },
                { status: { $regex: req.body.search, $options: 'i' } },
                { venueName: { $regex: req.body.search, $options: 'i' } },
                { description: { $regex: req.body.search, $options: 'i' } },
                { organizerName: { $regex: req.body.search, $options: 'i' } },
                { membershipName: { $regex: req.body.search, $options: 'i' } },
            ];
        }
        console.log("i am query to get list of services >>>>>>>>", query, options);
        Membership.serviceSchema.paginate(query, options, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            }
        })
    }
}


const selectService = (req, res) => {
    let flag = Validator(req.query, [], [], ["organizerId", "membershipId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.serviceSchema.find({ organizerId: req.query.organizerId, membershipId: req.query.membershipId, showStatus: "ACTIVE" }, {}, { select: "_id serviceName" }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            }
        })
    }
}

const publishService = (req, res) => {
    let flag = Validator(req.query, [], [], ["serviceId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        Membership.serviceSchema.findOne({ _id: req.query.serviceId, showStatus: "ACTIVE" })
            .lean()
            .exec((err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, "Service not found.");
                else {
                    if (success.status !== "Confirmed")
                        return Response.sendResponse(res, responseCode.BAD_REQUEST, `Please "Confirm" the status of this service first.`);
                    else if (success.published == true)
                        Membership.serviceSchema.findByIdAndUpdate(req.query.serviceId, { $set: { published: false } }, (err1, success1) => {
                            if (err1 || !success1)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                            else {
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Service unpublished successfully.");
                            }
                        })
                    else {
                        Membership.serviceSchema.findByIdAndUpdate(req.query.serviceId, { $set: { published: true } }, (err1, success1) => {
                            if (err1 || !success1)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                            else {
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Service published successfully.");
                            }

                        })
                    }

                }

            })
    }
}
/* const editService=  (req,res)=>{
        let flag = Validator(req.body, [], [], ["organizerId","membershipId","serviceName","duration","professionals","status","venueName","venueId","description","noOfPlayersPerSlot","serviceType","offDays","startDate","endDate","startDuration","endDuration","slots"]);
        if (flag)
            return Response.sendResponse(res, flag[0], flag[1]);
        else{
            Membership.professionalSchema.findById(req.body.professionalId,async (err,success)=>{
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
                else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    else{
                        let image=await checkImageURL(success.imageURL,success.imagePublicId);
                        function checkImageURL(x,public_id) { 
                            return new Promise((resolve,reject) => {
                                console.log("imageURL and PUBLIC Id>>",public_id)
                                if(req.body.imageURL!=x){
                                    message.editUploadedFile(req.body.imageURL,public_id,(err1,success1)=>{
                                        console.log("err",err1,"success",success1)
                                        if(err1 || success1.error){
                                            x="err";
                                            resolve(x);
                                        }                                        
                                        else{
                                            if(success1.secure_url)
                                                x=success1.secure_url;
                                                resolve(x);
                                        }
                                    })
                                }
                                else
                                resolve(x);
                             
                            });
                        }
                        if(image=="err")
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error in uploading the file");
                        else
                            req.body.imageURL=image;   
                        Membership.professionalSchema.findByIdAndUpdate(req.body.professionalId,req.body,{new:true,safe:true},(err2,success2)=>{
                            if (err2 || !success2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_2err2OR, responseMsg.INTERNAL_SERVER_ERROR,err2);
                            else {
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Professional edited successfully",success2);
                            }
                            
                     })
               }
        })
    }
}
    */


const approveMembership = (req, res) => {
    let flag = Validator(req.body, [], [], ["playerId", "organizerId", "membershipId", "followStatus"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        console.log("approveMembership BODY>>>>>>>>>>>>>>>", req.body)
        Membership.membershipSchema.findOneAndUpdate({ "_id": req.body.membershipId, "playerFollowStatus.playerId": req.body.playerId }, { $set: { "playerFollowStatus.$.followStatus": req.body.followStatus } }, { new: true }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND, "Membership not found.");
            else {
                success.populate({ path: "organizerId", select: "firstName lastName" }, (err, data) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        var organizerName = data.organizerId.firstName + " " + data.organizerId.lastName;
                        Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Player status modified successfully.", data);
                        User.findOne({ _id: req.body.playerId }, { "deviceToken": 1, email: 1, membershipNotify: 1, countryCode: 1, mobileNumber: 1 }, (err, success3) => {
                            if (success3) {
                                console.log("success333333333333>>>>>>>", success3)
                                if ((success3.membershipNotify.mobile).indexOf("message") != -1)
                                    message.sendSMS("You are confirmed by the organizer " + organizerName, success3.countryCode, success3.mobileNumber, (error, result) => {
                                        if (err)
                                            console.log("error in sending SMS")
                                        else if (result)
                                            console.log("SMS sent successfully to the organizer!")
                                    })
                                // console.log("&&&&&& anurag &&&&&&", success3)
                                message.sendPushNotifications(success3.deviceToken, "You are confirmed by the organizer " + organizerName, (err, suc) => { })
                                if ((success3.membershipNotify.email).indexOf("message") != -1)
                                    message.sendMail(success3.email, "Yala Sports App ✔", "You are confirmed by the organizer " + organizerName, (err, result) => {
                                        console.log("send1--->>", result1)
                                    })
                                message.saveNotification([req.body.playerId], "You are confirmed by the " + organizerName)
                            }
                        })

                    }
                })
            }
        })
    }

}


const getApprovalList = (req, res) => {
    let flag = Validator(req.body, [], [], ["organizerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        var query = { organizerId: ObjectId(req.body.organizerId) };
        if (req.body.membershipName)
            query.membershipName = req.body.membershipName;
        let query2 = {};
        query2 = Object.assign(query2, query);

        if (req.body.status)
            query2["playerFollowStatus.followStatus"] = req.body.status;
        if (req.body.playerId)
            query2["playerFollowStatus.playerId."]

        if (req.body.search)
            query2.$or = [
                { membershipName: { $regex: req.body.search, $options: 'i' } },
                { "playerFollowStatus.playerId.firstName": { $regex: req.body.search, $options: 'i' } },
                { "playerFollowStatus.playerId.lastName": { $regex: req.body.search, $options: 'i' } },
                { "playerFollowStatus.playerId.email": { $regex: req.body.search, $options: 'i' } },
                { "playerFollowStatus.playerId.gender": { $regex: req.body.search, $options: 'i' } }
            ]

        console.log("i am query for get approval list>", query, "QUERY@>>>>>>>>>", query2)
        var aggregate = Membership.membershipSchema.aggregate([
            {
                $match: query
            },
            {
                "$unwind": {
                    path: '$playerFollowStatus'
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "playerFollowStatus.playerId",
                    foreignField: "_id",
                    as: "playerFollowStatus.playerId"
                }
            },
            {
                $match: query2
            },
            {
                $group: {
                    _id: "$_id",
                    // "membershipName": { "$first": "$membershipName" },
                    // // period:"$period",
                    // "clubName": { "$first": "$clubName" },
                    // "clubId": { "$first": "$clubId" },
                    // // "published": { "$first": "$published" },

                    // // "competitionName": { "$first": "$competitionName" },
                    // "updatedAt": { "$first": "$updatedAt" },
                    // "createdAt": { "$first": "$createdAt" },
                    "membershipName": { "$first": "$membershipName" },

                    // "imageURL": { "$first": "$imageURL" },
                    // "allowPublicToFollow": { "$first": "$allowPublicToFollow" },
                    "organizerId": { "$addToSet": "$organizerId" },
                    // "status":{"$first":"$status"},
                    "playerFollowStatus": { "$addToSet": "$playerFollowStatus" },


                }
            },
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: "playerFollowStatus.playerId",
            //         foreignField: "_id",
            //         as: "playerDetails"
            //     }
            // }
            //    {
            //       $project: {
            //          membershipName:1,
            //          clubName:1,
            //          playerFollowStatus:1,
            //          lengthOfFollowArray: { $size: "$playerFollowStatus" }
            //       }
            //    }
        ])

        let option = {
            limit: req.body.limit || 10,
            page: req.body.page || 1,
            sortBy: { createdAt: -1 },

        }
        Membership.membershipSchema.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
            // console.log("&&&&&&&&&&&>>",err,result);
            //    Membership.membershipSchema.populate(result,[{path:"playerFollowStatus.playerId",select:"firstName lastName email dob gender countryCode mobileNumber"}],(err,data)=>{


            const success = {
                "docs": result,
                "total": total,
                "limit": option.limit,
                "page": option.page,
                "pages": pages,
            }
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!result)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_DATA_FOUND);
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);

            //})
        })



    }


}

const getBookingList = (req, res) => {
    if (!req.body.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.body.type)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Please provide type of booking list.")
    else {
        let query = {
            organizerId: ObjectId(req.body.organizerId)
        }
        if (req.body.search) {
            let search = new RegExp("^" + req.body.search)
            query.$or = [
                { status: { $regex: search, $options: 'i' } },
                { totalPrice: { $regex: search, $options: 'i' } },
                { "Player.firstName": { $regex: search, $options: 'i' } },
                { "Player.lastName": { $regex: search, $options: 'i' } },
                { "Player.email": { $regex: search, $options: 'i' } },
                { "Player.nationality": { $regex: search, $options: 'i' } },
                { "Player.mobileNumber": { $regex: search, $options: 'i' } },
                { "Service.serviceName": { $regex: search, $options: 'i' } },
                { "Service.amount": { $regex: search, $options: 'i' } },
                { "Service.startDate": { $regex: search, $options: 'i' } },
                { "Service.endDate": { $regex: search, $options: 'i' } },
            ]
        }
        if (req.body.membershipName)
            query.membershipName = req.body.membershipName;
        console.log("query--->>", query)
        let option = {
            page: req.body.page || 1,
            limit: req.body.limit || 4
        }
        let query2 = {};
        if (req.body.type == "booking")
            query2.visibleInBooking = true;
        if (req.body.type == "membercard")
            query2.visibleInMemberCard = true;



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
                $unwind: "$Service"
            },
            { $unwind: "$Player" },
            { $match: query },
            {
                $project: {
                    "Player.firstName": 1,
                    "Player.lastName": 1,
                    "Player.email": 1,
                    "Player.mobileNumber": 1,
                    "Player.countryCode": 1,
                    "Player.nationality": 1,
                    "Service.serviceName": 1,
                    "Service.startDate": 1,
                    "Service.endDate": 1,
                    "Service.professionals": 1,
                    "Service.slots": 1,
                    "Service.amount": 1,
                    "Service.startTime": 1,
                    "timeSlots": 1,
                    "booking": 1,
                    "status": 1,
                    "followStatus": 1,
                    "membershipName": 1,
                    "startDate": 1,
                    "endDate": 1,
                    "createdAt": 1,
                    "totalPrice": 1,
                    "duration": 1,
                    "paymentMethod": 1,
                    "visibleInMemberCard": 1,
                    "visibleInBooking": 1,
                    "newsLetterVisible": 1
                }
            },
            { $sort: { createdAt: -1 } },
            { $match: query2 }
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
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Booking List", success)
                else
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
            }
            else {
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            }
        })
    }
}

const dynamicFormField = (req, res) => {
    let flag = Validator(req.body, [], [], ["membershipId", "dynamicFormField"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        if (typeof (req.body.dynamicFormField) == "object") {
            console.log("i am array")

        }

        Membership.membershipSchema.findOneAndUpdate({ "_id": req.body.membershipId }, { $set: { dynamicFormField: req.body.dynamicFormField } }, { new: true, select: { membershipName: 1, dynamicFormField: 1 } }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND, "Membership not found.");
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Fields added successfully", success)

            }
        })
    }
}

const deletePlayerfromList = (req, res) => {
    let flag = Validator(req.query, [], [], ["listId", "type"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        let update = {};
        if (req.query.type == "memberCard") {
            update = {
                $set: {
                    visibleInMemberCard: false
                }
            }
        }
        else if (req.query.type == "booking") {
            update = {
                $set: {
                    visibleInBooking: false
                }
            }
        }
        serviceBooking.serviceBooking.findOneAndUpdate({ _id: req.query.listId }, update, { new: true }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND, responseMsg.NOT_FOUND);
            else {
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Removed from the list successfully.")

            }
        })

    }

}

const sendPdfToPlayer = (req, res) => {
    let flag = Validator(req.query, [], [], ["_id"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        serviceBooking.serviceBooking.findById(req.query._id)
            .populate([{
                path: "serviceId",
                select: "serviceName membershipName endDate"
            },
            {
                path: "playerId",
                select: "firstName lastName email countryCode mobileNumber"
            },
            {
                path: "organizerId",
                select: "firstName lastName"
            },
            {
                path: "membershipId",
                select: "membershipId imageURL"
            }])
            .exec((err, data) => {
                if (err || !data) {
                    console.log(err);
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                }
                else {

                    // return res.send(data);                                 //Response***************************************************
                    //  {
                    //     "timeSlots": [
                    //         "10:00"
                    //     ],
                    //     "booking": true,
                    //     "status": "pending",
                    //     "followStatus": "APPROVED",
                    //     "visibleInMemberCard": false,
                    //     "_id": "5bab8522695cea13fe1ed7eb",
                    //     "organizerId": {
                    //         "_id": "5b544aaf9a895a460aaf93ce",
                    //         "firstName": "Pooja",
                    //         "lastName": "Kumar"
                    //     },
                    //     "membershipId": {
                    //         "_id": "5ba0e8594ad94016f528af70",
                    //         "imageURL": "https://res.cloudinary.com/singhanurag400/image/upload/v1537349846/ydrswaj8htryfht2y793.jpg"
                    //     },
                    //     "membershipName": "Abcde",
                    //     "playerId": {
                    //         "_id": "5b54494b9a895a460aaf93cc",
                    //         "firstName": "Ankita",
                    //         "lastName": "Verma",
                    //         "countryCode": "+91",
                    //         "mobileNumber": "8173041977",
                    //         "email": "me-anurag@mobiloitte.com"
                    //     },
                    //     "serviceName": "First service",
                    //     "serviceId": {
                    //         "_id": "5ba374c8ed1491108fddc180",
                    //         "membershipName": "Head massage",
                    //         "serviceName": "First service",
                    //          "endDate": "2018-10-20T00:00:00.000Z"
                    //     },
                    //     "paymentMethod": "Cash",
                    //     "totalPrice": "20",
                    //     "duration": [
                    //         {
                    //             "_id": "5bab8522695cea13fe1ed7ec",
                    //             "startTime": "10:00",
                    //             "endTime": "11:00",
                    //             "price": "20",
                    //             "totalDuration": "60"
                    //         }
                    //     ],
                    //     "createdAt": "2018-09-26T13:09:54.912Z",
                    //     "updatedAt": "2018-09-28T13:52:55.250Z",
                    //     "__v": 0
                    // }




                    var html = `<html lang="en" >
                        <head>
                        <meta charset="UTF-8">
                        </head>
                        <center><body>
                        <table> 
                        <h3>Membership name >>>> ${data.serviceId.membershipName}</h3>
                        <img src="${data.membershipId.imageURL}" width="100" height="100">
                        <p><strong>player name---->${data.playerId.firstName + data.playerId.lastName}</strong></p>

                        <p><strong>organizer name---->${data.organizerId.firstName + data.organizerId.lastName}</strong></p>

                        <p><strong>time slots---->${data.timeSlots}</strong></p>
                        <p>End Date >>>>>> ${data.createdAt}</p>

                        <p><strong>enddate---->${data.serviceId.endDate}</strong></p>

                        </table>
                        </body></center>
                        </html>`

                    console.log(">>>>>>", html);
                    pdf.create(html, options).toFile('../config/YALA.pdf', function (err, result) {
                        if (err || !result) {
                            console.log(err);
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                        }
                        else {
                            console.log("pdf creatd=======>>", result);
                            message.sendMail(data.playerId.email, "Invoice", html, (err, success) => {
                                if (err || !success)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                                else {
                                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "PDF File successfully sent to the player.");
                                }

                            }, "", "attachemnt yes");
                        }
                    })
                }
            })

    }
}


//Mark attendence
const getListForPlayerAttendence = (req, res) => {
    if (!req.body.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.body.membershipId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Membership is required")
    else if (!req.body.serviceId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Service is required")
    else {
        let query = {
            organizerId: req.body.organizerId,
            membershipId: req.body.membershipId,
            serviceId: req.body.serviceId,
        }
        let options = {
            page: req.body.page || 1,
            limit: req.body.limit || 10,
            sort: { createdAt: -1 },
            select: 'playerId  playerAttendence',
            lean: true,
            populate: { path: 'playerId', model: 'user', select: 'firstName lastName _id' }
        }
        // offset = (new Date().getTimezoneOffset()) * 60000;
        // req.body.attendenceDate= new Date(req.body.attendenceDate).getTime()-offset;
        // req.body.attendenceDate= new Date(req.body.attendenceDate).toISOString();
        console.log("absssg",req.body.attendenceDate)

        serviceBooking.serviceBooking.paginate(query, options, (err, result) => {
            console.log("pankaj>>>>>",JSON.stringify((result)))
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else {
                if (result.docs.length) {
                    result.docs.map((x) => {
                        //x.playerAttendence[0].attendenceDate=x.playerAttendence[0].attendenceDate.toString();
                        // x.playerAttendence[0].attendenceDate=x.playerAttendence[0].attendenceDate.split(0,10);
                        // console.log(typeof(x.playerAttendence[0].attendenceDate))
                        // for(let i=0;i<x.playerAttendence.length;i++){
                        //     x.playerAttendence[i].attendenceDate=x.playerAttendence[i].attendenceDate.toISOString().slice(0,10);
                        //     console.log((x.playerAttendence[i].attendenceDate),req.body.attendenceDate)
                        //     if(x.playerAttendence[i].attendenceDate == req.body.attendenceDate)
                        //         var index = i;
                            
                                
                        // }
                         var index = x.playerAttendence.findIndex((y) => (y.attendenceDate.toISOString().slice(0,10)) == req.body.attendenceDate);
                        
                        if (index == -1) {
                            x.playerAttendence = [{
                                attendenceDate: req.body.attendenceDate,
                                attendenceStatus: false
                            }]
                        } else {
                            x.playerAttendence = x.playerAttendence[index]
                        }
                    })
                }
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "List of Players", result)
            }
        })
    }
}

const MarkAttendence = (req, res) => {
    if (!req.body.attendenceDate)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Date is required.")
    else if (!req.body.bookingId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Service is required.")
    else {
        let query = {
            _id: req.body.bookingId,
            "playerAttendence.attendenceDate": req.body.attendenceDate
        }
        serviceBooking.serviceBooking.findOne(query, { "playerAttendence.$.attendenceStatus": 1 }, (err, result) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, err)
            else {
                let set;
                if (result) {
                    set = { 'playerAttendence.$.attendenceStatus': req.body.attendenceStatus }
                }
                if (!result) {
                    delete query["playerAttendence.attendenceDate"]
                    set = { $push: { playerAttendence: { attendenceDate: req.body.attendenceDate, attendenceStatus: req.body.attendenceStatus } } }
                }
                serviceBooking.serviceBooking.findOneAndUpdate(query, set, { new: true }, (err, result) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, err)
                    else {
                        let msg = 'Attendence unmarked successfully'
                        if (req.body.attendenceStatus)
                            msg = "Attendance marked successfully."
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, msg)
                    }

                })
            }

        })
    }
}

const changeBookingStatus = (req, res) => {
    let flag = Validator(req.body, [], [], ["bookingId", "paymentMethod", "status"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        serviceBooking.serviceBooking.findByIdAndUpdate(req.body.bookingId, { $set: { status: req.body.status } }, { new: 1 }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Booking not found.");
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Booking status changed successfully.")
            }
        })
    }
}

const getAttendanceHistory = (req, res) => {
    let flag = Validator(req.body, [], [], ["serviceId", "date"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        // T00:00:00.000Z
        offset = (new Date().getTimezoneOffset()) * 60000; //2018-10-10T00:00:00.000Z
        // let data= new Date(req.body.date).getTime()-offset;
        // var date = new Date(data);
        var date = new Date(req.body.date)   //2018-10-10T00:00:00.000Z
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var fromDate = new Date(firstDay).getTime() - offset
        var from = new Date(fromDate)

        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        var toDate = new Date(lastDay).getTime() - offset
        var to = new Date(toDate)
        console.log(from, to);

        serviceBooking.serviceBooking.aggregate([

            { $unwind: "$playerAttendence" },
            { $match: { serviceId: ObjectId(req.body.serviceId) } },
            {
                "$project": {
                    playerId: 1,
                    playerAttendence: 1,
                    // "playerAttendence.attendenceDate":1,
                    "y": {
                        "$year": ("$playerAttendence.attendenceDate")
                    },
                    "m": {
                        "$month": ("$playerAttendence.attendenceDate")
                    },
                    "d": {
                        "$dayOfMonth": ("$playerAttendence.attendenceDate")
                    }
                }
            },
            { $match: { "playerAttendence.attendenceDate": { $gte: from, $lte: to } } },
            {
                "$group": {
                    "_id": {
                        "year": "$y",
                        "month": "$m",
                        "day": "$d",

                    },
                    "playerId": { "$push": "$playerId" },
                    "playerAttendence": { "$push": "$playerAttendence" }


                }
            },
        ])
            .exec((err, success) => {
                console.log("^^^^^^^^^^^^^^^^", err)
                res.send(success)
            })

    }

}

const leaderboardPoints = (req, res) => {
    if (!req.body.pointDetail)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Point Detail is required")
    else {
        async.forEach(req.body.pointDetail, (key, callback) => {
            console.log("key-->>", key)
            serviceBooking.serviceBooking.findOne({ _id: key.bookingId, "leaderBoard.pointDate": req.body.pointDate }, { "leaderBoard.$._id": 1 }, (err, success) => {
                let set;
                console.log("success---------------->>>>>>>>>>>>", success)
                if (success) {
                    set = { 'leaderBoard.$.points': key.points }
                }
                if (!success) {
                    set = { $push: { leaderBoard: { pointDate: req.body.pointDate, points: key.points } } }
                }
                console.log("success", set, key)
                serviceBooking.serviceBooking.findOneAndUpdate({ _id: key.bookingId }, set, { new: true }, (err, result) => {
                    if (result)
                        console.log("hhhhhhh")
                    else
                        console.log("noooooo", err)
                })
            })
        })
    }
}


const leaderboardPlayers = (req, res) => {
    if (!req.body.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.body.membershipId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Membership is required")
    else if (!req.body.serviceId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Service is required")
    else {
        let query1 = {
            _id: req.body.serviceId,
            startDate: { $lte: req.body.Date },
            endDate:{$gte:req.body.Date}
        }
        Membership.serviceSchema.findOne(query1, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, "1.Service has not yet start.");
            else {
                let query = {
                    organizerId: req.body.organizerId,
                    membershipId: req.body.membershipId,
                    serviceId: req.body.serviceId,
                }
                let options = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 10,
                    sort: { createdAt: -1 },
                    select: 'playerId player',
                    lean: true,
                    populate: { path: 'playerId', model: 'user', select: 'firstName lastName _id' }
                }
                serviceBooking.serviceBooking.paginate(query, options, (err, result) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (!result.docs)
                        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Service has not yet start.");
                    else {
                        // if (result.docs.length) {
                        //     result.docs.map((x) => {
                        //         var index = x.player.findIndex((y) => y.Date == req.body.Date)
                        //         if (index == -1) {
                        //             x.player = [{
                        //                 Date: req.body.Date,
                        //                 Status: false
                        //             }]
                        //         } else {
                        //             x.player = x.player[index]
                        //         }
                        //     })
                        // }
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "List of Players", result)
                    }
                })
            }
        })

    }
}





const getListOfPlayersLeaderboard=(req,res)=>{  
    let flag = Validator(req.body, [], [], ["serviceId", "membershipId","date"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
    offset = (new Date().getTimezoneOffset()) * 60000; //2018-10-10T00:00:00.000Z
    var date = new Date(req.body.date)   //2018-10-10T00:00:00.000Z
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var fromDate = new Date(firstDay).getTime() - offset
    var from = new Date(fromDate)

    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    var toDate = new Date(lastDay).getTime() - offset
    var to = new Date(toDate)
    console.log(from, to);
        var date = req.body.date;
        let query={$or:[{ startDate: { $lte: date }, endDate: { $gte: date } },{endDate:{$lte:to}, startDate:{$gte:from}},{startDate:{$lte:to}, endDate:{$gte:from}}]};
        query.membershipId=req.body.membershipId;
        query.serviceId=req.body.serviceId;
        serviceBooking.serviceBooking.find(query).populate([{ path: "playerId", model: "user", select: { firstName: 1, lastName: 1 } },{path:"serviceId",select:"serviceName venueName"}]).exec((error, result) => {
            console.log(">>>>>>>>>>", result)
            if (error) {
                res.send({ responseCode: 500, responseMessage: "Internal server>>> error." })
            }
            else if (!result) {
                res.send({
                    responseCode: 404,
                    responseMessage: "empty player list at this date",
                    
                })
            }
            else {
                res.send({
                    responseCode: 200,
                    responseMessage: "player list ",
                    result: result
                })
            }
        })

    }
}

   const getDetailOfPlayerEvaluation= (req, res) => {
    let flag = Validator(req.query, [], [], ["bookingId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {

        serviceBooking.serviceBooking.findById(req.query.bookingId,"evaluation")
        .populate({path:"playerId",select:"firstName lastName"})
        .exec((error, result) => {
            console.log(">>>>>>>>>>", result)
            if (error)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,error)
            else if(!result)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Details not found");            
            else {
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE,result);   

            }
        })

    }
   }

    const setEvaluation=(req, res) => {
        let flag = Validator(req.body, [], [], ["bookingId","year","month","bad","pass","shooting","strenght","speed","flexibility","decision","offensive","concentration","competitivenedd","selfConfidence"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        var sum = (Number(req.body.bad) + Number(req.body.pass) + Number(req.body.shooting) + Number(req.body.strenght) + Number(req.body.speed) + Number(req.body.flexibility) + Number(req.body.decision) + Number(req.body.offensive) + Number(req.body.concentration) + Number(req.body.competitivenedd) + Number(req.body.selfConfidence))
        var avg = sum / 11;
        console.log("average>>>>>",avg,sum);
        let value = {
            bad: req.body.bad,
            pass: req.body.pass,
            shooting: req.body.shooting,
            strenght: req.body.strenght,
            speed: req.body.speed,
            flexibility: req.body.flexibility,
            decision: req.body.decision,
            offensive: req.body.offensive,
            concentration: req.body.concentration,
            competitivenedd: req.body.competitivenedd,
            selfConfidence: req.body.selfConfidence,
            avg: avg
        }
        let eval=`evaluation.${req.body.year}.${req.body.month}`;
        let query={_id:req.body.bookingId};
        let set={};
        set[eval]=value;
        serviceBooking.serviceBooking.findByIdAndUpdate(query,{$set:set},{new:true},(error, result) => {
            if (error) {
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,error)
            }
            else if(!result)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_DATA_FOUND);   
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE,result);                      
        })
    }
}


   const updateLeaderBoardPoint=(req,res)=>{
        if (!req.body.result)
            return Response.sendResponse(res, responseCode.BAD_REQUEST, "Point Detail is required")
        else {
            async.forEach(req.body.result, (key, callback) => {
                console.log("key-->>", key)
                serviceBooking.serviceBooking.findByIdAndUpdate({ _id: key._id}, key, (err, success) => {
                
                        if (success)
                            console.log("hhhhhhh")
                        else
                            console.log("noooooo", err)
                    })
                    callback("","success")
            },(err,success)=>{
                if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Points updated successfully");
            })
        }
    }





module.exports = {
    addMembership,
    getListOfMembership,
    selectMembership,
    editMembership,
    deleteMembership,
    addProfessional,
    getListOfProfessional,
    selectProfessional,
    editProfessional,
    deleteProfessional,
    addService,
    editService,
    getListOfService,
    selectService,
    getAMembership,
    getAProfessional,
    getAService,
    publishService,
    approveMembership,
    getApprovalList,
    getBookingList,
    dynamicFormField,
    deletePlayerfromList,
    sendPdfToPlayer,
    getListForPlayerAttendence,
    MarkAttendence,
    changeBookingStatus,
    getAttendanceHistory,
    leaderboardPoints,
    leaderboardPlayers,



    getListOfPlayersLeaderboard,
    
    
    
    updateLeaderBoardPoint,
    getDetailOfPlayerEvaluation,
    setEvaluation




}