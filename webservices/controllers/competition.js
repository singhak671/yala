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
//------Create a competition--------------
const addNewCompetition = (req, res) => {
    let flag = Validator(req.body, ['userId'], [], [])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        subscriptionValidator(req.body, ["Competition"], (err, flag) => {
            if (flag[0] !== 200)
                return Response.sendResponse(res, flag[0], flag[1], flag[2]);

            else {
                Competition.competition.count({ organizer: req.body.userId }, (err, success) => {
                    console.log("count>>>>>>>>>>", success)
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else {
                        User.findById(req.body.userId, (err2, success2) => {
                            if (err2 || !success2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                            else if (success2.subscription == "oneEvent" && success >= 1)
                                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Only one competition is allowed for your plan");
                            else {
                                Competition.competition.findOne({ organizer: req.body.userId, competitionName: req.body.competitionDetails.competitionName }, (err, success) => {
                                    if (err)
                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                                    if (success)
                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ALREADY_EXISTS);
                                    req.body.competitionDetails.organizer = req.body.userId;
                                    // console.log(req.body);
                                    Competition.competition.create(req.body.competitionDetails, (err, success) => {
                                        if (err || !success)
                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                                        User.findByIdAndUpdate(req.body.userId, { $push: { organizerCompetition: success._id } }, {}, (err, success1) => {
                                            if (err || !success1)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Unable to create competition _id into the User _id");
                                            else {
                                                User.find({})
                                                return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "A new competition created successfully", success);
                                            }
                                        })
                                    });
                                });
                            }
                        })
                    }
                })
            }
        })
}

//------Get a detail of competition------
const getACompetition = (req, res) => {
    console.log(req.body)
    let flag = Validator(req.body, ['userId'], [], ["competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findOne({ organizer: req.body.userId, _id: req.body.competitionId }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
        }
    });
}
//--------Get List of all competition--------
const getAllCompetition = (req, res) => {
    let flag = Validator(req.body, ['userId'], [])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    User.findById(req.body.userId, (err, succ) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (!succ)
            return Response.sendResponse(res, responseCode.NOT_FOUND, "User not foun");

        else
            Competition.competition.paginate({ organizer: req.body.userId }, { page: req.body.page, limit: req.body.limit }, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND,"User not found");
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success)
            });
    })
}
//-----------Filter competition------------
const filterCompetition = (req, res) => {
    let flag = Validator(req.body, ['userId'], [], [])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else {
        let obj = {};
        if (req.body.filterFields) {
            let array = ["sports", "division", "period", "status"];
            for (let key of array) {
                for (let data in req.body.filterFields) {
                    if (key == data && req.body.filterFields[data])
                        obj[key] = req.body.filterFields[key];
                }
            }
        }
        obj.organizer = req.body.userId;
        if (req.body.filterFields.search) {
            obj.$or = [
                { competitionName: { $regex: req.body.filterFields.search, $options: 'i' } },
                { period: { $regex: req.body.filterFields.search, $options: 'i' } },
                { sports: { $regex: req.body.filterFields.search, $options: 'i' } },
                { status: { $regex: req.body.filterFields.search, $options: 'i' } },
                { venue: { $regex: req.body.filterFields.search, $options: 'i' } },
                { division: { $regex: req.body.filterFields.search, $options: 'i' } }
            ]
        };
        console.log("i am objetc", obj);
        let query = {
            page: req.body.page || 1,
            limit: req.body.limit || 4,
            sort: { "createdAt": -1 }
        }

        Competition.competition.paginate(obj, query, (err, result) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!result)
                return Response.sendResponse(res, responseCode.NOT_FOUND,"User not found");
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, result);
        })
    }
}

const searchCompetition = (req, res) => {
    let search = new RegExp("^" + req.body.search)
    let query = {
        clubName: search,
        userId: req.query.userId
    }
    var options = {
        page: req.body.page || 1,
        limit: req.body.limit || 10,
        sort: { createdAt: -1 }
    }
    dataServices.getListOfClub(query, options, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        else if (!success.docs.length)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_DATA_FOUND);
        else
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_SPONSERS, success)
    })
}

