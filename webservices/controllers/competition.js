const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const  Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
const Team=require("../../models/team")
const followComp=require("../../models/compFollowOrgPlay.js");


const addNewCompetition=(req,res)=>{
    let flag =Validator(req.body,['userId'],[],[],["competition","player","hj"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else 
    User.findById(req.body.userId,(err2,success2)=>{
           // console.log(success2.subscription)
            if(success2.subscription=="oneEvent")
                Competition.competition.count({organizer:req.body.userId,competitionName:req.body.competitionDetails.competitionName},(err,success)=>{
                    console.log("count>>>>>>>>>>",success)
                    if (err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                    if(success>=1)
                    return  Response.sendResponse(res,responseCode.BAD_REQUEST,"Only one competition is allowed!");
            })
            else
                Competition.competition.findOne({organizer:req.body.userId,competitionName:req.body.competitionDetails.competitionName},(err,success)=>{
                if (err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                if(success)
                    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);
                req.body.competitionDetails.organizer=req.body.userId;
               // console.log(req.body);
                Competition.competition.create(req.body.competitionDetails,(err,success)=>{
                    if(err || !success)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR); 
                    User.findByIdAndUpdate(req.body.userId,{$push:{organizerCompetition:success._id}},{},(err,success1)=>{
                        if(err || !success1)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,"Unable to create competition _id into the User _id");
                        return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success);
                    })           
                });        
            });
        })
}

const getACompetition=(req,res)=>{
    let flag =Validator(req.body,['userId'],[],["competitionId"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    Competition.competition.findOne({organizer:req.body.userId,_id:req.body.competitionId},(err,success)=>{
        if (err)
         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        else{
                return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success);
            }     
    });
}
const getAllCompetition=(req,res)=>{
    let flag =Validator(req.body,['userId'],[])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
        User.findById(req.body.userId,(err,succ)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            if(!succ)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);

        
    Competition.competition.paginate({organizer:req.body.userId},{page:req.body.page,limit:req.body.limit},(err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)       
    });
})
}

const filterCompetition=(req,res)=>{
    let flag =Validator(req.body,['userId'],[],[])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);       
    else
    {   let obj={};
    if(req.body.filterFields){
        let array=["sports","division","period","status"];
        for (let key of array){
                for(let data in req.body.filterFields){
                    if(key==data && req.body.filterFields[data])
                    obj[key]=req.body.filterFields[key];
                }
        }}
        obj.organizer=req.body.userId;
        console.log(obj)
        let query={
            page:req.body.page || 1,
            limit:req.body.limit ||4,
            sort:{"createdAt":-1}
        }
        Competition.competition.paginate(obj,query,(err,result)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!result)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
        else
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,result);
        })   
    }
}


const configureCompetition=(req,res)=>{
    // console.lo
    let flag =Validator(req.body,[],[],["competitionId","competitionName","venue","division","period","sports","startDate","endDate","status","club","imageURL"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
     Competition.competition.findById(req.body.competitionId,(err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        message.uploadImg(req.body.imageURL,(err,success1)=>{
            if (err || !success1.secure_url)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            req.body.imageURL=success1.secure_url;           
             Competition.competition.findByIdAndUpdate({_id:req.body.competitionId},req.body,(err,success)=>{
                if (err || !success)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE);
             })
         })     
    })
}
const addPrize=(req,res)=>{
        let flag =Validator(req.body,["prizeDetails"],["name","value","description"],["competitionId"])
        if(flag)
            return Response.sendResponse(res,flag[0],flag[1]);
         Competition.competition.findById(req.body.competitionId,(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!result)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);

        for (let x of result.prize){
            if(x.name===req.body.prizeDetails.name)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);                             
        }
         Competition.competition.findByIdAndUpdate(req.body.competitionId,{$push : {prize :req.body.prizeDetails}},{new:true},(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
            if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
    
        return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success);
        });     
    });
}

const editPrize=(req,res)=>{
    //console.log(req.body.prizeDetails._id,req.body.competitionId)
   let flag =Validator(req.body,["prizeDetails"],["_id","name","value","description"],["competitionId"])
        if(flag)
            return Response.sendResponse(res,flag[0],flag[1]);
     Competition.competition.findOneAndUpdate({"_id":req.body.competitionId,"prize._id":req.body.prizeDetails._id},{$set : {"prize.$" :req.body.prizeDetails}},{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        for (let x of success.prize)
            if(x._id==req.body.prizeDetails._id)
                success=x;
    return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success);
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

const deletePrize=(req,res)=>{
    let flag =Validator(req.body,["prizeDetails"],["_id"],["competitionId"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
     Competition.competition.findOneAndUpdate({"_id":req.body.competitionId,"prize._id":req.body.prizeDetails._id },{ $pull: { prize : { _id : req.body.prizeDetails._id } } },{ safe: true,new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
         
        return Response.sendResponse(res,responseCode.RESOURCE_DELETED,"Successfully deleted",success);
    })

}

const optionCompetition=(req,res)=>{
    if(!req.body.competitionId)
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.REQUIRED_DATA);
     Competition.competition.findByIdAndUpdate(req.body.competitionId,req.body,(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!result)
             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Successfully deleted",result);
    })
}


const addFile=(req,res)=>{
    let flag =Validator(req.body,["fileDetails"],["fileName","file","name"],["competitionId"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
     Competition.competition.findById(req.body.competitionId,(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!result)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        for (let x of result.file){
            if(x.name===req.body.fileDetails.name)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,"Name already exists");                             
        }
        message.uploadImg(req.body.fileDetails.file,(err,success1)=>{
            if(success1.secure_url){
                console.log(success1);
                req.body.fileDetails.file=success1.secure_url;
                req.body.fileDetails.public_id= success1.public_id;                
                let data=req.body.fileDetails;
                if(req.body.fileDetails._id)
                delete data["_id"];         
                result.file.push(data);
                result.save((err,success)=>{
                    if(err||!success)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                    return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE);     
                 });
            }
            else
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,"File not uploaded successfully");
        });
    });
}

