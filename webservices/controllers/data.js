const dataServices=require('../services/dataApis');
const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');
const config = require("../../config/config");
const jwt = require('jsonwebtoken');
const userServices=require('../services/userApis');
var waterfall = require('async-waterfall');
const media = require("../../global_functions/uploadMedia");

//--------------------------Add Club---------------------------------------------------------
const addClub=(req,res)=>{
    console.log("req.body------>>>>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.body)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PROVIDE_DATA)
    else{
           let query={
               _id:req.query.userId,
               role:"ORGANIZER"
           }
           userServices.findUser(query,(err,success)=>{
               if(err)
               return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
               else if(!success)
               return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
               else{
                   let query={
                       $and:[{email:req.body.email},{userId:req.query.userId}]
                   }
                   dataServices.findClub(query,(err,success)=>{
                       if(err)
                       return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                       else if(success)
                       return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.CLUB_EXISTS)
                       else{
                           req.body.userId=req.query.userId
                           if(req.body.image){
                            waterfall([(callback)=>{
                                media.uploadImg(req.body.image,(err,success)=>{
                                    if(err){
                                     return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR,err)
                                    } 
                                    else{
                                       console.log("image.url",success)
                                       callback(null,success)
                                    }  
                                   })
                               },(imageurl,callback)=>{
                                   req.body.image=imageurl;
                                   callback(null,req.body)
                               }
                            ],(err,result)=>{
                                console.log("resultttttt--->>",result)
                                dataServices.addClub(result,(err,success)=>{
                                    if(err)
                                    Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                    else 
                                    Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.CLUB_ADDED,success)
                            
                                })
                            }
                            )
                           }
                           else{
                             
                               dataServices.addClub(req.body,(err,success)=>{
                                if(err)
                                Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                else 
                                Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.CLUB_ADDED,success)
                               })
                           }
                       }
                   })
               }
           })
    }
}

//--------------------------Get Detail of Club-------------------------------------------------------
const getListOfClub=(req,res)=>{
    if(!req.query.userId){
        Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
   else{
       let query={
             userId:req.query.userId
       }
    //    let options = {
    //     page:req.body.page || 1,
    //     limit:req.body.limit || 4,
    //     sort:{ createdAt: -1 }
    //  }
       dataServices.getListOfClub(query,(err,success)=>{
           if(err)
           return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
           else if(!success)
           return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
           else return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.CLUB_LIST,success)
           
       })
   }
}
//-------------------------------Find Club------------------------------------------------------
  const findClub=(req,res)=>{
      if(!req.query.userId)
      return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
      else if(!req.query.clubId)
      return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.CLUB_IS_REQ)
      else{
          let query={
              userId:req.query.userId,
              _id:req.query.clubId
          }
          dataServices.findClub(query,(err,success)=>{
              if(err)
              return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
              else if(!success)
              return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
              else 
              return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.CLUB_DETAILS,success)
          })
      }
  }
//---------------------------Edit Club-------------------------------------------------------
const editClub=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.clubId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.CLUB_IS_REQ)
    else{
        let query={
            _id:req.query.clubId,
            orgId:req.query.userId
        }
        dataServices.findClub(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,reponseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,reponseMsg.CLUB_NOT_FOUND)
            else{
                if(req.body.image){
                    waterfall([(callback)=>{
                        media.uploadImg(req.body.image,(err,success)=>{
                            if(err){
                             return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                            } 
                            else{
                               console.log("image.url",success)
                               callback(null,success)
                            }  
                           })
                       },(imageurl,callback)=>{
                           req.body.image=imageurl;
                           callback(null,req.body)
                       }
                    ],(err,result)=>{
                        console.log("resultttttt--->>",result)
                        let query={
                            _id:req.query.clubId,
                            userId:req.query.userId
                        }
                          let options={
                              new:true
                          }
                        dataServices.editClub(query,result,options,(err,success)=>{
                            if(err)
                            Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                            else 
                            Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.CLUB_UPDATE,success)
                    
                        })
                    }
                  )
                }
                else{
                    let query={
                        _id:req.query.clubId,
                        userId:req.query.userId
                    }
                      let options={
                          new:true
                      }
                    dataServices.editClub(query,req.body,options,(err,success)=>{
                        if(err)
                        Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else if(!success)
                        return Response.sendResponse(res,responseCode.NOT_MODIFIED,responseMsg.NOT_MODIFIED)
                        else 
                        Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.CLUB_UPDATE,success)
                
                    })
                }
            }
        })
    }
}
//-----------------------Delete Club----------------------------------------------------------
const deleteClub=(req,res)=>{
    if(!req.query.userId)
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
     else if(!req.query.clubId)
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.CLUB_IS_REQ)
    else{
        let query={
            _id:req.query.clubId,
            userId:req.query.userId
        }

               dataServices.deleteClub(query,(err,success)=>{
                   if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                   else if(!success)
                   return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
                   else
                   return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.CLUB_DELETE)
               })
          
    }
}
//--------------------------Add Sponsers-------------------------------------------------------