//--------Configure competition------------
const configureCompetition = (req, res) => {
    // console.lo
    let flag = Validator(req.body, [], [], ["competitionId", "competitionName", "venue", "division", "period", "sports", "startDate", "endDate", "status", "club", "imageURL"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findById(req.body.competitionId, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        message.uploadImg(req.body.imageURL, (err, success1) => {
            if (err || !success1.secure_url)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            req.body.imageURL = success1.secure_url;
            Competition.competition.findByIdAndUpdate({ _id: req.body.competitionId }, req.body, (err, success) => {
                if (err || !success)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Configured successfully");
            })
        })
    })
}
//--------Add Prize-----------------
const addPrize = (req, res) => {
    let flag = Validator(req.body, ["prizeDetails"], ["name", "value", "description"], ["competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findById(req.body.competitionId, (err, result) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        else if (!result)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.COMPETITION_NOT_FOUND);
        else {
            for (let x of result.prize) {
                if (x.name === req.body.prizeDetails.name)
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, "Prize with this name already exits");
            }
            Competition.competition.findByIdAndUpdate(req.body.competitionId, { $push: { prize: req.body.prizeDetails } }, { new: true }, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, "No data found");

                return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Prize added successfully", success);
            });
        }
    });
}
//--------Get prize list with search---------
const getPrizeList = (req, res) => {
    //var arrLength;
    let flag = Validator(req.query, [], [], ["competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    // var data={
    //     page:req.body.page ||1,
    //     limit:req.body.limit ||4
    // }
    // skip((query.page - 1) * query.limit)
    // let options={"prize":  {$slice: [((query.page - 1) * query.limit),query.limit]}}


    //console.log(length)
    let query = {
        _id: ObjectId(req.query.competitionId)
    }
    if (req.body.search) {
        let search = new RegExp("^" + req.body.search)
        query.$or = [
            { "prize.name": { $regex: search, $options: 'i' } },
            { "prize.description": { $regex: search, $options: 'i' } },
            //{$where: `${search}.*/.test("this.prize.value")`}
        ]

    }

    console.log("query--->>", query)
    var aggregate = Competition.competition.aggregate([

        {
            $unwind: "$prize"
        }, {
            $project: { prize: "$prize", _id: 1 }
        },
        {
            $sort: { "prize.createdAt": -1 }
        },
        {
            $match: query
        },
    ])
    //   .exec((err,success)=>{
    //     if (err)
    //             return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
    //         else if (!success)
    //             return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
    //             else{
    //                 return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.SUCCESSFULLY_DONE, success,data);

    //         }
    //   })
    let option = {
        page: req.body.page || 1,
        limit: req.body.limit || 4
    }
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
            if (success)
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Prize list", success);
        }
        else {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
        }

    })
    // Competition.competition.find(query)
    // .select("prize")
    // .select({ 'prize': { '$slice': [((data.page - 1) * data.limit),(data.limit)] } ,file:0})
    // .lean()
    // .exec((err,success)=>{
    //     if (err)
    //         return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
    //     else if (!success)
    //         return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
    //         else{
    //             Competition.competition.findById(req.query.competitionId,"prize",(err,result)=>{
    //                 if(result)
    //                 data.total= result.prize.length;              


    //             return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.SUCCESSFULLY_DONE, success,data);
    //         })
    //     }


    // })


}
//----Edit a prize-----
const editPrize = (req, res) => {
    //console.log(req.body.prizeDetails._id,req.body.competitionId)
    let flag = Validator(req.body, ["prizeDetails"], ["_id", "name", "value", "description"], ["competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findOneAndUpdate({ "_id": req.body.competitionId, "prize._id": req.body.prizeDetails._id }, { $set: { "prize.$": req.body.prizeDetails } }, { new: true }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
            for (let x of success.prize)
                if (x._id == req.body.prizeDetails._id)
                    success = x;
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Prize detail updated successfully", success);
        }
    })

}
//---------Get a prize-----
const getAPrize = (req, res) => {
    let flag = Validator(req.query, [], [], ["competitionId", "prizeId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);

    Competition.competition.findOne({ _id: req.query.competitionId, "prize._id": req.query.prizeId }, { 'prize.$._id': 1 }, (err, result) => {
        console.log(result);
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        else if (result == false)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Detail of prize", result);
        }

    })
}

// const deletePrize=(req,res)=>{
//     if(!req.body.competitionId || !req.body.prizeDetails._id)
//         return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.REQUIRED_DATA);
//      Competition.competition.findOne({"_id":req.body.competitionId,"prize._id":req.body.prizeDetails._id},(err,success)=>{
//         if(err)
//             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
//         if(!success)
//             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);

//      Competition.competition.findByIdAndUpdate({"_id":req.body.competitionId },{ $pull: { prize : { _id : req.body.prizeData._id } } },{ safe: true},(err,success)=>{
//         if(err)
//             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
//         if(!success)
//             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);

//         return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Successfully deleted",success);
//     })
// }) 
// }
//-------Delete a Prize------
const deletePrize = (req, res) => {
    let flag = Validator(req.body, ["prizeDetails"], ["_id"], ["competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findOneAndUpdate({ "_id": req.body.competitionId, "prize._id": req.body.prizeDetails._id }, { $pull: { prize: { _id: req.body.prizeDetails._id } } }, { safe: true, new: true }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);

        return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Prize deleted successfully.", success);
    })

}
//-----Option competition-------
const optionCompetition = (req, res) => {
    if (!req.query.competitionId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.REQUIRED_DATA);
    Competition.competition.findByIdAndUpdate(req.query.competitionId, req.body, (err, result) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        if (!result)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Detail updated successfully", result);
    })
}