const editFile=(req,res)=>{
    //console.log(req.body.prizeDetails._id,req.body.competitionId)
    let flag =Validator(req.body,["fileDetails"],["_id","fileName","file","name"],["competitionId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
     Competition.competition.findOne({_id:req.body.competitionId,"file._id":req.body.fileDetails._id },{'file.$._id':1},(err,result)=>{
        console.log(result);
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!result)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        for (let x of result.file){
            if(x.fileName===req.body.fileDetails.fileName)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,"File already exists");                             
        }
        message.editUploadedFile(req.body.fileDetails.file,result.file[0].public_id,(err,success1)=>{
            if(success1.secure_url){
                req.body.fileDetails.file=success1.secure_url;
                req.body.fileDetails.public_id= success1.public_id;
                 Competition.competition.findOneAndUpdate({"_id":req.body.competitionId,"file._id":req.body.fileDetails._id},{$set : {"file.$" :req.body.fileDetails}},{new:true},(err,success)=>{
                    if(err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                    if(!success)
                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success.file);
                })
            }
            else
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,"File not uploaded successfully");
        });
    
    })
}




const deleteFile=(req,res)=>{
    //console.log(req.body.prizeDetails._id,req.body.competitionId)
    let flag =Validator(req.body,["fileDetails"],["_id"],["competitionId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
         Competition.competition.findOne({_id:req.body.competitionId,"file._id":req.body.fileDetails._id },{'file.$._id':1},(err,result)=>{
        console.log(result);
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!result)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);

        message.deleteUploadedFile(result.file[0].public_id,(err,success1)=>{
            if(success1.result){
                 Competition.competition.findOneAndUpdate({"_id":req.body.competitionId,"file._id":req.body.fileDetails._id },{ $pull: { file : { _id : req.body.fileDetails._id } } },{ safe: true,new:true},(err,success)=>{
                    if(err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                    if(!success)
                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
                return Response.sendResponse(res,responseCode.RESOURCE_DELETED,"Successfully deleted");
                })
            }
            else
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,"File not deleted successfully");
        });
    })
}


