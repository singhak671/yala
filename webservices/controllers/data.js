const dataServices=require('../services/dataApis');
const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const media = require("../../global_functions/uploadMedia");


//--------------------------Add Club---------------------------------------------------------
const addClub=(req,res)=>{
    console.log("req.body------>>>>",req.body)
    if(!req.query.userId)
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED);
    // else if(!req.body)
    // return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PROVIDE_DATA)
    else{
           let query={
               _id:req.query.userId,
               role:"ORGANIZER"
           }
           userServices.findUser(query,(err,success)=>{
               if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
               else if(!success)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND);
               else{
                   let query={
                       $and:[{clubName:req.body.clubName},{userId:req.query.userId}]
                   }
                   dataServices.findClub(query,(err,success)=>{
                       if(err)
                       return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                       else if(success)
                       return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.CLUB_EXISTS)
                       else{
                           req.body.userId=req.query.userId
                           if(req.body.image){
                                media.uploadImg(req.body.image,(err,success)=>{
                                    if(err){
                                     return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR,err)
                                    } 
                                    else{
                                       console.log("image.url---->>",success)
                                       req.body.image=success
                                       dataServices.addClub(req.body,(err,success)=>{
                                        if(err)
                                         Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                         else
                                         Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.CLUB_ADDED,success)
                                       })
                                     }  
                                   })
                            }
                           else{
                               req.body.image=req.body.imageURL
                               console.log("HDSFGJJFDG",req.body)
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
    console.log(req.body);
    if(!req.query.userId){
        Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
   else{
       let query={
             userId:req.query.userId
       }
       let options = {
        // page:req.body.page || 1,
        // limit:req.body.limit || 4,
         createdAt: -1 
     }
       dataServices.getListOfClub(query,options,(err,success)=>{
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
    console.log("req.body--->>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.clubId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.CLUB_IS_REQ)
    else{
        let query={
            _id:req.query.clubId,
            userId:req.query.userId
        }
        dataServices.findClub(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,reponseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
            else{
                if(req.body.image){
                        media.uploadImg(req.body.image,(err,success)=>{
                            if(err){
                             return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                            } 
                            else{
                               console.log("image.url",success)
                                req.body.image=success
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
                           })
                     }
                else{
                    req.body.image=req.body.imageURL
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
                   else{
                    let query={
                      "club.clubId":req.query.clubId,
                      userId:req.query.userId
                    }
                    dataServices.deleteVenue(query,(err,success)=>{
                        if(err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else
                        return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.CLUB_DELETE)
                    })
                 
                   }
                   
               })
          
    }
}
//
const searchClub=(req,res)=>{
    let search=new RegExp("^"+req.body.search)
       let query={
           clubName:search,
           userId:req.query.userId
       }
            var options={
                page:req.body.page||1,
                limit:req.body.limit||10,
                sort:{ createdAt: -1 }
            }
            dataServices.getListOfClub(query,options,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                else if(!success.docs.length)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_SPONSERS,success)
            })
}

//--------------------------Add Sponsers-------------------------------------------------------

const addSponsors=(req,res)=>{
    console.log("req.body--->>",req.body)
    if(!req.query.userId){
        Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.body.sponsorName||!req.body.link||!req.body.description)
       return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PROVIDE_DATA)
    else{
        query={
            _id:req.query.userId
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
                   $and:[{userId:req.query.userId},{sponsorName:req.body.sponsorName}]
               }
               dataServices.findSponser(query,(err,success)=>{
                   if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                   else if(success)
                   return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.SPONSER_EXISTS)
                   else{
                       req.body.userId=req.query.userId
                    if(req.body.image){
                    
                            media.uploadImg(req.body.image,(err,success)=>{
                                if(err){
                                 return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                                } 
                                else{
                                   console.log("image.url",success)
                                 req.body.image=success
                                 dataServices.addSponsers(req.body,(err,success)=>{
                                    if(err)
                                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                                    else 
                                    return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SPONSERS_ADDED,success)
                                })
                             }  
                           })
                           
                       }
                       else{
                        req.body.image=req.body.imageURL
                        console.log("HDSFGJJFDG",req.body)
                        dataServices.addSponsers(req.body,(err,success)=>{
                            if(err)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                            else 
                            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SPONSERS_ADDED,success)
                        })
                          
                       }
                   }
               })
               
           }
       })
    }
}
//--------------Get List of Sponser-----------------------------

const getListOfSponsor=(req,res)=>{
    console.log("req.body---->>",req.body)
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else{
        let query={
            _id:req.query.userId
        }
        userServices.findUser(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(re,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
            else{
                let query={
                    userId:req.query.userId
                }
                let options = {
                    page:req.body.page || 1,
                    limit:req.body.limit || 4,
                    sort:{ createdAt: -1 }
                }
                dataServices.getListOfSponser(query,options,(err,success)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                    else if(!success.docs.length)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPONSER_NOT_FOUND)
                    else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_SPONSERS,success)
                })
            }
        })
    }
}

