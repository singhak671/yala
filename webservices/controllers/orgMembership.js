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



//==================================================ADD MEMBERSHIP===========================================//
const addMembership=(req,res)=>{
    var s;
    let flag = Validator(req.body, [], [], ["organizerId","membershipName","clubName","clubId","status","allowPublicToFollow","imageURL"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
        
        subscriptionValidator(req.body, ["Membership"], (err, flag) => {
            if (flag[0] !== 200)
                return Response.sendResponse(res, flag[0], flag[1], flag[2]);
            else {
                
                Membership.membershipSchema.count({organizerId:req.body.organizerId},(error1,data)=>{
                    if(error1)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,error1);
                    else if(data){           
                
                Membership.membershipSchema.find({membershipName:req.body.membershipName},(err,success)=>{
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
                    else if (success.length)
                            return Response.sendResponse(res, responseCode.ALREADY_EXIST, "Membership name already exists.");
                        else{console.log("count for membership>>>",data)
                            User.findById(req.body.organizerId,(error,result)=>{
                                if(error || !result)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,error);
                                else if(result.subscription == "oneEvent" && data >= 1)
                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Only one membership is allowed for your plan");
                                    else{
                                        message.uploadImg(req.body.imageURL,(err1,success1)=>{
                                            if (err1 || success1.error)
                                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error in uploading the file",err1);
                                            else{
                                                if(success1.secure_url ||success1.public_id)
                                                    {  console.log("image all data>>>>>>",success1)
                                                        req.body.imagePublicId=success1.public_id;
                                                        req.body.imageURL=success1.secure_url;
                                                    }
                                                Membership.membershipSchema.create(req.body,(err2,success2)=>{
                                                    if (err2 || !success2)
                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err2);
                                                    else
                                                        return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Membership added successfully.");
                                                })                                
                                            }
                                        })
                                    }                       
                                })                                               
                            }            
                        }
                    )}})
                }
            }
        )
    }   
}

const getListOfMembership=(req,res)=>{
    let flag = Validator(req.query, [], [], ["organizerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
        console.log(req.body.limit)
        let options={
            page:req.body.page || 1,
            limit:req.body.limit ||4,
            sort: { createdAt: -1 }
        }
        let query={
            organizerId:req.query.organizerId
        };
        if(req.body.membershipStatus)
            query.status=req.body.membershipStatus;
        if(req.body.clubName)
            query.clubName=req.body.clubName;
        if (req.body.search) {
            query.$or = [
                { membershipName: { $regex: req.body.search, $options: 'i' } },
                { clubName: { $regex: req.body.search, $options: 'i' } },
                { status: { $regex: req.body.search, $options: 'i' } },
            ]}
            console.log("i am query to get list of membership >>>>>>>>",query)
        Membership.membershipSchema.paginate(query,options,(err,success)=>{   
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
            else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                else{
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE,success);                    
                }
        })
    }
}


const selectMembership=(req,res)=>{
    let flag = Validator(req.query, [], [], ["organizerId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
        Membership.membershipSchema.find({organizerId:req.query.organizerId},(err,success)=>{   
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
            else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);
                else{
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE,success);                    
                }
        })
    }
}

const editMembership=  (req,res)=>{
    let flag = Validator(req.body, [], [], ["organizerId","membershipId","membershipName","clubName","clubId","status","allowPublicToFollow","imageURL"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
        Membership.membershipSchema.findById(req.body.membershipId,async (err,success)=>{
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
                    Membership.membershipSchema.findByIdAndUpdate(req.body.membershipId,req.body,{new:true,safe:true},(err2,success2)=>{
                        if (err2 || !success2)
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_2err2OR, responseMsg.INTERNAL_SERVER_ERROR,err2);
                        else {
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Membership edited successfully",success2);
                        }
                        
                    })
                }
        })
    }
}

const deleteMembership=(req,res)=>{
    let flag = Validator(req.query, [], [], ["membershipId"]);
    if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    else{
        Membership.membershipSchema.findByIdAndRemove(req.query.membershipId,(err,success)=>{
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
            else if (!success)
                    return Response.sendResponse(res, responseCode.NOT_FOUND, "Memebership not found.");
                else{
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Membership deleted successfully.");                    
                }
        })

    }

}




module.exports = {
    addMembership,
    getListOfMembership,
    selectMembership,
    editMembership,
    deleteMembership
}