const addSponsers=(req,res)=>{
    if(!req.body.orgId){
        Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.body.sponserName||!req.body.link||!req.body.descriptition)
       return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PROVIDE_DATA)
    else{
        query={
            _id:req.body.orgId
        }
       userServices.findUser(query,(err,success)=>{
           if(err){
               return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
           }
           else if(!success){
               return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
           }
           else{
               let query={
                   $and:[{orgId:req.body.orgId},{sponserName:req.body.sponserName}]
               }
               dataServices.findSponser(query,(err,success)=>{
                   if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                   else if(success)
                   return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.SPONSER_EXISTS)
                   else{
                    if(req.body.image){
                        waterfall([(callback)=>{
                            media.uploadImg(req.body.image,(err,success)=>{
                                if(err){
                                 return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                                } 
                                else{
                                   console.log("image.url",success)
                                   callback(null,success)
                                }  
                               })
                           },(imageurl,callback)=>{
                               req.body.image=imageurl;
                               callback(null,req.body)
                           }
                        ],(err,result)=>{
                            console.log("fgfgfgg--->>",result)
                            dataServices.addSponsers(result,(err,success)=>{
                                if(err)
                                Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                else 
                                Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SPONSERS_ADDED)
                        
                            })
                        }
                        )
                       }
                       else{
                        dataServices.addSponsers(req.body,(err,success)=>{
                            if(err)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                            else 
                            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SPONSERS_ADDED)
                        })
                          
                       }
                   }
               })
               
           }
       })
    }
}
//--------------Get List of Sponser-----------------------------

const getListOfSponser=(req,res)=>{
    console.log("req.body---->>",req.body)
    if(!req.body.orgId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else{
        let query={
            _id:req.body.orgId
        }
        userServices.findUser(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(re,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
            else{
                let query={
                    orgId:req.body.orgId
                }
                let options = {
                    page:req.body.page || 1,
                    limit:req.body.limit || 4,
                    sort:{ createdAt: -1 }
                }
                dataServices.getListOfSponser(query,options,(err,success)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                    else if(!success)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
                    else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_SPONSERS,success)
                })
            }
        })
    }
}

// ------------------------- Get Edit Sponsers------------------------------------------------

const getEditDetailOfSponser=(req,res)=>{
    if(!req.body.orgId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.body.sponserId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPONSER_IS_REQUIRED)
    else{
        let query={
            _id:req.body.sponserId,
            orgId:req.body.orgId
        }
       dataServices.findSponser(query,(err,success)=>{
           if(err)
           return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
           else if(!success)
           return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPONSER_NOT_FOUND)
           else
           return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.DETAIL_OF_SPONSER,success)
       })
    }
}
//------------------------Edit Sponsers----------------------------------

const editSponser=(req,res)=>{
    console.log("req.body---->>",req.body)
    if(!req.body.orgId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.body.sponserId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPONSER_IS_REQUIRED)
    else{
        let query={
            _id:req.body.sponserId,
            orgId:req.body.orgId
        }
        dataServices.findSponser(query,(err,success)=>{
            if(err)
            return  Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPONSER_NOT_FOUND)
            else if(req.body.image){
                    waterfall([(callback)=>{
                        media.uploadImg(req.body.image,(err,success)=>{
                            if(err){
                             return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                            } 
                            else{
                               console.log("image.url",success)
                               callback(null,success)
                            }  
                           })
                       },(imageurl,callback)=>{
                           req.body.image=imageurl;
                           callback(null,req.body)
                       }
                    ],(err,result)=>{
                        console.log("result--->>",result)

                        let options={
                            new:true
                        }
                        dataServices.editSponser(query,result,options,(err,success)=>{
                            if(err)
                            Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                            else 
                            Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.USER_UPDATE_SUCCESS,success)
                    
                        })
                    }
                    )
                  }
                  else{
                      let query={
                        _id:req.body.sponserId,
                        orgId:req.body.orgId
                      }
                      let options={
                          new:true
                      }
                      dataServices.editSponser(query,req.body,options,(err,success)=>{
                        if(err)
                        Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else if(!success)
                        Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPONSER_NOT_FOUND)
                        else 
                        Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.USER_UPDATE_SUCCESS,success)
                        
                    })
                  }
            
        })
    }
}
//------------------Delete Sponser---------------------------------
const deleteSponser=(req,res)=>{
    if(!req.body.orgId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.body.sponserId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPONSER_IS_REQUIRED)
    else{
        let query={
            _id:req.body.sponserId,
            orgId:req.body.orgId
        }

               dataServices.deleteSponser(query,(err,success)=>{
                   if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                   else if(!success)
                   return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPONSER_NOT_FOUND)
                   else
                   return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPONSER_DELETE)
               })
          
        }
    
}
//------------------------Search Sponser----------------------------------------
const searchSponser=(req,res)=>{
    let search=new RegExp("^"+req.body.search)
       let query={
           sponserName:search,
           orgId:req.body.orgId
       }
            var options={
                page:req.body.page||1,
                limit:req.body.limit||10,
                sort:{ createdAt: -1 }
            }
            dataServices.getListOfSponser(query,options,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                else if(!success.docs.length)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_SPONSERS,success)
            })
}

module.exports={
    addClub,
    getListOfClub,
    findClub,
    editClub,
    deleteClub,
    addSponsers,
    getListOfSponser,
    getEditDetailOfSponser,
    editSponser,
    deleteSponser,
    searchSponser
}