// ------------------------- Get Edit Sponsers------------------------------------------------

const getEditDetailOfSponsor=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.sponsorId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPONSER_IS_REQUIRED)
    else{
        let query={
            _id:req.query.sponsorId,
            userId:req.query.userId
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

const editSponsor=(req,res)=>{
    console.log("req.body---->>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.sponsorId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPONSER_IS_REQUIRED)
    else{
        let query={
            _id:req.query.sponsorId,
            userId:req.query.userId
        }
        dataServices.findSponser(query,(err,success)=>{
            if(err)
            return  Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPONSER_NOT_FOUND)
            else if(req.body.image){
                        media.uploadImg(req.body.image,(err,success)=>{
                            if(err){
                             return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                            } 
                            else{
                               console.log("image.url",success)
                               req.body.image=success
                               let query={
                                _id:req.query.sponsorId,
                                userId:req.query.userId
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
                                Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPONSER_UPDATE,success)
                                
                            })
                         }  
                      })
                      
                  }
                  else{
                      req.body.image=req.body.imageURL
                      let query={
                        _id:req.query.sponsorId,
                        userId:req.query.userId
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
                        Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPONSER_UPDATE,success)
                        
                    })
                  }
            
        })
    }
}
//------------------Delete Sponser---------------------------------
const deleteSponsor=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.query.sponsorId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPONSER_IS_REQUIRED)
    else{
        let query={
            _id:req.query.sponsorId,
            userId:req.query.userId
        }

               dataServices.deleteSponser(query,(err,success)=>{
                   if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                   else if(!success)
                   return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPONSER_NOT_FOUND)
                   else
                   return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.SPONSER_DELETE)
               })
          
        }
    
}
//------------------------Search Sponser----------------------------------------
const searchSponsor=(req,res)=>{
    let search=new RegExp("^"+req.body.search)
       let query={
           sponserName:search,
           userId:req.query.userId
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
//---------------------------Select club-----------------------
const selectClub=(req,res)=>{
    if(!req.query.userId){
        return Reponse.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_NOT_FOUND)
    }
    else{
        let query={
            userId:req.query.userId
        }
        select={
            clubName:1,
            _id:0
        }
        dataServices.selectClub(query,select,(err,success)=>{
            if(err){
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            }
            else if(success==false)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
            else{
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.CLUB_LIST,success)
            }
        })
    }
}
//------------------------------Add Venue----------------------------------
const addVenue=(req,res)=>{
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
                       $and:[{venue:req.body.venue},{userId:req.query.userId}]
                   }
                   dataServices.findVenue(query,(err,success)=>{
                       if(err)
                       return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                       else if(success)
                       return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.VENUE_EXISTS)
                       else{
                           req.body.userId=req.query.userId
                               let query={
                                   clubName:req.body.club
                               }
                              dataServices.findClub(query,(err,success)=>{
                                  if(err)
                                  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                  if(!success)
                                  return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
                                  else
                                  req.body.club={
                                      clubName:success.clubName,
                                      clubId:success._id
                                  }
                                  dataServices.addVenue(req.body,(err,success)=>{
                                    if(err)
                                    Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                    else 
                                    Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.VENUE_ADDED,success)
                                   })
                              })
                              
                           }
                       
                   })
               }
           })
    }
}
//-------------------------------------get List of Venue--------------------------------------------
const getListOfVenue=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else{
            let query={
                _id:req.query.userId
            }
            userServices.findUser(query,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                else if(!success)
                return Response.sendResponse(re,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
                else{
                    let query={
                        userId:req.query.userId
                    }
                    let options = {
                        page:req.body.page || 1,
                        limit:req.body.limit || 4,
                        sort:{ createdAt: -1 }
                    }
                    dataServices.getListOfVenue(query,options,(err,success)=>{
                        if(err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else if(!success.docs.length)
                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.VENUE_NOT_FOUND)
                        else
                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_VENUE,success)
                    })
                }
            })
        }
    }