//--------Add file --------------
const addFile = (req, res) => {
    console.log("req.body--->>", req.body)
    let flag = Validator(req.body, ["fileDetails"], ["file", "name"], ["competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findById(req.body.competitionId, (err, result) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        if (!result)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        for (let x of result.file) {
            if (x.name === req.body.fileDetails.name)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Name already exists");
        }
        message.uploadImg(req.body.fileDetails.file, (err, success1) => {
            if (success1.secure_url) {
                console.log(success1);
                req.body.fileDetails.file = success1.secure_url;
                req.body.fileDetails.public_id = success1.public_id;
                let data = req.body.fileDetails;
                if (req.body.fileDetails._id)
                    delete data["_id"];
                result.file.push(data);
                result.save((err, success) => {
                    if (err || !success)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "File added successfully.");
                });
            }
            else
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "File not uploaded successfully");
        });
    });
}
//----------Get file list----------
const getFileList = (req, res) => {
    //var arrLength;
    let flag = Validator(req.query, [], [], ["competitionId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    let query = {
        _id: ObjectId(req.query.competitionId)
    }
    if (req.body.search) {
        let search = new RegExp("^" + req.body.search)
        query["file.name"] = { $regex: search, $options: 'i' }

    }
    console.log("query--->>", query)
    var aggregate = Competition.competition.aggregate([

        {
            $unwind: "$file"
        }, {
            $project: { file: "$file", _id: 1 }
        },
        {
            $sort: { "file.createdAt": -1 }
        },
        {
            $match: query
        },
    ])

    let option = {
        page: req.body.page || 1,
        limit: req.body.limit || 4
    }
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
            if (success)
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "File list", success);
        }
        else {
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
        }

    })
    // var data = {
    //     page: req.body.page || 1,
    //     limit: req.body.limit || 4
    // }
    // // skip((query.page - 1) * query.limit)
    // // let options={"prize":  {$slice: [((query.page - 1) * query.limit),query.limit]}}


    // //console.log(length)
    // Competition.competition.findById(req.query.competitionId)
    //     .select({ 'file': { '$slice': [((data.page - 1) * data.limit), (data.limit)] }, prize: 0 })
    //     .lean()
    //     .exec((err, success) => {
    //         if (err)
    //             return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
    //         else if (!success)
    //             return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
    //         else {
    //             Competition.competition.findById(req.query.competitionId, "file", (err, result) => {
    //                 if (result)
    //                     data.total = result.file.length;


    //                 return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.SUCCESSFULLY_DONE, success, data);
    //             })
    //         }


    //     })


}

//--------------Get a file--------
const getAFile = (req, res) => {
    let flag = Validator(req.query, [], [], ["competitionId", "fileId"])
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);

    Competition.competition.findOne({ _id: req.query.competitionId, "file._id": req.query.fileId }, { 'file.$._id': 1 }, (err, result) => {
        console.log(result);
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        else if (result == false)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        else {
            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "File Detail", result);
        }

    })
}
//----------Edit a file---------------
const editFile = (req, res) => {
    //console.log(req.body.prizeDetails._id,req.body.competitionId)
    let flag = Validator(req.body, ["fileDetails"], ["_id", "file", "name"], ["competitionId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findOne({ _id: req.body.competitionId, "file._id": req.body.fileDetails._id }, { 'file.$._id': 1 }, (err, result) => {
        console.log(result);
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        if (!result)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        // for (let x of result.file) {
        //     if (x.fileName === req.body.fileDetails.fileName)
        //         return Response.sendResponse(res, responseCode.BAD_REQUEST, "File already exists");
        // }
        message.editUploadedFile(req.body.fileDetails.file, result.file[0].public_id, (err, success1) => {
            if (success1.secure_url) {
                req.body.fileDetails.file = success1.secure_url;
                req.body.fileDetails.public_id = success1.public_id;
                Competition.competition.findOneAndUpdate({ "_id": req.body.competitionId, "file._id": req.body.fileDetails._id }, { $set: { "file.$": req.body.fileDetails } }, { new: true }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                    if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "File updated successfully", success.file);
                })
            }
            else
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "File not uploaded successfully");
        });

    })
}



