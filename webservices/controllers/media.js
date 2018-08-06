const mediaServices=require('../services/mediaApis');
const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const media = require("../../global_functions/uploadMedia");
const userServices=require('../services/userApis');
const each = require('async-each-series');
//-------------------------Create Album Apis------------------------
const accessPlanMedia=(req,res)=>{
    subscriptionValidator(req.query,["media"],(err,flag)=>{
    if(flag[0]!==200)
    return Response.sendResponse(res,flag[0],flag[1],flag[2]);
    else if(!req.query.userId){
     return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_NOT_FOUND)
    }
    else{
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
            else{
                if(success.employeeRole=='COORDINATOR'){
                    console.log("dhfgfgjjhg")
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success.employeePermissionForCoordinator.media)
                } 
                else if(success.employeeRole=="ADMINSTRATOR"){
                    console.log("qqqqqqqq")
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success.employeePermissionForAdminstartor.media)
                }  
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,"ALL")
            }
        })
    }
  })
}
const createTry=(req,res)=>{
   console.log("req.body--->>",req.body)
   subscriptionValidator(req.query,["media"],(err,flag)=>{
    if(flag[0]!==200)
    return Response.sendResponse(res,flag[0],flag[1],flag[2]);
    else{
        accessPlan(req.query,["Create Album"],["media"],(err,flag)=>{
            if(flag[0]!==200){
            return Response.sendResponse(res,flag[0],flag[1],flag[2]);
            }
            else{
                console.log(flag[2])
           }
        })
      }
   })
}
//-------------------------Create Album Apis------------------------
const createAlbum=(req,res)=>{
    console.log("req.body--->>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        req.body.organizer=req.query.userId
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
            else{
                if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
                req.body.organizer=success.employeerId
                else
                req.body.organizer=req.query.userId
                console.log("fhfhhfhjg",req.body.organizer)
                if(req.body.image){
                    var imageArray = [], counter = 0;
                    each(req.body.image, (item, next) => {
                    counter++;
                    media.uploadMedia(item, (err, result) => {
                        imageArray[imageArray.length] = {public_id:result.public_id,url:result. secure_url}
                        if(err)
                            console.log("wronggggggg")
                        else if (req.body.image.length == counter) {
                             console.log("hhjjjjh",imageArray)
                             req.body.mediaUrls=imageArray
                             mediaServices.addMedia(req.body,(err,success)=>{
                              if(err)
                              return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                              else
                              return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.MEDIA_CREATED,success)
                           })
                        } else {
                            next();
                        }
                    })
                    }, (finalResult) => {
                    console.log(finalResult)
                  })
                }
                else{
                    mediaServices.addMedia(req.body,(err,success)=>{
                        if(err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else
                        return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.MEDIA_CREATED,success)
                     })
                }
              
            }
        })
    }
}
//----------------------------Get List of Media for organizer-------------------------------------------
const getListOfMedia=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        userServices.findUser({_id:req.query.userId},(err,successs)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!successs)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else{
                if(successs.employeeRole=='COORDINATOR'||successs.employeeRole=="ADMINSTRATOR")
                req.query.userId=successs.employeerId
                let option={
                    page:req.body.page||1,
                    limit:req.body.limit||5,
                    sort:{createdAt:-1},
                    populate:{path:"competitionId",model:Competition.competition,select:'imageURL'},
                    lean:true
                }
                mediaServices.getListOfMedia({organizer:req.query.userId},option,(err,success)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                    else if(!success.docs.length)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.MEDIA_NOT_FOUND)
                    else{
                        for(i=0;i<success.docs.length;i++){
                          // console.log(((success.docs[1].like).toString())+" "+((success.docs[i].like).toString()).indexOf(req.query.userId))
                           if(((success.docs[i].like).toString()).indexOf(successs._id)!=-1){
                               success.docs[i].likeStatus="True"
                           }
                           else{
                            success.docs[i].likeStatus="False"
                           }
                        }
                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_MEDIA,success)
                    }  
                })                     
            }
        })
        
    }
}
//------------------------------Get list of media for Player---------------------------------------------
const getListOfMediaPlayer=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PLAYER_IS_REQUIRED)
    else{
        let query={
            playerId:req.query.userId,
            "followStatus" : "TRUE"
        }
        let select={
            _id:0,
            competitionId:1,lean:true
       }
        teamServices.followStatus(query,select,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND,err)
            else{
                let query={
                    $and:success
                }
                console.log(query)
                let option={
                    page:req.body.page||1,
                    limit:req.body.limit||5,
                    sort:{createdAt:-1},
                    populate:{path:"competitionId",model:Competition.competition,select:'imageURL'},
                    lean:true
                } 
                mediaServices.getListOfMedia(query,option,(err,success)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                    else if(!success.docs.length)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.MEDIA_NOT_FOUND)
                    else{
                        for(i=0;i<success.docs.length;i++){
                          //console.log(((success.docs[1].like).toString())+" "+((success.docs[i].like).toString()).indexOf(req.query.userId))
                          console.log(((success.docs[i].like).toString()).indexOf(req.query.userId))
                           if(((success.docs[i].like).toString()).indexOf(req.query.userId)!=-1){
                               success.docs[i].likeStatus="True"
                           }
                           else{
                            success.docs[i].likeStatus="False"
                           }
                        }
                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_MEDIA,success)
                    }      
                })
            }
        }) 
    }
}
//------------------------------------------Get Detail of Media-------------------------------------------
const getDetailofMedia=(req,res)=>{
    console.log("ad",req.query)
     if(!req.query.mediaId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.MEDIA_IS_REQUIERED)
    else{
        let query={
            _id:req.query.mediaId
        }
        mediaServices.findMedia(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.MEDIA_NOT_FOUND)
            else{
                console.log("dsfnmdm",(success.like).toString().indexOf(req.query.userId))
                if((success.like).toString().indexOf(req.query.userId)!=-1)
                success.likeStatus="True"
                else
                success.likeStatus="False"
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.DETAIL_MEDIA,success)
            } 
        })
    }
}
//------------------------------Like Media---------------------------------------------
const likeMedia=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.mediaId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.MEDIA_IS_REQUIERED)
    else{
        mediaServices.findMedia({_id:req.query.mediaId},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.MEDIA_NOT_FOUND)
            else{
                let query={
                    "_id":success._id,
                    "like":req.query.userId
                }
                mediaServices.findMedia(query,(err,success1)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                    else if(success1){
                        console.log(success.like.length)
                        let set={
                            $pull:{like:req.query.userId},
                            noOfLike:success.like.length-1,
                        }
                        let option={
                            new:true
                        }
                     mediaServices.updateMedia({_id:req.query.mediaId},set,option,(err,success)=>{
                            if(err)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                            else 
                            return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.MEDIA_UNLIKE)
                     })
                    }
                    else{
                        let set={
                            $push:{like:req.query.userId},
                            noOfLike:success.like.length+1
                        }
                        let option={
                            new:true
                        }
                        mediaServices.updateMedia({_id:req.query.mediaId},set,option,(err,success)=>{
                            if(err)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                            else 
                            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.MEDIA_LIKE)
                        })
                    }
                })
            }
        })

    }
}