const competitionRegistration=(req,res)=>{
    let flag =Validator(req.body,[],[],["competitionId","userId","freeOrPaid","description","startDate","endDate"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    if(req.body.freeOrPaid=="paid"){
    let flag1 =Validator(req.body,[],[],["registrationFee","paymentInHandDetails"]);
    if(flag1)
        return Response.sendResponse(res,flag1[0],flag1[1]);}
    Competition.competition.findOne({_id:req.body.competitionId,registrationForm:false},(err,success2)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success2)
            return Response.sendResponse(res,responseCode.NOT_FOUND,"competitionId not found");
            else
                if(success2.organizer==req.body.userId){
                    req.body.organizer=req.body.userId;
                    Competition.competitionReg.findOneAndUpdate({competitionId:req.body.competitionId},req.body,{new:true,upsert:true},(err,result)=>{
                        if(err || !result)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                        else
                        Competition.competition.findOneAndUpdate({_id:req.body.competitionId},{$set:{registrationForm:true}},{new:true},(err,success3)=>{
                          if(success2)
                             return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfull",result);

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

else{
    return Response.sendResponse(res,responseCode.NOT_FOUND,"Competition doesn't belong to this organizer");
}
  })
}

const publishCompetition=(req,res)=>{
    let flag =Validator(req.body,[],[],["competitionId","userId",]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
        Competition.competition.findOneAndUpdate({_id:req.body.competitionId,organizer:req.body.userId},{$set:{published:true}},{new:true,select:{"published":1}},(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,"competitionId not found");
                else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
    })
}


const unPublishCompetition=(req,res)=>{
    let flag =Validator(req.body,[],[],["competitionId","userId",]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
        Competition.competition.findOneAndUpdate({_id:req.body.competitionId,organizer:req.body.userId},{$set:{published:false}},{new:true},(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,"competitionId not found");
                else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
    })
}

const getRegistrationDetail=(req,res)=>{
    let flag =Validator(req.body,[],[],["competitionId","userId",]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
        Competition.competitionReg.findOne({competitionId:req.body.competitionId,organizer:req.body.userId},(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,"competitionId not found");
                else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
        })
}


const configTeamFields=(req,res)=>{
    let flag =Validator(req.body,["teamFields"],["field","importance"],["competitionId","userId",]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    Competition.competition.findById(req.body.competitionId,(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,"competitionId not found");
        if(success.organizer==req.body.userId){            
            Competition.competitionReg.findOneAndUpdate({competitionId:req.body.competitionId,organizer:req.body.userId},{$set : {configTeamField :req.body.teamFields}},{new:true,upsert:true},(err,success)=>{
                if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                if(!success)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
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
    else{
        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
    }
})
}

const getTeamfields=(req,res)=>{
    let flag =Validator(req.body,[],[],["competitionId","userId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    Competition.competitionReg.findOne({competitionId:req.body.competitionId,organizer:req.body.userId},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success.configTeamField);
    })
}

const configPlayerFields=(req,res)=>{
    let flag =Validator(req.body,["playerFields"],["field","importance"],["competitionId","userId",]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    Competition.competition.findById(req.body.competitionId,(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,"competitionId not found");
        if(success.organizer==req.body.userId){            
            Competition.competitionReg.findOneAndUpdate({competitionId:req.body.competitionId,organizer:req.body.userId},{$set : {configPlayerField :req.body.playerFields}},{new:true,upsert:true},(err,success)=>{
                if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                if(!success)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success);
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
    else{
        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
    }
})
}

const getPlayerFields=(req,res)=>{
    let flag =Validator(req.body,[],[],["competitionId","userId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    Competition.competitionReg.findOne({competitionId:req.body.competitionId,organizer:req.body.userId},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success.configPlayerField);
    })
}

const createTeamInCompetition=(req,res)=>{
    let flag =Validator(req.body,[],[],["competitionId","organizer","teamName","venue","phone","email","category","status","image"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    Competition.competition.findById({_id:req.body.competitionId,organizer:req.body.organizer},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        Team.findOne({competitionId:req.body.competitionId,organizer:req.body.organizer,teamName:req.body.teamName},(err,success1)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
            else if(success1)
                return Response.sendResponse(res,responseCode.BAD_REQUEST,"Team name already exists");
            else
            message.uploadImg(req.body.image,(err,result)=>{
                console.log("err",err,"result",result);
                if(err || !result.secure_url)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,"Image not uploaded successfully");
                else
                if(result.secure_url)
                req.body.imageURL=result.secure_url;

                Team.create(req.body,(err2,success2)=>{
                    if(err2 || !success2)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
                    else 
                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success2);
                })
            })
        })        
    })
}

const getPlayerList=(req,res)=>{
    let flag =Validator(req.body,[],[],["userId","competitionId"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
        Competition.competition.findOne({_id:req.body.competitionId},{"sports":1,"venue":1, "competitionName":1, "_id":1},(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            else if(!success)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,"Competition not found !");
                else{let query={
                    page:req.body.page || 1,
                    limit : req.body.limit ||4};
                    followComp.competitionFollow.find({organizer:req.body.userId,competitionId:req.body.competitionId}).count({},(err,result)=>{
                       query.total=result;
                       console.log(query)                      
                        
                    });
                    followComp.competitionFollow.find({organizer:req.body.userId,competitionId:req.body.competitionId}).sort({"createdAt":-1}).populate({
                        path: 'playerId',                      
                       select:"firstName lastName countryCode mobileNumber email createdAt"})
                       .populate({
                        path: 'competitionId',                      
                       select:"competitionName venue sports"}).
                       skip((query.page-1)*query.limit).
                       limit(query.limit).
                       exec((err1,success1)=>{
                        if(err1)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                        else if(!success1)
                                return Response.sendResponse(res,responseCode.NOT_FOUND,"No players found!");
                             else
                                 return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success1,query);

                    })
                }

        })  
  
}

const approveCompetition=(req,res)=>{
    let flag =Validator(req.body,[],[],["approvalId","userId","competitionId","playerId","followStatus"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    else
    Competition.competition.findOneAndUpdate({"_id":req.body.competitionId,"playerFollowStatus.playerId":req.body.playerId},{$set : {"playerFollowStatus.$.followStatus":req.body.followStatus}},{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND,"data");
            else {
                followComp.competitionFollow.findOneAndUpdate({_id:req.body.approvalId,competitionId:req.body.competitionId,playerId:req.body.playerId,followStatus:"PENDING"},{$set:{followStatus:req.body.followStatus}},{new:true},(err2,success2)=>{
                    if(err2)
                         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err2);
                    else if(!success2)
                             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND,"data2");
                        else 
                            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success2);
                })
            }
    })
}

module.exports={
    addNewCompetition,
    getACompetition,
    getAllCompetition,
    configureCompetition,
    addPrize,
    editPrize,
    deletePrize,
    optionCompetition,
    addFile,
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
    getRegistrationDetail
}