//----------Delete File------------
const deleteFile = (req, res) => {
    //console.log(req.body.prizeDetails._id,req.body.competitionId)
    let flag = Validator(req.body, ["fileDetails"], ["_id"], ["competitionId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findOne({ _id: req.body.competitionId, "file._id": req.body.fileDetails._id }, { 'file.$._id': 1 }, (err, result) => {
        console.log(result);
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        if (!result)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);

        message.deleteUploadedFile(result.file[0].public_id, (err, success1) => {
            if (success1.result) {
                Competition.competition.findOneAndUpdate({ "_id": req.body.competitionId, "file._id": req.body.fileDetails._id }, { $pull: { file: { _id: req.body.fileDetails._id } } }, { safe: true, new: true }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                    if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                    return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "File deleted successfully ");
                })
            }
            else
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "File not deleted successfully");
        });
    })
}


const competitionRegistration = (req, res) => {
    let flag = Validator(req.body, [], [], ["competitionId", "userId", "freeOrPaid", "description", "startDate", "endDate"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    if (req.body.freeOrPaid == "paid") {
        let flag1 = Validator(req.body, [], [], ["registrationFee", "paymentInHandDetails"]);
        if (flag1)
            return Response.sendResponse(res, flag1[0], flag1[1]);
    }
    Competition.competition.findOne({ _id: req.body.competitionId }, (err, success2) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        else if (!success2)
            return Response.sendResponse(res, responseCode.NOT_FOUND, "competition not found or registration has already done!");
        else
            if (success2.organizer == req.body.userId) {
                req.body.organizer = req.body.userId;
                Competition.competitionReg.findOneAndUpdate({ competitionId: req.body.competitionId }, req.body, { new: true, upsert: true }, (err, result) => {
                    if (err || !result)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else
                        Competition.competition.findOneAndUpdate({ _id: req.body.competitionId }, { $set: { registrationForm: true } }, { new: true }, (err, success3) => {
                            if (success2)
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Registration successfull", result);

                            // if(result) {  
                            //     // message.uploadImg(req.body.image,(err,success)=>{
                            //     //     if(success.secure_url)
                            //     //     {
                            //     //         result.imageURL=success.secure_url;
                            //             result.organizer=req.body.userId;
                            //             result.save((err,result1)=>{
                            //                 if(err)
                            //                     return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                            //                 if(!result1)
                            //                     return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
                            //                   return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfully updated",result1);
                            //             // })                
                            //         })
                            //         // else
                            //         //     return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to update registration",err);
                            //     }
                            // else
                            // {
                            //     // message.uploadImg(req.body.image,(err,success)=>{
                            //     //     if(success.secure_url)
                            //     //     {
                            //     //         req.body.imageURL=success.secure_url;
                            //             Competition.competitionReg.create(req.body,(err1,success1)=>{
                            //                 if(err1)
                            //                     return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                            //                 if(!success1)
                            //                     return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
                            //                 return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfull",success1);
                            //             })
                            //         }
                            // else
                            //     return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to save registration",err); 
                        })
                })
            }

            else {
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition doesn't belong to this organizer");
            }
    })
}

const publishCompetition = (req, res) => {
    let flag = Validator(req.body, [], [], ["competitionId", "userId",]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        Competition.competition.findOneAndUpdate({ _id: req.body.competitionId, organizer: req.body.userId }, { $set: { published: true } }, { new: true, select: { "published": 1, organizer: 1, competitionName: 1 } }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "CompetitionId not found");
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You have Published this competition successfully", success);
        })
}


const unPublishCompetition = (req, res) => {
    let flag = Validator(req.body, [], [], ["competitionId", "userId",]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        Competition.competition.findOneAndUpdate({ _id: req.body.competitionId, organizer: req.body.userId }, { $set: { published: false } }, { new: true, select: { "published": 1, organizer: 1, competitionName: 1 } }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "competitionId not found");
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You have Unpublished this competition successfully", success);
        })
}

const getRegistrationDetail = (req, res) => {
    console.log(req.body)
    let flag = Validator(req.body, [], [], ["competitionId", "userId",]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        Competition.competitionReg.findOne({ competitionId: ObjectId(req.body.competitionId), organizer: ObjectId(req.body.userId) })
            .populate("competitionId", "_id published competitionName organizer sportType")
            .exec((err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, "You cannot register in this competition as registration form for this competition is not created yet!");
                else
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            })
}


