const Response = require("../../global_functions/response_handler")
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const teamServices=require('../services/teamApis');
const message = require("../../global_functions/message");
const bcrypt=require('bcryptjs');
const Team=require("../../models/team")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Player=require("../../models/player")

//---------------------------Select competiton----------------------------------------------
const selectCompition=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else{
        let select={
            competitionName:1
       }
        teamServices.selectCompition({organizer:req.query.userId},select,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success.length)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.COMPETITION_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_COMPETITION,success)
        })
    }
}
//---------------------------------Select Venue---------------------------------------------
const selectVenue=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else{
        let select={
            venue:1
       }
        teamServices.selectVenue({userId:req.query.userId},select,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success.length)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.VENUE_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_VENUE,success)
        })
    }
}

//-----------------------------------Create Team---------------------------------------------------
const createTeam=(req,res)=>{
    console.log("req.body--->>",req.body)
  if(!req.query.userId){
      return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
  }
  else{
      req.body.organizer=req.query.userId
      userServices.findUser({ _id:req.query.userId},(err,success)=>{
          if(err)
          return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
          else if(!success)
          return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.ORGANIZER_NOT_FOUND)
          else{
              let query={
                organizer:req.query.userId,
                teamName:req.body.teamName
              }
             teamServices.findTeam(query,(err,success)=>{
                 if(err)
                 return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                 else if(success)
                 return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.TEAM_NAME_EXISTS)
                 else{
                    teamServices.addTeam(req.body,(err,success)=>{
                         if(err)
                         return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                         else 
                         return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.TEAM_ADDED,success)
                     })                        
                 }
             })
          }
      })
  }
}
//-----------------------------------------Get Detail of Team-----------------------------------------------------
const getDetailOfTeam=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.teamId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.TEAM_IS_REQUIRED)
    else{
        let query={
            _id:req.query.teamId,
            organizer:req.query.userId
        }
        teamServices.findTeam(query,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_TEAM_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.TEAM_DETAIL,success)
        })
    }
}
//---------------Filter Team---------------------------------------
const filterTeam=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        let query={
            organizer:ObjectId(req.query.userId)
          }
          if(req.body.status)
            query.status=req.body.status
          if(req.body.competitionName)
            query.competitionName=req.body.competitionName
          if(req.body.division)
            query.division={$in:req.body.division} 
          if(req.body.sports)
            query.sports={$in:req.body.sports}
          if(req.body.venue)
            query.venue=req.body.venue
          if(req.body.competitionStatus)
             query["Comp.status"]=req.body.competitionStatus
          if(req.body.period)
            query["Comp.period"]=req.body.period
          console.log("query-->>",query)
          let option={
              limit:req.body.limit||10,
              page:req.body.page||1
          }
          var aggregate=Team.aggregate([ 
            {  $lookup:{
                  from: "competitions",
                  localField: "competitionId",
                  foreignField: "_id",
                  as: "Comp"
              }
          },{
              $unwind:"$Comp"
          },
          { $match : query },
          {$sort:{createdAt:-1}}
             ])
          Team.aggregatePaginate(aggregate,option,(err,result, pages, total)=>{
            if(!err){
                const success={
                    "docs":result,
                    "total":total,
                    "limit":option.limit,
                    "page":option.page,
                    "pages":pages,
              }
              console.log(success)
               if(success.docs.length)
               return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.TEAM_DETAIL,success)
               else 
               return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_TEAM_FOUND)
            }            
            else{
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
             } 
          })
       }
    }


//------------------------Select Team------------------------
const selectTeam=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        let query={
            organizer:req.query.userId
        }
        let select={
             teamName:1
        }
        teamServices.selectTeam(query,select,(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NO_TEAM_FOUND,err)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.lIST_OF_TEAM,success)
        })
    }
}