//------------------------------------------Get Detail of One Venue---------------------------------------------------------------------
const getEditDetailOfVenue=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.query.venueId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.VENUE_NOT_FOUND)
    else{
        let query={
            userId:req.query.userId,
            _id:req.query.venueId
        }
        dataServices.findVenue(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.VENUE_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.VENUE_DETAIL,success)
        })
    }
}
//-----------------------------------Edit Venue------------------------------------------------------------------
const editVenue=(req,res)=>{
    console.log("req.body--->>",req.body)
    console.log("req.query",req.query)
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.query.venueId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.VENUE_NOT_FOUND)
    else{
        let query={
            _id:req.query.venueId,
            userId:req.query.userId
        }
        dataServices.findVenue(query,(err,success)=>{
            if(err)
            return  Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.VENUE_NOT_FOUND)
            else{
                let query={
                    clubName:req.body.club
                }
               dataServices.findClub(query,(err,success)=>{
                   if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                   if(!success)
                   return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CLUB_NOT_FOUND)
                   else
                   req.body.club={
                       clubName:success.clubName,
                       clubId:success._id
                   }
                   let query={
                    _id:req.query.venueId,
                    userId:req.query.userId
                }
                   dataServices.updateVenue(query,req.body,{new:true},(err,success)=>{
                     if(err)
                     return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                     else 
                     return  Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.VENUE_UPDATE,success)
                    })
               })
           }         
     })
  }
}
//-----------------------------------------Delete Venue-----------------------------
const deleteVenue=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.query.venueId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.VENUE_NOT_FOUND)
    else{
        let query={
            _id:req.query.venueId,
            userId:req.query.userId
        }
        dataServices.deleteVenue(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.VENUE_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.VENUE_DELETE)
        })
    }
}
//-------------------------Search Venue-----------------------
const searchVenue=(req,res)=>{
    let search=new RegExp("^"+req.body.search)
       let query={
           venue:search,
           userId:req.query.userId
       }
            var options={
                page:req.body.page||1,
                limit:req.body.limit||10,
                sort:{ createdAt: -1 }
            }
            dataServices.getEditDetailOfVenue(query,options,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                else if(!success.docs.length)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_VENUE,success)
            })
}
//-----------------------------Add Refree-------------------------------------------------------
const addReferee=(req,res)=>{
    console.log("req.body----->>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
       let query={
           _id:req.query.userId
       }
       userServices.findUser(query,(err,success)=>{
           if(err)
           return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
           else if(!success)
           return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
           else{
              let query={
                  $and:[{userId:req.query.userId},{email:req.body.email}]  
              }
              dataServices.findRefree(query,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                else if(success)
                return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.REFREE_EXISTS)
                else{
                    if(req.body.image){
                            media.uploadImg(req.body.image,(err,success)=>{
                                if(err){
                                 return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR,err)
                                } 
                                else{
                                   console.log("image.url",success)
                                   req.body.image=success
                                   req.body.userId=req.query.userId;
                                   dataServices.addRefree(req.body,(err,success)=>{
                                       if(err)
                                       return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                                       else 
                                       Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.REFREE_ADDED,success)
                                   })
                                 }  
                               })
                     }
                     else{
                         req.body.userId=req.query.userId;
                         req.body.image=req.body.imageURL
                         console.log("HDSFGJJFDG",req.body)
                         dataServices.addRefree(req.body,(err,success)=>{
                             if(err)
                             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                             else 
                             Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.REFREE_ADDED,success)
                         })
                     }
                    
                 }
              })
           }
       })
    }
}
//--------------------------------------Get List of Referee------------------------------------------
const getListOfReferee=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        let query={
            _id:req.query.userId
        }
        userServices.findUser(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(re,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
            else{
                let query={
                    userId:req.query.userId
                }
                let options = {
                    page:req.body.page || 1,
                    limit:req.body.limit || 4,
                    sort:{ createdAt: -1 }
                }
                dataServices.getListOfRefree(query,options,(err,success)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                    else if(!success.docs.length)
                    return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.REFREE_NOT_FOUND)
                    else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.REFREE_LIST,success)
                })
            }
        })
    }
}
//-------------------------------------Get Detail of Referee-------------------------------------
const getEditDetailOfReferee=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else if(!req.query.refereeId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.REFREE_NOT_FOUND)
    else{
        let query={
            userId:req.query.userId,
            _id:req.query.refereeId
        }
        dataServices.findRefree(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.REFREE_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.REFREE_DETAIL,success)
        })
    }
}
//--------------------------------Edit Referee-----------------------------------------------------
const editReferee=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.refereeId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.REFREE_IS_REQUIRED)
    else{
        let query={
            userId:req.query.userId,
            _id:req.query.refereeId
        }
        dataServices.findRefree(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.REFREE_NOT_FOUND)
            else{
                if(req.body.image){
                        media.uploadImg(req.body.image,(err,success)=>{
                            if(err){
                             return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                            } 
                            else{
                               console.log("image.url",success)
                               req.body.image=success
                               let query={
                                userId:req.query.userId,
                                _id:req.query.refereeId
                              }
                              dataServices.updateRefree(query,req.body,{new:true},(err,success)=>{
                                if(err)
                                Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                else 
                                Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.REFREE_UPDATE,success)
                              })
                            }  
                           })
                  }
                  else{
                    req.body.image=req.body.imageURL
                      let query={
                        userId:req.query.userId,
                        _id:req.query.refereeId
                      }
                      dataServices.updateRefree(query,req.body,{new:true},(err,success)=>{
                        if(err)
                        Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else 
                        Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.REFREE_UPDATE,success)
                      })
                  }
            }
        })
    }
}
//-------------------------------Delete Referee------------------------------------
const deleteReferee=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.refereeId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.REFREE_IS_REQUIRED)
    else{
        let query={
            userId:req.query.userId,
            _id:req.query.refereeId
        }
        dataServices.deleteRefree(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else
            return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.REFREE_DELETE)
        })
    }
}
//-------------------------Search Referee-----------------------
const searchReferee=(req,res)=>{
    let search=new RegExp("^"+req.body.search)
       let query={
           name:search,
           userId:req.query.userId
       }
            var options={
                page:req.body.page||1,
                limit:req.body.limit||10,
                sort:{ createdAt: -1 }
            }
            dataServices.getListOfRefree(query,options,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                else if(!success.docs.length)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.REFREE_LIST,success)
            })
}