const configTeamFields = (req, res) => {
    let flag = Validator(req.body, ["teamFields"], ["field", "importance"], ["competitionId", "userId",]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findById(req.body.competitionId, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, "competitionId not found");
        if (success.organizer == req.body.userId) {
            Competition.competitionReg.findOneAndUpdate({ competitionId: req.body.competitionId, organizer: req.body.userId }, { $set: { configTeamField: req.body.teamFields } }, { new: true, upsert: true }, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);

                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            });
            // Competition.competitionReg.findOne({competitionId:req.body.competitionId},(err,result)=>{
            //     if(err)
            //         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            //     if(result) {   
            //                 result.configTeamField.push=success.secure_url;
            //                 result.organizer=req.body.userId;
            //                 result.save((err,result1)=>{
            //                     if(err)
            //                         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            //                     if(!result1)
            //                         return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
            //                       return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfully updated",result1);
            //                  })                
            //             }
            //                 return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to update registration",err);
            //         })
            //     else
            //     {
            //         message.uploadImg(req.body.image,(err,success)=>{
            //             if(success.secure_url)
            //             {
            //                 req.body.imageURL=success.secure_url;
            //                 Competition.competitionReg.create(req.body,(err1,success1)=>{
            //                     if(err1)
            //                         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
            //                     if(!success1)
            //                         return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
            //                     return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfull",success1);
            //                 })
            //             }
            //             else
            //                 return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to save registration",err); 
            //          })
            //     }
            // })
        }
        else {
            return Response.sendResponse(res, responseCode.NOT_FOUND,"User not found");
        }
    })
}

const getTeamfields = (req, res) => {
    let flag = Validator(req.body, [], [], ["competitionId", "userId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competitionReg.findOne({ competitionId: req.body.competitionId, organizer: req.body.userId }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success.configTeamField);
    })
}

const configPlayerFields = (req, res) => {
    let flag = Validator(req.body, ["playerFields"], ["field", "importance"], ["competitionId", "userId",]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competition.findById(req.body.competitionId, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
        if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, "competitionId not found");
        if (success.organizer == req.body.userId) {
            Competition.competitionReg.findOneAndUpdate({ competitionId: req.body.competitionId, organizer: req.body.userId }, { $set: { configPlayerField: req.body.playerFields } }, { new: true, upsert: true }, (err, success) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);

                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success);
            });
            // Competition.competitionReg.findOne({competitionId:req.body.competitionId},(err,result)=>{
            //     if(err)
            //         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            //     if(result) {   
            //                 result.configTeamField.push=success.secure_url;
            //                 result.organizer=req.body.userId;
            //                 result.save((err,result1)=>{
            //                     if(err)
            //                         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            //                     if(!result1)
            //                         return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
            //                       return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfully updated",result1);
            //                  })                
            //             }
            //                 return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to update registration",err);
            //         })
            //     else
            //     {
            //         message.uploadImg(req.body.image,(err,success)=>{
            //             if(success.secure_url)
            //             {
            //                 req.body.imageURL=success.secure_url;
            //                 Competition.competitionReg.create(req.body,(err1,success1)=>{
            //                     if(err1)
            //                         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
            //                     if(!success1)
            //                         return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
            //                     return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfull",success1);
            //                 })
            //             }
            //             else
            //                 return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to save registration",err); 
            //          })
            //     }
            // })
        }
        else {
            return Response.sendResponse(res, responseCode.NOT_FOUND,"User not found");
        }
    })
}

const getPlayerFields = (req, res) => {
    let flag = Validator(req.body, [], [], ["competitionId", "userId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    Competition.competitionReg.findOne({ competitionId: req.body.competitionId, organizer: req.body.userId }, (err, success) => {
        if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        if (!success)
            return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success.configPlayerField);
    })
}

const createTeamInCompetition = (req, res) => {
    let flag = Validator(req.body, [], [], ["competitionId", "organizer", "teamName", "email", "status", "image"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        Competition.competition.findById({ _id: req.body.competitionId, organizer: req.body.organizer }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
            Team.findOne({ competitionId: req.body.competitionId, organizer: req.body.organizer, email: req.body.email }, (err, success1) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                else if (success1)
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, "Team already exists");
                else
                    message.uploadImg(req.body.image, (err, result) => {
                        console.log("err", err, "result", result);
                        if (err || !result.secure_url)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Image not uploaded successfully");
                        else
                            if (result.secure_url)
                                req.body.imageURL = result.secure_url;

                        Team.create(req.body, (err2, success2) => {
                            if (err2 || !success2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                            else
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Team added successfully", success2);
                        })
                    })
            })
        })
}

