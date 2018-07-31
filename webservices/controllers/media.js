const mediaServices=require('../services/mediaApis');
const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const media = require("../../global_functions/uploadMedia");
const userServices=require('../services/userApis');
const each = require('async-each-series');
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
        })
    }
}
//----------------------------Get List of Media-------------------------------------------
const getListOfMedia=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        let option={
            page:req.body.page||1,
            limit:req.body.limit||5,
            sort:{createdAt:-1}
        }
        mediaServices.getListOfMedia({organizer:req.query.userId},option,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.MEDIA_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_MEDIA,success)
        })
    }
}
//------------------------------------------Get Detail of Media-------------------------------------------
const getDetailofMedia=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.mediaId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.MEDIA_IS_REQUIERED)
    else{
        let query={
            _id:req.query.mediaId,
            organizer:req.query.userId
        }
        mediaServices.findMedia(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.MEDIA_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.DETAIL_MEDIA,success)
        })
    }
}
  module.exports={
      createAlbum,
      getListOfMedia,
      getDetailofMedia
  }