//----------------------------------Add Player------------------------------------------
const addPlayer=(req,res)=>{
    req.body.organizer=req.query.userId
    console.log("req.body--->>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        userServices.findUser({_id:req.query.userId,role:"ORGANIZER"},(err,success)=>{
            if(err||!success)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else{
                const organizerName=success.firstName+" "+success.lastName
                let query={
                    email:req.body.email,
                    teamName:req.body.teamName,
                    competitionName:req.body.competitionName,
                    organizer:req.query.userId
                }
                let playDetail={
                    teamId:req.body.teamId,
                    competitionId:req.body.competitionId,
                     organizer:req.query.userId
                 }
                 console.log("playDetail-->>",playDetail)
                teamServices.findPlayer(query,(err,success)=>{
                    if(err)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                    else if(success)
                    return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.PLAYER_EXISTS)
                    else{
                        userServices.findUser({email:req.body.email,role:"PLAYER"},(err,success)=>{
                            if(err)
                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                            else if(success){
                                teamServices.addPlayer(req.body,(err,result)=>{
                                    if(err||!success)
                                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                    else{
                                        playDetail.playerId=result._id
                                        let set={
                                           $push:{playDetail:playDetail}
                                        }
                                      userServices.updateUser({email:req.body.email},set,{new:true},(err,success)=>{
                                        if(err||!success)
                                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                        else{
                                            message.sendMail(success.email,"Player Details","<br/>Your Team Details are"+"<br/>Team : "+result.teamName+"<br/>CompetitionName : "+result.competitionName+"<br/>OrganizerName : "+organizerName,(err,result1)=>{
                                                if(err || !result1){
                                                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.EMAIL_NOT_SEND);
                                                }
                                                else{
                                                console.log("success")
                                                }
                                            }) 
                                            return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.PLAYER_ADDED,result);
                                        }
                                      })
                                    }
                                })
                            }
                            else{
                                teamServices.addPlayer(req.body,(err,result)=>{
                                    if(err||!result)
                                    return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err);
                                    else{
                                        const password=message.genratePassword();
                                        console.log("password-->>",password)
                                        req.body.password=password
                                        let salt = bcrypt.genSaltSync(10);
                                        req.body.password = bcrypt.hashSync(req.body.password, salt)
                                        playDetail.playerId=result._id
                                        req.body.playDetail=playDetail
                                        console.log("hdhsfhsdh--->",req.body)
                                        userServices.addUser(req.body,(err,success)=>{
                                            if(err)
                                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                                            else if(!success)
                                            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.PLAN_IS_REQ)
                                            else{
                                              message.sendMail(success.email,"login Credentials","Your Login Creadentials are"+"<br/>UserId : "+req.body.email+"<br/>Password : "+password,(err,result1)=>{
                                                  if(err || !result1){
                                                  return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.EMAIL_NOT_SEND);
                                                  }
                                                  else{
                                                    message.sendSMS("Your verification code is " + otp,req.body.countryCode,req.body.mobileNumber, (error, sent) => {
                                                        if(!error)
                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
                                                        else
                                                        console.log("success")
                                                    })       
                                                 }
                                              })
                                              return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED,responseMsg.PLAYER_ADDED,result);
                                            }
                                        })
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
//--------------------------Get List of Player--------------------------------
const getListOfPlayer=(req,res)=>{
    console.log("req.body---->>",req.body)
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        let query={
            organizer:ObjectId(req.query.userId)
        }
        if(req.body.teamName)
        query.teamName=req.body.teamName
        if(req.body.status)
        query["status"]=req.body.status
        if(req.body.competitionName)
        query.competitionName=req.body.competitionName
        if(req.body.gender)
        query.gender=req.body.gender
        if(req.body.competitionStatus)
        query["Comp.status"]=req.body.competitionStatus
        if(req.body.division)
        query["Team.division"]={$in:req.body.division}
        console.log("query-->>",query)
        let option={
            limit:req.body.limit||10,
            page:req.body.page||1,
            sort:{createdAt:-1},
            allowDiskUse: true 
        }
        var aggregate=Player.aggregate([ 
          {  
              $lookup:{
                from: "competitions",
                localField: "competitionId",
                foreignField: "_id",
                as: "Comp"
            }
        },{
            $lookup:{
                from: "createteamincompetitions",
                localField: "teamId",
                foreignField: "_id",
                as: "Team"
            }
        },{
            $unwind:"$Comp"
        },
        {$unwind:"$Team"},
        { $match : query },
        {$sort:{createdAt:-1}}
           ])
        Player.aggregatePaginate(aggregate,option,(err,result, pages, total)=>{
          if(!err){
              const success={
                  "docs":result,
                  "total":total,
                  "limit":option.limit,
                  "page":option.page,
                  "pages":pages,
            }
            console.log(success)
             if(success.docs.length)
             return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_PLAYER,success)
             else 
             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.PLAYER_NOT_FOUND)
          }            
          else{
              return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
           } 
        })   
    }
}
//--------------------------Get Details of Player---------------------------
const getDetailOfPlayer=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else if(!req.query.playerId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PLAYER_IS_REQUIRED)
    else{
        teamServices.findPlayer({_id:req.query.playerId,organizer:req.query.userId},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.PLAYER_NOT_FOUND)
            else
            return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.PLAYER_DETAIL,success)
        })
    }
}
module.exports={
    selectCompition,
    selectVenue,
    createTeam,
    getDetailOfTeam,
    filterTeam,
    selectTeam,
    addPlayer,
    getListOfPlayer,
    getDetailOfPlayer
}



















































