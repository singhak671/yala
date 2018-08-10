const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
const Team=require("../../models/team")
const followComp=require("../../models/compFollowOrgPlay.js");
const General=require("../../models/generalSchema.js");
const dataServices=require('../services/dataApis');

const addDivision=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["divisionName","minAge","maxAge","gender","date","sports"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.division.findOne({divisionName:req.body.divisionName,sports:req.body.sports,organizer:req.body.userId},(err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(success)
                return Response.sendResponse(res,responseCode.BAD_REQUEST,`A division with the name "${req.body.divisionName}" already exists !`);
            else{
                req.body.organizer=req.body.userId;
                General.division.create(req.body,(err1,success1)=>{
                    if (err1)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                    else if(!success1)
                            return Response.sendResponse(res,responseCode.BAD_REQUEST,`Cannot create a division!`);
                        else
                            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success1);
                })
            }
            
    })

}

const getDivision=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],[]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.division.find({organizer:req.body.userId,status:"ACTIVE"},null,{sort:{createdAt:-1}},(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(result==false)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,result);
    })
}

const getADivision=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["divisionId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.division.findOne({_id:req.body.divisionId,status:"ACTIVE"},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}
const editDivision=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["divisionId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.division.findOneAndUpdate({_id:req.body.divisionId,status:"ACTIVE"},req.body,{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}

const deleteDivision=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["divisionId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.division.findOneAndUpdate({_id:req.body.divisionId,status:"ACTIVE"},{$set:{status:"INACTIVE"}},{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}


//================================================ADD ,EDIT, DELETE Period =========================================//



const addPeriod=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["periodName"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.period.findOne({periodName:req.body.periodName,organizer:req.body.userId},(err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(success)
                return Response.sendResponse(res,responseCode.BAD_REQUEST,`A period with the name "${req.body.periodName}" already exists !`);
            else{
                req.body.organizer=req.body.userId;
                General.period.create(req.body,(err1,success1)=>{
                    if (err1)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                    else if(!success1)
                            return Response.sendResponse(res,responseCode.BAD_REQUEST,`Cannot create a period!`);
                        else
                            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success1);
                })
            }
            
    })

}

const getPeriod=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],[]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.period.find({organizer:req.body.userId},null,{sort:{createdAt:-1}},(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(result==false)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,result);
    })
}

const getAPeriod=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["periodId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.period.findOne({_id:req.body.periodId,status:"ACTIVE"},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}
const editPeriod=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["periodId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.period.findOneAndUpdate({_id:req.body.periodId,status:"ACTIVE"},req.body,{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}

const deletePeriod=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["periodId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.period.findOneAndUpdate({_id:req.body.periodId,status:"ACTIVE"},{$set:{status:"INACTIVE"}},{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}



//======================================SPORTS==========================================
//-------------------Add Sports--------------------------------------
const addSport=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["sportName","sportType"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.sport.findOne({sportName:req.body.sportName,organizer:req.body.userId},(err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(success)
                return Response.sendResponse(res,responseCode.BAD_REQUEST,`A sport with the name "${req.body.sportName}" already exists !`);
            else{
                req.body.organizer=req.body.userId;
                General.sport.create(req.body,(err1,success1)=>{
                    if (err1)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                    else if(!success1)
                            return Response.sendResponse(res,responseCode.BAD_REQUEST,`Cannot create a sport!`);
                        else
                            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success1);
                })
            }
            
    })

}
//-------------------Get list of Sports--------------------------------------

const getSport=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],[]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.sport.find({organizer:req.body.userId},null,{sort:{createdAt:-1}},(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(result==false)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,result);
    })
}
//-------------------Get detail of particular Sports--------------------------------------
const getASport=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["sportId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.sport.findOne({_id:req.body.sportId,status:"ACTIVE"},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}

//-------------------Edit A Sports--------------------------------------
const editSport=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["sportId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.sport.findOneAndUpdate({_id:req.body.sportId,status:"ACTIVE"},req.body,{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);        
    })
}

//-------------------Delete Sports--------------------------------------
const deleteSport=(req,res)=>{
    let flag=Validator(req.body,['userId'],[],["sportId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    General.sport.findOneAndUpdate({_id:req.body.sportId,status:"ACTIVE"},{$set:{status:"INACTIVE"}},{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
}

//===========================================Set SMTP username and Password ==================================

const addSMTPDetails=(req,res)=>{
    let flag=Validator(req.body,["userId"],[],["smtpUsername","smtpPassword"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    req.body.organizer=req.body.userId;
    General.mailMessage.findOneAndUpdate({organizer:req.body.userId},req.body,{new:true,upsert:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.SUCCESSFULLY_DONE,success)
        
    })
    
}

const getMailMessageDetails=(req,res)=>{
    let flag=Validator(req.body,["userId"],[],[]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    General.mailMessage.findOne({organizer:req.body.userId},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
            else
                return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.SUCCESSFULLY_DONE,success);
    })

}



module.exports={
    addDivision,
    getDivision,
    getADivision,
    editDivision,
    deleteDivision,

    addPeriod,
    getPeriod,
    getAPeriod,
    editPeriod,
    deletePeriod,

    addSport,
    getSport,
    getASport,
    editSport,
    deleteSport,



    addSMTPDetails,
    getMailMessageDetails
}