//-------------------Add Sports--------------------------------------
const addSport=(req,res)=>{
    console.log("req.body--->>>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        let query={
            $and:[{sportName:req.body.sponserName},{organizer:req.query.userId},{status:"ACTIVE"}]
        }
        dataServices.findSport(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(success)
            return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.SPORT_ALREADY_EXISTS)
            else{
                req.body.organizer=req.query.userId
                dataServices.addSport(req.body,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                else 
                return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SPORT_ADDED,success)
            })
         }   
      })
    }
}
//---------------------------Get list of Sport----------------------------
const getListOfSport=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        let query={
            organizer:req.query.organizer,
            status:"ACTIVE"
        }
        let option={
            limit:req.body.limit||5,
            page:req.body.page||1,
            sort:{createdAt:-1}
        }
        dataServices.getListOfSport(query,option,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success.docs.length)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPORT_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPORT_LIST,success)
        })
    }
}
//------------------------Get Detail of Sport----------------------------------
const findSport=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    if(!req.query.sportId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPORT_IS_REQUIRED)
    else{
        let query={
            _id:req.query.sportId,
            organizer:req.query.userId,
            status:"ACTIVE"
        }
       dataServices.findSport(query,(err,success)=>{
        if(err)
        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
        else if(!success)
        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.SPORT_NOT_FOUND)
        else
        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPORT_DETAIL,success)
       })
    }
}
//------------------------Edit sports------------------------------
const editSport=(req,res)=>{
    console.log("req.body--->>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    if(!req.query.sportId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPORT_IS_REQUIRED)
    else{
        let query={
            _id:req.query.sportId,
            organizer:req.query.userId,
            status:"ACTIVE"
        }
        dataServices.editSport(query,req.body,{new:true},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_MODIFIED,responseMsg.NOT_MODIFIED)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPORT_EDIT,suucess)
        })
    }
}
//--------------------Delete sports------------------------------
const deleteSport=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    if(!req.query.sportId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.SPORT_IS_REQUIRED)
    else{
        let query={
            _id:req.query.sportId,
            organizer:req.query.userId,
            status:"ACTIVE"
        }
        let set={
            status:"INACTIVE"
        }
        let option={
           new:true
        }
        dataServices.editSport(query,set,option,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPORT_DELETE)
        })
    }
}
//------------------------Search Sport----------------------------------------
const searchSport=(req,res)=>{
    let search=new RegExp("^"+req.body.search)
       let query={
           sportName:search,
           organizer:req.query.userId
       }
            var options={
                page:req.body.page||1,
                limit:req.body.limit||10,
                sort:{ createdAt: -1 }
            }
            dataServices.getListOfSport(query,options,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
                else if(!success.docs.length)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPORT_LIST,success)
            })
}
//----------------------------Select sport--------------------------------
const selectSport=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        dataServices.selectSport({organizer:req.query.userId,status:"ACTIVE"},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_DATA_FOUND);
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SPORT_LIST,success)
        })
    }
}
module.exports={
    
    addClub,
    getListOfClub,
    findClub,
    editClub,
    deleteClub,
    searchClub,
    addSponsors,
    getListOfSponsor,
    getEditDetailOfSponsor,
    editSponsor,
    deleteSponsor,
    searchSponsor,
    selectClub,
    addVenue,
    getListOfVenue,
    getEditDetailOfVenue,
    editVenue,
    deleteVenue,
    searchVenue,
    addReferee,
    getListOfReferee,
    getEditDetailOfReferee,
    editReferee,
    deleteReferee,
    searchReferee,
    addSport,
    getListOfSport,
    findSport,
    editSport,
    deleteSport,
    searchSport,
    searchSport,
    selectSport
}










