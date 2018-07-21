const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user");
const  Competition=require("../../models/competition");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');


const addNewCompetition=(req,res)=>{
    let flag =Validator(req.body,['userId','competitionDetails'],["competitionName","venue","division","period","sports","club","allowPublicToFollow"])
	if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    Competition.competition.findOne({organizer:req.body.userId,competitionName:req.body.competitionDetails.competitionName},(err,success)=>{
        if (err)
         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(success)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);
        req.body.competitionDetails.organizer=req.body.userId;
        console.log(req.body);
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
}

const configureCompetition=(req,res)=>{
    // console.lo
    let flag =Validator(req.body,[],[],["competitionId","competitionName","venue","division","period","sports","startDate","endDate","status","club","imageURL"])
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
     Competition.competition.findById(req.body.competitionId,(err,success)=>{
        if (err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        message.uploadImg(req.body.imageURL,(err,success1)=>{
            if (err || !success1)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
            req.body.imageURL=success1;           
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
    let flag =Validator(req.body,[],[],["competitionId","userId","freeOrPaid","description","startDate","endDate","image"]);
    if(flag)
        return Response.sendResponse(res,flag[0],flag[1]);
    if(req.body.freeOrPaid=="paid"){
    let flag1 =Validator(req.body,[],[],["registrationFee","accountNumber","paymentInHandDetails"]);
    if(flag1)
        return Response.sendResponse(res,flag1[0],flag1[1]);}
    Competition.competition.findById(req.body.competitionId,(err,success2)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(!success2)
            return Response.sendResponse(res,responseCode.NOT_FOUND,"competitionId not found");
    if(success2.organizer==req.body.userId){
    Competition.competitionReg.findOne({competitionId:req.body.competitionId},(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(result)    
            message.uploadImg(req.body.image,(err,success)=>{
                if(success.secure_url)
                {
                    result.imageURL=success.secure_url;
                    result.organizer=req.body.userId;
                    result.save((err,result1)=>{
                        if(err)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                        if(!result1)
                            return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
                          return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfully updated",result1);
                     })                
                }
                else
                    return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to update registration",err);
            })
        else
        {
            message.uploadImg(req.body.image,(err,success)=>{
                if(success.secure_url)
                {
                    req.body.imageURL=success.secure_url;
                    Competition.competitionReg.create(req.body,(err1,success1)=>{
                        if(err1)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err1);
                        if(!success1)
                            return Response.sendResponse(res,responseCode.SOMETHING_WENT_WRONG,"Registration unsuccessfull");
                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Registration successfull",success1);
                    })
                }
                else
                    return Response.sendResponse(res,responseCode.BAD_REQUEST,"Unable to save registration",err); 
             })
        }
    })
}
else{
    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
}
  })
}

const configTeamField=(req,res)=>{
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

const getTeamfield=(req,res)=>{
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

module.exports={
    addNewCompetition,
    configureCompetition,
    addPrize,
    editPrize,
    deletePrize,
    optionCompetition,
    addFile,
    editFile,
    deleteFile,
    competitionRegistration,
    configTeamField,
    getTeamfield,
    configPlayerFields,
    getPlayerFields
}