const getTeamInCompetition = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    if (!req.query.competitionId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Competition is required")
    else {
        User.findById(req.query.userId, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
            else {
                let query = {
                    organizer: req.query.userId,
                    competitionId: req.query.competitionId,
                    visibleStatus: "ACTIVE"
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query.$or = [
                        { teamName: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { "teamDynamicDetail.venue": { $regex: search, $options: 'i' } },
                        { status: { $regex: search, $options: 'i' } },
                        { "teamDynamicDetail.mobileNumber": { $regex: search, $options: 'i' } }
                    ]
                }
                let options = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 4,
                    sort: { createdAt: -1 },
                    populate: { path: "competitionId", model: Competition.competition, select: { "competitionName": 1, "division": 1 } },
                    lean: true
                }
                Team.paginate(query, options, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        for (i = 0; i < success.docs.length; i++) {
                            success.docs[i].playerCount = success.docs[i].playerId.length
                        }
                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "List of teams", success)
                    }
                })
            }
        })
    }
}
//-------------------Delete Team-------------------
const deleteTeam = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.competitionId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Competition is required")
    else if (!req.query.teamId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.TEAM_IS_REQUIRED)
    else {
        let query = {
            organizer: req.query.userId,
            competitionId: req.query.competitionId,
            _id: req.query.teamId
        }
        let set = {
            visibleStatus: "INACTIVE"
        }
        let option = {
            new: true
        }
        Team.findOneAndUpdate(query, set, option, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_TEAM_FOUND)
            else
                return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Team deleted successfully")
        })
    }
}

const getPlayerList = (req, res) => {
    let flag = Validator(req.body, [], [], ["userId", "competitionId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        Competition.competition.findOne({ _id: req.body.competitionId }, { "sports": 1, "venue": 1, "competitionName": 1, "_id": 1 }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition not found !");
            else {
                let query = {
                    page: req.body.page || 1,
                    limit: req.body.limit || 4
                };
                followComp.competitionFollow.find({ organizer: req.body.userId, competitionId: req.body.competitionId }).count({}, (err, result) => {
                    query.total = result;
                    console.log(query)

                });
                followComp.competitionFollow.find({ organizer: req.body.userId, competitionId: req.body.competitionId }).sort({ "createdAt": -1 }).populate({
                    path: 'playerId',
                    select: "firstName lastName countryCode mobileNumber email createdAt"
                })
                    .populate({
                        path: 'competitionId',
                        select: "competitionName venue sports"
                    }).
                    skip((query.page - 1) * query.limit).
                    limit(query.limit).
                    exec((err1, success1) => {
                        if (err1)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err1);
                        else if (success1 == false)
                            return Response.sendResponse(res, responseCode.NOT_FOUND, "No players found!");
                        else
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success1, query);

                    })
            }

        })
}


const searchAndFilterPlayerList = (req, res) => {
    let flag = Validator(req.body, [], [], ["userId", "competitionId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        Competition.competition.findOne({ _id: req.body.competitionId }, { "sports": 1, "venue": 1, "competitionName": 1, "_id": 1 }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition not found !");
            else {
                let query1 = {
                    organizer: ObjectId(req.body.userId),
                    competitionId: ObjectId(req.body.competitionId)
                }

                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query1 = {
                        organizer: ObjectId(req.body.userId), competitionId: ObjectId(req.body.competitionId),
                        $or: [{ "Player.firstName": { $regex: search, $options: 'i' } }, { "Player.mobileNumber": { $regex: search, $options: 'i' } }, { "Player.email": { $regex: search, $options: 'i' } }, { teamName: { $regex: search, $options: 'i' } }, { "Comp.sports": { $regex: search, $options: 'i' } }, { followStatus: { $regex: search, $options: 'i' } }, { "Comp.venue": { $regex: search, $options: 'i' } }]
                    }
                }
                if (req.body.followStatus) {
                    query1.followStatus = req.body.followStatus
                }
                console.log("xxxxxxx", query1)
                var aggregate = followComp.competitionFollow.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    {
                        $unwind: "$Player"
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

                    {
                        $match: query1
                    }
                ])
                let option = {
                    limit: req.body.limit || 10,
                    page: req.body.page || 1
                }
                followComp.competitionFollow.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
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
                    }
                    else {
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    }
                })
            }
        })
}