//------------------------------comment Media------------------------------
const commentMedia=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.mediaId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.MEDIA_IS_REQUIERED)
    else{
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(err || !success)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else {
                console.log("gdghghfghdghfhgh",success)
                mediaServices.findMedia({_id:req.query.mediaId},(err,success1)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                    else{
                        console.log("bfndnfndsn",success1.competitionId._id)
                       mediaServices.findCommentStatus({_id:success1.competitionId._id},(err,success2)=>{
                          if(err||!success2)
                          return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                          else {
                           
                              console.log(success2.allowComment)
                              if(success2.allowComment){
                                 
                                 if(success.image){
                                    let comment={
                                      commentId:req.query.userId,
                                      text:req.body.text,
                                      commentImage:success.image
                                    }
                                    let set={
                                      $push:{comments:comment},
                                      noOfComment:success1.noOfComment+1
                                   }
                                    let option={
                                        new:true
                                    }
                                    mediaServices.updateMedia({_id:req.query.mediaId},set,option,(err,success)=>{
                                      if(err)
                                      return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                      else 
                                      return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.COMMENT_ADDED,success)
                                    })
                                }
                                else{
                                  let comment={
                                      commentId:req.query.userId,
                                      text:req.body.text
                                    }
                                    let set={
                                       $push:{comments:comment},
                                       noOfComment:success1.noOfComment+1
                                    }
                                   let option={
                                       new:true
                                   }
                                   mediaServices.updateMedia({_id:req.query.mediaId},set,option,(err,success)=>{
                                     if(err)
                                     return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                     else 
                                     return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.COMMENT_ADDED,success)
                                   })
                                }
                             }
                             else{
                                 console.log("fjjfjefjk")
                                return Response.sendResponse(res,responseCode.FORBIDDEN,responseMsg.COMMENT_DISABLE)
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
const getCommnet=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.mediaId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.MEDIA_IS_REQUIERED)
    else{
        mediaServices.findMedia({_id:req.query.mediaId},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.COMMENT_LIST,success.comments)
        })
    }
}
  module.exports={
      accessPlanMedia,
      createTry,
      createAlbum,
      getListOfMedia,
      getDetailofMedia,
      likeMedia,
      getListOfMediaPlayer,
      commentMedia,
      getCommnet
  }
