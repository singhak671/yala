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
const Follow=require("../../models/compFollowOrgPlay");
const General=require("../../models/generalSchema.js")
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
//---------------------------Select competiton----------------------------------------------
const selectCompition=(req,res)=>{
    console.log("ghfghdhfh",req.query.userId)
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else{
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
            req.body.userId=success.employeerId
            else
            req.body.userId=req.query.userId
            let select={
                competitionName:1
           }
            teamServices.selectCompition({organizer:req.body.userId},select,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                else if(!success.length)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.COMPETITION_NOT_FOUND)
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_COMPETITION,success)
            })
        })
    }
}
//---------------------------------Select Venue---------------------------------------------
const selectVenue=(req,res)=>{
    if(!req.query.userId){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    }
    else{
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
            req.body.userId=success.employeerId
            else
            req.body.userId=req.query.userId
            let select={
                venue:1
           }
            teamServices.selectVenue({userId:req.body.userId},select,(err,success)=>{
                if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                else if(!success.length)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.VENUE_NOT_FOUND)
                else
                return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LIST_OF_VENUE,success)
            })
        })
    }
}

//-----------------------------------Create Team---------------------------------------------------
const createTeam=(req,res)=>{
    console.log("req.body--->>",req.body)
        subscriptionValidator(req.query,["Create Team"],(err,flag)=>{
        if(flag[0]!==200)
        return Response.sendResponse(res,flag[0],flag[1],flag[2]);
        else{
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
                      if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
                      req.body.organizer=success.employeerId
                      else
                      req.body.organizer=req.query.userId
                        let query={
                          organizer:req.body.organizer,
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
     })
}
//-----------------------------------------Get Detail of Team-----------------------------------------------------
const getDetailOfTeam=(req,res)=>{
    subscriptionValidator(req.query,["Create Team"],(err,flag)=>{
        if(flag[0]!==200)
        return Response.sendResponse(res,flag[0],flag[1],flag[2]);
        else{
            if(!req.query.userId)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
            else if(!req.query.teamId)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.TEAM_IS_REQUIRED)
            else{
                userServices.findUser({_id:req.query.userId},(err,success)=>{
                 if(err||!success)
                 return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                 else{
                    if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
                    req.body.organizer=success.employeerId
                    else
                    req.body.organizer=req.query.userId
                    let query={
                        _id:req.query.teamId,
                        organizer:req.body.organizer
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
                })
               
            }
        }
    })
    
}
//---------------Filter Team---------------------------------------
const filterTeam=(req,res)=>{
    subscriptionValidator(req.query,["Create Team"],(err,flag)=>{
        if(flag[0]!==200)
        return Response.sendResponse(res,flag[0],flag[1],flag[2]);
        else{
            if(!req.query.userId)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
            else{
                userServices.findUser({_id:req.query.userId},(err,success)=>{
                    if(err||!success)
                    return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                    else{
                        if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
                        req.body.organizer=success.employeerId
                        else
                        req.body.organizer=req.query.userId
                        let query={
                            organizer:ObjectId(req.body.organizer)
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
                  })
              
               }
        }
      }) 
    }

//------------------------Select Team---------------------------------------
const selectTeam=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(err||!success)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else{
                if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
                req.body.organizer=success.employeerId
                else
                req.body.organizer=req.query.userId
                let query={
                    organizer:req.body.organizer
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
        })
      
    }
}
const tryyyy=(req,res)=>{
    // teamServices.findTeam({_id:req.body.teamId},(err,success)=>{
    //     if(err||!success)
    //     return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
    //     else{
    //         console.log(new Date(req.body.dob))
    //         General.division.aggregate([ 
    //             {
    //                 $match:{
    //                    divisionName:success.division
    //                 }
    //             },
    //             { $project: { dateDifference: { $divide: [ { $subtract: [ "$date",new Date(req.body.dob) ] }, (60*60*24*1000*366) ] } ,gender:1,minAge:1,maxAge:1,divisionName:1}},
    //         ],(err,success)=>{
    //             console.log(success[0])
    //             if(err||!success)
    //             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
    //             else{
    //                 if(success[0].gender=="male"||success[0].gender=="female"||success[0].gender=="co-ed"){
    //                     if(req.body.gender!=success[0].gender&&success[0].gender!="co-ed")
    //                     return Response.sendResponse(res,responseCode.BAD_REQUEST,`"${success[0].gender}" are allowed only for division "${success[0].divisionName}" !`)
    //                   else{
    //                       console.log("yieepieee")
    //                       console.log("dsffj",parseInt(success[0].dateDifference))
    //                       if(success[0].dateDifference<success[0].minAge||success[0].dateDifference>success[0].maxAge)
    //                       return Response.sendResponse(res,responseCode.BAD_REQUEST,`"${parseInt(success[0].dateDifference)}" year age players are not allowed for  division "${success[0].divisionName}" !`)
    //                       else{
    //                           console.log("yippieee")
    //                       }
    //                   }
    //                 }
    //             }
    //         })
             
    //     }
    // })
}
//---------------------------Add player-----------------------------------------------
const addPlayer=(req,res)=>{
        console.log(req.body.playerDetail)
        subscriptionValidator(req.query,["player"],(err,flag)=>{
        if(flag[0]!==200)
        return Response.sendResponse(res,flag[0],flag[1],flag[2]);
        if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
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
                userServices.findUser({email:req.body.playerDetail.email},(err,success)=>{
                   if(err)
                   return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                   else if(success)
                   return Response.sendResponse(res,responseCode.ALREADY_EXIST,responseMsg.PLAYER_EXISTS)
                   else{
                    teamServices.findTeam({_id:req.body.teamId},(err,success)=>{
                        if(err||!success)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else{
                            console.log(new Date(req.body.playerDetail.dob))
                            General.division.aggregate([ 
                                {
                                    $match:{
                                       divisionName:success.division
                                    }
                                },
                                { $project: { dateDifference: { $divide: [ { $subtract: [ "$date",new Date(req.body.playerDetail.dob) ] }, (60*60*24*1000*366) ] } ,gender:1,minAge:1,maxAge:1,divisionName:1}},
                            ],(err,success)=>{
                                console.log(success[0])
                                if(err||!success)
                                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                else{
                                    if(success[0].gender=="male"||success[0].gender=="female"||success[0].gender=="co-ed"){
                                        if(req.body.playerDetail.gender!=success[0].gender&&success[0].gender!="co-ed")
                                        return Response.sendResponse(res,responseCode.BAD_REQUEST,`"${success[0].gender}" are allowed only for division "${success[0].divisionName}" !`)
                                      else{
                                          console.log("yieepieee")
                                          console.log("dsffj",parseInt(success[0].dateDifference))
                                          if(success[0].dateDifference<success[0].minAge||success[0].dateDifference>success[0].maxAge)
                                          return Response.sendResponse(res,responseCode.BAD_REQUEST,`"${parseInt(success[0].dateDifference)}" year age players are not allowed for  division "${success[0].divisionName}" !`)
                                          else{
                                              console.log("yippieee")
                                              const password=message.genratePassword();
                                              console.log("password-->>",password)
                                              req.body.password=password
                                              let salt = bcrypt.genSaltSync(10);
                                              req.body.playerDetail.password = bcrypt.hashSync(req.body.password, salt)
                                              userServices.addUser(req.body.playerDetail,(err,success)=>{
                                                  if(err)
                                                  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                                  else{
                                                      let set={
                                                          $push:{
                                                              playerFollowStatus:{
                                                              playerId:success._id,
                                                              status:"APPROVED"
                                                              }
                                                          }
                                                      }
                                                      teamServices.updateCompetition({_id:req.body.competitionId},set,{new:true},(err,success1)=>{
                                                          if(err || !success1)
                                                          return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                                          else{
                                                              let obj={
                                                                    organizer:req.body.organizer,
                                                                    competitionId:req.body.competitionId,
                                                                    registration:"TRUE",
                                                                    playerId:success._id,
                                                                    status:req.body.status,
                                                                    followStatus:"TRUE",
                                                                    teamId:req.body.teamId
                                                              }
                                                           teamServices.addCompetitonFollow(obj,(err,success2)=>{
                                                               if(err || !success2)
                                                               return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                                               else{
                                                                   let set={
                                                                       $push:{
                                                                           playerId:success._id
                                                                       }
                                                                   }
                                                                   teamServices.updateTeam({_id:req.body.teamId},set,{new:true},(err,success3)=>{
                                                                      if(err || !success3)
                                                                      return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                                                                      else{
                                                                          message.sendMail(success.email,"login Credentials","Your Login Creadentials are"+"<br/>UserId : "+req.body.playerDetail.email+"<br/>Password : "+ req.body.password,(err,result1)=>{
                                                                              if(err || !result1){
                                                                              return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.EMAIL_NOT_SEND,err);
                                                                              }
                                                                              else{
                                                                              return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.PLAYER_ADDED,success);
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
  }) 
}
//------------------get list of Player------------------------------------------------
const getListOfPlayer=(req,res)=>{
    if(!req.query.userId)
    return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ORGANIZER_IS_REQUIRED)
    else{
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(err || !success)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else{
                if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
                req.body.organizer=success.employeerId
                else
                req.body.organizer=req.query.userId 
                let query={
                    organizer:ObjectId(req.body.organizer),
                    registration:"TRUE"
                }
                if(req.body.teamName)
                query["Team.teamName"]=req.body.teamName
                if(req.body.status)
                query["status"]=req.body.status
                if(req.body.competitionName)
                query["Comp.competitionName"]=req.body.competitionName
                if(req.body.gender)
                query["Player.gender"]=req.body.gender
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
                var aggregate=Follow.competitionFollow.aggregate([ 
                    {
                        $lookup:{
                            from: "users",
                            localField: "playerId",
                            foreignField: "_id",
                            as: "Player"
                        }
                    },
                  {  
                      $lookup:{
                        from: "competitions",
                        localField: "competitionId",
                        foreignField: "_id",
                        as: "Comp"
                    }
                },
                {
                    $lookup:{
                        from: "createteamincompetitions",
                        localField: "teamId",
                        foreignField: "_id",
                        as: "Team"
                    }
                },
                {
                    $unwind:"$Comp"
                },
                {$unwind:"$Team"},
                {$unwind:"$Player"},
                { $match : query },
                {$sort:{createdAt:-1}}
                   ])
                   Follow.competitionFollow.aggregatePaginate(aggregate,option,(err,result, pages, total)=>{
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
        userServices.findUser({_id:req.query.userId},(err,success)=>{
            if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
            else{
                if(success.employeeRole=='COORDINATOR'||success.employeeRole=="ADMINSTRATOR")
                req.body.organizer=success.employeerId
                else
                req.body.organizer=req.query.userId 
                let  query={
                    organizer:ObjectId( req.body.organizer),
                    playerId:ObjectId(req.query.playerId)
                    }
                  Follow.competitionFollow.aggregate([ 
                        {
                            $lookup:{
                                from: "users",
                                localField: "playerId",
                                foreignField: "_id",
                                as: "Player"
                            }
                        },
                      {  
                          $lookup:{
                            from: "competitions",
                            localField: "competitionId",
                            foreignField: "_id",
                            as: "Comp"
                        }
                    },
                    {
                        $lookup:{
                            from: "createteamincompetitions",
                            localField: "teamId",
                            foreignField: "_id",
                            as: "Team"
                        }
                    },
                   
                    {
                        $unwind:"$Comp"
                    },
                    {$unwind:"$Team"},
                    {$unwind:"$Player"},
                   
                    { $match : query },
                       ]).exec((err,success)=>{
                        if(err)
                        return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                        else if(!success.length)
                        return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.PLAYER_NOT_FOUND)
                        else
                        return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.PLAYER_DETAIL,success)
                })
             }
        })
   
    }
}
module.exports={
    tryyyy,
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



















