const approveCompetition = (req, res) => {
    let flag = Validator(req.body, [], [], ["approvalId", "userId", "competitionId", "playerId", "followStatus"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else
        User.findOne({ _id: req.body.userId }, (err, result) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                let organizerName = result.firstName + " " + result.lastName
                Competition.competition.findOneAndUpdate({ "_id": req.body.competitionId, "playerFollowStatus.playerId": req.body.playerId }, { $set: { "playerFollowStatus.$.followStatus": req.body.followStatus } }, { new: true }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND, "data");
                    else {
                        followComp.competitionFollow.findOneAndUpdate({ _id: req.body.approvalId, competitionId: req.body.competitionId, playerId: req.body.playerId, followStatus: "PENDING" }, { $set: { followStatus: req.body.followStatus } }, { new: true }, (err2, success2) => {
                            if (err2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                            else if (!success2)
                                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND, "data2");
                            else {
                                Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success2);
                                User.findOne({ _id: req.body.playerId }, { "deviceToken": 1, email: 1, competitionNotify: 1, countryCode: 1, mobileNumber: 1 }, (err, success3) => {
                                    if (success3) {
                                        if ((success3.competitionNotify.mobile).indexOf("message") != -1)
                                            message.sendSMS("You are confirmed by the organizer " + organizerName, success3.countryCode, success3.mobileNumber, (error, result) => {
                                                if (err)
                                                    console.log("error in sending SMS")
                                                else if (result)
                                                    console.log("SMS sent successfully to the organizer!")
                                            })
                                        // console.log("&&&&&& anurag &&&&&&", success3)
                                        message.sendPushNotifications(success3.deviceToken, "You are confirmed by the organizer " + organizerName, (err, suc) => { })
                                        if ((success3.competitionNotify.email).indexOf("message") != -1)
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
        })
}



//-----------------Edit Team In Competition------------
const editTeamInCompetition = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.competitionId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Competition is required")
    else if (!req.query.teamId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.TEAM_IS_REQUIRED)
    else
        Competition.competition.findById({ _id: req.query.competitionId, organizer: req.query.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Competition not found");
            Team.findOne({ competitionId: req.query.competitionId, organizer: req.query.userId, _id: req.query.teamId }, (err, success1) => {
                if (err)
                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                else if (!success1)
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, "Team Not Found");
                else
                    message.uploadImg(req.body.image, (err, result) => {
                        console.log("err", err, "result", result);
                        if (err || !result.secure_url)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Image not uploaded successfully");
                        else
                            if (result.secure_url)
                                req.body.imageURL = result.secure_url;

                        Team.findOneAndUpdate({ competitionId: req.query.competitionId, organizer: req.query.userId, _id: req.query.teamId }, req.body, { new: true }, (err2, success2) => {
                            if (err2 || !success2)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err2);
                            else
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Team detail updated successfully", success2);
                        })
                    })
            })
        })
}

//---------Get List of Player of A team---------
const getListOfPlayerInTeam = (req, res) => {
    if (!req.body.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
    else if (!req.body.competitionId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "competititon is required")
    else {
        userServices.findUser({ _id: req.body.userId }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else {
                if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                    req.body.organizer = success.employeerId
                else
                    req.body.organizer = req.body.userId
                let query = {
                    organizer: ObjectId(req.body.organizer),
                    competitionId: ObjectId(req.body.competitionId),
                    "registration": true,
                }
                if (req.body.search) {
                    let search = new RegExp("^" + req.body.search)
                    query = {
                        organizer: ObjectId(req.body.organizer),
                        competitionId: ObjectId(req.body.competitionId),
                        "registration": true,
                        $or: [
                            { "Player.gender": { $regex: search, $options: 'i' } },
                            { status: { $regex: search, $options: 'i' } },
                            { "Player.firstName": { $regex: search, $options: 'i' } },
                            { "Player.lastName": { $regex: search, $options: 'i' } },
                            { "Player.dob": { $regex: search, $options: 'i' } },
                            { "Player.nationality": { $regex: search, $options: 'i' } },
                            { "Player.mobileNumber": { $regex: search, $options: 'i' } },
                            { "Player.email": { $regex: search, $options: 'i' } }]
                    }
                }
                console.log("query-->>", query)
                let option = {
                    limit: req.body.limit || 10,
                    page: req.body.page || 1,
                    sort: { createdAt: -1 },
                    allowDiskUse: true
                }
                var aggregate = followComp.competitionFollow.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                    { $unwind: "$Player" },
                    { $match: query },
                    { $sort: { createdAt: -1 } },
                    // {
                    //     $project: {

                    //         "Player.password": 0,
                    //         "Player.cardDetails": 0,
                    //         "Player.competitionNotify": 0,
                    //         "Player.membershipNotify": 0,
                    //         "Player.venueNotify": 0,
                    //         "Player.employeePermissionForCoordinator": 0,
                    //         "Player.employeePermissionForAdminstartor": 0,
                    //         "Player.autoRenewPlan": 0,

                    //     }
                    // },

                ])
                followComp.competitionFollow.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
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

//----------Edit Player in Competition-----------

const editPlayerInComp = (req, res) => {
    console.log(req.body)
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.playerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PLAYER_IS_REQUIRED)
    else if (!req.query._id)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Player id is required")
    else {
        followComp.competitionFollow.findOne({ playerId: req.query.playerId, organizer: req.query.userId, _id: req.query._id }, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
            else {
                Competition.competition.findOneAndUpdate({ _id: success.competitionId }, { $pull: { playerFollowStatus: { playerId: req.query.playerId } } }, { new: true }, (err, success1) => {
                    if (err || !success1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        if (success.teamId) {
                            Team.findOneAndUpdate({ _id: success.teamId }, { $pull: { playerId: req.query.playerId } }, { new: true }, (err, success2) => {
                                if (err)
                                    console.log(err)
                                else
                                    console.log("success")
                            })
                        }
                        Competition.competition.findOne({ _id: req.body.competitionId }, {}, (err, success) => {
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
                                                    message.uploadImg(req.body.playerDetail.image, (err, result) => {
                                                        if (result) {
                                                            console.log("image", result)
                                                            req.body.playerDetail.imageL = result.secure_url
                                                            User.findOneAndUpdate({ _id: req.query.playerId }, req.body.playerDetail, { new: true }, (err, success) => {
                                                                if (err)
                                                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                else if (!success)
                                                                    return Response.sendResponse(res, responseCode.NOT_MODIFIED, "Not updated successfully")
                                                                else {
                                                                    let set = {
                                                                        status: req.body.status,
                                                                        teamName: req.body.teamName,
                                                                        teamId: req.body.teamId,
                                                                        competitionId: req.body.competitionId,
                                                                        registration: true,
                                                                        followStatus: "APPROVED",
                                                                        playerId: req.query.playerId,
                                                                        organizer: req.query.userId

                                                                    }
                                                                    followComp.competitionFollow.findOneAndUpdate({ playerId: req.query.playerId, organizer: req.query.userId, _id: req.query._id }, set, { new: true }, (err, success) => {
                                                                        if (err)
                                                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                        else if (!success)
                                                                            return Response.sendResponse(res, responseCode.NOT_MODIFIED, "Not updated successfully")
                                                                        else {
                                                                            if (req.body.teamName) {
                                                                                let set = {
                                                                                    $addToSet: {
                                                                                        playerId: req.query.playerId
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
                                                                            let set = {
                                                                                $push: {
                                                                                    playerFollowStatus: {
                                                                                        playerId: (req.query.playerId).toString(),
                                                                                        followStatus: "APPROVED"
                                                                                    }
                                                                                }
                                                                            }
                                                                            Competition.competition.findOneAndUpdate({ _id: req.body.competitionId }, set, (err, success4) => {
                                                                                if (err || !success4)
                                                                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                                                                else
                                                                                    return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Player Detail updated successfully")
                                                                            })

                                                                        }

                                                                    })
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            return Response.sendResponse(res, responseCode.NOT_MODIFIED, "Error while uploading image ")
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
                })
            }
        })
    }
}
//----------------Delete Player in Competition-----------------
const deletePlayer = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.playerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PLAYER_IS_REQUIRED)
    else if (!req.query.competitionId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Competition Id is required")
    else {
        let query = {
            playerId: req.query.playerId,
            competitionId: req.query.competitionId,
            organizer: req.query.userId
        }
        followComp.competitionFollow.findOne(query, (err, success) => {
            if (err || !success)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.PLAYER_NOT_FOUND)
            else {
                console.log("success--->>>", success)
                Competition.competition.findOneAndUpdate({ _id: req.query.competitionId }, { $pull: { playerFollowStatus: { playerId: req.query.playerId } } }, { safe: true, new: true }, (err, success1) => {
                    if (err || !success1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else {
                        if (success.teamId) {
                            Team.findOneAndUpdate({ _id: success.teamId }, { $pull: { playerId: req.query.playerId } }, { new: true }, (err, success2) => {
                                if (err || !success2)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else {
                                    let query1 = {
                                        playerId: req.query.playerId,
                                        competitionId: req.query.competitionId,
                                        organizer: req.query.userId
                                    }
                                    followComp.competitionFollow.findOneAndRemove(query1, (err, success3) => {
                                        if (err || !success3)
                                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                        else
                                            return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Player deleted successfully")
                                    })
                                }
                            })
                        }
                        else {
                            let query1 = {
                                playerId: req.query.playerId,
                                competitionId: req.query.competitionId,
                                organizer: req.query.userId
                            }
                            followComp.competitionFollow.findOneAndRemove(query1, (err, success3) => {
                                if (err || !success3)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                else
                                    return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Player deleted successfully")
                            })
                        }
                    }
                })
            }
        })
    }
}


module.exports = {
    addNewCompetition,
    getACompetition,
    getAllCompetition,
    configureCompetition,
    addPrize,
    editPrize,
    getAPrize,
    getPrizeList,
    deletePrize,
    optionCompetition,
    addFile,
    getFileList,
    getAFile,
    editFile,
    deleteFile,
    competitionRegistration,
    configTeamFields,
    getTeamfields,
    configPlayerFields,
    getPlayerFields,
    createTeamInCompetition,
    filterCompetition,
    getPlayerList,
    approveCompetition,
    publishCompetition,
    unPublishCompetition,
    getRegistrationDetail,

    searchAndFilterPlayerList,

    getTeamInCompetition,
    deleteTeam,
    editTeamInCompetition,

    getListOfPlayerInTeam,
    editPlayerInComp,
    deletePlayer

}